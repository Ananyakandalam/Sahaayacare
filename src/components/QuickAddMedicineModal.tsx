import React, { useState } from 'react';
import {
  Medicine,
  PillShape,
  TimeSlot,
  DayOfWeek,
  FoodInstruction,
  MedicineFrequency,
  MedicineDuration,
  MedicineFormType,
} from '../types/medicine';
import { PillVisual } from './PillVisual';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Plus,
  X,
  Volume2,
  Sparkles,
  Calendar,
  Clock,
  Droplet,
  Check,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface QuickAddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedicine: (newMedicine: Medicine) => void;
  selectedLanguage: string;
}

const PILL_COLORS = [
  { name: 'Golden Yellow', hex: '#FBBF24' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Ruby Red', hex: '#EF4444' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Lavender Purple', hex: '#A855F7' },
  { name: 'Bright Orange', hex: '#FB923C' },
  { name: 'Soft Pink', hex: '#F472B6' },
  { name: 'Clean White', hex: '#F8FAFC' },
  { name: 'Jet Black', hex: '#0F172A' },
];

const PILL_SHAPES: { shape: PillShape; label: string }[] = [
  { shape: 'round', label: 'Round (గుండ్రంగా)' },
  { shape: 'oval', label: 'Oval (అండాకారం)' },
  { shape: 'capsule', label: 'Capsule (క్యాప్సూల్)' },
  { shape: 'square', label: 'Square (చతురస్రం)' },
  { shape: 'liquid_drop', label: 'Syrup / Drop (సిరప్)' },
  { shape: 'triangle', label: 'Triangle (త్రికోణం)' },
];

const COMMON_SLOTS: { slot: TimeSlot; label: string; icon: string }[] = [
  { slot: 'morning', label: 'Morning (ఉదయం / Breakfast)', icon: '🌅' },
  { slot: 'afternoon', label: 'Afternoon (మధ్యాహ్నం / Lunch)', icon: '☀️' },
  { slot: 'evening', label: 'Evening (సాయంత్రం / Tea)', icon: '☕' },
  { slot: 'bedtime', label: 'Bedtime (రాత్రి / Sleep)', icon: '🌙' },
];

export const QuickAddMedicineModal: React.FC<QuickAddMedicineModalProps> = ({
  isOpen,
  onClose,
  onAddMedicine,
  selectedLanguage,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [purpose, setPurpose] = useState('Daily Health Support');
  const [formType, setFormType] = useState<MedicineFormType>('tablet');
  const [color, setColor] = useState(PILL_COLORS[0]);
  const [shape, setShape] = useState<PillShape>('round');
  const [slots, setSlots] = useState<TimeSlot[]>(['morning']);
  const [withFood, setWithFood] = useState<FoodInstruction>('after_meal');
  const [frequency, setFrequency] = useState<MedicineFrequency>('daily');
  const [weeklyDay, setWeeklyDay] = useState<DayOfWeek>('Sun');
  const [duration, setDuration] = useState<MedicineDuration>('lifelong');
  const [spokenText, setSpokenText] = useState('');

  if (!isOpen) return null;

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  const toggleSlot = (slot: TimeSlot) => {
    if (slots.includes(slot)) {
      if (slots.length > 1) {
        setSlots(slots.filter((s) => s !== slot));
      }
    } else {
      setSlots([...slots, slot]);
    }
  };

  // Duration label computation
  const getComputedDurationLabel = () => {
    if (frequency === 'weekly') return `Weekly (Every ${weeklyDay})`;
    if (frequency === 'monthly') return 'Monthly (Every 30 Days)';
    if (frequency === 'alternate_days') return 'Alternate Days (ఒకరోజు విడిచి ఒకరోజు)';
    if (frequency === 'as_needed_sos') return 'As Needed (SOS / అత్యవసరం)';
    if (duration === '5_days') return '5 Days Course (Antibiotic)';
    if (duration === '7_days') return '7 Days Course';
    if (duration === '14_days') return '14 Days Course';
    if (duration === '30_days') return '30 Days Course (1 Month)';
    if (duration === '90_days') return '90 Days Course (3 Months)';
    return 'Daily (Lifelong Ongoing)';
  };

  const generateAutoSpokenText = () => {
    const slotNames = slots.join(', ');
    const foodDesc =
      withFood === 'after_meal'
        ? isTelugu
          ? 'భోజనం తర్వాత'
          : 'after meal'
        : withFood === 'before_food'
        ? isTelugu
          ? 'భోజనానికి ముందు'
          : 'before food'
        : withFood === 'empty_stomach'
        ? isTelugu
          ? 'పరిగడుపున'
          : 'empty stomach'
        : isTelugu
          ? 'భోజనంతో పాటు'
          : 'with meal';

    const text = isTelugu
      ? `${name || 'ఈ మందును'} ${slotNames} వేళలలో ${foodDesc} ${color.name} ${shape} మాత్రను ఒక గ్లాసు నీటితో వేసుకోండి. కాలవ్యవధి: ${getComputedDurationLabel()}.`
      : isHindi
      ? `${name || 'यह दवाई'} ${slotNames} समय पर खाने के बाद एक गिलास पानी के साथ लें।`
      : `Take your ${color.name} ${shape} ${name || 'tablet'} during ${slotNames} ${foodDesc} with water. Frequency: ${getComputedDurationLabel()}.`;

    setSpokenText(text);
    audioPlayer.speakText({
      text,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const daysList: DayOfWeek[] =
      frequency === 'weekly'
        ? [weeklyDay]
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim() || '1 Tablet',
      purpose: purpose.trim() || 'Daily Health',
      color: color.name,
      colorHex: color.hex,
      shape: shape,
      formType: formType,
      slots: slots,
      daysOfWeek: daysList,
      withFood: withFood,
      waterRequirement: 'full_glass',
      frequency: frequency,
      duration: duration,
      durationLabel: getComputedDurationLabel(),
      weeklyDay: frequency === 'weekly' ? weeklyDay : undefined,
      spokenExplanation:
        spokenText.trim() ||
        `Take one ${color.name} ${shape} tablet during ${slots.join(' and ')} with water.`,
    };

    onAddMedicine(newMed);
    audioPlayer.playChime('success');

    const confirmMsg = isTelugu
      ? `${name} మందు మీ షెడ్యూల్‌లో విజయవంతంగా జోడించబడింది.`
      : isHindi
      ? `${name} आपकी समय सारिणी में जोड़ दी गई है।`
      : `${name} has been added to your timetable.`;

    audioPlayer.speakText({
      text: confirmMsg,
      language: selectedLanguage,
      voice: 'Kore',
      speed: 0.85,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Plus className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isTelugu
                    ? 'ఇతర మందులను జోడించండి (Add Medicine)'
                    : isHindi
                    ? 'अन्य दवाई जोड़ें (Add Medicine)'
                    : 'Add Any Medicine or Tablet'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  CUSTOM
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 font-medium">
                {isTelugu
                  ? 'రంగు, ఆకారం, సమయం మరియు కాలవ్యవధి (వారం/నెల) సులభంగా నిర్ణయించండి'
                  : 'Customize pill visual, color, daily/weekly/monthly recurrence & voice notes'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Live Pill Visual Preview */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              <PillVisual
                colorHex={color.hex}
                shape={shape}
                size="lg"
                colorName={color.name}
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                Visual Identifier
              </span>
              <h4 className="text-sm font-black text-white">
                {name || 'New Medicine'}
              </h4>
              <p className="text-xs text-slate-300">
                {color.name} • {shape} • {dosage}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              {getComputedDurationLabel()}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Medicine Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-800 mb-1">
                {isTelugu ? 'మందు / మాత్ర పేరు' : 'Medicine / Tablet Name'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paracetamol, Dolo 650, Shelcal..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-indigo-600"
              />
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">
                {isTelugu ? 'మోతాదు (Dosage)' : 'Dosage'}
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500 mg, 1 Tablet, 5 ml, 2 Drops"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-indigo-600"
              />
            </div>
          </div>

          {/* Form Type & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-800 mb-1">
                {isTelugu ? 'మందు రకం (Form)' : 'Medicine Form'}
              </label>
              <select
                value={formType}
                onChange={(e) => {
                  const val = e.target.value as MedicineFormType;
                  setFormType(val);
                  if (val === 'syrup' || val === 'drops') setShape('liquid_drop');
                  else if (val === 'capsule') setShape('capsule');
                  else setShape('round');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              >
                <option value="tablet">💊 Solid Tablet / Pill</option>
                <option value="capsule">💊 Capsule</option>
                <option value="syrup">🥄 Liquid Syrup (Pediatric/Cough)</option>
                <option value="drops">💧 Drops (Eye / Ear / Infant)</option>
                <option value="inhaler">💨 Inhaler / Rotahaler</option>
                <option value="injection">💉 Injection / Insulin</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">
                {isTelugu ? 'ఉపయోగం / ప్రయోజనం (Purpose)' : 'Purpose / Use'}
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Fever relief, Pain relief, Blood sugar control"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {isTelugu ? 'మాత్ర రంగు ఎంచుకోండి (Color)' : 'Select Pill Color'}
            </label>
            <div className="flex flex-wrap gap-2">
              {PILL_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 border font-bold cursor-pointer transition-all ${
                    color.name === col.name
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shape Selector */}
          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {isTelugu ? 'మాత్ర ఆకారం (Shape)' : 'Select Pill Shape'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PILL_SHAPES.map((shp) => (
                <button
                  key={shp.shape}
                  type="button"
                  onClick={() => setShape(shp.shape)}
                  className={`p-2.5 rounded-xl flex items-center gap-2 border text-left cursor-pointer transition-all ${
                    shape === shp.shape
                      ? 'border-indigo-600 bg-indigo-50 font-black text-indigo-950 ring-2 ring-indigo-400'
                      : 'border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <PillVisual
                    colorHex={color.hex}
                    shape={shp.shape}
                    size="sm"
                    colorName={color.name}
                  />
                  <span>{shp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {isTelugu ? 'రోజులో ఏ సమయంలో తీసుకోవాలి?' : 'When to take? (Select Slots)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_SLOTS.map((slotItem) => {
                const isSelected = slots.includes(slotItem.slot);
                return (
                  <button
                    key={slotItem.slot}
                    type="button"
                    onClick={() => toggleSlot(slotItem.slot)}
                    className={`p-2.5 rounded-xl flex items-center gap-2 border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 font-black text-amber-950 ring-2 ring-amber-400'
                        : 'border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{slotItem.icon}</span>
                    <span>{slotItem.slot}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-amber-700 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food Relation */}
          <div>
            <label className="block font-black text-slate-800 mb-1">
              {isTelugu ? 'ఆహారంతో సంబంధం (Food Instruction)' : 'Food Instruction'}
            </label>
            <select
              value={withFood}
              onChange={(e) => setWithFood(e.target.value as FoodInstruction)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
            >
              <option value="after_meal">🥣 After Meal / Breakfast / Lunch (భోజనం తర్వాత)</option>
              <option value="before_food">⏳ 15-30 Mins Before Food (భోజనానికి ముందు)</option>
              <option value="empty_stomach">🌅 Empty Stomach First Thing in Morning (పరిగడుపున)</option>
              <option value="with_meal">🍽️ With Meal / While Eating (భోజనంతో పాటు)</option>
              <option value="anytime">⏰ Anytime with Water (ఏ సమయమైనా)</option>
            </select>
          </div>

          {/* Recurrence & Duration Extension (Weekly, Monthly, Course) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>
                {isTelugu
                  ? 'కాలవ్యవధి & పునరావృతం (Weekly, Monthly, Course Duration)'
                  : 'Duration & Recurrence (Daily, Weekly, Monthly, Course)'}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTelugu ? 'పునరావృతం (Frequency)' : 'Frequency'}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as MedicineFrequency)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold"
                >
                  <option value="daily">💊 Daily (ప్రతిరోజూ)</option>
                  <option value="weekly">📅 Weekly (వారానికి ఒక్కసారి)</option>
                  <option value="monthly">🗓️ Monthly (నెలకు ఒక్కసారి / 30 రోజులకు)</option>
                  <option value="alternate_days">🔄 Alternate Days (ఒకరోజు విడిచి ఒకరోజు)</option>
                  <option value="as_needed_sos">🚨 As Needed / SOS (అవసరమైనప్పుడు మాత్రమే)</option>
                </select>
              </div>

              {frequency === 'weekly' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTelugu ? 'వారంలో ఏ రోజు?' : 'Which Day of the Week?'}
                  </label>
                  <select
                    value={weeklyDay}
                    onChange={(e) => setWeeklyDay(e.target.value as DayOfWeek)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold"
                  >
                    <option value="Sun">Sunday (ఆదివారం)</option>
                    <option value="Mon">Monday (సోమవారం)</option>
                    <option value="Tue">Tuesday (మంగళవారం)</option>
                    <option value="Wed">Wednesday (బుధవారం)</option>
                    <option value="Thu">Thursday (గురువారం)</option>
                    <option value="Fri">Friday (శుక్రవారం)</option>
                    <option value="Sat">Saturday (శనివారం)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTelugu ? 'మొత్తం వ్యవధి (Course Duration)' : 'Course Duration'}
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as MedicineDuration)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold"
                  >
                    <option value="lifelong">♾️ Lifelong / Regular (నిరంతరం)</option>
                    <option value="3_days">⏱️ 3 Days Course (Fever / Cold)</option>
                    <option value="5_days">⏱️ 5 Days Course (Antibiotic)</option>
                    <option value="7_days">⏱️ 7 Days Course</option>
                    <option value="14_days">⏱️ 14 Days Course</option>
                    <option value="30_days">🗓️ 30 Days (1 Month Refill)</option>
                    <option value="90_days">🗓️ 90 Days (3 Months)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Spoken Voice Note Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-black text-slate-800">
                {isTelugu ? 'స్పోకెన్ ఆడియో గైడ్ (Spoken Voice Note)' : 'Spoken Voice Explanation'}
              </label>
              <button
                type="button"
                onClick={generateAutoSpokenText}
                className="text-[11px] font-black text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Auto-generate & Listen</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder="Spoken text that will be spoken aloud to the patient in their language..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              {isTelugu
                ? 'ఈ మాత్రను నా టైమ్‌టేబుల్‌లో జోడించండి'
                : isHindi
                ? 'इस दवाई को टाइमटेबल में जोड़ें'
                : 'Add This Medicine to My Timetable'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
