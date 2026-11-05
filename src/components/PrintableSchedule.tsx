import React from 'react';
import { MedicineSchedule, TimeSlot } from '../types/medicine';
import { PillVisual } from './PillVisual';
import { TIME_SLOT_META, FoodWaterCues } from './TimeSlotVisual';
import { DAYS_LIST } from './SevenDayHeader';
import { Printer, X, HeartPulse } from 'lucide-react';
import { TRANSLATIONS, SupportedLanguage } from '../utils/translations';

interface PrintableScheduleProps {
  schedule: MedicineSchedule;
  onClose: () => void;
  selectedLanguage?: string;
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'bedtime'];

export const PrintableSchedule: React.FC<PrintableScheduleProps> = ({
  schedule,
  onClose,
  selectedLanguage = 'English',
}) => {
  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-300 p-6 sm:p-8 my-6 print:m-0 print:border-none print:shadow-none print:rounded-none">
        {/* Print & Close toolbar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-extrabold text-slate-900">
              {selectedLanguage === 'Telugu'
                ? 'ఫ్రిజ్ / గోడ పోస్టర్ (దృశ్య మందుల చార్ట్)'
                : selectedLanguage === 'Hindi'
                ? 'दीवार / फ्रिज चार्ट (रंगीन दृश्य गाइड)'
                : 'Printable Refrigerator Wall Chart (Visual Guide)'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printChart}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Refrigerator Header */}
        <div className="text-center pb-4 border-b-2 border-slate-800">
          <div className="inline-block px-4 py-1 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-wider mb-1">
            {t.timetableTitleBadge} • {t.forPatient} {schedule.patientName}
          </div>
          <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight">
            {schedule.patientName}'s Medicine Timetable
          </h1>
          <p className="text-sm font-bold text-slate-600 mt-0.5">
            {schedule.regimenTitle}
          </p>
          {schedule.emergencyContact && (
            <p className="text-xs font-black text-rose-700 mt-1">
              🚨 {schedule.emergencyContact.relation}: {schedule.emergencyContact.name} ({schedule.emergencyContact.phone})
            </p>
          )}
        </div>

        {/* Daily routine sections with visual cards */}
        <div className="divide-y-2 divide-slate-200 mt-4">
          {TIME_SLOTS.map((slot) => {
            const meta = TIME_SLOT_META[slot];
            const slotTranslation = t.slots[slot];
            const medsInSlot = schedule.medicines.filter((m) => m.slots.includes(slot));

            if (medsInSlot.length === 0) return null;

            return (
              <div key={slot} className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`px-3 py-1.5 rounded-xl font-black text-sm uppercase tracking-wider border-2 ${meta.borderColor} bg-slate-100 ${meta.accentColor}`}
                  >
                    {slotTranslation.title} — {slotTranslation.timeRange}
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    ({t.pillsCountLabel(medsInSlot.length)})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medsInSlot.map((med) => {
                    const localizedColor = t.colors[med.color] || med.color;
                    const localizedShape = t.shapes[med.shape] || med.shape;

                    return (
                      <div
                        key={med.id}
                        className="p-3.5 rounded-2xl border-2 border-slate-300 flex items-start justify-between gap-3 bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <PillVisual
                            shape={med.shape}
                            colorHex={med.colorHex}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: med.colorHex }}
                              />
                              <span className="text-xs font-black text-slate-900 uppercase">
                                {localizedColor} • {localizedShape}
                              </span>
                            </div>
                            <div className="font-extrabold text-base text-slate-900 mt-0.5">
                              {med.name}
                            </div>
                            <div className="text-xs font-semibold text-slate-600">
                              {med.dosage} • {med.purpose}
                            </div>
                            <div className="mt-1">
                              <FoodWaterCues
                                withFood={med.withFood}
                                waterRequirement={med.waterRequirement}
                                size="sm"
                                selectedLanguage={selectedLanguage}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 7-Day Mon-Sun Mini Checkboxes for physical pen ticking */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {selectedLanguage === 'Telugu' ? 'రోజులు' : selectedLanguage === 'Hindi' ? 'दिन' : 'Days'}:
                          </span>
                          <div className="grid grid-cols-7 gap-1">
                            {DAYS_LIST.map(({ key }) => {
                              const dayInfo = t.days[key] || { short: key, full: key };
                              const isScheduled = med.daysOfWeek.includes(key);
                              return (
                                <div
                                  key={key}
                                  className={`w-6 h-6 rounded-md border flex items-center justify-center text-[10px] font-black ${
                                    isScheduled
                                      ? 'border-slate-800 bg-white text-slate-900'
                                      : 'border-slate-200 bg-slate-100 text-slate-300'
                                  }`}
                                >
                                  {dayInfo.short[0]}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer notes */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300 text-center text-xs text-slate-500 font-semibold">
          {selectedLanguage === 'Telugu'
            ? 'ఈ చార్ట్‌ను మీ ఫ్రిజ్ లేదా మందుల బాక్స్‌పై అతికించండి. రంగు మరియు ఆకారాన్ని చూసి సరిపోల్చుకోండి.'
            : selectedLanguage === 'Hindi'
            ? 'इस चार्ट को अपने फ्रिज या दवाई के डिब्बे पर लगाएं। रंग व आकार देखकर गोली पहचानें।'
            : 'Tape this chart to your refrigerator or medicine box. Match each pill by color & shape.'}
        </div>
      </div>
    </div>
  );
};
