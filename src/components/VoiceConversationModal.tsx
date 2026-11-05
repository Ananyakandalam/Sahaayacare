import React, { useState, useRef, useEffect } from 'react';
import { MedicineSchedule } from '../types/medicine';
import { audioPlayer } from '../utils/audioPlayer';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  RotateCcw,
  Globe,
  Radio,
  ExternalLink,
  MessageCircle,
  Play,
  Pause,
} from 'lucide-react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule?: MedicineSchedule;
  selectedLanguage?: string;
}

interface ConversationTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioBase64?: string | null;
  sources?: { title: string; url: string }[];
  timestamp: string;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
  currentSchedule,
  selectedLanguage = 'English',
}) => {
  const [language, setLanguage] = useState(selectedLanguage);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [enableSearch, setEnableSearch] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null);

  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      id: 'welcome-voice',
      sender: 'assistant',
      text:
        language === 'Telugu'
          ? 'నమస్కారం! నేను మీ సహాయ వాయిస్ కేర్ సహాయకుడిని. మైక్రోఫోన్ నొక్కి మాట్లాడండి, మీ మందుల సమయాలు లేదా ఆరోగ్య సందేహాలను నేను నేరుగా మాట్లాడి వివరిస్తాను.'
          : language === 'Hindi'
          ? 'नमस्ते! मैं आपका सहाय वॉइस केयर सहायक हूँ। माइक्रोफ़ोन दबाकर बोलें, मैं आपकी दवाइयों के समय या किसी भी सवाल का बोलकर उत्तर दूँगा।'
          : 'Hello! I am your Sahaaya Voice Care Assistant. Tap the microphone and speak your question aloud, and I will speak back to you.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isProcessing]);

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen && activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
      setCurrentlyPlayingAudio(null);
    }
  }, [isOpen]);

  const playVoiceTurn = (turnId: string, base64Audio?: string | null, fallbackText?: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (currentlyPlayingAudio === turnId) {
      setCurrentlyPlayingAudio(null);
      return;
    }

    if (base64Audio) {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      setCurrentlyPlayingAudio(turnId);

      audio.onended = () => {
        setCurrentlyPlayingAudio(null);
      };
      audio.onerror = () => {
        setCurrentlyPlayingAudio(null);
        if (fallbackText) {
          audioPlayer.speakText({ text: fallbackText, language, voice: 'Kore' });
        }
      };

      audio.play().catch(() => {
        if (fallbackText) {
          audioPlayer.speakText({ text: fallbackText, language, voice: 'Kore' });
        }
      });
    } else if (fallbackText) {
      setCurrentlyPlayingAudio(turnId);
      audioPlayer.speakText({
        text: fallbackText,
        language,
        voice: 'Kore',
        onEnd: () => setCurrentlyPlayingAudio(null),
      });
    }
  };

  const startVoiceRecording = async () => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }

      setStatusMessage(
        language === 'Telugu'
          ? 'వింటున్నాను... మాట్లాడండి'
          : language === 'Hindi'
          ? 'सुन रहा हूँ... बोलिए'
          : 'Listening... please speak now'
      );

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        await handleSendVoiceAudio(audioBlob, mediaRecorder.mimeType || 'audio/webm');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      audioPlayer.playChime('tap');
    } catch (err: any) {
      console.warn('Microphone access failed:', err);
      setStatusMessage('Microphone access denied. You can type below instead.');
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusMessage('Processing your speech with Gemini...');
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendVoiceAudio = async (audioBlob: Blob, mimeType: string) => {
    setIsProcessing(true);
    try {
      const base64Data = await blobToBase64(audioBlob);

      const res = await fetch('/api/gemini/voice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          audioMimeType: mimeType,
          language,
          currentSchedule,
          enableSearch,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed voice conversation');
      }

      // Add user turn
      const userTurnId = `user-${Date.now()}`;
      const assistantTurnId = `asst-${Date.now() + 1}`;

      setTurns((prev) => [
        ...prev,
        {
          id: userTurnId,
          sender: 'user',
          text: data.userQuery || 'Spoken Question',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: assistantTurnId,
          sender: 'assistant',
          text: data.replyText,
          audioBase64: data.audioBase64,
          sources: data.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setStatusMessage('');

      // Auto-play spoken response
      if (data.audioBase64) {
        playVoiceTurn(assistantTurnId, data.audioBase64, data.replyText);
      }
    } catch (err: any) {
      console.error('Voice conversation error:', err);
      setStatusMessage('Voice query could not be completed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendText = async (textQuery?: string) => {
    const text = (textQuery || inputText).trim();
    if (!text || isProcessing) return;

    setInputText('');
    setIsProcessing(true);
    setStatusMessage('Consulting Gemini AI...');

    const userTurnId = `user-${Date.now()}`;
    setTurns((prev) => [
      ...prev,
      {
        id: userTurnId,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const res = await fetch('/api/gemini/voice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textMessage: text,
          language,
          currentSchedule,
          enableSearch,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed conversation');

      const assistantTurnId = `asst-${Date.now()}`;
      setTurns((prev) => [
        ...prev,
        {
          id: assistantTurnId,
          sender: 'assistant',
          text: data.replyText,
          audioBase64: data.audioBase64,
          sources: data.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setStatusMessage('');

      if (data.audioBase64) {
        playVoiceTurn(assistantTurnId, data.audioBase64, data.replyText);
      }
    } catch (err: any) {
      console.error('Text conversation error:', err);
      setStatusMessage('Error fetching response.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const quickVoicePrompts =
    language === 'Telugu'
      ? [
          'ఈ రోజు నేను ఏ మందులు వేసుకోవాలి?',
          'పసుపు మాత్ర ఎప్పుడు వేసుకోవాలి?',
          'ఆహారంతో పాటు వేసుకోవాల్సిన మాత్రలేవి?',
          'మందు వేసుకోవడం మర్చిపోతే ఏమి చేయాలి?',
        ]
      : language === 'Hindi'
      ? [
          'आज मुझे कौन सी दवाइयाँ लेनी हैं?',
          'पीली गोली कब लेनी है?',
          'खाने के साथ कौन सी गोली लेनी है?',
          'अगर दवाई लेना भूल जाएं तो क्या करें?',
        ]
      : [
          'What medicines do I take today?',
          'When should I take the yellow pill?',
          'Which medicines need to be taken with food?',
          'What if I accidentally missed my morning dose?',
        ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-2xl h-[90vh] max-h-[780px] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 text-xl animate-pulse">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Gemini Voice Conversation
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE SPEECH
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Talk naturally in Telugu, Hindi, or English • Grounded with Search
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 text-xs font-bold border border-white/10">
              {(['Telugu', 'Hindi', 'English'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                    language === l ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-300'
                  }`}
                >
                  {l === 'Telugu' ? 'తెలుగు' : l === 'Hindi' ? 'हिंदी' : 'ENG'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Grounding Bar */}
        <div className="px-4 py-2 bg-indigo-950/50 border-b border-indigo-500/20 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableSearch}
              onChange={(e) => setEnableSearch(e.target.checked)}
              className="rounded accent-amber-400 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-indigo-200 text-[11px] font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              Live Google Search Grounding for current health & hospital info
            </span>
          </label>

          <span className="text-[10px] text-indigo-300/60 font-mono">
            Powered by gemini-3.8-flash & gemini-3.8-flash-lite-tts
          </span>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {turns.map((turn) => {
            const isUser = turn.sender === 'user';
            const isPlaying = currentlyPlayingAudio === turn.id;

            return (
              <div
                key={turn.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700 rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">
                      {isUser ? 'You (Spoken)' : 'Sahaaya Voice Care'}
                    </span>
                    <span className="text-[10px] text-slate-400">{turn.timestamp}</span>
                  </div>

                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </p>

                  {/* Grounding web sources */}
                  {turn.sources && turn.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/80">
                      <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-amber-400" />
                        Google Search Verified Citations:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {turn.sources.slice(0, 3).map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400/30 text-[10px] text-indigo-200 font-semibold transition-colors"
                          >
                            <span className="truncate max-w-[160px]">{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Play Voice Button */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playVoiceTurn(turn.id, turn.audioBase64, turn.text)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Play Voice Guide</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-xs font-semibold animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{statusMessage || 'Gemini is processing your query...'}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Voice Questions */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 overflow-x-auto flex gap-1.5">
          {quickVoicePrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendText(q)}
              className="shrink-0 px-3 py-1 rounded-xl bg-slate-800 hover:bg-indigo-900/60 border border-slate-700 text-indigo-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Bottom Interactive Voice Controller & Input */}
        <div className="p-4 sm:p-5 border-t border-indigo-500/20 bg-slate-950">
          {/* Large Voice Recording Orb Button */}
          <div className="flex flex-col items-center justify-center space-y-2 mb-3">
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isProcessing}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer select-none active:scale-95 ${
                isRecording
                  ? 'bg-rose-500 text-white animate-bounce shadow-rose-500/40 ring-8 ring-rose-500/20'
                  : 'bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 text-slate-950 hover:scale-105 shadow-amber-500/30'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <Mic className="w-8 h-8 stroke-[2.5]" />
              )}
            </button>

            <span className="text-xs font-black text-center tracking-wide">
              {isRecording ? (
                <span className="text-rose-400 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Recording voice... Tap to finish &amp; speak to Gemini
                </span>
              ) : (
                <span className="text-amber-300">
                  Tap microphone to talk • Gemini transcribes &amp; answers aloud
                </span>
              )}
            </span>
          </div>

          {/* Text input alternative */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'Telugu'
                  ? 'లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                  : language === 'Hindi'
                  ? 'या अपना सवाल यहाँ टाइप करें...'
                  : 'Or type your question here...'
              }
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-medium text-white placeholder:text-slate-500 focus:outline-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
