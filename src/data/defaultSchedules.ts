import { MedicineSchedule } from '../types/medicine';

export const DEFAULT_SCHEDULES: Record<string, MedicineSchedule> = {
  cardiac: {
    regimenTitle: 'Cardiovascular & Blood Pressure Daily Regimen',
    patientName: 'Eleanor Vance',
    patientNotes: 'Keep beside water pitcher. Morning pills right after breakfast; bedtime blue capsule before turning lights off.',
    spokenOverview:
      'Good day! Here is your daily heart and blood pressure timetable. In the morning after breakfast, you have your round golden yellow pill for blood pressure and your soft pink oval pill for heart rhythm. At midday lunch, you take your small white aspirin. At bedtime, you take your sky blue capsule with a full glass of water.',
    emergencyContact: {
      name: 'Nurse Sarah (Cardiology)',
      phone: '(555) 234-5678',
      relation: 'Home Care Nurse',
    },
    medicines: [
      {
        id: 'med-amlodipine',
        name: 'Amlodipine (Blood Pressure Relaxer)',
        genericName: 'Amlodipine Besylate',
        dosage: '5 mg',
        purpose: 'Gently relaxes blood vessels and keeps blood pressure safe',
        color: 'Golden Yellow',
        colorHex: '#FBBF24',
        shape: 'round',
        markings: 'Score line down middle',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        precautions: 'Take after eating breakfast to prevent lightheadedness',
        spokenExplanation:
          'In the morning, look for your round golden yellow pill. Take one right after you finish your breakfast with a full glass of water. It keeps your blood pressure relaxed and steady all day.',
        customReminderTime: '08:00',
      },
      {
        id: 'med-metoprolol',
        name: 'Metoprolol (Heart Rhythm Calmer)',
        genericName: 'Metoprolol Succinate ER',
        dosage: '25 mg',
        purpose: 'Keeps heart beating in a gentle, steady, steady rhythm',
        color: 'Soft Pink',
        colorHex: '#F472B6',
        shape: 'oval',
        markings: 'Smooth pink oval shape',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Swallow whole with food, never crush or chew',
        spokenExplanation:
          'Next in the morning, find your smooth pink oval pill. It is shaped like an egg. Take this one pill while eating your morning meal. It keeps your heart beating gentle and calm.',
        customReminderTime: '08:00',
      },
      {
        id: 'med-aspirin',
        name: 'Baby Aspirin (Artery Shield)',
        genericName: 'Aspirin Enteric Coated',
        dosage: '81 mg',
        purpose: 'Prevents blood clots and keeps arteries clear',
        color: 'Clean White',
        colorHex: '#FFFFFF',
        shape: 'round',
        markings: 'Small round white bead',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        precautions: 'Always take after your midday lunch with water',
        spokenExplanation:
          'At midday during your lunch, look for the tiny round white pill. Take just one after your soup or meal with a glass of water. It helps keep your blood flowing cleanly and easily.',
        customReminderTime: '13:00',
      },
      {
        id: 'med-atorvastatin',
        name: 'Atorvastatin (Vessel Night Guard)',
        genericName: 'Atorvastatin Calcium',
        dosage: '20 mg',
        purpose: 'Protects blood vessels and cholesterol while sleeping',
        color: 'Sky Blue',
        colorHex: '#38BDF8',
        shape: 'capsule',
        markings: 'Blue capsule',
        slots: ['bedtime'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'no_preference',
        waterRequirement: 'full_glass',
        precautions: 'Take with a glass of water right before bedtime',
        spokenExplanation:
          'At night, when you prepare for bed, find your two-part sky blue capsule. Take this one capsule with water right before turning off your bedroom lamp. It works quietly while you sleep to protect your blood vessels.',
        customReminderTime: '21:30',
      },
    ],
  },

  diabetes: {
    regimenTitle: 'Diabetes & Daily Glycemic Control',
    patientName: 'Maria Rodriguez',
    patientNotes: 'Always have your meal prepared before taking morning sugar medicines. Never skip meals.',
    spokenOverview:
      'Welcome to your daily diabetes timetable. You have your white oval tablet twice a day with your morning and evening meals, your purple tablet right before breakfast, and a sunny golden vitamin gel at lunchtime.',
    emergencyContact: {
      name: 'Son Carlos',
      phone: '(555) 456-7890',
      relation: 'Family Caregiver',
    },
    medicines: [
      {
        id: 'med-metformin',
        name: 'Metformin (Blood Sugar Balancer)',
        genericName: 'Metformin HCl',
        dosage: '500 mg',
        purpose: 'Helps your body handle food sugars smoothly',
        color: 'Clean White',
        colorHex: '#FFFFFF',
        shape: 'oval',
        markings: 'Large white oval tablet',
        slots: ['morning', 'evening'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Take in the middle of your meal with plenty of water',
        spokenExplanation:
          'Look for your large white oval pill. You take one in the morning with breakfast, and one in the evening with dinner. Take it right while eating your food with a big glass of water.',
        customReminderTime: '08:00',
      },
      {
        id: 'med-glipizide',
        name: 'Glipizide (Morning Glucose Stabilizer)',
        genericName: 'Glipizide',
        dosage: '5 mg',
        purpose: 'Prevents morning sugar spikes',
        color: 'Lavender Purple',
        colorHex: '#A855F7',
        shape: 'round',
        markings: 'Round purple tablet',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Eat breakfast within 30 minutes of taking',
        spokenExplanation:
          'In the morning, find your purple round pill. Take it right as you sit down for breakfast. Be sure to eat your breakfast so you stay energetic and strong.',
        customReminderTime: '08:00',
      },
      {
        id: 'med-vitamind',
        name: 'Vitamin D3 & Sunshine Drop',
        genericName: 'Cholecalciferol',
        dosage: '2000 IU',
        purpose: 'Supports bone strength, immune health, and vitality',
        color: 'Golden Amber',
        colorHex: '#F59E0B',
        shape: 'liquid_drop',
        markings: 'Clear golden softgel',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'normal_sip',
        precautions: 'Easy-to-swallow soft liquid drop',
        spokenExplanation:
          'At lunch, look for the little shiny golden drop. It looks like a drop of warm sunshine. Take this soft little pill with your lunch to keep your bones strong and healthy.',
        customReminderTime: '13:00',
      },
    ],
  },

  senior_vitality: {
    regimenTitle: 'Senior Vitality, Bone & Joint Care',
    patientName: 'Arthur Pendelton',
    patientNotes: 'Calcium is taken midday; joint glucosamine in the morning with oatmeal.',
    spokenOverview:
      'Hello Arthur! Here is your daily joint and vitality schedule. Take your emerald green joint tablet in the morning, your sunny calcium drop at midday lunch, and your omega-3 heart oil with dinner.',
    emergencyContact: {
      name: 'Daughter Jennifer',
      phone: '(555) 789-0123',
      relation: 'Daughter & Primary Caregiver',
    },
    medicines: [
      {
        id: 'med-glucosamine',
        name: 'Glucosamine & Chondroitin (Joint Cushion)',
        dosage: '1500 mg',
        purpose: 'Keeps knees, hips, and joints flexible and comfortable',
        color: 'Emerald Green',
        colorHex: '#10B981',
        shape: 'oval',
        markings: 'Green coated oval',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Take with warm tea or water after breakfast',
        spokenExplanation:
          'In the morning, find your large emerald green oval pill. Take it with your breakfast and a big warm mug of water to keep your joints moving easily.',
        customReminderTime: '08:30',
      },
      {
        id: 'med-calcium',
        name: 'Calcium Citrate + Magnesium (Bone Builder)',
        dosage: '600 mg',
        purpose: 'Strengthens bones and spine',
        color: 'Bright Orange',
        colorHex: '#FB923C',
        shape: 'round',
        markings: 'Orange round tablet',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Take with lunch, not at the same time as iron',
        spokenExplanation:
          'At lunchtime, look for the bright orange round pill. Swallow it with your lunch and water to keep your bones strong.',
        customReminderTime: '12:30',
      },
      {
        id: 'med-omega3',
        name: 'Omega-3 Fish Oil (Heart & Memory)',
        dosage: '1000 mg',
        purpose: 'Supports memory clarity and heart health',
        color: 'Golden Amber',
        colorHex: '#F59E0B',
        shape: 'liquid_drop',
        markings: 'Golden liquid bead',
        slots: ['evening'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Take right with dinner',
        spokenExplanation:
          'At dinner time, find your golden liquid drop. Take it while enjoying your evening dinner with water for memory and heart wellness.',
        customReminderTime: '18:30',
      },
    ],
  },

  recovery: {
    regimenTitle: '7-Day Post-Surgery & Antibiotic Recovery',
    patientName: 'Robert Campbell',
    patientNotes: 'Complete all 7 days of antibiotics without skipping a single dose.',
    spokenOverview:
      'Welcome to your 7-day healing schedule. Take your red and white antibiotic capsule three times a day with meals: morning, midday, and evening. Take your orange pain tablet in the morning and evening, and your green stomach probiotic at midday.',
    emergencyContact: {
      name: 'Dr. Martinez Surgical Clinic',
      phone: '(555) 890-1234',
      relation: 'Surgical Team on Call',
    },
    medicines: [
      {
        id: 'med-amox-clav',
        name: 'Amoxicillin Shield (Infection Guard)',
        genericName: 'Amoxicillin / Clavulanate',
        dosage: '875 mg',
        purpose: 'Fights bacteria and ensures rapid surgical wound healing',
        color: 'Ruby Red & Pearl White',
        colorHex: '#EF4444',
        shape: 'capsule',
        markings: 'Two-tone red and white capsule',
        slots: ['morning', 'afternoon', 'evening'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Finish full 7 days even if feeling 100% healed',
        spokenExplanation:
          'Here is your red and white capsule. Take one in the morning, one at midday, and one at dinner. Always take it with food and a full cup of water.',
        customReminderTime: '08:00',
      },
      {
        id: 'med-ibuprofen',
        name: 'Ibuprofen (Swelling & Pain Relief)',
        dosage: '400 mg',
        purpose: 'Reduces tissue swelling and relieves pain',
        color: 'Bright Orange',
        colorHex: '#FB923C',
        shape: 'oval',
        markings: 'Orange coated tablet',
        slots: ['morning', 'evening'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'Never take on an empty stomach',
        spokenExplanation:
          'Look for your bright orange oval pill. Take one after breakfast and one after dinner. Never swallow this pill on an empty stomach.',
        customReminderTime: '08:30',
      },
      {
        id: 'med-probiotic-recovery',
        name: 'Probiotic Digestion Guard',
        dosage: '5 Billion CFU',
        purpose: 'Protects digestive system during antibiotic therapy',
        color: 'Emerald Green',
        colorHex: '#10B981',
        shape: 'round',
        markings: 'Green round tablet',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'no_preference',
        waterRequirement: 'normal_sip',
        precautions: 'Take 2 hours apart from your antibiotic',
        spokenExplanation:
          'At lunch, find your green round pill. This protects your tummy while you are taking your antibiotic medicine.',
        customReminderTime: '13:30',
      },
    ],
  },
  telugu_cardiac: {
    regimenTitle: 'గుండె & రక్తపోటు రోజువారీ సంరక్షణ (Telugu Care)',
    patientName: 'లక్ష్మీ గారు (Lakshmi)',
    patientNotes: 'ఉదయం అల్పాహారం తర్వాత మరియు రాత్రి నిద్రపోయే ముందు మందులు తప్పకుండా తీసుకోవాలి.',
    spokenOverview:
      'నమస్కారం! ఇది మీ 7 రోజుల మందుల సమయ పట్టిక. ఉదయం అల్పాహారం తిన్న తర్వాత, మీ గుండ్రని పసుపు రంగు మాత్ర మరియు గులాబీ రంగు మాత్రను తీసుకోండి. మధ్యాహ్నం భోజనం తర్వాత చిన్న తెల్లటి మాత్ర తీసుకోండి. రాత్రి పడుకునే ముందు నీలిరంగు క్యాప్సూల్ తీసుకోండి.',
    emergencyContact: {
      name: 'డాక్టర్ సురేష్ (Dr. Suresh Kumar)',
      phone: '98480 12345',
      relation: 'కార్డియాలజిస్ట్ (Cardiologist)',
    },
    medicines: [
      {
        id: 'med-telugu-amlodipine',
        name: 'ఆమ్లోడిపైన్ (Amlodipine BP)',
        genericName: 'Amlodipine Besylate 5mg',
        dosage: '5 mg',
        purpose: 'రక్తపోటును (BP) అదుపులో ఉంచుతుంది',
        color: 'పసుపు రంగు (Golden Yellow)',
        colorHex: '#FBBF24',
        shape: 'round',
        markings: 'మధ్యలో గీత ఉన్న గుండ్రని మాత్ర',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        precautions: 'ఉదయం అల్పాహారం తిన్న తర్వాత మాత్రమే వేసుకోవాలి',
        spokenExplanation:
          'ఉదయం అల్పాహారం తిన్న తర్వాత, మీ గుండ్రని పసుపు రంగు మాత్రను ఒక పూర్తి గ్లాసు నీటితో వేసుకోండి. ఇది రోజంతా మీ బీపీని అదుపులో ఉంచుతుంది.',
        customReminderTime: '08:00',
      },
      {
        id: 'med-telugu-metoprolol',
        name: 'మెటోప్రోలోల్ (Metoprolol Heart)',
        genericName: 'Metoprolol Succinate ER 25mg',
        dosage: '25 mg',
        purpose: 'గుండె చప్పుడును ప్రశాంతంగా ఉంచుతుంది',
        color: 'గులాబీ రంగు (Soft Pink)',
        colorHex: '#F472B6',
        shape: 'oval',
        markings: 'గులాబీ రంగు గుడ్డు ఆకారం',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'పూర్తిగా మింగాలి, నమలకూడదు',
        spokenExplanation:
          'ఉదయం టిఫిన్ తినే సమయంలో, మీ గులాబీ రంగు గుడ్డు ఆకారపు మాత్రను నీటితో మింగండి. ఇది మీ గుండెను స్థిరంగా ఉంచుతుంది.',
        customReminderTime: '08:30',
      },
      {
        id: 'med-telugu-aspirin',
        name: 'ఆస్పిరిన్ (Aspirin Shield)',
        genericName: 'Baby Aspirin 81mg',
        dosage: '81 mg',
        purpose: 'రక్తం గడ్డకట్టకుండా కాపాడుతుంది',
        color: 'తెలుపు రంగు (Clean White)',
        colorHex: '#FFFFFF',
        shape: 'round',
        markings: 'చిన్న తెల్లటి మాత్ర',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        precautions: 'మధ్యాహ్న భోజనం తర్వాత మాత్రమే తీసుకోవాలి',
        spokenExplanation:
          'మధ్యాహ్న భోజనం చేసిన తర్వాత, మీ చిన్న తెల్లటి గుండ్రని మాత్రను ఒక గ్లాసు నీటితో వేసుకోండి. ఇది మీ రక్త ప్రసరణను సులభం చేస్తుంది.',
        customReminderTime: '13:00',
      },
      {
        id: 'med-telugu-atorvastatin',
        name: 'అటోర్వాస్టాటిన్ (Night Vessel Guard)',
        genericName: 'Atorvastatin 20mg',
        dosage: '20 mg',
        purpose: 'రాత్రి నిద్రలో కొలెస్ట్రాల్ అదుపు చేస్తుంది',
        color: 'నీలి రంగు (Sky Blue)',
        colorHex: '#38BDF8',
        shape: 'capsule',
        markings: 'నీలి రంగు క్యాప్సూల్',
        slots: ['bedtime'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'no_preference',
        waterRequirement: 'full_glass',
        precautions: 'రాత్రి నిద్రపోయే ముందు ఒక గ్లాసు నీటితో తీసుకోవాలి',
        spokenExplanation:
          'రాత్రి పడుకునే ముందు లైట్లు ఆర్పే ముందు, మీ నీలిరంగు క్యాప్సూల్‌ను ఒక గ్లాసు నీటితో వేసుకోండి. ఇది రాత్రి నిద్రలో మీ గుండెను కాపాడుతుంది.',
        customReminderTime: '21:30',
      },
    ],
  },
  hindi_cardiac: {
    regimenTitle: 'दैनिक हृदय व रक्तचाप सुरक्षा तालिका (Daily Cardio Care)',
    patientName: 'शांति देवी (Shanti Devi)',
    patientNotes: 'पानी के जग के पास रखें। सुबह की दवाई नाश्ते के तुरंत बाद लें। रात का नीला कैप्सूल सोने से ठीक पहले लें।',
    spokenOverview:
      'नमस्ते! यह आपकी रोज़ाना की दवाई की समय-सारणी है। सुबह नाश्ते के बाद, आप अपनी गोल सुनहरी पीली गोली ब्लड प्रेशर के लिए और गुलाबी अंडाकार गोली दिल की धड़कन के लिए लें। दोपहर को भोजन के बाद सफेद गोली लें। रात को सोने से पहले अपना नीला कैप्सूल एक पूरे गिलास पानी के साथ लें। अपना पूरा ख्याल रखें!',
    emergencyContact: {
      name: 'डॉ. राजेश शर्मा (हृदय रोग विशेषज्ञ)',
      phone: '+91 98765 43210',
      relation: 'पारिवारिक चिकित्सक',
    },
    medicines: [
      {
        id: 'med-amlodipine-hi',
        name: 'एम्लोडिपिन (ब्लड प्रेशर नियंत्रक गोली)',
        genericName: 'Amlodipine Besylate 5mg',
        dosage: '5 mg',
        purpose: 'रक्तचाप को सामान्य, शांत और स्थिर रखती है',
        color: 'सुनहरी पीली (Golden Yellow)',
        colorHex: '#FBBF24',
        shape: 'round',
        markings: 'बीच में हल्की लकीर',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        precautions: 'सुबह नाश्ते के तुरंत बाद लें ताकि कमजोरी महसूस न हो',
        spokenExplanation:
          'नमस्ते! सुबह के समय, अपनी गोल सुनहरी पीली गोली ढूंढिए। नाश्ता करने के तुरंत बाद, एक पूरा गिलास ताज़ा पानी लेकर यह गोली निगल लें। यह दिन भर आपके ब्लड प्रेशर को बिल्कुल ठीक और शांत रखेगी।',
        customReminderTime: '08:00',
      },
      {
        id: 'med-metoprolol-hi',
        name: 'मेटोप्रोलोल (दिल की धड़कन रक्षक)',
        genericName: 'Metoprolol Succinate ER 25mg',
        dosage: '25 mg',
        purpose: 'दिल की धड़कन को सहज और शांत रखती है',
        color: 'गुलाबी (Soft Pink)',
        colorHex: '#F472B6',
        shape: 'oval',
        markings: 'गुलाबी अंडाकार गोली',
        slots: ['morning'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'with_meal',
        waterRequirement: 'full_glass',
        precautions: 'गोली को चबाएं नहीं, पानी के साथ पूरी निगल लें',
        spokenExplanation:
          'इसके बाद, अपनी चिकनी गुलाबी अंडाकार गोली लीजिए। यह अंडे के आकार जैसी है। सुबह के नाश्ते के साथ इसे पानी से ले लीजिए। यह आपके दिल को बिल्कुल शांत और स्वस्थ रखेगी।',
        customReminderTime: '08:00',
      },
      {
        id: 'med-aspirin-hi',
        name: 'इकोस्प्रिन (खून को हल्का रखने वाली)',
        genericName: 'Aspirin 75mg',
        dosage: '75 mg',
        purpose: 'खून के थक्के जमने से रोकती है',
        color: 'साफ सफेद (Clean White)',
        colorHex: '#FFFFFF',
        shape: 'round',
        markings: 'छोटी सफेद मोती जैसी गोली',
        slots: ['afternoon'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'after_meal',
        waterRequirement: 'full_glass',
        precautions: 'हमेशा दोपहर का खाना खाने के बाद ही लें',
        spokenExplanation:
          'दोपहर को खाना खाने के बाद, यह छोटी सफेद गोल गोली लीजिए। भोजन के तुरंत बाद एक गिलास पानी के साथ इसे लें। यह आपकी नसों में खून को आसानी से बहने में मदद करती है।',
        customReminderTime: '13:00',
      },
      {
        id: 'med-atorvastatin-hi',
        name: 'एटोरवास्टेटिन (कोलेस्ट्रॉल सुरक्षा कैप्सूल)',
        genericName: 'Atorvastatin Calcium 20mg',
        dosage: '20 mg',
        purpose: 'नसों को साफ रखती है और दिल की सुरक्षा करती है',
        color: 'आसमानी नीला (Sky Blue)',
        colorHex: '#38BDF8',
        shape: 'capsule',
        markings: 'आसमानी नीला दो-रंग कैप्सूल',
        slots: ['bedtime'],
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        withFood: 'no_preference',
        waterRequirement: 'full_glass',
        precautions: 'सोने से पहले एक गिलास पानी के साथ लें',
        spokenExplanation:
          'रात को सोने से ठीक पहले, अपना आसमानी नीला कैप्सूल निकालिए। एक गिलास पानी के साथ इसे आराम से ले लें और निश्चिंत होकर सो जाएं। यह रात भर आपके दिल की हिफाज़त करता है। शुभ रात्रि!',
        customReminderTime: '21:30',
      },
    ],
  },
};

// Preset sample prescription slips for users to test the upload feature instantly
export const SAMPLE_PRESCRIPTION_FILES = [
  {
    title: '🏥 हिंदी प्रिस्क्रिप्शन (Hindi Doctor Slip)',
    doctor: 'डॉ. राजेश शर्मा, MD (कार्डियोलॉजिस्ट, दिल्ली)',
    description: 'सुबह एम्लोडिपिन 5mg (पीली गोली), मेटोप्रोलोल 25mg, दोपहर एस्पिरिन, रात एटोरवास्टेटिन',
    sampleText: `चिकित्सा परामर्श पर्चा (Discharge Slip)
चिकित्सक: डॉ. राजेश शर्मा, MD (कार्डियोलॉजी) - दिल्ली
रोगी: शांति देवी | दिनांक: अक्टूबर 2026

Rx 1: एम्लोडिपिन बेसाइलेट 5mg (Amlodipine Besylate)
निर्देश: प्रतिदिन सुबह नाश्ते के तुरंत बाद 1 गोल पीली गोली एक पूरे गिलास पानी से लें।

Rx 2: मेटोप्रोलोल सक्सिनेट 25mg (Metoprolol Succinate ER)
निर्देश: सुबह नाश्ते के साथ 1 गुलाबी अंडाकार गोली पानी से निगलें। चबाएं नहीं।

Rx 3: एस्पिरिन 75mg (Aspirin Enteric Coated)
निर्देश: दोपहर के भोजन के बाद 1 छोटी सफेद गोली लें।

Rx 4: एटोरवास्टेटिन 20mg (Atorvastatin Calcium)
निर्देश: रात को सोने से पहले 1 आसमानी नीला कैप्सूल पानी के साथ लें।`,
  },
  {
    title: '🏥 తెలుగు ప్రిస్క్రిప్షన్ (Telugu Doctor Slip)',
    doctor: 'డాక్టర్ సురేష్ కుమార్, MD (కార్డియాలజీ, హైదరాబాద్)',
    description: 'ఉదయం అమ్లోడిపైన్ 5mg (పసుపు రంగు), మెటోప్రోలోల్ 25mg, రాత్రి అటోర్వాస్టాటిన్',
    sampleText: `వైద్య ప్రిస్క్రిప్షన్ పత్రం (Hospital Discharge Slip)
వైద్యులు: డాక్టర్ సురేష్ కుమార్, MD (కార్డియాలజీ) - హైదరాబాద్
రోగి: లక్ష్మీ గారు | తేదీ: అక్టోబర్ 2026

Rx 1: అమ్లోడిపైన్ బెసైలేట్ 5mg మాత్ర (Amlodipine Besylate)
సూచన: ప్రతిరోజూ ఉదయం అల్పాహారం తర్వాత 1 గుండ్రని పసుపు రంగు మాత్ర పూర్తి గ్లాసు నీటితో వేసుకోవాలి.

Rx 2: మెటోప్రోలోల్ సక్సినేట్ 25mg (Metoprolol Succinate ER)
సూచన: ఉదయం అల్పాహారంతో పాటు 1 గులాబీ రంగు ఓవల్ మాత్ర మింగాలి.

Rx 3: అటోర్వాస్టాటిన్ 20mg (Atorvastatin Calcium)
సూచన: రాత్రి పడుకునే ముందు 1 నీలిరంగు క్యాప్సూల్ నీటితో తీసుకోవాలి.`,
  },
  {
    title: '🏥 Cardiology Discharge Slip',
    doctor: 'Dr. Sarah Lin, MD (Cardiology)',
    description: 'Amlodipine 5mg morning, Metoprolol 25mg morning with meal, Atorvastatin 20mg bedtime',
    sampleText: `PRESCRIPTION DISCHARGE SUMMARY
Doctor: Dr. Sarah Lin, MD - St. Jude Medical Center
Patient: Eleanor Vance | Date: Oct 2026

Rx 1: Amlodipine Besylate 5mg tablet
Sig: Take 1 round yellow tablet orally every morning after breakfast with a full glass of water.
Indication: Essential Hypertension.

Rx 2: Metoprolol Succinate ER 25mg
Sig: Take 1 pink oval tablet once daily in the morning with breakfast. Swallow whole.
Indication: Arrhythmia / Rate control.

Rx 3: Atorvastatin Calcium 20mg
Sig: Take 1 sky blue capsule orally at bedtime with water.
Indication: Hyperlipidemia / Arterial protection.`,
  },
  {
    title: '🩸 Diabetes & Metabolism Plan',
    doctor: 'Dr. David Chen, MD (Endocrinology)',
    description: 'Metformin 500mg BID with meals, Glipizide 5mg morning, Vitamin D3 2000IU midday',
    sampleText: `ENDOCRINOLOGY CLINICAL PRESCRIPTION
Doctor: Dr. David Chen, MD - Metro Health
Patient: Maria Rodriguez | Date: Oct 2026

Rx 1: Metformin HCl 500mg
Sig: Take 1 white oval tablet twice daily with morning breakfast and evening dinner.
Warning: Take with meals to minimize stomach upset.

Rx 2: Glipizide 5mg
Sig: Take 1 round purple tablet every morning 15-30 minutes before breakfast.

Rx 3: Cholecalciferol (Vitamin D3) 2000 IU
Sig: Take 1 golden liquid gel drop daily at midday lunch.`,
  },
  {
    title: '🦴 Senior Mobility & Joint Care',
    doctor: 'Dr. James Thorne, MD (Geriatric Care)',
    description: 'Glucosamine 1500mg morning, Calcium Citrate 600mg midday, Omega-3 Fish Oil dinner',
    sampleText: `GERIATRIC MOBILITY & JOINT CARE REGIMEN
Doctor: Dr. James Thorne, MD
Patient: Arthur Pendelton | Date: Oct 2026

Rx 1: Glucosamine & Chondroitin Complex 1500mg
Sig: Take 1 emerald green oval tablet every morning with food and plenty of water.

Rx 2: Calcium Citrate + Magnesium 600mg
Sig: Take 1 bright orange round tablet at lunchtime with food. Do not take with iron supplements.

Rx 3: Omega-3 Deep Sea Fish Oil 1000mg
Sig: Take 1 golden amber softgel drop once daily with evening dinner.`,
  },
];

