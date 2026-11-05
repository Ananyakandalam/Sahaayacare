import React, { useState, useRef, useEffect } from 'react';
import { PatientHealthProfile } from '../types/user';
import {
  User,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  PhoneCall,
  Stethoscope,
  Pill,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Users,
  Droplet,
  Ticket,
  Building2,
  BookOpen,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { linkEmailPasswordToCurrentUser } from '../services/firestoreSync';
import { audioPlayer } from '../utils/audioPlayer';

interface UserProfileMenuProps {
  profile: PatientHealthProfile | null;
  onEditProfile: () => void;
  onOpenTablets: () => void;
  onNewEnrollment: () => void;
  onSignOut: () => void;
  onSwitchProfile?: () => void;
  onOpenBloodDonor?: () => void;
  onOpenOpdQueue?: () => void;
  onOpenRuralHealth?: () => void;
  onOpenDiseaseDetails?: () => void;
  selectedLanguage: string;
}

export function UserProfileMenu({
  profile,
  onEditProfile,
  onOpenTablets,
  onNewEnrollment,
  onSignOut,
  onSwitchProfile,
  onOpenBloodDonor,
  onOpenOpdQueue,
  onOpenRuralHealth,
  onOpenDiseaseDetails,
  selectedLanguage,
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = auth.currentUser;
  const hasPasswordProvider = currentUser?.providerData?.some((p) => p.providerId === 'password');
  const targetEmail = currentUser?.email || profile?.email || '';

  const handleLinkPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setLinkError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLinkError('Passwords do not match.');
      return;
    }

    setIsLinking(true);
    try {
      const res = await linkEmailPasswordToCurrentUser(newPassword, profile?.email);
      setLinkSuccess(res.message);
      audioPlayer.playChime('success');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        setLinkSuccess('');
      }, 2200);
    } catch (err: any) {
      setLinkError(err.message || 'Could not link password. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTelugu = selectedLanguage === 'Telugu';
  const isHindi = selectedLanguage === 'Hindi';

  if (!profile) {
    return null;
  }

  const conditionSnippet =
    profile.selectedConditions.length > 0
      ? profile.selectedConditions.slice(0, 2).join(' & ')
      : 'Care Account';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200 text-left transition-all cursor-pointer shadow-2xs group"
        title="View patient profile and settings"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
          {profile.preferredName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-900 leading-tight">
              {profile.preferredName}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
              {profile.age}y
            </span>
          </div>
          <p className="text-[10px] font-semibold text-indigo-700 capitalize truncate max-w-[110px]">
            {profile.familyMemberLabel || conditionSnippet}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-indigo-700 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800">
          {/* Header Summary */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                {profile.preferredName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-black text-slate-950 block truncate">
                  {profile.fullName}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {profile.familyMemberLabel ? `Family: ${profile.familyMemberLabel}` : (profile.email || profile.phoneNumber || 'Local Profile')}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>{profile.age} yrs • {profile.gender}</span>
              <span className="text-indigo-600">
                {profile.cannotRead ? '🗣️ Spoken Guide' : 'Standard'}
              </span>
            </div>
          </div>

          {/* Quick Emergency Phone */}
          {profile.emergencyContact?.phone && (
            <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs font-bold text-rose-900 mb-2">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>{profile.emergencyContact.relation}:</span>
                <span className="font-black">{profile.emergencyContact.phone}</span>
              </div>
            </div>
          )}

          {/* Quick Switch Family Member (No Email needed) */}
          {onSwitchProfile && (
            <div className="mb-2 p-1.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSwitchProfile();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {isTelugu ? 'కుటుంబ సభ్యుడిని మార్చండి' : 'Switch Family Member'}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded-md">
                  No Email
                </span>
              </button>
            </div>
          )}

          {/* New Feature Quick Links */}
          <div className="space-y-1 text-xs font-black">
            {onOpenBloodDonor && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenBloodDonor();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 transition-colors text-left cursor-pointer"
              >
                <Droplet className="w-4 h-4 text-rose-600 fill-rose-100" />
                <span>
                  {isTelugu ? 'రక్తదాతల శోధన (Blood Donor)' : isHindi ? 'ब्लड डोनर खोज' : 'Blood Donor Search'}
                </span>
              </button>
            )}

            {onOpenOpdQueue && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenOpdQueue();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-800 transition-colors text-left cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-blue-600" />
                <span>
                  {isTelugu ? 'ఓపీడీ క్యూ & లైవ్ టోకెన్ (OPD Queue)' : isHindi ? 'ओपीडी कतार और टोकन' : 'OPD Queue & Digital Slip'}
                </span>
              </button>
            )}

            {onOpenRuralHealth && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenRuralHealth();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-teal-50 text-teal-800 transition-colors text-left cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>
                  {isTelugu ? 'గ్రామీణ ఆరోగ్య సేవలు (Rural Health)' : isHindi ? 'ग्रामीण स्वास्थ्य सेवाएं' : 'Rural Health Access (PHCs & ASHA)'}
                </span>
              </button>
            )}

            {onOpenDiseaseDetails && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDiseaseDetails();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 transition-colors text-left cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>
                  {isTelugu ? 'వ్యాధుల సమగ్ర వివరాలు (Disease Guide)' : isHindi ? 'रोगों की संपूर्ण जानकारी' : 'In-Depth Disease Guide'}
                </span>
              </button>
            )}

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEditProfile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>
                {isTelugu ? 'ఆరోగ్య వివరాలు మార్చండి' : isHindi ? 'स्वास्थ्य प्रोफाइल बदलें' : 'Edit Health Profile & Questions'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenTablets();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
            >
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>
                {isTelugu ? 'నా మాత్రలు & ప్రిస్క్రిప్షన్లు' : isHindi ? 'मेरी दवाइयां' : 'Manage My Tablets & Prescriptions'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNewEnrollment();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span>
                {isTelugu ? 'కొత్త రోగి నమోదు (New Enrollment)' : 'Enroll Another Patient'}
              </span>
            </button>

            {/* Email & Password Linking Option (Works for Google OAuth & Email users) */}
            {targetEmail && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-900 transition-colors text-left cursor-pointer group"
                title="Set or update password to enable both Google and Email login"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>
                    {hasPasswordProvider
                      ? (isTelugu ? 'పాస్‌వర్డ్ మార్చండి' : 'Change Email Password')
                      : (isTelugu ? 'ఈమెయిల్ పాస్‌వర్డ్ సెట్ చేయండి' : 'Set Password for Email Login')}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 font-black">
                  {hasPasswordProvider ? 'Linked' : 'Google User'}
                </span>
              </button>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-800 flex items-center justify-between my-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore Realtime Sync</span>
              </span>
              <span className="text-emerald-700 font-semibold">Active</span>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>
                  {isTelugu ? 'సైన్ అవుట్ (Sign Out)' : isHindi ? 'साइन आउट करें' : 'Sign Out'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Password / Link Email Credential Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    {hasPasswordProvider ? 'Update Email Password' : 'Set Password for Email Login'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentUser?.providerData?.some(p => p.providerId === 'google.com')
                      ? 'Link password to your Google account'
                      : 'Secure your medical account credentials'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setLinkError('');
                  setLinkSuccess('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Account: {targetEmail}</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                By setting a password, you can sign in with either your Google account OR with this email & password from any browser.
              </p>
            </div>

            <form onSubmit={handleLinkPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setLinkError('');
                      setNewPassword(e.target.value);
                    }}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setLinkError('');
                    setConfirmPassword(e.target.value);
                  }}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-indigo-600"
                />
              </div>

              {linkError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{linkError}</span>
                </div>
              )}

              {linkSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{linkSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isLinking ? 'Linking...' : 'Save & Link Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
