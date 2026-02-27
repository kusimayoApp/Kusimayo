// src/services/donations.js
import { collection, addDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

function generatePaymentId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'KUS-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const registerDonation = async ({ userId, email, amount, type, method, currency, status, isAnonymous, anonymousName }) => {
  const paymentId = generatePaymentId();

  const donationRef = await addDoc(collection(db, 'donations'), {
    userId: userId || 'anonimo',
    email: email || null,
    amount,
    type,
    method: method || 'unknown',
    currency: currency || 'usd',
    status: status || 'pending_verification',
    paymentId,
    isAnonymous: isAnonymous || false,
    anonymousName: anonymousName || null,
    createdAt: serverTimestamp(),
  });

  // Retorna el id sin hacer updateDoc (evita el error de permisos)
  return { donationId: donationRef.id };
};