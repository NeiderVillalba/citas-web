import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  User, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Doctor, Appointment, ScreenType } from '../types';
import { SPECIALTIES } from '../data/mockData';
import { triggerHaptic, playPushNotificationSound } from '../utils/audio';

interface BookingViewProps {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookSuccess: (newApt: Appointment) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onBookSuccess,
  onNavigate,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Cardiología');
  const [activeDoctor, setActiveDoctor] = useState<Doctor>(selectedDoctor || doctors[0]);
  
  // Date selection (interactive next 7 days)
  const [selectedDateIndex, setSelectedDateIndex] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:15');
  const [consultationType, setConsultationType] = useState<'presencial' | 'videoconsulta'>('videoconsulta');
  const [reason, setReason] = useState('Revisión rutinaria y control de analítica');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedModal, setConfirmedModal] = useState(false);

  // Generate 7 days starting today
  const dates = [
    { day: 'Mié', date: '16 Sep', full: '2026-09-16', available: true },
    { day: 'Jue', date: '17 Sep', full: '2026-09-17', available: true },
    { day: 'Vie', date: '18 Sep', full: '2026-09-18', available: true },
    { day: 'Sáb', date: '19 Sep', full: '2026-09-19', available: false },
    { day: 'Lun', date: '21 Sep', full: '2026-09-21', available: true },
    { day: 'Mar', date: '22 Sep', full: '2026-09-22', available: true },
    { day: 'Mié', date: '23 Sep', full: '2026-09-23', available: true },
  ];

  const morningSlots = ['09:00', '09:45', '10:30', '11:15', '12:00'];
  const afternoonSlots = ['16:00', '16:45', '17:30', '18:15', '19:00'];

  const filteredDoctors = doctors.filter(
    (doc) => doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
  );

  const activeDocToUse = filteredDoctors.length > 0 ? (filteredDoctors.find(d => d.id === activeDoctor.id) || filteredDoctors[0]) : activeDoctor;

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    triggerHaptic('light');

    setTimeout(() => {
      setIsSubmitting(false);
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        doctorId: activeDocToUse.id,
        doctorName: activeDocToUse.name,
        doctorSpecialty: activeDocToUse.specialty,
        doctorAvatar: activeDocToUse.avatarUrl,
        hospital: activeDocToUse.hospital,
        date: dates[selectedDateIndex].full,
        time: selectedTimeSlot,
        type: consultationType,
        status: 'confirmada',
        notes: reason,
        roomNumber: consultationType === 'videoconsulta' ? 'Sala Virtual Segura 02' : 'Consulta 108',
        isSoon: true,
      };

      playPushNotificationSound('clinical');
      triggerHaptic('success');
      onBookSuccess(newAppointment);
      setConfirmedModal(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 flex flex-col gap-4">
      {/* Title & Step Header */}
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100 tracking-tight">
          Agendar Nueva Cita
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Elige especialista, modalidad y horario de atención
        </p>
      </div>

      {/* Specialty Filter Scroll */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          1. Especialidad
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty.toLowerCase() === spec.name.toLowerCase() || 
              (spec.id === 'cardio' && selectedSpecialty === 'Cardiología');
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedSpecialty(spec.name);
                }}
                className={`snap-start shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#134074] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{spec.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctor Card Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          2. Especialista asignado
        </label>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center gap-3">
          <img 
            src={activeDocToUse.avatarUrl} 
            alt={activeDocToUse.name} 
            className="w-13 h-13 rounded-xl object-cover ring-2 ring-blue-50 dark:ring-slate-700"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {activeDocToUse.name}
              </h4>
              <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{activeDocToUse.rating}</span>
              </div>
            </div>
            <p className="text-xs text-[#006399] dark:text-sky-400 font-medium truncate">
              {activeDocToUse.specialty}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {activeDocToUse.hospital}
            </p>
          </div>
        </div>
      </div>

      {/* Modality: Presencial vs Videoconsulta */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          3. Modalidad de consulta
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setConsultationType('videoconsulta');
            }}
            className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
              consultationType === 'videoconsulta'
                ? 'bg-blue-50/90 dark:bg-slate-800 border-[#006399] dark:border-sky-400 text-[#002a54] dark:text-sky-300 ring-2 ring-[#006399]/15'
                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Video className="w-5 h-5 text-[#006399] dark:text-sky-400" />
            <span className="text-xs font-bold">Videoconsulta</span>
            <span className="text-[10px] text-slate-400">Desde tu móvil u ordenador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setConsultationType('presencial');
            }}
            className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
              consultationType === 'presencial'
                ? 'bg-blue-50/90 dark:bg-slate-800 border-[#006399] dark:border-sky-400 text-[#002a54] dark:text-sky-300 ring-2 ring-[#006399]/15'
                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-5 h-5 text-[#006399] dark:text-sky-400" />
            <span className="text-xs font-bold">Presencial</span>
            <span className="text-[10px] text-slate-400">En clínica hospitalaria</span>
          </button>
        </div>
      </div>

      {/* Date Carousel (Interactive Days) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            4. Fecha disponible
          </label>
          <span className="text-[11px] text-[#006399] dark:text-sky-400 font-medium">
            Septiembre 2026
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x">
          {dates.map((d, index) => {
            const isSelected = selectedDateIndex === index;
            return (
              <button
                key={d.full}
                type="button"
                disabled={!d.available}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedDateIndex(index);
                }}
                className={`snap-start shrink-0 w-16 py-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                  !d.available
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#134074] text-white shadow-md ring-2 ring-[#134074]/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <span className="text-[11px] font-medium opacity-80">{d.day}</span>
                <span className="text-sm font-bold mt-0.5">{d.date.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70">{d.date.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Chips */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          5. Hora de la cita
        </label>

        {/* Morning */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium">Mañana</span>
          <div className="grid grid-cols-5 gap-1.5">
            {morningSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedTimeSlot(slot);
                }}
                className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeSlot === slot
                    ? 'bg-[#006399] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Afternoon */}
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[11px] text-slate-400 font-medium">Tarde</span>
          <div className="grid grid-cols-5 gap-1.5">
            {afternoonSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedTimeSlot(slot);
                }}
                className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeSlot === slot
                    ? 'bg-[#006399] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Motivo de consulta */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Motivo o síntomas (opcional)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ej. Revisión de tensión, dolor articular..."
          className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399]"
        />
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50/70 dark:bg-slate-800/60 rounded-xl p-3 border border-blue-100/50 dark:border-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#006399] dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          <span>Se enviará un </span>
          <strong className="text-[#002a54] dark:text-sky-300 font-semibold">aviso push instantáneo</strong>
          <span> y recordatorio 2 horas antes de la cita. Podrás modificar o cancelar sin coste hasta 4 horas antes.</span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleConfirmBooking}
        className="w-full h-12 rounded-xl bg-[#134074] hover:bg-[#002a54] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
      >
        <span>{isSubmitting ? 'Confirmando con el centro...' : 'Confirmar Reserva Médica'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Success Modal */}
      {confirmedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                ¡Cita Confirmada!
              </span>
              <h3 className="text-lg font-bold text-[#002a54] dark:text-slate-100 mt-1">
                {activeDocToUse.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {dates[selectedDateIndex].full} a las {selectedTimeSlot} hrs ({consultationType === 'videoconsulta' ? 'Videoconsulta' : 'Presencial'})
              </p>
            </div>

            <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
              🔔 Hemos programado una notificación push de recordatorio para que no olvides tu cita.
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setConfirmedModal(false);
                onNavigate('dashboard');
              }}
              className="w-full h-11 rounded-xl bg-[#134074] hover:bg-[#002a54] text-white font-semibold text-xs transition-all shadow-sm"
            >
              Ir a Mis Citas
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
