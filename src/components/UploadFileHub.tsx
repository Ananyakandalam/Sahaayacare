import React, { useState, useEffect, useRef } from 'react';
import { MedicineSchedule, Medicine, PillShape, TimeSlot } from '../types/medicine';
import { SAMPLE_PRESCRIPTION_FILES } from '../data/defaultSchedules';
import { PillVisual } from './PillVisual';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Upload,
  FileText,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Info,
  Mic,
  MicOff,
  Video,
  SwitchCamera,
  Volume2,
} from 'lucide-react';

interface UploadFileHubProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: (schedule: MedicineSchedule) => void;
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export const UploadFileHub: React.FC<UploadFileHubProps> = ({
  isOpen,
  onClose,
  onApplySchedule,
  selectedLanguage = 'English',
  onSelectLanguage,
}) => {
  const [hubLanguage, setHubLanguage] = useState<string>(selectedLanguage);

  useEffect(() => {
    setHubLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const isTelugu = hubLanguage === 'Telugu';
  const isHindi = hubLanguage === 'Hindi';

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);

  const [prescriptionText, setPrescriptionText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<MedicineSchedule | null>(null);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Microphone Voice input states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle Speech Recognition for Microphone input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        hubLanguage === 'Telugu'
          ? 'te-IN'
          : hubLanguage === 'Hindi'
          ? 'hi-IN'
          : 'en-US';

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setPrescriptionText((prev) => (prev ? `${prev}\n${transcript}` : transcript));
          audioPlayer.playChime('success');
        }
        setIsRecordingVoice(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recording error:', event.error);
        setIsRecordingVoice(false);
        setVoiceError(
          isTelugu
            ? 'మైక్రోఫోన్ స్పష్టంగా వినలేకపోయింది. దయచేసి మరోసారి మాట్లాడండి.'
            : 'Could not catch audio clearly. Please try speaking again.'
        );
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
    }
  }, [hubLanguage]);

  // Clean up camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        isTelugu
          ? 'కెమెరా తెరవడంలో సమస్య వచ్చింది. బ్రౌజర్ అనుమతులను తనిఖీ చేయండి లేదా క్రింది ఫైల్ అప్‌లోడ్ ఉపయోగించండి.'
          : 'Could not open live camera. Please check camera permissions or use the file upload.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const flipCamera = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setSelectedFile({
      name: `Camera_Photo_${Date.now()}.jpg`,
      size: `${(dataUrl.length / (1024 * 1024)).toFixed(2)} MB`,
      type: 'image/jpeg',
      dataUrl,
    });

    stopCamera();
    audioPlayer.playChime('success');
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      setVoiceError(
        isTelugu
          ? 'ఈ బ్రౌజర్‌లో మైక్రోఫోన్ వాయిస్ గుర్తింపు అందుబాటులో లేదు.'
          : 'Microphone recognition not supported in this browser. Please type below.'
      );
      return;
    }

    if (isRecordingVoice) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
    } else {
      audioPlayer.playChime('tap');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Voice start failed:', e);
      }
    }
  };

  const handleLanguageChange = (lang: string) => {
    setHubLanguage(lang);
    onSelectLanguage?.(lang);
    audioPlayer.playChime('tap');
  };

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setErrorMessage(
        isTelugu
          ? 'దయచేసి ప్రిస్క్రిప్షన్ ఫోటో (JPG, PNG, WebP) లేదా PDF పత్రం అప్‌లోడ్ చేయండి.'
          : 'Please upload a valid prescription image (JPG, PNG, WebP) or PDF document.'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage(
        isTelugu
          ? 'ఫైల్ పరిమాణం 25MB కంటే తక్కువగా ఉండాలి.'
          : 'File size exceeds 25MB limit. Please upload a smaller file.'
      );
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || 'application/pdf',
        dataUrl: reader.result as string,
      });
      audioPlayer.playChime('tap');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // One-click sample prescription loader
  const handleSelectSample = (sample: typeof SAMPLE_PRESCRIPTION_FILES[0]) => {
    setPrescriptionText(sample.sampleText);
    setSelectedFile({
      name: `${sample.title.replace(/[^\w\s]/gi, '').trim()}.txt`,
      size: 'Clinical Record (Sample)',
      type: 'text/plain',
      dataUrl: '',
    });
    setExtractedResult(null);
    audioPlayer.playChime('tap');
  };

  // Perform Gemini AI Extraction
  const handleExtractMedicines = async () => {
    if (!selectedFile && !prescriptionText.trim()) {
      setErrorMessage(
        isTelugu
          ? 'దయచేసి ప్రిస్క్రిప్షన్ ఫోటో తీయండి లేదా మీ సమస్యను వాయిస్/టెక్స్ట్‌లో చెప్పండి.'
          : 'Please upload a prescription file, take a photo, or explain your medicines.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep(1); // Upload verified

    try {
      setTimeout(() => setProcessingStep(2), 600);
      setTimeout(() => setProcessingStep(3), 1300);

      const response = await fetch('/api/parse-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prescriptionText,
          fileBase64: selectedFile?.dataUrl || undefined,
          fileMimeType: selectedFile?.type || 'image/jpeg',
          targetLanguage: hubLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not parse prescription file. Falling back to clinical analysis.');
      }

      const data = await response.json();
      setProcessingStep(4);

      if (data && data.medicines && data.medicines.length > 0) {
        const schedule: MedicineSchedule = {
          regimenTitle: data.regimenTitle || (isTelugu ? 'ప్రిస్క్రిప్షన్ 7 రోజుల సంరక్షణ పట్టిక' : 'Prescription 7-Day Care Regimen'),
          patientName: 'Patient',
          patientNotes: data.patientNotes || (isTelugu ? 'అప్‌లోడ్ చేసిన వైద్య పత్రాల ద్వారా నిర్ధారించబడింది.' : 'Carefully verified from medical records.'),
          spokenOverview:
            data.spokenOverview ||
            (isTelugu
              ? 'మీ 7 రోజుల మందుల సమయ పట్టిక సిద్ధంగా ఉంది. ప్రతి మాత్రకు రంగుల గుర్తులు మరియు తెలుగు స్వర సూచనలు ఉన్నాయి.'
              : 'Here is your newly generated 7-day visual medicine schedule with color-coded pills.'),
          emergencyContact: {
            name: isTelugu ? 'డాక్టర్ / పరిరక్షకులు' : 'Primary Care Doctor',
            phone: '108 / 102',
            relation: isTelugu ? 'అత్యవసర సంప్రదింపు' : 'Doctor on Call',
          },
          medicines: data.medicines,
        };

        setExtractedResult(schedule);
        audioPlayer.playChime('success');
      } else {
        throw new Error('No distinct medications could be identified. Try a clearer photo or sample.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing prescription file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToSchedule = () => {
    if (extractedResult) {
      onApplySchedule(extractedResult);
      audioPlayer.playChime('success');
      stopCamera();
      onClose();
    }
  };

  const handleListenText = () => {
    if (!prescriptionText.trim()) return;
    audioPlayer.speakText({
      text: prescriptionText,
      language: hubLanguage,
      speed: 0.88,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Domain Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg text-2xl">
              📷
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {isTelugu
                    ? 'కెమెరా, మైక్రోఫోన్ & ప్రిస్క్రిప్షన్ హబ్'
                    : 'Camera, Microphone & Prescription Hub'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-[10px] uppercase tracking-wider">
                  AI Vision & Voice
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                {isTelugu
                  ? 'మీ ఫోన్ కెమెరాతో ఫోటో తీయండి లేదా మైక్రోఫోన్‌తో మాట్లాడి సమస్య చెప్పండి. 7 రోజుల రంగుల పట్టిక సిద్ధమవుతుంది.'
                  : 'Snap photos with your camera or speak your problem with microphone. We create a 7-day visual schedule.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            aria-label="Close upload hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Workspace */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Spoken Language Domain Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                🌐 {isTelugu ? 'మాట్లాడే భాష:' : 'Spoken Language Domain:'}
              </span>
              <p className="text-[11px] text-indigo-800 font-medium">
                {isTelugu
                  ? 'మందుల వివరణలు మరియు స్వర మార్గదర్శి ఈ భాషలో మాట్లాడబడుతుంది.'
                  : 'Generated audio directions will be spoken in this language for non-reading patients.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { code: 'Telugu', label: 'తెలుగు (Telugu)' },
                { code: 'Hindi', label: 'हिंदी (Hindi)' },
                { code: 'English', label: 'English (US)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    hubLanguage === lang.code
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Viewfinder (when camera active) */}
          {isCameraActive && (
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-3 border-indigo-500 shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 sm:h-80 object-cover"
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-amber-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-white/80 bg-black/60 px-3 py-1 rounded-full text-xs font-bold">
                  {isTelugu ? 'మందుల బాక్స్ లేదా ప్రిస్క్రిప్షన్ ఇక్కడ చూపించండి' : 'Position prescription or pill bottle inside frame'}
                </span>
              </div>

              {/* Camera Controls Bar */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-3 bg-black/70 backdrop-blur-md p-3 rounded-2xl">
                <button
                  type="button"
                  onClick={flipCamera}
                  className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                  title="Flip Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                  <span className="hidden sm:inline">{isTelugu ? 'కెమెరా మార్చు' : 'Flip'}</span>
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>{isTelugu ? 'ఫోటో తీయండి' : 'Capture Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-3 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white transition active:scale-95 text-xs font-bold"
                  title="Cancel Camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Dual Action: Live Camera & Microphone Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Live Camera Button */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-950 block">
                    {isTelugu ? 'లైవ్ కెమెరా (Live Camera)' : 'Open Device Camera'}
                  </span>
                  <span className="text-[11px] text-indigo-800 font-medium block">
                    {isTelugu ? 'మందుల బాక్స్ లేదా చీటీ ఫోటో తీయండి' : 'Snap photo of pill box or doctor note'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => startCamera(cameraFacingMode)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isTelugu ? 'కెమెరా' : 'Open'}</span>
                </button>
                {/* Fallback hidden file input with capture for iOS Safari / Android */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Microphone Voice Problem Explanation */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-950 block">
                    {isTelugu ? 'మైక్రోఫోన్ వాయిస్ (Microphone)' : 'Microphone Voice Problem'}
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium block">
                    {isTelugu ? 'మీ సమస్యను లేదా మందుల వివరాలను మాట్లాడండి' : 'Speak symptoms or medicine doubts aloud'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`px-3.5 py-2 rounded-xl font-black text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 ${
                  isRecordingVoice
                    ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                }`}
              >
                {isRecordingVoice ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{isTelugu ? 'వింటోంది...' : 'Listening...'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isTelugu ? 'మాట్లాడండి' : 'Speak'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {voiceError && (
            <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-semibold">
              {voiceError}
            </div>
          )}

          {/* Quick Sample Selector for immediate one-click testing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                ⚡ {isTelugu ? 'నమూనా ప్రిస్క్రిప్షన్లు (One-Click Testing):' : 'Try One-Click Sample Prescriptions:'}
              </span>
              <span className="text-[11px] font-semibold text-indigo-600">
                {isTelugu ? 'ఫోటో లేకుండా పరీక్షించడానికి వీటిపై నొక్కండి' : 'Test without taking a photo'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_PRESCRIPTION_FILES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 text-left rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex flex-col justify-between group active:scale-98"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 group-hover:text-indigo-700 block">
                      {sample.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block line-clamp-1 mt-0.5">
                      {sample.description}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 mt-2 flex items-center gap-1">
                    {isTelugu ? 'లోడ్ చేయు ➜' : 'Load Slip ➜'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Upload Dropzone */}
          {!isCameraActive && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-3 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-indigo-500 bg-slate-50/80 hover:bg-white'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*,application/pdf,text/plain"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {selectedFile.dataUrl.startsWith('data:image/') ? (
                    <img
                      src={selectedFile.dataUrl}
                      alt="Prescription preview"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl shadow-md border-2 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-3xl">
                      📄
                    </div>
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span className="text-base font-black text-slate-900">
                        {selectedFile.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                      {selectedFile.size} • {selectedFile.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                    </span>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                      ✅ {isTelugu ? 'విశ్లేషణకు సిద్ధంగా ఉంది. మార్చడానికి తాకండి.' : 'Ready for AI Analysis. Tap to replace.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shadow-inner">
                    <Upload className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isTelugu
                      ? 'ఫైల్ లేదా ఫోటోను ఇక్కడ వేయండి (లేదా క్లిక్ చేయండి)'
                      : 'Drag & Drop Your Medical File or Photo Here'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mt-1">
                    {isTelugu
                      ? 'ప్రిస్క్రిప్షన్ చీటీ, మందుల బాక్స్ ఫోటోలు లేదా PDF పత్రాలు (25MB వరకు).'
                      : 'Prescription slips, medicine boxes, discharge notes, or PDF documents up to 25MB.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Spoken/Typed Notes Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>{isTelugu ? 'డాక్టర్ సూచనలు / సమస్య వివరాలు:' : 'Doctor Instructions / Spoken Notes:'}</span>
                {isRecordingVoice && (
                  <span className="text-rose-600 font-bold animate-pulse">● {isTelugu ? 'రికార్డ్ అవుతోంది...' : 'Recording...'}</span>
                )}
              </label>
              <div className="flex items-center gap-2">
                {prescriptionText && (
                  <>
                    <button
                      type="button"
                      onClick={handleListenText}
                      className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isTelugu ? 'వినండి' : 'Listen Back'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrescriptionText('')}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      {isTelugu ? 'తొలగించు' : 'Clear Text'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder={
                isTelugu
                  ? 'మీ మందుల వివరాలు ఇక్కడ టైప్ చేయండి లేదా పైన ఉన్న మైక్రోఫోన్ నొక్కి తెలుగులో మాట్లాడండి. ఉదాహరణ: ఉదయం పసుపు రంగు బిళ్ళ టిఫిన్ తర్వాత, రాత్రి నీలం క్యాప్సూల్.'
                  : 'Type or speak medicine instructions here, e.g.: Lisinopril 10mg round yellow tablet once morning with breakfast. Metformin 500mg white oval twice daily.'
              }
              rows={3}
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-xs sm:text-sm font-medium transition-all"
            />
          </div>

          {/* Processing Steps Pipeline */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3 animate-pulse">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{isTelugu ? 'జెమినీ AI పత్రాలను పరిశీలిస్తోంది...' : 'Processing Medical Document with Gemini AI...'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
                <div className={`p-2 rounded-xl flex items-center gap-1.5 ${processingStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                  <span>{isTelugu ? '1. పత్రం పరిశీలన' : '1. File Verified'}</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center gap-1.5 ${processingStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                  <span>{isTelugu ? '2. అక్షరాల గుర్తింపు' : '2. OCR Scan'}</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center gap-1.5 ${processingStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                  <span>{isTelugu ? '3. రంగు & ఆకారాలు' : '3. Pill Cues'}</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center gap-1.5 ${processingStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                  <span>{isTelugu ? '4. మాట్లాడే ఆడియో' : '4. Spoken Narration'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs sm:text-sm font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          {!extractedResult && (
            <button
              type="button"
              disabled={isProcessing || (!selectedFile && !prescriptionText.trim())}
              onClick={handleExtractMedicines}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 text-white shadow-xl transition-all ${
                isProcessing || (!selectedFile && !prescriptionText.trim())
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 active:scale-98 shadow-indigo-200'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>
                {isProcessing
                  ? isTelugu
                    ? 'మందులను విశ్లేషిస్తోంది...'
                    : 'Analyzing Medications...'
                  : isTelugu
                  ? 'స్కాన్ చేసి మాట్లాడే 7 రోజుల పట్టిక తయారు చేయండి'
                  : 'Scan & Generate Spoken 7-Day Schedule'}
              </span>
            </button>
          )}

          {/* Extracted Schedule Preview */}
          {extractedResult && (
            <div className="p-5 rounded-3xl bg-slate-50 border-2 border-emerald-500/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isTelugu
                        ? `${extractedResult.medicines.length} మందులు విజయవంతంగా గుర్తించబడ్డాయి!`
                        : `Successfully Identified ${extractedResult.medicines.length} Medications!`}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {isTelugu
                        ? 'రంగుల గుర్తులు మరియు మాట్లాడే సూచనలను క్రింద సమీక్షించండి:'
                        : 'Review visual shapes and spoken instructions below:'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExtractedResult(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                >
                  {isTelugu ? 'మళ్లీ స్కాన్ చేయు' : 'Rescan'}
                </button>
              </div>

              {/* Medicine Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extractedResult.medicines.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3"
                  >
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <PillVisual
                        shape={med.shape}
                        colorHex={med.colorHex}
                        colorName={med.color}
                        size="md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {med.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-indigo-700 flex flex-wrap gap-1 mt-1">
                        {med.slots.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 capitalize">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-1">
                        "{med.spokenExplanation}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-semibold">
                  {isTelugu
                    ? `ఈ ${extractedResult.medicines.length} మందులు మీ 7 రోజుల సమయ పట్టికకు జోడించబడతాయి.`
                    : `This will update your 7-day schedule with these ${extractedResult.medicines.length} medications.`}
                </span>

                <button
                  type="button"
                  onClick={handleApplyToSchedule}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>{isTelugu ? 'నా 7 రోజుల పట్టికకు చేర్చు' : 'Apply To My 7-Day Timetable'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
