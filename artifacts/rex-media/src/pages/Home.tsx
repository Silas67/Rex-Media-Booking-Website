import { ArrowDown, ArrowRight, ArrowUpRight, Check, Radio, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { PageFrame } from '@/components/SiteShell';
import { formatNaira, screenCatalog } from '@/lib/config';
import liveBandImage from '@assets/generated_images/rex-live-band.jpg';
import djSectionImage from '@assets/generated_images/rex-dj-section.jpg';
import loungeOneImage from '@assets/generated_images/rex-lounge-one.jpg';
import loungeTwoImage from '@assets/generated_images/rex-lounge-two.jpg';

const scenes = [
  { n: '01', title: 'Live Band LED', copy: 'Own the room when the band takes the stage.', key: 'live-band-led', tag: 'STAGE / HIGH ENERGY', image: liveBandImage },
  { n: '02', title: 'DJ Section LED', copy: 'Meet a crowd already tuned into the night.', key: 'dj-section-led', tag: 'DJ FLOOR / PEAK HOURS', image: djSectionImage },
  { n: '03', title: 'Lounge LED 01', copy: 'A considered placement in the lounge.', key: 'lounge-led-1', tag: 'LOUNGE / SOCIAL', image: loungeOneImage },
  { n: '04', title: 'Lounge LED 02', copy: 'A second lounge position for added presence.', key: 'lounge-led-2', tag: 'LOUNGE / SOCIAL', image: loungeTwoImage },
];

export default function Home() {
  return <PageFrame>
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_46%,rgba(194,219,57,.10),transparent_34%),radial-gradient(ellipse_at_14%_70%,rgba(231,125,68,.08),transparent_30%)]" />
        <div className="wrap relative grid min-h-[610px] items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
          <div className="rise-in">
            <p className="mb-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.22em] text-[hsl(var(--primary))]"><span className="h-px w-9 bg-[hsl(var(--primary))]" /> REX MEDIA · IN-VENUE ADVERTISING</p>
            <h1 className="font-display max-w-[690px] text-[clamp(3.4rem,8vw,7.2rem)] font-semibold leading-[.88] tracking-[-.075em]">Be seen<br />where the<br /><span className="text-[hsl(var(--primary))]">night lives.</span></h1>
            <p className="mt-8 max-w-[440px] text-[15px] leading-7 text-white/58">Put your brand on the screens inside a nightlife and resort venue. Four placements. One clear booking flow.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/book" className="button-pop inline-flex items-center gap-3 bg-[hsl(var(--primary))] px-6 py-4 text-[11px] font-extrabold uppercase tracking-[.13em] text-[hsl(var(--primary-foreground))]" data-testid="link-hero-book">Choose your placement <ArrowRight size={15} /></Link>
              <a href="#screens" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-white/60 hover:text-white" data-testid="link-explore-screens">Explore screens <ArrowDown size={13} /></a>
            </div>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-white/35">Venue name and location to be confirmed</p>
          </div>
          <div className="relative mx-auto w-full max-w-[470px] lg:ml-auto">
            <div className="absolute -inset-5 border border-white/[.07]"></div>
            <div className="relative aspect-[.93] overflow-hidden border border-white/10 bg-[#151912] p-5 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(215,239,70,.17),transparent_38%),linear-gradient(165deg,transparent_24%,rgba(0,0,0,.72)_74%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[.2em] text-white/45"><span>ILLUSTRATIVE PLACEMENT</span><span className="flex items-center gap-2"><i className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" /> LIVE</span></div>
                <div className="relative mx-auto flex aspect-video w-full items-center justify-center border border-[hsl(var(--primary)/.65)] bg-[#0d120e] shadow-[0_0_70px_rgba(201,226,68,.12)]">
                  <div className="absolute inset-2 border border-white/[.08]" />
                  <div className="text-center">
                    <div className="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[.88] tracking-[-.08em] text-[hsl(var(--primary))]">YOUR<br />BRAND</div>
                    <div className="mt-4 font-mono text-[8px] tracking-[.24em] text-white/50">15 SEC · 100 PLAYS DAILY</div>
                  </div>
                  <span aria-hidden="true" className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/50 text-white/65"><span className="ml-0.5 h-0 w-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-current" /></span>
                </div>
                <div className="flex items-end justify-between">
                  <div><div className="font-mono text-[9px] uppercase tracking-[.2em] text-white/45">SCREEN NETWORK / 01—04</div><div className="mt-2 font-display text-xl font-semibold">A moment that moves.</div></div>
                  <span className="font-mono text-[10px] text-white/35">9 HRS / DAY</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-widest text-white/35">Illustrative visual — not a photograph of the venue</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[.025]">
        <div className="wrap grid grid-cols-2 divide-x divide-white/10 py-7 md:grid-cols-4">
          {[['100', 'plays every day'], ['15 sec', 'per ad spot'], ['9 hrs', 'daily runtime'], ['04', 'screen choices']].map(([v, l]) => <div className="px-4 py-1 first:pl-0 md:px-7" key={v}><div className="font-display text-2xl font-semibold tracking-tight">{v}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[.16em] text-white/40">{l}</div></div>)}
        </div>
      </section>

      <section id="screens" className="scroll-mt-20 py-24">
        <div className="wrap">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">01 / CHOOSE YOUR MOMENT</p><h2 className="font-display mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Four screens.<br className="sm:hidden" /> One room to reach.</h2></div>
            <p className="max-w-[350px] text-sm leading-6 text-white/50">Every placement runs 100 plays per day, with 15 seconds per spot and nine hours of daily runtime.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {scenes.map((screen, i) => {
              const item = screenCatalog.find((s) => s.key === screen.key)!;
              return <article key={screen.key} className="group relative overflow-hidden border border-white/10 bg-white/[.025] transition-colors hover:border-[hsl(var(--primary)/.55)]" data-testid={`card-screen-${screen.key}`}>
                <div className={`absolute inset-y-0 left-0 w-1 ${['bg-[hsl(var(--primary))]','bg-[hsl(var(--accent))]','bg-[#bc8dac]','bg-[#75a4bb]'][i]}`} />
                <div className="relative aspect-[16/7] overflow-hidden border-b border-white/10">
                  <img src={screen.image} alt={`Illustrative ${screen.title} location, not a photo of the actual venue`} className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.025]" loading="lazy" data-testid={`img-screen-${screen.key}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e0b]/85 via-transparent to-black/5" />
                  <span className="absolute bottom-3 left-5 font-mono text-[8px] uppercase tracking-[.17em] text-white/65">Illustrative venue image</span>
                </div>
                <div className="grid gap-7 p-6 pl-8 sm:grid-cols-[1fr_auto] sm:p-8 sm:pl-10">
                  <div><div className="flex items-center gap-3 font-mono text-[9px] tracking-[.18em] text-white/40"><span>{screen.tag}</span>{item.pilot && <span className="bg-[hsl(var(--primary)/.12)] px-2 py-1 text-[hsl(var(--primary))]">PILOT</span>}</div><h3 className="font-display mt-4 text-2xl font-semibold tracking-tight">{screen.title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-white/48">{screen.copy}</p><p className="mt-4 font-mono text-[9px] uppercase tracking-wider text-white/40">100 plays / day · 15 sec · 9 hrs / day</p></div>
                  <div className="flex flex-row items-end justify-between gap-6 sm:flex-col sm:items-end sm:text-right"><div><div className="font-display text-xl font-bold">{formatNaira(item.pilot ?? item.monthly)}</div>{item.pilot ? <><div className="mt-1 text-[10px] text-white/40 line-through">{formatNaira(item.monthly)} standard</div><div className="mt-1 font-mono text-[9px] uppercase text-[hsl(var(--primary))]">Pilot pricing / month</div></> : <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-white/40">per month</div>}</div><Link href={`/book?screen=${screen.key}`} className="flex h-10 w-10 items-center justify-center border border-white/15 transition-all group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-black" aria-label={`Book ${screen.title}`} data-testid={`link-book-${screen.key}`}><ArrowUpRight size={16} /></Link></div>
                </div>
              </article>;
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3 border border-[hsl(var(--primary)/.24)] bg-[hsl(var(--primary)/.055)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3"><Zap className="mt-0.5 text-[hsl(var(--primary))]" size={17} /><div><strong className="text-sm font-semibold">Pilot pricing — limited time</strong><p className="mt-1 text-xs text-white/50">Available on Live Band LED and DJ Section LED. Lounge screens remain at standard monthly pricing.</p></div></div>
            <Link href="/book" className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]" data-testid="link-screen-pricing">See availability <ArrowRight className="ml-1 inline" size={14} /></Link>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-white/10 bg-[#10130f] py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">02 / STRAIGHT THROUGH</p><h2 className="font-display mt-4 max-w-sm text-4xl font-semibold leading-[1.02] tracking-[-.05em]">A booking you can finish before the next set.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/48">Choose your screen, reserve your months, and send us the creative. Payment is completed by bank transfer after confirmation.</p><Link href="/book" className="mt-7 inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--primary))]" data-testid="link-how-book">Start booking <ArrowRight size={15} /></Link></div>
          <div className="grid gap-0 sm:grid-cols-3">
            {[['01', 'Pick a placement', 'Choose a screen and the months you want to be live.'], ['02', 'Send your creative', 'Upload an MP4, MOV, JPG or PNG up to 100 MB.'], ['03', 'Confirm by transfer', 'We will share verified bank-transfer instructions after your booking.']].map(([n, title, copy]) => <div className="border-t border-white/15 py-6 sm:border-l sm:border-t-0 sm:px-6 sm:first:border-l-0 sm:first:pl-0" key={n}><div className="font-mono text-[10px] text-[hsl(var(--accent))]">{n} /</div><h3 className="mt-5 font-display text-lg font-semibold">{title}</h3><p className="mt-3 text-xs leading-6 text-white/48">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="wrap relative overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(203,226,69,.11),transparent_38%),#121611] p-8 sm:p-12 lg:p-16">
          <div className="absolute right-8 top-8 hidden h-24 w-24 items-center justify-center rounded-full border border-white/10 text-[hsl(var(--primary))] md:flex"><Radio size={25} /></div>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">YOUR BRAND, IN THE ROOM</p><h2 className="font-display mt-4 max-w-xl text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Get in front of<br />the night.</h2>
          <div className="mt-8 flex flex-wrap items-center gap-6"><Link href="/book" className="button-pop inline-flex items-center gap-3 bg-[hsl(var(--primary))] px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[hsl(var(--primary-foreground))]" data-testid="link-bottom-book">Reserve a screen <ArrowRight size={15} /></Link><span className="flex items-center gap-2 text-xs text-white/50"><Check size={14} className="text-[hsl(var(--primary))]" /> No payment details required to start</span></div>
        </div>
      </section>
    </main>
  </PageFrame>;
}