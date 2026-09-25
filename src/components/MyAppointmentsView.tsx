import { useState } from 'react';
import { CalendarDays, Clock3, History, MapPin, UserRound, XCircle } from 'lucide-react';
import { ApiError, citasApi } from '../api/citasApi';
import type { AppointmentHistoryEntry, MyAppointment } from '../api/citasApi';
import { formatBogotaDate, formatBogotaTime } from '../utils/appointmentTime';

interface MyAppointmentsViewProps {
  appointments: MyAppointment[];
  loading: boolean;
  error: string;
  onReload: () => void;
  onBook: () => void;
}

const statusLabels: Record<MyAppointment['status'], string> = {
  APPROVED: 'Aprobada', REQUESTED: 'Solicitada', REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada', COMPLETED: 'Atendida', NO_SHOW: 'No asistió',
};

function statusStyle(status: MyAppointment['status']) {
  if (status === 'APPROVED' || status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  if (status === 'REQUESTED') return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

export function MyAppointmentsView({ appointments, loading, error, onReload, onBook }: MyAppointmentsViewProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [openHistoryId, setOpenHistoryId] = useState<number | null>(null);
  const [history, setHistory] = useState<Record<number, AppointmentHistoryEntry[]>>({});
  const [historyLoadingId, setHistoryLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const now = Date.now();
  const shown = appointments.filter((appointment) => filter === 'all'
    || (filter === 'upcoming' && new Date(appointment.startsAt).getTime() >= now)
    || (filter === 'past' && new Date(appointment.startsAt).getTime() < now));

  async function cancel(appointment: MyAppointment) {
    if (!window.confirm(`¿Cancelar la cita de ${appointment.specialtyName} el ${formatBogotaDate(appointment.startsAt)}?`)) return;
    setCancelId(appointment.id);
    setActionError('');
    try {
      await citasApi.cancelAppointment(appointment.id);
      onReload();
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : 'No fue posible cancelar la cita.');
    } finally {
      setCancelId(null);
    }
  }

  async function toggleHistory(id: number) {
    if (openHistoryId === id) {
      setOpenHistoryId(null);
      return;
    }
    setOpenHistoryId(id);
    if (history[id]) return;
    setHistoryLoadingId(id);
    setActionError('');
    try {
      const entries = await citasApi.getAppointmentHistory(id);
      setHistory((current) => ({ ...current, [id]: entries }));
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : 'No fue posible cargar el historial.');
    } finally {
      setHistoryLoadingId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-24 pt-4">
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100">Mis citas</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Consulta tus solicitudes y citas registradas.</p>
      </div>
      <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {([['all', 'Todas'], ['upcoming', 'Próximas'], ['past', 'Pasadas']] as const).map(([value, label]) =>
          <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
            className={`rounded-lg py-2 text-xs font-semibold ${filter === value ? 'bg-white text-[#002a54] shadow-xs dark:bg-slate-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>{label}</button>)}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{error} <button type="button" onClick={onReload} className="font-bold underline">Reintentar</button></p>}
      {actionError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{actionError}</p>}
      {loading && <p role="status" className="text-sm text-slate-500">Cargando citas…</p>}
      {!loading && !error && shown.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="mx-auto h-8 w-8 text-[#006399]" />
          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">No hay citas en esta vista</p>
          <button type="button" onClick={onBook} className="mt-4 rounded-xl bg-[#134074] px-4 py-2.5 text-xs font-bold text-white">Buscar disponibilidad</button>
        </div>
      )}
      {!loading && !error && shown.map((appointment) => {
        const future = new Date(appointment.startsAt).getTime() > Date.now();
        const canCancel = future && (appointment.status === 'APPROVED' || appointment.status === 'REQUESTED');
        return (
          <article key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Cita #{appointment.id}</p>
                <h3 className="mt-1 text-sm font-bold text-[#002a54] dark:text-slate-100">{appointment.specialtyName}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle(appointment.status)}`}>{statusLabels[appointment.status]}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#006399]" />{appointment.professionalName}</p>
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#006399]" />{formatBogotaDate(appointment.startsAt)} · {formatBogotaTime(appointment.startsAt)} · {appointment.durationMinutes} min</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#006399]" />{appointment.venueName ?? 'Sede no registrada'}</p>
              {appointment.venueAddress && <p className="pl-6 text-slate-500">{appointment.venueAddress}</p>}
            </div>
            {appointment.status === 'REJECTED' && appointment.rejectionReason && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200"><strong>Motivo de rechazo:</strong> {appointment.rejectionReason}</p>}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => void toggleHistory(appointment.id)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"><History className="h-4 w-4" />{openHistoryId === appointment.id ? 'Ocultar historial' : 'Ver historial'}</button>
              {canCancel && <button type="button" onClick={() => void cancel(appointment)} disabled={cancelId === appointment.id} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300"><XCircle className="h-4 w-4" />{cancelId === appointment.id ? 'Cancelando…' : 'Cancelar'}</button>}
            </div>
            {openHistoryId === appointment.id && <div className="mt-3 border-l-2 border-blue-100 pl-3 dark:border-slate-600">
              {historyLoadingId === appointment.id && <p role="status" className="text-xs text-slate-500">Cargando historial…</p>}
              {(history[appointment.id] ?? []).map((entry) => <div key={entry.id} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{statusLabels[entry.status]} · {entry.source}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{formatBogotaDate(entry.changedAt)} · {formatBogotaTime(entry.changedAt)}</p>
                {entry.reason && <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">{entry.reason}</p>}
              </div>)}
              {history[appointment.id]?.length === 0 && <p className="text-xs text-slate-500">Sin eventos de historial.</p>}
            </div>}
          </article>
        );
      })}
    </main>
  );
}
