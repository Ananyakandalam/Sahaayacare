import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  User as FirebaseUser,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { PatientHealthProfile } from '../types/user';
import { MedicineSchedule } from '../types/medicine';

export interface SyncedUserData {
  profile: PatientHealthProfile | null;
  schedule: MedicineSchedule | null;
  takenLogs: Record<string, boolean>;
}

// Module-level quota guard: if daily free write quota is reached, gracefully suppress further writes
let isQuotaExhausted = false;

export function getIsFirestoreQuotaExhausted(): boolean {
  return isQuotaExhausted;
}

// Automatically register or ensure user exists in Firestore (works for Google OAuth and Email/Password users)
export async function registerOrEnsureUserInFirestore(
  user: FirebaseUser,
  extra?: { fullName?: string; role?: 'patient' | 'caregiver'; preferredLanguage?: string }
): Promise<void> {
  if (isQuotaExhausted) return;
  const docPath = `users/${user.uid}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        fullName: extra?.fullName || user.displayName || 'Patient',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: extra?.role || 'patient',
        preferredLanguage: extra?.preferredLanguage || 'English',
        updatedAt: new Date().toISOString(),
      });
    } else if (extra?.fullName || extra?.role || extra?.preferredLanguage) {
      const existing = userSnap.data();
      await setDoc(
        doc(db, 'users', user.uid),
        {
          userId: user.uid,
          fullName: extra.fullName || existing.fullName || user.displayName || 'Patient',
          email: user.email || existing.email || '',
          phoneNumber: user.phoneNumber || existing.phoneNumber || '',
          role: extra.role || existing.role || 'patient',
          preferredLanguage: extra.preferredLanguage || existing.preferredLanguage || 'English',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
      isQuotaExhausted = true;
      console.warn('Firestore daily write quota reached. Local persistence active.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Link email/password credentials to currently logged in user (e.g. for Google OAuth users who want password login)
export async function linkEmailPasswordToCurrentUser(
  password: string,
  fallbackEmail?: string
): Promise<{ success: boolean; message: string }> {
  const currentUser = auth.currentUser;
  const targetEmail = currentUser?.email || fallbackEmail;

  if (!targetEmail) {
    throw new Error('No authenticated user with an email address found.');
  }

  if (currentUser && currentUser.email) {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await linkWithCredential(currentUser, credential);
      await registerOrEnsureUserInFirestore(currentUser);
      return {
        success: true,
        message: `Successfully linked password to your Google account (${currentUser.email}). You can now log in using either Google or your email & password.`,
      };
    } catch (err: any) {
      if (
        err.code === 'auth/provider-already-linked' ||
        err.code === 'auth/credential-already-in-use'
      ) {
        await updatePassword(currentUser, password);
        await registerOrEnsureUserInFirestore(currentUser);
        return {
          success: true,
          message: `Password updated for ${currentUser.email}. You can now sign in using your updated password.`,
        };
      }
      throw err;
    }
  }

  // If no auth.currentUser exists yet (e.g. simulated session or offline mode), register account in Firebase
  try {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(auth, targetEmail, password);
    await registerOrEnsureUserInFirestore(cred.user, {
      fullName: cred.user.displayName || 'Patient',
      role: 'patient',
    });
    return {
      success: true,
      message: `Account created and password registered for ${targetEmail}.`,
    };
  } catch (regErr: any) {
    if (regErr.code === 'auth/email-already-in-use') {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const loginCred = await signInWithEmailAndPassword(auth, targetEmail, password);
      await registerOrEnsureUserInFirestore(loginCred.user);
      return {
        success: true,
        message: `Account verified and password connected for ${targetEmail}.`,
      };
    }
    throw regErr;
  }
}

// Save or update user profile to Firestore
export async function syncUserProfileToFirestore(profile: PatientHealthProfile): Promise<void> {
  if (isQuotaExhausted) return;
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;

  const docPath = `users/${currentUid}`;
  try {
    await setDoc(doc(db, 'users', currentUid), {
      userId: currentUid,
      fullName: profile.fullName || 'Patient',
      email: profile.email || auth.currentUser?.email || '',
      phoneNumber: profile.phoneNumber || '',
      role: profile.role === 'caregiver_for_patient' ? 'caregiver' : 'patient',
      preferredLanguage: profile.primaryLanguage || 'English',
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
      isQuotaExhausted = true;
      console.warn('Firestore write quota reached. Local persistence active.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Save or update 7-day schedule to Firestore
export async function syncScheduleToFirestore(schedule: MedicineSchedule): Promise<void> {
  if (isQuotaExhausted) return;
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;

  const docPath = `schedules/${currentUid}`;
  try {
    await setDoc(doc(db, 'schedules', currentUid), {
      userId: currentUid,
      regimenTitle: schedule.regimenTitle || '7-Day Care Regimen',
      spokenOverview: schedule.spokenOverview || '',
      medicinesJson: JSON.stringify(schedule.medicines || []),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
      isQuotaExhausted = true;
      console.warn('Firestore write quota reached. Operating in local storage mode.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Save adherence taken logs to Firestore
export async function syncAdherenceToFirestore(takenLogs: Record<string, boolean>): Promise<void> {
  if (isQuotaExhausted) return;
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;

  const docPath = `adherence/${currentUid}`;
  try {
    await setDoc(doc(db, 'adherence', currentUid), {
      userId: currentUid,
      takenLogsJson: JSON.stringify(takenLogs),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
      isQuotaExhausted = true;
      console.warn('Firestore write quota reached. Operating in local storage mode.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Load user data from Firestore on sign-in
export async function loadUserDataFromFirestore(userId: string): Promise<Partial<SyncedUserData>> {
  const result: Partial<SyncedUserData> = {};

  // Load Schedule
  const schedulePath = `schedules/${userId}`;
  try {
    const schedSnap = await getDoc(doc(db, 'schedules', userId));
    if (schedSnap.exists()) {
      const data = schedSnap.data();
      const medicines = JSON.parse(data.medicinesJson || '[]');
      result.schedule = {
        regimenTitle: data.regimenTitle,
        patientName: data.patientName || 'Patient',
        patientNotes: 'Synced from cloud database',
        spokenOverview: data.spokenOverview || '',
        medicines,
      };
    }
  } catch (error: any) {
    console.warn('Could not load schedule from Firestore (using local storage):', error?.message || error);
  }

  // Load Adherence
  const adherencePath = `adherence/${userId}`;
  try {
    const adhSnap = await getDoc(doc(db, 'adherence', userId));
    if (adhSnap.exists()) {
      const data = adhSnap.data();
      result.takenLogs = JSON.parse(data.takenLogsJson || '{}');
    }
  } catch (error: any) {
    console.warn('Could not load adherence from Firestore (using local storage):', error?.message || error);
  }

  return result;
}

// Subscribe to real-time schedule updates for logged-in user
export function subscribeToSchedule(
  userId: string,
  onUpdate: (schedule: MedicineSchedule) => void
): () => void {
  const schedulePath = `schedules/${userId}`;
  const unsubscribe = onSnapshot(
    doc(db, 'schedules', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        try {
          const medicines = JSON.parse(data.medicinesJson || '[]');
          onUpdate({
            regimenTitle: data.regimenTitle,
            patientName: data.patientName || 'Patient',
            patientNotes: 'Cloud Synced',
            spokenOverview: data.spokenOverview || '',
            medicines,
          });
        } catch (e) {
          console.warn('Error parsing medicines from snapshot:', e);
        }
      }
    },
    (error) => {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
        isQuotaExhausted = true;
        console.warn('Firestore subscription quota reached; local storage mode active.');
        return;
      }
      handleFirestoreError(error, OperationType.GET, schedulePath);
    }
  );

  return unsubscribe;
}

// Subscribe to real-time adherence updates
export function subscribeToAdherence(
  userId: string,
  onUpdate: (takenLogs: Record<string, boolean>) => void
): () => void {
  const adherencePath = `adherence/${userId}`;
  const unsubscribe = onSnapshot(
    doc(db, 'adherence', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        try {
          const logs = JSON.parse(data.takenLogsJson || '{}');
          onUpdate(logs);
        } catch (e) {
          console.warn('Error parsing adherence logs:', e);
        }
      }
    },
    (error) => {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
        isQuotaExhausted = true;
        console.warn('Firestore subscription quota reached; local storage mode active.');
        return;
      }
      handleFirestoreError(error, OperationType.GET, adherencePath);
    }
  );
  return unsubscribe;
}

// Subscribe to real-time user profile updates
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: Partial<PatientHealthProfile>) => void
): () => void {
  const userPath = `users/${userId}`;
  const unsubscribe = onSnapshot(
    doc(db, 'users', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate({
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          primaryLanguage: data.preferredLanguage,
        });
      }
    },
    (error) => {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota')) {
        isQuotaExhausted = true;
        return;
      }
      handleFirestoreError(error, OperationType.GET, userPath);
    }
  );
  return unsubscribe;
}
