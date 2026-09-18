import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  CalendarPlus, 
  FileText, 
  Bell, 
  Settings,
  HeartPulse
} from 'lucide-react';
import { ScreenType } from '../types';
import { triggerHaptic } from '../utils/audio';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadNotificationsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  unreadNotificationsCount,
}) => {
  const tabs = [
    { id: 'dashboard' as ScreenType, label: 'Inicio', icon: Home },
    { id: 'booking' as ScreenType, label: 'Pedir Cita', icon: CalendarPlus },
    { id: 'history' as ScreenType, label: 'Historial', icon: FileText },
    { id: 'notifications' as ScreenType, label: 'Avisos', icon: Bell, badge: unreadNotificationsCount },
    { id: 'settings' as ScreenType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 transition-colors pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onNavigate(tab.id);
              }}
              className="relative flex-1 flex flex-col items-center justify-center h-full py-1 text-center transition-colors min-h-[48px] select-none group"
            >
              {/* Active Indicator Backdrop */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-2.5 top-1 bottom-1 bg-blue-50 dark:bg-slate-800 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive 
                      ? 'text-[#006399] dark:text-sky-400 scale-110 font-bold stroke-[2.4]' 
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`} 
                />

                {/* Badge if present */}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span 
                className={`text-[11px] mt-1 font-medium transition-colors ${
                  isActive 
                    ? 'text-[#002a54] dark:text-sky-300 font-bold' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
