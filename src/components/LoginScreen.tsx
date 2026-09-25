import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BadgeCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  IdCard, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  User, 
  ArrowLeft,
  HeartPulse,
  Mail,
  Phone,
} from 'lucide-react';
import MEDCITAS_LOGO_URL from '../assets/medcitas-logo.svg';
import { playPushNotificationSound, triggerHaptic } from '../utils/audio';
import { ApiError, citasApi } from '../api/citasApi';
import type { ActivePlan, AuthUser } from '../api/citasApi';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  isDark?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, isDark }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Interactive status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isRegisterMode) return;

    let isCurrent = true;
    setIsLoadingPlans(true);
    setPlansError('');
    citasApi.getActivePlans()
      .then((activePlans) => {
        if (isCurrent) setPlans(activePlans);
      })
      .catch(() => {
        if (isCurrent) setPlansError('No fue posible cargar los planes. Puedes continuar sin elegir uno.');
      })
      .finally(() => {
        if (isCurrent) setIsLoadingPlans(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isRegisterMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    triggerHaptic('light');

    if (isRegisterMode) {
      try {
        await citasApi.registerUser({
          firstName,
          lastName,
          documentType,
          documentNumber,
          email,
          phone,
          password,
          ...(selectedPlanId ? { planId: Number(selectedPlanId) } : {}),
        });
        setSubmitSuccess(true);
        setSuccessMessage('Cuenta creada. Ya puedes iniciar sesión con tu correo y contraseña.');
        setIdentifier(email);
        playPushNotificationSound('clinical');
        triggerHaptic('success');
        window.setTimeout(() => {
          setIsRegisterMode(false);
          setSubmitSuccess(false);
          setPassword('');
          setSelectedPlanId('');
        }, 1800);
      } catch (error) {
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'No fue posible crear la cuenta. Inténtalo de nuevo.',
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const session = await citasApi.login(identifier.trim(), password);
      if (!session.user.roles.includes('USER') && !session.user.roles.includes('ADMIN') && !session.user.roles.includes('PROFESSIONAL')) {
        await citasApi.logout();
        setFormError('Este perfil aún no tiene una vista habilitada en el portal.');
        return;
      }
      setSubmitSuccess(true);
      playPushNotificationSound('clinical');
      triggerHaptic('success');
      onLoginSuccess(session.user);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'No fue posible iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col relative pb-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 dark:border-slate-800 transition-colors">
        <div className="h-14 px-4 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => {
                if (isRegisterMode) setIsRegisterMode(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-1.5">
              <img 
                src={MEDCITAS_LOGO_URL} 
                alt="MedCitas Logo" 
                className="h-7 w-auto object-contain rounded-md"
              />
              <span className="font-bold text-lg text-[#002a54] dark:text-[#a7c8ff] tracking-tight">
                MedCitas
              </span>
            </div>
          </div>

          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {isRegisterMode ? 'Registro' : 'Login'}
          </span>

          <div className="w-8 h-8 rounded-full bg-[#002a54] dark:bg-[#1d477c] flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 flex flex-col items-center">
        {/* Ambient background glows */}
        <div className="absolute top-16 left-4 w-44 h-44 bg-sky-200/40 dark:bg-sky-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-36 right-4 w-44 h-44 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brand Welcome Area */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full flex flex-col items-center text-center mt-2 mb-5"
        >
          {/* Logo Card with Pulse Dot */}
          <div className="relative mb-3">
            <div className="w-18 h-18 rounded-2xl bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,42,84,0.08)] dark:shadow-none border border-blue-50 dark:border-slate-700/60 flex items-center justify-center p-3 relative transition-transform duration-300 hover:scale-105">
              <img 
                src={MEDCITAS_LOGO_URL} 
                alt="MedCitas Logo Icon" 
                className="w-12 h-12 object-contain"
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006399] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#006399]"></span>
              </span>
            </div>
          </div>

          {/* Secure Portal Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-slate-800/80 text-[#006399] dark:text-sky-400 text-xs font-semibold mb-2 border border-blue-100/60 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal de Citas</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl sm:text-[26px] font-bold text-[#002a54] dark:text-slate-100 tracking-tight leading-tight">
            {isRegisterMode ? 'Crea tu cuenta clínica' : '¡Bienvenido de nuevo!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[290px] mt-1">
            {isRegisterMode 
              ? 'Regístrate para solicitar citas médicas'
              : 'Accede a la gestión de tus citas médicas'}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="w-full bg-white dark:bg-slate-850 rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,42,84,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col gap-4"
        >
          {/* Top Gradient Trim */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#134074] via-[#006399] to-[#a7c8ff]" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full">
            {plansError && isRegisterMode && (
              <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {plansError}
              </p>
            )}
            {formError && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">
                {formError}
              </p>
            )}
            {successMessage && (
              <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                {successMessage}
              </p>
            )}

            {/* Registration fields */}
            <AnimatePresence>
              {isRegisterMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3.5 overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-first-name">
                      Nombres
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-slate-400" />
                      <input 
                        id="register-first-name"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Tus nombres"
                        required
                        className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-last-name">
                      Apellidos
                    </label>
                    <input
                      id="register-last-name"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tus apellidos"
                      required
                      className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-document-type">
                        Tipo de documento
                      </label>
                      <input
                        id="register-document-type"
                        type="text"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        placeholder="CC"
                        required
                        className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-document-number">
                        Número
                      </label>
                      <input
                        id="register-document-number"
                        type="text"
                        autoComplete="off"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder="Documento"
                        required
                        className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-email">
                      Correo electrónico
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-slate-400" />
                      <input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        required
                        className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-phone">
                      Teléfono
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 absolute left-3.5 text-slate-400" />
                      <input 
                        id="register-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Número de contacto"
                        required
                        className="w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="register-plan">
                      Plan EPS <span className="font-normal text-slate-400">(opcional)</span>
                    </label>
                    <select
                      id="register-plan"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      disabled={isLoadingPlans || plans.length === 0}
                      className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all disabled:opacity-60"
                    >
                      <option value="">
                        {isLoadingPlans ? 'Cargando planes…' : 'Continuar sin plan'}
                      </option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} — {plan.epsName}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input 1: Identifier */}
            {!isRegisterMode && <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="user-id">
                  Correo electrónico
                </label>
                <span className="text-[11px] font-semibold text-[#006399] dark:text-sky-400">
                  Acceso con correo
                </span>
              </div>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input 
                  id="user-id"
                  type="email"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ana@correo.com"
                  required
                  className="w-full h-12 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                />
              </div>
            </div>}

            {/* Input 2: Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="user-pwd">
                  Contraseña
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input 
                  id="user-pwd"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-12 pl-10 pr-11 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006399]/20 focus:border-[#006399] transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Alternar visibilidad de contraseña"
                  className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className={`w-full h-12 mt-1 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-[0.98] ${
                submitSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-[#134074] hover:bg-[#002a54]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRegisterMode ? 'Creando cuenta...' : 'Verificando credenciales...'}</span>
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRegisterMode ? 'Cuenta creada' : 'Acceso concedido'}</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </motion.div>

        {/* Switch to Register or Login */}
        <div className="w-full mt-4 flex flex-col items-center text-center gap-1">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                const nextRegisterMode = !isRegisterMode;
                setIsRegisterMode(nextRegisterMode);
                setPassword('');
                setFormError('');
                setSuccessMessage('');
                setSubmitSuccess(false);
                triggerHaptic('light');
              }}
              className="font-semibold text-[#006399] dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 ml-1.5"
            >
              <span>{isRegisterMode ? 'Inicia sesión' : 'Regístrate aquí'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </p>

        </div>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          Entorno de aprendizaje con datos sintéticos.
        </p>
      </main>
    </div>
  );
};
