import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ArrowRight, ExternalLink } from 'lucide-react';
import { InAppPushNotification, ScreenType } from '../types';
import { MEDCITAS_LOGO_URL } from '../data/mockData';
import { triggerHaptic } from '../utils/audio';

interface PushNotificationToastProps {
  notification: InAppPushNotification | null;
  onDismiss: () => void;
  onAction: (targetScreen?: ScreenType) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
  onAction,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-2 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y < -20 || info.velocity.y < -100) {
              triggerHaptic('light');
              onDismiss();
            }
          }}
          className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-slate-850/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(0,42,84,0.18)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-blue-100/80 dark:border-slate-700/80 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
        >
          {/* Top meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img 
                src={MEDCITAS_LOGO_URL} 
                alt="MedCitas" 
                className="w-4 h-4 rounded-sm object-contain"
              />
              <span className="text-[11px] font-bold text-[#002a54] dark:text-sky-300 tracking-wider uppercase">
                MedCitas • AVISO PUSH
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">Ahora</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  onDismiss();
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body content */}
          <div 
            onClick={() => {
              triggerHaptic('light');
              onAction(notification.targetScreen);
              onDismiss();
            }}
            className="flex items-start gap-3 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-700/70 text-[#006399] dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {notification.title}
              </h4>
              <p className="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                {notification.body}
              </p>
            </div>

            <div className="self-center pr-1 text-[#006399] dark:text-sky-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Drag indicator pill */}
          <div className="w-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-full self-center -mb-1 opacity-70" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
