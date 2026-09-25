import { useState } from 'react';
import { CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react';
import type { MyAppointment } from '../api/citasApi';
import { formatBogotaDate, formatBogotaTime } from '../utils/appointmentTime';

interface MyAppointmentsViewProps {
  appointments: MyAppointment[];
  loading: boolean;
  error: string;
  onReload: () => void;
  onBook: () => void;
}

export function MyAppointmentsView({ appointments, loading, error, onReload, onBook }: MyAppointmentsViewProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const now = Date.now();
  const shown = appointments.filter((appointment) => filter === 'all'
    || (filter === 'upcoming' && new Date(appointment.startsAt).getTime() >= now)
    || (filter === 'past' && new Date(appointment.startsAt).getTime() < now));

  return (
    <main className="w-full max-w-md mx-auto px-4 pt-4 pb-24 flex flex-col gap-4">
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
      {loading && <p role="status" className="text-sm text-slate-500">Cargando citas…</p>}
      {!loading && !error && shown.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="mx-auto w-8 h-8 text-[#006399]" />
          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">No hay citas en esta vista</p>
          <button type="button" onClick={onBook} className="mt-4 rounded-xl bg-[#134074] px-4 py-2.5 text-xs font-bold text-white">Buscar disponibilidad</button>
        </div>
      )}
      {!loading && !error && shown.map((appointment) => (
        <article key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Cita #{appointment.id}</p>
              <h3 className="mt-1 text-sm font-bold text-[#002a54] dark:text-slate-100">{appointment.specialtyName}</h3>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${appointment.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}`}>{appointment.status === 'APPROVED' ? 'Aprobada' : 'Solicitada'}</span>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-2"><UserRound className="w-4 h-4 text-[#006399]" />{appointment.professionalName}</p>
            <p className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-[#006399]" />{formatBogotaDate(appointment.startsAt)} · {formatBogotaTime(appointment.startsAt)} · {appointment.durationMinutes} min</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#006399]" />{appointment.venueName ?? 'Sede no registrada'}</p>
            {appointment.venueAddress && <p className="pl-6 text-slate-500">{appointment.venueAddress}</p>}
          </div>
        </article>
      ))}
    </main>
  );
}
