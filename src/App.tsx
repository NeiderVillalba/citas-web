import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScreenType, 
  ThemeSettings, 
  PushNotificationConfig, 
  InAppPushNotification, 
  Appointment, 
  Doctor,
  UserProfile
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_RECORDS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { BookingView } from './components/BookingView';
import { HistoryAndPrescriptionsView } from './components/HistoryAndPrescriptionsView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { PushNotificationToast } from './components/PushNotificationToast';
import { playPushNotificationSound, triggerHaptic } from './utils/audio';

export default function App() {
  // Navigation & Authentication
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // App Data
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [notifications, setNotifications] = useState<InAppPushNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Active push toast
  const [activeToast, setActiveToast] = useState<InAppPushNotification | null>(null);

  // Mobile frame simulator toggle for desktop
  const [isSimulatedMobile, setIsSimulatedMobile] = useState<boolean>(false);

  // Customizable Theme State
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medcitas_theme');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      mode: 'light',
      accent: 'blue',
      fontSize: 'normal',
      reducedMotion: false,
      highContrast: false,
    };
  });

  // Highly Configurable Push Notification State
  const [pushConfig, setPushConfig] = useState<PushNotificationConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medcitas_push_config');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      enabled: true,
      sound: true,
      soundType: 'clinical',
      vibration: true,
      appointmentReminders: true,
      reminderTiming: '2h',
      medicationReminders: true,
      labResults: true,
      doctorMessages: true,
      urgentAlerts: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:30',
    };
  });

  // Apply dark class and theme settings to root document
  useEffect(() => {
    const root = document.documentElement;
    const isDark = 
      themeSettings.mode === 'dark' || 
      (themeSettings.mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Font size scaling
    root.classList.remove('text-size-large', 'text-size-xlarge');
    if (themeSettings.fontSize === 'large') {
      root.classList.add('text-size-large');
    } else if (themeSettings.fontSize === 'xlarge') {
      root.classList.add('text-size-xlarge');
    }

    localStorage.setItem('medcitas_theme', JSON.stringify(themeSettings));
  }, [themeSettings]);

  // Persist push config
  useEffect(() => {
    localStorage.setItem('medcitas_push_config', JSON.stringify(pushConfig));
  }, [pushConfig]);

  // Handle Login
  const handleLoginSuccess = (userName?: string) => {
    if (userName) {
      setUser((prev) => ({ ...prev, name: userName }));
    }
    setCurrentScreen('dashboard');

    // Trigger a welcome push notification if enabled
    if (pushConfig.enabled) {
      setTimeout(() => {
        triggerPushBanner(
          '🏥 Sesión Iniciada en MedCitas',
          'Bienvenida, Ana. Tu historial clínico y citas están sincronizados con cifrado SSL.',
          'system'
        );
      }, 900);
    }
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  // Push Notification Dispatcher
  const triggerPushBanner = (
    title: string, 
    body: string, 
    category: InAppPushNotification['category'] = 'system',
    targetScreen?: ScreenType
  ) => {
    if (!pushConfig.enabled) return;

    // Check quiet hours
    if (pushConfig.quietHoursEnabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [sh, sm] = pushConfig.quietHoursStart.split(':').map(Number);
      const [eh, em] = pushConfig.quietHoursEnd.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      const inQuiet = startMin > endMin 
        ? currentMinutes >= startMin || currentMinutes <= endMin
        : currentMinutes >= startMin && currentMinutes <= endMin;
      
      if (inQuiet && category !== 'urgentAlerts' as any) {
        // Suppress sound during quiet hours
      } else {
        if (pushConfig.sound) playPushNotificationSound(pushConfig.soundType);
        if (pushConfig.vibration) triggerHaptic('light');
      }
    } else {
      if (pushConfig.sound) playPushNotificationSound(pushConfig.soundType);
      if (pushConfig.vibration) triggerHaptic('light');
    }

    const newNotif: InAppPushNotification = {
      id: `push-${Date.now()}`,
      title,
      body,
      category,
      timestamp: 'Ahora',
      read: false,
      targetScreen: targetScreen || (category === 'appointment' ? 'dashboard' : category === 'medication' ? 'history' : 'notifications'),
    };

    setActiveToast(newNotif);
    setNotifications((prev) => [newNotif, ...prev]);

    // Also trigger native browser Notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) {
        console.debug(e);
      }
    }
  };

  // Booking a new appointment
  const handleBookSuccess = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    // Send immediate push notification
    triggerPushBanner(
      `🩺 Cita Reservada: ${newApt.doctorName}`,
      `Tu cita de ${newApt.doctorSpecialty} ha sido programada para el ${newApt.date} a las ${newApt.time} (${newApt.type}).`,
      'appointment',
      'dashboard'
    );
  };

  // Prescriptions check toggle
  const handleToggleTakePrescription = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === id) {
          const nextState = !rx.takenToday;
          if (nextState) {
            triggerPushBanner(
              '💊 Dosis Registrada',
              `Has marcado la toma de ${rx.medicationName}. ¡Excelente adherencia al tratamiento!`,
              'medication',
              'history'
            );
          }
          return { ...rx, takenToday: nextState };
        }
        return rx;
      })
    );
  };

  // Notifications management
  const handleMarkAllNotificationsRead = () => {
    triggerHaptic('light');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    triggerHaptic('light');
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Touch swipe gestures between main bottom tabs
  const tabSequence: ScreenType[] = ['dashboard', 'booking', 'history', 'notifications', 'settings'];
  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentScreen === 'login') return;
    const currentIndex = tabSequence.indexOf(currentScreen);
    if (currentIndex === -1) return;

    if (direction === 'left' && currentIndex < tabSequence.length - 1) {
      triggerHaptic('light');
      setCurrentScreen(tabSequence[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      triggerHaptic('light');
      setCurrentScreen(tabSequence[currentIndex - 1]);
    }
  };

  // Touch pan handling ref
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentScreen === 'login') return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || currentScreen === 'login') return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only swipe if predominantly horizontal and at least 60px
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        handleSwipe('left');
      } else {
        handleSwipe('right');
      }
    }
  };

  const isDark = themeSettings.mode === 'dark';

  return (
    <div className={`min-h-screen w-full bg-[#f8f9ff] dark:bg-[#0b1420] text-[#0b1c30] dark:text-[#f0f4fc] flex flex-col items-center justify-start transition-colors duration-200 ${
      themeSettings.fontSize === 'large' ? 'text-[15px]' : themeSettings.fontSize === 'xlarge' ? 'text-[17px]' : 'text-[14px]'
    }`}>
      {/* Push Notification Toast (interactive iOS/Android style) */}
      <PushNotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onAction={(targetScreen) => {
          if (targetScreen) setCurrentScreen(targetScreen);
        }}
      />

      {/* Frame wrapper: either fluid mobile-first or simulated handset frame on desktop */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full transition-all duration-300 ${
          isSimulatedMobile 
            ? 'max-w-sm my-6 rounded-[44px] shadow-[0_25px_60px_rgba(0,42,84,0.25)] border-[8px] border-slate-900 bg-white dark:bg-slate-900 overflow-hidden relative min-h-[780px]' 
            : 'max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 relative shadow-xs'
        }`}
      >
        {/* If in simulated mobile mode: add simulated phone speaker notch */}
        {isSimulatedMobile && (
          <div className="w-full flex justify-center pt-2 pb-1 bg-white dark:bg-slate-900 z-50">
            <div className="w-24 h-4 bg-slate-900 dark:bg-slate-800 rounded-full flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950" />
              <span className="w-8 h-1 rounded-full bg-slate-800 dark:bg-slate-700" />
            </div>
          </div>
        )}

        {/* Header bar (when logged in) */}
        {currentScreen !== 'login' && (
          <Header
            currentScreen={currentScreen}
            onNavigate={(s) => setCurrentScreen(s)}
            themeSettings={themeSettings}
            onToggleTheme={() => {
              setThemeSettings((prev) => ({
                ...prev,
                mode: prev.mode === 'dark' ? 'light' : 'dark',
              }));
            }}
            unreadCount={unreadCount}
            userName={user.name}
            isSimulatedMobile={isSimulatedMobile}
            onToggleSimulatedMobile={() => setIsSimulatedMobile(!isSimulatedMobile)}
          />
        )}

        {/* Content Views with Fluid Motion Transitions */}
        <div className="w-full flex-1 relative overflow-x-hidden">
          <AnimatePresence mode="wait">
            {currentScreen === 'login' && (
              <motion.div
                key="login"
                initial={themeSettings.reducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={themeSettings.reducedMotion ? false : { opacity: 0, x: 20 }}
                transition={{ duration: 0.24 }}
                className="w-full"
              >
                <LoginScreen
                  onLoginSuccess={handleLoginSuccess}
                  isDark={isDark}
                />
              </motion.div>
            )}

            {currentScreen === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={themeSettings.reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={themeSettings.reducedMotion ? false : { opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                <DashboardView
                  userName={user.name}
                  appointments={appointments}
                  doctors={INITIAL_DOCTORS}
                  onNavigate={(s) => setCurrentScreen(s)}
                  onSelectDoctorForBooking={(doc) => {
                    setSelectedDoctorForBooking(doc);
                    setCurrentScreen('booking');
                  }}
                />
              </motion.div>
            )}

            {currentScreen === 'booking' && (
              <motion.div
                key="booking"
                initial={themeSettings.reducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={themeSettings.reducedMotion ? false : { opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                <BookingView
                  doctors={INITIAL_DOCTORS}
                  selectedDoctor={selectedDoctorForBooking}
                  onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
                  onBookSuccess={handleBookSuccess}
                  onNavigate={(s) => setCurrentScreen(s)}
                />
              </motion.div>
            )}

            {currentScreen === 'history' && (
              <motion.div
                key="history"
                initial={themeSettings.reducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={themeSettings.reducedMotion ? false : { opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                <HistoryAndPrescriptionsView
                  prescriptions={prescriptions}
                  records={records}
                  onToggleTakePrescription={handleToggleTakePrescription}
                />
              </motion.div>
            )}

            {currentScreen === 'notifications' && (
              <motion.div
                key="notifications"
                initial={themeSettings.reducedMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={themeSettings.reducedMotion ? false : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                <NotificationsView
                  config={pushConfig}
                  onUpdateConfig={(newCfg) => setPushConfig(newCfg)}
                  notifications={notifications}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onClearNotifications={handleClearNotifications}
                  onTriggerTestNotification={(title, body, category) => {
                    triggerPushBanner(title, body, category);
                  }}
                  onNavigate={(s) => setCurrentScreen(s)}
                />
              </motion.div>
            )}

            {currentScreen === 'settings' && (
              <motion.div
                key="settings"
                initial={themeSettings.reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={themeSettings.reducedMotion ? false : { opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="w-full"
              >
                <SettingsView
                  user={user}
                  themeSettings={themeSettings}
                  onUpdateThemeSettings={(newSet) => setThemeSettings(newSet)}
                  onLogout={handleLogout}
                  onNavigate={(s) => setCurrentScreen(s)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Bar (when logged in) */}
        {currentScreen !== 'login' && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(s) => setCurrentScreen(s)}
            unreadNotificationsCount={unreadCount}
          />
        )}
      </div>
    </div>
  );
}
