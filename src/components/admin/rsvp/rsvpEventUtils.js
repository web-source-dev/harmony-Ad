export const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://harmony4all.org').replace(/\/+$/, '');

// Every event uses the same page; it shows whichever event is active
export const RSVP_URL = `${SITE_URL}/rsvp`;

const TIMEZONE = 'America/New_York';

// RSVPs close at the end of the end date, New York time (the backend switches the event off after that)
export const hasEnded = (event) => Boolean(event?.endDate) && new Date(event.endDate) < new Date();

export const formatEndDate = (endDate) =>
  endDate
    ? new Date(endDate).toLocaleDateString('en-US', {
        timeZone: TIMEZONE,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

// YYYY-MM-DD for a date input, in New York time
export const toDateInputValue = (date) => (date ? new Date(date).toLocaleDateString('en-CA', { timeZone: TIMEZONE }) : '');

export const todayInputValue = () => toDateInputValue(new Date());

export const qrCodeUrl = (link, size = 600) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=16&data=${encodeURIComponent(link)}`;

// Event dates are stored as date-only values (noon UTC), so format in UTC to keep the same calendar day
export const formatEventDate = (eventDate) => {
  if (!eventDate) return '';
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatEventWhen = (event) =>
  [formatEventDate(event.eventDate), event.eventTime].filter(Boolean).join(' · ');

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getErrorMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

export const downloadFile = async (url, fileName) => {
  try {
    const response = await fetch(url);
    const blobUrl = window.URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
};
