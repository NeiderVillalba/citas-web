const timeZone = 'America/Bogota';

export function bogotaDateKey(instant: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function formatBogotaDate(instant: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(instant));
}

export function formatBogotaTime(instant: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(instant));
}
