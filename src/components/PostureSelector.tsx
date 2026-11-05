import React from 'react';
import { PostureMode } from '../types/medicine';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Volume2,
  Sliders,
  Grid,
  Printer,
  Sparkles,
  Shield,
  Eye,
  Check,
  TrendingUp,
} from 'lucide-react';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

interface PostureSelectorProps {
  currentPosture: PostureMode;
  onChangePosture: (posture: PostureMode) => void;
  medicinesCount: number;
  selectedLanguage?: string;
}

export const PostureSelector: React.FC<PostureSelectorProps> = ({
  currentPosture,
  onChangePosture,
  medicinesCount,
  selectedLanguage = 'English',
}) => {
  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  const postures: {
    key: PostureMode;
    label: string;
    sub: string;
    icon: any;
    accent: string;
    badge?: string;
  }[] = [
    {
      key: 'patient',
      label: t.posturePatientAudio,
      sub: t.posturePatientAudioSub,
      icon: Volume2,
      accent: 'text-amber-500 bg-amber-500/10 border-amber-500/40',
      badge: selectedLanguage === 'Telugu' ? 'సహాయ మోడ్' : selectedLanguage === 'Hindi' ? 'सहायक मोड' : 'Assisted Mode',
    },
    {
      key: 'caregiver',
      label: t.postureCaregiver,
      sub: t.postureCaregiverSub,
      icon: Sliders,
      accent: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/40',
      badge: selectedLanguage === 'Telugu' ? 'ఎడిటర్ మోడ్' : selectedLanguage === 'Hindi' ? 'एडिटर मोड' : 'Editor Mode',
    },
    {
      key: 'adherence',
      label: t.postureAdherence,
      sub: t.postureAdherenceSub,
      icon: TrendingUp,
      accent: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/40',
      badge: 'Recharts',
    },
    {
      key: 'matrix',
      label: t.postureMatrix,
      sub: t.postureMatrixSub,
      icon: Grid,
      accent: 'text-blue-600 bg-blue-500/10 border-blue-500/40',
    },
    {
      key: 'print',
      label: t.posturePrint,
      sub: t.posturePrintSub,
      icon: Printer,
      accent: 'text-sky-600 bg-sky-500/10 border-sky-500/40',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              {t.workspacePosture}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
              {postures.find((p) => p.key === currentPosture)?.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {selectedLanguage === 'Telugu'
              ? 'రోగి వినే విధానం, కేర్‌గివర్ సవరణ మరియు 30 రోజుల ట్రాకింగ్ మధ్య మారండి.'
              : selectedLanguage === 'Hindi'
              ? 'मरीज़ की आवाज़ गाइड, देखभालकर्ता संपादन और 30 दिनों के रिकॉर्ड में बदलें।'
              : 'Switch between patient listening, caregiver editing, and weekly tracking.'}
          </p>
        </div>

        {currentPosture === 'caregiver' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-extrabold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>{t.caregiverActiveAlert}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {postures.map((item) => {
          const isActive = currentPosture === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onChangePosture(item.key);
                audioPlayer.playChime('tap');
              }}
              className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-400/30'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent}`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                {isActive && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                <span
                  className={`block text-xs sm:text-sm font-black ${
                    isActive ? 'text-indigo-950' : 'text-slate-900'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-500 font-medium line-clamp-1 block mt-0.5">
                  {item.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
