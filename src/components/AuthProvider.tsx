import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { User, StoreSettings } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore(state => state.setUser);
  const setStoreSettings = useAppStore(state => state.setStoreSettings);

  useEffect(() => {
    // Load store settings first
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'store_settings', 'info'));
        if (settingsDoc.exists()) {
          setStoreSettings(settingsDoc.data() as StoreSettings);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'store_settings/info');
      }
    };
    loadSettings();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // user is logged in, check firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            // Check if this is the bootstrapped admin
            const isBootstrappedAdmin = firebaseUser.email === 'mtsmadani2025@gmail.com';
            
            const newUser: Omit<User, 'id'> = {
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: isBootstrappedAdmin ? 'admin' : 'user', // first user can be admin or just logic
              createdAt: Date.now()
            };
            await setDoc(userDocRef, newUser);
            setUser({ id: firebaseUser.uid, ...newUser } as User);
          }
        } catch (error) {
           handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setStoreSettings]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
  }

  return <>{children}</>;
}
