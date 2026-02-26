import {
  doc, getDoc, setDoc, addDoc, collection,
  serverTimestamp, onSnapshot, updateDoc,
  increment, getDocs, query, where, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const getGlobalStats = async () => {
  const ref = doc(db, 'stats', 'global');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const createUserProfile = async (userId, email, displayName) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { email, displayName, createdAt: serverTimestamp(), totalDonated: 0, isActive: true });
};

export const getUserProfile = async (userId) => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const deactivateUser = async (userId) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { isActive: false }, { merge: true });
};

export const reactivateUser = async (userId, email, displayName) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { isActive: true, email, displayName, reactivatedAt: serverTimestamp() }, { merge: true });
};

export const getUserDonations = async (userId) => {
  const q = query(collection(db, 'donations'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllDonations = async () => {
  const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const confirmDonation = async (donationId) => {
  const ref = doc(db, 'donations', donationId);
  await updateDoc(ref, { status: 'completed' });
};

export const rejectDonation = async (donationId) => {
  const ref = doc(db, 'donations', donationId);
  await updateDoc(ref, { status: 'rejected' });
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUserProfile = async (userId, data) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, data, { merge: true });
};

export const updateStatsOnConfirm = async (donation) => {
  const ref = doc(db, 'stats', 'global');
  
  // Usa setDoc con merge: true en lugar de updateDoc
  await setDoc(ref, {
    totalDonations: increment(1),
    totalAmount: increment(donation.amount),
    ...(donation.type === 'sponsorship'
      ? { totalSponsors: increment(1) }
      : { totalUnique: increment(1) }
    ),
  }, { merge: true });
};

export const subscribeToStats = (callback) => {
  const ref = doc(db, 'stats', 'global');
  return onSnapshot(ref, (snap) => {
    console.log('📊 Snapshot stats:', snap.exists()); // ← AGREGAR LOG
    if (snap.exists()) {
      console.log('📊 Datos stats:', snap.data()); // ← AGREGAR LOG
      callback(snap.data());
    } else {
      console.log('⚠️ Stats no existe, creando valores por defecto'); // ← AGREGAR LOG
      callback({
        totalDonations: 0,
        totalAmount: 0,
        totalSponsors: 0,
        totalUnique: 0
      });
    }
  }, (error) => {
    console.error('❌ Error en subscribeToStats:', error); // ← AGREGAR LOG
  });
};

export const subscribeToDonations = (callback) => {
  const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const saveCertificate = async (donationId, userId, certificateData) => {
  const ref = doc(db, 'certificates', donationId);
  await setDoc(ref, {
    donationId,
    userId,
    ...certificateData,
    generatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getCertificate = async (donationId) => {
  const ref = doc(db, 'certificates', donationId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const subscribeToUserDonations = (userId, callback) => {
  const q = query(
    collection(db, 'donations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};