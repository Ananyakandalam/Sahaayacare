import React from 'react';
import { TimeSlot, FoodInstruction } from '../types/medicine';
import { Sunrise, Sun, Sunset, Moon, Utensils, Droplets, Ban, ShieldAlert } from 'lucide-react';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

interface TimeSlotHeaderProps {
  slot: TimeSlot;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onAudioClick?: () => void;
  selectedLanguage?: string;
}

export const TIME_SLOT_META: Record<
  TimeSlot,
  {
    title: string;
    sub: string;
    timeRange: string;
    routineLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    headerGradient: string;
    borderColor: string;
    glowColor: string;
    badgeBg: string;
    bannerTag: string;
  }
> = {
  morning: {
    title: 'Morning Routine',
    sub: 'Breakfast Awakening',
    timeRange: '06:00 AM – 11:00 AM',
    routineLabel: 'When waking up & eating your morning breakfast',
    icon: Sunrise,
    accentColor: 'text-amber-600',
    headerGradient: 'from-amber-400/20 via-yellow-300/15 to-transparent',
    borderColor: 'border-amber-300',
    glowColor: 'ring-amber-400',
    badgeBg: 'bg-amber-400 text-slate-950 font-black',
    bannerTag: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  afternoon: {
    title: 'Midday Routine',
    sub: 'Lunchtime & Daylight',
    timeRange: '11:00 AM – 04:00 PM',
    routineLabel: 'Middle of the day with soup, sandwich, or lunch',
    icon: Sun,
    accentColor: 'text-sky-600',
    headerGradient: 'from-sky-400/20 via-blue-300/15 to-transparent',
    borderColor: 'border-sky-300',
    glowColor: 'ring-sky-400',
    badgeBg: 'bg-sky-500 text-white font-black',
    bannerTag: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  evening: {
    title: 'Evening Routine',
    sub: 'Dinnertime & Sunset',
    timeRange: '04:00 PM – 08:00 PM',
    routineLabel: 'Around sunset with your warm evening meal',
    icon: Sunset,
    accentColor: 'text-rose-600',
    headerGradient: 'from-rose-400/20 via-purple-300/15 to-transparent',
    borderColor: 'border-rose-300',
    glowColor: 'ring-rose-400',
    badgeBg: 'bg-rose-500 text-white font-black',
    bannerTag: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  bedtime: {
    title: 'Bedtime Routine',
    sub: 'Rest & Night Guard',
    timeRange: '08:00 PM – 06:00 AM',
    routineLabel: 'Right before turning off your bedroom lights',
    icon: Moon,
    accentColor: 'text-indigo-600',
    headerGradient: 'from-indigo-900/20 via-purple-900/15 to-transparent',
    borderColor: 'border-indigo-400',
    glowColor: 'ring-indigo-500',
    badgeBg: 'bg-indigo-700 text-white font-black',
    bannerTag: 'bg-indigo-100 text-indigo-950 border-indigo-300',
  },
};

export const TimeSlotHeader: React.FC<
  TimeSlotHeaderProps & {
    onAddPill?: () => void;
    isCaregiverPosture?: boolean;
    pillCount?: number;
  }
> = ({
  slot,
  size = 'md',
  active = false,
  onAudioClick,
  onAddPill,
  isCaregiverPosture = false,
  pillCount,
  selectedLanguage = 'English',
}) => {
  const meta = TIME_SLOT_META[slot];
  const IconComponent = meta.icon;

  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;
  const slotTranslation = t.slots[slot];

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl border-2 bg-gradient-to-r ${
        meta.headerGradient
      } ${meta.borderColor} transition-all ${
        active ? `ring-4 ${meta.glowColor} scale-[1.01] shadow-xl bg-white` : 'shadow-xs bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-md border ${meta.borderColor} ${meta.accentColor} shrink-0`}
        >
          <IconComponent className="w-7 h-7 stroke-[2.4]" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-slate-950 text-lg tracking-tight">
              {slotTranslation.title}
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${meta.badgeBg}`}>
              {slotTranslation.timeRange}
            </span>
            {pillCount !== undefined && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {t.pillsCountLabel(pillCount)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">{slotTranslation.routineLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {isCaregiverPosture && onAddPill && (
          <button
            type="button"
            onClick={onAddPill}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs active:scale-95"
            title="Add another pill to this time slot"
          >
            {t.addPillHere}
          </button>
        )}

        {onAudioClick && (
          <button
            type="button"
            onClick={onAudioClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-transform"
            aria-label={`Listen to ${slotTranslation.title}`}
            title={`Listen to all medicines in ${slotTranslation.title}`}
          >
            <span className="text-sm">🔊</span>
            <span>{t.hearRoutine}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const FoodWaterCues: React.FC<{
  withFood: FoodInstruction;
  waterRequirement: 'full_glass' | 'normal_sip';
  size?: 'sm' | 'md';
  selectedLanguage?: string;
}> = ({ withFood, waterRequirement, size = 'md', selectedLanguage = 'English' }) => {
  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {/* Food Cue */}
      {withFood === 'with_meal' && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold shadow-xs border border-emerald-200"
          title={t.withFood}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>{t.withFood}</span>
        </span>
      )}
      {(withFood === 'after_meal' || withFood === 'after_food') && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 text-xs font-bold shadow-xs border border-teal-200"
          title={t.afterMeal}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>{t.afterMeal}</span>
        </span>
      )}
      {(withFood === 'empty_stomach' || withFood === 'before_food') && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 text-xs font-bold shadow-xs border border-rose-200"
          title={t.emptyStomach}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>{t.emptyStomach}</span>
        </span>
      )}

      {/* Water Cue */}
      {waterRequirement === 'full_glass' ? (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-bold shadow-xs border border-blue-200"
          title={t.fullGlassWater}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>{t.fullGlassWater}</span>
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold shadow-xs border border-sky-200"
          title={t.normalSip}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>{t.normalSip}</span>
        </span>
      )}
    </div>
  );
};
