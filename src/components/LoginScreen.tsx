import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BadgeCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  IdCard, 
  Clock, 
  Fingerprint, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  User, 
  ArrowLeft,
  HeartPulse,
  Mail,
  Phone
} from 'lucide-react';
import { MEDCITAS_LOGO_URL } from '../data/mockData';
import { playPushNotificationSound, triggerHaptic } from '../utils/audio';
import { ApiError, citasApi } from '../api/citasApi';
import type { ActivePlan } from '../api/citasApi';

interface LoginScreenProps {
  onLoginSuccess: (userName?: string) => void;
  isDark?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, isDark }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('ana.garcia@saludmail.com');
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
  const [rememberMe, setRememberMe] = useState(true);
  
  // Interactive status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);

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

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      playPushNotificationSound('clinical');
      triggerHaptic('success');

      setTimeout(() => {
        onLoginSuccess('Ana García');
      }, 1100);
    }, 1000);
  };

  const handleBiometrics = () => {
    setBiometricScanning(true);
    triggerHaptic('light');

    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricVerified(true);
      playPushNotificationSound('gentle');
      triggerHaptic('success');

      setTimeout(() => {
        onLoginSuccess('Ana García');
      }, 900);
    }, 1100);
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    setActiveSocial(provider);
    triggerHaptic('light');

    setTimeout(() => {
      setActiveSocial(null);
      playPushNotificationSound('clinical');
      onLoginSuccess('Ana García');
    }, 800);
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
            <span>Portal Seguro de Pacientes</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl sm:text-[26px] font-bold text-[#002a54] dark:text-slate-100 tracking-tight leading-tight">
            {isRegisterMode ? 'Crea tu cuenta clínica' : '¡Bienvenido de nuevo!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[290px] mt-1">
            {isRegisterMode 
              ? 'Regístrate para solicitar citas médicas y ver tus recetas electrónicas'
              : 'Accede a tu historial clínico y gestión de citas médicas'}
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
                  Correo o Documento ID
                </label>
                <span className="text-[11px] font-semibold text-[#006399] dark:text-sky-400">
                  DNI / NIE / Email
                </span>
              </div>
              <div className="relative flex items-center">
                <IdCard className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input 
                  id="user-id"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ej. 12345678X o ana@correo.com"
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
                {!isRegisterMode && (
                  <button 
                    type="button"
                    onClick={() => alert('Se ha enviado un enlace de recuperación segura a tu correo verificado.')}
                    className="text-[11px] font-semibold text-[#006399] dark:text-sky-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
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

            {/* Checkbox: Remember session */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#134074] rounded border-slate-300 dark:border-slate-600 focus:ring-[#134074] accent-[#134074]"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Recordar mi sesión
                </span>
              </label>

              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Clock className="w-3 h-3" />
                <span>30 días</span>
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-0.5">
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              O accede con
            </span>
            <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Biometrics Button */}
          <button
            type="button"
            onClick={handleBiometrics}
            disabled={biometricScanning || biometricVerified}
            className="w-full h-11 rounded-xl bg-blue-50/80 dark:bg-slate-800 hover:bg-blue-100/60 dark:hover:bg-slate-750 text-[#006399] dark:text-sky-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-blue-100/50 dark:border-slate-700 active:scale-[0.98]"
          >
            {biometricScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Escaneando sensor seguro Face ID...</span>
              </>
            ) : biometricVerified ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Identidad biométrica validada</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-[#006399] dark:text-sky-400" />
                <span>Face ID / Huella biométrica</span>
              </>
            )}
          </button>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>{activeSocial === 'Google' ? 'Conectando...' : 'Google'}</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-slate-900 dark:text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.51-11-20.48-14.43-32.92-3.43-12.43-5.15-24.16-5.15-35.19 0-14.07 3.52-25.75 10.55-35.03 7.03-9.28 15.75-14.04 26.16-14.28 4.35 0 9.29 1.18 14.83 3.55 5.54 2.37 9.17 3.61 10.89 3.73 1.94-.12 5.76-1.42 11.45-3.9 5.7-2.48 10.45-3.61 14.27-3.38 12.03.73 21.6 5.25 28.71 13.56-10.48 6.41-15.6 15.17-15.35 26.27.24 8.71 3.58 16.03 10.02 21.96 6.43 5.92 14.18 9.39 23.23 10.41-2.22 6.64-4.87 13.5-7.96 20.57zm-27.46-107.1c0 6.68-2.43 13.06-7.29 19.14-5.86 7.15-12.92 11.23-21.19 12.24-.24-.96-.36-1.92-.36-2.88 0-6.44 2.66-12.94 7.97-19.5 2.78-3.37 6.16-6.19 10.15-8.46 3.99-2.27 7.56-3.48 10.72-3.63v3.09z"></path>
              </svg>
              <span>{activeSocial === 'Apple' ? 'Conectando...' : 'Apple'}</span>
            </button>
          </div>
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

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
            <button 
              type="button" 
              onClick={() => alert('Soporte telefónico de atención al paciente disponible 24/7 en el 900 123 456.')}
              className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Ayuda al paciente
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <button 
              type="button"
              onClick={() => alert('Línea directa de Urgencias Médicas: 112 / Urgencias MedCitas: 900 999 112.')}
              className="hover:text-red-500 transition-colors text-red-500/80 font-medium"
            >
              Teléfono de urgencias
            </button>
          </div>
        </div>

        {/* Security Seal Compliance Card */}
        <div className="w-full mt-5 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl p-3 flex items-center gap-3 border border-blue-100/50 dark:border-slate-700/60">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-[#006399] dark:text-sky-400 shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>Conexión médica cifrada SSL de 256 bits</span>
              <Lock className="w-3 h-3 text-[#006399] dark:text-sky-400" />
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              Protección de datos conforme con normativas HIPAA y GDPR de grado sanitario.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
