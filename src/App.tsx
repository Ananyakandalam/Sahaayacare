import React, { useState, useEffect, useRef } from 'react';
import {
  MedicineSchedule,
  DayOfWeek,
  TimeSlot,
  Medicine,
  PostureMode,
} from './types/medicine';
import { PatientHealthProfile, AuthProvider } from './types/user';
import { DEFAULT_SCHEDULES } from './data/defaultSchedules';
import { DAYS_LIST, SevenDayHeader } from './components/SevenDayHeader';
import { TIME_SLOT_META, TimeSlotHeader } from './components/TimeSlotVisual';
import { MedicineCard } from './components/MedicineCard';
import { SevenDayMatrixView } from './components/SevenDayMatrixView';
import { SpokenAudioPlayer } from './components/SpokenAudioPlayer';
import { PrescriptionModal } from './components/PrescriptionModal';
import { PrintableSchedule } from './components/PrintableSchedule';
import { UploadFileHub } from './components/UploadFileHub';
import { TimeIntimationBanner, getSlotFromHour } from './components/TimeIntimationBanner';
import { PostureSelector } from './components/PostureSelector';
import { AdherenceTracker30D } from './components/AdherenceTracker30D';
import { AuthScreen } from './components/auth/AuthScreen';
import { PatientOnboardingWizard } from './components/onboarding/PatientOnboardingWizard';
import { UserProfileMenu } from './components/UserProfileMenu';
import { PWAInstallButton } from './components/PWAInstallButton';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { PRESET_FAMILY_PROFILES, SavedUserProfile } from './data/familyProfiles';
import { BloodDonorSearch } from './components/BloodDonorSearch';
import { OpdQueueHub } from './components/OpdQueueHub';
import { RuralHealthAccess } from './components/RuralHealthAccess';
import { DiseaseDetailsModal } from './components/DiseaseDetailsModal';
import { QuickAddMedicineModal } from './components/QuickAddMedicineModal';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import { PillImageStudioModal } from './components/PillImageStudioModal';
import {
  syncUserProfileToFirestore,
  syncScheduleToFirestore,
  syncAdherenceToFirestore,
  loadUserDataFromFirestore,
  subscribeToSchedule,
  subscribeToAdherence,
  subscribeToUserProfile,
} from './services/firestoreSync';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { audioPlayer } from './utils/audioPlayer';
import {
  TRANSLATIONS,
  SupportedLanguage,
  getLocalizedSpokenExplanation,
} from './utils/translations';
import {
  Heart,
  Printer,
  Sparkles,
  Settings,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle,
  RotateCcw,
  ShieldCheck,
  Info,
  Upload,
  Download,
  FileText,
  Sliders,
  Plus,
  Clock,
  Layers,
  Sparkle,
  TrendingUp,
  X,
  Globe2,
} from 'lucide-react';

// Map JS day index (0=Sun, 1=Mon, ..., 6=Sat) to DayOfWeek
const DAY_INDEX_MAP: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function App() {
  // Current Day
  const currentDayOfWeek: DayOfWeek =
    DAY_INDEX_MAP[new Date().getDay()] || 'Mon';

  // Active Enrolled Patient Profile State
  const [patientProfile, setPatientProfile] = useState<PatientHealthProfile | null>(() => {
    const saved = localStorage.getItem('sahaaya_patient_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        console.warn('Could not parse stored patient profile');
      }
    }
    return null;
  });

  // App View Mode: 'auth' (new app login) | 'onboarding' (patient health enrollment) | 'app' (personalized timetable)
  // Always initialize to 'auth' so login details are asked every time the app opens or refreshes
  const [viewMode, setViewMode] = useState<'auth' | 'onboarding' | 'app'>('auth');

  // Intermediate Auth Data between login and onboarding
  const [authData, setAuthData] = useState<{
    provider: AuthProvider;
    name: string;
    email?: string;
    phoneNumber?: string;
  } | null>(null);

  // Schedule State with schema validation and safe fallback
  const [schedule, setSchedule] = useState<MedicineSchedule>(() => {
    const saved =
      localStorage.getItem('sahaaya_care_schedule_v2') ||
      localStorage.getItem('sahaaya_care_schedule');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.medicines && parsed.medicines.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Could not parse stored schedule');
      }
    }
    return DEFAULT_SCHEDULES.cardiac;
  });

  // Taken logs: key is `${day}-${slot}-${medId}`
  const [takenLogs, setTakenLogs] = useState<Record<string, boolean>>(() => {
    const saved =
      localStorage.getItem('sahaaya_care_taken_logs_v2') ||
      localStorage.getItem('sahaaya_care_taken_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {};
  });

  // UI View & Posture states
  const [activeDay, setActiveDay] = useState<DayOfWeek>(currentDayOfWeek);
  const [currentPosture, setCurrentPosture] = useState<PostureMode>('patient');
  const [isUploadHubOpen, setIsUploadHubOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [showBeginnerBanner, setShowBeginnerBanner] = useState(true);

  // New Service Modals
  const [isBloodDonorOpen, setIsBloodDonorOpen] = useState(false);
  const [isOpdQueueOpen, setIsOpdQueueOpen] = useState(false);
  const [isRuralHealthOpen, setIsRuralHealthOpen] = useState(false);
  const [isDiseaseDetailsOpen, setIsDiseaseDetailsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreSynced, setIsFirestoreSynced] = useState(false);

  // Multi-user family profiles (only real user-added profiles, defaults to empty so no dummy data is pre-populated)
  const [familyProfiles, setFamilyProfiles] = useState<SavedUserProfile[]>(() => {
    const saved = localStorage.getItem('sahaaya_saved_family_profiles_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any old pre-existing preset dummy profiles
          const filtered = parsed.filter(
            (item: any) =>
              item?.profile?.fullName !== 'Lakshmi Devi' &&
              item?.profile?.fullName !== 'Ramesh Kumar' &&
              item?.profile?.fullName !== 'Ananya Sharma' &&
              item?.profile?.fullName !== 'Aarav Kumar (Child - 4 Yrs)' &&
              item?.profile?.fullName !== 'Ramana Murthy' &&
              item?.profile?.fullName !== 'Sitaramaiah'
          );
          if (filtered.length > 0) return filtered;
        }
      } catch (e) {}
    }
    return [];
  });

  // Audio Player & Language states (with speed persistence - Requirement 8)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  const [highlightedPillId, setHighlightedPillId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [speechSpeed, setSpeechSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('sahaaya_speech_speed');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0.4 && parsed < 2.0) return parsed;
    }
    return 0.85; // Default clear, gentle speed
  });

  const handleSelectSpeechSpeed = (newSpeed: number) => {
    setSpeechSpeed(newSpeed);
    try {
      localStorage.setItem('sahaaya_speech_speed', String(newSpeed));
    } catch (e) {}
    audioPlayer.playChime('tap');
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('sahaaya_patient_profile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.primaryLanguage) return p.primaryLanguage;
      } catch (e) {}
    }
    return 'English';
  });
  const [activeSlotNote, setActiveSlotNote] = useState<string | undefined>(undefined);

  // Translation hook & language helpers
  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';
  const langKey: SupportedLanguage =
    isTelugu
      ? 'Telugu'
      : isHindi
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  // Real-time slot detector
  const currentSlotNow = getSlotFromHour(new Date().getHours());

  // Refs to break ping-pong infinite write loops with Firestore onSnapshot
  const isRemoteScheduleSync = useRef(false);
  const isRemoteAdherenceSync = useRef(false);
  const lastSyncedScheduleJson = useRef<string>('');
  const lastSyncedAdherenceJson = useRef<string>('');

  // Firebase Auth State Listener & Real-time Firestore Synchronization
  useEffect(() => {
    let unsubSchedule: (() => void) | null = null;
    let unsubAdherence: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsFirestoreSynced(true);

        // 1. Initial fetch from Firestore
        try {
          const cloudData = await loadUserDataFromFirestore(user.uid);
          if (cloudData.schedule && cloudData.schedule.medicines && cloudData.schedule.medicines.length > 0) {
            isRemoteScheduleSync.current = true;
            lastSyncedScheduleJson.current = JSON.stringify(cloudData.schedule);
            setSchedule(cloudData.schedule);
          }
          if (cloudData.takenLogs) {
            isRemoteAdherenceSync.current = true;
            lastSyncedAdherenceJson.current = JSON.stringify(cloudData.takenLogs);
            setTakenLogs(cloudData.takenLogs);
          }
        } catch (e) {
          console.warn('Firestore initial load notice:', e);
        }

        // 2. Connect real-time onSnapshot listeners for live multi-device storage
        try {
          unsubSchedule = subscribeToSchedule(user.uid, (cloudSchedule) => {
            if (cloudSchedule && cloudSchedule.medicines && cloudSchedule.medicines.length > 0) {
              isRemoteScheduleSync.current = true;
              lastSyncedScheduleJson.current = JSON.stringify(cloudSchedule);
              setSchedule(cloudSchedule);
            }
          });

          unsubAdherence = subscribeToAdherence(user.uid, (cloudLogs) => {
            if (cloudLogs) {
              isRemoteAdherenceSync.current = true;
              lastSyncedAdherenceJson.current = JSON.stringify(cloudLogs);
              setTakenLogs(cloudLogs);
            }
          });
        } catch (subErr) {
          console.warn('Real-time subscription notice:', subErr);
        }
      } else {
        setIsFirestoreSynced(false);
        if (unsubSchedule) unsubSchedule();
        if (unsubAdherence) unsubAdherence();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSchedule) unsubSchedule();
      if (unsubAdherence) unsubAdherence();
    };
  }, []);

  // Save to localStorage and Firestore (with echo write suppression)
  useEffect(() => {
    if (patientProfile) {
      try {
        localStorage.setItem('sahaaya_care_schedule_v2', JSON.stringify(schedule));
      } catch (e) {
        console.warn('Storage save error:', e);
      }

      // If this state update originated from Firestore snapshot, do NOT echo-write back
      if (isRemoteScheduleSync.current) {
        isRemoteScheduleSync.current = false;
        return;
      }

      const json = JSON.stringify(schedule);
      if (json === lastSyncedScheduleJson.current) {
        return; // No real change, skip network write
      }
      lastSyncedScheduleJson.current = json;

      if (auth.currentUser) {
        syncScheduleToFirestore(schedule).catch(() => {});
      }
    }
  }, [schedule, patientProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('sahaaya_care_taken_logs_v2', JSON.stringify(takenLogs));
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    // If this state update originated from Firestore snapshot, do NOT echo-write back
    if (isRemoteAdherenceSync.current) {
      isRemoteAdherenceSync.current = false;
      return;
    }

    const json = JSON.stringify(takenLogs);
    if (json === lastSyncedAdherenceJson.current) {
      return; // No real change, skip network write
    }
    lastSyncedAdherenceJson.current = json;

    if (auth.currentUser) {
      syncAdherenceToFirestore(takenLogs).catch(() => {});
    }
  }, [takenLogs]);

  // Audio helper with fail-safe error handling
  const speakWithState = async (
    text: string,
    pillId?: string,
    slotNote?: string
  ) => {
    setIsPlaying(true);
    setCurrentlySpeakingText(text);
    if (pillId) setHighlightedPillId(pillId);
    if (slotNote) setActiveSlotNote(slotNote);

    try {
      await audioPlayer.speakText({
        text,
        voice: selectedVoice,
        speed: speechSpeed,
        language: selectedLanguage,
        onStart: () => {
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPlaying(false);
          setCurrentlySpeakingText(null);
          setHighlightedPillId(null);
          setActiveSlotNote(undefined);
        },
        onError: () => {
          setIsPlaying(false);
          setCurrentlySpeakingText(null);
          setHighlightedPillId(null);
          setActiveSlotNote(undefined);
        },
      });
    } catch (e) {
      setIsPlaying(false);
      setCurrentlySpeakingText(null);
      setHighlightedPillId(null);
    }
  };

  const handleStopAudio = () => {
    audioPlayer.stop();
    setIsPlaying(false);
    setCurrentlySpeakingText(null);
    setHighlightedPillId(null);
    setActiveSlotNote(undefined);
  };

  // Language switch handler: Updates language, swaps default schedule for full native experience, and gives warm spoken confirmation!
  const handleSelectLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    audioPlayer.playChime('tap');

    if (lang === 'Telugu') {
      setSelectedVoice('Kore'); // Ananya in Telugu
      // If currently using the default english or hindi cardiac schedule, switch smoothly to telugu_cardiac
      if (schedule.regimenTitle.includes('Cardiovascular') || schedule.regimenTitle.includes('हृदय')) {
        setSchedule(DEFAULT_SCHEDULES.telugu_cardiac);
      }
      audioPlayer.speakText({
        text: 'నమస్కారం! తెలుగు భాష ఎంచుకోబడింది. అన్ని మందుల వివరాలు మరియు సమయాలు తెలుగులో స్పష్టంగా వినిపిస్తాయి.',
        language: 'Telugu',
        voice: 'Kore',
        speed: speechSpeed,
      });
    } else if (lang === 'Hindi') {
      setSelectedVoice('Kore'); // Sneha in Hindi
      if (schedule.regimenTitle.includes('Cardiovascular') || schedule.regimenTitle.includes('గుండె')) {
        setSchedule(DEFAULT_SCHEDULES.hindi_cardiac);
      }
      audioPlayer.speakText({
        text: 'नमस्ते! हिंदी भाषा चुनी गई है। अब सभी दवाइयों के निर्देश और समय हिंदी में बोलकर सुनाए जाएंगे।',
        language: 'Hindi',
        voice: 'Kore',
        speed: speechSpeed,
      });
    } else {
      setSelectedVoice('Kore');
      if (schedule.regimenTitle.includes('గుండె') || schedule.regimenTitle.includes('हृदय')) {
        setSchedule(DEFAULT_SCHEDULES.cardiac);
      }
      audioPlayer.speakText({
        text: 'English language selected. All medicine instructions will be spoken aloud in English.',
        language: 'English',
        voice: 'Kore',
        speed: speechSpeed,
      });
    }
  };

  // Play Single Pill
  const handlePlayMedicineAudio = (med: Medicine) => {
    const text = getLocalizedSpokenExplanation(med, selectedLanguage, currentSlotNow);
    speakWithState(text, med.id, `${med.color} ${med.shape}`);
  };

  // Play Slot Audio with Telugu and Hindi translation support
  const handlePlaySlotAudio = (slot: TimeSlot, day: DayOfWeek) => {
    const isTelugu = selectedLanguage === 'Telugu';
    const isHindi = selectedLanguage === 'Hindi';
    const meds = schedule.medicines.filter(
      (m) => m.daysOfWeek.includes(day) && m.slots.includes(slot)
    );

    const slotTitle = t.slots[slot].title;
    const dayLabel = t.days[day]?.full || day;

    if (meds.length === 0) {
      const emptyMsg = isTelugu
        ? `${dayLabel} రోజున ${slotTitle} సమయంలో మీకు ఎలాంటి మందులు లేవు. ప్రశాంతంగా విశ్రాంతి తీసుకోండి!`
        : isHindi
        ? `नमस्ते! ${dayLabel} को ${slotTitle} के समय आपकी कोई दवाई नहीं है। आराम कीजिए!`
        : `You have no medicines scheduled for ${slotTitle} on ${day}.`;
      speakWithState(emptyMsg);
      return;
    }

    const pillDescriptions = meds
      .map((m) => getLocalizedSpokenExplanation(m, selectedLanguage, slot))
      .join(isTelugu ? '. మరియు తదుపరి, ' : isHindi ? '। इसके बाद, ' : ' Next, ');

    const fullText = isTelugu
      ? `నమస్కారం! ${dayLabel} రోజున మీ ${slotTitle} మందుల వివరాలు: ${pillDescriptions}. దయచేసి ఒక గ్లాసు మంచినీరు త్రాగండి. మీ ఆరోగ్యం మాకు ముఖ్యం!`
      : isHindi
      ? `नमस्ते! ${dayLabel} को आपकी ${slotTitle} की दवाइयां इस प्रकार हैं: ${pillDescriptions}। कृपया एक गिलास ताज़ा पानी के साथ आराम से लें। अपना ख्याल रखिए!`
      : `For your ${slotTitle} on ${day}: ${pillDescriptions}. Please take your time and drink plenty of water.`;

    speakWithState(fullText, undefined, `${slotTitle}`);
  };

  // Play Day's Full Schedule Sequentially in selected language
  const handlePlayDaySchedule = async () => {
    const dayMeds = schedule.medicines.filter((m) =>
      m.daysOfWeek.includes(activeDay)
    );

    const isTelugu = selectedLanguage === 'Telugu';
    const isHindi = selectedLanguage === 'Hindi';
    const dayLabel = t.days[activeDay]?.full || activeDay;

    if (dayMeds.length === 0) {
      const noMedsMsg = isTelugu
        ? `${dayLabel} రోజున మీకు ఎలాంటి మందులు లేవు. ప్రశాంతమైన రోజును గడపండి!`
        : isHindi
        ? `${dayLabel} को आपकी कोई दवाई नहीं है। आपका दिन शुभ और सुखद रहे!`
        : `You have no medicines scheduled for ${activeDay}. Have a restful, peaceful day!`;
      speakWithState(noMedsMsg);
      return;
    }

    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'bedtime'];
    const parts: string[] = [
      isTelugu
        ? `నమస్కారం! ${dayLabel} రోజున మీ పూర్తి మందుల సమయ పట్టిక ఇది.`
        : isHindi
        ? `नमस्ते! ${dayLabel} के लिए आपकी दैनिक दवाई की मार्गदर्शिका यह है।`
        : `Good day! Here is your medicine guide for ${activeDay}.`,
    ];

    slots.forEach((s) => {
      const slotMeds = dayMeds.filter((m) => m.slots.includes(s));
      if (slotMeds.length > 0) {
        const slotTitle = t.slots[s].title;
        const descriptions = slotMeds
          .map((m) => getLocalizedSpokenExplanation(m, selectedLanguage, s))
          .join(isTelugu ? ' మరియు, ' : isHindi ? ' और इसके बाद, ' : ' And also, ');
        parts.push(
          isTelugu
            ? `${slotTitle} సమయంలో: ${descriptions}`
            : isHindi
            ? `${slotTitle} के समय: ${descriptions}`
            : `In the ${slotTitle}: ${descriptions}`
        );
      }
    });

    parts.push(
      isTelugu
        ? 'మందులు తీసుకున్న తర్వాత తప్పకుండా ఒక గ్లాసు మంచినీరు త్రాగండి. మీ ఆరోగ్యం బాగుంటుంది!'
        : isHindi
        ? 'दवाइयां लेने के बाद कृपया एक गिलास ताज़ा पानी अवश्य पिएं। आपकी अच्छी सेहत की हम कामना करते हैं!'
        : 'Remember to drink plenty of water and take your time. You are doing wonderful!'
    );
    speakWithState(parts.join(' '), undefined, `${dayLabel}`);
  };

  // Play Full 7-Day Overview
  const handlePlayFullScheduleAudio = () => {
    const isTelugu = selectedLanguage === 'Telugu';
    const isHindi = selectedLanguage === 'Hindi';
    const overview = isTelugu
      ? `${schedule.spokenOverview} మీకు ఏ మందు గురించి తెలియాలన్నా, స్క్రీన్‌పై ఉన్న ఆ మాత్ర బొమ్మను తాకితే చాలు, వివరాలు వినిపిస్తాయి.`
      : isHindi
      ? `${schedule.spokenOverview} आप किसी भी रंगीन गोली पर क्लिक करके उसका विवरण सुन सकते हैं, या इस चार्ट को फ्रिज पर लगा सकते हैं।`
      : `${schedule.spokenOverview} Tape your schedule to the refrigerator, or tap any colored pill on this screen anytime to hear how to take it.`;

    speakWithState(overview, undefined, '7-Day Overview');
  };

  // Checkmark toggle with native language praise
  const handleToggleTaken = (key: string) => {
    const nextState = !takenLogs[key];
    setTakenLogs((prev) => ({
      ...prev,
      [key]: nextState,
    }));

    if (nextState) {
      audioPlayer.playChime('success');
      const praiseText =
        selectedLanguage === 'Telugu'
          ? 'చాలా మంచిది! మీరు ఈ మందును సమయానికి వేసుకున్నారు. మీ ఆరోగ్యం బాగుంటుంది!'
          : selectedLanguage === 'Hindi'
          ? 'बहुत बढ़िया! आपने यह दवाई समय पर ले ली है। अपना ख्याल रखिए!'
          : 'Great job! You marked this pill as swallowed.';
      audioPlayer.speakText({
        text: praiseText,
        voice: selectedVoice,
        speed: speechSpeed,
        language: selectedLanguage,
      });
    } else {
      audioPlayer.playChime('undo');
    }
  };

  // Reset current day's taken logs
  const handleResetTaken = () => {
    const dayLabel = t.days[activeDay]?.full || activeDay;
    if (confirm(t.resetConfirm(dayLabel))) {
      const newLogs = { ...takenLogs };
      Object.keys(newLogs).forEach((key) => {
        if (key.startsWith(`${activeDay}-`)) {
          delete newLogs[key];
        }
      });
      setTakenLogs(newLogs);
      audioPlayer.playChime('undo');
    }
  };

  // Update a single medicine directly (Caregiver posture inline control)
  const handleUpdateMedicine = (id: string, updates: Partial<Medicine>) => {
    setSchedule((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  // Remove a medicine
  const handleRemoveMedicine = (id: string) => {
    setSchedule((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== id),
    }));
  };

  // Add a new medicine in a specific slot
  const handleAddMedicineInSlot = (slot: TimeSlot) => {
    const slotTitle = t.slots[slot].title;
    const colors = [
      { name: 'Golden Yellow', hex: '#FBBF24', shape: 'round' as const },
      { name: 'Sky Blue', hex: '#38BDF8', shape: 'capsule' as const },
      { name: 'Emerald Green', hex: '#10B981', shape: 'oval' as const },
      { name: 'Bright Orange', hex: '#FB923C', shape: 'round' as const },
      { name: 'Lavender Purple', hex: '#A855F7', shape: 'round' as const },
    ];
    const picked = colors[schedule.medicines.length % colors.length];

    const isTelugu = selectedLanguage === 'Telugu';
    const isHindi = selectedLanguage === 'Hindi';

    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: isTelugu ? 'కొత్త మందు (New Medicine)' : isHindi ? 'नई दवाई (New Medicine)' : 'New Prescribed Medicine',
      dosage: '1 Tablet',
      purpose: isTelugu ? 'రోజువారీ ఆరోగ్యం' : isHindi ? 'दैनिक स्वास्थ्य' : 'Daily Wellness & Health',
      color: picked.name,
      colorHex: picked.hex,
      shape: picked.shape,
      slots: [slot],
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      withFood: 'with_meal',
      waterRequirement: 'full_glass',
      spokenExplanation: isTelugu
        ? `${slotTitle} సమయంలో, మీ ${picked.name} మాత్రను ఒక గ్లాసు నీటితో వేసుకోండి.`
        : isHindi
        ? `${slotTitle} के समय, अपनी ${picked.name} गोली एक गिलास पानी के साथ लें।`
        : `In the ${slotTitle}, take your ${picked.name.toLowerCase()} ${picked.shape} pill with a full glass of water.`,
    };

    setSchedule((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMed],
    }));
    audioPlayer.playChime('success');
  };

  // Get medicines for active day
  const getActiveDaySlotMeds = (slot: TimeSlot) => {
    return schedule.medicines.filter(
      (m) => m.daysOfWeek.includes(activeDay) && m.slots.includes(slot)
    );
  };

  const slotsOrder: TimeSlot[] = ['morning', 'afternoon', 'evening', 'bedtime'];

  // Auth & Onboarding Handlers - supports direct family login without email
  const handleAuthSuccess = (
    data: {
      provider: AuthProvider;
      name: string;
      email?: string;
      phoneNumber?: string;
    },
    directProfile?: PatientHealthProfile,
    directSchedule?: MedicineSchedule
  ) => {
    setAuthData(data);

    // If direct profile was selected from family profiles (no email needed):
    if (directProfile && directSchedule) {
      setPatientProfile(directProfile);
      setSchedule(directSchedule);
      if (directProfile.primaryLanguage) {
        setSelectedLanguage(directProfile.primaryLanguage);
      }
      setViewMode('app');
      audioPlayer.playChime('success');
      try {
        localStorage.setItem('sahaaya_patient_profile', JSON.stringify(directProfile));
        localStorage.setItem('sahaaya_care_schedule_v2', JSON.stringify(directSchedule));
      } catch (e) {}
      return;
    }

    // Check if an existing profile is stored for this user account
    const saved = localStorage.getItem('sahaaya_patient_profile');
    if (saved) {
      try {
        const parsed: PatientHealthProfile = JSON.parse(saved);
        // Only load if it matches this user's credentials or guest
        const matchesUser =
          (data.email && parsed.email && data.email.toLowerCase() === parsed.email.toLowerCase()) ||
          (data.phoneNumber && parsed.phoneNumber && data.phoneNumber.trim() === parsed.phoneNumber.trim()) ||
          (data.provider === 'guest');

        if (matchesUser) {
          setPatientProfile(parsed);
          if (parsed.primaryLanguage) {
            setSelectedLanguage(parsed.primaryLanguage);
          }
          setViewMode('app');
          audioPlayer.playChime('success');
          return;
        }
      } catch (e) {
        console.warn('Could not parse stored profile', e);
      }
    }

    // Otherwise, first-time user: proceed to personalized patient onboarding
    setViewMode('onboarding');
  };

  const handleOnboardingComplete = (
    newProfile: PatientHealthProfile,
    newSchedule: MedicineSchedule
  ) => {
    setPatientProfile(newProfile);
    setSchedule(newSchedule);
    setSelectedLanguage(newProfile.primaryLanguage);
    setViewMode('app');
    try {
      localStorage.setItem('sahaaya_patient_profile', JSON.stringify(newProfile));
      localStorage.setItem('sahaaya_care_schedule_v2', JSON.stringify(newSchedule));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    if (auth.currentUser) {
      syncUserProfileToFirestore(newProfile).catch(console.warn);
      syncScheduleToFirestore(newSchedule).catch(console.warn);
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch((e) => console.warn('Firebase signout warning:', e));
    localStorage.removeItem('sahaaya_patient_profile');
    localStorage.removeItem('sahaaya_care_schedule_v2');
    localStorage.removeItem('sahaaya_care_taken_logs_v2');
    setPatientProfile(null);
    setAuthData(null);
    setTakenLogs({});
    setViewMode('auth');
    audioPlayer.playChime('undo');
  };

  const handleNewEnrollment = () => {
    localStorage.removeItem('sahaaya_patient_profile');
    localStorage.removeItem('sahaaya_care_schedule_v2');
    localStorage.removeItem('sahaaya_care_taken_logs_v2');
    setPatientProfile(null);
    setAuthData(null);
    setTakenLogs({});
    setViewMode('auth');
    audioPlayer.playChime('tap');
  };

  const handleEditProfile = () => {
    if (patientProfile) {
      setAuthData({
        provider: patientProfile.authProvider,
        name: patientProfile.fullName,
        email: patientProfile.email,
        phoneNumber: patientProfile.phoneNumber,
      });
    }
    setViewMode('onboarding');
  };

  const handleOpenTablets = () => {
    setIsPrescriptionModalOpen(true);
  };

  const handleQuickAddMedicine = (newMed: Medicine) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        medicines: [...prev.medicines, newMed],
      };
      try {
        localStorage.setItem('sahaaya_care_schedule_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // 1. Freshly Installed App: First Screen asks for Sign In with Google, Phone, or Email
  if (viewMode === 'auth') {
    return (
      <AuthScreen
        onSuccess={handleAuthSuccess}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        speechSpeed={speechSpeed}
        onSetSpeechSpeed={handleSelectSpeechSpeed}
      />
    );
  }

  // 2. Newly Enrolled Patient: Multi-step Health Questionnaire & Tablet Customization
  if (viewMode === 'onboarding') {
    return (
      <PatientOnboardingWizard
        initialAuth={
          authData || {
            provider: 'guest',
            name: patientProfile?.fullName || 'Patient',
            email: patientProfile?.email,
            phoneNumber: patientProfile?.phoneNumber,
          }
        }
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        onComplete={handleOnboardingComplete}
        onCancel={patientProfile ? () => setViewMode('app') : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/30 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Accessible App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4 overflow-x-auto no-scrollbar">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-300">
              <span className="text-xl sm:text-2xl">💊</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-950">
                  {t.appName}
                </span>
                <span className="hidden xs:inline px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  {t.audioVisualBadge}
                </span>
                <span className="hidden md:inline px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  {t.realtimeBadge}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Top Header Actions in a Row: User Details, Languages, Emergency Help SOS */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* 1. Details of the Person: Active Patient Profile & Menu */}
            <UserProfileMenu
              profile={patientProfile}
              onEditProfile={handleEditProfile}
              onOpenTablets={handleOpenTablets}
              onNewEnrollment={handleNewEnrollment}
              onSignOut={handleSignOut}
              onSwitchProfile={() => setViewMode('auth')}
              onOpenBloodDonor={() => setIsBloodDonorOpen(true)}
              onOpenOpdQueue={() => setIsOpdQueueOpen(true)}
              onOpenRuralHealth={() => setIsRuralHealthOpen(true)}
              onOpenDiseaseDetails={() => setIsDiseaseDetailsOpen(true)}
              selectedLanguage={selectedLanguage}
            />

            {/* 2. Languages: Telugu / Hindi / English */}
            <div className="flex items-center p-0.5 sm:p-1 bg-indigo-50/90 border-2 border-indigo-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => handleSelectLanguage('Telugu')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  selectedLanguage === 'Telugu'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 scale-105'
                    : 'text-indigo-950 hover:bg-indigo-100/80'
                }`}
                title="తెలుగులో చూడండి మరియు వినండి (Telugu)"
              >
                <span className="text-xs sm:text-sm">🇮🇳</span>
                <span>తెలుగు</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('Hindi')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  selectedLanguage === 'Hindi'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 scale-105'
                    : 'text-indigo-950 hover:bg-indigo-100/80'
                }`}
                title="हिंदी में देखें और सुनें (Hindi)"
              >
                <span className="text-xs sm:text-sm">🇮🇳</span>
                <span>हिंदी</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('English')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  selectedLanguage === 'English'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 scale-105'
                    : 'text-indigo-950 hover:bg-indigo-100/80'
                }`}
                title="View and listen in English"
              >
                <span className="text-xs sm:text-sm">🇺🇸</span>
                <span>ENG</span>
              </button>
            </div>

            {/* 3. Emergency Help Button (SOS) */}
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-[11px] sm:text-xs shadow-md shadow-rose-500/30 transition-all active:scale-95 cursor-pointer ring-2 ring-red-400 shrink-0"
              title={selectedLanguage === 'Telugu' ? 'అత్యవసర సహాయం (Emergency Help)' : selectedLanguage === 'Hindi' ? 'आपातकालीन सहायता (Emergency Help)' : 'Emergency Help & Voice Protocol'}
            >
              <span className="text-xs sm:text-sm animate-pulse">🚨</span>
              <span className="tracking-wide">
                <span className="hidden sm:inline">
                  {selectedLanguage === 'Telugu' ? 'అత్యవసరం (SOS)' : selectedLanguage === 'Hindi' ? 'आपातकाल (SOS)' : 'Emergency Help'}
                </span>
                <span className="sm:hidden">
                  SOS
                </span>
              </span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Header / Secondary Tool Slide: Patient Status, Tools (Upload, 30D Adherence, Presets, Install, Print) & Services Strip */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Patient Status & Audio Speed Control */}
          <div className="flex flex-wrap items-center gap-2.5">
            {familyProfiles.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <span className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-1 shrink-0">
                  <span>👨‍👩‍👧‍👦</span>
                  <span className="hidden sm:inline">Family:</span>
                </span>

                {familyProfiles.map((item) => {
                  const p = item.profile;
                  const isSelected = patientProfile?.id === p.id || patientProfile?.fullName === p.fullName;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPatientProfile(p);
                        setSchedule(item.schedule);
                        if (p.primaryLanguage) setSelectedLanguage(p.primaryLanguage);
                        audioPlayer.playChime('tap');
                        try {
                          localStorage.setItem('sahaaya_patient_profile', JSON.stringify(p));
                          localStorage.setItem('sahaaya_care_schedule_v2', JSON.stringify(item.schedule));
                        } catch (e) {}
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 scale-102'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                      title={`Switch to ${p.fullName}'s timetable`}
                    >
                      <span>{p.age <= 5 ? '👶' : p.gender === 'female' ? '👵' : '👨'}</span>
                      <span>{p.preferredName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {p.age}y
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {isTelugu
                    ? `${patientProfile?.preferredName || 'రోగి'} యొక్క క్రియాశీల మందుల ప్రణాళిక`
                    : isHindi
                    ? `${patientProfile?.preferredName || 'रोगी'} की सक्रिय दवा समय-सारणी`
                    : `Active Medication Schedule for ${patientProfile?.preferredName || 'Patient'}`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-200">
                  🔒 HIPAA Private
                </span>
              </div>
            )}

            {/* App Audio Speed Selector Widget */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-black shrink-0">
              <span className="px-1.5 text-slate-500 text-[10px] uppercase">⚡ Speed:</span>
              {[
                { val: 0.7, label: '0.7x Slow' },
                { val: 0.85, label: '0.85x' },
                { val: 1.0, label: '1.0x' },
              ].map((spd) => (
                <button
                  key={spd.val}
                  type="button"
                  onClick={() => handleSelectSpeechSpeed(spd.val)}
                  className={`px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                    speechSpeed === spd.val
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Speech Speed: ${spd.label}`}
                >
                  {spd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Tools Brought Down to this Slide (Upload, 30D Adherence, Presets, Install App, Print) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Upload Medical Files & Camera Hub */}
            <button
              type="button"
              onClick={() => setIsUploadHubOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-sm shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
              title="Upload prescription photo, doctor slip, or PDF"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.uploadFiles}</span>
            </button>

            {/* 2. 30D Adherence Tracker Toggle */}
            <button
              type="button"
              onClick={() => setCurrentPosture(currentPosture === 'adherence' ? 'patient' : 'adherence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer border ${
                currentPosture === 'adherence'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 border-indigo-600 ring-2 ring-indigo-300'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
              }`}
              title="Track patient adherence rate over the last 30 days"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              <span>{t.adherence30D}</span>
            </button>

            {/* 3. Clinical Presets Regimen ("presents") */}
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Clinical presets and regimen settings"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.presets}</span>
            </button>

            {/* 4. Mobile / Android / iOS Standalone Install App Button */}
            <PWAInstallButton selectedLanguage={selectedLanguage} variant="header" />

            {/* 5. Print Schedule Option (Wall / Refrigerator Poster) */}
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
              title={t.printChart}
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.printChartBtn || 'Print Chart'}</span>
            </button>
          </div>
        </div>

        {/* Feature Services Strip (Blood Donor, OPD Queue, Rural Health, Disease Details, Add Medicine) */}
        <div className="max-w-6xl mx-auto pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Blood Donor Search */}
            <button
              type="button"
              onClick={() => setIsBloodDonorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🩸 {isTelugu ? 'రక్తదాతల శోధన' : isHindi ? 'ब्लड डोनर खोज' : 'Blood Donor Search'}</span>
            </button>

            {/* 2. OPD Queue & Token */}
            <button
              type="button"
              onClick={() => setIsOpdQueueOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <span>🎟️ {isTelugu ? 'ఓపీడీ క్యూ & టోకెన్' : isHindi ? 'ओपीडी कतार व टोकन' : 'OPD Queue Status'}</span>
            </button>

            {/* 3. Rural Health Access */}
            <button
              type="button"
              onClick={() => setIsRuralHealthOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <span>🏥 {isTelugu ? 'గ్రామీణ ఆరోగ్య సేవలు' : isHindi ? 'ग्रामीण स्वास्थ्य सेवा' : 'Rural Health Access'}</span>
            </button>

            {/* 4. Disease Details Guide */}
            <button
              type="button"
              onClick={() => setIsDiseaseDetailsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <span>🩺 {isTelugu ? 'వ్యాధుల సమగ్ర వివరాలు' : isHindi ? 'रोगों की जानकारी' : 'Disease Details Guide'}</span>
            </button>

            {/* 5. Voice Conversation with Gemini */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ring-1 ring-purple-300"
              title="Speak naturally with Gemini and hear spoken clinical advice"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>🎙️ {isTelugu ? 'వాయిస్ సంభాషణ' : isHindi ? 'वॉइस बातचीत' : 'Voice Conversation'}</span>
            </button>

            {/* 6. Pill & Medical Image Studio */}
            <button
              type="button"
              onClick={() => setIsImageStudioOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ring-1 ring-indigo-300"
              title="Create and edit visual pill graphics with Gemini"
            >
              <span>🎨 {isTelugu ? 'ఇమేజ్ స్టూడియో' : isHindi ? 'इमेज स्टूडियो' : 'Pill Image Studio'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Cloud Database Sync Status */}
            {isFirestoreSynced && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>☁️ Database Synced</span>
              </span>
            )}

            {/* Add Other Medicine / Tablet Quick Button */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isTelugu ? 'ఇతర మందును జోడించండి' : isHindi ? 'अन्य दवाई जोड़ें' : '+ Add Tablet / Medicine'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Mobile / Android / iOS Standalone App Banner */}
        <PWAInstallButton selectedLanguage={selectedLanguage} variant="banner" />

        {/* Beginner-Friendly Onboarding Banner */}
        {showBeginnerBanner && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300/80 shadow-sm flex items-start sm:items-center justify-between gap-3 text-slate-900 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🗣️</span>
              <div>
                <span className="text-xs sm:text-sm font-black text-amber-950 block">
                  {selectedLanguage === 'Telugu'
                    ? 'బిగినర్-ఫ్రెండ్లీ ఆడియో మార్గదర్శి'
                    : selectedLanguage === 'Hindi'
                    ? 'सरल बोलती ऑडियो गाइड'
                    : 'Beginner-Friendly Audio Experience'}
                </span>
                <p className="text-xs sm:text-sm text-amber-900 font-semibold mt-0.5">
                  {t.beginnerHelperBanner}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowBeginnerBanner(false)}
              className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-xs font-black shrink-0 transition-colors"
            >
              {t.beginnerHelperDismiss} ✕
            </button>
          </div>
        )}

        {/* Real-Time Medicine Intimation Banner */}
        <TimeIntimationBanner
          schedule={schedule}
          activeDay={activeDay}
          takenLogs={takenLogs}
          selectedLanguage={selectedLanguage}
          onAnnounceSlot={handlePlaySlotAudio}
        />

        {/* Posture Controller Bar (Patient Posture, Caregiver Editor, Matrix, Print) */}
        <PostureSelector
          currentPosture={currentPosture}
          onChangePosture={(p) => {
            setCurrentPosture(p);
            if (p === 'print') {
              setIsPrintModalOpen(true);
            }
          }}
          medicinesCount={schedule.medicines.length}
          selectedLanguage={selectedLanguage}
        />

        {/* Prominent Audio Guide Bar */}
        <SpokenAudioPlayer
          currentlySpeakingText={currentlySpeakingText}
          isPlaying={isPlaying}
          onStop={handleStopAudio}
          onPlayTodayRoutine={handlePlayDaySchedule}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          speechSpeed={speechSpeed}
          onSelectSpeed={setSpeechSpeed}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleSelectLanguage}
          activeSegmentNote={activeSlotNote}
          emergencyContact={schedule.emergencyContact}
        />

        {/* 7-Day Header & Day Selector (hidden in 30-day adherence view) */}
        {currentPosture !== 'adherence' && (
          <SevenDayHeader
            days={DAYS_LIST}
            activeDay={activeDay}
            onSelectDay={(day) => {
              setActiveDay(day);
              audioPlayer.playChime('tap');
            }}
            schedule={schedule}
            takenLogs={takenLogs}
            viewMode={currentPosture === 'matrix' ? 'matrix' : 'daily'}
            onToggleViewMode={(mode) => setCurrentPosture(mode === 'matrix' ? 'matrix' : 'patient')}
            onPlayFullScheduleAudio={handlePlayFullScheduleAudio}
            isPlaying={isPlaying && activeSlotNote === '7-Day Overview'}
            selectedLanguage={selectedLanguage}
          />
        )}

        {/* Main View Area based on Posture */}
        {currentPosture === 'adherence' ? (
          <AdherenceTracker30D
            schedule={schedule}
            takenLogs={takenLogs}
            selectedLanguage={selectedLanguage}
            onClose={() => setCurrentPosture('patient')}
          />
        ) : currentPosture !== 'matrix' ? (
          <div className="space-y-6">
            {/* Day Header & Caregiver Note */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🗓️</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {t.dayScheduleHeading(t.days[activeDay]?.full || activeDay)}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {currentPosture === 'caregiver'
                      ? t.dayScheduleHelpCaregiver
                      : t.dayScheduleHelpPatient}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayDaySchedule}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-200 active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.hearAllDayPills(t.days[activeDay]?.short || activeDay)}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTaken}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                  title={t.resetTakenForDay}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Time Slot Sections */}
            <div className="space-y-6">
              {slotsOrder.map((slot) => {
                const meds = getActiveDaySlotMeds(slot);
                const isCurrentActiveSlot = currentSlotNow === slot;
                const isSlotSpeaking = activeSlotNote?.toLowerCase().includes(slot);

                return (
                  <div
                    key={slot}
                    className={`p-4 sm:p-6 bg-white rounded-3xl border-2 transition-all space-y-4 ${
                      isCurrentActiveSlot
                        ? 'border-indigo-400/80 shadow-md ring-2 ring-indigo-200'
                        : 'border-slate-200 shadow-2xs'
                    }`}
                  >
                    <TimeSlotHeader
                      slot={slot}
                      active={isSlotSpeaking || isCurrentActiveSlot}
                      onAudioClick={() => handlePlaySlotAudio(slot, activeDay)}
                      onAddPill={() => handleAddMedicineInSlot(slot)}
                      isCaregiverPosture={currentPosture === 'caregiver'}
                      pillCount={meds.length}
                      selectedLanguage={selectedLanguage}
                    />

                    {/* Pill Cards */}
                    {meds.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {meds.map((med) => {
                          const cardKey = `${activeDay}-${slot}-${med.id}`;
                          const isTaken = Boolean(takenLogs[cardKey]);
                          const isHighlighted = highlightedPillId === med.id;
                          const isDueNow = isCurrentActiveSlot;

                          return (
                            <MedicineCard
                              key={cardKey}
                              medicine={med}
                              slot={slot}
                              day={activeDay}
                              isTaken={isTaken}
                              isHighlighted={isHighlighted}
                              isDueNow={isDueNow}
                              isCaregiverPosture={currentPosture === 'caregiver'}
                              onToggleTaken={handleToggleTaken}
                              onPlayAudio={handlePlayMedicineAudio}
                              onUpdateMedicine={handleUpdateMedicine}
                              onRemoveMedicine={handleRemoveMedicine}
                              selectedLanguage={selectedLanguage}
                              selectedVoice={selectedVoice}
                              speechSpeed={speechSpeed}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 font-semibold">
                          {t.noMedsInSlot}
                        </p>
                        {currentPosture === 'caregiver' && (
                          <button
                            type="button"
                            onClick={() => handleAddMedicineInSlot(slot)}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.addPillHere}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Weekly Matrix View */
          <SevenDayMatrixView
            schedule={schedule}
            takenLogs={takenLogs}
            onToggleTaken={handleToggleTaken}
            onPlayMedicineAudio={handlePlayMedicineAudio}
            onPlaySlotAudio={handlePlaySlotAudio}
            selectedLanguage={selectedLanguage}
          />
        )}

        {/* Non-Reader Accessibility & Wall Chart Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-2xl shadow-sm">
              💡
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950">
                {t.caregiverBannerTitle}
              </h4>
              <p className="text-xs text-amber-900 font-medium mt-0.5 leading-relaxed">
                {t.caregiverBannerDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 shadow-md shadow-amber-200 active:scale-95 cursor-pointer"
          >
            {t.printChartBtn}
          </button>
        </div>
      </main>

      {/* Floating Modals */}
      {isUploadHubOpen && (
        <UploadFileHub
          isOpen={isUploadHubOpen}
          onClose={() => setIsUploadHubOpen(false)}
          onApplySchedule={(newSched) => {
            setSchedule(newSched);
            setIsUploadHubOpen(false);
            audioPlayer.playChime('success');
          }}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleSelectLanguage}
        />
      )}

      {isPrescriptionModalOpen && (
        <PrescriptionModal
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          currentSchedule={schedule}
          onSaveSchedule={(newSched) => {
            setSchedule(newSched);
            setIsPrescriptionModalOpen(false);
            audioPlayer.playChime('success');
          }}
          selectedLanguage={selectedLanguage}
        />
      )}

      {isPrintModalOpen && (
        <PrintableSchedule
          schedule={schedule}
          onClose={() => setIsPrintModalOpen(false)}
          selectedLanguage={selectedLanguage}
        />
      )}

      {/* Prominent Emergency Help Protocol Modal */}
      {isEmergencyModalOpen && (
        <EmergencyHelpModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          selectedLanguage={selectedLanguage}
          patientName={schedule.patientName || patientProfile?.fullName || 'Patient'}
          emergencyContact={schedule.emergencyContact}
        />
      )}

      {/* 1. Blood Donor Search Modal */}
      {isBloodDonorOpen && (
        <BloodDonorSearch
          isOpen={isBloodDonorOpen}
          onClose={() => setIsBloodDonorOpen(false)}
          selectedLanguage={selectedLanguage}
        />
      )}

      {/* 2. OPD Queue Hub Modal */}
      {isOpdQueueOpen && (
        <OpdQueueHub
          isOpen={isOpdQueueOpen}
          onClose={() => setIsOpdQueueOpen(false)}
          selectedLanguage={selectedLanguage}
          defaultPatientName={patientProfile?.preferredName || schedule.patientName}
          defaultAge={patientProfile?.age || 45}
          defaultPhone={patientProfile?.phoneNumber}
        />
      )}

      {/* 3. Rural Health Access Hub Modal */}
      {isRuralHealthOpen && (
        <RuralHealthAccess
          isOpen={isRuralHealthOpen}
          onClose={() => setIsRuralHealthOpen(false)}
          selectedLanguage={selectedLanguage}
        />
      )}

      {/* 4. In-Depth Disease Details Modal */}
      {isDiseaseDetailsOpen && (
        <DiseaseDetailsModal
          isOpen={isDiseaseDetailsOpen}
          onClose={() => setIsDiseaseDetailsOpen(false)}
          selectedLanguage={selectedLanguage}
          userConditionIds={patientProfile?.selectedConditions || []}
        />
      )}

      {/* 5. Quick Add Medicine Modal */}
      {isQuickAddOpen && (
        <QuickAddMedicineModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onAddMedicine={handleQuickAddMedicine}
          selectedLanguage={selectedLanguage}
        />
      )}

      {/* 7. Voice Conversation with Gemini Speech & Audio Synthesis */}
      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentSchedule={schedule}
        selectedLanguage={selectedLanguage}
      />

      {/* 8. Pill & Medical Image Studio powered by Gemini 3.1 Flash Lite Image */}
      <PillImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectGeneratedImage={(img) => {
          // If user generated an image for their schedule, add/update first medicine
          if (schedule.medicines.length > 0) {
            setSchedule((prev) => {
              const updated = {
                ...prev,
                medicines: prev.medicines.map((m, idx) =>
                  idx === 0 ? { ...m, colorHex: '#4F46E5', spokenExplanation: `${m.spokenExplanation} (Custom visual pill generated)` } : m
                ),
              };
              return updated;
            });
          }
        }}
      />
    </div>
  );
}
