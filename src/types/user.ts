import { DayOfWeek, FoodInstruction, PillShape, TimeSlot } from './medicine';

export type AuthProvider = 'google' | 'phone' | 'email' | 'guest';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface HealthConditionOption {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  minAgeRecommended?: number; // e.g. 1 year for pediatric
  overview?: string;
  symptoms?: string[];
  foodsToEat?: string[];
  foodsToAvoid?: string[];
  lifestyleTips?: string[];
  dangerSigns?: string[];
  pillRules?: string[];
  spokenSummaries?: {
    English: string;
    Telugu: string;
    Hindi: string;
  };
  commonMedicines: {
    name: string;
    dosage: string;
    purpose: string;
    color: string;
    colorHex: string;
    shape: PillShape;
    slots: TimeSlot[];
    withFood: FoodInstruction;
    spokenExplanation: string;
  }[];
}

export interface PatientHealthProfile {
  // Identity
  id: string;
  fullName: string;
  preferredName: string;
  email?: string;
  phoneNumber?: string;
  authProvider: AuthProvider;
  avatarUrl?: string;

  // Demographics
  age: number; // 1 to 120 years
  ageGroup?: 'infant_toddler' | 'child' | 'teen' | 'adult' | 'senior';
  gender: Gender;
  role: 'self' | 'caregiver_for_patient';
  cannotRead: boolean; // True if patient needs audio & visual cues instead of reading
  primaryLanguage: 'English' | 'Telugu' | 'Hindi';
  familyMemberLabel?: string; // e.g. "Grandmother", "Father", "Mother", "Child", "Self"

  // Daily Healthcare Properties
  routineTimes: {
    wakeAndBreakfast: string; // e.g. "08:00"
    lunch: string; // e.g. "13:00"
    eveningTea: string; // e.g. "17:30"
    dinnerAndSleep: string; // e.g. "21:00"
  };
  allergies: string[];
  bloodGroup?: string;
  waterGoalGlasses: number;
  mobilityStatus: 'independent' | 'assisted' | 'bedrest';

  // Diseases & Conditions
  selectedConditions: string[]; // condition ids e.g. ['hypertension', 'diabetes']
  conditionAnswers: {
    diabetesType?: 'type2' | 'type1' | 'prediabetes' | 'none';
    takingInsulin?: boolean;
    hasMorningDizziness?: boolean;
    takingBloodThinners?: boolean;
    thyroidEmptyStomachNeeded?: boolean;
    hasAsthmaInhaler?: boolean;
    customConditionsText?: string;
    dietaryNotes?: string;
  };

  // Emergency Contact
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };

  createdAt: string;
}
