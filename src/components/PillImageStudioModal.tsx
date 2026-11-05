import React, { useState } from 'react';
import {
  Image,
  Sparkles,
  Wand2,
  X,
  Download,
  Check,
  RefreshCw,
  Upload,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { audioPlayer } from '../utils/audioPlayer';

interface PillImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGeneratedImage?: (imageUrl: string) => void;
  selectedLanguage?: string;
}

export const PillImageStudioModal: React.FC<PillImageStudioModalProps> = ({
  isOpen,
  onClose,
  onSelectGeneratedImage,
  selectedLanguage = 'English',
}) => {
  const [tab, setTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('Bright golden yellow round pill with center score line on crisp white background, clear pharmaceutical lighting');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '3:4'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit states
  const [editPrompt, setEditPrompt] = useState('Add a glowing golden border and a fresh glass of water next to the pill');
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  const samplePrompts = [
    {
      label: 'Golden Yellow Round Pill',
      text: 'Bright golden yellow round pharmaceutical tablet with center groove on clean isolated background, high resolution macro photograph',
    },
    {
      label: 'Sky Blue Capsule',
      text: 'Smooth two-tone sky blue and white gelatin capsule medication on high contrast soft gray background',
    },
    {
      label: 'Ruby Red Oval Tablet',
      text: 'Vibrant ruby red oval coated medicine pill with clear smooth edges, medical product photograph',
    },
    {
      label: 'Pill with Water Glass',
      text: 'A clean glass of pure water next to a morning yellow vitamin tablet on a bedside table, warm natural sunlight',
    },
    {
      label: 'Pediatric Syrup & Spoon',
      text: 'Child healthcare liquid medicine bottle with marked measuring spoon and soothing lavender drops',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);
    audioPlayer.playChime('tap');

    try {
      const res = await fetch('/api/gemini/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      setImageDescription(data.text);
      setImageToEdit(data.imageUrl); // Ready for editing if needed
      audioPlayer.playChime('success');
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorMessage(err.message || 'Could not generate image. Please check API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !imageToEdit || isEditing) return;
    setIsEditing(true);
    setErrorMessage(null);
    audioPlayer.playChime('tap');

    try {
      const res = await fetch('/api/gemini/image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          imageBase64: imageToEdit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to edit image');
      }

      setGeneratedImage(data.imageUrl);
      setImageToEdit(data.imageUrl);
      setImageDescription(data.text);
      audioPlayer.playChime('success');
    } catch (err: any) {
      console.error('Image edit error:', err);
      setErrorMessage(err.message || 'Could not edit image.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImageToEdit(b64);
      setGeneratedImage(b64);
      setTab('edit');
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col text-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  Visual Pill &amp; Medical Image Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black border border-indigo-200">
                  gemini-3.1-flash-lite-image
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Create and edit high-contrast visual pill identifiers and health cues
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 bg-white flex gap-2">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'create'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Pill Image</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'edit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Edit Existing Image</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Controls */}
          <div className="space-y-4">
            {tab === 'create' ? (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Describe Pill or Medical Graphic to Generate:
                  </label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Ruby red oval capsule with smooth coating..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Aspect Ratio:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    {(['1:1', '4:3', '16:9', '3:4'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          aspectRatio === ratio
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-black'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sample Presets */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Quick Clinical Presets:
                  </label>
                  <div className="space-y-1.5">
                    {samplePrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(p.text)}
                        className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        <span className="font-black text-indigo-600">✦ {p.label}:</span>{' '}
                        <span className="text-slate-500 truncate inline-block max-w-[200px] align-bottom">
                          {p.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating with Gemini...' : 'Generate Visual Pill'}</span>
                </button>
              </>
            ) : (
              <>
                {/* Edit Controls */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Select Image to Edit:
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-2.5 px-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>Upload local image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {generatedImage && (
                      <button
                        type="button"
                        onClick={() => setImageToEdit(generatedImage)}
                        className="px-3 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                      >
                        Use current result
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Edit Instructions (What to change or add):
                  </label>
                  <textarea
                    rows={3}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Add a bright water cup next to the pill..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Quick Edit Ideas:
                  </span>
                  {[
                    'Add a red warning badge in the corner',
                    'Make the pill color emerald green instead of yellow',
                    'Add a glass of water and morning sun icon',
                    'Isolate the pill on pure high contrast white background',
                  ].map((editIdea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditPrompt(editIdea)}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer"
                    >
                      ✏️ {editIdea}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={isEditing || !imageToEdit || !editPrompt.trim()}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isEditing ? 'Editing with Gemini...' : 'Apply AI Edit'}</span>
                </button>
              </>
            )}

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Right: Preview Canvas */}
          <div className="flex flex-col items-center justify-center bg-slate-100 rounded-3xl p-4 border border-slate-200 relative min-h-[320px]">
            {isGenerating || isEditing ? (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto animate-spin">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <p className="text-xs font-black text-slate-700 animate-pulse">
                  {isGenerating
                    ? 'Gemini 3.1 Flash Lite Image is rendering your pill...'
                    : 'Gemini 3.1 Flash Lite Image is editing your image...'}
                </p>
                <p className="text-[11px] text-slate-400">Takes 2 to 4 seconds</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full flex flex-col items-center space-y-3">
                <img
                  src={generatedImage}
                  alt="Generated visual"
                  className="max-h-[360px] w-auto rounded-2xl object-contain shadow-lg border border-white"
                />

                <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2">
                  <a
                    href={generatedImage}
                    download="sahaaya-pill-visual.png"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>

                  {onSelectGeneratedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectGeneratedImage(generatedImage);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Use as Medicine Pill Visual</span>
                    </button>
                  )}
                </div>

                {imageDescription && (
                  <p className="text-[11px] text-slate-500 text-center italic max-w-sm">
                    {imageDescription}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-2 p-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-200/80 flex items-center justify-center mx-auto text-3xl">
                  💊
                </div>
                <h4 className="text-sm font-black text-slate-600">No Image Generated Yet</h4>
                <p className="text-xs max-w-xs text-slate-400">
                  Select a clinical preset or type a description to create visual pill cues for patients who cannot read.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
