import { LogOut, Mail, Moon, Sun, UserRound } from 'lucide-react';
import type { AuthUser } from '../api/citasApi';

interface AccountViewProps {
  user: AuthUser;
  dark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function AccountView({ user, dark, onToggleTheme, onLogout }: AccountViewProps) {
  return (
    <main className="w-full max-w-md mx-auto px-4 pt-4 pb-24 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[#002a54] dark:text-slate-100">Mi cuenta</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Datos de la sesión actual.</p>
      </div>
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-[#134074] text-white"><UserRound className="w-6 h-6" /></span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.firstName} {user.lastName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.roles.includes('ADMIN') ? 'Administrador' : user.roles.includes('PROFESSIONAL') ? 'Profesional' : 'Usuario paciente'}</p>
          </div>
        </div>
        <p className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"><Mail className="w-4 h-4 text-[#006399]" />{user.email}</p>
      </section>
      <button type="button" onClick={onToggleTheme} className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left text-sm font-semibold text-slate-800 shadow-xs flex items-center gap-3 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
        {dark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-[#006399]" />}
        {dark ? 'Usar tema claro' : 'Usar tema oscuro'}
      </button>
      <button type="button" onClick={onLogout} className="w-full rounded-2xl border border-red-100 bg-white p-4 text-left text-sm font-semibold text-red-700 shadow-xs flex items-center gap-3 dark:border-red-900 dark:bg-slate-800 dark:text-red-300"><LogOut className="w-5 h-5" />Cerrar sesión</button>
    </main>
  );
}
