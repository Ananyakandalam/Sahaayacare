import React from 'react';
import { DayOfWeek, MedicineSchedule } from '../types/medicine';
import { Calendar, Volume2, CheckCircle, Table, LayoutList } from 'lucide-react';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

interface SevenDayHeaderProps {
  days: { key: DayOfWeek; label: string; full: string }[];
  activeDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  schedule: MedicineSchedule;
  takenLogs: Record<string, boolean>;
  viewMode: 'daily' | 'matrix';
  onToggleViewMode: (mode: 'daily' | 'matrix') => void;
  onPlayFullScheduleAudio: () => void;
  isPlaying?: boolean;
  selectedLanguage?: string;
}

export const DAYS_LIST: { key: DayOfWeek; label: string; full: string }[] = [
  { key: 'Mon', label: 'Mon', full: 'Monday' },
  { key: 'Tue', label: 'Tue', full: 'Tuesday' },
  { key: 'Wed', label: 'Wed', full: 'Wednesday' },
  { key: 'Thu', label: 'Thu', full: 'Thursday' },
  { key: 'Fri', label: 'Fri', full: 'Friday' },
  { key: 'Sat', label: 'Sat', full: 'Saturday' },
  { key: 'Sun', label: 'Sun', full: 'Sunday' },
];

export const SevenDayHeader: React.FC<SevenDayHeaderProps> = ({
  days,
  activeDay,
  onSelectDay,
  schedule,
  takenLogs,
  viewMode,
  onToggleViewMode,
  onPlayFullScheduleAudio,
  isPlaying,
  selectedLanguage = 'English',
}) => {
  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  // Calculate completion for each day
  const getDayProgress = (day: DayOfWeek) => {
    let totalDoses = 0;
    let takenDoses = 0;

    schedule.medicines.forEach((med) => {
      if (med.daysOfWeek.includes(day)) {
        med.slots.forEach((slot) => {
          totalDoses++;
          if (takenLogs[`${day}-${slot}-${med.id}`]) {
            takenDoses++;
          }
        });
      }
    });

    return { total: totalDoses, taken: takenDoses };
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
      {/* Top action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider">
              {t.timetableTitleBadge}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {t.forPatient} {schedule.patientName}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {schedule.regimenTitle}
          </h2>
        </div>

        {/* Action buttons: Spoken audio & View switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onPlayFullScheduleAudio}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-white ring-4 ring-amber-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
            <span>{isPlaying ? t.speakingSchedule : t.hear7DayGuide}</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => onToggleViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              <span>{t.dayView}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>{t.fullWeekMatrix}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7 Days selector strip */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-4">
        {days.map(({ key }) => {
          const dayInfo = t.days[key] || { short: key, full: key };
          const isActive = activeDay === key;
          const { total, taken } = getDayProgress(key);
          const isAllDone = total > 0 && taken === total;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={`flex flex-col items-center justify-between p-2 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 scale-105 z-10'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-white'
              }`}
            >
              <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                {dayInfo.short}
              </span>
              <span className="text-xs sm:text-sm font-extrabold my-0.5 truncate max-w-full text-center">
                {dayInfo.full.split(' ')[0]}
              </span>

              {/* Progress Indicator */}
              <div className="mt-1 flex items-center gap-1">
                {isAllDone ? (
                  <CheckCircle className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`} />
                ) : (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {taken}/{total}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
