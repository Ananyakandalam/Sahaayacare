import { TimeSlot, DayOfWeek, PillShape, FoodInstruction, Medicine } from '../types/medicine';

export type SupportedLanguage = 'English' | 'Telugu' | 'Hindi';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  audioVisualBadge: string;
  realtimeBadge: string;
  beginnerHelperBanner: string;
  beginnerHelperDismiss: string;
  
  // Navigation / Actions
  uploadFiles: string;
  adherence30D: string;
  presets: string;
  printChart: string;
  workspacePosture: string;
  
  // Postures
  posturePatientAudio: string;
  posturePatientAudioSub: string;
  postureCaregiver: string;
  postureCaregiverSub: string;
  postureAdherence: string;
  postureAdherenceSub: string;
  postureMatrix: string;
  postureMatrixSub: string;
  posturePrint: string;
  posturePrintSub: string;
  caregiverActiveAlert: string;
  
  // 7-Day Header
  timetableTitleBadge: string;
  forPatient: string;
  hear7DayGuide: string;
  speakingSchedule: string;
  dayView: string;
  fullWeekMatrix: string;
  
  // Days
  days: Record<DayOfWeek, { short: string; full: string }>;
  
  // Intimation Banner
  timeNow: string;
  dueNowBadge: string;
  allDoneBadge: string;
  restPeriodBadge: string;
  allDoneTitle: string;
  allDoneDesc: string;
  dueNowTitle: string;
  dueNowDesc: string;
  restTitle: string;
  restDesc: string;
  pillsForRoutine: string;
  intimateNowBtn: string;
  testTimeLabel: string;
  resetBtn: string;
  
  // Time Slots
  slots: Record<
    TimeSlot,
    {
      title: string;
      sub: string;
      timeRange: string;
      routineLabel: string;
    }
  >;
  
  // Medicine Card
  dueNowTag: string;
  listenBtn: string;
  spokenGuideLabel: string;
  iSwallowedBtn: string;
  takenUndoBtn: string;
  purposeLabel: string;
  addPillHere: string;
  hearRoutine: string;
  pillsCountLabel: (count: number) => string;
  noMedsInSlot: string;
  
  // Cues
  withFood: string;
  afterMeal: string;
  emptyStomach: string;
  fullGlassWater: string;
  normalSip: string;
  
  // Audio Player
  spokenAudioGuide: string;
  readyToSpeak: string;
  speakingNow: string;
  audioDesc: string;
  speedSlow: string;
  speedNormal: string;
  speedLively: string;
  voiceOptionsBtn: string;
  voicePersonaLabel: string;
  spokenLanguageLabel: string;
  caregiverContact: string;
  hearNurseAssistance: string;
  friendlyActiveDesc: string;
  
  // Daily View Header
  dayScheduleHeading: (dayFull: string) => string;
  dayScheduleHelpPatient: string;
  dayScheduleHelpCaregiver: string;
  hearAllDayPills: (day: string) => string;
  resetTakenForDay: string;
  resetConfirm: (day: string) => string;
  
  // Wall chart banner
  caregiverBannerTitle: string;
  caregiverBannerDesc: string;
  printChartBtn: string;
  
  // Colors & Shapes
  colors: Record<string, string>;
  shapes: Record<PillShape, string>;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  English: {
    appName: 'Sahaaya Care',
    appSubtitle: 'Spoken 7-Day Medicine Guide with Visual Cues for Patients Who Cannot Read',
    audioVisualBadge: 'Audio & Visual',
    realtimeBadge: 'Real-Time Intimations',
    beginnerHelperBanner: '💡 Beginner-Friendly Guide: Tap any colored pill to hear spoken instructions out loud in your language! Tap the big buttons to mark pills taken.',
    beginnerHelperDismiss: 'Got it',
    
    uploadFiles: 'Upload Medical Files',
    adherence30D: '30D Adherence',
    presets: 'Presets',
    printChart: 'Print Chart',
    workspacePosture: 'Workspace Posture:',
    
    posturePatientAudio: 'Patient Audio',
    posturePatientAudioSub: 'Tactile voice & visual pill icons for non-readers',
    postureCaregiver: 'Caregiver Edit',
    postureCaregiverSub: 'Quick inline adjustments for dose, times & rules',
    postureAdherence: '30-Day Adherence',
    postureAdherenceSub: 'Recharts trends, streaks & time-of-day analytics',
    postureMatrix: '7-Day Matrix',
    postureMatrixSub: 'Full Mon–Sun grid with adherence tracking',
    posturePrint: 'Wall / Fridge Chart',
    posturePrintSub: 'High-contrast poster for refrigerator posting',
    caregiverActiveAlert: 'Inline Edit Mode Active • Changes save automatically',
    
    timetableTitleBadge: '7-Day Medicine Timetable',
    forPatient: 'For',
    hear7DayGuide: '🔊 Hear 7-Day Guide',
    speakingSchedule: 'Speaking Schedule...',
    dayView: 'Day View',
    fullWeekMatrix: 'Full Week Matrix',
    
    days: {
      Mon: { short: 'Mon', full: 'Monday' },
      Tue: { short: 'Tue', full: 'Tuesday' },
      Wed: { short: 'Wed', full: 'Wednesday' },
      Thu: { short: 'Thu', full: 'Thursday' },
      Fri: { short: 'Fri', full: 'Friday' },
      Sat: { short: 'Sat', full: 'Saturday' },
      Sun: { short: 'Sun', full: 'Sunday' },
    },
    
    timeNow: 'Current Time',
    dueNowBadge: 'Pills Due Right Now',
    allDoneBadge: 'All Done for Now!',
    restPeriodBadge: 'Rest Period',
    allDoneTitle: 'All medicines for this time are completed!',
    allDoneDesc: 'Great job! Stay hydrated and relax until your next routine.',
    dueNowTitle: 'Time for your routine medicines!',
    dueNowDesc: 'Please take your prescribed pills with water as directed.',
    restTitle: 'No medicines scheduled right now.',
    restDesc: 'Stay hydrated and relax until your next routine.',
    pillsForRoutine: 'Pills for this routine:',
    intimateNowBtn: 'Intimate Patient Now Aloud 📢',
    testTimeLabel: 'Test Time:',
    resetBtn: 'Reset',
    
    slots: {
      morning: {
        title: 'Morning Routine',
        sub: 'Breakfast Awakening',
        timeRange: '06:00 AM – 11:00 AM',
        routineLabel: 'When waking up & eating your morning breakfast',
      },
      afternoon: {
        title: 'Midday Routine',
        sub: 'Lunchtime & Daylight',
        timeRange: '11:00 AM – 04:00 PM',
        routineLabel: 'Middle of the day with lunch or soup',
      },
      evening: {
        title: 'Evening Routine',
        sub: 'Dinnertime & Sunset',
        timeRange: '04:00 PM – 08:00 PM',
        routineLabel: 'Around sunset with your warm evening meal',
      },
      bedtime: {
        title: 'Bedtime Routine',
        sub: 'Rest & Night Guard',
        timeRange: '08:00 PM – 06:00 AM',
        routineLabel: 'Right before turning off your bedroom lights to sleep',
      },
    },
    
    dueNowTag: 'Due Now!',
    listenBtn: 'Listen',
    spokenGuideLabel: '🗣️ Spoken Guide:',
    iSwallowedBtn: 'I Swallowed This Pill ✅',
    takenUndoBtn: 'Taken! Tap to Undo',
    purposeLabel: 'Purpose:',
    addPillHere: '+ Add Pill Here',
    hearRoutine: 'Hear Routine',
    pillsCountLabel: (c) => `${c} Pill${c !== 1 ? 's' : ''}`,
    noMedsInSlot: 'No medicines scheduled for this routine on this day.',
    
    withFood: 'With Food 🍽️',
    afterMeal: 'After Meal 🥣',
    emptyStomach: 'Empty Stomach ⏳',
    fullGlassWater: 'Full Glass Water 🥛',
    normalSip: 'Water Sip 💧',
    
    spokenAudioGuide: 'Spoken Audio Guide',
    readyToSpeak: 'Ready to Speak Your Timetable',
    speakingNow: 'Speaking Instructions Out Loud...',
    audioDesc: 'Friendly, affectionate voice with crystal-clear enunciation designed for non-readers and elderly patients.',
    speedSlow: '🐢 Slow',
    speedNormal: 'Normal',
    speedLively: 'Lively 🐇',
    voiceOptionsBtn: 'Voice Options',
    voicePersonaLabel: 'Friendly Voice Persona:',
    spokenLanguageLabel: 'Spoken Language:',
    caregiverContact: 'Caregiver / Nurse Contact:',
    hearNurseAssistance: 'Hear Nurse Assistance',
    friendlyActiveDesc: 'Friendly, affectionate and unhurried tone active with clear enunciation.',
    
    dayScheduleHeading: (dayFull) => `${dayFull} Schedule`,
    dayScheduleHelpPatient: 'Tap any card or speaker button to hear spoken instructions aloud.',
    dayScheduleHelpCaregiver: 'Caregiver Mode: Use inline controls to change dose, times, colors, or add pills.',
    hearAllDayPills: (day) => `Hear All ${day} Pills`,
    resetTakenForDay: 'Reset taken pills for today',
    resetConfirm: (day) => `Reset all taken checkmarks for ${day} to start fresh?`,
    
    caregiverBannerTitle: 'Visual & Tactile Caregiver Intimation Guide:',
    caregiverBannerDesc: 'Color-code physical pill boxes (morning yellow, midday blue, night purple) to match the visual icons on this screen. Use "Print Chart" to tape a guide to the refrigerator!',
    printChartBtn: 'Print Visual Refrigerator Chart 🖨️',
    
    colors: {
      'Golden Yellow': 'Golden Yellow',
      'Sky Blue': 'Sky Blue',
      'Ruby Red': 'Ruby Red',
      'Emerald Green': 'Emerald Green',
      'Lavender Purple': 'Lavender Purple',
      'Bright Orange': 'Bright Orange',
      'Soft Pink': 'Soft Pink',
      'Clean White': 'Clean White',
      'Golden Amber': 'Golden Amber',
    },
    shapes: {
      round: 'Round Tablet',
      oval: 'Oval Pill',
      capsule: 'Capsule',
      square: 'Square Tablet',
      liquid_drop: 'Liquid Drop',
      triangle: 'Triangle Tablet',
    },
  },
  
  Telugu: {
    appName: 'సహాయ కేర్ (Sahaaya Care)',
    appSubtitle: 'చదవడం రాని రోగుల కోసం రంగుల గుర్తులు మరియు స్పష్టమైన మాట్లాడే మందుల సమయ పట్టిక',
    audioVisualBadge: 'వినే మాటలు & రంగులు',
    realtimeBadge: 'సమయానికి గుర్తులు',
    beginnerHelperBanner: '💡 సులభమైన గైడ్: స్క్రీన్‌పై ఉన్న ఏ రంగు మాత్రనైనా తాకండి, అది ఎప్పుడు ఎలా వేసుకోవాలో తెలుగులో స్పష్టంగా వినిపిస్తుంది! వేసుకున్న తర్వాత పెద్ద బటన్‌ను నొక్కండి.',
    beginnerHelperDismiss: 'సరే',
    
    uploadFiles: 'వైద్య పత్రాల అప్‌లోడ్',
    adherence30D: '30 రోజుల రికార్డు',
    presets: 'సిద్ధంగా ఉన్న పట్టికలు',
    printChart: 'ముద్రణ చార్ట్',
    workspacePosture: 'పని విధానం:',
    
    posturePatientAudio: 'రోగి మాట్లాడే మార్గదర్శి',
    posturePatientAudioSub: 'చదవడం రాని వారి కోసం స్వర మార్గదర్శి & రంగుల గుర్తులు',
    postureCaregiver: 'కేర్‌గివర్ సవరణ',
    postureCaregiverSub: 'మందు మోతాదు, సమయాలు మరియు రంగులను సులభంగా మార్చండి',
    postureAdherence: '30 రోజుల ఫలితాలు',
    postureAdherenceSub: 'గ్రాఫ్‌లు, రోజువారీ క్రమశిక్షణ మరియు సమయ విశ్లేషణ',
    postureMatrix: '7 రోజుల పట్టిక',
    postureMatrixSub: 'సోమవారం నుండి ఆదివారం వరకు పూర్తి వారం పట్టిక',
    posturePrint: 'ఫ్రిజ్ / గోడ పోస్టర్',
    posturePrintSub: 'ఫ్రిజ్ లేదా గోడపై అతికించే స్పష్టమైన ముద్రణ చార్ట్',
    caregiverActiveAlert: 'కేర్‌గివర్ ఎడిట్ మోడ్ ఆన్‌లో ఉంది • మార్పులు నేరుగా సేవ్ అవుతాయి',
    
    timetableTitleBadge: '7 రోజుల మందుల సమయ పట్టిక',
    forPatient: 'రోగి:',
    hear7DayGuide: '🔊 7 రోజుల గైడ్ వినండి',
    speakingSchedule: 'వివరాలు మాట్లాడుతోంది...',
    dayView: 'రోజు వీక్షణ',
    fullWeekMatrix: 'పూర్తి వారం పట్టిక',
    
    days: {
      Mon: { short: 'సోమ', full: 'సోమవారం (Monday)' },
      Tue: { short: 'మంగళ', full: 'మంగళవారం (Tuesday)' },
      Wed: { short: 'బుధ', full: 'బుధవారం (Wednesday)' },
      Thu: { short: 'గురు', full: 'గురువారం (Thursday)' },
      Fri: { short: 'శుక్ర', full: 'శుక్రవారం (Friday)' },
      Sat: { short: 'శని', full: 'శనివారం (Saturday)' },
      Sun: { short: 'ఆది', full: 'ఆదివారం (Sunday)' },
    },
    
    timeNow: 'ప్రస్తుత సమయం',
    dueNowBadge: 'ఇప్పుడే వేసుకోవాల్సిన మందులు',
    allDoneBadge: 'ఈ సమయానికి అన్నీ పూర్తయ్యాయి!',
    restPeriodBadge: 'విశ్రాంతి సమయం',
    allDoneTitle: 'ఈ సమయానికి మందులన్నీ విజయవంతంగా వేసుకున్నారు!',
    allDoneDesc: 'చాలా మంచిది! తగినంత నీరు త్రాగి తదుపరి సమయం వరకు ప్రశాంతంగా విశ్రాంతి తీసుకోండి.',
    dueNowTitle: 'ఇప్పుడు మీ మందులు వేసుకునే సమయం అయింది!',
    dueNowDesc: 'దయచేసి సూచించిన మందులను ఒక గ్లాసు నీటితో నిదానంగా వేసుకోండి.',
    restTitle: 'ప్రస్తుత సమయానికి మీకు ఎలాంటి మందులు లేవు.',
    restDesc: 'తగినంత నీరు త్రాగి విశ్రాంతి తీసుకోండి.',
    pillsForRoutine: 'ఈ సమయానికి వేసుకోవాల్సిన మాత్రలు:',
    intimateNowBtn: 'ఇప్పుడే రోగికి గట్టిగా చెప్పండి 📢',
    testTimeLabel: 'సమయ పరీక్ష:',
    resetBtn: 'రీసెట్',
    
    slots: {
      morning: {
        title: 'ఉదయపు వేళ (Morning)',
        sub: 'అల్పాహారం & మేల్కొనే సమయం',
        timeRange: 'ఉదయం 06:00 – 11:00',
        routineLabel: 'ఉదయం నిద్రలేచి అల్పాహారం లేదా టిఫిన్ తినే సమయంలో',
      },
      afternoon: {
        title: 'మధ్యాహ్నపు వేళ (Midday)',
        sub: 'మధ్యాహ్న భోజన సమయం',
        timeRange: 'మధ్యాహ్నం 11:00 – 04:00',
        routineLabel: 'మధ్యాహ్న భోజనం చేసిన తర్వాత లేదా భోజనంతో పాటు',
      },
      evening: {
        title: 'సాయంత్రపు వేళ (Evening)',
        sub: 'సాయంత్రం భోజనం & సూర్యాస్తమయం',
        timeRange: 'సాయంత్రం 04:00 – రాత్రి 08:00',
        routineLabel: 'సాయంత్రం సంధ్యా సమయంలో రాత్రి భోజనంతో పాటు',
      },
      bedtime: {
        title: 'రాత్రి నిద్రవేళ (Bedtime)',
        sub: 'నిద్ర & రాత్రి రక్షణ',
        timeRange: 'రాత్రి 08:00 – ఉదయం 06:00',
        routineLabel: 'రాత్రి పడుకునే ముందు పడకగది లైట్లు ఆర్పే సమయంలో',
      },
    },
    
    dueNowTag: 'ఇప్పుడే వేసుకోవాలి!',
    listenBtn: 'వినండి 🔊',
    spokenGuideLabel: '🗣️ మాట్లాడే మార్గదర్శి:',
    iSwallowedBtn: 'నేను ఈ మందు వేసుకున్నాను ✅',
    takenUndoBtn: 'వేసుకున్నారు! రద్దు చేయు',
    purposeLabel: 'ఉద్దేశ్యం:',
    addPillHere: '+ ఇక్కడ మందును జోడించండి',
    hearRoutine: 'వివరాలు వినండి',
    pillsCountLabel: (c) => `${c} మాత్ర${c !== 1 ? 'లు' : ''}`,
    noMedsInSlot: 'ఈ రోజు ఈ సమయానికి ఎలాంటి మందులు లేవు.',
    
    withFood: 'ఆహారంతో పాటు 🍽️',
    afterMeal: 'భోజనం తర్వాత 🥣',
    emptyStomach: 'ఖాళీ కడుపుతో ⏳',
    fullGlassWater: 'నిండు గ్లాసు నీరు 🥛',
    normalSip: 'మంచినీటితో 💧',
    
    spokenAudioGuide: 'తెలుగు మాట్లాడే ఆడియో గైడ్',
    readyToSpeak: 'మీ మందుల వివరాలు చెప్పడానికి సిద్ధంగా ఉంది',
    speakingNow: 'సూచనలను తెలుగులో గట్టిగా చదువుతోంది...',
    audioDesc: 'చదవడం రాని పెద్దవారి కోసం ఎంతో ఆప్యాయమైన, మమతామయమైన స్పష్టమైన తెలుగు స్వరము.',
    speedSlow: '🐢 నెమ్మదిగా',
    speedNormal: 'సాధారణం',
    speedLively: 'ఉల్లాసంగా 🐇',
    voiceOptionsBtn: 'స్వర ఎంపికలు',
    voicePersonaLabel: 'తెలుగు గొంతు ఎంపిక:',
    spokenLanguageLabel: 'మాట్లాడే భాష:',
    caregiverContact: 'పరిరక్షకులు / డాక్టర్ ఫోన్ నంబర్:',
    hearNurseAssistance: 'నర్స్ సహాయం వినండి',
    friendlyActiveDesc: 'స్పష్టమైన, మర్యాదపూర్వకమైన, నిదానమైన ఆప్యాయతా స్వరము క్రియాశీలంగా ఉంది.',
    
    dayScheduleHeading: (dayFull) => `${dayFull} మందుల సమయ పట్టిక`,
    dayScheduleHelpPatient: 'ఏ మాత్రనైనా తాకండి, అది ఎలా వేసుకోవాలో తెలుగులో స్పష్టంగా వినిపిస్తుంది.',
    dayScheduleHelpCaregiver: 'కేర్‌గివర్ మోడ్: మందుల మోతాదు, సమయాలు మరియు రంగులను క్రింది బటన్లతో మార్చవచ్చు.',
    hearAllDayPills: (day) => `🔊 ${day} మందులన్నీ వినండి`,
    resetTakenForDay: 'నేటి గుర్తులను రద్దు చేయి',
    resetConfirm: (day) => `${day} నాటి అన్ని తీసుకున్న గుర్తులను రద్దు చేసి మళ్లీ ప్రారంభించాలా?`,
    
    caregiverBannerTitle: 'దృశ్య మరియు స్పర్శ పరిరక్షక మార్గదర్శి:',
    caregiverBannerDesc: 'మీ ఇంట్లోని మందుల డబ్బాలపై ఈ స్క్రీన్‌పై ఉన్న రంగులు (ఉదయం పసుపు, మధ్యాహ్నం తెలుపు/నీలం, రాత్రి నీలం) అతికించండి. "ముద్రణ చార్ట్" బటన్‌ను నొక్కి ఫ్రిజ్‌పై పోస్టర్ అతికించండి!',
    printChartBtn: 'ఫ్రిజ్ కోసం పోస్టర్ ముద్రించండి 🖨️',
    
    colors: {
      'Golden Yellow': 'బంగారు పసుపు (Golden Yellow)',
      'Sky Blue': 'ఆకాశ నీలం (Sky Blue)',
      'Ruby Red': 'ఎరుపు రంగు (Ruby Red)',
      'Emerald Green': 'ఆకుపచ్చ రంగు (Emerald Green)',
      'Lavender Purple': 'ఊదా రంగు (Lavender Purple)',
      'Bright Orange': 'నారింజ రంగు (Bright Orange)',
      'Soft Pink': 'గులాబీ రంగు (Soft Pink)',
      'Clean White': 'తెలుపు రంగు (Clean White)',
      'Golden Amber': 'తేనె రంగు (Golden Amber)',
    },
    shapes: {
      round: 'గుండ్రని మాత్ర (Round)',
      oval: 'ఓవల్ గుడ్డు ఆకారం (Oval)',
      capsule: 'క్యాప్సూల్ (Capsule)',
      square: 'చతురస్రం (Square)',
      liquid_drop: 'ద్రవ బిందువు (Drop)',
      triangle: 'త్రికోణం (Triangle)',
    },
  },
  
  Hindi: {
    appName: 'सहाय केयर (Sahaaya Care)',
    appSubtitle: 'अनपढ़ व दृष्टिबाधित मरीज़ों के लिए बोलती हुई आवाज़ और रंगों वाली 7-दिवसीय दवाई तालिका',
    audioVisualBadge: 'बोलती आवाज़ व रंग',
    realtimeBadge: 'समय पर सूचनाएं',
    beginnerHelperBanner: '💡 सरल बोलती गाइड: स्क्रीन पर किसी भी रंगीन गोली को छुएं, वह कब और कैसे लेनी है, सब हिंदी में बोलकर समझाया जाएगा! दवाई लेने के बाद बड़ा हरा बटन दबाएं।',
    beginnerHelperDismiss: 'समझ गया',
    
    uploadFiles: 'दवा पर्चा अपलोड',
    adherence30D: '30 दिनों का रिकॉर्ड',
    presets: 'तैयार तालिकाएं',
    printChart: 'चार्ट प्रिंट करें',
    workspacePosture: 'कार्य मोड:',
    
    posturePatientAudio: 'मरीज़ बोलती गाइड',
    posturePatientAudioSub: 'पढ़ न सकने वाले बुजुर्गों के लिए आवाज़ व रंगीन गोलियों की पहचान',
    postureCaregiver: 'देखभालकर्ता बदलाव',
    postureCaregiverSub: 'खुराक, समय और नियमों में तुरंत बदलाव करें',
    postureAdherence: '30 दिनों का रिकॉर्ड',
    postureAdherenceSub: 'चार्ट, नियमितता का प्रतिशत और छूटी हुई दवाओं का विश्लेषण',
    postureMatrix: '7 दिवसीय तालिका',
    postureMatrixSub: 'सोमवार से रविवार का पूरा साप्ताहिक चार्ट',
    posturePrint: 'दीवार / फ्रिज चार्ट',
    posturePrintSub: 'फ्रिज या दीवार पर चिपकाने के लिए स्पष्ट रंगीन पोस्टर',
    caregiverActiveAlert: 'संपादन मोड सक्रिय है • आपके बदलाव तुरंत अपने आप सुरक्षित होते हैं',
    
    timetableTitleBadge: '7 दिवसीय दवाई की समय-सारणी',
    forPatient: 'मरीज़:',
    hear7DayGuide: '🔊 7 दिनों की गाइड सुनें',
    speakingSchedule: 'निर्देश बोल रहे हैं...',
    dayView: 'दैनिक दृश्य',
    fullWeekMatrix: 'साप्ताहिक चार्ट',
    
    days: {
      Mon: { short: 'सोम', full: 'सोमवार (Monday)' },
      Tue: { short: 'मंगल', full: 'मंगलवार (Tuesday)' },
      Wed: { short: 'बुध', full: 'बुधवार (Wednesday)' },
      Thu: { short: 'गुरु', full: 'गुरुवार (Thursday)' },
      Fri: { short: 'शुक्र', full: 'शुक्रवार (Friday)' },
      Sat: { short: 'शनि', full: 'शनिवार (Saturday)' },
      Sun: { short: 'रवि', full: 'रविवार (Sunday)' },
    },
    
    timeNow: 'वर्तमान समय',
    dueNowBadge: 'अभी लेने की दवाई',
    allDoneBadge: 'इस समय की सभी दवाइयां पूरी!',
    restPeriodBadge: 'विश्राम समय',
    allDoneTitle: 'इस समय की सभी दवाइयां सफलता से ले ली गई हैं!',
    allDoneDesc: 'बहुत बढ़िया! पर्याप्त पानी पिएं और अगले समय तक आराम करें।',
    dueNowTitle: 'आपकी इस समय की दवाइयों का वक़्त हो गया है!',
    dueNowDesc: 'कृपया एक गिलास ताज़ा पानी के साथ आराम से दवाइयां लें।',
    restTitle: 'इस समय आपकी कोई दवाई निर्धारित नहीं है।',
    restDesc: 'आराम करें और शरीर में पानी की कमी न होने दें।',
    pillsForRoutine: 'इस समय की दवाइयां:',
    intimateNowBtn: 'मरीज़ को अभी बोलकर बताएं 📢',
    testTimeLabel: 'समय परीक्षण:',
    resetBtn: 'रीसेट',
    
    slots: {
      morning: {
        title: 'सुबह का नियम (Morning)',
        sub: 'नाश्ता व जागने का समय',
        timeRange: 'सुबह 06:00 – 11:00',
        routineLabel: 'सुबह उठकर नाश्ता करने के तुरंत बाद',
      },
      afternoon: {
        title: 'दोपहर का नियम (Midday)',
        sub: 'दोपहर के भोजन का समय',
        timeRange: 'दोपहर 11:00 – 04:00',
        routineLabel: 'दोपहर के खाने के साथ या भोजन के तुरंत बाद',
      },
      evening: {
        title: 'शाम का नियम (Evening)',
        sub: 'शाम का खाना व सूर्यास्त',
        timeRange: 'शाम 04:00 – रात 08:00',
        routineLabel: 'शाम के समय भोजन के साथ',
      },
      bedtime: {
        title: 'रात सोने का समय (Bedtime)',
        sub: 'आराम व रात की सुरक्षा',
        timeRange: 'रात 08:00 – सुबह 06:00',
        routineLabel: 'रात को सोने से ठीक पहले बत्ती बुझाने के वक़्त',
      },
    },
    
    dueNowTag: 'अभी लेने का समय!',
    listenBtn: 'सुनें 🔊',
    spokenGuideLabel: '🗣️ बोलकर निर्देश:',
    iSwallowedBtn: 'मैंने यह दवाई ले ली ✅',
    takenUndoBtn: 'दवाई ले ली! पूर्ववत करें',
    purposeLabel: 'फायदा:',
    addPillHere: '+ यहां दवाई जोड़ें',
    hearRoutine: 'नियम सुनें',
    pillsCountLabel: (c) => `${c} दवाई${c !== 1 ? 'यां' : ''}`,
    noMedsInSlot: 'आज इस समय आपकी कोई दवाई नहीं है।',
    
    withFood: 'खाने के साथ 🍽️',
    afterMeal: 'खाने के बाद 🥣',
    emptyStomach: 'खाली पेट ⏳',
    fullGlassWater: 'पूरा गिलास पानी 🥛',
    normalSip: 'पानी के साथ 💧',
    
    spokenAudioGuide: 'हिंदी बोलती ऑडियो गाइड',
    readyToSpeak: 'दवाई की तालिका सुनाने के लिए तैयार',
    speakingNow: 'निर्देश हिंदी में बोलकर सुनाए जा रहे हैं...',
    audioDesc: 'अनपढ़ बुजुर्गों के लिए अत्यंत आत्मीय, धैर्यवान, साफ़ और स्पष्ट हिंदी आवाज़।',
    speedSlow: '🐢 धीमी आवाज़',
    speedNormal: 'सामान्य',
    speedLively: 'तेज़ 🐇',
    voiceOptionsBtn: 'आवाज़ विकल्प',
    voicePersonaLabel: 'हिंदी आवाज़ का चयन:',
    spokenLanguageLabel: 'बोलने की भाषा:',
    caregiverContact: 'सहायक / डॉक्टर का फोन नंबर:',
    hearNurseAssistance: 'नर्स सहायता सुनें',
    friendlyActiveDesc: 'मीठी, आदरपूर्ण और सहज समझ आने वाली आवाज़ सक्रिय है।',
    
    dayScheduleHeading: (dayFull) => `${dayFull} की दवाइयों की तालिका`,
    dayScheduleHelpPatient: 'किसी भी गोली को छुएं, वह कैसे लेनी है, सब साफ़ हिंदी में बोलकर समझाया जाएगा।',
    dayScheduleHelpCaregiver: 'संपादन मोड: खुराक, समय और रंगों को नीचे दिए गए बटनों से बदलें।',
    hearAllDayPills: (day) => `🔊 ${day} की सभी दवाइयां सुनें`,
    resetTakenForDay: 'आज का रिकॉर्ड रीसेट करें',
    resetConfirm: (day) => `क्या आप ${day} के सभी टिक हटाकर नए सिरे से शुरू करना चाहते हैं?`,
    
    caregiverBannerTitle: 'देखभालकर्ता के लिए दृश्य मार्गदर्शिका:',
    caregiverBannerDesc: 'घर में दवाई के डिब्बों पर स्क्रीन के रंग (सुबह पीला, दोपहर नीला/सफेद, रात गहरा नीला) चिपकाएं। फ्रिज पर चिपकाने के लिए "चार्ट प्रिंट करें" बटन दबाएं!',
    printChartBtn: 'फ्रिज के लिए रंगीन चार्ट प्रिंट करें 🖨️',
    
    colors: {
      'Golden Yellow': 'सुनहरी पीली (Golden Yellow)',
      'Sky Blue': 'आसमानी नीली (Sky Blue)',
      'Ruby Red': 'लाल रंग (Ruby Red)',
      'Emerald Green': 'हरी रंग (Emerald Green)',
      'Lavender Purple': 'बैंगनी (Lavender Purple)',
      'Bright Orange': 'नारंगी (Bright Orange)',
      'Soft Pink': 'गुलाबी (Soft Pink)',
      'Clean White': 'साफ सफेद (Clean White)',
      'Golden Amber': 'अंबरी पीली (Golden Amber)',
    },
    shapes: {
      round: 'गोल गोली (Round)',
      oval: 'अंडाकार गोली (Oval)',
      capsule: 'कैप्सूल (Capsule)',
      square: 'चौकोर गोली (Square)',
      liquid_drop: 'तरल बूंद (Drop)',
      triangle: 'तिकोनी गोली (Triangle)',
    },
  },
};

/**
 * Returns fluent, respectful, native spoken audio text in the target language
 * tailored specifically for elderly non-readers who rely on shape, color, routine, and water.
 */
export function getLocalizedSpokenExplanation(
  med: Medicine,
  lang: string,
  slot?: TimeSlot
): string {
  const isTelugu = lang === 'Telugu' || lang === 'te';
  const isHindi = lang === 'Hindi' || lang === 'hi';

  // If already in Telugu/Hindi script, return directly
  const hasTeluguChars = /[\u0C00-\u0C7F]/.test(med.spokenExplanation);
  const hasHindiChars = /[\u0900-\u097F]/.test(med.spokenExplanation);

  if (isTelugu && hasTeluguChars) {
    return med.spokenExplanation;
  }
  if (isHindi && hasHindiChars) {
    return med.spokenExplanation;
  }

  // Translate shape and color into native terms
  const teluguColorMap: Record<string, string> = {
    'golden yellow': 'బంగారు పసుపు రంగు',
    yellow: 'పసుపు రంగు',
    'sky blue': 'ఆకాశ నీలి రంగు',
    blue: 'నీలి రంగు',
    'ruby red': 'ఎరుపు రంగు',
    red: 'ఎరుపు రంగు',
    'emerald green': 'ఆకుపచ్చ రంగు',
    green: 'ఆకుపచ్చ రంగు',
    'soft pink': 'గులాబీ రంగు',
    pink: 'గులాబీ రంగు',
    'bright orange': 'నారింజ రంగు',
    orange: 'నారింజ రంగు',
    'lavender purple': 'ఊదా రంగు',
    purple: 'ఊదా రంగు',
    'clean white': 'తెల్లటి',
    white: 'తెల్లటి',
    'golden amber': 'తేనె రంగు',
  };

  const hindiColorMap: Record<string, string> = {
    'golden yellow': 'सुनहरी पीली',
    yellow: 'पीली',
    'sky blue': 'आसमानी नीली',
    blue: 'नीली',
    'ruby red': 'लाल',
    red: 'लाल',
    'emerald green': 'हरी',
    green: 'हरी',
    'soft pink': 'गुलाबी',
    pink: 'गुलाबी',
    'bright orange': 'नारंगी',
    orange: 'नारंगी',
    'lavender purple': 'बैंगनी',
    purple: 'बैंगनी',
    'clean white': 'सफेद',
    white: 'सफेद',
    'golden amber': 'सुनहरी चमकदार',
  };

  const teluguShapeMap: Record<PillShape, string> = {
    round: 'గుండ్రని మాత్ర',
    oval: 'గుడ్డు ఆకారపు ఓవల్ మాత్ర',
    capsule: 'క్యాప్సూల్',
    square: 'చతురస్రాకార మాత్ర',
    liquid_drop: 'మెత్తని డ్రాప్ మాత్ర',
    triangle: 'త్రికోణపు మాత్ర',
  };

  const hindiShapeMap: Record<PillShape, string> = {
    round: 'गोल गोली',
    oval: 'अंडाकार गोली',
    capsule: 'कैप्सूल',
    square: 'चौकोर गोली',
    liquid_drop: 'तरल बूंद जैसी गोली',
    triangle: 'तिकोनी गोली',
  };

  const normalizedColor = (med.color || '').toLowerCase().trim();
  const teColor = teluguColorMap[normalizedColor] || `${med.color} రంగు`;
  const hiColor = hindiColorMap[normalizedColor] || `${med.color} रंग की`;

  const teShape = teluguShapeMap[med.shape] || 'మాత్ర';
  const hiShape = hindiShapeMap[med.shape] || 'गोली';

  const assignedSlot = slot || med.slots[0] || 'morning';

  if (isTelugu) {
    const slotCue =
      assignedSlot === 'morning'
        ? 'ఉదయం లేచిన వెంటనే అల్పాహారం లేదా టిఫిన్ తిన్న తర్వాత'
        : assignedSlot === 'afternoon'
        ? 'మధ్యాహ్న భోజనం చేసిన తర్వాత'
        : assignedSlot === 'evening'
        ? 'సాయంత్రం వేళ రాత్రి భోజనం చేసే సమయంలో'
        : 'రాత్రి నిద్రపోయే ముందు పడకగది లైట్లు ఆర్పే వేళలో';

    const foodCue =
      med.withFood === 'with_meal'
        ? 'కడుపు నిండా భోజనంతో పాటు'
        : med.withFood === 'empty_stomach'
        ? 'ఖాళీ కడుపుతో (ఏమీ తినకముందే)'
        : 'కడుపు మంట రాకుండా ఆహారం తిన్న తర్వాత';

    const waterCue =
      med.waterRequirement === 'full_glass'
        ? 'ఒక పూర్తి గ్లాసుడు చల్లని మంచినీటితో'
        : 'తగినంత మంచినీటితో';

    return `నమస్కారం! ${slotCue}, మీ చేతిలో ఉన్న ${teColor} ${teShape}ను ${foodCue}, ${waterCue} నిదానంగా మింగండి. ఇది ${med.purpose || 'మీ ఆరోగ్యాన్ని కాపాడటానికి'} డాక్టర్ సూచించారు. ప్రశాంతంగా వేసుకోండి.`;
  }

  if (isHindi) {
    const slotCue =
      assignedSlot === 'morning'
        ? 'सुबह नाश्ता करने के तुरंत बाद'
        : assignedSlot === 'afternoon'
        ? 'दोपहर को खाना खाने के बाद'
        : assignedSlot === 'evening'
        ? 'शाम को भोजन के साथ'
        : 'रात को सोने से ठीक पहले';

    const foodCue =
      med.withFood === 'with_meal'
        ? 'भोजन के साथ'
        : med.withFood === 'empty_stomach'
        ? 'खाली पेट'
        : 'खाना खाने के बाद';

    const waterCue =
      med.waterRequirement === 'full_glass'
        ? 'एक पूरे गिलास ताज़ा पानी के साथ'
        : 'पानी के साथ';

    return `नमस्ते! ${slotCue}, अपनी ${hiColor} ${hiShape} निकालिए। इसे ${waterCue} ${foodCue} आराम से निगल लें। यह ${med.purpose || 'आपकी सेहत के लिए'} बहुत लाभकारी है।`;
  }

  // English default
  return med.spokenExplanation;
}
