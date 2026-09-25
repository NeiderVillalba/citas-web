import { ArrowLeft, Moon, Sun, Smartphone } from 'lucide-react';
import MEDCITAS_LOGO_URL from '../assets/medcitas-logo.svg';
import type { PortalScreen } from './BottomNav';

interface HeaderProps {
  currentScreen: PortalScreen;
  onNavigate: (screen: PortalScreen) => void;
  dark: boolean;
  onToggleTheme: () => void;
  userName: string;
  simulatedMobile: boolean;
  onToggleSimulatedMobile: () => void;
}

const titles: Record<PortalScreen, string> = {
  dashboard: 'MedCitas', booking: 'Reservar cita', history: 'Mis citas', settings: 'Mi cuenta',
};

export function Header({ currentScreen, onNavigate, dark, onToggleTheme, userName, simulatedMobile, onToggleSimulatedMobile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {currentScreen === 'dashboard' ? (
            <button type="button" onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-left">
              <img src={MEDCITAS_LOGO_URL} alt="" className="h-8 w-auto rounded-md" />
              <span className="font-bold text-base text-[#002a54] dark:text-[#a7c8ff]">MedCitas</span>
            </button>
          ) : (
            <button type="button" onClick={() => onNavigate('dashboard')} aria-label="Volver al inicio" className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowLeft className="w-5 h-5" /></button>
          )}
          {currentScreen !== 'dashboard' && <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{titles[currentScreen]}</h1>}
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onToggleSimulatedMobile} title={simulatedMobile ? 'Vista fluida' : 'Vista móvil'} aria-label="Alternar vista móvil" className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Smartphone className="w-4 h-4" /></button>
          <button type="button" onClick={onToggleTheme} aria-label="Alternar modo oscuro" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">{dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}</button>
          <button type="button" onClick={() => onNavigate('settings')} title="Mi cuenta" className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#002a54] to-[#006399] text-xs font-bold text-white">{userName.charAt(0)}</button>
        </div>
      </div>
    </header>
  );
}
