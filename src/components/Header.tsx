import React from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  CheckCircle
} from 'lucide-react';
import { ScreenType, ThemeSettings, InAppPushNotification } from '../types';
import { MEDCITAS_LOGO_URL } from '../data/mockData';
import { triggerHaptic } from '../utils/audio';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  themeSettings: ThemeSettings;
  onToggleTheme: () => void;
  unreadCount: number;
  userName: string;
  isSimulatedMobile: boolean;
  onToggleSimulatedMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  themeSettings,
  onToggleTheme,
  unreadCount,
  userName,
  isSimulatedMobile,
  onToggleSimulatedMobile,
}) => {
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'MedCitas';
      case 'booking':
        return 'Reservar Cita';
      case 'history':
        return 'Historial & Recetas';
      case 'notifications':
        return 'Notificaciones Push';
      case 'settings':
        return 'Ajustes & Tema';
      default:
        return 'MedCitas';
    }
  };

  const isHome = currentScreen === 'dashboard';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="h-14 px-4 flex items-center justify-between max-w-2xl mx-auto">
        {/* Left: Back button or Brand Logo */}
        <div className="flex items-center gap-2">
          {!isHome ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onNavigate('dashboard');
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="relative">
                <img 
                  src={MEDCITAS_LOGO_URL} 
                  alt="MedCitas" 
                  className="h-8 w-auto object-contain rounded-md"
                />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006399] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006399]"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#002a54] dark:text-[#a7c8ff] tracking-tight leading-none">
                  MedCitas
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Portal Paciente
                </span>
              </div>
            </button>
          )}

          {!isHome && (
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight ml-1">
              {getScreenTitle()}
            </h1>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile frame preview toggle (desktop convenience) */}
          <button
            type="button"
            onClick={onToggleSimulatedMobile}
            title={isSimulatedMobile ? 'Cambiar a vista fluida' : 'Cambiar a vista móvil'}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Smartphone className={`w-4 h-4 ${isSimulatedMobile ? 'text-[#006399] dark:text-sky-400' : ''}`} />
          </button>

          {/* Dark mode quick toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onToggleTheme();
            }}
            title="Cambiar tema claro / oscuro"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Alternar modo oscuro"
          >
            {themeSettings.mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onNavigate('notifications');
            }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Ver notificaciones push"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onNavigate('settings');
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#002a54] to-[#006399] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#006399]/40 transition-all ml-0.5"
            title="Ajustes de cuenta"
          >
            {userName.charAt(0)}
          </button>
        </div>
      </div>
    </header>
  );
};
