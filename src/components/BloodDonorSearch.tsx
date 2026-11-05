import React, { useState } from 'react';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Droplet,
  Search,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  UserPlus,
  AlertTriangle,
  Volume2,
  CheckCircle2,
  X,
  Filter,
  HeartHandshake,
} from 'lucide-react';

interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  gender: string;
  phoneNumber: string; // Exactly 10 digits
  district: string;
  villageTaluka: string;
  distanceKm: number;
  lastDonatedDaysAgo: number;
  isAvailable: boolean;
  donationsCount: number;
  verified: boolean;
}

const SAMPLE_DONORS: BloodDonor[] = [
  {
    id: 'donor-1',
    name: 'Suresh Varma',
    bloodGroup: 'O+',
    age: 29,
    gender: 'Male',
    phoneNumber: '9848123456',
    district: 'Guntur Rural',
    villageTaluka: 'Tenali Block',
    distanceKm: 3.2,
    lastDonatedDaysAgo: 110,
    isAvailable: true,
    donationsCount: 6,
    verified: true,
  },
  {
    id: 'donor-2',
    name: 'Pooja Reddy',
    bloodGroup: 'B+',
    age: 24,
    gender: 'Female',
    phoneNumber: '9440987654',
    district: 'Warangal Rural',
    villageTaluka: 'Narsampet Sub-center',
    distanceKm: 5.1,
    lastDonatedDaysAgo: 95,
    isAvailable: true,
    donationsCount: 3,
    verified: true,
  },
  {
    id: 'donor-3',
    name: 'Venkatesh Rao',
    bloodGroup: 'A+',
    age: 34,
    gender: 'Male',
    phoneNumber: '9988776655',
    district: 'Krishna District',
    villageTaluka: 'Gudivada PHC Zone',
    distanceKm: 6.8,
    lastDonatedDaysAgo: 140,
    isAvailable: true,
    donationsCount: 11,
    verified: true,
  },
  {
    id: 'donor-4',
    name: 'Mohammed Asif',
    bloodGroup: 'AB+',
    age: 27,
    gender: 'Male',
    phoneNumber: '9123456780',
    district: 'Medak Rural',
    villageTaluka: 'Sangareddy Block',
    distanceKm: 8.5,
    lastDonatedDaysAgo: 120,
    isAvailable: true,
    donationsCount: 4,
    verified: true,
  },
  {
    id: 'donor-5',
    name: 'Kavitha Devi',
    bloodGroup: 'O-',
    age: 31,
    gender: 'Female',
    phoneNumber: '9866543210',
    district: 'Guntur Rural',
    villageTaluka: 'Mangalagiri Camp',
    distanceKm: 4.7,
    lastDonatedDaysAgo: 180,
    isAvailable: true,
    donationsCount: 5,
    verified: true,
  },
  {
    id: 'donor-6',
    name: 'Anil Kumar',
    bloodGroup: 'B-',
    age: 26,
    gender: 'Male',
    phoneNumber: '9000112233',
    district: 'Patna Rural',
    villageTaluka: 'Danapur CHC Zone',
    distanceKm: 7.2,
    lastDonatedDaysAgo: 105,
    isAvailable: true,
    donationsCount: 2,
    verified: true,
  },
  {
    id: 'donor-7',
    name: 'Ravi Teja',
    bloodGroup: 'A-',
    age: 38,
    gender: 'Male',
    phoneNumber: '9700889900',
    district: 'Warangal Rural',
    villageTaluka: 'Jangaon Block',
    distanceKm: 9.4,
    lastDonatedDaysAgo: 160,
    isAvailable: true,
    donationsCount: 8,
    verified: true,
  },
];

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface BloodDonorSearchProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
}

export const BloodDonorSearch: React.FC<BloodDonorSearchProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [donorsList, setDonorsList] = useState<BloodDonor[]>(SAMPLE_DONORS);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEmergencySosSent, setIsEmergencySosSent] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGroup, setRegGroup] = useState('O+');
  const [regAge, setRegAge] = useState(25);
  const [regDistrict, setRegDistrict] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  // Filter donors
  const filteredDonors = donorsList.filter((donor) => {
    const matchGroup = selectedGroup === 'ALL' || donor.bloodGroup === selectedGroup;
    const matchLoc =
      !searchLocation.trim() ||
      donor.district.toLowerCase().includes(searchLocation.toLowerCase()) ||
      donor.villageTaluka.toLowerCase().includes(searchLocation.toLowerCase());
    return matchGroup && matchLoc;
  });

  const handleSpeakResults = () => {
    const text = isTelugu
      ? `రక్తదాతల శోధన: ${filteredDonors.length} మంది అందుబాటులో ఉన్నారు. సమీపంలో ${filteredDonors[0]?.bloodGroup || ''} రక్తదాత ఉన్నారు.`
      : isHindi
      ? `ब्लड डोनर खोज: कुल ${filteredDonors.length} रक्तदाता उपलब्ध हैं। सबसे नजदीकी डोनर ${filteredDonors[0]?.name || ''} हैं।`
      : `Blood donor search found ${filteredDonors.length} verified donors nearby ready to help.`;

    audioPlayer.speakText({
      text,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Phone number must be exactly 10 digits
    const cleanedPhone = regPhone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setRegError(
        isTelugu
          ? 'ఫోన్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి (ఉదా: 9848012345)'
          : isHindi
          ? 'फ़ोन नंबर ठीक 10 अंकों का होना चाहिए'
          : 'Phone number must be exactly 10 digits (e.g. 9848012345)'
      );
      return;
    }

    if (!regName.trim()) {
      setRegError('Please enter your full name');
      return;
    }

    const newDonor: BloodDonor = {
      id: `donor-${Date.now()}`,
      name: regName.trim(),
      bloodGroup: regGroup,
      age: Number(regAge),
      gender: 'Self',
      phoneNumber: cleanedPhone,
      district: regDistrict.trim() || 'Local Block',
      villageTaluka: 'Registered Community',
      distanceKm: 1.5,
      lastDonatedDaysAgo: 90,
      isAvailable: true,
      donationsCount: 1,
      verified: true,
    };

    setDonorsList([newDonor, ...donorsList]);
    setIsRegisterModalOpen(false);
    audioPlayer.playChime('success');
    alert(
      isTelugu
        ? 'రక్తదాతగా మీ వివరాలు విజయవంతంగా నమోదు చేయబడ్డాయి! ధన్యవాదాలు.'
        : isHindi
        ? 'रक्तदाता के रूप में आपका पंजीकरण सफल हुआ! धन्यवाद।'
        : 'Thank you! You have been successfully registered as a verified blood donor.'
    );
  };

  const handleTriggerEmergencySos = () => {
    setIsEmergencySosSent(true);
    audioPlayer.playChime('urgent');
    const spoken = isTelugu
      ? 'అత్యవసర రక్త అభ్యర్థన సక్రియం చేయబడింది. సమీపంలోని నమోదిత రక్తదాతలు మరియు 108 కేంద్రానికి సమాచారం వెళ్ళింది.'
      : isHindi
      ? 'इमरजेंसी ब्लड अलर्ट जारी किया गया है। नजदीकी सभी रक्तदाताओं को संदेश भेजा जा रहा है।'
      : 'Emergency Blood SOS alert activated. Alerting all available nearby donors and community health workers.';
    
    audioPlayer.speakText({
      text: spoken,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Droplet className="w-7 h-7 fill-white text-rose-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isTelugu
                    ? 'రక్తదాతల శోధన & అత్యవసర సేవ'
                    : isHindi
                    ? 'ब्लड डोनर खोज व आपातकालीन सेवा'
                    : 'Blood Donor Search & Emergency Blood Access'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-400/30 text-rose-100 text-[10px] font-black border border-rose-300/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-rose-100/90 font-medium">
                {isTelugu
                  ? 'గ్రామీణ మరియు నగర పరిధిలో ధృవీకరించబడిన రక్తదాతలు'
                  : isHindi
                  ? 'ग्रामीण व नजदीकी क्षेत्रों के सत्यापित रक्तदाता'
                  : 'Find verified donors by blood group & rural taluka/block'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakResults}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
              title="Voice announcement"
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

        {/* Emergency SOS Banner */}
        <div className="p-3 bg-rose-50 border-b border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-rose-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {isTelugu
                ? 'అత్యవసర రక్తం అవసరమా? సమీపంలోని రక్తదాతలకు తక్షణ సమాచారం పంపండి'
                : isHindi
                ? 'तुरंत रक्त की आवश्यकता है? नजदीकी डोनर्स को इमरजेंसी अलर्ट भेजें'
                : 'Need Urgent Blood? Broadcast emergency alert to nearby donors'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerEmergencySos}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                isEmergencySosSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>
                {isEmergencySosSent
                  ? isTelugu
                    ? 'SOS అలర్ట్ పంపబడింది!'
                    : 'SOS Alert Sent!'
                  : isTelugu
                  ? 'అత్యవసర SOS అభ్యర్థన'
                  : 'Trigger Emergency SOS'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-rose-700 border border-rose-300 font-black text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>
                {isTelugu ? 'దాతగా చేరండి' : isHindi ? 'डोनर बनें' : 'Register as Donor'}
              </span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* Blood group chips */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1.5">
              {isTelugu ? 'రక్త సమూహం ఎంచుకోండి' : isHindi ? 'ब्लड ग्रुप चुनें' : 'Select Blood Group'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BLOOD_GROUPS.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedGroup === grp
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Location filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder={
                  isTelugu
                    ? 'జిల్లా లేదా గ్రామం / మండలం పేరు నమోదు చేయండి (ఉదా: Guntur, Warangal...)'
                    : isHindi
                    ? 'जिला, ब्लॉक या गाँव का नाम दर्ज करें'
                    : 'Search by District, Taluka, or Village (e.g. Guntur, Warangal, Medak)'
                }
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-rose-500"
              />
            </div>
            {searchLocation && (
              <button
                type="button"
                onClick={() => setSearchLocation('')}
                className="px-2.5 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Donors List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 px-1">
            <span>
              {isTelugu
                ? `లభ్యమైన దాతలు: ${filteredDonors.length}`
                : isHindi
                ? `उपलब्ध डोनर्स: ${filteredDonors.length}`
                : `Verified Donors Found: ${filteredDonors.length}`}
            </span>
            <span className="text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% 10-Digit Direct Contact
            </span>
          </div>

          {filteredDonors.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Droplet className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-black text-slate-600">
                {isTelugu ? 'ఈ సమూహంలో దాతలు లభించలేదు' : 'No donors matching this filter'}
              </p>
              <p className="text-xs text-slate-400">
                Try selecting "ALL" blood groups or clearing location search.
              </p>
            </div>
          ) : (
            filteredDonors.map((donor) => (
              <div
                key={donor.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 transition-all shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{donor.name}</h3>
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                        ✓ Verified
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {donor.age}y • {donor.gender}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-semibold mt-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {donor.villageTaluka}, {donor.district} ({donor.distanceKm} km away)
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        Last donated {donor.lastDonatedDaysAgo}d ago ({donor.donationsCount} times)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={`tel:${donor.phoneNumber}`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {donor.phoneNumber}</span>
                  </a>

                  <a
                    href={`sms:${donor.phoneNumber}?body=Emergency%20Blood%20Request%20for%20Group%20${donor.bloodGroup}%20via%20Sahaaya%20Care`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                    title="Send SMS"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Register Modal Backdrop */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-rose-600" />
                  {isTelugu ? 'రక్తదాతగా నమోదు చేసుకోండి' : 'Register as Blood Donor'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {regError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegisterDonor} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isTelugu ? 'పూర్తి పేరు' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isTelugu ? 'రక్త సమూహం' : 'Blood Group'}
                    </label>
                    <select
                      value={regGroup}
                      onChange={(e) => setRegGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isTelugu ? 'వయస్సు (కనీసం 18)' : 'Age (Min 18)'}
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={65}
                      value={regAge}
                      onChange={(e) => setRegAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isTelugu ? 'మొబైల్ ఫోన్ (10 అంకెలు)' : 'Mobile Phone (Strictly 10 Digits)'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {regPhone.length}/10 digits entered
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isTelugu ? 'గ్రామం / మండలం / జిల్లా' : 'Village / Taluka / District'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    placeholder="e.g. Warangal Rural Block"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md mt-2 cursor-pointer"
                >
                  {isTelugu ? 'నమోదు పూర్తి చేయండి' : 'Complete Donor Registration'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
