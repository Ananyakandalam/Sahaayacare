import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Square, Settings2, PhoneCall, Globe2, Sparkles, UserCheck } from 'lucide-react';
import { audioPlayer } from '../utils/audioPlayer';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

interface SpokenAudioPlayerProps {
  currentlySpeakingText: string | null;
  isPlaying: boolean;
  onStop: () => void;
  onPlayTodayRoutine: () => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  speechSpeed: number;
  onSelectSpeed: (speed: number) => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  activeSegmentNote?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface VoiceOption {
  id: string;
  name: string;
  roleTitle: string;
  desc: string;
  samplePreview: string;
}

export const VOICES_BY_LANGUAGE: Record<string, VoiceOption[]> = {
  Telugu: [
    {
      id: 'Kore',
      name: 'అనన్య (Ananya)',
      roleTitle: 'స్నేహపూర్వక పరిరక్షకురాలు (Warm Nurse)',
      desc: 'చాలా మమతామయమైన, నెమ్మదైన, స్పష్టమైన స్వరము',
      samplePreview: 'నమస్కారం! నేను అనన్యను. మీ మందుల సమయం అయింది, నిదానంగా వేసుకోండి.',
    },
    {
      id: 'Puck',
      name: 'ఆరవ్ (Aarav)',
      roleTitle: 'స్పష్టమైన మిత్రుడు (Friendly Companion)',
      desc: 'ఉత్సాహభరిత, స్పష్టమైన మరియు స్నేహపూర్వక గొంతు',
      samplePreview: 'నమస్కారం! నేను ఆరవ్. సమయానికి మందులు వేసుకుని ఆరోగ్యంగా ఉండండి!',
    },
    {
      id: 'Zephyr',
      name: 'శాంతి (Shanti)',
      roleTitle: 'ప్రశాంత మృదుస్వరం (Calm & Soothing)',
      desc: 'అలసట లేని, ప్రశాంతమైన, అతి సౌమ్యమైన మాటలు',
      samplePreview: 'శాంతి వచనములు. మీ మందులను ఒక గ్లాసు నీటితో ప్రశాంతంగా తీసుకోండి.',
    },
    {
      id: 'Fenrir',
      name: 'శేఖర్ (Shekhar)',
      roleTitle: 'స్పష్టమైన ధీటైన గొంతు (Deep Reassuring)',
      desc: 'పెద్దలకు సులభంగా అర్థమయ్యే స్పష్టమైన గంభీర స్వరము',
      samplePreview: 'నమస్కారం. నేను శేఖర్. మీ ఆరోగ్య సూచనలను శ్రద్ధగా వినండి.',
    },
  ],
  Hindi: [
    {
      id: 'Kore',
      name: 'स्नेहा (Sneha)',
      roleTitle: 'स्नेहमयी व दयालु सेविका (Warm Caregiver)',
      desc: 'अत्यंत मीठी, आत्मीय, प्यार भरी और धैर्यवान आवाज़',
      samplePreview: 'नमस्ते! मैं स्नेहा हूँ। आपकी दवाई का समय हो गया है, आराम से पानी के साथ लीजिए।',
    },
    {
      id: 'Puck',
      name: 'रोहन (Rohan)',
      roleTitle: 'मिलनसार व स्पष्ट साथी (Friendly Companion)',
      desc: 'उत्साही, सहज और बहुत स्पष्ट समझने योग्य आवाज़',
      samplePreview: 'नमस्ते! मैं रोहन। समय पर दवाई लें और हमेशा मुस्कुराते रहें!',
    },
    {
      id: 'Zephyr',
      name: 'कविता (Kavita)',
      roleTitle: 'शांत व मधुर स्वर (Calm & Soothing)',
      desc: 'धीमी, सुकून भरी और सहज समझ आने वाली आवाज़',
      samplePreview: 'प्रणाम। एक घूंट ताज़ा पानी लें और अपनी दवाइयां निश्चिंत होकर लें।',
    },
    {
      id: 'Fenrir',
      name: 'अमित (Amit)',
      roleTitle: 'स्पष्ट व आश्वस्तकारी स्वर (Steady & Clear)',
      desc: 'बुजुर्गों के लिए बेहद स्पष्ट और धीर-गंभीर आवाज़',
      samplePreview: 'नमस्ते। मैं अमित। अपनी सेहत का ध्यान रखें और दवाइयां समय पर लें।',
    },
  ],
  English: [
    {
      id: 'Kore',
      name: 'Kore (Caring Nurse)',
      roleTitle: 'Warm, Friendly Caregiver',
      desc: 'Gentle, patient, compassionate female voice',
      samplePreview: 'Hello! I am Kore. It is time for your medicine, please take your time with water.',
    },
    {
      id: 'Puck',
      name: 'Puck (Companion)',
      roleTitle: 'Bright, Cheerful & Clear',
      desc: 'Friendly, clear, encouraging male voice',
      samplePreview: "Good day! I'm Puck. You are doing a wonderful job taking care of your health!",
    },
    {
      id: 'Zephyr',
      name: 'Zephyr (Tranquil)',
      roleTitle: 'Calm & Soothing Cadence',
      desc: 'Peaceful, unhurried guidance for reassurance',
      samplePreview: 'Take a deep breath and have a glass of water ready for your medicine.',
    },
    {
      id: 'Fenrir',
      name: 'Fenrir (Reassuring)',
      roleTitle: 'Deep & Crystal Clear',
      desc: 'Articulate, easy-to-hear male voice with great clarity',
      samplePreview: 'Hello. Your daily medicine routine is ready. Listen closely to each cue.',
    },
  ],
};

export const LANGUAGES = [
  { code: 'Telugu', label: '🇮🇳 తెలుగు (Telugu)' },
  { code: 'Hindi', label: '🇮🇳 हिंदी (Hindi)' },
  { code: 'English', label: '🇺🇸 English' },
];

export const SpokenAudioPlayer: React.FC<SpokenAudioPlayerProps> = ({
  currentlySpeakingText,
  isPlaying,
  onStop,
  onPlayTodayRoutine,
  selectedVoice,
  onSelectVoice,
  speechSpeed,
  onSelectSpeed,
  selectedLanguage,
  onSelectLanguage,
  activeSegmentNote,
  emergencyContact,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  const currentVoiceList =
    VOICES_BY_LANGUAGE[selectedLanguage] || VOICES_BY_LANGUAGE['English'];

  const activeVoiceOption =
    currentVoiceList.find((v) => v.id === selectedVoice) || currentVoiceList[0];

  const handlePreviewVoice = (v: VoiceOption, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectVoice(v.id);
    audioPlayer.speakText({
      text: v.samplePreview,
      voice: v.id,
      speed: speechSpeed,
      language: selectedLanguage,
    });
  };

  return (
    <div className="w-full bg-linear-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-800/60 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Audio Status & Big Trigger */}
        <div className="flex items-center gap-4">
          {isPlaying ? (
            <button
              type="button"
              onClick={onStop}
              className="w-16 h-16 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform ring-4 ring-rose-400/50"
              title="Stop speaking"
            >
              <Square className="w-7 h-7 fill-white" />
              <span className="text-[10px] font-black uppercase mt-0.5">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlayTodayRoutine}
              className="w-16 h-16 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform ring-4 ring-amber-300/40"
              title="Play today's spoken medicine guide"
            >
              <Play className="w-7 h-7 fill-slate-950 ml-1" />
              <span className="text-[10px] font-black uppercase mt-0.5">Speak</span>
            </button>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t.spokenAudioGuide}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{activeVoiceOption?.name || selectedVoice}</span>
              </span>

              {activeSegmentNote && (
                <span className="text-xs text-amber-300 font-extrabold truncate max-w-[200px]">
                  • {activeSegmentNote}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              {isPlaying ? t.speakingNow : t.readyToSpeak}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 font-medium">
              {t.audioDesc}
            </p>
          </div>
        </div>

        {/* Right: Audio Wave Visualizer & Quick Speed / Voice Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Animated sound bars when speaking */}
          {isPlaying && (
            <div className="flex items-end gap-1.5 h-9 px-3 py-1 bg-white/10 rounded-xl backdrop-blur-xs">
              <div className="w-1.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-6" />
              <div className="w-1.5 bg-amber-300 rounded-full animate-[bounce_0.6s_infinite_200ms] h-8" />
              <div className="w-1.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-5" />
              <div className="w-1.5 bg-amber-300 rounded-full animate-[bounce_0.6s_infinite_150ms] h-7" />
              <div className="w-1.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_250ms] h-4" />
            </div>
          )}

          {/* Speed Selector */}
          <div className="flex items-center bg-white/10 rounded-2xl p-1 border border-white/10 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => onSelectSpeed(0.75)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                speechSpeed === 0.75
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
              title="Gentle slow speed (ideal for elderly & non-readers)"
            >
              {t.speedSlow}
            </button>
            <button
              type="button"
              onClick={() => onSelectSpeed(0.95)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                speechSpeed > 0.8 && speechSpeed < 1.1
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              {t.speedNormal}
            </button>
            <button
              type="button"
              onClick={() => onSelectSpeed(1.2)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                speechSpeed > 1.1
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              {t.speedLively}
            </button>
          </div>

          {/* Settings modal toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-all text-xs font-black ${
              showSettings
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-white/10 border-white/10 text-indigo-200 hover:text-white'
            }`}
            title="Spoken audio settings (friendly voice options, language, emergency contact)"
          >
            <Settings2 className="w-4 h-4" />
            <span>{t.voiceOptionsBtn}</span>
          </button>
        </div>
      </div>

      {/* Currently spoken transcript banner */}
      {currentlySpeakingText && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-100 flex items-start gap-3">
          <Volume2 className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-sm font-semibold leading-relaxed">
            <span className="text-amber-300 font-extrabold mr-2">{t.speakingNow}</span>
            <span>"{currentlySpeakingText}"</span>
          </div>
        </div>
      )}

      {/* Expanded Audio Settings Panel */}
      {showSettings && (
        <div className="mt-5 pt-5 border-t border-indigo-800/80 space-y-4">
          {/* Friendly Manner Banner */}
          <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤗</span>
              <div>
                <span className="font-extrabold text-amber-300">
                  {selectedLanguage === 'Telugu'
                    ? 'స్పష్టమైన తెలుగు & ఆప్యాయతా స్వరము క్రియాశీలంగా ఉంది'
                    : selectedLanguage === 'Hindi'
                    ? 'स्पष्ट हिंदी व स्नेहपूर्ण आवाज़ सक्रिय है'
                    : 'Friendly Manner & Crystal Clear Enunciation Active'}
                </span>
                <p className="text-[11px] text-indigo-200/90 mt-0.5">
                  {t.friendlyActiveDesc}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
              Clear HD Audio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Friendly Voice selector for active language */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-indigo-200 font-black uppercase tracking-wider">
                  {t.voicePersonaLabel}
                </label>
              </div>

              <div className="space-y-2">
                {currentVoiceList.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onSelectVoice(v.id)}
                    className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                      selectedVoice === v.id
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-950/20'
                        : 'bg-white/5 text-indigo-100 hover:bg-white/10 border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-black">{v.name}</div>
                        <div
                          className={`text-[10px] font-bold ${
                            selectedVoice === v.id ? 'text-slate-800' : 'text-amber-300'
                          }`}
                        >
                          {v.roleTitle}
                        </div>
                      </div>

                      {/* Test Sample Button */}
                      <button
                        type="button"
                        onClick={(e) => handlePreviewVoice(v, e)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                          selectedVoice === v.id
                            ? 'bg-slate-950 text-amber-300 hover:bg-slate-900'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title={`Listen to sample in ${selectedLanguage}`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Sample</span>
                      </button>
                    </div>

                    <p
                      className={`text-[10px] mt-1 leading-snug ${
                        selectedVoice === v.id ? 'text-slate-800' : 'text-indigo-200/80'
                      }`}
                    >
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <label className="block text-indigo-200 font-black mb-2 uppercase tracking-wider">
                {t.spokenLanguageLabel} (భాష / भाषा):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      audioPlayer.playChime('tap');
                    }}
                    className={`p-3 rounded-xl text-left font-extrabold transition-all flex items-center justify-between text-sm ${
                      selectedLanguage === lang.code
                        ? 'bg-indigo-500 text-white font-black shadow-sm ring-2 ring-indigo-300'
                        : 'bg-white/5 text-indigo-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {selectedLanguage === lang.code && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-2xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Caregiver Emergency Phone Card */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <span className="block text-indigo-200 font-black uppercase tracking-wider mb-2">
                  {t.caregiverContact}
                </span>
                {emergencyContact ? (
                  <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-700/50">
                    <div className="font-extrabold text-white text-sm">
                      {emergencyContact.name} ({emergencyContact.relation})
                    </div>
                    <div className="text-amber-300 font-black text-base mt-0.5 tracking-wide">
                      {emergencyContact.phone}
                    </div>
                  </div>
                ) : (
                  <p className="text-indigo-300 text-xs">No emergency phone configured.</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const alertMsg =
                    selectedLanguage === 'Telugu'
                      ? `పరిరక్షకులను సంప్రదిస్తున్నాము: ${emergencyContact?.name || 'నర్స్'}. మీరు కళ్ళు తిరిగినట్లు అనిపిస్తే దయచేసి కూర్చుని ఒక గ్లాసు మంచినీరు త్రాగండి.`
                      : selectedLanguage === 'Hindi'
                      ? `सहायक से संपर्क कर रहे हैं: ${emergencyContact?.name || 'नर्स'}. यदि आपको चक्कर आ रहा है तो कृपया बैठकर ताज़ा पानी पिएं।`
                      : `Calling caregiver ${emergencyContact?.name || 'Nurse'}. If you feel dizzy, stay seated and drink water.`;
                  audioPlayer.speakText({
                    text: alertMsg,
                    voice: selectedVoice,
                    speed: speechSpeed,
                    language: selectedLanguage,
                  });
                }}
                className="mt-3 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t.hearNurseAssistance}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
