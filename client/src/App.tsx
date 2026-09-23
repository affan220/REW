import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Home from "./pages/Home";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["Capabilities", "#capabilities"], ["Our work", "#work"], ["About", "#about"], ["Contact", "#contact"]];
  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#18252c]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#18252c]/95 text-white backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between">
          <a href="#top" className="group flex items-center gap-3" aria-label="Reshma Engineering Works home">
            <span className="grid h-12 w-14 place-items-center overflow-hidden rounded-sm bg-white p-1 shadow-lg shadow-black/20 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"><img src="/REWlogo.jpeg" alt="Reshma Engineering Works logo" className="h-full w-full object-contain" /></span>
            <span className="leading-tight"><span className="block font-display text-[15px] font-black italic tracking-[0.2em]">RESHMA</span><span className="block text-[10px] uppercase tracking-[0.28em] text-white/55">ENG WORKS</span></span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map(([label, href]) => <a key={href} href={href} className="text-[13px] font-medium text-white/65 transition-colors hover:text-white">{label}</a>)}
            <a href="#quote" className="inline-flex items-center gap-2 rounded-sm bg-[#d96e3a] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#18252c] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]">Request a quote <ArrowUpRight size={15} /></a>
          </nav>
          <button className="grid h-10 w-10 place-items-center md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 bg-[#18252c] px-6 py-5 md:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-white/10 py-3 text-sm text-white/75">{label}</a>)}<a href="#quote" onClick={() => setMenuOpen(false)} className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#d96e3a] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#18252c]">Request a quote <ArrowUpRight size={15} /></a></nav>}
      </header>
      <Home />
      <a href="#quote" className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-center gap-2 rounded-sm bg-[#d96e3a] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#18252c] shadow-2xl shadow-[#18252c]/20 md:hidden">Start your enquiry <ArrowUpRight size={16} /></a>
    </div>
  );
}

export { };
