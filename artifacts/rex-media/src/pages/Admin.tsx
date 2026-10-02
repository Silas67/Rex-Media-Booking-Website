import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Session } from '@supabase/supabase-js';
import { AlertCircle, ArrowDownToLine, Check, Clock3, FileUp, LoaderCircle, LogOut, RefreshCw, Shield, Users } from 'lucide-react';
import { PageFrame } from '@/components/SiteShell';
import { Form } from '@/components/ui/form';
import { formatNaira, maxCreativeBytes, screenCatalog } from '@/lib/config';
import { checkAdmin, getAdminSession, getAvailability, getCreativeUrl, listBookings, replaceCreative, setPaymentStatus, signIn, signOut, type Booking, type MonthPair } from '@/lib/data';
import { supabaseConfigured, supabase } from '@/lib/supabase';

type LoginFields = { email: string; password: string };

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pairs, setPairs] = useState<MonthPair[]>([]);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creativeLoading, setCreativeLoading] = useState('');
  const form = useForm<LoginFields>({ defaultValues: { email: '', password: '' } });
  const { register, handleSubmit, formState: { errors } } = form;
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() + index);
    return { value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`, label: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }) };
  }), []);

  async function refresh() {
    setError('');
    const [allBookings, allPairs] = await Promise.all([listBookings(), getAvailability()]);
    setBookings(allBookings); setPairs(allPairs);
  }

  useEffect(() => {
    let alive = true;
    if (!supabaseConfigured || !supabase) { setChecking(false); return () => { alive = false; }; }
    getAdminSession().then(async (current) => {
      if (!alive) return;
      setSession(current);
      if (current) {
        const member = await checkAdmin(current);
        if (!alive) return;
        setAuthorized(member);
        if (member) await refresh();
      }
    }).catch((e: Error) => { if (alive) setError(e.message); }).finally(() => { if (alive) setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthorized(false);
      if (nextSession) {
        void checkAdmin(nextSession).then(async (member) => { setAuthorized(member); if (member) await refresh(); })
          .catch((e: Error) => setError(e.message));
      } else { setBookings([]); setPairs([]); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const login = handleSubmit(async (values) => {
    setError(''); setNotice('');
    try {
      const next = await signIn(values.email, values.password);
      if (!next) throw new Error('Authentication succeeded, but no session was returned.');
      const member = await checkAdmin(next);
      if (!member) {
        await signOut();
        throw new Error('This account is not listed in admin_users. Access has not been granted.');
      }
      setSession(next); setAuthorized(true); await refresh(); setNotice('Signed in. Booking data is current.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not sign in. Check your credentials and try again.'); }
  });

  async function updatePayment(booking: Booking) {
    setBusyId(booking.id); setError(''); setNotice('');
    const next = booking.payment_status === 'paid' ? 'unpaid' : 'paid';
    try {
      await setPaymentStatus(booking.id, next);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, payment_status: next } : item));
      setNotice(`Booking payment status updated to ${next}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Payment status could not be updated.'); }
    finally { setBusyId(''); }
  }

  async function onCreativeChange(booking: Booking, file?: File) {
    if (!file) return;
    if (file.size > maxCreativeBytes) { setError('Creative must be 100 MB or smaller.'); return; }
    setBusyId(booking.id); setError(''); setNotice('');
    try {
      await replaceCreative(booking.id, booking.creative_path, file);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, creative_filename: file.name } : item));
      setNotice(`Creative replaced for ${booking.company_name}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Creative replacement failed.'); }
    finally { setBusyId(''); }
  }

  async function openCreative(booking: Booking) {
    setCreativeLoading(booking.id); setError('');
    try {
      const url = await getCreativeUrl(booking.creative_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not prepare creative download.'); }
    finally { setCreativeLoading(''); }
  }

  async function logout() {
    setError('');
    try { await signOut(); setSession(null); setAuthorized(false); setBookings([]); setPairs([]); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not sign out.'); }
  }

  const booked = (section: string, month: string) => pairs.some((pair) => pair.section_key === section && pair.month_start.slice(0, 10) === month);

  return <PageFrame><main className="wrap min-h-[70vh] py-10 sm:py-16">
    <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">REX MEDIA / PRIVATE</p><h1 className="font-display mt-3 text-4xl font-semibold tracking-[-.06em]">Booking admin</h1><p className="mt-2 text-sm text-white/45">Bookings, creative files and month-by-month inventory.</p></div>
      {authorized && <div className="flex items-center gap-4"><span className="text-xs text-white/50">{session?.user.email}</span><button onClick={logout} className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-xs font-semibold hover:border-white/40" data-testid="button-admin-logout"><LogOut size={14} /> Sign out</button></div>}
    </div>

    {!supabaseConfigured ? <div className="mx-auto mt-12 max-w-xl border border-[hsl(var(--accent)/.25)] bg-[hsl(var(--accent)/.06)] p-6" data-testid="status-admin-setup"><div className="flex gap-3 text-[hsl(var(--accent))]"><AlertCircle size={19} /><div><h2 className="font-display text-lg font-semibold">Supabase setup required</h2><p className="mt-2 text-sm leading-6 text-white/55">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable admin sign-in. Do not add a service-role key to the browser app.</p></div></div></div> : checking ? <div className="mt-12 animate-pulse space-y-3"><div className="h-16 bg-white/[.05]" /><div className="h-48 bg-white/[.05]" /></div> : !authorized ? <div className="mx-auto mt-12 max-w-md border border-white/10 bg-white/[.025] p-6 sm:p-8">
      <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[hsl(var(--primary)/.35)] text-[hsl(var(--primary))]"><Shield size={20} /></div>
      <h2 className="font-display text-2xl font-semibold">Admin sign in</h2>
      <p className="mt-2 text-xs leading-5 text-white/45">Use your Supabase Auth email and password. Access is restricted to accounts in admin_users.</p>
      {error && <div role="alert" className="mt-5 border border-red-300/25 bg-red-300/5 p-3 text-xs leading-5 text-red-200" data-testid="status-admin-error">{error}</div>}
      {session && !authorized && !checking && <div className="mt-5 border border-[hsl(var(--accent)/.25)] p-3 text-xs leading-5 text-[hsl(var(--accent))]" data-testid="status-admin-membership">This account does not have admin membership.</div>}
      <Form {...form}>
      <form className="mt-6 space-y-4" onSubmit={login}>
        <div><label htmlFor="admin-email" className="mb-2 block text-xs font-semibold">Email address</label><input id="admin-email" type="email" autoComplete="username" className="field" data-testid="input-admin-email" {...register('email', { required: 'Email is required.' })} />{errors.email && <p className="mt-1 text-[11px] text-red-300">{errors.email.message}</p>}</div>
        <div><label htmlFor="admin-password" className="mb-2 block text-xs font-semibold">Password</label><input id="admin-password" type="password" autoComplete="current-password" className="field" data-testid="input-admin-password" {...register('password', { required: 'Password is required.' })} />{errors.password && <p className="mt-1 text-[11px] text-red-300">{errors.password.message}</p>}</div>
        <button className="button-pop flex w-full items-center justify-center gap-2 bg-[hsl(var(--primary))] px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-black" type="submit" data-testid="button-admin-login">Sign in <ArrowDownToLine size={14} /></button>
      </form>
      </Form>
    </div> : <div className="pt-8">
      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`mb-6 flex items-center gap-3 border p-4 text-sm ${error ? 'border-red-300/25 bg-red-300/5 text-red-200' : 'border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.06)] text-[hsl(var(--primary))]'}`} data-testid={error ? 'status-admin-error' : 'status-admin-notice'}>{error ? <AlertCircle size={16} /> : <Check size={16} />}{error || notice}</div>}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[.18em] text-white/40">BOOKING REGISTER</p><h2 className="font-display mt-2 text-2xl font-semibold">Incoming bookings <span className="ml-2 font-mono text-sm text-white/40">{bookings.length}</span></h2></div><button onClick={() => void refresh().catch((e: Error) => setError(e.message))} className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-xs font-semibold hover:border-white/40" data-testid="button-refresh-bookings"><RefreshCw size={14} /> Refresh list</button></div>
        {bookings.length === 0 ? <div className="border border-dashed border-white/15 px-6 py-12 text-center" data-testid="empty-bookings"><Users className="mx-auto text-white/35" size={24} /><p className="mt-4 font-display text-lg font-semibold">No bookings yet</p><p className="mt-1 text-xs text-white/45">New customer bookings will appear here.</p></div> : <div className="space-y-3">
          {bookings.map((booking) => <article key={booking.id} className="border border-white/10 bg-white/[.02] p-4 sm:p-5" data-testid={`row-booking-${booking.id}`}>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-semibold">{booking.company_name}</h3><span className={`border px-2 py-1 font-mono text-[8px] uppercase tracking-widest ${booking.payment_status === 'paid' ? 'border-[hsl(var(--primary)/.4)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--accent)/.35)] text-[hsl(var(--accent))]'}`} data-testid={`status-payment-${booking.id}`}>{booking.payment_status}</span><span className="font-mono text-[9px] text-white/35">{booking.booking_status}</span></div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/48"><span>{booking.contact_person}</span><span>{booking.email}</span><span>{booking.phone}</span></div>
                <div className="mt-4 grid gap-x-7 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                  <p><span className="text-white/40">Screen </span>{screenCatalog.find((x) => x.key === booking.section_key)?.name ?? booking.section_key}</p>
                  <p><span className="text-white/40">Months </span>{booking.booking_months?.map((m) => new Date(`${m.month_start.slice(0, 10)}T00:00:00`).toLocaleDateString('en', { month: 'short', year: 'numeric' })).join(', ') || '—'}</p>
                  <p><span className="text-white/40">Total </span><strong>{formatNaira(booking.total_price_ngn)}</strong></p>
                  <p className="truncate"><span className="text-white/40">Creative </span>{booking.creative_filename || 'No file name'}</p>
                  <p><span className="text-white/40">Received </span>{new Date(booking.created_at).toLocaleString()}</p>
                  <p><span className="text-white/40">Reference </span><span className="font-mono text-[10px]">{booking.id}</span></p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:max-w-[230px] lg:justify-end">
                <button disabled={creativeLoading === booking.id} onClick={() => void openCreative(booking)} className="inline-flex items-center gap-2 border border-white/15 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide hover:border-white/40 disabled:opacity-40" data-testid={`button-view-creative-${booking.id}`}>{creativeLoading === booking.id ? <LoaderCircle className="animate-spin" size={13} /> : <ArrowDownToLine size={13} />} Creative</button>
                <label className="inline-flex cursor-pointer items-center gap-2 border border-white/15 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide hover:border-white/40" data-testid={`button-replace-creative-${booking.id}`}><FileUp size={13} /> Replace<input type="file" accept=".mp4,.mov,.jpg,.jpeg,.png,video/mp4,video/quicktime,image/jpeg,image/png" className="sr-only" disabled={busyId === booking.id} onChange={(event) => { void onCreativeChange(booking, event.target.files?.[0]); event.currentTarget.value = ''; }} data-testid={`input-replace-creative-${booking.id}`} /></label>
                <button disabled={busyId === booking.id} onClick={() => void updatePayment(booking)} className={`inline-flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide disabled:opacity-40 ${booking.payment_status === 'paid' ? 'border border-white/15 text-white/70' : 'bg-[hsl(var(--primary))] text-black'}`} data-testid={`button-payment-${booking.id}`}>{busyId === booking.id ? <LoaderCircle className="animate-spin" size={13} /> : <Check size={13} />}{booking.payment_status === 'paid' ? 'Mark unpaid' : 'Mark paid'}</button>
              </div>
            </div>
          </article>)}
        </div>}
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[.18em] text-white/40">LIVE INVENTORY</p><h2 className="font-display mt-2 text-2xl font-semibold">Month-by-month availability</h2></div><div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider text-white/45"><span><i className="mr-2 inline-block h-2 w-2 bg-[hsl(var(--primary))]" />Open</span><span><i className="mr-2 inline-block h-2 w-2 bg-[hsl(var(--accent))]" />Booked</span></div></div>
        <div className="overflow-x-auto border border-white/10" data-testid="table-month-availability"><div className="min-w-[900px]">
          <div className="grid grid-cols-[190px_repeat(12,minmax(58px,1fr))] border-b border-white/10 bg-white/[.025]">{['Screen', ...months.map((m) => m.label)].map((label, index) => <div key={label} className={`px-2 py-3 font-mono text-[9px] uppercase tracking-wider text-white/45 ${index ? 'text-center' : ''}`}>{label}</div>)}</div>
          {screenCatalog.map((screen) => <div key={screen.key} className="grid grid-cols-[190px_repeat(12,minmax(58px,1fr))] border-b border-white/[.07] last:border-0"><div className="px-3 py-4 text-xs font-semibold">{screen.name}</div>{months.map((month) => { const unavailable = booked(screen.key, month.value); return <div key={month.value} className="flex items-center justify-center border-l border-white/[.05] px-2 py-3"><span aria-label={unavailable ? 'Booked' : 'Available'} title={unavailable ? 'Booked' : 'Available'} className={`h-2.5 w-2.5 rounded-full ${unavailable ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'}`} data-testid={`availability-${screen.key}-${month.value.slice(0, 7)}`} /></div>; })}</div>)}
        </div></div>
        <p className="mt-3 flex items-center gap-2 text-[10px] text-white/40"><Clock3 size={13} /> Availability displays booked screen/month pairs only. Company data is not used in this view.</p>
      </section>
    </div>}
  </main></PageFrame>;
}