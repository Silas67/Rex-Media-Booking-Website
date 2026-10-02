import { ArrowUpRight, Clock3, Mail, MapPin, Phone, Radio } from 'lucide-react';
import { Link } from 'wouter';
import { PageFrame } from '@/components/SiteShell';
import { venueConfig } from '@/lib/config';

const whatsappDigits = venueConfig.whatsappNumber.replace(/\D/g, '');
const socialLinks = Object.entries(venueConfig.socialLinks).filter(([, url]) => url.trim());

export default function About() {
  return <PageFrame>
    <main className="wrap min-h-[65vh] py-16 sm:py-24">
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">ABOUT REX MEDIA / 01</p>
      <div className="mt-6 grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <div><h1 className="font-display max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.065em] sm:text-7xl">Advertising<br />inside the<br /><span className="text-[hsl(var(--primary))]">experience.</span></h1><p className="mt-8 max-w-xl text-base leading-8 text-white/60">Rex Media connects brands with guests through digital screen placements inside a nightlife and resort venue. Our inventory is designed around the places people gather, dance and unwind.</p><p className="mt-4 max-w-xl text-sm leading-7 text-white/45">Each screen runs for nine hours per day, with 100 plays daily and a 15-second ad duration. Venue-specific details are being confirmed and will be updated here before launch.</p><Link href="/book" className="mt-8 inline-flex items-center gap-3 bg-[hsl(var(--primary))] px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-black" data-testid="link-about-book">Explore placements <ArrowUpRight size={15} /></Link></div>
        <aside className="self-start border border-white/10 bg-white/[.025] p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5"><span className="grid h-11 w-11 place-items-center border border-[hsl(var(--primary)/.35)] text-[hsl(var(--primary))]"><Radio size={19} /></span><div><h2 className="font-display text-xl font-semibold">Venue & contact</h2><p className="mt-1 text-xs text-white/40">Editable details awaiting confirmation</p></div></div>
          <div className="space-y-6 pt-6">
            {[
              { Icon: MapPin, label: 'Venue / address', value: `${venueConfig.venueName}\n${venueConfig.location}` },
              { Icon: Mail, label: 'Email', value: venueConfig.contactEmail },
              { Icon: Phone, label: 'Phone', value: venueConfig.contactPhone },
              { Icon: Clock3, label: 'Screen runtime', value: '9 hours daily · 100 plays · 15 seconds' },
            ].map(({ Icon, label, value }) => <div key={label} className="flex gap-4"><Icon size={16} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" /><div><p className="font-mono text-[9px] uppercase tracking-[.17em] text-white/40">{label}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/75">{value}</p></div></div>)}
          </div>
          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="font-mono text-[9px] uppercase tracking-[.17em] text-white/40">Connect with Rex Media</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {whatsappDigits.length >= 10 && <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-xs hover:border-[hsl(var(--primary))]" data-testid="link-whatsapp-contact"><Phone size={13} /> WhatsApp</a>}
              {socialLinks.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-xs hover:border-[hsl(var(--primary))]" data-testid={`link-social-${label.toLowerCase()}`}>{label} <ArrowUpRight size={12} /></a>)}
              {!whatsappDigits && !socialLinks.length && <span className="text-xs text-white/40">WhatsApp and social links will be added when the business details are confirmed.</span>}
            </div>
          </div>
          <div className="mt-7 border-t border-white/10 pt-5 text-xs leading-5 text-white/42">No bank details are displayed here. Verified transfer instructions will be provided after a booking is submitted.</div>
        </aside>
      </div>
    </main>
  </PageFrame>;
}