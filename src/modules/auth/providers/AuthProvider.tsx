import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from '../../../lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '../../../lib/firebase';

interface SignUpPayload {
  email: string;
  password: string;
  displayName: string;
  preferredBrands: string[];
}

interface UpdateAccountPayload {
  displayName?: string;
  preferredBrands?: string[];
}

interface AuthContextShape {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateAccount: (payload: UpdateAccountPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        console.log('[Auth] auth state changed', firebaseUser ? firebaseUser.uid : 'anonymous');
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error: unknown) => {
        console.error('[Auth] onAuthStateChanged error', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    async signIn(email: string, password: string) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('[Auth] signIn success');
      } catch (error) {
        console.error('[Auth] signIn failed', error);
        throw error;
      }
    },
    async signUp({ email, password, displayName, preferredBrands }: SignUpPayload) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('[Auth] signUp success', credential.user.uid);
        await updateProfile(credential.user, { displayName });
        await setDoc(doc(firestore, 'users', credential.user.uid), {
          displayName,
          email,
          preferredBrands,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('[Auth] signUp failed', error);
        throw error;
      }
    },
    async signOut() {
      try {
        await signOut(auth);
        console.log('[Auth] signOut success');
      } catch (error) {
        console.error('[Auth] signOut failed', error);
        throw error;
      }
    },
    async updateAccount({ displayName: nextDisplayName, preferredBrands }: UpdateAccountPayload) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const updates: Record<string, unknown> = {};

      if (typeof nextDisplayName === 'string' && nextDisplayName.trim().length > 0) {
        if (nextDisplayName !== currentUser.displayName) {
          await updateProfile(currentUser, { displayName: nextDisplayName });
        }
        updates.displayName = nextDisplayName;
      }

      if (Array.isArray(preferredBrands)) {
        updates.preferredBrands = preferredBrands;
      }

      if (Object.keys(updates).length > 0) {
        await setDoc(
          doc(firestore, 'users', currentUser.uid),
          {
            ...updates,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setUser(auth.currentUser);
    },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return context;
};
