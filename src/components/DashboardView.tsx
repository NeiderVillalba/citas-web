import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Video, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Plus, 
  Pill, 
  PhoneCall, 
  Star, 
  ChevronRight, 
  Activity, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { Appointment, Doctor, ScreenType } from '../types';
import { SPECIALTIES } from '../data/mockData';
import { triggerHaptic, playPushNotificationSound } from '../utils/audio';

interface DashboardViewProps {
  userName: string;
  appointments: Appointment[];
  doctors: Doctor[];
  onNavigate: (screen: ScreenType) => void;
  onSelectDoctorForBooking: (doctor: Doctor) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  appointments,
  doctors,
  onNavigate,
  onSelectDoctorForBooking,
}) => {
  const [inCallModal, setInCallModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const nextAppointment = appointments[0];

  const handleJoinVideo = () => {
    triggerHaptic('success');
    playPushNotificationSound('clinical');
    setInCallModal(true);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 flex flex-col gap-5">
      {/* Patient Greeting & Date */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Miércoles, 16 de Septiembre</span>
          </div>
          <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100 tracking-tight">
            Hola, {userName.split(' ')[0]} 👋
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Seguro Activo</span>
        </div>
      </div>

      {/* Hero: Next Appointment Card */}
      {nextAppointment && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-br from-[#134074] to-[#002a54] rounded-2xl p-4 text-white shadow-[0_8px_25px_rgba(0,42,84,0.14)] relative overflow-hidden flex flex-col gap-3"
        >
          {/* Subtle decorative medical pulse line in background */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-xs">
              {nextAppointment.type === 'videoconsulta' ? (
                <>
                  <Video className="w-3.5 h-3.5 text-sky-300" />
                  <span>Telemedicina en 25 min</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-sky-300" />
                  <span>Consulta Presencial</span>
                </>
              )}
            </div>

            <span className="text-xs text-sky-200 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{nextAppointment.date} • {nextAppointment.time}</span>
            </span>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center gap-3">
            <img 
              src={nextAppointment.doctorAvatar} 
              alt={nextAppointment.doctorName}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/30"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm tracking-tight text-white truncate">
                {nextAppointment.doctorName}
              </h3>
              <p className="text-xs text-sky-200 truncate">
                {nextAppointment.doctorSpecialty}
              </p>
              <p className="text-[11px] text-white/70 truncate mt-0.5">
                {nextAppointment.roomNumber || nextAppointment.hospital}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {nextAppointment.type === 'videoconsulta' ? (
              <button
                type="button"
                onClick={handleJoinVideo}
                className="flex-1 h-10 rounded-xl bg-white text-[#002a54] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-sky-50 active:scale-98 transition-all shadow-sm"
              >
                <Video className="w-4 h-4 text-[#006399]" />
                <span>Entrar a Sala Virtual</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="flex-1 h-10 rounded-xl bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/30 active:scale-98 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Ver Cómo Llegar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="px-3.5 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              Detalles
            </button>
          </div>
        </motion.div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('booking');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:border-blue-200 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-700 text-[#006399] dark:text-sky-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Nueva Cita
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('history');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:border-blue-200 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Recetas
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('notifications');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:border-blue-200 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Avisos Push
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('warning');
            alert('Línea de Urgencias MedCitas 24 horas: 900 112 000. Si se trata de una emergencia vital extrema, llame al 112.');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:border-red-200 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-slate-700 text-red-600 dark:text-red-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
            Urgencias
          </span>
        </button>
      </div>

      {/* Specialties Section with Touch-scrollable cards */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Especialidades Médicas
          </h3>
          <button 
            type="button" 
            onClick={() => onNavigate('booking')}
            className="text-xs text-[#006399] dark:text-sky-400 font-semibold flex items-center hover:underline"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x touch-pan-x">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedSpecialty(selectedSpecialty === spec.id ? null : spec.id);
                onNavigate('booking');
              }}
              className="snap-start shrink-0 w-28 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col items-center text-center gap-1.5 hover:border-blue-300 dark:hover:border-slate-600 transition-all active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-700/80 text-[#006399] dark:text-sky-400 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 leading-tight">
                {spec.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {spec.count} doctores
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Doctors Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Médicos Disponibles
          </h3>
          <span className="text-xs text-slate-400">
            Citas presenciales y online
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col gap-2.5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img 
                    src={doc.avatarUrl} 
                    alt={doc.name} 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  {doc.availableToday && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" title="Disponible hoy" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <span className="inline-block text-xs text-[#006399] dark:text-sky-400 font-medium">
                    {doc.specialty}
                  </span>

                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {doc.hospital}
                  </p>
                </div>
              </div>

              {/* Bottom Slot & Booking CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Próximo hueco</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {doc.nextSlot}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectDoctorForBooking(doc);
                    onNavigate('booking');
                  }}
                  className="h-8 px-3 rounded-lg bg-[#134074] hover:bg-[#002a54] text-white text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                >
                  <span>Agendar Cita</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Telemedicine Video Consultation Modal */}
      {inCallModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900 rounded-3xl p-5 text-white flex flex-col items-center text-center gap-4 relative overflow-hidden"
          >
            <div className="w-20 h-20 rounded-full border-4 border-[#006399] overflow-hidden relative">
              <img 
                src={nextAppointment.doctorAvatar} 
                alt="Doctor" 
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </div>

            <div>
              <span className="text-xs text-sky-400 uppercase tracking-widest font-semibold">
                Sala Segura MedCitas
              </span>
              <h3 className="text-lg font-bold mt-0.5">
                {nextAppointment.doctorName}
              </h3>
              <p className="text-xs text-slate-400">
                Conectando audio y video con cifrado SSL extremo a extremo...
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setInCallModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
              >
                Finalizar Llamada
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  alert('Micrófono y cámara verificados con éxito.');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Probar Cámara
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
