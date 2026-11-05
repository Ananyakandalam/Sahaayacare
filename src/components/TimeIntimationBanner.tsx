import React, { useState, useEffect } from 'react';
import { MedicineSchedule, TimeSlot, DayOfWeek, Medicine } from '../types/medicine';
import { PillVisual } from './PillVisual';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import {
  TRANSLATIONS,
  SupportedLanguage,
  getLocalizedSpokenExplanation,
} from '../utils/translations';

interface TimeIntimationBannerProps {
  schedule: MedicineSchedule;
  activeDay: DayOfWeek;
  takenLogs: Record<string, boolean>;
  selectedLanguage?: string;
  onAnnounceSlot: (slot: TimeSlot, day: DayOfWeek) => void;
  onSelectSlot?: (slot: TimeSlot) => void;
}

// Compute active slot from hour
export function getSlotFromHour(hour: number): TimeSlot {
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 20) return 'evening';
  return 'bedtime';
}

const SLOT_META_COLORS: Record<
  TimeSlot,
  {
    icon: any;
    bannerGradient: string;
    border: string;
    badgeBg: string;
    textColor: string;
    accentHex: string;
  }
> = {
  morning: {
    icon: Sun,
    bannerGradient: 'from-amber-500/15 via-yellow-400/20 to-orange-400/15',
    border: 'border-amber-400/60',
    badgeBg: 'bg-amber-400 text-slate-950',
    textColor: 'text-amber-950',
    accentHex: '#F59E0B',
  },
  afternoon: {
    icon: CloudSun,
    bannerGradient: 'from-sky-500/15 via-blue-400/20 to-cyan-400/15',
    border: 'border-sky-400/60',
    badgeBg: 'bg-sky-500 text-white',
    textColor: 'text-sky-950',
    accentHex: '#0284C7',
  },
  evening: {
    icon: Sunset,
    bannerGradient: 'from-rose-500/15 via-purple-500/20 to-orange-400/15',
    border: 'border-rose-400/60',
    badgeBg: 'bg-rose-500 text-white',
    textColor: 'text-rose-950',
    accentHex: '#E11D48',
  },
  bedtime: {
    icon: Moon,
    bannerGradient: 'from-indigo-900/20 via-slate-900/25 to-purple-900/20',
    border: 'border-indigo-500/60',
    badgeBg: 'bg-indigo-700 text-white',
    textColor: 'text-indigo-950',
    accentHex: '#4F46E5',
  },
};

export const TimeIntimationBanner: React.FC<TimeIntimationBannerProps> = ({
  schedule,
  activeDay,
  takenLogs,
  selectedLanguage = 'English',
  onAnnounceSlot,
}) => {
  const [realTime, setRealTime] = useState<Date>(new Date());
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);

  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const effectiveHour = simulatedHour !== null ? simulatedHour : realTime.getHours();
  const currentSlot = getSlotFromHour(effectiveHour);
  const meta = SLOT_META_COLORS[currentSlot];
  const slotTranslation = t.slots[currentSlot];
  const IconComponent = meta.icon;

  // Filter medicines due right now for active day in current slot
  const currentSlotMeds = schedule.medicines.filter(
    (m) => m.daysOfWeek.includes(activeDay) && m.slots.includes(currentSlot)
  );

  const takenCount = currentSlotMeds.filter(
    (m) => takenLogs[`${activeDay}-${currentSlot}-${m.id}`]
  ).length;

  const totalCount = currentSlotMeds.length;
  const isAllTaken = totalCount > 0 && takenCount === totalCount;
  const pendingCount = totalCount - takenCount;
  const isTelugu = selectedLanguage === 'Telugu' || selectedLanguage === 'te';
  const isHindi = selectedLanguage === 'Hindi' || selectedLanguage === 'hi';

  const timeDisplay =
    simulatedHour !== null
      ? `${simulatedHour > 12 ? simulatedHour - 12 : simulatedHour || 12}:00 ${
          simulatedHour >= 12 ? 'PM' : 'AM'
        } (${selectedLanguage === 'Telugu' ? 'పరీక్ష' : selectedLanguage === 'Hindi' ? 'परीक्षण' : 'Simulated'})`
      : realTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleAnnounceDuePills = () => {
    audioPlayer.playChime('start');

    if (totalCount === 0) {
      const msg = isTelugu
        ? `నమస్కారం! ఇప్పుడు సమయం ${timeDisplay}. ఈ సమయంలో మీకు ఎలాంటి మందులు లేవు. ప్రశాంతంగా విశ్రాంతి తీసుకోండి!`
        : isHindi
        ? `नमस्ते! अभी समय ${timeDisplay} हो रहा है। इस समय आपकी कोई दवाई नहीं है। आप आराम कीजिए!`
        : `It is currently ${timeDisplay}. You have no medicines scheduled for this ${slotTranslation.title} on ${activeDay}. Have a peaceful time!`;
      audioPlayer.speakText({
        text: msg,
        language: selectedLanguage,
      });
      return;
    }

    if (isAllTaken) {
      const msg = isTelugu
        ? `చాలా సంతోషం! ఇప్పుడు సమయం ${timeDisplay}. ఈ సమయానికి మీరు అన్ని మందులు వేసుకున్నారు. మీ ఆరోగ్యం బాగుంటుంది!`
        : isHindi
        ? `बहुत बढ़िया! अभी समय ${timeDisplay} है, और आपने इस समय की सभी दवाइयां ले ली हैं। आपका स्वास्थ्य हमेशा अच्छा रहे!`
        : `Great news! It is ${timeDisplay}, and you have already taken all ${totalCount} of your ${slotTranslation.title} medicines for today. Wonderful job!`;
      audioPlayer.speakText({
        text: msg,
        language: selectedLanguage,
      });
      return;
    }

    const pendingMeds = currentSlotMeds.filter(
      (m) => !takenLogs[`${activeDay}-${currentSlot}-${m.id}`]
    );

    const pillDescriptions = pendingMeds
      .map((m) => getLocalizedSpokenExplanation(m, selectedLanguage, currentSlot))
      .join(isTelugu ? '. మరియు తదుపరి, ' : isHindi ? '। इसके बाद, ' : ' Next, ');

    let intimationText = '';
    if (isTelugu) {
      intimationText = `నమస్కారం! ఇప్పుడు సమయం ${timeDisplay}. ఇది మీ ${slotTranslation.title} సమయం. మీరు దయచేసి ${pendingCount} మందులు వేసుకోవాలి: ${pillDescriptions}. ఒక గ్లాసు మంచినీటితో నిదానంగా వేసుకోండి. మీ ఆరోగ్యం మాకు ఎంతో ముఖ్యం!`;
    } else if (isHindi) {
      intimationText = `नमस्ते! अभी समय ${timeDisplay} हो रहा है। यह आपकी ${slotTranslation.title} की दवाइयों का समय है। आपको कृपया ${pendingCount} दवाइयां लेनी हैं: ${pillDescriptions}। एक पूरे गिलास ताज़ा पानी के साथ आराम से दवाई लीजिए। अपना ख्याल रखिए!`;
    } else {
      intimationText = `Hello! It is now ${timeDisplay}. It is time for your ${slotTranslation.title} on ${activeDay}. You have ${pendingCount} medicine${
        pendingCount > 1 ? 's' : ''
      } to take now: ${pillDescriptions}. Drink a full glass of water, and mark each pill as taken when finished.`;
    }

    audioPlayer.speakText({
      text: intimationText,
      language: selectedLanguage,
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 bg-gradient-to-r ${meta.bannerGradient} ${meta.border} shadow-lg transition-all`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Time Intimation Status */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-md shrink-0 transition-transform ${meta.badgeBg}`}
          >
            <IconComponent className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{timeDisplay}</span>
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${meta.badgeBg}`}>
                {slotTranslation.title} ({slotTranslation.timeRange})
              </span>

              {isAllTaken ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  {t.allDoneBadge}
                </span>
              ) : pendingCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center gap-1 animate-pulse shadow-2xs">
                  <Bell className="w-3.5 h-3.5 text-amber-200" />
                  {pendingCount} {t.pillsCountLabel(pendingCount)} {t.dueNowBadge}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                  {t.restPeriodBadge}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {isAllTaken
                ? t.allDoneTitle
                : pendingCount > 0
                ? `${t.dueNowTitle} (${slotTranslation.title})`
                : t.restTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
              {pendingCount > 0 ? t.dueNowDesc : t.restDesc}
            </p>

            {/* Quick Pill Visual badges for currently due slot */}
            {currentSlotMeds.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">
                  {t.pillsForRoutine}
                </span>
                {currentSlotMeds.map((med) => {
                  const isTaken = Boolean(takenLogs[`${activeDay}-${currentSlot}-${med.id}`]);
                  return (
                    <div
                      key={med.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                        isTaken
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 line-through opacity-70'
                          : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <PillVisual
                        shape={med.shape}
                        colorHex={med.colorHex}
                        colorName={med.color}
                        size="sm"
                        isTaken={isTaken}
                      />
                      <span>{med.name.split(' ')[0]}</span>
                      {isTaken && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Audio Intimate Button & Time Simulator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={handleAnnounceDuePills}
            className="flex-1 sm:flex-initial px-5 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 group"
            title="Spoken audio intimation for due medicines"
          >
            <Volume2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{t.intimateNowBtn}</span>
          </button>

          {/* Time of Day Tester Simulator */}
          <div className="flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-slate-300 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 hidden sm:inline">
              {t.testTimeLabel}
            </span>
            <button
              type="button"
              onClick={() => setSimulatedHour(8)}
              className={`px-2 py-1 rounded-xl text-[10px] font-extrabold ${
                effectiveHour === 8 ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="8:00 AM"
            >
              8 AM
            </button>
            <button
              type="button"
              onClick={() => setSimulatedHour(13)}
              className={`px-2 py-1 rounded-xl text-[10px] font-extrabold ${
                effectiveHour === 13 ? 'bg-sky-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="1:00 PM"
            >
              1 PM
            </button>
            <button
              type="button"
              onClick={() => setSimulatedHour(18)}
              className={`px-2 py-1 rounded-xl text-[10px] font-extrabold ${
                effectiveHour === 18 ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="6:00 PM"
            >
              6 PM
            </button>
            <button
              type="button"
              onClick={() => setSimulatedHour(21)}
              className={`px-2 py-1 rounded-xl text-[10px] font-extrabold ${
                effectiveHour === 21 ? 'bg-indigo-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="9:00 PM"
            >
              9 PM
            </button>
            {simulatedHour !== null && (
              <button
                type="button"
                onClick={() => setSimulatedHour(null)}
                className="px-2 py-1 rounded-xl text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                title="Reset to Real-Time Clock"
              >
                {t.resetBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
