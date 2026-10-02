export const venueConfig = {
  venueName: 'Venue details to be confirmed',
  location: 'Address to be confirmed',
  contactEmail: 'Contact email to be confirmed',
  contactPhone: 'Business phone to be confirmed',
  whatsappNumber: '',
  socialLinks: {
    Instagram: '',
    Facebook: '',
    TikTok: '',
  },
};

export const screenCatalog = [
  { key: 'live-band-led', name: 'Live Band LED', monthly: 800000, pilot: 400000, place: 'Live band stage', tone: 'lime' },
  { key: 'dj-section-led', name: 'DJ Section LED', monthly: 500000, pilot: 250000, place: 'DJ section', tone: 'amber' },
  { key: 'lounge-led-1', name: 'Lounge LED 01', monthly: 800000, pilot: null, place: 'Lounge', tone: 'plum' },
  { key: 'lounge-led-2', name: 'Lounge LED 02', monthly: 800000, pilot: null, place: 'Lounge', tone: 'blue' },
] as const;

export const storageBucket = 'ad-creatives';
export const maxCreativeBytes = 100 * 1024 * 1024;
export const acceptedCreativeTypes = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'];
export const acceptedCreativeExtensions = ['mp4', 'mov', 'jpg', 'jpeg', 'png'];
export const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);