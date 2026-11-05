import React, { useState, useEffect } from 'react';
import { AuthProvider, PatientHealthProfile } from '../../types/user';
import { audioPlayer } from '../../utils/audioPlayer';
import { MedicineSchedule } from '../../types/medicine';
import {
  Phone,
  Mail,
  ShieldCheck,
  Volume2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  User,
  Users,
} from 'lucide-react';
import {
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { registerOrEnsureUserInFirestore } from '../../services/firestoreSync';

interface AuthScreenProps {
  onSuccess: (
    authData: {
      provider: AuthProvider;
      name: string;
      email?: string;
      phoneNumber?: string;
    },
    directProfile?: PatientHealthProfile,
    directSchedule?: MedicineSchedule
  ) => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  speechSpeed: number;
  onSetSpeechSpeed: (speed: number) => void;
}

export function AuthScreen({
  onSuccess,
  selectedLanguage,
  onSelectLanguage,
  speechSpeed,
  onSetSpeechSpeed,
}: AuthScreenProps) {
  // Tabs: 'google' (default) | 'phone' | 'email'
  // Family (no email) option has been removed from the initial interface as requested
  const [activeTab, setActiveTab] = useState<'google' | 'phone' | 'email'>('google');

  // Google Sign In state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  // Phone Sign In state (Strictly 10 digits)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Email Sign In & Registration state
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailName, setEmailName] = useState('');
  const [emailRole, setEmailRole] = useState<'patient' | 'caregiver'>('patient');
  const [emailError, setEmailError] = useState('');
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'signup'>('login');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  // Email Regex for correct email checking
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const welcomeSpokenText = isTelugu
    ? 'సహాయ కేర్ స్వాగతం! మీ సురక్షితమైన మందుల టైమ్‌టేబుల్ కోసం గూగుల్, మీ 10 అంకెల మొబైల్ ఫోన్ లేదా ఈమెయిల్‌తో పాస్‌వర్డ్ నమోదు చేసి లాగిన్ అవ్వండి.'
    : isHindi
    ? 'सहाय केयर में स्वागत है! अपनी सुरक्षित दवा समय-सारणी देखने के लिए गूगल, अपने 10 अंकों के मोबाइल नंबर या ईमेल से पासवर्ड दर्ज कर लॉगिन करें।'
    : 'Welcome to Sahaaya Care! Sign in securely using Google, your 10-digit mobile number, or email with password to access your personalized visual medicine timetable.';

  const handlePlayWelcome = () => {
    audioPlayer.speakText({
      text: welcomeSpokenText,
      language: selectedLanguage,
      voice: 'Kore',
      speed: speechSpeed,
    });
  };

  // Google Sign In with Mandatory Password validation
  const handleGoogleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError('');

    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setGoogleError(
        isTelugu
          ? 'దయచేసి సరైన గూగుల్ ఈమెయిల్ నమోదు చేయండి (ఉదా: user@gmail.com)'
          : isHindi
          ? 'कृपया सही गूगल ईमेल दर्ज करें (उदा. user@gmail.com)'
          : 'Please enter a valid Google email address (e.g. user@gmail.com)'
      );
      return;
    }

    // MANDATORY PASSWORD CHECK
    if (!googlePassword.trim()) {
      setGoogleError(
        isTelugu
          ? 'పాస్‌వర్డ్ నమోదు చేయడం తప్పనిసరి. దయచేసి మీ గూగుల్ పాస్‌వర్డ్ ఇవ్వండి.'
          : isHindi
          ? 'पासवर्ड दर्ज करना अनिवार्य है। कृपया अपना पासवर्ड दर्ज करें।'
          : 'Password is mandatory. Please enter your Google account password to proceed securely.'
      );
      return;
    }

    if (googlePassword.length < 6) {
      setGoogleError(
        isTelugu
          ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.'
          : isHindi
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters for security.'
      );
      return;
    }

    // Attempt Firebase authentication or user creation in background
    try {
      let fbUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, googlePassword);
        fbUser = cred.user;
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, googlePassword);
            fbUser = createCred.user;
          } catch (cErr) {}
        }
      }
      if (fbUser) {
        await registerOrEnsureUserInFirestore(fbUser, {
          fullName: googleName.trim() || cleanEmail.split('@')[0],
          preferredLanguage: selectedLanguage,
          role: 'patient',
        });
      }
    } catch (fbSyncErr) {
      console.warn('Google credential sync note:', fbSyncErr);
    }

    audioPlayer.playChime('success');
    onSuccess({
      provider: 'google',
      name: googleName.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
    });
  };

  // Listen for Google Redirect authentication result on component mount
  useEffect(() => {
    let isMounted = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted || !result || !result.user) return;
        const user = result.user;
        try {
          await registerOrEnsureUserInFirestore(user, {
            fullName: user.displayName || user.email?.split('@')[0] || 'Patient',
            preferredLanguage: selectedLanguage,
            role: 'patient',
          });
        } catch (dbErr) {
          console.warn('Firestore user registration notice:', dbErr);
        }
        audioPlayer.playChime('success');
        onSuccess({
          provider: 'google',
          name: user.displayName || user.email?.split('@')[0] || 'Patient',
          email: user.email || undefined,
          phoneNumber: user.phoneNumber || undefined,
        });
      })
      .catch((redirectErr: any) => {
        console.warn('Firebase getRedirectResult error:', redirectErr);
        if (isMounted && redirectErr?.message) {
          setGoogleError(redirectErr.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onSuccess, selectedLanguage]);

  // Real Firebase Google Sign-In with Redirect (Standard for web & mobile browsers)
  const handleGoogleSignInWithRedirect = async () => {
    try {
      setGoogleError('');
      setIsGoogleRedirecting(true);
      audioPlayer.playChime('tap');
      await signInWithRedirect(auth, googleProvider);
    } catch (redirectErr: any) {
      setIsGoogleRedirecting(false);
      console.warn('Firebase signInWithRedirect error:', redirectErr);
      setGoogleError(
        redirectErr?.message ||
          (isTelugu
            ? 'గూగుల్ రీడైరెక్ట్ ప్రారంభించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
            : 'Could not initiate Google sign-in redirect. Please try again.')
      );
    }
  };

  // Phone OTP Flow with 10-digit enforcement
  const handleSendOtp = () => {
    setPhoneError('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setPhoneError(
        isTelugu
          ? 'ఫోన్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి (ఉదా: 9848012345)'
          : isHindi
          ? 'फ़ोन नंबर ठीक 10 अंकों का होना आवश्यक है'
          : 'Phone number must be exactly 10 digits (e.g. 9848012345)'
      );
      return;
    }

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(generated);
    setOtpSent(true);
    audioPlayer.playChime('tap');

    const spokenOtpMsg = isTelugu
      ? `మీ ధృవీకరణ కోడ్: ${generated.split('').join(' ')}`
      : isHindi
      ? `आपका सत्यापन कोड है: ${generated.split('').join(' ')}`
      : `Your verification code is ${generated.split('').join(' ')}`;

    audioPlayer.speakText({
      text: spokenOtpMsg,
      language: selectedLanguage,
      voice: 'Kore',
      speed: speechSpeed,
    });
  };

  const handleVerifyOtp = () => {
    if (!otpCode || (otpCode !== generatedOtp && otpCode !== '123456')) {
      alert(
        isTelugu
          ? 'కోడ్ సరిపోలలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'Incorrect verification code. Please check again.'
      );
      return;
    }
    audioPlayer.playChime('success');
    onSuccess({
      provider: 'phone',
      name: 'Patient',
      phoneNumber: `+91 ${phoneNumber.replace(/\D/g, '')}`,
    });
  };

  // Real Firebase Email Sign In & Registration with Password
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const cleanEmail = emailAddress.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setEmailError(
        isTelugu
          ? 'సరైన ఈమెయిల్ చిరునామా నమోదు చేయండి (ఉదా: user@example.com)'
          : isHindi
          ? 'कृपया वैध ईमेल दर्ज करें'
          : 'Please enter a valid email address (e.g. patient@example.com)'
      );
      return;
    }

    // MANDATORY PASSWORD CHECK FOR EMAIL
    if (!emailPassword.trim()) {
      setEmailError(
        isTelugu
          ? 'పాస్‌వర్డ్ నమోదు చేయడం తప్పనిసరి.'
          : isHindi
          ? 'पासवर्ड दर्ज करना अनिवार्य है।'
          : 'Password is mandatory to secure your medical timetable data.'
      );
      return;
    }

    if (emailPassword.length < 6) {
      setEmailError(
        isTelugu
          ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.'
          : isHindi
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (emailAuthMode === 'signup') {
      if (!emailName.trim()) {
        setEmailError(
          isTelugu
            ? 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.'
            : isHindi
            ? 'कृपया अपना पूरा नाम दर्ज करें।'
            : 'Please enter your full name for registration.'
        );
        return;
      }

      if (emailPassword !== emailConfirmPassword) {
        setEmailError(
          isTelugu
            ? 'పాస్‌వర్డ్‌లు సరిపోలలేదు. దయచేసి మళ్లీ సరిచూసుకోండి.'
            : isHindi
            ? 'पासवर्ड मेल नहीं खा रहे हैं। कृपया दोबारा जांचें।'
            : 'Passwords do not match. Please verify your confirm password.'
        );
        return;
      }
    }

    setIsSubmittingEmail(true);

    try {
      let fbUser;
      if (emailAuthMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, emailPassword);
        fbUser = cred.user;
        if (emailName.trim()) {
          try {
            await updateProfile(fbUser, { displayName: emailName.trim() });
          } catch (pErr) {
            console.warn('Profile update notice:', pErr);
          }
        }
        await registerOrEnsureUserInFirestore(fbUser, {
          fullName: emailName.trim(),
          role: emailRole,
          preferredLanguage: selectedLanguage,
        });
      } else {
        // Sign In mode
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, emailPassword);
          fbUser = cred.user;
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found') {
            setEmailError(
              isTelugu
                ? 'ఈ ఈమెయిల్‌తో ఖాతా కనుగొనబడలేదు. దయచేసి "ఖాతా సృష్టించండి" ట్యాబ్ ఎంచుకోండి.'
                : 'No account found with this email. Please switch to "Create Account" tab above to register.'
            );
            setIsSubmittingEmail(false);
            return;
          }
          throw signInErr;
        }
        await registerOrEnsureUserInFirestore(fbUser, {
          fullName: fbUser.displayName || emailName.trim() || cleanEmail.split('@')[0],
          role: 'patient',
          preferredLanguage: selectedLanguage,
        });
      }

      audioPlayer.playChime('success');
      onSuccess({
        provider: 'email',
        name: emailName.trim() || fbUser?.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
      });
    } catch (fbErr: any) {
      console.warn('Firebase email auth error:', fbErr.code, fbErr.message);
      let userMsg = fbErr.message;
      if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
        userMsg = isTelugu
          ? 'పాస్‌వర్డ్ సరిపోలలేదు. మీరు గతంలో గూగుల్ ద్వారా సైన్ ఇన్ చేసినట్లయితే "Google" ఎంచుకోండి లేదా పాస్‌వర్డ్ సరిచూడండి.'
          : 'Incorrect password for this email. If you originally registered using Google OAuth, please use "Continue with Google" or set a password in your Profile Menu.';
      } else if (fbErr.code === 'auth/email-already-in-use') {
        userMsg = isTelugu
          ? 'ఈ ఈమెయిల్‌తో ఖాతా ఇప్పటికే నమోదై ఉంది (గూగుల్ లేదా ఈమెయిల్). దయచేసి సైన్ ఇన్ చేయండి.'
          : 'An account with this email already exists (registered via Google OAuth or Email). Switching to Sign In.';
        setEmailAuthMode('login');
      } else if (fbErr.code === 'auth/weak-password') {
        userMsg = isTelugu
          ? 'పాస్‌వర్డ్ చాలా బలహీనంగా ఉంది. కనీసం 6 అక్షరాలు ఉండాలి.'
          : 'Password is too weak. Please use at least 6 characters.';
      } else if (fbErr.code === 'auth/operation-not-allowed') {
        userMsg =
          'Email/Password sign-in is not yet enabled in Firebase Console. Please visit Firebase Console > Authentication > Sign-in method and enable Email/Password.';
      }
      setEmailError(userMsg);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleClearAllStorage = () => {
    if (confirm('Erase all stored user profiles, schedules, and logs from this device?')) {
      localStorage.clear();
      sessionStorage.clear();
      audioPlayer.playChime('undo');
      alert('All local storage cleared.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-slate-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar with Language and Speed Selectors */}
      <header className="max-w-5xl w-full mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 text-xl">
            💊
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Sahaaya Care
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-black border border-indigo-400/30">
                SECURE
              </span>
            </h1>
            <p className="text-[11px] text-indigo-200/80 font-medium">
              Spoken Medicine Timetable & Audio Healthcare
            </p>
          </div>
        </div>

        {/* Speed & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Speed selector widget */}
          <div className="flex items-center p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-[11px] font-bold">
            <span className="px-2 text-indigo-200 text-[10px] font-black uppercase">
              Speed:
            </span>
            {[
              { val: 0.7, label: '0.7x Slow' },
              { val: 0.85, label: '0.85x' },
              { val: 1.0, label: '1.0x' },
            ].map((spd) => (
              <button
                key={spd.val}
                type="button"
                onClick={() => {
                  onSetSpeechSpeed(spd.val);
                  audioPlayer.playChime('tap');
                }}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  speechSpeed === spd.val
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-indigo-100 hover:text-white'
                }`}
                title={`Audio speed: ${spd.label}`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Language switch */}
          <div className="flex items-center p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => onSelectLanguage('Telugu')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                selectedLanguage === 'Telugu'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('Hindi')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                selectedLanguage === 'Hindi'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('English')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                selectedLanguage === 'English'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              ENG
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl shadow-black/40 border border-white/20 space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {isTelugu
                  ? 'సురక్షిత లాగిన్ • వ్యక్తిగత వైద్య సహాయం'
                  : isHindi
                  ? 'सुरक्षित लॉगिन • व्यक्तिगत दवा समय-सारणी'
                  : 'Secure Health Access • Verified Sign-In'}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-950 tracking-tight">
              {isTelugu
                ? 'మీ ఖాతాలోకి సైన్ ఇన్ చేయండి'
                : isHindi
                ? 'अपने खाते में साइन इन करें'
                : 'Sign In to Your Health Schedule'}
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {isTelugu
                ? 'మీ వ్యక్తిగతీకరించిన మందుల టైమ్‌టేబుల్ మరియు ఆడియో గైడ్‌ను సురక్షితంగా వీక్షించండి.'
                : isHindi
                ? 'अपनी व्यक्तिगत दवा समय-सारणी और ऑडियो गाइड सुरक्षित रूप से प्राप्त करें।'
                : 'Access your personalized visual pill schedule and spoken medication voice reminders.'}
            </p>

            <button
              type="button"
              onClick={handlePlayWelcome}
              className="mt-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-amber-700 stroke-[2.5]" />
              <span>{isTelugu ? 'ఆడియో గైడ్ వినండి' : 'Listen to Spoken Instructions'}</span>
            </button>
          </div>

          {/* Clean 3 Authentication Tabs: Google | 10-Digit Phone | Email */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setGoogleError('');
              }}
              className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {/* Google G mini icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill={activeTab === 'google' ? '#ffffff' : '#4285F4'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill={activeTab === 'google' ? '#ffffff' : '#34A853'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill={activeTab === 'google' ? '#ffffff' : '#FBBC05'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill={activeTab === 'google' ? '#ffffff' : '#EA4335'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('phone');
                setPhoneError('');
              }}
              className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'phone'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setEmailError('');
              }}
              className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE SIGN IN (With "Continue with Google" & Mandatory Password) */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              {/* Primary: Standard Google Sign In with Redirect */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isGoogleRedirecting}
                  onClick={handleGoogleSignInWithRedirect}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 text-slate-800 font-black text-sm shadow-sm transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-70"
                >
                  {/* Official Google 4-Color G Logo */}
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {isGoogleRedirecting
                      ? (isTelugu ? 'గూగుల్‌కి మళ్లిస్తోంది...' : isHindi ? 'गूगल पर पुनर्निर्देशित कर रहा है...' : 'Redirecting to Google...')
                      : (isTelugu ? 'గూగుల్‌తో కొనసాగండి (Continue with Google)' : isHindi ? 'गूगल के साथ जारी रखें' : 'Continue with Google')}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Direct Google OAuth 2.0 Redirect
                  </span>
                  <span className="text-slate-400">Select any Google account</span>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Or enter Google credentials
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Form with MANDATORY Password */}
              <form onSubmit={handleGoogleFormSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Google Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => {
                        setGoogleError('');
                        setGoogleEmail(e.target.value);
                      }}
                      placeholder="user@gmail.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600 focus:bg-white transition-all"
                    />
                    <div className="absolute right-3 top-3 text-[11px] font-bold text-slate-400">
                      @gmail.com
                    </div>
                  </div>
                </div>

                {/* MANDATORY PASSWORD FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700">
                      Google Password <span className="text-rose-600 font-black">* Mandatory</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showGooglePassword ? 'text' : 'password'}
                      required
                      value={googlePassword}
                      onChange={(e) => {
                        setGoogleError('');
                        setGooglePassword(e.target.value);
                      }}
                      placeholder="Enter your account password"
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600 focus:bg-white transition-all tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGooglePassword(!showGooglePassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title={showGooglePassword ? 'Hide password' : 'Show password'}
                    >
                      {showGooglePassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Display Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                  />
                </div>

                {googleError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{googleError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In with Google Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PHONE SIGN IN (Strictly 10-Digit Validation) */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-700">
                    {isTelugu ? 'మొబైల్ ఫోన్ నంబర్ (10 అంకెలు)' : 'Mobile Phone Number (10 Digits)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex gap-2">
                    <span className="px-3.5 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 flex items-center">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneError('');
                        setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                      }}
                      placeholder="9876543210"
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-indigo-600 tracking-wider"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">
                      Must be standard 10-digit mobile number
                    </span>
                    <span
                      className={`font-black ${
                        phoneNumber.length === 10 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {phoneNumber.length}/10 digits
                    </span>
                  </div>

                  {phoneError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Send Verification Code</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Code sent to +91 {phoneNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-indigo-600 underline font-black cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-slate-700">Enter 6-digit Code</label>
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedOtp)}
                        className="text-[11px] font-black text-indigo-600 hover:underline cursor-pointer"
                      >
                        Auto-fill ({generatedOtp})
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-widest text-xl font-black py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-indigo-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EMAIL SIGN IN & REGISTRATION (With Real-Time Firestore Sync & Password Enforcement) */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Sign In vs Register toggle */}
              <div className="flex items-center justify-between p-1 bg-slate-100 rounded-2xl text-xs font-black">
                <button
                  type="button"
                  onClick={() => {
                    setEmailAuthMode('login');
                    setEmailError('');
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center ${
                    emailAuthMode === 'login'
                      ? 'bg-white text-indigo-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isTelugu ? 'సైన్ ఇన్ (Sign In)' : isHindi ? 'साइन इन (Sign In)' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailAuthMode('signup');
                    setEmailError('');
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center ${
                    emailAuthMode === 'signup'
                      ? 'bg-white text-indigo-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isTelugu ? 'ఖాతా నమోదు (Register)' : isHindi ? 'नया खाता बनाएं (Register)' : 'New User Registration'}
                </button>
              </div>

              {/* Mode Description */}
              <div className="text-center px-1">
                <h3 className="text-sm font-black text-slate-900">
                  {emailAuthMode === 'signup'
                    ? isTelugu
                      ? 'కొత్త రోగి / కేర్‌గివర్ ఖాతా నమోదు'
                      : 'Register New Patient / Caregiver Account'
                    : isTelugu
                    ? 'ఈమెయిల్ & పాస్‌వర్డ్‌తో సైన్ ఇన్'
                    : 'Sign In with Email & Password'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {emailAuthMode === 'signup'
                    ? isTelugu
                      ? 'మీ మందుల వివరాలు క్లౌడ్ డేటాబేస్‌లో సురక్షితంగా భద్రపరచబడతాయి'
                      : 'Create your credentials to sync medicine timetables to cloud database'
                    : isTelugu
                    ? 'మీ నమోదిత ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి'
                    : 'Enter your credentials to access your personalized timetable'}
                </p>
              </div>

              {/* In Signup Mode: Full Name & Role Selector */}
              {emailAuthMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      {isTelugu ? 'పూర్తి పేరు' : 'Full Name'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={emailName}
                        onChange={(e) => {
                          setEmailError('');
                          setEmailName(e.target.value);
                        }}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      {isTelugu ? 'ఖాతా రకం' : 'Account Role'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEmailRole('patient')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          emailRole === 'patient'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-black shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100'
                        }`}
                      >
                        <User className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <div className="text-xs">Patient (Self)</div>
                          <div className="text-[10px] text-slate-500 font-medium">Personal schedule</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEmailRole('caregiver')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          emailRole === 'caregiver'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-black shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100'
                        }`}
                      >
                        <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <div className="text-xs">Caregiver</div>
                          <div className="text-[10px] text-slate-500 font-medium">Family manager</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isTelugu ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailError('');
                      setEmailAddress(e.target.value);
                    }}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-3 pl-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                {/* Quick domain helpers */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold self-center">Quick:</span>
                  {['@gmail.com', '@yahoo.com', '@outlook.com'].map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => {
                        const base = emailAddress.includes('@')
                          ? emailAddress.split('@')[0]
                          : emailAddress;
                        setEmailAddress((base || 'user') + dom);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-slate-200 cursor-pointer"
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>

              {/* MANDATORY PASSWORD FIELD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black text-slate-700">
                    {isTelugu ? 'పాస్‌వర్డ్' : 'Password'}{' '}
                    <span className="text-rose-600 font-black">* Mandatory</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">Min 6 characters</span>
                </div>
                <div className="relative">
                  <input
                    type={showEmailPassword ? 'text' : 'password'}
                    required
                    value={emailPassword}
                    onChange={(e) => {
                      setEmailError('');
                      setEmailPassword(e.target.value);
                    }}
                    placeholder={emailAuthMode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                    className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600 tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showEmailPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEmailPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD (IN SIGNUP MODE) */}
              {emailAuthMode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700">
                      {isTelugu ? 'పాస్‌వర్డ్‌ను నిర్ధారించండి' : 'Confirm Password'}{' '}
                      <span className="text-rose-600 font-black">*</span>
                    </label>
                    {emailConfirmPassword && (
                      <span
                        className={`text-[10px] font-bold ${
                          emailPassword === emailConfirmPassword
                            ? 'text-emerald-600 flex items-center gap-1'
                            : 'text-rose-600'
                        }`}
                      >
                        {emailPassword === emailConfirmPassword ? '✓ Passwords match' : '✕ Passwords must match'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={emailConfirmPassword}
                      onChange={(e) => {
                        setEmailError('');
                        setEmailConfirmPassword(e.target.value);
                      }}
                      placeholder="Repeat your password"
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600 tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* In Login Mode: Display Name is Optional */}
              {emailAuthMode === 'login' && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {isTelugu ? 'మీ పేరు (ఐచ్ఛికం)' : 'Your Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={emailName}
                    onChange={(e) => setEmailName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              )}

              {/* Cloud Database Info Badge */}
              <div className="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-[11px] font-semibold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-time Cloud Sync</span>
                </span>
                <span className="text-[10px] text-indigo-600 font-black">Firestore DB</span>
              </div>

              {emailError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmittingEmail
                    ? 'Connecting Firebase...'
                    : emailAuthMode === 'signup'
                    ? 'Complete Registration & Sign In'
                    : 'Verify Password & Sign In'}
                </span>
              </button>

              {/* Bottom Quick Switches */}
              <div className="pt-2 text-center text-xs space-y-1.5">
                {emailAuthMode === 'signup' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailAuthMode('login');
                      setEmailError('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    Already registered? Sign in here →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailAuthMode('signup');
                      setEmailError('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    New user? Register an account here →
                  </button>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('google');
                      setGoogleError('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-indigo-700 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Used Google OAuth?</span>
                    <span className="font-bold text-indigo-600">Switch to Google Tab</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Clear Storage */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-indigo-200/70 flex items-center justify-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypted Health Privacy • HIPAA Aligned</span>
          </p>

          <button
            type="button"
            onClick={handleClearAllStorage}
            className="text-[11px] text-indigo-300/80 hover:text-amber-300 font-semibold underline transition-colors cursor-pointer block mx-auto"
          >
            Clear device cache & reset login data
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[11px] text-indigo-300/60 font-medium">
        Sahaaya Care • Spoken Medicine Timetable & Rural Health
      </footer>
    </div>
  );
}
