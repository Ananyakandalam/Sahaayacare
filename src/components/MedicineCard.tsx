import React, { useState } from 'react';
import { Medicine, TimeSlot, PillShape } from '../types/medicine';
import { PillVisual } from './PillVisual';
import { FoodWaterCues } from './TimeSlotVisual';
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Clock,
  Trash2,
  Edit3,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';
import { audioPlayer } from '../utils/audioPlayer';
import {
  TRANSLATIONS,
  SupportedLanguage,
  getLocalizedSpokenExplanation,
} from '../utils/translations';

interface MedicineCardProps {
  medicine: Medicine;
  slot: TimeSlot;
  day: string;
  isTaken: boolean;
  isHighlighted?: boolean;
  isDueNow?: boolean;
  isCaregiverPosture?: boolean;
  onToggleTaken: (key: string) => void;
  onPlayAudio: (medicine: Medicine) => void;
  onUpdateMedicine?: (id: string, updates: Partial<Medicine>) => void;
  onRemoveMedicine?: (id: string) => void;
  selectedVoice?: string;
  speechSpeed?: number;
  selectedLanguage?: string;
}

const COLOR_OPTIONS = [
  { name: 'Golden Yellow', hex: '#FBBF24' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'black', hex: '#290FGT' },
  { name: 'Ruby Red', hex: '#EF4444' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Lavender Purple', hex: '#A855F7' },
  { name: 'Bright Orange', hex: '#FB923C' },
  { name: 'Soft Pink', hex: '#F472B6' },
  { name: 'Clean White', hex: '#FFFFFF' },
];

const SHAPE_OPTIONS: PillShape[] = ['round', 'oval', 'capsule', 'square', 'liquid_drop', 'triangle'];
const ALL_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'bedtime'];

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  slot,
  day,
  isTaken,
  isHighlighted = false,
  isDueNow = false,
  isCaregiverPosture = false,
  onToggleTaken,
  onPlayAudio,
  onUpdateMedicine,
  onRemoveMedicine,
  selectedLanguage = 'English',
}) => {
  const cardKey = `${day}-${slot}-${medicine.id}`;
  const [showColorPicker, setShowColorPicker] = useState(false);

  const langKey: SupportedLanguage =
    selectedLanguage === 'Telugu'
      ? 'Telugu'
      : selectedLanguage === 'Hindi'
      ? 'Hindi'
      : 'English';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.English;

  // Localized spoken explanation
  const localizedSpoken = getLocalizedSpokenExplanation(medicine, selectedLanguage, slot);

  // Localized visual color & shape label
  const localizedColor = t.colors[medicine.color] || medicine.color;
  const localizedShape = t.shapes[medicine.shape] || medicine.shape;

  const handleHearPill = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioPlayer.playChime('tap');
    onPlayAudio(medicine);
  };

  const handleCheckmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTaken(cardKey);
  };

  const handleToggleSlot = (s: TimeSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateMedicine) return;
    const exists = medicine.slots.includes(s);
    let updated = exists ? medicine.slots.filter((item) => item !== s) : [...medicine.slots, s];
    if (updated.length === 0) updated = [s]; // Keep at least one
    onUpdateMedicine(medicine.id, { slots: updated });
    audioPlayer.playChime('tap');
  };

  return (
    <div
      onClick={handleHearPill}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer ${
        isHighlighted
          ? 'ring-4 ring-amber-400 border-amber-500 shadow-2xl scale-[1.02] bg-amber-50/80'
          : isTaken
          ? 'border-emerald-300 bg-emerald-50/50 opacity-80 shadow-xs'
          : isDueNow
          ? 'border-indigo-400 bg-indigo-50/40 shadow-lg ring-2 ring-indigo-300'
          : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md'
      }`}
    >
      {/* Top Banner: Due status & Visual Color Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isDueNow && !isTaken && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
              <Clock className="w-3 h-3 text-amber-200" />
              {t.dueNowTag}
            </span>
          )}
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/20 inline-block shadow-2xs shrink-0"
            style={{ backgroundColor: medicine.colorHex }}
          />
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
            {localizedColor} • {localizedShape}
          </span>
        </div>

        {/* Caregiver remove pill button */}
        {isCaregiverPosture && onRemoveMedicine && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove ${medicine.name}?`)) {
                onRemoveMedicine(medicine.id);
                audioPlayer.playChime('undo');
              }
            }}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 transition-colors"
            title="Remove medicine"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Pill Visual & Details */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-b from-white to-slate-100 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
            <PillVisual
              shape={medicine.shape}
              colorHex={medicine.colorHex}
              colorName={medicine.color}
              size="lg"
              isTaken={isTaken}
            />
          </div>

          <div>
            <h4
              className={`text-lg font-black leading-snug ${
                isTaken ? 'line-through text-slate-500' : 'text-slate-900'
              }`}
            >
              {medicine.name}
            </h4>

            {/* Dosage & Duration Tag */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {medicine.dosage}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                {medicine.durationLabel || (medicine.frequency === 'weekly' ? '📅 Weekly' : medicine.frequency === 'monthly' ? '🗓️ Monthly' : '♾️ Daily')}
              </span>
              {medicine.genericName && (
                <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[130px]">
                  {medicine.genericName}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium mt-1">
              <span className="font-bold">{t.purposeLabel}</span> {medicine.purpose}
            </p>
          </div>
        </div>

        {/* Big tactile listen trigger button */}
        <button
          onClick={handleHearPill}
          type="button"
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md border border-amber-500/50 transition-all active:scale-90 shrink-0"
          title={selectedLanguage === 'Telugu' ? 'ఈ మాత్ర వివరాలు వినండి' : selectedLanguage === 'Hindi' ? 'इस गोली के निर्देश सुनें' : 'Tap to hear spoken instructions for this pill'}
          aria-label="Tap to listen"
        >
          <Volume2 className="w-6 h-6 stroke-[2.4]" />
          <span className="text-[10px] font-black uppercase tracking-wider mt-1">
            {t.listenBtn}
          </span>
        </button>
      </div>

      {/* Spoken Narration Script Preview */}
      <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 mb-1">
          <span>{t.spokenGuideLabel}</span>
        </div>
        <p className="italic">"{localizedSpoken}"</p>
      </div>

      {/* Caregiver Posture: Inline Controls for easy changes */}
      {isCaregiverPosture && onUpdateMedicine && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="my-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              {selectedLanguage === 'Telugu' ? 'మార్పులు చేయండి:' : selectedLanguage === 'Hindi' ? 'बदलाव करें:' : 'Caregiver Quick-Shift:'}
            </span>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="text-[10px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
            >
              <span>{selectedLanguage === 'Telugu' ? 'రంగు & ఆకారం మార్చు' : selectedLanguage === 'Hindi' ? 'रंग व आकार बदलें' : 'Change Appearance'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Time Slot Shifts */}
          <div>
            <span className="text-[10px] font-bold text-slate-600 block mb-1">
              {selectedLanguage === 'Telugu' ? 'సమయం:' : selectedLanguage === 'Hindi' ? 'समय:' : 'Assigned Routines:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SLOTS.map((s) => {
                const isSelected = medicine.slots.includes(s);
                const slotTitle = t.slots[s].title.split(' ')[0];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => handleToggleSlot(s, e)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black capitalize transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slotTitle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Color & Shape Drawer */}
          {showColorPicker && (
            <div className="pt-2 border-t border-indigo-200 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-600 block mb-1">
                  {selectedLanguage === 'Telugu' ? 'మాత్ర రంగు:' : selectedLanguage === 'Hindi' ? 'गोली का रंग:' : 'Pill Color:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() =>
                        onUpdateMedicine(medicine.id, {
                          color: col.name,
                          colorHex: col.hex,
                        })
                      }
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        medicine.colorHex === col.hex ? 'scale-125 ring-2 ring-indigo-600' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-600 block mb-1">
                  {selectedLanguage === 'Telugu' ? 'మాత్ర ఆకారం:' : selectedLanguage === 'Hindi' ? 'गोली का आकार:' : 'Pill Shape:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {SHAPE_OPTIONS.map((shp) => (
                    <button
                      key={shp}
                      type="button"
                      onClick={() => onUpdateMedicine(medicine.id, { shape: shp })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize border ${
                        medicine.shape === shp
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.shapes[shp] || shp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cues: Food & Water */}
      <FoodWaterCues
        withFood={medicine.withFood}
        waterRequirement={medicine.waterRequirement}
        selectedLanguage={selectedLanguage}
      />

      {medicine.precautions && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span className="truncate">{medicine.precautions}</span>
        </div>
      )}

      {/* Bottom tactile action button: I Took This Pill */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCheckmark}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-all shadow-md active:scale-95 ${
            isTaken
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {isTaken ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{t.takenUndoBtn}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{t.iSwallowedBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
