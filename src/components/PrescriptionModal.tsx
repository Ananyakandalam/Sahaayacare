import React, { useState, useRef } from 'react';
import { MedicineSchedule, Medicine, PillShape, TimeSlot, DayOfWeek, FoodInstruction } from '../types/medicine';
import { DEFAULT_SCHEDULES } from '../data/defaultSchedules';
import { PillVisual } from './PillVisual';
import { X, Upload, Sparkles, Plus, Trash2, Camera, Check, FileText } from 'lucide-react';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule: MedicineSchedule;
  onSaveSchedule: (schedule: MedicineSchedule) => void;
  selectedLanguage?: string;
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
const PILL_SHAPES: PillShape[] = ['round', 'oval', 'capsule', 'square', 'liquid_drop', 'triangle'];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  currentSchedule,
  onSaveSchedule,
  selectedLanguage = 'English',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'ai_import' | 'manual'>('presets');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // AI Import State
  const [prescriptionText, setPrescriptionText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Editor State
  const [workingSchedule, setWorkingSchedule] = useState<MedicineSchedule>({
    ...currentSchedule,
    medicines: [...currentSchedule.medicines],
  });

  const handleSelectPreset = (key: string) => {
    const preset = DEFAULT_SCHEDULES[key];
    if (preset) {
      onSaveSchedule({ ...preset });
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAIExtract = async () => {
    if (!prescriptionText.trim() && !imageBase64) {
      setParseError('Please provide prescription text or upload an image.');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch('/api/parse-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prescriptionText,
          imageBase64: imageBase64,
          targetLanguage: 'English',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse prescription with Gemini API.');
      }

      const data = await response.json();
      if (data.medicines && data.medicines.length > 0) {
        const newSched: MedicineSchedule = {
          regimenTitle: data.regimenTitle || 'Prescription Medicine Timetable',
          patientName: workingSchedule.patientName || 'Patient',
          patientNotes: data.patientNotes || 'Follow 7-day schedule carefully.',
          spokenOverview: data.spokenOverview || 'Here is your newly generated medicine timetable.',
          emergencyContact: workingSchedule.emergencyContact,
          medicines: data.medicines,
        };
        onSaveSchedule(newSched);
        onClose();
      } else {
        throw new Error('Could not identify distinct medicines from the input.');
      }
    } catch (err: any) {
      setParseError(err.message || 'Error parsing prescription.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddMedicine = () => {
    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: 'New Medicine',
      dosage: '1 Tablet',
      purpose: 'Daily Wellness',
      color: 'Golden Yellow',
      colorHex: '#FBBF24',
      shape: 'round',
      slots: ['morning'],
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      withFood: 'with_meal',
      waterRequirement: 'full_glass',
      spokenExplanation: 'Take one round yellow tablet in the morning after eating breakfast with water.',
    };

    setWorkingSchedule({
      ...workingSchedule,
      medicines: [...workingSchedule.medicines, newMed],
    });
  };

  const handleRemoveMedicine = (id: string) => {
    setWorkingSchedule({
      ...workingSchedule,
      medicines: workingSchedule.medicines.filter((m) => m.id !== id),
    });
  };

  const handleUpdateMedicine = (id: string, updates: Partial<Medicine>) => {
    setWorkingSchedule({
      ...workingSchedule,
      medicines: workingSchedule.medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              📋
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                Customize 7-Day Medicine Regimen
              </h3>
              <p className="text-xs text-slate-300">
                Choose a clinical preset, upload a doctor prescription, or edit pills manually.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 rounded-t-xl font-extrabold text-sm transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌟 Clinical Presets
          </button>
          <button
            onClick={() => setActiveTab('ai_import')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-extrabold text-sm transition-all ${
              activeTab === 'ai_import'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Prescription Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 rounded-t-xl font-extrabold text-sm transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✏️ Edit Pills & Times ({workingSchedule.medicines.length})
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-slate-600 font-medium">
              Select one of the carefully structured regimens with rich audio narration:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(DEFAULT_SCHEDULES).map(([key, item]) => (
                <div
                  key={key}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col justify-between bg-slate-50/60"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {key.toUpperCase()}
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900 mt-2">
                      {item.regimenTitle}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                      {item.patientNotes}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.medicines.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-white border border-slate-200"
                        >
                          <PillVisual
                            shape={m.shape}
                            colorHex={m.colorHex}
                            size="sm"
                          />
                          <span className="truncate max-w-[80px]">{m.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className="mt-5 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-sm"
                  >
                    Load This Regimen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: AI Prescription Scanner */}
        {activeTab === 'ai_import' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <span className="font-extrabold">💡 How Gemini AI Helps Non-Readers:</span> It automatically detects medications from your doctor's label or photo, assigns distinctive visual pill shapes and bright colors, creates the 7-day routine, and crafts slow, comforting spoken audio directions!
            </div>

            {/* Photo upload area */}
            <div>
              <label className="block text-sm font-extrabold text-slate-900 mb-2">
                1. Upload Prescription Photo or Medicine Bottle Label:
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-white"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {imageBase64 ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imageBase64}
                      alt="Uploaded prescription"
                      className="max-h-48 rounded-xl object-contain shadow-md mb-2"
                    />
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Image attached! Tap to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-10 h-10 text-slate-400 mb-2" />
                    <span className="text-sm font-extrabold text-slate-700">
                      Click to upload photo or prescription slip
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      JPG, PNG, WebP supported
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Text description area */}
            <div>
              <label className="block text-sm font-extrabold text-slate-900 mb-2">
                2. Or Paste / Type Doctor Instructions:
              </label>
              <textarea
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Example: Take Lisinopril 10mg round pink tablet every morning with breakfast and water. Take Metformin 500mg white oval tablet twice a day with meals."
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-medium"
              />
            </div>

            {parseError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                ⚠️ {parseError}
              </div>
            )}

            <button
              type="button"
              disabled={isParsing}
              onClick={handleAIExtract}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
                isParsing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{isParsing ? 'Analyzing & Generating Audio Guide...' : 'Generate 7-Day Timetable & Audio'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Manual Pill Editor */}
        {activeTab === 'manual' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Manage Pills, Shapes & Spoken Guides
                </h4>
                <p className="text-xs text-slate-500">
                  Ensure every pill has a distinctive color and shape for non-readers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pill</span>
              </button>
            </div>

            <div className="space-y-4">
              {workingSchedule.medicines.map((med, index) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PillVisual
                        shape={med.shape}
                        colorHex={med.colorHex}
                        size="md"
                      />
                      <div>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) =>
                            handleUpdateMedicine(med.id, { name: e.target.value })
                          }
                          className="font-extrabold text-base bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900"
                          placeholder="Medicine Name"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) =>
                            handleUpdateMedicine(med.id, { dosage: e.target.value })
                          }
                          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-0.5 ml-2"
                          placeholder="Dosage e.g. 10mg"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(med.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual Shape & Color Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1">
                        Pill Shape:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PILL_SHAPES.map((shape) => (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => handleUpdateMedicine(med.id, { shape })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${
                              med.shape === shape
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {shape.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1">
                        Pill Color:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PILL_COLORS.map((col) => (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() =>
                              handleUpdateMedicine(med.id, {
                                color: col.name,
                                colorHex: col.hex,
                              })
                            }
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                              med.colorHex === col.hex
                                ? 'scale-110 ring-2 ring-indigo-500 border-white'
                                : 'border-black/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Routine Slots */}
                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-1">
                      Time of Day:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(['morning', 'afternoon', 'evening', 'bedtime'] as TimeSlot[]).map(
                        (slot) => {
                          const isSelected = med.slots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                const newSlots = isSelected
                                  ? med.slots.filter((s) => s !== slot)
                                  : [...med.slots, slot];
                                handleUpdateMedicine(med.id, {
                                  slots: newSlots.length > 0 ? newSlots : ['morning'],
                                });
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize border ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Recurrence & Duration Extension (Requirement 5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1">
                        Recurrence / Frequency:
                      </span>
                      <select
                        value={med.frequency || 'daily'}
                        onChange={(e) => {
                          const freq = e.target.value as any;
                          const label =
                            freq === 'weekly'
                              ? 'Weekly (Every Sun)'
                              : freq === 'monthly'
                              ? 'Monthly (30 Days)'
                              : freq === 'alternate_days'
                              ? 'Alternate Days'
                              : 'Daily';
                          handleUpdateMedicine(med.id, {
                            frequency: freq,
                            durationLabel: label,
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                      >
                        <option value="daily">💊 Daily</option>
                        <option value="weekly">📅 Weekly</option>
                        <option value="monthly">🗓️ Monthly (Every 30 Days)</option>
                        <option value="alternate_days">🔄 Alternate Days</option>
                        <option value="as_needed_sos">🚨 As Needed (SOS)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1">
                        Course Duration:
                      </span>
                      <select
                        value={med.duration || 'lifelong'}
                        onChange={(e) => {
                          const dur = e.target.value as any;
                          handleUpdateMedicine(med.id, {
                            duration: dur,
                            durationLabel:
                              dur === 'lifelong'
                                ? 'Daily (Lifelong)'
                                : dur === '5_days'
                                ? '5 Days Course (Antibiotic)'
                                : dur === '30_days'
                                ? '30 Days Course (1 Month)'
                                : `${dur} Course`,
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                      >
                        <option value="lifelong">♾️ Lifelong / Chronic</option>
                        <option value="3_days">⏱️ 3 Days Course</option>
                        <option value="5_days">⏱️ 5 Days Course (Antibiotic)</option>
                        <option value="7_days">⏱️ 7 Days Course</option>
                        <option value="14_days">⏱️ 14 Days Course</option>
                        <option value="30_days">🗓️ 30 Days (1 Month)</option>
                        <option value="90_days">🗓️ 90 Days (3 Months)</option>
                      </select>
                    </div>
                  </div>

                  {/* Spoken Explanation script */}
                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-1">
                      Spoken Audio Narration (Sensory Description for Non-Reader):
                    </span>
                    <textarea
                      value={med.spokenExplanation}
                      onChange={(e) =>
                        handleUpdateMedicine(med.id, {
                          spokenExplanation: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                      placeholder="e.g. In the morning, take your round yellow tablet with water after breakfast."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveSchedule(workingSchedule);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md"
              >
                Save Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
