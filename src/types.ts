export type ScreenType = 'login' | 'dashboard' | 'booking' | 'history' | 'notifications' | 'settings';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentColor = 'blue' | 'cyan' | 'emerald' | 'indigo';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

export interface ThemeSettings {
  mode: ThemeMode;
  accent: AccentColor;
  fontSize: FontSizeOption;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface PushNotificationConfig {
  enabled: boolean;
  sound: boolean;
  soundType: 'clinical' | 'gentle' | 'chime' | 'silent';
  vibration: boolean;
  appointmentReminders: boolean;
  reminderTiming: '24h' | '2h' | '1h' | '15min';
  medicationReminders: boolean;
  labResults: boolean;
  doctorMessages: boolean;
  urgentAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
}

export interface InAppPushNotification {
  id: string;
  title: string;
  body: string;
  category: 'appointment' | 'medication' | 'lab' | 'message' | 'system';
  timestamp: string;
  read: boolean;
  targetScreen?: ScreenType;
  metadata?: Record<string, unknown>;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewsCount: number;
  availableToday: boolean;
  avatarUrl: string;
  nextSlot: string;
  fee: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  hospital: string;
  date: string;       // e.g. "2026-09-18"
  time: string;       // e.g. "10:30"
  type: 'presencial' | 'videoconsulta' | 'domicilio';
  status: 'confirmada' | 'pendiente' | 'completada' | 'cancelada';
  notes?: string;
  roomNumber?: string;
  isSoon?: boolean;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  takenToday: boolean;
  timeSlot: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  specialty: string;
  doctorName: string;
  diagnosis: string;
  facility: string;
  summary: string;
  hasAttachment: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  docId: string;
  phone: string;
  bloodType: string;
  allergies: string[];
  insuranceProvider: string;
  policyNumber: string;
  biometricsEnabled: boolean;
  avatarUrl: string;
}
