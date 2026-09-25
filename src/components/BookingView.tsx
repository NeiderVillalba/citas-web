import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, Stethoscope, UserRound } from 'lucide-react';
import { ApiError, citasApi } from '../api/citasApi';
import type { ProfessionalOption, SpecialtyOption, VenueOption } from '../api/citasApi';
import { bogotaDateKey, formatBogotaDate, formatBogotaTime } from '../utils/appointmentTime';

interface BookingViewProps {
  onBooked: () => Promise<void> | void;
  onNavigate: (screen: 'dashboard' | 'history') => void;
}

export function BookingView({ onBooked, onNavigate }: BookingViewProps) {
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [starts, setStarts] = useState<string[]>([]);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [venueId, setVenueId] = useState<number | null>(null);
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{ id: number; status: string } | null>(null);

  const specialty = specialties.find((item) => item.id === specialtyId);
  const venue = venues.find((item) => item.id === venueId);
  const professional = professionals.find((item) => item.id === professionalId);

  useEffect(() => {
    let active = true;
    Promise.all([citasApi.getSpecialties(), citasApi.getVenues()])
      .then(([loadedSpecialties, loadedVenues]) => {
        if (!active) return;
        setSpecialties(loadedSpecialties);
        setVenues(loadedVenues);
        setSpecialtyId(loadedSpecialties[0]?.id ?? null);
        setVenueId(loadedVenues[0]?.id ?? null);
      })
      .catch((cause) => { if (active) setError(messageFor(cause, 'No fue posible cargar el catálogo.')); })
      .finally(() => { if (active) setLoadingCatalog(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (specialtyId == null) return;
    let active = true;
    setLoadingProfessionals(true);
    setProfessionalId(null);
    setProfessionals([]);
    setStarts([]);
    setSelectedStart(null);
    citasApi.getProfessionals(specialtyId)
      .then((items) => {
        if (!active) return;
        setProfessionals(items);
        setProfessionalId(items[0]?.id ?? null);
      })
      .catch((cause) => { if (active) setError(messageFor(cause, 'No fue posible cargar los profesionales.')); })
      .finally(() => { if (active) setLoadingProfessionals(false); });
    return () => { active = false; };
  }, [specialtyId]);

  useEffect(() => {
    if (specialtyId == null || professionalId == null || venueId == null) return;
    let active = true;
    setLoadingAvailability(true);
    setStarts([]);
    setSelectedDay(null);
    setSelectedStart(null);
    const from = new Date();
    const to = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
    citasApi.getAvailability(specialtyId, professionalId, venueId, from.toISOString(), to.toISOString())
      .then((items) => {
        if (!active) return;
        setStarts(items);
        setSelectedDay(items.length ? bogotaDateKey(items[0]) : null);
      })
      .catch((cause) => { if (active) setError(messageFor(cause, 'No fue posible cargar los horarios.')); })
      .finally(() => { if (active) setLoadingAvailability(false); });
    return () => { active = false; };
  }, [specialtyId, professionalId, venueId]);

  const days = useMemo(() => [...new Set(starts.map(bogotaDateKey))], [starts]);
  const dayStarts = starts.filter((start) => bogotaDateKey(start) === selectedDay);

  async function book() {
    if (!specialty || !professional || !venue || !selectedStart) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await citasApi.createAppointment({
        specialtyId: specialty.id,
        professionalId: professional.id,
        venueId: venue.id,
        startsAt: selectedStart,
        appointmentType: specialty.appointmentType,
      });
      await onBooked();
      setConfirmation(result);
      setSelectedStart(null);
      await reloadStarts(specialty.id, professional.id, venue.id).catch(() => {});
    } catch (cause) {
      setError(messageFor(cause, 'No fue posible reservar. Inténtalo de nuevo.'));
      if (cause instanceof ApiError && cause.status === 409) {
        setSelectedStart(null);
        void reloadStarts(specialty.id, professional.id, venue.id).catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function reloadStarts(nextSpecialtyId: number, nextProfessionalId: number, nextVenueId: number) {
    const from = new Date();
    const to = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
    const items = await citasApi.getAvailability(nextSpecialtyId, nextProfessionalId, nextVenueId,
      from.toISOString(), to.toISOString());
    setStarts(items);
    setSelectedDay(items.length ? bogotaDateKey(items[0]) : null);
  }

  return (
    <main className="w-full max-w-md mx-auto px-4 pt-4 pb-24 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100">Agendar nueva cita</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Selecciona especialidad, sede, profesional y un horario disponible.</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {loadingCatalog && <p role="status" className="text-sm text-slate-500">Cargando especialidades y sedes…</p>}
      {!loadingCatalog && specialties.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">No hay especialidades activas.</p>}

      {specialties.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-[#006399]" />1. Especialidad</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {specialties.map((item) => (
              <button key={item.id} type="button" onClick={() => { setError(''); setSpecialtyId(item.id); }}
                aria-pressed={specialtyId === item.id}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${specialtyId === item.id ? 'bg-[#134074] text-white border-[#134074]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>
                {item.name} · {item.durationMinutes} min
              </button>
            ))}
          </div>
        </section>
      )}

      {venues.length > 0 && (
        <section className="flex flex-col gap-2">
          <label htmlFor="booking-venue" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#006399]" />2. Sede</label>
          <select id="booking-venue" value={venueId ?? ''} onChange={(event) => { setError(''); setVenueId(Number(event.target.value)); }}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {venues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {venue && <p className="text-xs text-slate-500 dark:text-slate-400">{venue.address}</p>}
        </section>
      )}

      {specialty && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><UserRound className="w-4 h-4 text-[#006399]" />3. Profesional</h3>
          {loadingProfessionals && <p role="status" className="text-xs text-slate-500">Cargando profesionales…</p>}
          {!loadingProfessionals && professionals.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">No hay profesionales activos para esta especialidad.</p>}
          <div className="grid gap-2">
            {professionals.map((item) => (
              <button key={item.id} type="button" onClick={() => { setError(''); setProfessionalId(item.id); }} aria-pressed={professionalId === item.id}
                className={`rounded-2xl border p-3.5 text-left text-sm flex items-center gap-3 ${professionalId === item.id ? 'border-[#006399] bg-blue-50 dark:bg-slate-800 dark:text-sky-300' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                <span className="w-10 h-10 rounded-xl bg-[#134074] text-white flex items-center justify-center font-bold">{item.firstName.charAt(0)}</span>
                <span className="font-semibold">{item.firstName} {item.lastName}</span>
                {professionalId === item.id && <CheckCircle2 className="ml-auto w-4 h-4 text-[#006399]" />}
              </button>
            ))}
          </div>
        </section>
      )}

      {professionalId != null && venueId != null && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#006399]" />4. Fecha</h3>
          {loadingAvailability && <p role="status" className="text-xs text-slate-500">Consultando horarios…</p>}
          {!loadingAvailability && starts.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">No hay horarios disponibles en los próximos 14 días para esta combinación. Prueba otra sede o profesional.</p>}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => {
              const firstStart = starts.find((start) => bogotaDateKey(start) === day)!;
              return <button key={day} type="button" onClick={() => { setSelectedDay(day); setSelectedStart(null); }} aria-pressed={selectedDay === day}
                className={`shrink-0 min-w-24 rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${selectedDay === day ? 'bg-[#134074] text-white border-[#134074]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>{formatBogotaDate(firstStart)}</button>;
            })}
          </div>
        </section>
      )}

      {dayStarts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Clock3 className="w-4 h-4 text-[#006399]" />5. Hora · Colombia</h3>
          <div className="grid grid-cols-4 gap-2">
            {dayStarts.map((start) => <button key={start} type="button" onClick={() => setSelectedStart(start)} aria-pressed={selectedStart === start}
              className={`h-10 rounded-lg border text-xs font-semibold ${selectedStart === start ? 'bg-[#006399] text-white border-[#006399]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>{formatBogotaTime(start)}</button>)}
          </div>
        </section>
      )}

      {specialty && selectedStart && (
        <p className="rounded-xl bg-blue-50 p-3 text-xs text-[#002a54] dark:bg-slate-800 dark:text-sky-200">
          {specialty.appointmentType === 'GENERAL' ? 'La cita general se aprueba al reservar.' : 'La cita especializada queda solicitada y requiere aprobación administrativa.'}
        </p>
      )}
      <button type="button" onClick={book} disabled={!selectedStart || submitting}
        className="w-full h-12 rounded-xl bg-[#134074] text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#002a54] transition-colors">
        {submitting ? 'Reservando…' : 'Confirmar cita'}
      </button>

      {confirmation && (
        <div role="dialog" aria-modal="true" aria-labelledby="booking-confirmation-title" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto w-14 h-14 text-emerald-600" />
            <h3 id="booking-confirmation-title" className="mt-3 text-lg font-bold text-[#002a54] dark:text-slate-100">{confirmation.status === 'APPROVED' ? 'Cita aprobada' : 'Solicitud recibida'}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Número de cita: {confirmation.id}. Puedes consultar su estado en Mis citas.</p>
            <button type="button" onClick={() => { setConfirmation(null); onNavigate('history'); }} className="mt-5 w-full h-11 rounded-xl bg-[#134074] text-white font-semibold">Ver mis citas</button>
          </div>
        </div>
      )}
    </main>
  );
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
