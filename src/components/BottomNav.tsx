import { motion } from 'motion/react';
import { CalendarDays, CalendarPlus, Home, UserRound } from 'lucide-react';

export type PortalScreen = 'dashboard' | 'booking' | 'history' | 'settings';

interface BottomNavProps {
  currentScreen: PortalScreen;
  onNavigate: (screen: PortalScreen) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'booking', label: 'Pedir cita', icon: CalendarPlus },
  { id: 'history', label: 'Mis citas', icon: CalendarDays },
  { id: 'settings', label: 'Cuenta', icon: UserRound },
] as const;

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-1">
        {tabs.map((tab) => {
          const active = currentScreen === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => onNavigate(tab.id)} aria-current={active ? 'page' : undefined}
              className="group relative flex h-full min-h-12 flex-1 flex-col items-center justify-center py-1 text-center">
              {active && <motion.span layoutId="activeTabIndicator" className="absolute inset-x-2.5 bottom-1 top-1 -z-10 rounded-xl bg-blue-50 dark:bg-slate-800" />}
              <Icon className={`h-5 w-5 ${active ? 'text-[#006399] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`mt-1 text-[11px] font-semibold ${active ? 'text-[#002a54] dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
