import React, { useState } from 'react';
import { audioPlayer } from '../utils/audioPlayer';
import {
  MapPin,
  Phone,
  Building2,
  Calendar,
  AlertTriangle,
  Volume2,
  X,
  ShieldCheck,
  Heart,
  Truck,
  Users,
  Clock,
  Sparkles,
  Stethoscope,
  Info,
} from 'lucide-react';

interface RuralFacility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'Sub-Centre' | 'Arogya Mandir';
  villageBlock: string;
  distanceKm: number;
  doctorOnDuty: string;
  timings: string;
  hasFreePharmacy: boolean;
  hasAmbulance: boolean;
  phoneNumber: string; // 10 digits
}

interface AshaWorker {
  id: string;
  name: string;
  role: 'ASHA Worker' | 'ANM Nurse' | 'Anganwadi Worker';
  villageArea: string;
  phoneNumber: string; // 10 digits
  responsibilities: string;
  availableNow: boolean;
}

interface RuralCamp {
  id: string;
  title: string;
  dateStr: string;
  timeRange: string;
  location: string;
  services: string[];
  organizer: string;
}

const RURAL_FACILITIES: RuralFacility[] = [
  {
    id: 'fac-1',
    name: 'Government Primary Health Centre (PHC)',
    type: 'PHC',
    villageBlock: 'Tenali Rural Mandal',
    distanceKm: 2.4,
    doctorOnDuty: 'Dr. Ramesh Babu (Medical Officer)',
    timings: '24 Hours Emergency • OPD 9 AM - 4 PM',
    hasFreePharmacy: true,
    hasAmbulance: true,
    phoneNumber: '9848011224',
  },
  {
    id: 'fac-2',
    name: 'Community Health Centre (CHC 30-Bed)',
    type: 'CHC',
    villageBlock: 'Narsampet Rural Block',
    distanceKm: 5.8,
    doctorOnDuty: 'Dr. Radhika (Gynecologist) & Dr. V. Rao',
    timings: '24x7 Inpatient & Maternity Care',
    hasFreePharmacy: true,
    hasAmbulance: true,
    phoneNumber: '9440911223',
  },
  {
    id: 'fac-3',
    name: 'Ayushman Arogya Mandir (Health & Wellness)',
    type: 'Arogya Mandir',
    villageBlock: 'Ramachandrapuram Village',
    distanceKm: 1.1,
    doctorOnDuty: 'Smt. Kavitha (Community Health Officer)',
    timings: 'Mon-Sat: 8:30 AM - 3:00 PM',
    hasFreePharmacy: true,
    hasAmbulance: false,
    phoneNumber: '9988711222',
  },
];

const ASHA_WORKERS: AshaWorker[] = [
  {
    id: 'asha-1',
    name: 'Lakshmi Devi',
    role: 'ASHA Worker',
    villageArea: 'Sector 1 (Panchayat North)',
    phoneNumber: '9848033445',
    responsibilities: 'Home medicine delivery, BP/Sugar screening & Maternal care',
    availableNow: true,
  },
  {
    id: 'asha-2',
    name: 'Sunita Rao',
    role: 'ANM Nurse',
    villageArea: 'Sector 2 & Sub-Centre',
    phoneNumber: '9440855667',
    responsibilities: 'Pediatric immunizations, child growth monitoring & ORS distribution',
    availableNow: true,
  },
  {
    id: 'asha-3',
    name: 'Parvati Amma',
    role: 'Anganwadi Worker',
    villageArea: 'Main Village Nutrition Centre',
    phoneNumber: '9959144332',
    responsibilities: 'Nutrition kits, child supplementary food & iron syrup distribution',
    availableNow: true,
  },
];

const UPCOMING_CAMPS: RuralCamp[] = [
  {
    id: 'camp-1',
    title: 'Free Diabetes, BP & Eye Screening Camp',
    dateStr: 'This Thursday',
    timeRange: '09:00 AM - 02:00 PM',
    location: 'Gram Panchayat Hall, Tenali Rural',
    services: ['Free Blood Sugar', 'BP Measurement', 'Eye Cataract Check', 'Free Generic Medicines'],
    organizer: 'District Mobile Health Mission',
  },
  {
    id: 'camp-2',
    title: 'Pediatric Immunization & Nutrition Day (Mamata Diwas)',
    dateStr: 'Every Wednesday',
    timeRange: '10:00 AM - 01:00 PM',
    location: 'Village Anganwadi Bhavan',
    services: ['Child Vaccines (Age 1-5 yrs)', 'Vitamin A Drops', 'Zinc & ORS Packets', 'Weight Tracking'],
    organizer: 'National Health Mission & ANM Team',
  },
  {
    id: 'camp-3',
    title: 'Mobile Medical Van (Sanjeevani Clinic on Wheels)',
    dateStr: 'Coming Saturday',
    timeRange: '11:00 AM - 04:00 PM',
    location: 'Bus Stop Junction, Ramachandrapuram',
    services: ['Doctor Consultation', 'ECG on Wheels', 'Lab Blood Tests', 'Free Prescription Refills'],
    organizer: 'Rural Tele-Medicine Unit',
  },
];

interface RuralHealthAccessProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
}

export const RuralHealthAccess: React.FC<RuralHealthAccessProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'asha' | 'camps' | 'emergency'>('facilities');

  if (!isOpen) return null;

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  const handleSpeakOverview = () => {
    const text = isTelugu
      ? 'గ్రామీణ ఆరోగ్య సహాయ కేంద్రం: మీ సమీపంలోని ప్రాథమిక ఆరోగ్య కేంద్రాలు, ఆశా కార్యకర్తలు, ఉచిత వైద్య శిబిరాలు మరియు అత్యవసర 108 హెల్ప్‌లైన్‌ల వివరాలు ఇక్కడ ఉన్నాయి.'
      : isHindi
      ? 'ग्रामीण स्वास्थ्य सेवा केंद्र: नजदीकी प्राथमिक स्वास्थ्य केंद्र, आशा कार्यकर्ता, मुफ्त स्वास्थ्य शिविर और 108 इमरजेंसी हेल्पलाइन की पूरी जानकारी।'
      : 'Rural Health Access Hub: Complete guide to nearby Primary Health Centres, ASHA workers, mobile clinics, and 108/104 free medical helplines.';

    audioPlayer.speakText({
      text,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Building2 className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isTelugu
                    ? 'గ్రామీణ ఆరోగ్య సేవలు (Rural Health Access)'
                    : isHindi
                    ? 'ग्रामीण स्वास्थ्य पहुंच (Rural Health Access)'
                    : 'Rural Health Access & Village Care Hub'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-black border border-emerald-300/30">
                  FREE ACCESS
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                {isTelugu
                  ? 'సమీపంలోని పీహెచ్‌సీలు, ఆశా కార్యకర్తలు, ఉచిత క్యాంపులు & 108 సాయం'
                  : isHindi
                  ? 'नजदीकी पीएचसी, आशा कार्यकर्ता, मुफ्त कैंप व 108 सेवा'
                  : 'PHCs, CHCs, ASHA workers, mobile clinics & emergency hotlines'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakOverview}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
              title="Voice walkthrough"
            >
              <Volume2 className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Quick Emergency Call Strip */}
        <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>
              {isTelugu ? 'ఉచిత జాతీయ అత్యవసర కాల్స్:' : 'Toll-Free Government Helplines:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:108"
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>108 (Ambulance)</span>
            </a>
            <a
              href="tel:104"
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>104 (Health Advice)</span>
            </a>
            <a
              href="tel:102"
              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>102 (Mother/Child)</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-black shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'facilities'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'ఆరోగ్య కేంద్రాలు (PHC)' : 'PHC & CHC'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('asha')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'asha'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'ఆశా కార్యకర్తలు' : 'ASHA / ANM'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camps')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'camps'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'ఉచిత శిబిరాలు' : 'Mobile Camps'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'emergency'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'హెల్ప్‌లైన్లు' : 'Helplines'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Facilities */}
          {activeTab === 'facilities' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span>
                  {isTelugu
                    ? 'మీ గ్రామానికి సమీపంలోని ప్రభుత్వ ఆరోగ్య కేంద్రాలు'
                    : 'Nearby Government Health Centres'}
                </span>
                <span className="text-emerald-700">✓ Free Medications Available</span>
              </div>

              {RURAL_FACILITIES.map((fac) => (
                <div
                  key={fac.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {fac.type}
                        </span>
                        <h4 className="text-sm font-black text-slate-900">{fac.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {fac.villageBlock} •{' '}
                        <span className="text-emerald-700 font-black">{fac.distanceKm} km away</span>
                      </p>
                    </div>

                    <a
                      href={`tel:${fac.phoneNumber}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{fac.phoneNumber}</span>
                    </a>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div>
                      <span className="font-bold text-slate-900">Doctor on Duty:</span> {fac.doctorOnDuty}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Timings:</span> {fac.timings}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
                    {fac.hasFreePharmacy && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        💊 Free Generic Medicine Counter
                      </span>
                    )}
                    {fac.hasAmbulance && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🚑 108 Ambulance Stationed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ASHA & ANM Workers */}
          {activeTab === 'asha' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-900">
                {isTelugu
                  ? 'ఆశా మరియు ఏఎన్‌ఎమ్ కార్యకర్తలు మీ ఇంటికి వచ్చి ఉచితంగా మందులు, రక్తపోటు/షుగర్ పరీక్షలు మరియు టీకాలు అందిస్తారు.'
                  : 'ASHA and ANM healthcare workers provide free doorstep health screening, maternal/child support, and medicine delivery.'}
              </div>

              {ASHA_WORKERS.map((worker) => (
                <div
                  key={worker.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{worker.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-black border border-teal-200">
                          {worker.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {worker.villageArea}
                      </p>
                      <p className="text-[11px] text-slate-700 mt-1">
                        {worker.responsibilities}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${worker.phoneNumber}`}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm self-end sm:self-center shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {worker.phoneNumber}</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Rural Mobile Camps */}
          {activeTab === 'camps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span>
                  {isTelugu
                    ? 'రాబోయే ఉచిత ఆరోగ్య శిబిరాలు & మొబైల్ క్లినిక్ వ్యాన్'
                    : 'Upcoming Free Mobile Health Camps'}
                </span>
                <span className="text-emerald-700">100% Free Diagnostics</span>
              </div>

              {UPCOMING_CAMPS.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black">
                        {camp.dateStr}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{camp.title}</h4>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {camp.location}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-black text-slate-700 block">
                        {camp.timeRange}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {camp.organizer}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {camp.services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[10px] font-bold"
                      >
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Helplines */}
          {activeTab === 'emergency' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-rose-700">108</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black">
                      24x7 FREE
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">
                    National Emergency Ambulance
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Life-threatening medical emergencies, chest pain, stroke, accident, or acute child difficulty.
                  </p>
                  <a
                    href="tel:108"
                    className="block text-center py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs"
                  >
                    Call 108 Ambulance
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-indigo-700">104</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 text-[10px] font-black">
                      DOCTOR ON CALL
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">
                    Rural Medical Advice Helpline
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Free telephone consultation with doctor or nurse for fever, prescription queries, or pill dosages.
                  </p>
                  <a
                    href="tel:104"
                    className="block text-center py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs"
                  >
                    Call 104 Doctor Advice
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-amber-700">102</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                      MOTHERS & CHILDREN
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">
                    Janani Shishu Suraksha Karyakram
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Free transport for pregnant mothers and sick infants (aged 1 year and above) to nearest PHC/CHC hospital.
                  </p>
                  <a
                    href="tel:102"
                    className="block text-center py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs"
                  >
                    Call 102 Mother & Child
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-700">14416</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black">
                      TELE-MANAS
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">
                    Mental Health & Elder Wellbeing
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Free emotional counseling and mental wellness guidance in Telugu, Hindi, and English.
                  </p>
                  <a
                    href="tel:14416"
                    className="block text-center py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs"
                  >
                    Call 14416 Tele-MANAS
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
