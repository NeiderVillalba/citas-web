import React from 'react';
import { motion } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Palette, 
  Type, 
  Fingerprint, 
  ShieldCheck, 
  LogOut, 
  BatteryCharging, 
  Sparkles,
  User,
  HeartPulse,
  Eye,
  Check,
  Smartphone
} from 'lucide-react';
import { ThemeSettings, UserProfile, ScreenType, AccentColor, ThemeMode, FontSizeOption } from '../types';
import { triggerHaptic } from '../utils/audio';

interface SettingsViewProps {
  user: UserProfile;
  themeSettings: ThemeSettings;
  onUpdateThemeSettings: (newSettings: ThemeSettings) => void;
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  themeSettings,
  onUpdateThemeSettings,
  onLogout,
  onNavigate,
}) => {
  const accents: { id: AccentColor; name: string; hex: string; bgClass: string }[] = [
    { id: 'blue', name: 'Azul Clínico', hex: '#134074', bgClass: 'bg-[#134074]' },
    { id: 'cyan', name: 'Cian Salud', hex: '#006399', bgClass: 'bg-[#006399]' },
    { id: 'emerald', name: 'Esmeralda Vital', hex: '#059669', bgClass: 'bg-[#059669]' },
    { id: 'indigo', name: 'Índigo Quirúrgico', hex: '#4f46e5', bgClass: 'bg-[#4f46e5]' },
  ];

  const handleModeChange = (mode: ThemeMode) => {
    triggerHaptic('light');
    onUpdateThemeSettings({ ...themeSettings, mode });
  };

  const handleAccentChange = (accent: AccentColor) => {
    triggerHaptic('light');
    onUpdateThemeSettings({ ...themeSettings, accent });
  };

  const handleFontSizeChange = (fontSize: FontSizeOption) => {
    triggerHaptic('light');
    onUpdateThemeSettings({ ...themeSettings, fontSize });
  };

  const handleToggleReducedMotion = () => {
    triggerHaptic('light');
    onUpdateThemeSettings({ ...themeSettings, reducedMotion: !themeSettings.reducedMotion });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 flex flex-col gap-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100 tracking-tight">
          Ajustes & Personalización
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Modo oscuro personalizable, accesibilidad y perfil sanitario
        </p>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#002a54] to-[#006399] text-white flex items-center justify-center font-bold text-xl shadow-sm ring-2 ring-blue-50 dark:ring-slate-700 shrink-0">
          {user.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {user.name}
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-blue-100 text-blue-800 dark:bg-slate-700 dark:text-sky-300">
              {user.bloodType}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user.email}
          </p>

          <p className="text-[11px] text-[#006399] dark:text-sky-400 font-medium truncate mt-0.5">
            {user.insuranceProvider} • Póliza #{user.policyNumber}
          </p>
        </div>
      </div>

      {/* Customizable Dark Mode Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#006399] dark:text-sky-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Modo Visual & Tema
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Personalizable</span>
        </div>

        {/* Mode Selector (Claro / Oscuro / Sistema) */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('light')}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
              themeSettings.mode === 'light'
                ? 'bg-blue-50 border-[#006399] text-[#002a54] font-bold ring-2 ring-[#006399]/15'
                : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs">Claro</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('dark')}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
              themeSettings.mode === 'dark'
                ? 'bg-slate-850 dark:bg-slate-700 border-sky-400 text-sky-300 font-bold ring-2 ring-sky-400/20'
                : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Moon className="w-4 h-4 text-sky-400" />
            <span className="text-xs">Oscuro Clínico</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('system')}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
              themeSettings.mode === 'system'
                ? 'bg-blue-50 dark:bg-slate-700 border-[#006399] dark:border-sky-400 text-[#002a54] dark:text-sky-300 font-bold ring-2 ring-[#006399]/15'
                : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span className="text-xs">Automático</span>
          </button>
        </div>

        {/* Accent Color Palette Customization */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#006399] dark:text-sky-400" />
              <span>Color de acento de la interfaz:</span>
            </span>
            <span className="text-[11px] text-slate-400 capitalize">
              {themeSettings.accent}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {accents.map((acc) => {
              const isSelected = themeSettings.accent === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleAccentChange(acc.id)}
                  className={`h-11 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                    isSelected
                      ? 'border-slate-800 dark:border-white ring-2 ring-slate-400/40'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${acc.bgClass} flex items-center justify-center text-white text-[10px]`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                    {acc.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography Scale */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#006399] dark:text-sky-400" />
              <span>Tamaño de fuente para lectura:</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'xlarge'] as FontSizeOption[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleFontSizeChange(size)}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  themeSettings.fontSize === size
                    ? 'bg-[#134074] text-white border-[#134074]'
                    : 'bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {size === 'normal' ? 'Estándar' : size === 'large' ? 'Grande (+15%)' : 'Accesible (+30%)'}
              </button>
            ))}
          </div>
        </div>

        {/* Performance & Reduced Motion */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Optimización de rendimiento
              </div>
              <span className="text-[10px] text-slate-400">
                Reducir animaciones para máxima rapidez y ahorro de batería
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={themeSettings.reducedMotion}
            onChange={handleToggleReducedMotion}
            className="w-4 h-4 text-[#134074] rounded accent-[#134074]"
          />
        </div>
      </div>

      {/* Security & Health Compliance Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-xs flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Seguridad & Normativas Sanitarias
        </h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Fingerprint className="w-4 h-4 text-[#006399] dark:text-sky-400" />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Acceso con Face ID / Huella
              </div>
              <span className="text-[10px] text-slate-400">
                Biometría local activada en este dispositivo
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Activado
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Cumplimiento HIPAA & GDPR
              </div>
              <span className="text-[10px] text-slate-400">
                Cifrado 256 bits y trazabilidad clínica verificada
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            Certificado
          </span>
        </div>
      </div>

      {/* Logout Action */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('warning');
          onLogout();
        }}
        className="w-full h-11 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-200/50 dark:border-red-900/40 transition-all active:scale-98"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar Sesión de Paciente</span>
      </button>

      {/* Version Tag */}
      <div className="text-center text-[11px] text-slate-400 mt-2">
        MedCitas v3.4.2 • Portal Certificado de Salud Digital
      </div>
    </div>
  );
};
