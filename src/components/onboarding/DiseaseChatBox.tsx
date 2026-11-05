import React, { useState, useEffect, useRef } from 'react';
import { audioPlayer } from '../../utils/audioPlayer';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Plus,
  X,
  Volume2,
  Check,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

interface DiseaseChatBoxProps {
  selectedConditions: string[];
  onToggleCondition: (condId: string) => void;
  customConditions: string[];
  onAddCustomDisease: (disease: string) => void;
  onRemoveCustomDisease: (disease: string) => void;
  selectedLanguage: string;
}

const COMMON_DISEASES = [
  { id: 'hypertension', label: 'High BP (రక్తపోటు)', icon: '🩺' },
  { id: 'diabetes', label: 'Diabetes (షుగర్)', icon: '🩸' },
  { id: 'cardiac', label: 'Heart Care (గుండె)', icon: '❤️' },
  { id: 'thyroid', label: 'Thyroid (థైరాయిడ్)', icon: '🦋' },
  { id: 'respiratory', label: 'Asthma (ఆయాసం)', icon: '🫁' },
  { id: 'arthritis', label: 'Joint Pain (కీళ్ల నొప్పులు)', icon: '🦴' },
  { id: 'acidity', label: 'Acidity / Gas (కడుపు మంట)', icon: '🔥' },
];

export const DiseaseChatBox: React.FC<DiseaseChatBoxProps> = ({
  selectedConditions,
  onToggleCondition,
  customConditions,
  onAddCustomDisease,
  onRemoveCustomDisease,
  selectedLanguage,
}) => {
  const [diseaseInput, setDiseaseInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isOtherActive, setIsOtherActive] = useState(true);
  const recognitionRef = useRef<any>(null);

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  // Speech recognition for saying the disease
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        selectedLanguage === 'Telugu'
          ? 'te-IN'
          : selectedLanguage === 'Hindi'
          ? 'hi-IN'
          : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDiseaseInput(transcript);
          handleSendDisease(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      // Fallback prompt simulation
      const fallback = prompt(
        isTelugu
          ? 'మీ వ్యాధి లేదా అనారోగ్యం పేరును టైప్ చేయండి:'
          : 'Please enter your disease or condition:'
      );
      if (fallback) {
        handleSendDisease(fallback);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      audioPlayer.playChime('tap');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  const handleSendDisease = (textToAdd?: string) => {
    const text = (textToAdd || diseaseInput).trim();
    if (!text) return;

    onAddCustomDisease(text);
    setDiseaseInput('');
    audioPlayer.playChime('success');

    const spokenConfirmation = isTelugu
      ? `మీ వ్యాధి చేర్చబడింది: ${text}`
      : isHindi
      ? `आपकी बीमारी जोड़ दी गई है: ${text}`
      : `Disease added: ${text}`;

    audioPlayer.speakText({
      text: spokenConfirmation,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/40 border-2 border-indigo-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            🩺
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>
                {isTelugu
                  ? 'రోగి వ్యాధులు & అనారోగ్యాలు'
                  : isHindi
                  ? 'मरीज की बीमारियां और स्वास्थ्य स्थिति'
                  : 'Patient Diseases & Medical Conditions'}
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                Step 2
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {isTelugu
                ? 'వ్యాధులను ఎంచుకోండి లేదా "Other" పక్కన ఉన్న చాట్ బాక్స్‌లో మీ సమస్యను చెప్పండి'
                : 'Select conditions or use the chat box at the side of "Other" to say or type your disease'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const promptMsg = isTelugu
              ? 'ఈ దశలో మీరు మీ వ్యాధులు ఎంచుకోవచ్చు. ఇతర వ్యాధుల కోసం Other పక్కన ఉన్న చాట్ బాక్స్‌లో చెప్పండి.'
              : 'Select common diseases or use the voice chat box right beside Other to say any medical condition.';
            audioPlayer.speakText({
              text: promptMsg,
              language: selectedLanguage,
              voice: 'Kore',
              speed: 0.85,
            });
          }}
          className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors cursor-pointer shrink-0"
          title="Listen instruction"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Disease Options Row with "Other" and the Chat Box at the side */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {COMMON_DISEASES.map((dis) => {
            const isSel = selectedConditions.includes(dis.id);
            return (
              <button
                key={dis.id}
                type="button"
                onClick={() => onToggleCondition(dis.id)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102 ring-2 ring-indigo-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
                }`}
              >
                <span>{dis.icon}</span>
                <span>{dis.label}</span>
                {isSel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}

          {/* "Other" button */}
          <button
            type="button"
            onClick={() => setIsOtherActive(!isOtherActive)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isOtherActive
                ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300 scale-102'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
            }`}
          >
            <span>✍️</span>
            <span>{isTelugu ? 'ఇతర వ్యాధి (Other)' : 'Other'}</span>
            <span className="text-[10px] bg-slate-900/10 px-1.5 py-0.5 rounded-full font-extrabold">
              Chat Box 👉
            </span>
          </button>
        </div>

        {/* CHAT BOX AT THE SIDE OF "OTHER" TO SAY OR TYPE THEIR DISEASE */}
        {isOtherActive && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-400/90 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between text-xs font-black text-amber-950">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  💬
                </span>
                <span>
                  {isTelugu
                    ? 'Other పక్కన ఉన్న చాట్ బాక్స్: మీ వ్యాధిని చెప్పండి లేదా టైప్ చేయండి'
                    : isHindi
                    ? 'Other के पास चैट बॉक्स: अपनी बीमारी बोलकर या लिखकर बताएं'
                    : 'Chat Box at the Side of "Other" — Say or Type Your Disease:'}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-amber-900 font-extrabold bg-amber-200/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>🎙️</span>
                  <span>{isListening ? 'Listening...' : 'Voice Enabled'}</span>
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendDisease();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={diseaseInput}
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  placeholder={
                    isTelugu
                      ? 'ఉదా: కిడ్నీ సమస్య, మైగ్రేన్, అల్సర్, ఫ్యాటీ లివర్, కీళ్ల సమస్య...'
                      : isHindi
                      ? 'उदा: किडनी की बीमारी, माइग्रेन, अल्सर, थायराइड, गठिया...'
                      : 'e.g. Kidney stone, Migraine, Fatty liver, Knee surgery, Eye pressure...'
                  }
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-inner"
                />

                {/* Voice Microphone to Say Disease */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-300'
                      : 'text-amber-700 hover:bg-amber-100 active:scale-95'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Tap to speak your disease aloud'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!diseaseInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>{isTelugu ? 'చేర్చు' : isHindi ? 'जोड़ें' : 'Add Disease'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-amber-900/90 font-medium">
              <span className="flex items-center gap-1">
                <span>💡</span>
                <span>
                  {isTelugu
                    ? 'మైక్రోఫోన్ నొక్కి మీ వ్యాధిని మాట్లాడవచ్చు లేదా పైన బాక్స్‌లో టైప్ చేయవచ్చు.'
                    : 'Tap the mic icon to say your illness in Telugu, Hindi, or English.'}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Display Added Custom Diseases */}
        {customConditions.length > 0 && (
          <div className="pt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase text-slate-500">
              {isTelugu ? 'మీరు నమోదు చేసిన వ్యాధులు:' : 'Registered Diseases:'}
            </span>
            {customConditions.map((dis, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-black flex items-center gap-2 shadow-2xs"
              >
                <span>💊 {dis}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCustomDisease(dis)}
                  className="hover:text-rose-600 p-0.5 cursor-pointer rounded-full transition-colors"
                  title="Remove disease"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
