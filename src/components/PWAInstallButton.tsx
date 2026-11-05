import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, Check, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  selectedLanguage?: string;
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  selectedLanguage = 'English',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  if (isInstalled) {
    return null;
  }

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  const label = isTelugu
    ? 'యాప్ ఇన్‌స్టాల్'
    : isHindi
    ? 'ऐप इंस्टॉल करें'
    : 'Install App';

  const fullLabel = isTelugu
    ? 'మొబైల్ యాప్‌గా ఇన్‌స్టాల్ చేయండి (Install)'
    : isHindi
    ? 'मोबाइल ऐप के रूप में इंस्टॉल करें'
    : 'Install as Mobile App (Android & iOS)';

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowIOSModal(true);
    }
  };

  if (variant === 'banner' && !dismissedBanner) {
    return (
      <>
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-lg border border-indigo-700/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
              📱
            </div>
            <div className="truncate">
              <span className="font-extrabold text-white block truncate">
                {fullLabel}
              </span>
              <span className="text-[11px] text-indigo-200 block truncate">
                {isTelugu
                  ? 'ఆండ్రాయిడ్ లేదా ఐఫోన్‌లో హోమ్ స్క్రీన్‌పై ఉచితంగా ఉంచుకోండి'
                  : isHindi
                  ? 'एंड्रॉयड या आईफोन में होम स्क्रीन पर जोड़ें'
                  : 'Fast offline access on your phone home screen'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClick}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{label}</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissedBanner(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS Modal */}
        {showIOSModal && (
          <IOSInstallModal
            onClose={() => setShowIOSModal(false)}
            selectedLanguage={selectedLanguage}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition active:scale-95"
        title={fullLabel}
      >
        <Smartphone className="w-3.5 h-3.5 stroke-[2.2]" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">App</span>
      </button>

      {showIOSModal && (
        <IOSInstallModal
          onClose={() => setShowIOSModal(false)}
          selectedLanguage={selectedLanguage}
        />
      )}
    </>
  );
};

interface IOSInstallModalProps {
  onClose: () => void;
  selectedLanguage?: string;
}

const IOSInstallModal: React.FC<IOSInstallModalProps> = ({
  onClose,
  selectedLanguage = 'English',
}) => {
  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              📲
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isTelugu
                  ? 'మొబైల్ & ఐఫోన్‌లో ఇన్‌స్టాల్ చేయండి'
                  : isHindi
                  ? 'मोबाइल व iPhone पर इंस्टॉल करें'
                  : 'Install on Mobile & iPhone'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {isTelugu ? 'ఆండ్రాయిడ్ & ఐఓఎస్ సపోర్ట్' : 'Android & iOS Full Support'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0 text-xs">
              1
            </div>
            <div>
              <span className="font-black text-indigo-950 block">
                {isTelugu ? 'సఫారి లేదా క్రోమ్ బ్రౌజర్‌లో షేర్ (Share) బటన్‌ను నొక్కండి:' : 'Tap the Share Button in Safari / Chrome:'}
              </span>
              <p className="text-[11px] text-indigo-800 mt-0.5">
                {isTelugu
                  ? 'మీ స్క్రీన్ క్రింద ఉండే చతురస్రం మరియు బాణం గుర్తు (Share icon) ను తాకండి.'
                  : 'Look at the bottom toolbar for the square icon with an upward arrow.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-xs">
              2
            </div>
            <div>
              <span className="font-black text-amber-950 block">
                {isTelugu ? '"Add to Home Screen" ను ఎంచుకోండి:' : 'Select "Add to Home Screen":'}
              </span>
              <p className="text-[11px] text-amber-900 mt-0.5">
                {isTelugu
                  ? 'క్రిందికి స్క్రోల్ చేసి "హోమ్ స్క్రీన్‌కు జోడించు" (+ Add to Home Screen) నొక్కండి.'
                  : 'Scroll down the list and tap "Add to Home Screen" with the (+) icon.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 text-xs">
              3
            </div>
            <div>
              <span className="font-black text-emerald-950 block">
                {isTelugu ? '"Add" లేదా "చేర్చు" బటన్‌పై నొక్కండి:' : 'Tap "Add" in Top Right:'}
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                {isTelugu
                  ? 'ఇప్పుడు మీ ఫోన్ హోమ్ స్క్రీన్‌పై "సహాయ కేర్" ఒక యాప్‌లా కనిపిస్తుంది! ఇంటర్నెట్ లేకపోయినా సులభంగా తెరవవచ్చు.'
                  : 'Sahaaya Care will appear as a standalone app on your home screen for quick daily access!'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 transition"
        >
          {isTelugu ? 'సరే, అర్థమైంది (Got It)' : 'Got It, Thanks!'}
        </button>
      </div>
    </div>
  );
};
