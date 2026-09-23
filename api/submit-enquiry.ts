const SUPABASE_URL = process.env.SUPABASE_URL || "https://jgyapkhqipqulzrtzaxy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_VrujpGnm9s_of9lQUNiX8w_VRgfYeY6";
const CONTACT_EMAIL = process.env.NOTIFY_EMAIL || "ansarimannan918@gmail.com";
const CONTACT_WHATSAPP = process.env.NOTIFY_WHATSAPP || "+919702409095";

function supabaseHeaders(extra: Record<string, string> = {}) {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...extra };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = req.body || {};
    const enquiryNumber = `REW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const enquiryPayload = {
      enquiry_number: enquiryNumber,
      customer_name: body.customer_name,
      company: body.company || null,
      phone: body.phone,
      email: body.email,
      requirement: body.message,
      service: body.service,
      material: body.material || null,
      quantity: body.quantity || null,
      delivery_date: body.delivery_date || null,
      message: body.message,
      preferred_contact: "phone",
      consent: body.consent === true,
    };
    const insert = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method: "POST",
      headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify(enquiryPayload),
    });
    if (!insert.ok) throw new Error(`Supabase enquiry failed: ${await insert.text()}`);
    const [row] = await insert.json();

    if (body.attachment_base64 && body.attachment_name) {
      const safeName = `${row.id}/${String(body.attachment_name).replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const binary = Buffer.from(String(body.attachment_base64).replace(/^data:[^;]+;base64,/, ""), "base64");
      const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/rew-private-attachments/${safeName}`, {
        method: "POST",
        headers: supabaseHeaders({ "Content-Type": body.attachment_type || "application/octet-stream" }),
        body: binary,
      });
      if (upload.ok) {
        await fetch(`${SUPABASE_URL}/rest/v1/attachments`, {
          method: "POST",
          headers: supabaseHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ enquiry_id: row.id, original_name: body.attachment_name, stored_name: safeName, file_type: body.attachment_type || "application/octet-stream", file_size: body.attachment_size || binary.length, storage_path: safeName }),
        });
      }
    }

    const subject = `New REW enquiry ${enquiryNumber} — ${body.customer_name}`;
    const message = `New requirement received\n\nReference: ${enquiryNumber}\nName: ${body.customer_name}\nCompany: ${body.company || "—"}\nPhone: ${body.phone}\nEmail: ${body.email}\nService: ${body.service}\nQuantity: ${body.quantity || "—"}\nRequired by: ${body.delivery_date || "—"}\n\nRequirement:\n${body.message}`;
    const notifications: Promise<unknown>[] = [];
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      notifications.push(fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [CONTACT_EMAIL], subject, text: message, reply_to: body.email }) }));
    }
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const params = new URLSearchParams({ From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, To: `whatsapp:${CONTACT_WHATSAPP}`, Body: message });
      notifications.push(fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params }));
    }
    await Promise.allSettled(notifications);
    return res.status(201).json({ enquiry_number: enquiryNumber, notification_channels: { email: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL), whatsapp: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to submit enquiry" });
  }
}
