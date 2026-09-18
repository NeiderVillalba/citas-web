import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Volume2, 
  Vibrate, 
  Clock, 
  Moon, 
  Send, 
  Check, 
  Trash2, 
  CheckCheck, 
  Sparkles, 
  AlertTriangle,
  Play,
  Pill,
  Calendar,
  FileText,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { PushNotificationConfig, InAppPushNotification, ScreenType } from '../types';
import { playPushNotificationSound, triggerHaptic } from '../utils/audio';

interface NotificationsViewProps {
  config: PushNotificationConfig;
  onUpdateConfig: (newConfig: PushNotificationConfig) => void;
  notifications: InAppPushNotification[];
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onTriggerTestNotification: (title: string, body: string, category: InAppPushNotification['category']) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  config,
  onUpdateConfig,
  notifications,
  onMarkAllRead,
  onClearNotifications,
  onTriggerTestNotification,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'inbox'>('config');
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermissionStatus(res);
        triggerHaptic('success');
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleToggle = (key: keyof PushNotificationConfig) => {
    triggerHaptic('light');
    const updated = { ...config, [key]: !config[key] };
    onUpdateConfig(updated);
  };

  const handleTestSound = () => {
    triggerHaptic('light');
    playPushNotificationSound(config.soundType);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 flex flex-col gap-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100 tracking-tight">
          Notificaciones Push
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configuración avanzada de canales, sonidos y avisos sanitarios
        </p>
      </div>

      {/* Segmented Control */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('config');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'config'
              ? 'bg-white dark:bg-slate-700 text-[#002a54] dark:text-sky-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Ajustes de Push</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('inbox');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'inbox'
              ? 'bg-white dark:bg-slate-700 text-[#002a54] dark:text-sky-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Bandeja de Avisos ({notifications.filter(n => !n.read).length})</span>
        </button>
      </div>

      {/* Tab: Configuration */}
      {activeTab === 'config' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Master Switch Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-700 text-[#006399] dark:text-sky-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Notificaciones Push
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {config.enabled ? 'Avisos instantáneos activados' : 'Silenciadas globalmente'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={() => handleToggle('enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#134074]" />
            </label>
          </div>

          {/* Test Push Simulator Banner Button */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl p-4 border border-blue-100/60 dark:border-slate-700 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#002a54] dark:text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulador de Push en Tiempo Real</span>
              </span>
              <span className="text-[10px] text-slate-400">Prueba inmediata</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Pulsa para emitir una notificación push con banner deslizable, sonido y vibración.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onTriggerTestNotification(
                    '🩺 Cita confirmada con Dra. Carmen Varela',
                    'Tu videoconsulta de Cardiología está lista. Conéctate con 5 minutos de antelación.',
                    'appointment'
                  );
                }}
                className="flex-1 h-9 rounded-xl bg-[#134074] hover:bg-[#002a54] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Aviso de Cita</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onTriggerTestNotification(
                    '💊 Recordatorio: Enalapril Cinfa 10mg',
                    'Es hora de tu toma matutina programada con un vaso de agua.',
                    'medication'
                  );
                }}
                className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Aviso de Receta</span>
              </button>
            </div>
          </div>

          {/* Sound & Haptic Preferences */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Sonido y Vibración
            </h4>

            {/* Sound toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#006399] dark:text-sky-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Sonido de notificación
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.sound}
                onChange={() => handleToggle('sound')}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>

            {/* Tone selector */}
            {config.sound && (
              <div className="flex items-center justify-between pl-7 pr-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tono clínico:
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={config.soundType}
                    onChange={(e) => {
                      const newType = e.target.value as PushNotificationConfig['soundType'];
                      onUpdateConfig({ ...config, soundType: newType });
                      playPushNotificationSound(newType);
                    }}
                    className="text-xs font-semibold py-1 px-2.5 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none"
                  >
                    <option value="clinical">Clínico Suave (Recomendado)</option>
                    <option value="gentle">Campana Serena</option>
                    <option value="chime">Armónico Triple</option>
                    <option value="silent">Silencioso</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleTestSound}
                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-slate-700 text-[#006399] dark:text-sky-400 hover:bg-blue-100"
                    title="Reproducir muestra"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            )}

            {/* Vibration toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Vibrate className="w-4 h-4 text-[#006399] dark:text-sky-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Vibración háptica
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.vibration}
                onChange={() => {
                  handleToggle('vibration');
                  triggerHaptic('success');
                }}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>
          </div>

          {/* Granular Channels */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Canales de Alerta
            </h4>

            {/* Channel: Appointment Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Recordatorio de citas
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Avisos anticipados de consultas
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.appointmentReminders}
                onChange={() => handleToggle('appointmentReminders')}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>

            {/* Antelación select */}
            {config.appointmentReminders && (
              <div className="flex items-center justify-between pl-7 pr-1 bg-slate-50 dark:bg-slate-750 p-2 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Antelación de aviso:
                </span>
                <select
                  value={config.reminderTiming}
                  onChange={(e) => {
                    onUpdateConfig({ ...config, reminderTiming: e.target.value as any });
                  }}
                  className="text-xs font-semibold py-1 px-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <option value="24h">24 horas antes</option>
                  <option value="2h">2 horas antes</option>
                  <option value="1h">1 hora antes</option>
                  <option value="15min">15 minutos antes</option>
                </select>
              </div>
            )}

            {/* Channel: Medication */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Tomas de medicación
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Recordatorios de dosis prescritas
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.medicationReminders}
                onChange={() => handleToggle('medicationReminders')}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>

            {/* Channel: Lab Results */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Informes y analíticas
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Cuando el doctor firme un informe
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.labResults}
                onChange={() => handleToggle('labResults')}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>

            {/* Channel: Urgencias */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Alertas médicas urgentes
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Reprogramaciones o comunicados del hospital
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.urgentAlerts}
                onChange={() => handleToggle('urgentAlerts')}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Horario Silencioso (No Molestar)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Silenciar avisos no urgentes por la noche
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.quietHoursEnabled}
                onChange={() => handleToggle('quietHoursEnabled')}
                className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
              />
            </div>

            {config.quietHoursEnabled && (
              <div className="flex items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Desde:</span>
                  <input
                    type="time"
                    value={config.quietHoursStart}
                    onChange={(e) => onUpdateConfig({ ...config, quietHoursStart: e.target.value })}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 font-semibold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Hasta:</span>
                  <input
                    type="time"
                    value={config.quietHoursEnd}
                    onChange={(e) => onUpdateConfig({ ...config, quietHoursEnd: e.target.value })}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 font-semibold"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab: Inbox */}
      {activeTab === 'inbox' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Historial de avisos recibidos
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs text-[#006399] dark:text-sky-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Leídas</span>
              </button>

              <button
                type="button"
                onClick={onClearNotifications}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-400">No hay notificaciones pendientes</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.targetScreen) onNavigate(n.targetScreen);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  n.read 
                    ? 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/60 opacity-80' 
                    : 'bg-blue-50/50 dark:bg-slate-800 border-blue-200/60 dark:border-slate-600 shadow-xs'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.category === 'appointment' ? 'bg-blue-100 text-blue-700' :
                  n.category === 'medication' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-sky-100 text-sky-700'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {n.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {n.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};
