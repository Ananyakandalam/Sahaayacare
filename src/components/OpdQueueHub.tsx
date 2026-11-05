import React, { useState } from 'react';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Users,
  Clock,
  Ticket,
  Building2,
  Stethoscope,
  Volume2,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  RefreshCw,
  QrCode,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface OpdDepartment {
  id: string;
  name: string;
  doctorName: string;
  roomNumber: string;
  currentServingToken: number;
  totalTokensIssued: number;
  averageTimePerPatientMins: number;
  status: 'active' | 'break' | 'crowded';
}

interface UserOpdToken {
  tokenNumber: number;
  departmentId: string;
  departmentName: string;
  doctorName: string;
  roomNumber: string;
  patientName: string;
  patientAge: number;
  phoneNumber: string;
  symptoms: string;
  slotTime: string;
  bookedAt: string;
}

const SAMPLE_DEPARTMENTS: OpdDepartment[] = [
  {
    id: 'general',
    name: 'General Medicine & Fever OPD',
    doctorName: 'Dr. V. Prasad (MBBS, MD)',
    roomNumber: 'Room 01',
    currentServingToken: 14,
    totalTokensIssued: 28,
    averageTimePerPatientMins: 4,
    status: 'active',
  },
  {
    id: 'pediatrics',
    name: 'Pediatric & Child Health (Age 1+ yrs)',
    doctorName: 'Dr. Sunita Murthy (DCH Pediatrician)',
    roomNumber: 'Room 02',
    currentServingToken: 8,
    totalTokensIssued: 16,
    averageTimePerPatientMins: 5,
    status: 'active',
  },
  {
    id: 'cardiology',
    name: 'Cardiology & Blood Pressure Clinic',
    doctorName: 'Dr. K. Rao (DM Cardiology)',
    roomNumber: 'Room 03',
    currentServingToken: 19,
    totalTokensIssued: 26,
    averageTimePerPatientMins: 6,
    status: 'crowded',
  },
  {
    id: 'ortho',
    name: 'Orthopedics & Joint Care',
    doctorName: 'Dr. Anand Verma (MS Ortho)',
    roomNumber: 'Room 04',
    currentServingToken: 11,
    totalTokensIssued: 21,
    averageTimePerPatientMins: 5,
    status: 'active',
  },
];

interface OpdQueueHubProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  defaultPatientName?: string;
  defaultAge?: number;
  defaultPhone?: string;
}

export const OpdQueueHub: React.FC<OpdQueueHubProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  defaultPatientName = '',
  defaultAge = 60,
  defaultPhone = '',
}) => {
  const [departments, setDepartments] = useState<OpdDepartment[]>(SAMPLE_DEPARTMENTS);
  const [activeToken, setActiveToken] = useState<UserOpdToken | null>(() => {
    const saved = localStorage.getItem('sahaaya_active_opd_token');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      tokenNumber: 22,
      departmentId: 'general',
      departmentName: 'General Medicine & Fever OPD',
      doctorName: 'Dr. V. Prasad (MBBS, MD)',
      roomNumber: 'Room 01',
      patientName: defaultPatientName || 'Patient',
      patientAge: defaultAge || 45,
      phoneNumber: defaultPhone || '9848012345',
      symptoms: 'Mild dizziness & blood pressure review',
      slotTime: 'Morning (10:30 AM - 11:30 AM)',
      bookedAt: 'Today, 09:15 AM',
    };
  });

  // Booking Form State
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [bookDeptId, setBookDeptId] = useState('general');
  const [bookPatientName, setBookPatientName] = useState(defaultPatientName || '');
  const [bookAge, setBookAge] = useState<number>(defaultAge || 45); // Starts from 1
  const [bookPhone, setBookPhone] = useState(defaultPhone.replace(/\D/g, '').slice(-10) || '');
  const [bookSymptoms, setBookSymptoms] = useState('');
  const [bookSlot, setBookSlot] = useState('Morning (09:00 AM - 01:00 PM)');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  // Calculate queue distance
  const currentDept = departments.find((d) => d.id === (activeToken?.departmentId || 'general'));
  const currentServing = currentDept?.currentServingToken || 14;
  const patientsAhead = activeToken ? Math.max(0, activeToken.tokenNumber - currentServing) : 0;
  const estimatedWaitMins = patientsAhead * (currentDept?.averageTimePerPatientMins || 4);

  const handleSpeakQueueStatus = () => {
    if (!activeToken) {
      const msg = isTelugu
        ? 'ప్రస్తుతం మీ దగ్గర ఓపీడీ టోకెన్ లేదు. టోకెన్ బుక్ చేయడానికి క్రింది బటన్ నొక్కండి.'
        : isHindi
        ? 'वर्तमान में कोई सक्रिय ओपीडी टोकन नहीं है।'
        : 'You do not have an active OPD token right now. Tap book token to get one.';
      audioPlayer.speakText({ text: msg, language: selectedLanguage, voice: 'Kore', speed: 0.85 });
      return;
    }

    const spokenText = isTelugu
      ? `మీ ఓపీడీ టోకెన్ నంబర్ ${activeToken.tokenNumber}. విభాగం: ${activeToken.departmentName}, గది ${activeToken.roomNumber}. ప్రస్తుతం టోకెన్ నంబర్ ${currentServing} పరిశీలించబడుతోంది. మీ ముందు ${patientsAhead} మంది రోగులు ఉన్నారు. సుమారు ${estimatedWaitMins} నిమిషాల సమయం పడుతుంది.`
      : isHindi
      ? `आपका ओपीडी टोकन नंबर ${activeToken.tokenNumber} है। वर्तमान में टोकन ${currentServing} का इलाज चल रहा है। आपके आगे ${patientsAhead} मरीज हैं। अनुमानित प्रतीक्षा समय ${estimatedWaitMins} मिनट है।`
      : `Your OPD Token is number ${activeToken.tokenNumber} in ${activeToken.roomNumber}. Currently doctor is seeing Token ${currentServing}. There are ${patientsAhead} patients ahead of you. Estimated wait is ${estimatedWaitMins} minutes.`;

    audioPlayer.speakText({
      text: spokenText,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  const handleBookToken = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Phone 10-digit validation
    const cleanedPhone = bookPhone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setFormError(
        isTelugu
          ? 'ఫోన్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి (ఉదా: 9848012345)'
          : isHindi
          ? 'फ़ोन नंबर 10 अंकों का होना आवश्यक है'
          : 'Phone number must be exactly 10 digits'
      );
      return;
    }

    if (bookAge < 1 || bookAge > 120) {
      setFormError('Age must be between 1 and 120 years');
      return;
    }

    const dept = departments.find((d) => d.id === bookDeptId) || departments[0];
    const nextTokenNum = dept.totalTokensIssued + 1;

    // Update total tokens in department
    setDepartments((prev) =>
      prev.map((d) => (d.id === dept.id ? { ...d, totalTokensIssued: nextTokenNum } : d))
    );

    const newToken: UserOpdToken = {
      tokenNumber: nextTokenNum,
      departmentId: dept.id,
      departmentName: dept.name,
      doctorName: dept.doctorName,
      roomNumber: dept.roomNumber,
      patientName: bookPatientName.trim() || 'Patient',
      patientAge: Number(bookAge),
      phoneNumber: cleanedPhone,
      symptoms: bookSymptoms.trim() || 'General Consultation',
      slotTime: bookSlot,
      bookedAt: 'Just Now',
    };

    setActiveToken(newToken);
    localStorage.setItem('sahaaya_active_opd_token', JSON.stringify(newToken));
    setIsBookingFormOpen(false);
    audioPlayer.playChime('success');

    const spoken = isTelugu
      ? `మీ ఓపీడీ టోకెన్ #${nextTokenNum} విజయవంతంగా బుక్ అయ్యింది! గది ${dept.roomNumber}.`
      : isHindi
      ? `आपका टोकन #${nextTokenNum} बुक हो गया है।`
      : `Your OPD token #${nextTokenNum} has been booked successfully in ${dept.roomNumber}.`;

    audioPlayer.speakText({
      text: spoken,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  const handleSimulateNextPatient = () => {
    if (!activeToken) return;
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === activeToken.departmentId && d.currentServingToken < activeToken.tokenNumber
          ? { ...d, currentServingToken: d.currentServingToken + 1 }
          : d
      )
    );
    audioPlayer.playChime('tap');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Ticket className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isTelugu
                    ? 'ఓపీడీ క్యూ & లైవ్ టోకెన్ స్థితి (OPD Queue)'
                    : isHindi
                    ? 'ओपीडी कतार और लाइव टोकन स्थिति (OPD Queue)'
                    : 'OPD Queue & Live Token Management'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 text-[10px] font-black border border-emerald-300/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 font-medium">
                {isTelugu
                  ? 'కమ్యూనిటీ హెల్త్ సెంటర్ & హాస్పిటల్ ప్రత్యక్ష టోకెన్ ట్రాకర్'
                  : isHindi
                  ? 'सामुदायिक स्वास्थ्य केंद्र व अस्पताल की लाइव कतार'
                  : 'Live clinic tokens, queue tracking & virtual OPD slip'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakQueueStatus}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
              title="Voice announcement of OPD Queue"
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Token Card */}
          {activeToken ? (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
                <Ticket className="w-48 h-48 text-white" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-indigo-700/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black tracking-wide">
                    MY OPD SLIP
                  </span>
                  <span className="text-xs text-indigo-200 font-semibold">
                    {activeToken.bookedAt} • {activeToken.slotTime}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSpeakQueueStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-black cursor-pointer transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isTelugu ? 'వినండి' : 'Listen Status'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 relative z-10 items-center">
                {/* Token Big Display */}
                <div className="text-center md:text-left">
                  <p className="text-xs uppercase font-black text-indigo-300 tracking-wider">
                    {isTelugu ? 'మీ టోకెన్ సంఖ్య' : isHindi ? 'आपका टोकन नंबर' : 'YOUR TOKEN NUMBER'}
                  </p>
                  <div className="text-5xl font-black text-amber-300 tracking-tight mt-1 flex items-baseline justify-center md:justify-start gap-1">
                    #{activeToken.tokenNumber}
                  </div>
                  <p className="text-xs font-bold text-indigo-200 mt-1">
                    {activeToken.patientName} ({activeToken.patientAge}y)
                  </p>
                </div>

                {/* Live Current Status */}
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <p className="text-[11px] font-black text-indigo-200 uppercase">
                    {isTelugu ? 'డాక్టర్ చూస్తున్న టోకెన్' : isHindi ? 'डॉक्टर देख रहे हैं' : 'Now Serving'}
                  </p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">
                    Token #{currentServing}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 mt-1 font-semibold">
                    <span>{activeToken.roomNumber}</span> • <span>{activeToken.doctorName}</span>
                  </div>
                </div>

                {/* Waiting countdown */}
                <div className="p-3.5 rounded-2xl bg-amber-400/20 border border-amber-300/30 text-center">
                  <p className="text-[11px] font-black text-amber-200 uppercase">
                    {isTelugu ? 'మీ ముందు రోగులు' : isHindi ? 'आपके आगे मरीज' : 'Patients Ahead'}
                  </p>
                  <p className="text-3xl font-black text-amber-300 mt-1">
                    {patientsAhead}
                  </p>
                  <p className="text-xs text-amber-100 font-bold mt-1">
                    ~{estimatedWaitMins} mins estimated wait
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 relative z-10">
                <div className="flex justify-between text-[11px] font-bold text-indigo-200">
                  <span>Room 01 Starting</span>
                  <span>{patientsAhead === 0 ? 'Your Turn Now! Please enter room.' : `${patientsAhead} tokens remaining`}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, (currentServing / activeToken.tokenNumber) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>SMS alert active on {activeToken.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateNextPatient}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Simulate queue advance"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Advance Queue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBookingFormOpen(true)}
                    className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                  >
                    + Book Another Slip
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200 text-center space-y-3">
              <Ticket className="w-12 h-12 text-indigo-400 mx-auto" />
              <h3 className="text-base font-black text-slate-800">
                {isTelugu ? 'మీకు ప్రస్తుత టోకెన్ లేదు' : 'No Active OPD Token'}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {isTelugu
                  ? 'క్యూలో వేచి ఉండాల్సిన అవసరం లేకుండా మీ వర్చువల్ ఓపీడీ స్లిప్‌ను సులభంగా పొందండి.'
                  : 'Skip standing in hospital lines. Book a digital OPD token and monitor your turn from home.'}
              </p>
              <button
                type="button"
                onClick={() => setIsBookingFormOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 cursor-pointer"
              >
                + Book Digital OPD Token
              </button>
            </div>
          )}

          {/* Live Status of All Hospital OPD Rooms */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>
                  {isTelugu
                    ? 'ఆసుపత్రి విభాగాల ప్రత్యక్ష క్యూ సమాచారం'
                    : isHindi
                    ? 'अस्पताल विभागों की लाइव कतार'
                    : 'Hospital OPD Rooms Live Queue Status'}
                </span>
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                Updated just now
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept) => {
                const waitTime =
                  (dept.totalTokensIssued - dept.currentServingToken) *
                  dept.averageTimePerPatientMins;
                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {dept.roomNumber}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 mt-1">
                          {dept.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {dept.doctorName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Now Serving
                        </span>
                        <span className="text-lg font-black text-emerald-600">
                          #{dept.currentServingToken}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {dept.totalTokensIssued - dept.currentServingToken} in line
                      </span>
                      <span className="flex items-center gap-1 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        ~{Math.max(0, waitTime)} mins wait
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal: Book Digital Token */}
        {isBookingFormOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  {isTelugu ? 'ఓపీడీ టోకెన్ బుకింగ్' : 'Book Digital OPD Token'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBookingFormOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                  {formError}
                </div>
              )}

              <form onSubmit={handleBookToken} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTelugu ? 'విభాగం ఎంచుకోండి' : 'Select Department'}
                  </label>
                  <select
                    value={bookDeptId}
                    onChange={(e) => setBookDeptId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.roomNumber} - {d.name} ({d.doctorName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTelugu ? 'రోగి పేరు' : 'Patient Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bookPatientName}
                    onChange={(e) => setBookPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Patel or Baby Aarav"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isTelugu ? 'వయస్సు (1వ సంవత్సరం నుండి)' : 'Age (Starts from 1 yr)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={bookAge}
                      onChange={(e) => setBookAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                    {bookAge <= 12 && (
                      <span className="text-[10px] text-indigo-600 font-black block mt-0.5">
                        👶 Pediatric Care Applied
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isTelugu ? 'మొబైల్ (10 అంకెలు)' : 'Mobile (10 Digits)'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {bookPhone.length}/10 digits
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTelugu ? 'సమస్య / లక్షణాలు' : 'Health Complaint / Reason for visit'}
                  </label>
                  <input
                    type="text"
                    value={bookSymptoms}
                    onChange={(e) => setBookSymptoms(e.target.value)}
                    placeholder="e.g. High fever, Blood pressure checkup, Child cough"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTelugu ? 'సమయం స్లాట్' : 'Preferred Slot'}
                  </label>
                  <select
                    value={bookSlot}
                    onChange={(e) => setBookSlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                    <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md mt-2 cursor-pointer"
                >
                  {isTelugu ? 'డిజిటల్ స్లిప్ రూపొందించండి' : 'Confirm & Generate OPD Slip'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
