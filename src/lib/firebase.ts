import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or reuse Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const twitterProvider = new TwitterAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export const microsoftProvider = new OAuthProvider('microsoft.com');

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider?: string;
  handle?: string;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  connectedSocials?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Sync user profile to Firestore
export async function syncUserProfile(user: User, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: additionalData?.displayName || user.displayName || user.email?.split('@')[0] || 'Social Marketer',
        photoURL: additionalData?.photoURL || user.photoURL,
        provider: additionalData?.provider || user.providerData?.[0]?.providerId || 'password',
        handle: additionalData?.handle || `@${(user.displayName || user.email?.split('@')[0] || 'marketer').toLowerCase().replace(/\s+/g, '_')}`,
        phoneNumber: additionalData?.phoneNumber || user.phoneNumber || null,
        emailVerified: additionalData?.emailVerified ?? user.emailVerified ?? false,
        phoneVerified: additionalData?.phoneVerified ?? (!!user.phoneNumber),
        twoFactorEnabled: additionalData?.twoFactorEnabled ?? false,
        connectedSocials: additionalData?.connectedSocials || (additionalData?.provider ? [additionalData.provider] : []),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const data = snap.data() as UserProfile;
      if (additionalData && Object.keys(additionalData).length > 0) {
        const updated: UserProfile = {
          ...data,
          ...additionalData,
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, updated, { merge: true });
        return updated;
      }
      return data;
    }
  } catch (error) {
    console.warn('Could not sync user profile to Firestore, falling back to local Auth object:', error);
    return {
      uid: user.uid,
      email: user.email,
      displayName: additionalData?.displayName || user.displayName || user.email?.split('@')[0] || 'Social Marketer',
      photoURL: additionalData?.photoURL || user.photoURL,
      provider: additionalData?.provider || user.providerData?.[0]?.providerId || 'password',
      handle: additionalData?.handle || `@${(user.displayName || user.email?.split('@')[0] || 'marketer').toLowerCase().replace(/\s+/g, '_')}`,
      phoneNumber: additionalData?.phoneNumber || user.phoneNumber || null,
      emailVerified: additionalData?.emailVerified ?? user.emailVerified ?? false,
      phoneVerified: additionalData?.phoneVerified ?? (!!user.phoneNumber),
      twoFactorEnabled: additionalData?.twoFactorEnabled ?? false,
      connectedSocials: additionalData?.connectedSocials || []
    };
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
};
export type { User };
