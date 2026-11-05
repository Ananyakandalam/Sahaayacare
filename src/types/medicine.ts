export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'bedtime';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type PillShape = 'round' | 'oval' | 'capsule' | 'square' | 'liquid_drop' | 'triangle';

export type FoodInstruction = 'with_meal' | 'after_meal' | 'empty_stomach' | 'anytime' | 'before_food' | 'after_food' | 'no_preference';

export type PostureMode = 'patient' | 'caregiver' | 'matrix' | 'adherence' | 'print';

export interface DailyAdherenceRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Oct 12"
  dayName: DayOfWeek;
  totalScheduled: number;
  totalTaken: number;
  rate: number; // 0 - 100
  slotBreakdown: Record<TimeSlot, { scheduled: number; taken: number }>;
  missedPillNames?: string[];
}

export type MedicineFrequency = 'daily' | 'alternate_days' | 'weekly' | 'monthly' | 'as_needed_sos';

export type MedicineDuration = 'lifelong' | '3_days' | '5_days' | '7_days' | '14_days' | '30_days' | '90_days' | 'custom';

export type MedicineFormType = 'tablet' | 'capsule' | 'syrup' | 'drops' | 'inhaler' | 'injection';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  purpose: string;
  color: string; // e.g. "Golden Yellow"
  colorHex: string; // e.g. "#FBBF24"
  shape: PillShape;
  markings?: string;
  slots: TimeSlot[];
  daysOfWeek: DayOfWeek[];
  withFood: FoodInstruction;
  waterRequirement: 'full_glass' | 'normal_sip';
  precautions?: string;
  spokenExplanation: string;
  customReminderTime?: string; // e.g. "08:30"
  
  // Extended Duration & Recurrence
  frequency?: MedicineFrequency;
  duration?: MedicineDuration;
  durationLabel?: string; // e.g. "Daily (Lifelong)", "Weekly (Every Sun)", "Monthly (30 days)"
  weeklyDay?: DayOfWeek;
  monthlyDay?: number; // 1-31
  formType?: MedicineFormType;
  startDate?: string;
  daysRemaining?: number;
}

export interface MedicineSchedule {
  regimenTitle: string;
  patientName: string;
  patientNotes?: string;
  spokenOverview: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  medicines: Medicine[];
}

export interface SpokenSegment {
  timeSlot: TimeSlot;
  medicineId: string;
  spokenText: string;
  visualCue: string;
  actionIcon?: string;
}

export interface DayRoutine {
  day: DayOfWeek;
  dateStr?: string;
  slots: {
    morning: Medicine[];
    afternoon: Medicine[];
    evening: Medicine[];
    bedtime: Medicine[];
  };
}

export interface TimeSlotConfig {
  slot: TimeSlot;
  title: string;
  subtitle: string;
  icon: string;
  timeRange: string;
  startHour: number; // 24-hr format
  endHour: number;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  badgeBg: string;
}

