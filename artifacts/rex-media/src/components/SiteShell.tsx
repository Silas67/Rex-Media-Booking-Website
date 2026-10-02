import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { venueConfig } from '@/lib/config';
import { setupMessage, supabaseConfigured } from '@/lib/supabase';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const nav = [['Screens', '/#screens'], ['How it works', '/#how'], ['About', '/about']];
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[hsl(220_19%_8%/.92)] backdrop-blur-xl">
    <div className="wrap flex h-[72px] items-center justify-between">
      <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo">
        <span className="grid h-9 w-9 place-items-center rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-display text-xl font-bold">R</span>
        <span className="font-display text-[16px] font-bold tracking-[.15em]">REX<span className="ml-1 text-[hsl(var(--primary))]">MEDIA</span></span>
      </Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
        {nav.map(([label, href]) => <Link key={label} href={href} className={`text-[12px] font-semibold tracking-wide transition-colors hover:text-[hsl(var(--primary))] ${location === href ? 'text-[hsl(var(--primary))]' : 'text-white/65'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
      </nav>
      <div className="hidden items-center gap-6 md:flex">
        <Link href="/admin" className="text-[11px] font-mono uppercase tracking-widest text-white/45 hover:text-white" data-testid="link-admin">Admin</Link>
        <Link href="/book" className="button-pop inline-flex items-center gap-2 rounded-sm bg-[hsl(var(--primary))] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.11em] text-[hsl(var(--primary-foreground))]" data-testid="link-book-header">Book a screen <ArrowUpRight size={14} /></Link>
      </div>
      <button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center border border-white/15 text-white md:hidden" data-testid="button-mobile-menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open && <div className="border-t border-white/10 px-5 py-5 md:hidden">
      <nav className="wrap flex flex-col gap-5">
        {nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="text-sm text-white/75" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
        <Link href="/book" onClick={() => setOpen(false)} className="text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-mobile-book">Book a screen</Link>
      </nav>
    </div>}
  </header>;
}

export function SetupNotice() {
  if (supabaseConfigured) return null;
  return <div role="status" className="border-b border-[hsl(var(--accent)/.3)] bg-[hsl(var(--accent)/.08)] px-4 py-3 text-center text-xs leading-relaxed text-[hsl(var(--accent))]" data-testid="status-supabase-setup">{setupMessage}</div>;
}

export function SiteFooter() {
  return <footer className="border-t border-white/10 py-10">
    <div className="wrap flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
      <div><div className="font-display text-sm font-bold tracking-[.15em]">REX <span className="text-[hsl(var(--primary))]">MEDIA</span></div><p className="mt-2 max-w-sm text-xs leading-5 text-white/45">On-premise screen advertising for brands looking to be part of the night.</p></div>
      <div className="text-xs leading-6 text-white/45"><p>{venueConfig.venueName} · {venueConfig.location}</p><p>{venueConfig.contactEmail} · {venueConfig.contactPhone}</p></div>
      <Link href="/about" className="text-xs font-semibold text-white/65 hover:text-[hsl(var(--primary))]" data-testid="link-footer-about">Service & contact <ArrowUpRight className="ml-1 inline" size={13} /></Link>
    </div>
    <div className="wrap mt-8 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-widest text-white/30">© {new Date().getFullYear()} Rex Media · Venue details are being confirmed</div>
  </footer>;
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="page-noise min-h-[100dvh]"><SetupNotice /><SiteHeader />{children}<SiteFooter /></div>;
}