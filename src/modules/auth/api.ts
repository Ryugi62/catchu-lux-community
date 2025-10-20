import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import type { UserProfile } from './types';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const profileRef = doc(firestore, 'users', userId);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    displayName: data.displayName ?? '',
    email: data.email ?? '',
    preferredBrands: data.preferredBrands ?? [],
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.(),
  };
};
