import React, { useEffect, useState } from 'react';
import { audioPlayer } from '../utils/audioPlayer';
import { PhoneCall, ShieldAlert, HeartHandshake, Volume2, X, AlertTriangle, UserCheck, Stethoscope, Phone } from 'lucide-react';

interface EmergencyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: string;
  patientName?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage = 'English',
  patientName = 'Patient',
  emergencyContact = {
    name: 'Nurse Sarah (Cardiology)',
    phone: '108',
    relation: 'Caregiver / Doctor',
  },
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  const caregiverName = emergencyContact.name || 'Caregiver';
  const caregiverPhone = emergencyContact.phone || '108';

  const emergencyProtocolSpeech = isTelugu
    ? `అత్యవసర సహాయం ప్రారంభించబడింది! దయచేసి ప్రశాంతంగా ఉండండి, కంగారు పడకండి. నిదానంగా లోతైన శ్వాస తీసుకోండి. మీ సంరక్షకుడు ${caregiverName} కు లేదా నూట ఎనిమిది అత్యవసర సేవలకు కాల్ చేయడానికి స్క్రీన్‌పై ఉన్న పెద్ద బటన్‌ను నొక్కండి. మేము మీతోనే ఉన్నాము.`
    : isHindi
    ? `आपातकालीन सहायता शुरू की गई है! कृपया शांत रहें और घबराएं नहीं। गहरी सांस लें। अपने देखभालकर्ता ${caregiverName} या 108 आपातकालीन सेवाओं को कॉल करने के लिए स्क्रीन पर दिया गया बड़ा बटन दबाएं। हम आपकी सहायता के लिए तैयार हैं।`
    : `Emergency Help protocol activated! Please stay calm and take a slow, deep breath. Tap the large green button to call your registered caregiver ${caregiverName} at ${caregiverPhone}, or tap the ambulance button for local emergency services.`;

  const speakEmergency = () => {
    setIsPlayingAudio(true);
    audioPlayer.playChime('urgent');
    audioPlayer.speakText({
      text: emergencyProtocolSpeech,
      language: selectedLanguage,
      speed: 0.82, // calm, unhurried, reassuring pace
      voice: 'Kore',
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Trigger spoken emergency protocol automatically on open
  useEffect(() => {
    if (isOpen) {
      speakEmergency();
    } else {
      audioPlayer.stop();
    }
  }, [isOpen, selectedLanguage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden my-auto flex flex-col">
        {/* Siren Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-700 via-red-600 to-rose-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black shadow-lg text-2xl animate-bounce">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isTelugu ? 'అత్యవసర సహాయం (Emergency Help)' : isHindi ? 'आपातकालीन सहायता (Emergency Help)' : 'Emergency Care Protocol'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-rose-100 font-semibold mt-0.5">
                {isTelugu ? 'కంగారు పడకండి • వెంటనే సహాయం అందుబాటులో ఉంది' : 'Stay calm • Immediate medical assistance & voice protocol'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioPlayer.stop();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
            aria-label="Close emergency help"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 bg-slate-50 flex-1">
          {/* Calm Guidance Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3 shadow-xs">
            <span className="text-2xl">🫁</span>
            <div>
              <h4 className="text-sm font-black text-amber-950">
                {isTelugu ? '1. ప్రశాంతంగా కూర్చోండి, లోతైన శ్వాస తీసుకోండి' : isHindi ? '1. आराम से बैठें, गहरी सांस लें' : '1. Sit down comfortably and breathe slowly'}
              </h4>
              <p className="text-xs text-amber-900 font-medium mt-0.5 leading-relaxed">
                {isTelugu
                  ? 'కంగారు పడకుండా ఒక గ్లాసు మంచినీరు త్రాగండి. అవసరమైతే క్రింది బటన్ నొక్కి వెంటనే మీ సంరక్షకుడికి లేదా అంబులెన్స్‌కు కాల్ చేయండి.'
                  : 'Do not panic. Sip fresh water. Tap the big buttons below to connect your phone directly to your registered family caregiver or local ambulance.'}
              </p>
            </div>
          </div>

          {/* Primary Action 1: Call Registered Caregiver */}
          <a
            href={`tel:${caregiverPhone}`}
            className="group w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-200 flex items-center justify-between gap-4 transition-all active:scale-98 border-2 border-emerald-400"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black text-2xl shadow-md shrink-0 group-hover:scale-110 transition">
                <PhoneCall className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-left truncate">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 block">
                  {isTelugu ? 'మీ సంరక్షకుడికి కాల్ చేయండి (Registered Caregiver)' : 'Call Registered Caregiver'}
                </span>
                <span className="text-base sm:text-lg font-black text-white block truncate">
                  {caregiverName} ({emergencyContact.relation || 'Caregiver'})
                </span>
                <span className="text-xs font-bold text-emerald-100 block">
                  {caregiverPhone}
                </span>
              </div>
            </div>

            <span className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 font-black text-xs shrink-0 shadow-sm flex items-center gap-1.5">
              <span>{isTelugu ? 'ఇప్పుడే కాల్ చేయి' : 'Call Now'}</span>
              <span>📞</span>
            </span>
          </a>

          {/* Primary Action 2: Call Emergency Medical Ambulance (108 / 112) */}
          <a
            href="tel:108"
            className="group w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white shadow-xl shadow-rose-200 flex items-center justify-between gap-4 transition-all active:scale-98 border-2 border-rose-400"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white text-rose-700 flex items-center justify-center font-black text-2xl shadow-md shrink-0 group-hover:scale-110 transition">
                🚑
              </div>
              <div className="text-left truncate">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-200 block">
                  {isTelugu ? 'స్థానిక అత్యవసర అంబులెన్స్ (Emergency Ambulance)' : 'Local Medical Emergency Ambulance'}
                </span>
                <span className="text-base sm:text-lg font-black text-white block">
                  Dial 108 / 112
                </span>
                <span className="text-xs font-bold text-rose-100 block">
                  {isTelugu ? '24 గంటలు అందుబాటులో ఉండే ఉచిత అత్యవసర సేవ' : '24x7 Government Medical Response'}
                </span>
              </div>
            </div>

            <span className="px-3.5 py-2 rounded-xl bg-white text-rose-950 font-black text-xs shrink-0 shadow-sm flex items-center gap-1.5">
              <span>{isTelugu ? '108 కి కాల్' : 'Dial 108'}</span>
              <span>🚨</span>
            </span>
          </a>

          {/* Spoken Audio Re-play Control */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🗣️</span>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  {isTelugu ? 'స్వర సూచనలు మళ్లీ వినండి' : 'Spoken Voice Protocol'}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold block">
                  {isTelugu ? 'స్పష్టమైన తెలుగులో సహాయ సూచనలు' : 'Clear unhurried spoken reassurance'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={speakEmergency}
              className={`px-3.5 py-2 rounded-xl font-black text-xs transition active:scale-95 flex items-center gap-1.5 ${
                isPlayingAudio
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isPlayingAudio ? (isTelugu ? 'వినిపిస్తోంది...' : 'Speaking...') : (isTelugu ? 'మళ్లీ వినండి 🔊' : 'Play Audio 🔊')}</span>
            </button>
          </div>

          {/* Patient Card for Doctor/Paramedic Identification */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isTelugu ? 'రోగి సమాచారం (Medical Snapshot):' : 'Medical Identification:'}</span>
            </span>
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>{patientName}</span>
              <span className="text-[11px] text-indigo-700">Sahaaya Care Enrolled</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {isTelugu
                ? 'డాక్టర్ లేదా పారామెడిక్స్ కోసం: రోగి సమయ పట్టిక మరియు మందుల వివరాలు ఈ యాప్‌లో భద్రపరచబడ్డాయి.'
                : 'For first responders: Current prescribed regimen and visual pill schedule are active on this device.'}
            </p>
          </div>
        </div>

        {/* Footer with Safe Dismiss Button */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-semibold">
            {isTelugu ? 'సమస్య పరిష్కారమైతే క్రింది బటన్ నొక్కండి' : 'Tap below when assistance is secured'}
          </span>
          <button
            type="button"
            onClick={() => {
              audioPlayer.stop();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition active:scale-95"
          >
            {isTelugu ? 'నేను సురక్షితంగా ఉన్నాను (I am Safe)' : 'I Am Okay Now / Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
