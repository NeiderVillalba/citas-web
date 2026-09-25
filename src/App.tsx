import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ApiError, citasApi } from './api/citasApi';
import type { AuthUser, MyAppointment } from './api/citasApi';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import type { PortalScreen } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { BookingView } from './components/BookingView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { AccountView } from './components/AccountView';
import { AdminAppointmentsView } from './components/AdminAppointmentsView';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [screen, setScreen] = useState<PortalScreen>('dashboard');
  const [restoring, setRestoring] = useState(true);
  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('medcitas_theme_mode') === 'dark');
  const [simulatedMobile, setSimulatedMobile] = useState(false);

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      setAppointments(await citasApi.getMyAppointments());
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setUser(null);
        setAppointments([]);
      } else {
        setAppointmentsError(cause instanceof ApiError ? cause.message : 'No fue posible cargar tus citas.');
      }
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('medcitas_theme_mode', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    let active = true;
    citasApi.refresh()
      .then((session) => {
        if (!active) return;
        if (session.user.roles.includes('USER') || session.user.roles.includes('ADMIN')) {
          setUser(session.user);
          if (session.user.roles.includes('ADMIN')) setScreen('admin');
          else void loadAppointments();
        } else {
          void citasApi.logout().catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, [loadAppointments]);

  function handleLogin(userFromApi: AuthUser) {
    setUser(userFromApi);
    if (userFromApi.roles.includes('ADMIN')) {
      setScreen('admin');
      setAppointments([]);
    } else {
      setScreen('dashboard');
      void loadAppointments();
    }
  }

  function handleLogout() {
    setUser(null);
    setAppointments([]);
    setAppointmentsError('');
    setScreen('dashboard');
    void citasApi.logout().catch(() => {});
  }

  if (restoring) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] text-[#002a54] dark:bg-[#0b1420] dark:text-slate-100"><p role="status">Restaurando sesión…</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#f8f9ff] text-[#0b1c30] transition-colors dark:bg-[#0b1420] dark:text-[#f0f4fc]">
      <div className={`relative min-h-screen w-full bg-white shadow-xs dark:bg-slate-900 ${simulatedMobile ? 'my-6 max-w-sm overflow-hidden rounded-[44px] border-[8px] border-slate-900 shadow-[0_25px_60px_rgba(0,42,84,0.25)]' : 'mx-auto max-w-md'}`}>
        {simulatedMobile && <div className="flex justify-center bg-white pb-1 pt-2 dark:bg-slate-900"><span className="h-4 w-24 rounded-full bg-slate-900 dark:bg-slate-800" /></div>}
        {user && <Header currentScreen={screen} onNavigate={setScreen} dark={dark} onToggleTheme={() => setDark((value) => !value)} userName={user.firstName} simulatedMobile={simulatedMobile} onToggleSimulatedMobile={() => setSimulatedMobile((value) => !value)} isAdmin={user.roles.includes('ADMIN')} />}

        <AnimatePresence mode="wait">
          <motion.div key={user ? screen : 'login'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {!user && <LoginScreen onLoginSuccess={handleLogin} isDark={dark} />}
            {user && user.roles.includes('USER') && screen === 'dashboard' && <DashboardView userName={`${user.firstName} ${user.lastName}`} appointments={appointments} loading={appointmentsLoading} error={appointmentsError} onReload={() => void loadAppointments()} onNavigate={setScreen} />}
            {user && user.roles.includes('USER') && screen === 'booking' && <BookingView onBooked={loadAppointments} onNavigate={setScreen} />}
            {user && user.roles.includes('USER') && screen === 'history' && <MyAppointmentsView appointments={appointments} loading={appointmentsLoading} error={appointmentsError} onReload={() => void loadAppointments()} onBook={() => setScreen('booking')} />}
            {user && user.roles.includes('ADMIN') && screen === 'admin' && <AdminAppointmentsView />}
            {user && screen === 'settings' && <AccountView user={user} dark={dark} onToggleTheme={() => setDark((value) => !value)} onLogout={handleLogout} />}
          </motion.div>
        </AnimatePresence>
        {user && <BottomNav currentScreen={screen} onNavigate={setScreen} isAdmin={user.roles.includes('ADMIN')} />}
      </div>
    </div>
  );
}
