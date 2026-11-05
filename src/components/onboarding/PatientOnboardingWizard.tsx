import React, { useState } from 'react';
import {
  PatientHealthProfile,
  Gender,
  AuthProvider,
} from '../../types/user';
import {
  Medicine,
  MedicineSchedule,
  DayOfWeek,
  TimeSlot,
  PillShape,
  FoodInstruction,
} from '../../types/medicine';
import { HEALTH_CONDITIONS_CATALOG } from '../../data/healthConditionsCatalog';
import { PillVisual } from '../PillVisual';
import { audioPlayer } from '../../utils/audioPlayer';
import {
  User,
  Heart,
  Activity,
  Pill,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Clock,
  Droplet,
  ShieldAlert,
  Plus,
  Trash2,
  Check,
  CheckCircle,
  HelpCircle,
  Stethoscope,
  Smile,
  AlertCircle,
  Settings2,
} from 'lucide-react';

interface PatientOnboardingWizardProps {
  initialAuth: {
    provider: AuthProvider;
    name: string;
    email?: string;
    phoneNumber?: string;
  };
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onComplete: (profile: PatientHealthProfile, schedule: MedicineSchedule) => void;
  onCancel?: () => void;
}

export function PatientOnboardingWizard({
  initialAuth,
  selectedLanguage,
  onSelectLanguage,
  onComplete,
  onCancel,
}: PatientOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Patient Identity & Demographics
  const isGenericAuthName = !initialAuth.name || initialAuth.name === 'Google User' || initialAuth.name === 'Patient' || initialAuth.name === 'Guest Patient';
  const [fullName, setFullName] = useState(isGenericAuthName ? '' : initialAuth.name);
  const [preferredName, setPreferredName] = useState(
    isGenericAuthName ? '' : initialAuth.name.split(' ')[0]
  );
  const [age, setAge] = useState<number>(65);
  const [gender, setGender] = useState<Gender>('female');
  const [role, setRole] = useState<'self' | 'caregiver_for_patient'>('self');
  const [cannotRead, setCannotRead] = useState<boolean>(true); // Default to true for spoken assistance!
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Step 2: Daily Healthcare Properties & Routine Times
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('13:00');
  const [eveningTeaTime, setEveningTeaTime] = useState('17:30');
  const [dinnerBedTime, setDinnerBedTime] = useState('21:00');
  const [waterGlasses, setWaterGlasses] = useState(8);
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [mobilityStatus, setMobilityStatus] = useState<'independent' | 'assisted' | 'bedrest'>('independent');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['None']);
  const [customAllergy, setCustomAllergy] = useState('');

  // Step 3: Disease & Health Conditions
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    'hypertension',
    'diabetes',
  ]);
  const [customCondition, setCustomCondition] = useState('');
  const [customDiseasesList, setCustomDiseasesList] = useState<string[]>([]);

  const handleAddCustomDisease = (disease: string) => {
    if (!customDiseasesList.includes(disease)) {
      const updated = [...customDiseasesList, disease];
      setCustomDiseasesList(updated);
      setCustomCondition(updated.join(', '));
    }
  };

  const handleRemoveCustomDisease = (disease: string) => {
    const updated = customDiseasesList.filter((d) => d !== disease);
    setCustomDiseasesList(updated);
    setCustomCondition(updated.join(', '));
  };
  // Dynamic Follow-up Health Questions
  const [diabetesType, setDiabetesType] = useState<'type2' | 'type1' | 'prediabetes' | 'none'>('type2');
  const [takingInsulin, setTakingInsulin] = useState(false);
  const [hasMorningDizziness, setHasMorningDizziness] = useState(false);
  const [takingBloodThinners, setTakingBloodThinners] = useState(true);
  const [thyroidEmptyStomachNeeded, setThyroidEmptyStomachNeeded] = useState(true);
  const [hasAsthmaInhaler, setHasAsthmaInhaler] = useState(false);
  const [dietaryNotes, setDietaryNotes] = useState('Low salt, low sugar diet advised by doctor');

  // Step 4: Tablets & Prescriptions Customization
  const [customMedicines, setCustomMedicines] = useState<Medicine[]>(() => {
    // Start with smart defaults from selected initial conditions
    const initialMeds: Medicine[] = [
      {
        id: `med-${Date.now()}-1`,
        name: 'Amlodipine (Blood Pressure Relaxer)',
        dosage: '5 mg',
        purpose: 'Maintains steady blood pressure',
        color: 'Golden Yellow',
        colorHex: '#FBBF24',
        shape: 'round',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        spokenExplanation:
          'In the morning after your breakfast, take one round golden yellow pill with water for blood pressure.',
      },
      {
        id: `med-${Date.now()}-2`,
        name: 'Metformin (Blood Sugar Control)',
        dosage: '500 mg',
        purpose: 'Balances daily blood glucose levels',
        color: 'Clean White',
        colorHex: '#FFFFFF',
        shape: 'oval',
        slots: ['morning', 'evening'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        spokenExplanation:
          'Take your white oval tablet twice a day with meals: once at breakfast, once at dinner.',
      },
      {
        id: `med-${Date.now()}-3`,
        name: 'Baby Aspirin (Artery Shield)',
        dosage: '81 mg',
        purpose: 'Prevents blood clots and keeps arteries clear',
        color: 'Clean White',
        colorHex: '#FFFFFF',
        shape: 'round',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        spokenExplanation:
          'At midday lunch right after eating, take your small white round tablet with a full glass of water.',
      },
      {
        id: `med-${Date.now()}-4`,
        name: 'Atorvastatin (Cholesterol Vessel Guard)',
        dosage: '20 mg',
        purpose: 'Protects blood vessels while sleeping',
        color: 'Sky Blue',
        colorHex: '#38BDF8',
        shape: 'capsule',
        slots: ['bedtime'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'no_preference',
        waterRequirement: 'full_glass',
        spokenExplanation:
          'At bedtime before turning off lights to sleep, take your sky blue capsule with a glass of water.',
      },
    ];
    return initialMeds;
  });

  // Medicine Builder Editor State
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 Tablet');
  const [newMedPurpose, setNewMedPurpose] = useState('Daily Health Maintenance');
  const [newMedColor, setNewMedColor] = useState('Golden Yellow');
  const [newMedColorHex, setNewMedColorHex] = useState('#FBBF24');
  const [newMedShape, setNewMedShape] = useState<PillShape>('round');
  const [newMedSlots, setNewMedSlots] = useState<TimeSlot[]>(['morning']);
  const [newMedFood, setNewMedFood] = useState<FoodInstruction>('after_meal');
  const [newMedSpoken, setNewMedSpoken] = useState('');

  // Audio voice test state
  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  // Spoken Step Instructions
  const speakStepInstruction = (stepNum: number) => {
    let text = '';
    if (stepNum === 1) {
      text = isTelugu
        ? `దశ ఒకటి: రోగి వివరాలు. దయచేసి మీ పేరు, వయస్సు మరియు లింగం నమోదు చేయండి.`
        : isHindi
        ? `पहला चरण: मरीज का परिचय। कृपया अपना नाम, उम्र और लिंग दर्ज करें।`
        : `Step one: Patient identity. Please tell us your name, age, and healthcare preferences.`;
    } else if (stepNum === 2) {
      text = isTelugu
        ? `దశ రెండు: మీ రోజువారీ ఆహార సమయాలు మరియు వ్యాధులు. "Other" పక్కన ఉన్న చాట్ బాక్స్‌లో మీ వ్యాధిని చెప్పవచ్చు లేదా టైప్ చేయవచ్చు.`
        : isHindi
        ? `दूसरा चरण: आपकी दिनचर्या और बीमारियां। "Other" के पास दिए गए चैट बॉक्स में बोलकर या लिखकर अपनी बीमारी बताएं।`
        : `Step two: Daily healthcare routine, meal times, and health conditions. You can use the chat box at the side of "Other" to say or type your disease.`;
    } else if (stepNum === 3) {
      text = isTelugu
        ? `దశ మూడు: మీ ఆరోగ్య పరిస్థితులు మరియు వ్యాధులు. మీకు బీపీ, షుగర్ లేదా గుండె సంబంధిత సమస్యలు ఏవి ఉన్నాయో ఎంచుకోండి.`
        : isHindi
        ? `तीसरा चरण: आपकी बीमारी और स्वास्थ्य स्थितियां। ब्लड प्रेशर, शुगर, या हृदय रोग चुनें ताकि हम सही सवाल पूछ सकें।`
        : `Step three: Health conditions and diseases. Select your conditions so we can tailor the health questions and reminders.`;
    } else if (stepNum === 4) {
      text = isTelugu
        ? `దశ నాలుగు: మీ మందులు మరియు మాత్రల వివరాలు. రంగు, ఆకారం మరియు సమయం ఇక్కడ చూసి మార్చుకోవచ్చు.`
        : isHindi
        ? `चौथा चरण: आपकी दवाइयां और गोलियां। प्रत्येक गोली का रंग, आकार और लेने का समय कस्टमाइज़ करें।`
        : `Step four: Customize your tablets and prescriptions. Pick their visual colors and shapes for easy recognition.`;
    } else {
      text = isTelugu
        ? `చివరి దశ: అభినందనలు! మీ 7 రోజుల ప్రత్యేక మందుల సమయ పట్టిక సిద్ధమైంది.`
        : isHindi
        ? `अंतिम चरण: बहुत बढ़िया! आपकी व्यक्तिगत 7-दिवसीय दवाई समय सारिणी तैयार है।`
        : `Final step: Congratulations! Your personalized 7-day spoken medicine timetable is ready.`;
    }

    audioPlayer.speakText({
      text,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  // Toggle Health Condition
  const toggleCondition = (condId: string) => {
    audioPlayer.playChime('tap');
    if (selectedConditions.includes(condId)) {
      setSelectedConditions((prev) => prev.filter((c) => c !== condId));
    } else {
      setSelectedConditions((prev) => [...prev, condId]);
      // Also add common medicines from this condition if not already present
      const matched = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === condId);
      if (matched && matched.commonMedicines.length > 0) {
        const candidate = matched.commonMedicines[0];
        const exists = customMedicines.some((m) => m.name.toLowerCase().includes(candidate.name.toLowerCase().split(' ')[0]));
        if (!exists) {
          setCustomMedicines((prev) => [
            ...prev,
            {
              id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: candidate.name,
              dosage: candidate.dosage,
              purpose: candidate.purpose,
              color: candidate.color,
              colorHex: candidate.colorHex,
              shape: candidate.shape,
              slots: candidate.slots,
              daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              withFood: candidate.withFood,
              waterRequirement: 'full_glass',
              spokenExplanation: candidate.spokenExplanation,
            },
          ]);
        }
      }
    }
  };

  // Quick preset color picker for tablets
  const PILL_COLORS = [
    { name: 'Golden Yellow', hex: '#FBBF24' },
    { name: 'Sky Blue', hex: '#38BDF8' },
    { name: 'Clean White', hex: '#FFFFFF' },
    { name: 'Soft Pink', hex: '#F472B6' },
    { name: 'Coral Red', hex: '#EF4444' },
    { name: 'Emerald Green', hex: '#10B981' },
    { name: 'Bright Orange', hex: '#FB923C' },
    { name: 'Lavender Purple', hex: '#A855F7' },
  ];

  const PILL_SHAPES: PillShape[] = [
    'round',
    'oval',
    'capsule',
    'square',
    'liquid_drop',
    'triangle',
  ];

  // Add/Save Medicine in Step 4
  const handleSaveMedicineItem = () => {
    if (!newMedName.trim()) {
      alert(isTelugu ? 'దయచేసి మందు పేరు నమోదు చేయండి' : isHindi ? 'कृपया दवाई का नाम लिखें' : 'Please provide a medicine name');
      return;
    }

    const autoSpoken =
      newMedSpoken.trim() ||
      (isTelugu
        ? `${newMedSlots.join(', ')} సమయంలో, మీ ${newMedColor} మాత్రను ఒక గ్లాసు నీటితో వేసుకోండి.`
        : isHindi
        ? `${newMedSlots.join(', ')} के समय, अपनी ${newMedColor} गोली पानी के साथ लें।`
        : `Take your ${newMedColor.toLowerCase()} ${newMedShape} pill during ${newMedSlots.join(' and ')} with a full glass of water.`);

    const medObj: Medicine = {
      id: editingMedIndex !== null ? customMedicines[editingMedIndex].id : `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 Tablet',
      purpose: newMedPurpose.trim() || 'Daily health care',
      color: newMedColor,
      colorHex: newMedColorHex,
      shape: newMedShape,
      slots: newMedSlots.length > 0 ? newMedSlots : ['morning'],
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      withFood: newMedFood,
      waterRequirement: 'full_glass',
      spokenExplanation: autoSpoken,
    };

    if (editingMedIndex !== null) {
      setCustomMedicines((prev) =>
        prev.map((m, idx) => (idx === editingMedIndex ? medObj : m))
      );
      setEditingMedIndex(null);
    } else {
      setCustomMedicines((prev) => [...prev, medObj]);
    }

    // Reset editor inputs
    setNewMedName('');
    setNewMedDosage('1 Tablet');
    setNewMedPurpose('Daily Health Maintenance');
    setNewMedSpoken('');
    audioPlayer.playChime('success');
  };

  const handleEditMed = (index: number) => {
    const target = customMedicines[index];
    setEditingMedIndex(index);
    setNewMedName(target.name);
    setNewMedDosage(target.dosage);
    setNewMedPurpose(target.purpose);
    setNewMedColor(target.color);
    setNewMedColorHex(target.colorHex);
    setNewMedShape(target.shape);
    setNewMedSlots(target.slots);
    setNewMedFood(target.withFood);
    setNewMedSpoken(target.spokenExplanation);
  };

  const handleDeleteMed = (index: number) => {
    setCustomMedicines((prev) => prev.filter((_, i) => i !== index));
    if (editingMedIndex === index) {
      setEditingMedIndex(null);
    }
    audioPlayer.playChime('undo');
  };

  // Complete Onboarding
  const handleFinish = () => {
    audioPlayer.playChime('success');

    // Build Patient Profile
    const profile: PatientHealthProfile = {
      id: `patient-${Date.now()}`,
      fullName: fullName.trim() || 'Patient',
      preferredName: preferredName.trim() || fullName.trim() || 'Patient',
      email: initialAuth.email,
      phoneNumber: initialAuth.phoneNumber,
      authProvider: initialAuth.provider,
      age: Number(age) || 60,
      gender: gender,
      role: role,
      cannotRead: cannotRead,
      primaryLanguage: selectedLanguage as any,
      routineTimes: {
        wakeAndBreakfast: breakfastTime,
        lunch: lunchTime,
        eveningTea: eveningTeaTime,
        dinnerAndSleep: dinnerBedTime,
      },
      allergies: selectedAllergies,
      bloodGroup: bloodGroup,
      waterGoalGlasses: waterGlasses,
      mobilityStatus: mobilityStatus,
      selectedConditions: selectedConditions,
      conditionAnswers: {
        diabetesType,
        takingInsulin,
        hasMorningDizziness,
        takingBloodThinners,
        thyroidEmptyStomachNeeded,
        hasAsthmaInhaler,
        customConditionsText: customCondition,
        dietaryNotes,
      },
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation,
      },
      createdAt: new Date().toISOString(),
    };

    // Build Custom Regimen Title
    const conditionTitles = selectedConditions
      .map((c) => HEALTH_CONDITIONS_CATALOG.find((cat) => cat.id === c)?.name.split(' ')[0])
      .filter(Boolean)
      .join(' & ');

    const regimenTitle = conditionTitles
      ? `${preferredName}'s Personal ${conditionTitles} Care Regimen`
      : `${preferredName}'s 7-Day Care Regimen`;

    const spokenWelcome = isTelugu
      ? `నమస్కారం ${preferredName} గారు! మీ వ్యక్తిగత 7-రోజుల మందుల సమయ పట్టిక సిద్ధమైంది. ఉదయం అల్పాహారం తర్వాత, మధ్యాహ్నం మరియు రాత్రి వేళల్లో మీ మాత్రల గురించి స్పష్టమైన ఆడియో సూచనలు వినవచ్చు.`
      : isHindi
      ? `नमस्ते ${preferredName} जी! आपकी व्यक्तिगत 7-दिवसीय दवाई समय सारिणी तैयार है। सुबह नाश्ते के बाद, दोपहर और रात को सोने से पहले अपनी हर गोली का निर्देश सुनने के लिए बस गोली पर टैप करें।`
      : `Welcome ${preferredName}! Here is your personalized daily medicine schedule. Tap any colored pill anytime to hear instructions spoken aloud.`;

    const finalSchedule: MedicineSchedule = {
      regimenTitle,
      patientName: preferredName,
      patientNotes: `Customized for ${preferredName} (${age}y, ${gender}). Routine: Breakfast ${breakfastTime}, Lunch ${lunchTime}, Sleep ${dinnerBedTime}. ${dietaryNotes}`,
      spokenOverview: spokenWelcome,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation,
      },
      medicines: customMedicines.length > 0 ? customMedicines : [
        {
          id: `med-${Date.now()}`,
          name: 'Daily Multivitamin & Health Support',
          dosage: '1 Tablet',
          purpose: 'Daily vitality and wellness',
          color: 'Golden Yellow',
          colorHex: '#FBBF24',
          shape: 'round',
          slots: ['morning'],
          daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          withFood: 'after_meal',
          waterRequirement: 'full_glass',
          spokenExplanation: 'In the morning after breakfast, take your golden yellow pill with water.',
        },
      ],
    };

    // Play spoken congratulations
    audioPlayer.speakText({
      text: spokenWelcome,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });

    onComplete(profile, finalSchedule);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Wizard Navigation */}
      <header className="max-w-4xl w-full mx-auto px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            📋
          </div>
          <div>
            <h1 className="text-base font-black text-white">
              {isTelugu ? 'నూతన రోగి నమోదు & అనుకూలీకరణ' : isHindi ? 'नया मरीज पंजीकरण और प्रोफाइल' : 'New Patient Health Enrollment'}
            </h1>
            <p className="text-xs text-indigo-200">
              {isTelugu
                ? `దశ ${currentStep} / ${totalSteps}`
                : isHindi
                ? `चरण ${currentStep} / ${totalSteps}`
                : `Step ${currentStep} of ${totalSteps} • Personalizing for You`}
            </p>
          </div>
        </div>

        {/* Spoken Assistance for Current Step */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakStepInstruction(currentStep)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Listen to this step spoken aloud"
          >
            <Volume2 className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span className="hidden sm:inline">
              {isTelugu ? 'ఈ దశను వినండి' : isHindi ? 'यह चरण सुनें' : 'Listen'}
            </span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-indigo-300 hover:text-white px-2 py-1 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-3 pb-2">
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Content Card */}
      <main className="max-w-4xl w-full mx-auto px-4 py-4 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200/80">
          {/* STEP 1: Patient Identity & Demographics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                  Step 1 • Identity & Demographics
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isTelugu
                    ? 'రోగి పూర్తి వివరాలు తెలపండి'
                    : isHindi
                    ? 'मरीज का बुनियादी परिचय'
                    : 'Tell us about the patient'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isTelugu
                    ? 'సరైన సంరక్షణ మరియు వాయిస్ సూచనల కోసం రోగి పేరు మరియు వయస్సు నమోదు చేయండి.'
                    : isHindi
                    ? 'सटीक ऑडियो गाइड और दवाई की खुराक के लिए सही जानकारी दें।'
                    : 'We customize the voice assistant, timetable alerts, and pill sizes based on these details.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isTelugu ? 'రోగి పూర్తి పేరు' : isHindi ? 'मरीज का पूरा नाम' : 'Full Legal Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance or Patient Legal Name"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isTelugu ? 'వాయిస్ పిలవాల్సిన పేరు (Preferred Name)' : isHindi ? 'पुकारने का नाम (Preferred Name)' : 'Preferred Name / Called As'}
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="e.g. Eleanor, Mom, Dad, Amma"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Age */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-700">
                      {isTelugu ? 'వయస్సు (1వ సంవత్సరం నుండి ప్రారంభం)' : isHindi ? 'उम्र (1 वर्ष से शुरू)' : 'Age (Starts from 1st year)'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      {age <= 5 ? (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          👶 Infant / Toddler
                        </span>
                      ) : age <= 12 ? (
                        <span className="text-[10px] font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                          🧒 Child (Pediatric)
                        </span>
                      ) : null}
                      <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {age} yrs
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-indigo-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                    <span>1 yr</span>
                    <span>12 yrs</span>
                    <span>45 yrs</span>
                    <span>70 yrs</span>
                    <span>100+ yrs</span>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isTelugu ? 'లింగం (Gender)' : isHindi ? 'लिंग (Gender)' : 'Gender'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'male', label: 'Male 👨' },
                      { val: 'female', label: 'Female 👩' },
                      { val: 'other', label: 'Other 🤝' },
                    ].map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => setGender(g.val as Gender)}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          gender === g.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient Literacy / Accessibility Choice */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🗣️</span>
                  <div>
                    <h3 className="text-xs font-black text-amber-950">
                      {isTelugu ? 'చదవలేని రోగుల కోసం ప్రత్యేక సహాయం' : isHindi ? 'पढ़ने में असमर्थ मरीजों के लिए विशेष सुविधा' : 'Accessibility & Non-Reader Spoken Mode'}
                    </h3>
                    <p className="text-[11px] text-amber-900">
                      {isTelugu
                        ? 'రోగి అక్షరాలు చదవలేకపోతే, రంగులు మరియు పెద్ద స్పోకెన్ ఆడియో బటన్లను ప్రముఖంగా చూపిస్తాము.'
                        : isHindi
                        ? 'यदि मरीज पढ़ नहीं सकते, तो हम रंगीन गोलियां और बोलती आवाज़ पर ज़ोर देंगे।'
                        : 'If patient cannot read text, we enable ultra-vibrant pill shape cues and auto-play spoken voice.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="cannotRead"
                      checked={cannotRead}
                      onChange={() => setCannotRead(true)}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span>{isTelugu ? 'అవును, ఆడియో మరియు రంగులతో గైడ్ చేయండి (రాయడం/చదవడం రాదు)' : isHindi ? 'हाँ, बोलकर सुनाएं और रंगीन चित्र दिखाएं (पढ़ नहीं सकते)' : 'Yes, rely on spoken voice & color cues (Non-reader mode)'}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="cannotRead"
                      checked={!cannotRead}
                      onChange={() => setCannotRead(false)}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span>{isTelugu ? 'సాధారణ రీడర్ మోడ్' : isHindi ? 'सामान्य टेक्स्ट मोड' : 'Standard reader mode'}</span>
                  </label>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>
                    {isTelugu ? 'అత్యవసర సంరక్షకుని వివరాలు (Emergency Contact)' : isHindi ? 'आपातकालीन देखभालकर्ता (Emergency Contact)' : 'Emergency Family / Caregiver Contact'}
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Name (e.g. Son Rahul)"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={10}
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit Phone (9876543210)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                    />
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                      {emergencyPhone.length}/10 digits
                    </span>
                  </div>
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Relation (e.g. Son, Daughter)"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Healthcare Properties & Schedule Routine */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                  Step 2 • Healthcare Properties & Daily Schedule
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isTelugu
                    ? 'మీ రోజువారీ దినచర్య మరియు ఆహార సమయాలు'
                    : isHindi
                    ? 'आपकी दिनचर्या और भोजन का समय'
                    : 'Daily Healthcare Routine & Timings'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isTelugu
                    ? 'రోగి అల్పాహారం మరియు భోజన సమయాలకు అనుగుణంగా మందుల సూచనలను సమన్వయం చేస్తాము.'
                    : isHindi
                    ? 'दवाइयों को आपके नाश्ते, दोपहर के भोजन और सोने के समय के साथ जोड़ा जाएगा।'
                    : 'Medicines work best when synchronized with your real daily meals and sleep cycle.'}
                </p>
              </div>

              {/* Routine Times Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌅</span>
                    <div>
                      <span className="text-xs font-black text-amber-950 block">Morning Breakfast</span>
                      <span className="text-[10px] text-amber-700">Empty stomach / with breakfast</span>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={breakfastTime}
                    onChange={(e) => setBreakfastTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-black text-slate-900 text-center"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">☀️</span>
                    <div>
                      <span className="text-xs font-black text-sky-950 block">Midday Lunch</span>
                      <span className="text-[10px] text-sky-700">Heart aspirin & bone vitamins</span>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={lunchTime}
                    onChange={(e) => setLunchTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 text-xs font-black text-slate-900 text-center"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌇</span>
                    <div>
                      <span className="text-xs font-black text-orange-950 block">Evening Tea</span>
                      <span className="text-[10px] text-orange-700">Second sugar dose / tea time</span>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={eveningTeaTime}
                    onChange={(e) => setEveningTeaTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-orange-300 text-xs font-black text-slate-900 text-center"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌙</span>
                    <div>
                      <span className="text-xs font-black text-indigo-950 block">Bedtime Sleep</span>
                      <span className="text-[10px] text-indigo-700">Night vessel protector / sleep</span>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={dinnerBedTime}
                    onChange={(e) => setDinnerBedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 text-xs font-black text-slate-900 text-center"
                  />
                </div>
              </div>

              {/* Water & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Droplet className="w-4 h-4 text-sky-500" />
                    <span>Daily Water Reminder</span>
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">{waterGlasses} glasses/day</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setWaterGlasses((p) => Math.max(4, p - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setWaterGlasses((p) => Math.min(15, p + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-black text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Blood Group</span>
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900"
                  >
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                    <option value="Unknown">Unknown / Not tested</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>Mobility & Posture</span>
                  </label>
                  <select
                    value={mobilityStatus}
                    onChange={(e) => setMobilityStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900"
                  >
                    <option value="independent">Walks independently</option>
                    <option value="assisted">Needs family assistance</option>
                    <option value="bedrest">Bedrest / Wheelchair</option>
                  </select>
                </div>
              </div>

              {/* Drug Allergies */}
              <div className="border-t border-slate-100 pt-3">
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Any Known Drug / Medicine Allergies?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['None', 'Penicillin', 'Sulfa Drugs', 'Aspirin / NSAIDs', 'Codeine', 'Other'].map(
                    (allg) => {
                      const isSel = selectedAllergies.includes(allg);
                      return (
                        <button
                          key={allg}
                          type="button"
                          onClick={() => {
                            if (allg === 'None') {
                              setSelectedAllergies(['None']);
                            } else {
                              setSelectedAllergies((prev) => {
                                const clean = prev.filter((x) => x !== 'None');
                                return clean.includes(allg)
                                  ? clean.filter((x) => x !== allg)
                                  : [...clean, allg];
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {allg}
                        </button>
                      );
                    }
                  )}
                  {selectedAllergies.includes('Other') && (
                    <input
                      type="text"
                      value={customAllergy}
                      onChange={(e) => setCustomAllergy(e.target.value)}
                      placeholder="Specify other allergy / reaction..."
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-rose-500 shadow-2xs"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Diseases & Health Conditions Questionnaire */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                  Step 3 • Health Conditions & Clinical Assessment
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isTelugu
                    ? 'మీకు ఏవైనా వ్యాధులు లేదా ఆరోగ్య సమస్యలు ఉన్నాయా?'
                    : isHindi
                    ? 'आपको कौन सी बीमारियां या स्वास्थ्य समस्याएं हैं?'
                    : 'What diseases or health conditions do you have?'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isTelugu
                    ? 'మీరు ఎంచుకున్న సమస్యల ఆధారంగా మేము తగిన మందుల సూచనలు మరియు నియమాలను తయారు చేస్తాము.'
                    : isHindi
                    ? 'आपके द्वारा चुनी गई बीमारियों के अनुसार डॉक्टर द्वारा सुझाई दवाइयां अपने आप जुड़ जाएंगी।'
                    : 'Select all that apply. We automatically configure specialized questions and prescription recommendations.'}
                </p>
              </div>

              {/* Conditions Multi-Select Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HEALTH_CONDITIONS_CATALOG.map((cond) => {
                  const isSelected = selectedConditions.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => toggleCondition(cond.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cond.icon}</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">
                              {cond.name}
                            </h4>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">
                              {cond.category}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-2">
                        {cond.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Condition free-form */}
              <div className="pt-2">
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Any Other Condition or Doctor Advice?
                </label>
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  placeholder="e.g. Mild glaucoma, fatty liver grade 1, post knee surgery"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              {/* DYNAMIC FOLLOW-UP HEALTH QUESTIONS */}
              <div className="border-t border-slate-200 pt-5 space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>Clinical Follow-up Questions Based On Your Health</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Diabetes Questions */}
                  {selectedConditions.includes('diabetes') && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        🩸 Diabetes Specifics
                      </span>
                      <p className="text-[11px] text-amber-900 font-medium">
                        Do you take insulin injections or oral tablets only?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTakingInsulin(false)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            !takingInsulin
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white border border-amber-200 text-amber-900'
                          }`}
                        >
                          Oral Tablets Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setTakingInsulin(true)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            takingInsulin
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white border border-amber-200 text-amber-900'
                          }`}
                        >
                          Insulin + Tablets
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Blood Pressure Questions */}
                  {selectedConditions.includes('hypertension') && (
                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
                      <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                        🩺 Blood Pressure Safety
                      </span>
                      <p className="text-[11px] text-sky-900 font-medium">
                        Do you ever experience morning dizziness after getting out of bed?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setHasMorningDizziness(false)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            !hasMorningDizziness
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-white border border-sky-200 text-sky-900'
                          }`}
                        >
                          No dizziness
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasMorningDizziness(true)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            hasMorningDizziness
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-white border border-sky-200 text-sky-900'
                          }`}
                        >
                          Yes, mild dizziness
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Heart Questions */}
                  {selectedConditions.includes('cardiac') && (
                    <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                      <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                        ❤️ Cardiac & Blood Flow
                      </span>
                      <p className="text-[11px] text-rose-900 font-medium">
                        Are you on daily prescribed blood thinners (e.g. Aspirin / Clopidogrel)?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTakingBloodThinners(true)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            takingBloodThinners
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-white border border-rose-200 text-rose-900'
                          }`}
                        >
                          Yes, taking blood thinners
                        </button>
                        <button
                          type="button"
                          onClick={() => setTakingBloodThinners(false)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            !takingBloodThinners
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-white border border-rose-200 text-rose-900'
                          }`}
                        >
                          No blood thinners
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Thyroid Questions */}
                  {selectedConditions.includes('thyroid') && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                      <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        🦋 Thyroid Protocol
                      </span>
                      <p className="text-[11px] text-indigo-900 font-medium">
                        Do you need an early morning empty stomach alarm (30m before tea)?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setThyroidEmptyStomachNeeded(true)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            thyroidEmptyStomachNeeded
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-indigo-200 text-indigo-900'
                          }`}
                        >
                          Yes, empty stomach alert
                        </button>
                        <button
                          type="button"
                          onClick={() => setThyroidEmptyStomachNeeded(false)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            !thyroidEmptyStomachNeeded
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-indigo-200 text-indigo-900'
                          }`}
                        >
                          Not required
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Tablets & Prescriptions Customization */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                  Step 4 • Prescriptions & Tablets Customization
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isTelugu
                    ? 'మీరు వాడే మాత్రలు & ప్రిస్క్రిప్షన్ల వివరాలు'
                    : isHindi
                    ? 'आप कौन सी दवाइयां और गोलियां लेते हैं?'
                    : 'What tablets and prescriptions do you use?'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isTelugu
                    ? 'మేము మీ వ్యాధులకు అనుగుణంగా ప్రాథమిక మాత్రలను సూచించాము. రంగు, ఆకారం మరియు సమయం సులభంగా మార్చుకోవచ్చు.'
                    : isHindi
                    ? 'प्रत्येक गोली का रंग, आकार और लेने का समय अपनी दवाइयों के अनुसार सेट करें।'
                    : 'Review and customize your exact tablets. Give each a distinct color and shape so it is instantly recognizable!'}
                </p>
              </div>

              {/* Current List of Configured Medicines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Configured Tablets ({customMedicines.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMedIndex(null);
                      setNewMedName('');
                      setNewMedDosage('1 Tablet');
                      setNewMedPurpose('Daily Wellness');
                      setNewMedColor('Golden Yellow');
                      setNewMedColorHex('#FBBF24');
                      setNewMedShape('round');
                      setNewMedSlots(['morning']);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Tablet</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customMedicines.map((med, idx) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <PillVisual
                            shape={med.shape}
                            colorHex={med.colorHex}
                            colorName={med.color}
                            size="md"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">
                            {med.name}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-500 block">
                            {med.dosage} • {med.slots.join(', ')}
                          </span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-700">
                            {med.color} {med.shape}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditMed(idx)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 text-xs font-bold"
                          title="Edit tablet"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMed(idx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Remove tablet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tablet Customizer / Editor Form */}
              <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50/50 border-2 border-indigo-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span>
                      {editingMedIndex !== null
                        ? `Editing Tablet #${editingMedIndex + 1}`
                        : 'Add or Customize a Tablet'}
                    </span>
                  </h3>
                  {editingMedIndex !== null && (
                    <button
                      type="button"
                      onClick={() => setEditingMedIndex(null)}
                      className="text-xs font-bold text-indigo-700 hover:underline"
                    >
                      Cancel editing
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Tablet Name
                    </label>
                    <input
                      type="text"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="e.g. Telmisartan or Metformin"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Dosage / Strength
                    </label>
                    <input
                      type="text"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="e.g. 40 mg, 500 mg, 1 Tablet"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Color and Shape with Live Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                      Visual Pill Color
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PILL_COLORS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setNewMedColor(c.name);
                            setNewMedColorHex(c.hex);
                          }}
                          className={`w-full aspect-square rounded-xl flex items-center justify-center border-2 transition-transform cursor-pointer ${
                            newMedColor === c.name
                              ? 'border-indigo-600 scale-110 shadow-xs'
                              : 'border-slate-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {newMedColor === c.name && (
                            <Check className="w-3.5 h-3.5 stroke-[3] text-slate-900" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">
                      Pill Physical Shape
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PILL_SHAPES.map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => setNewMedShape(sh)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer capitalize ${
                            newMedShape === sh
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {sh.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Visual Preview */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-indigo-200 text-center">
                    <span className="text-[10px] font-black text-indigo-700 uppercase mb-1">
                      Visual Pill Identifier
                    </span>
                    <div className="w-14 h-14 flex items-center justify-center">
                      <PillVisual
                        shape={newMedShape}
                        colorHex={newMedColorHex}
                        colorName={newMedColor}
                        size="lg"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-900 mt-1">
                      {newMedColor} {newMedShape.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Timing Slots */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    When to Take (Time of Day):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { slot: 'morning' as TimeSlot, label: '🌅 Morning Breakfast' },
                      { slot: 'afternoon' as TimeSlot, label: '☀️ Midday Lunch' },
                      { slot: 'evening' as TimeSlot, label: '🌇 Evening Tea' },
                      { slot: 'bedtime' as TimeSlot, label: '🌙 Bedtime Sleep' },
                    ].map((s) => {
                      const isSel = newMedSlots.includes(s.slot);
                      return (
                        <button
                          key={s.slot}
                          type="button"
                          onClick={() => {
                            setNewMedSlots((prev) =>
                              isSel
                                ? prev.filter((x) => x !== s.slot)
                                : [...prev, s.slot]
                            );
                          }}
                          className={`p-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveMedicineItem}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {editingMedIndex !== null ? 'Save Changes to Tablet' : '+ Save & Add to My Timetable'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Generate Timetable */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-200 mb-3">
                  ✨
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 block mb-1">
                  Ready to Launch • Step 5 of 5
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isTelugu
                    ? `${preferredName} గారి టైమ్‌టేబుల్ సిద్ధమైంది!`
                    : isHindi
                    ? `${preferredName} जी की समय सारिणी तैयार है!`
                    : `All set for ${preferredName}!`}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {isTelugu
                    ? 'మీ ఆరోగ్య వివరాలు, వ్యాధులు మరియు రంగుల మాత్రలతో కూడిన 7 రోజుల కస్టమ్ షెడ్యూల్ సిద్ధంగా ఉంది.'
                    : isHindi
                    ? 'आपकी सेहत की जानकारी और रंगीन गोलियों के साथ 7 दिनों का व्यक्तिगत चार्ट तैयार है।'
                    : 'We have assembled your personalized 7-day spoken medicine schedule with high-contrast pill visualizers.'}
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Patient Profile
                  </h4>
                  <div className="text-xs space-y-1 text-slate-700">
                    <p>
                      <strong className="text-slate-900">Name:</strong> {fullName} ({preferredName})
                    </p>
                    <p>
                      <strong className="text-slate-900">Age & Gender:</strong> {age} yrs • {gender}
                    </p>
                    <p>
                      <strong className="text-slate-900">Primary Language:</strong> {selectedLanguage}
                    </p>
                    <p>
                      <strong className="text-slate-900">Caregiver Contact:</strong> {emergencyName} ({emergencyPhone})
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Health Conditions & Tablets
                  </h4>
                  <div className="text-xs space-y-1 text-slate-700">
                    <p>
                      <strong className="text-slate-900">Selected Conditions:</strong>{' '}
                      {selectedConditions.join(', ') || 'General Wellness'}
                    </p>
                    <p>
                      <strong className="text-slate-900">Total Active Tablets:</strong> {customMedicines.length} medicines
                    </p>
                    <p>
                      <strong className="text-slate-900">Spoken Mode:</strong> Non-reader high audio enabled
                    </p>
                    <p>
                      <strong className="text-slate-900">Water Goal:</strong> {waterGlasses} glasses daily
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Audio Welcome Button */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-amber-700 stroke-[2.5]" />
                  <div>
                    <span className="text-xs font-black text-amber-950 block">
                      Test Spoken Welcome Greeting
                    </span>
                    <span className="text-[11px] text-amber-900">
                      Hear how the voice sounds in {selectedLanguage}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const testMsg = isTelugu
                      ? `నమస్కారం ${preferredName} గారు! సహాయ కేర్ కు స్వాగతం. మీ మందుల సమయ పట్టిక సిద్ధమైంది.`
                      : isHindi
                      ? `नमस्ते ${preferredName} जी! सहाय केयर में आपका स्वागत है। आपकी दवाई समय सारिणी तैयार है।`
                      : `Welcome ${preferredName}! Your medicine timetable is ready.`;
                    audioPlayer.speakText({
                      text: testMsg,
                      language: selectedLanguage,
                      voice: 'Kore',
                      speed: 0.85,
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-xs active:scale-95"
                >
                  Play Voice Test
                </button>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls (Back / Next / Finish) */}
          <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep((p) => p - 1);
                  audioPlayer.playChime('tap');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => {
                  // Step validation
                  if (currentStep === 1 && !fullName.trim()) {
                    alert('Please enter patient name');
                    return;
                  }
                  setCurrentStep((p) => p + 1);
                  audioPlayer.playChime('tap');
                }}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                <span>Open My Timetable</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
