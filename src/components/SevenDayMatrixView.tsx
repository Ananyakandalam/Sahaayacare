import React from 'react';
import { MedicineSchedule, DayOfWeek, TimeSlot, Medicine } from '../types/medicine';
import { TIME_SLOT_META } from './TimeSlotVisual';
import { PillVisual } from './PillVisual';
import { DAYS_LIST } from './SevenDayHeader';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { audioPlayer } from '../utils/audioPlayer';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

interface SevenDayMatrixViewProps {
  schedule: MedicineSchedule;
  takenLogs: Record<string, boolean>;
  onToggleTaken: (key: string) => void;
  onPlayMedicineAudio: (med: Medicine) => void;
  onPlaySlotAudio: (slot: TimeSlot, day: DayOfWeek) => void;
  selectedLanguage?: string;
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'bedtime'];

export const SevenDayMatrixView: React.FC<SevenDayMatrixViewProps> = ({
  schedule,
  takenLogs,
  onToggleTaken,
  onPlayMedicineAudio,
  onPlaySlotAudio,
  selectedLanguage = 'English',
}) => {
  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  // Get medicines for a given slot on a given day
  const getMedicines = (day: DayOfWeek, slot: TimeSlot): Medicine[] => {
    return schedule.medicines.filter(
      (med) => med.daysOfWeek.includes(day) && med.slots.includes(slot)
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {selectedLanguage === 'Telugu'
              ? '7 రోజుల సమగ్ర దృశ్య మందుల పట్టిక'
              : selectedLanguage === 'Hindi'
              ? '7 दिवसीय मुख्य दवाई चार्ट'
              : '7-Day Master Visual Medicine Chart'}
          </h3>
          <p className="text-xs text-slate-500">
            {selectedLanguage === 'Telugu'
              ? 'ఏ మాత్రనైనా తాకి వివరాలు వినండి, లేదా వేసుకున్నప్పుడు టిక్ గుర్తుపై నొక్కండి.'
              : selectedLanguage === 'Hindi'
              ? 'किसी भी गोली को छूकर निर्देश सुनें, या लेने के बाद टिक करें।'
              : 'Tap any pill to hear spoken directions, or tap the checkmark when taken.'}
          </p>
        </div>
      </div>

      <div className="min-w-[760px]">
        {/* Table header with days */}
        <div className="grid grid-cols-8 gap-2 pb-3 border-b border-slate-200">
          <div className="p-2 font-black text-xs uppercase text-slate-400 flex items-center">
            {selectedLanguage === 'Telugu' ? 'సమయం' : selectedLanguage === 'Hindi' ? 'समय' : 'Routine'}
          </div>
          {DAYS_LIST.map(({ key }) => {
            const dayInfo = t.days[key] || { short: key, full: key };
            return (
              <div
                key={key}
                className="p-2 text-center font-extrabold text-sm rounded-xl bg-slate-100 text-slate-800"
              >
                {dayInfo.short}
              </div>
            );
          })}
        </div>

        {/* Rows by TimeSlot */}
        {TIME_SLOTS.map((slot) => {
          const meta = TIME_SLOT_META[slot];
          const slotTranslation = t.slots[slot];
          const SlotIcon = meta.icon;

          return (
            <div
              key={slot}
              className="grid grid-cols-8 gap-2 py-3 border-b border-slate-100 items-start"
            >
              {/* Row header */}
              <div
                className={`p-3 rounded-2xl border-2 ${meta.borderColor} bg-gradient-to-b ${meta.headerGradient} flex flex-col items-center justify-center text-center shadow-2xs`}
              >
                <SlotIcon className={`w-6 h-6 ${meta.accentColor}`} />
                <span className="font-extrabold text-xs text-slate-900 mt-1">
                  {slotTranslation.title}
                </span>
                <span className="text-[10px] text-slate-600 font-bold">
                  {slotTranslation.timeRange}
                </span>
              </div>

              {/* Day cells */}
              {DAYS_LIST.map(({ key: day }) => {
                const meds = getMedicines(day, slot);

                if (meds.length === 0) {
                  return (
                    <div
                      key={day}
                      className="p-2 h-full min-h-[96px] rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs"
                    >
                      —
                    </div>
                  );
                }

                return (
                  <div
                    key={day}
                    className="p-2 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2 min-h-[96px]"
                  >
                    {meds.map((med) => {
                      const logKey = `${day}-${slot}-${med.id}`;
                      const isTaken = Boolean(takenLogs[logKey]);

                      return (
                        <div
                          key={med.id}
                          className={`relative p-2 rounded-xl border flex flex-col items-center justify-between transition-all ${
                            isTaken
                              ? 'bg-emerald-50 border-emerald-300 opacity-60'
                              : 'bg-white border-slate-200 shadow-2xs hover:border-amber-400'
                          }`}
                        >
                          {/* Visual Pill */}
                          <div
                            onClick={() => onPlayMedicineAudio(med)}
                            className="cursor-pointer py-1 flex flex-col items-center"
                            title={`Tap to hear: ${med.name}`}
                          >
                            <PillVisual
                              shape={med.shape}
                              colorHex={med.colorHex}
                              colorName={med.color}
                              size="sm"
                              isTaken={isTaken}
                            />
                            <span className="text-[10px] font-black text-slate-800 text-center mt-1 truncate max-w-[70px]">
                              {med.name.split(' ')[0]}
                            </span>
                          </div>

                          {/* Quick Actions: Audio & Check */}
                          <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => onPlayMedicineAudio(med)}
                              className="p-1 rounded-md text-amber-700 hover:bg-amber-100"
                              title="Hear instructions"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onToggleTaken(logKey)}
                              className={`p-1 rounded-md transition-colors ${
                                isTaken
                                  ? 'text-emerald-700 bg-emerald-100'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                              }`}
                              title={isTaken ? 'Mark as untaken' : 'Mark as taken'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
