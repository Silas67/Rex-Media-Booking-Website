import { useEffect, useMemo, useState, type InputHTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, FileVideo2, LoaderCircle, ShieldCheck, UploadCloud } from 'lucide-react';
import { PageFrame } from '@/components/SiteShell';
import { Form } from '@/components/ui/form';
import { formatNaira, maxCreativeBytes, screenCatalog } from '@/lib/config';
import { createBooking, getAvailability, getSections, removeCreative, type MonthPair, type Section, uploadCreative } from '@/lib/data';
import { supabaseConfigured } from '@/lib/supabase';

type BookingFields = { company_name: string; contact_person: string; phone: string; email: string };
const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + i);
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  return { value, label: date.toLocaleDateString('en', { month: 'long', year: 'numeric' }) };
});

export default function Book() {
  const [, navigate] = useLocation();
  const requestedScreen = new URLSearchParams(window.location.search).get('screen') ?? '';
  const [sections, setSections] = useState<Section[]>([]);
  const [availability, setAvailability] = useState<MonthPair[]>([]);
  const [screenKey, setScreenKey] = useState<string>(requestedScreen);
  const [months, setMonths] = useState<string[]>([]);
  const [creative, setCreative] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{ id: string; total: number; section: string; months: string[] } | null>(null);
  const form = useForm<BookingFields>({
    defaultValues: { company_name: '', contact_person: '', phone: '', email: '' },
  });
  const { register, handleSubmit, formState: { errors } } = form;

  useEffect(() => {
    let alive = true;
    if (!supabaseConfigured) { setLoading(false); return () => { alive = false; }; }
    Promise.all([getSections(), getAvailability()])
      .then(([allSections, booked]) => {
        if (!alive) return;
        setSections(allSections); setAvailability(booked);
        setAvailabilityReady(true);
        if (!allSections.some((s) => s.key === requestedScreen)) setScreenKey(allSections[0]?.key ?? '');
      })
      .catch((e: Error) => { if (alive) setError(`Could not load live availability. ${e.message}`); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [requestedScreen]);

  const chosen = sections.find((section) => section.key === screenKey);
  const catalog = screenCatalog.find((screen) => screen.key === screenKey);
  const unitPrice = chosen && catalog?.pilot ? chosen.pilot_price_ngn ?? catalog.pilot : chosen?.monthly_price_ngn ?? catalog?.monthly ?? 0;
  const total = unitPrice * months.length;
  const isBooked = (key: string, month: string) => availability.some((pair) => pair.section_key === key && pair.month_start.slice(0, 10) === month);
  const monthTitle = useMemo(() => months.map((value) => monthOptions.find((m) => m.value === value)?.label).filter(Boolean), [months]);

  const submit = handleSubmit(async (values) => {
    setError('');
    if (!supabaseConfigured) { setError('Booking is unavailable until Supabase is configured.'); return; }
    if (!availabilityReady) { setError('Live availability could not be confirmed. Refresh the page and try again.'); return; }
    if (!screenKey) { setError('Choose a screen to continue.'); return; }
    if (!months.length) { setError('Choose at least one available month.'); return; }
    if (!creative) { setError('Upload your ad creative to continue.'); return; }
    if (creative.size > maxCreativeBytes) { setError('Creative must be 100 MB or smaller.'); return; }
    setSubmitting(true);
    let creativePath = '';
    try {
      creativePath = await uploadCreative(creative);
      const result = await createBooking({
        section_key: screenKey, month_starts: months, ...values,
        creative_path: creativePath, creative_filename: creative.name,
      });
      setConfirmation({
        id: result.id, total: result.total || total,
        section: chosen?.name ?? catalog?.name ?? screenKey, months: monthTitle as string[],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (creativePath) await removeCreative(creativePath).catch(() => undefined);
      setError(e instanceof Error ? e.message : 'We could not submit your booking. Please try again.');
    } finally { setSubmitting(false); }
  });

  if (confirmation) return <PageFrame><main className="wrap min-h-[70vh] py-14 sm:py-20">
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]"><CheckCircle2 size={28} /></div>
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">BOOKING REQUEST RECEIVED</p>
      <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-.06em] sm:text-6xl">The next move<br />is a bank transfer.</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">Your booking has been recorded. Our team will share the verified bank account and payment reference directly with you. No account details are shown here because none have been provided yet.</p>
      <div className="mt-9 grid gap-0 border border-white/10 sm:grid-cols-2">
        <div className="border-b border-white/10 p-6 sm:border-r"><div className="font-mono text-[9px] uppercase tracking-[.17em] text-white/40">BOOKING REFERENCE</div><div className="mt-2 break-all font-mono text-sm text-[hsl(var(--primary))]" data-testid="text-booking-reference">{confirmation.id || 'Received'}</div></div>
        <div className="border-b border-white/10 p-6 sm:border-b-0"><div className="font-mono text-[9px] uppercase tracking-[.17em] text-white/40">TOTAL DUE</div><div className="mt-2 font-display text-2xl font-bold" data-testid="text-booking-total">{formatNaira(confirmation.total)}</div></div>
        <div className="border-b border-white/10 p-6 sm:border-b-0 sm:border-r"><div className="font-mono text-[9px] uppercase tracking-[.17em] text-white/40">SCREEN</div><div className="mt-2 text-sm">{confirmation.section}</div></div>
        <div className="p-6"><div className="font-mono text-[9px] uppercase tracking-[.17em] text-white/40">MONTHS RESERVED</div><div className="mt-2 text-sm leading-6">{confirmation.months.join(' · ')}</div></div>
      </div>
      <div className="mt-5 flex gap-3 border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.06)] p-5"><ShieldCheck className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" size={18} /><div><p className="text-sm font-semibold">Payment is not marked as complete.</p><p className="mt-1 text-xs leading-5 text-white/50">Wait for payment instructions from Rex Media and only transfer to an account verified through our official contact channel.</p></div></div>
      <button onClick={() => navigate('/')} className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/65 hover:text-white" data-testid="button-return-home"><ArrowLeft size={14} /> Return to Rex Media</button>
    </div>
  </main></PageFrame>;

  return <PageFrame><main className="wrap min-h-[70vh] py-10 sm:py-16">
    <div className="mb-9"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">RESERVE YOUR PLACEMENT</p><h1 className="font-display mt-3 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Book a screen</h1><p className="mt-3 text-sm text-white/48">Pick the space, choose your months, and send your creative. Payment follows confirmation.</p></div>
    {!supabaseConfigured && <div role="status" className="mb-7 flex gap-3 border border-[hsl(var(--accent)/.25)] bg-[hsl(var(--accent)/.06)] p-4 text-sm text-[hsl(var(--accent))]" data-testid="status-booking-disabled"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>Live booking is disabled until Supabase is configured. You can review the process below, but no details will be stored.</span></div>}
    {error && <div role="alert" className="mb-6 flex gap-3 border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200" data-testid="status-booking-error"><AlertCircle size={18} className="shrink-0" />{error}</div>}
    <Form {...form}>
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1fr_350px]">
      <div className="space-y-8">
        <section className="border border-white/10 bg-white/[.02] p-5 sm:p-7">
          <StepHeading number="01" title="Choose a screen" />
          {loading ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse bg-white/[.06]" />)}</div> : !supabaseConfigured ? <p className="mt-5 text-sm text-white/45">Screen options will be available after setup.</p> : !sections.length ? <p className="mt-5 text-sm text-white/45">Screen inventory could not be loaded. Review the setup message above before continuing.</p> : <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {sections.map((section) => {
              const isPilot = Boolean(section.pilot_price_ngn);
              const selected = screenKey === section.key;
              return <button type="button" key={section.key} onClick={() => { setScreenKey(section.key); setMonths([]); }} className={`relative min-h-[118px] border p-4 text-left transition-colors ${selected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'border-white/10 hover:border-white/30'}`} data-testid={`button-select-screen-${section.key}`}>
                <span className={`absolute right-4 top-4 grid h-5 w-5 place-items-center border ${selected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-black' : 'border-white/25'}`}>{selected && <Check size={13} />}</span>
                <span className="block pr-7 font-display text-lg font-semibold">{section.name}</span>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-widest text-white/40">100 plays · 15 sec · 9 hrs/day</span>
                <span className="mt-3 block text-sm font-bold">{formatNaira(isPilot ? section.pilot_price_ngn! : section.monthly_price_ngn)}<span className="ml-1 text-[10px] font-normal text-white/40">/ month {isPilot ? '· pilot' : ''}</span></span>
              </button>;
            })}
          </div>}
        </section>

        <section className="border border-white/10 bg-white/[.02] p-5 sm:p-7">
          <StepHeading number="02" title="Choose months" />
          <p className="mt-2 text-xs text-white/45">Select one or more open months. Booked screen/month combinations are unavailable.</p>
          {loading ? <div className="mt-5 h-24 animate-pulse bg-white/[.06]" /> : !supabaseConfigured ? <p className="mt-5 text-sm text-white/45">Availability will load after setup.</p> : <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {monthOptions.map((month) => {
              const unavailable = Boolean(screenKey && isBooked(screenKey, month.value));
              const checked = months.includes(month.value);
              return <label key={month.value} className={`flex min-h-12 items-center gap-3 border px-3 text-xs transition-colors ${unavailable ? 'cursor-not-allowed border-white/[.06] text-white/25' : checked ? 'cursor-pointer border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'cursor-pointer border-white/10 text-white/75 hover:border-white/30'}`}>
                <input type="checkbox" disabled={unavailable} checked={checked} onChange={() => setMonths(checked ? months.filter((m) => m !== month.value) : [...months, month.value])} className="accent-[hsl(var(--primary))]" data-testid={`input-month-${month.value.slice(0, 7)}`} />
                <span className="flex-1">{month.label}</span>{unavailable && <span className="font-mono text-[8px] uppercase">Booked</span>}
              </label>;
            })}
          </div>}
        </section>

        <section className="border border-white/10 bg-white/[.02] p-5 sm:p-7">
          <StepHeading number="03" title="Upload creative" />
          <p className="mt-2 text-xs leading-5 text-white/45">MP4, MOV, JPG, JPEG or PNG · up to 100 MB. Recommended: 15-second, 1920 × 1080 H.264 MP4. Duration is not automatically checked.</p>
          <label className={`mt-5 flex cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-8 text-center transition-colors ${creative ? 'border-[hsl(var(--primary)/.55)] bg-[hsl(var(--primary)/.04)]' : 'border-white/20 hover:border-white/40'}`} data-testid="dropzone-creative">
            <input type="file" accept=".mp4,.mov,.jpg,.jpeg,.png,video/mp4,video/quicktime,image/jpeg,image/png" className="sr-only" onChange={(event) => setCreative(event.target.files?.[0] ?? null)} data-testid="input-creative" />
            {creative ? <FileVideo2 className="text-[hsl(var(--primary))]" size={25} /> : <UploadCloud className="text-white/45" size={25} />}
            <span className="mt-3 text-sm font-semibold">{creative?.name ?? 'Choose your creative file'}</span>
            <span className="mt-1 text-[10px] text-white/40">{creative ? `${(creative.size / 1024 / 1024).toFixed(1)} MB · click to replace` : 'Browse from device · no duration check is performed'}</span>
          </label>
        </section>

        <section className="border border-white/10 bg-white/[.02] p-5 sm:p-7">
          <StepHeading number="04" title="Company & contact" />
          <div className="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <Field label="Company name" id="company_name" error={errors.company_name?.message} {...register('company_name', { required: 'Company name is required.' })} />
            <Field label="Contact person" id="contact_person" error={errors.contact_person?.message} {...register('contact_person', { required: 'Contact person is required.' })} />
            <Field label="Phone number" id="phone" type="tel" error={errors.phone?.message} {...register('phone', { required: 'Phone number is required.' })} />
            <Field label="Email address" id="email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' } })} />
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="border border-white/10 bg-[#11150f] p-5 sm:p-6">
          <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">BOOKING SUMMARY</div>
          <h2 className="font-display mt-3 text-2xl font-semibold">Your placement</h2>
          <div className="mt-6 space-y-4 border-y border-white/10 py-5 text-sm">
            <div className="flex justify-between gap-3"><span className="text-white/45">Screen</span><span className="text-right">{chosen?.name ?? 'Choose a screen'}</span></div>
            <div className="flex justify-between gap-3"><span className="text-white/45">Rate / month</span><span>{unitPrice ? formatNaira(unitPrice) : '—'}</span></div>
            <div className="flex justify-between gap-3"><span className="text-white/45">Months selected</span><span>{months.length}</span></div>
            {months.length > 0 && <p className="text-right text-[10px] leading-5 text-white/40">{monthTitle.join(' · ')}</p>}
            <div className="flex justify-between gap-3 pt-2"><span className="font-semibold">Estimated total</span><span className="font-display text-xl font-bold text-[hsl(var(--primary))]" data-testid="text-estimated-total">{formatNaira(total)}</span></div>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-white/40">Final amount is confirmed by the booking service. No payment is collected on this page.</p>
          <button type="submit" disabled={!supabaseConfigured || submitting || loading || !availabilityReady} className="button-pop mt-6 flex w-full items-center justify-center gap-2 bg-[hsl(var(--primary))] px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-black disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-submit-booking">{submitting ? <><LoaderCircle className="animate-spin" size={15} /> Sending request</> : <>Submit booking <ArrowRight size={15} /></>}</button>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-white/38"><ShieldCheck size={13} /> Your booking details are sent securely.</div>
        </div>
        {error && <p className="mt-3 text-xs text-red-200" role="alert">{error}</p>}
      </aside>
    </form>
    </Form>
  </main></PageFrame>;
}

function StepHeading({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-[hsl(var(--accent))]">{number} /</span><h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2></div>;
}

function Field({ label, id, error, type = 'text', ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string }) {
  return <div><label htmlFor={id} className="mb-2 block text-xs font-semibold text-white/75">{label}</label><input id={id} type={type} className="field" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} data-testid={`input-${id}`} {...props} />{error && <p id={`${id}-error`} className="mt-1.5 text-[11px] text-red-300">{error}</p>}</div>;
}