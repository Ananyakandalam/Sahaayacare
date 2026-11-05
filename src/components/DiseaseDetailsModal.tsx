import React, { useState } from 'react';
import { HealthConditionOption } from '../types/user';
import { HEALTH_CONDITIONS_CATALOG } from '../data/healthConditionsCatalog';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Heart,
  Stethoscope,
  Volume2,
  X,
  ShieldAlert,
  Apple,
  Ban,
  Activity,
  AlertTriangle,
  Pill,
  CheckCircle2,
  Search,
  Sparkles,
} from 'lucide-react';

interface DiseaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  userConditionIds?: string[];
}

export const DiseaseDetailsModal: React.FC<DiseaseDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  userConditionIds = [],
}) => {
  const [selectedConditionId, setSelectedConditionId] = useState<string>(
    userConditionIds[0] || 'hypertension'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!isOpen) return null;

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  const categories = [
    'ALL',
    'Cardiovascular',
    'Endocrine',
    'Pediatrics',
    'Respiratory',
    'Musculoskeletal',
    'Gastrointestinal',
    'Hematology',
  ];

  const filteredConditions = HEALTH_CONDITIONS_CATALOG.filter((cond) => {
    const matchCat = selectedCategory === 'ALL' || cond.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      cond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cond.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCondition =
    HEALTH_CONDITIONS_CATALOG.find((c) => c.id === selectedConditionId) ||
    HEALTH_CONDITIONS_CATALOG[0];

  const handleSpeakCondition = () => {
    if (!activeCondition) return;

    let text = activeCondition.spokenSummaries?.[
      selectedLanguage === 'Telugu' ? 'Telugu' : selectedLanguage === 'Hindi' ? 'Hindi' : 'English'
    ];

    if (!text) {
      text = `${activeCondition.name}. ${activeCondition.overview || activeCondition.description}`;
    }

    audioPlayer.speakText({
      text,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              {activeCondition?.icon || '🩺'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isTelugu
                    ? 'వ్యాధుల సమగ్ర వివరాలు & ఆరోగ్య మార్గదర్శి'
                    : isHindi
                    ? 'रोगों का विस्तृत विवरण व स्वास्थ्य गाइड'
                    : 'In-Depth Disease Guide & Health Instructions'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-400/30 text-indigo-200 text-[10px] font-black border border-indigo-300/30">
                  CLINICAL GUIDE
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 font-medium">
                {isTelugu
                  ? 'లక్షణాలు, తినవలసిన ఆహారం, నిషేధాలు, మందుల నియమాలు & హెచ్చరిక సంకేతాలు'
                  : isHindi
                  ? 'लक्षण, क्या खाएं, क्या न खाएं, दवाइयों के नियम और खतरे के संकेत'
                  : 'Symptoms, healing foods, foods to avoid, pill rules, and danger red flags'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakCondition}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
              title="Voice narration"
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

        {/* Category & Condition selector strip */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 space-y-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'Pediatrics' ? '👶 Pediatrics (Age 1+)' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {filteredConditions.map((cond) => {
              const isUserCond = userConditionIds.includes(cond.id);
              const isSelected = selectedConditionId === cond.id;
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setSelectedConditionId(cond.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : isUserCond
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cond.icon}</span>
                  <span>{cond.name.split('(')[0].trim()}</span>
                  {isUserCond && <span className="text-[10px] text-indigo-700">★ My Profile</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Condition Details Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Title & Spoken Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeCondition.icon}</span>
              <div>
                <h3 className="text-lg font-black text-slate-950">{activeCondition.name}</h3>
                <p className="text-xs text-indigo-800 font-semibold">{activeCondition.description}</p>
                {activeCondition.minAgeRecommended && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    Age: {activeCondition.minAgeRecommended}+ Years
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpeakCondition}
              className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>{isTelugu ? 'వివరణ వినండి (Audio)' : 'Listen to Full Guide'}</span>
            </button>
          </div>

          {/* Clinical Overview */}
          {activeCondition.overview && (
            <div className="space-y-1.5">
              <h4 className="text-xs uppercase font-black tracking-wider text-slate-500">
                {isTelugu ? 'ఈ వ్యాధి ఏమిటి? (Overview)' : 'What is this condition? (Overview)'}
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {activeCondition.overview}
              </p>
            </div>
          )}

          {/* Two-Column: Symptoms & Danger Signs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symptoms */}
            {activeCondition.symptoms && (
              <div className="p-4 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>{isTelugu ? 'సాధారణ లక్షణాలు (Symptoms)' : 'Key Warning Symptoms'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                  {activeCondition.symptoms.map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Danger Signs / Red Flags */}
            {activeCondition.dangerSigns && (
              <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 space-y-2.5">
                <h4 className="text-xs font-black text-rose-950 flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{isTelugu ? 'ప్రమాద సంకేతాలు (108 సాయం)' : 'Danger Red Flags (Call 108)'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-900 font-bold">
                  {activeCondition.dangerSigns.map((ds, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-black">⚠️</span>
                      <span>{ds}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Two-Column: Foods to Eat & Foods to Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foods to Eat */}
            {activeCondition.foodsToEat && (
              <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span>{isTelugu ? 'తినవలసిన ఆహారాలు (Foods to Eat)' : 'Healing Foods to Eat'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                  {activeCondition.foodsToEat.map((food, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Foods to Avoid */}
            {activeCondition.foodsToAvoid && (
              <div className="p-4 rounded-3xl bg-red-50/70 border border-red-200 space-y-2.5">
                <h4 className="text-xs font-black text-red-950 flex items-center gap-1.5 uppercase">
                  <Ban className="w-4 h-4 text-red-600" />
                  <span>{isTelugu ? 'నిషేధించవలసిన ఆహారాలు (Foods to Avoid)' : 'Foods to Strictly Avoid'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-red-950 font-medium">
                  {activeCondition.foodsToAvoid.map((food, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Lifestyle Tips & Pill Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCondition.lifestyleTips && (
              <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5 uppercase">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span>{isTelugu ? 'రోజువారీ జాగ్రత్తలు & వ్యాయామం' : 'Daily Routine & Home Care'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-950 font-medium">
                  {activeCondition.lifestyleTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeCondition.pillRules && (
              <div className="p-4 rounded-3xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5 uppercase">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>{isTelugu ? 'మందులు వేసుకునే ముఖ్య నియమాలు' : 'Medication & Tablet Rules'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-indigo-950 font-medium">
                  {activeCondition.pillRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">💊</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
