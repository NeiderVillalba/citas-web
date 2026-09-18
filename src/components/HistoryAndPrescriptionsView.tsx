import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Pill, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Download, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import { Prescription, MedicalRecord } from '../types';
import { triggerHaptic, playPushNotificationSound } from '../utils/audio';

interface HistoryAndPrescriptionsViewProps {
  prescriptions: Prescription[];
  records: MedicalRecord[];
  onToggleTakePrescription: (id: string) => void;
}

export const HistoryAndPrescriptionsView: React.FC<HistoryAndPrescriptionsViewProps> = ({
  prescriptions,
  records,
  onToggleTakePrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'records'>('prescriptions');
  const [activeQrModal, setActiveQrModal] = useState<Prescription | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<MedicalRecord | null>(null);

  const handleDownloadPdf = (rec: MedicalRecord) => {
    triggerHaptic('success');
    playPushNotificationSound('gentle');
    alert(`Descargando informe clínico seguro "${rec.diagnosis}" en formato PDF firmado digitalmente.`);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 flex flex-col gap-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100 tracking-tight">
          Historial & Recetas
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tratamientos farmacológicos activos e informes sanitarios
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('prescriptions');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'prescriptions'
              ? 'bg-white dark:bg-slate-700 text-[#002a54] dark:text-sky-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Recetas Activas ({prescriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('records');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'records'
              ? 'bg-white dark:bg-slate-700 text-[#002a54] dark:text-sky-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Informes Clínicos ({records.length})</span>
        </button>
      </div>

      {/* Tab 1: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dispensación electrónica directa con código QR
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Válidas en farmacia
            </span>
          </div>

          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-700 text-[#006399] dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {rx.medicationName}
                    </h4>
                    <p className="text-xs text-[#006399] dark:text-sky-400 font-medium mt-0.5">
                      {rx.dosage}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {rx.instructions}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-slate-700 text-[#006399] dark:text-sky-400 shrink-0">
                  {rx.remainingDays} días rest.
                </span>
              </div>

              {/* Meta & Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Pautado por: </span>
                  <strong className="text-slate-600 dark:text-slate-300 font-medium">
                    {rx.prescribedBy}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Take medication check toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      onToggleTakePrescription(rx.id);
                    }}
                    className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      rx.takenToday
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {rx.takenToday ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tomada hoy</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tomar</span>
                      </>
                    )}
                  </button>

                  {/* QR Pharmacy Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveQrModal(rx);
                    }}
                    className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-slate-700 text-[#006399] dark:text-sky-400 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    title="Ver código QR para farmacia"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tab 2: Medical Reports */}
      {activeTab === 'records' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-2.5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-slate-700 text-[#006399] dark:text-sky-300">
                  {rec.specialty}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {rec.date}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {rec.diagnosis}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {rec.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {rec.doctorName}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveReportModal(rec);
                    }}
                    className="text-xs text-[#006399] dark:text-sky-400 font-semibold hover:underline"
                  >
                    Leer informe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(rec)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Descargar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* QR Code Pharmacy Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl p-6 flex flex-col items-center text-center gap-3 shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#006399] dark:text-sky-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Dispensación en Farmacia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeQrModal.medicationName}
              </p>
            </div>

            {/* Generated QR visual */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
              <div className="w-44 h-44 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden">
                {/* SVG pattern replicating dense QR */}
                <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        i % 2 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-slate-800'
                      }`} 
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-md">
                    <Pill className="w-full h-full text-[#134074]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Muestra este código al farmacéutico junto a tu documento DNI / NIE.
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveQrModal(null);
              }}
              className="w-full h-10 rounded-xl bg-[#134074] hover:bg-[#002a54] text-white font-semibold text-xs"
            >
              Cerrar Código
            </button>
          </motion.div>
        </div>
      )}

      {/* Medical Report Detail Modal */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl p-5 flex flex-col text-left gap-3.5 shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#006399] dark:text-sky-400 uppercase tracking-wider">
                Informe Clínico Oficial
              </span>
              <span className="text-xs text-slate-400">
                {activeReportModal.date}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {activeReportModal.diagnosis}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeReportModal.doctorName} • {activeReportModal.facility}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
              {activeReportModal.summary}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadPdf(activeReportModal)}
                className="flex-1 h-10 rounded-xl bg-[#134074] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#002a54]"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="px-4 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
