import type { Session } from '@supabase/supabase-js';
import { acceptedCreativeExtensions, maxCreativeBytes, screenCatalog, storageBucket } from './config';
import { supabase } from './supabase';

export type Section = {
  key: string;
  name: string;
  monthly_price_ngn: number;
  pilot_price_ngn: number | null;
  plays_per_day: number;
  ad_duration_seconds: number;
  runtime_hours: number;
};
export type MonthPair = { section_key: string; month_start: string };
export type Booking = {
  id: string;
  section_key: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  creative_path: string;
  creative_filename: string;
  monthly_price_ngn: number;
  total_price_ngn: number;
  payment_status: 'unpaid' | 'paid';
  booking_status: string;
  created_at: string;
  booking_months?: { month_start: string; section_key: string }[];
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured. Add the required VITE_SUPABASE values.');
  return supabase;
}

export async function getSections(): Promise<Section[]> {
  const db = client();
  const { data, error } = await db.from('screen_sections')
    .select('key,name,monthly_price_ngn,pilot_price_ngn,plays_per_day,ad_duration_seconds,runtime_hours');
  if (error) throw error;
  const rows = data as Section[];
  const missing = screenCatalog.filter((known) => !rows.some((row) => row.key === known.key));
  if (missing.length) {
    throw new Error(`Supabase screen_sections is missing: ${missing.map((item) => item.key).join(', ')}.`);
  }
  return screenCatalog.map((known) => rows.find((row) => row.key === known.key)!);
}

export async function getAvailability(): Promise<MonthPair[]> {
  const { data, error } = await client().from('booking_months').select('section_key,month_start');
  if (error) throw error;
  return (data ?? []) as MonthPair[];
}

export async function uploadCreative(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!acceptedCreativeExtensions.includes(ext)) throw new Error('Choose an MP4, MOV, JPG, JPEG or PNG file.');
  if (file.size > maxCreativeBytes) throw new Error('Creative must be 100 MB or smaller.');
  const path = `incoming/${crypto.randomUUID()}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const { error } = await client().storage.from(storageBucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

export async function removeCreative(path: string) {
  if (!path) return;
  const { error } = await client().storage.from(storageBucket).remove([path]);
  if (error) throw error;
}

export async function createBooking(input: {
  section_key: string; month_starts: string[]; company_name: string; contact_person: string;
  phone: string; email: string; creative_path: string; creative_filename: string;
}) {
  const { data, error } = await client().rpc('create_booking', {
    section_key: input.section_key, month_starts: input.month_starts,
    company_name: input.company_name, contact_person: input.contact_person,
    phone: input.phone, email: input.email, creative_path: input.creative_path,
    creative_filename: input.creative_filename,
  });
  if (error) throw error;
  const result = (Array.isArray(data) ? data[0] : data) as {
    id?: string | number; booking_id?: string | number;
    total?: number | string; total_price_ngn?: number | string;
  } | null;
  const id = result?.id ?? result?.booking_id;
  const total = Number(result?.total ?? result?.total_price_ngn);
  if (id == null || !Number.isFinite(total) || total <= 0) {
    throw new Error('The booking service returned an incomplete confirmation. Contact Rex Media before making a transfer.');
  }
  return { id: String(id), total };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function checkAdmin(session: Session) {
  const { data, error } = await client().from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function signOut() {
  const { error } = await client().auth.signOut();
  if (error) throw error;
}

export async function listBookings() {
  const { data, error } = await client().from('bookings')
    .select('id,section_key,company_name,contact_person,phone,email,creative_path,creative_filename,monthly_price_ngn,total_price_ngn,payment_status,booking_status,created_at,booking_months(section_key,month_start)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function setPaymentStatus(id: string, payment_status: 'paid' | 'unpaid') {
  const { error } = await client().from('bookings').update({ payment_status }).eq('id', id);
  if (error) throw error;
}

export async function replaceCreative(id: string, oldPath: string, file: File) {
  const path = await uploadCreative(file);
  const { error } = await client().from('bookings').update({
    creative_path: path, creative_filename: file.name,
  }).eq('id', id);
  if (error) {
    await client().storage.from(storageBucket).remove([path]);
    throw error;
  }
  if (oldPath) await client().storage.from(storageBucket).remove([oldPath]);
}

export async function getCreativeUrl(path: string) {
  const { data, error } = await client().storage.from(storageBucket).createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export async function getAdminSession() {
  const { data, error } = await client().auth.getSession();
  if (error) throw error;
  return data.session;
}