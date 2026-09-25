import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, RefreshCw, Stethoscope, UserRound, XCircle } from 'lucide-react';
import { ApiError, citasApi } from '../api/citasApi';
import type { AppointmentOutcome, ProfessionalAppointment, VenueOption } from '../api/citasApi';
import { bogotaDateKey, formatBogotaDate, formatBogotaTime } from '../utils/appointmentTime';

type RangeMode = 'day' | 'week';

function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function toBogotaMidnight(date: string): string {
  return new Date(`${date}T00:00:00-05:00`).toISOString();
}

const outcomeCopy: Record<AppointmentOutcome, string> = {
  COMPLETED: 'La atención quedó marcada como realizada.',
  NO_SHOW: 'La cita quedó marcada como inasistencia.',
};

export function ProfessionalAgendaView() {
  const [selectedDate, setSelectedDate] = useState(() => bogotaDateKey(new Date().toISOString()));
  const [rangeMode, setRangeMode] = useState<RangeMode>('day');
  const [venueId, setVenueId] = useState('');
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const range = useMemo(() => ({
    from: toBogotaMidnight(selectedDate),
    to: toBogotaMidnight(shiftDate(selectedDate, rangeMode === 'day' ? 1 : 7)),
  }), [selectedDate, rangeMode]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await citasApi.getProfessionalAppointments(range.from, range.to, venueId ? Number(venueId) : undefined);
      setAppointments(rows);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible cargar tu agenda.');
    } finally {
      setLoading(false);
    }
  }, [range, venueId]);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    let current = true;
    citasApi.getVenues().then((rows) => { if (current) setVenues(rows); }).catch(() => {
      if (current) setError('No fue posible cargar el catálogo de sedes.');
    });
    return () => { current = false; };
  }, []);

  async function closeAppointment(appointment: ProfessionalAppointment, outcome: AppointmentOutcome) {
    setBusyId(appointment.id);
    setError('');
    setMessage('');
    try {
      await citasApi.closeProfessionalAppointment(appointment.id, outcome);
      setMessage(outcomeCopy[outcome]);
      await reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible registrar el resultado.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-24 pt-4">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Portal profesional</p>
        <h2 className="mt-1 text-xl font-bold text-[#002a54] dark:text-slate-100">Mi agenda</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Consulta tus citas aprobadas y registra su resultado.</p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <label htmlFor="agenda-date" className="text-xs font-semibold text-slate-700 dark:text-slate-200">Fecha de inicio</label>
        <input id="agenda-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        <div className="mt-3 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          {([['day', 'Día'], ['week', '7 días']] as const).map(([mode, label]) => <button key={mode} type="button" onClick={() => setRangeMode(mode)} aria-pressed={rangeMode === mode} className={`rounded-lg py-2 text-xs font-semibold ${rangeMode === mode ? 'bg-white text-[#002a54] shadow-xs dark:bg-slate-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>{label}</button>)}
        </div>
        <label htmlFor="agenda-venue" className="mt-3 block text-xs font-semibold text-slate-700 dark:text-slate-200">Sede</label>
        <select id="agenda-venue" value={venueId} onChange={(event) => setVenueId(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <option value="">Todas mis sedes</option>
          {venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
        </select>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{appointments.length} citas</p>
        <button type="button" onClick={() => void reload()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar</button>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}
      {loading && <p role="status" className="text-sm text-slate-500">Cargando agenda…</p>}
      {!loading && !error && appointments.length === 0 && <section className="rounded-2xl border border-slate-100 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800"><CalendarDays className="mx-auto h-8 w-8 text-[#006399]" /><p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">No hay citas aprobadas en este rango</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prueba otra fecha o sede.</p></section>}
      {!loading && appointments.map((appointment) => {
        const canClose = new Date(appointment.startsAt).getTime() < Date.now();
        const busy = busyId === appointment.id;
        return <article key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-medium text-slate-400">Cita #{appointment.id}</p><h3 className="mt-1 text-sm font-bold text-[#002a54] dark:text-slate-100">{appointment.specialtyName}</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Aprobada</span></div>
          <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#006399]" />{appointment.patientName}</p>
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#006399]" />{formatBogotaDate(appointment.startsAt)} · {formatBogotaTime(appointment.startsAt)} · {appointment.durationMinutes} min</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#006399]" />{appointment.venueName ?? 'Sede no registrada'}</p>
          </div>
          {canClose ? <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => void closeAppointment(appointment, 'COMPLETED')} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#134074] px-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Atendida</button>
            <button type="button" onClick={() => void closeAppointment(appointment, 'NO_SHOW')} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-2 text-xs font-bold text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300"><XCircle className="h-4 w-4" />No asistió</button>
          </div> : <p className="mt-4 inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"><Stethoscope className="h-4 w-4" />El resultado se habilitará después de la hora de inicio.</p>}
        </article>;
      })}
    </main>
  );
}
