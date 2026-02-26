import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, reactivateUser, createUserProfile } from '../services/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createUserProfile(result.user.uid, email, displayName);
      return result;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(result.user.uid);
        if (profile && profile.isActive === false) {
          await updateProfile(result.user, { displayName });
          await reactivateUser(result.user.uid, email, displayName);
          return result;
        } else {
          await signOut(auth);
          throw new Error('Este email ya tiene una cuenta activa.');
        }
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    const profile = await getUserProfile(u.uid);
    if (!profile) {
      return { isNew: true, user: u };
    }
    return { isNew: false, user: u };
  };

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(result.user.uid);
    if (profile && profile.isActive === false) {
      await signOut(auth);
      throw new Error('Esta cuenta está desactivada. Regístrate de nuevo para reactivarla.');
    }
    return result;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { user, loading, register, login, logout, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}