import { CalendarPlus, CalendarDays, Clock3, MapPin, ArrowRight, HeartPulse } from 'lucide-react';
import type { MyAppointment } from '../api/citasApi';
import { formatBogotaDate, formatBogotaTime } from '../utils/appointmentTime';

interface DashboardViewProps {
  userName: string;
  appointments: MyAppointment[];
  loading: boolean;
  error: string;
  onNavigate: (screen: 'booking' | 'history') => void;
  onReload: () => void;
}

export function DashboardView({ userName, appointments, loading, error, onNavigate, onReload }: DashboardViewProps) {
  const next = [...appointments]
    .filter((appointment) => (appointment.status === 'APPROVED' || appointment.status === 'REQUESTED')
      && new Date(appointment.startsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  return (
    <main className="w-full max-w-md mx-auto px-4 pt-5 pb-24 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Portal de citas</p>
          <h2 className="mt-1 text-xl font-bold text-[#002a54] dark:text-slate-100">Hola, {userName.split(' ')[0]}</h2>
        </div>
        <span className="rounded-full bg-blue-50 p-2.5 text-[#006399] dark:bg-slate-800 dark:text-sky-300"><HeartPulse className="w-5 h-5" /></span>
      </div>

      {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">{error} <button type="button" onClick={onReload} className="ml-2 font-bold underline">Reintentar</button></div>}
      {loading && <p role="status" className="text-sm text-slate-500">Cargando tus citas…</p>}

      {!loading && !error && (next ? (
        <section className="rounded-2xl bg-gradient-to-br from-[#134074] to-[#002a54] p-5 text-white shadow-[0_8px_25px_rgba(0,42,84,0.14)]">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">{next.status === 'APPROVED' ? 'Aprobada' : 'Solicitada'}</span>
            <CalendarDays className="w-5 h-5 text-sky-200" />
          </div>
          <h3 className="mt-4 text-lg font-bold">{next.specialtyName}</h3>
          <p className="mt-1 text-sm text-sky-100">{next.professionalName}</p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-white/90">
            <p className="flex items-center gap-2"><Clock3 className="w-4 h-4" />{formatBogotaDate(next.startsAt)} · {formatBogotaTime(next.startsAt)} · {next.durationMinutes} min</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{next.venueName ?? 'Sede no registrada'}</p>
          </div>
          <button type="button" onClick={() => onNavigate('history')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#002a54]">Ver detalle <ArrowRight className="w-4 h-4" /></button>
        </section>
      ) : (
        <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="w-7 h-7 text-[#006399] dark:text-sky-300" />
          <h3 className="mt-3 text-base font-bold text-[#002a54] dark:text-slate-100">No tienes citas próximas</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Busca un horario disponible y solicita una cita.</p>
        </section>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onNavigate('booking')} className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <span className="inline-flex rounded-xl bg-blue-50 p-2.5 text-[#006399] dark:bg-slate-700 dark:text-sky-300"><CalendarPlus className="w-5 h-5" /></span>
          <span className="mt-3 block text-sm font-bold text-slate-800 dark:text-slate-100">Pedir cita</span>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Consulta horarios reales</span>
        </button>
        <button type="button" onClick={() => onNavigate('history')} className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <span className="inline-flex rounded-xl bg-blue-50 p-2.5 text-[#006399] dark:bg-slate-700 dark:text-sky-300"><CalendarDays className="w-5 h-5" /></span>
          <span className="mt-3 block text-sm font-bold text-slate-800 dark:text-slate-100">Mis citas</span>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Revisa su estado</span>
        </button>
      </div>
    </main>
  );
}
