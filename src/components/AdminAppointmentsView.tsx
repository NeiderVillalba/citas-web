import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Check, Clock3, MapPin, RefreshCw, UserRound, X } from 'lucide-react';
import { ApiError, citasApi } from '../api/citasApi';
import type { AdminAppointment } from '../api/citasApi';
import { formatBogotaDate, formatBogotaTime } from '../utils/appointmentTime';

export function AdminAppointmentsView() {
  const [items, setItems] = useState<AdminAppointment[]>([]);
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await citasApi.getPendingAppointments());
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function decide(item: AdminAppointment, approve: boolean) {
    const reason = reasons[item.appointment.id]?.trim() ?? '';
    if (!approve && !reason) return;
    setBusyId(item.appointment.id);
    setError('');
    setNotice('');
    try {
      await citasApi.decideAppointment(item.appointment.id, approve, approve ? undefined : reason);
      setNotice(approve ? 'La cita fue aprobada.' : 'La solicitud fue rechazada y el horario quedó libre.');
      setItems((current) => current.filter(({ appointment }) => appointment.id !== item.appointment.id));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible actualizar la solicitud.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Administración</p>
          <h2 className="mt-1 text-xl font-bold text-[#002a54] dark:text-slate-100">Solicitudes de cita</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revisa solicitudes especializadas pendientes.</p>
        </div>
        <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-[#006399] dark:bg-slate-800 dark:text-sky-300">{items.length}</span>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</p>}
      <button type="button" onClick={() => void reload()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 self-end rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar
      </button>

      {loading && <p role="status" className="text-sm text-slate-500">Cargando solicitudes…</p>}
      {!loading && !error && items.length === 0 && (
        <section className="rounded-2xl border border-slate-100 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="mx-auto h-8 w-8 text-[#006399]" />
          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">No hay solicitudes pendientes</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Las nuevas solicitudes aparecerán aquí.</p>
        </section>
      )}

      {!loading && items.map((item) => {
        const appointment = item.appointment;
        const busy = busyId === appointment.id;
        return (
          <article key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Solicitud #{appointment.id}</p>
                <h3 className="mt-1 text-sm font-bold text-[#002a54] dark:text-slate-100">{appointment.specialtyName}</h3>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Pendiente</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#006399]" />Paciente: {item.patientName}</p>
              <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#006399]" />{appointment.professionalName}</p>
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#006399]" />{formatBogotaDate(appointment.startsAt)} · {formatBogotaTime(appointment.startsAt)} · {appointment.durationMinutes} min</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#006399]" />{appointment.venueName ?? 'Sede no registrada'}</p>
            </div>
            <label className="mt-4 block text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor={`reason-${appointment.id}`}>Motivo de rechazo</label>
            <textarea id={`reason-${appointment.id}`} value={reasons[appointment.id] ?? ''} onChange={(event) => setReasons((current) => ({ ...current, [appointment.id]: event.target.value }))} maxLength={1000} rows={2} placeholder="Obligatorio para rechazar" className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:border-[#006399] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void decide(item, true)} disabled={busy || loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#134074] px-3 text-xs font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" />Aprobar</button>
              <button type="button" onClick={() => void decide(item, false)} disabled={busy || loading || !(reasons[appointment.id]?.trim())} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-xs font-bold text-red-700 disabled:opacity-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-300"><X className="h-4 w-4" />Rechazar</button>
            </div>
            {busy && <p role="status" className="mt-2 text-center text-xs text-slate-500">Guardando decisión…</p>}
          </article>
        );
      })}
    </main>
  );
}
