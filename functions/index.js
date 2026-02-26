const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const cors = require('cors')({ origin: true });

initializeApp();
const db = getFirestore();

function generatePaymentId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'KUS-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.registerDonation = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    try {
      const { userId, email, amount, type, method, currency, status } = req.body;
      console.log('Body recibido:', req.body);

      if (!userId || !email || !amount || !type) return res.status(400).json({ error: 'Faltan campos requeridos' });
      if (!['unique', 'sponsorship'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' });
      if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

      const paymentId = generatePaymentId();

      const donationRef = await db.collection('donations').add({
        userId, email, amount, type,
        method: method || 'unknown',
        currency: currency || 'usd',
        status: status || 'pending_verification',
        paymentId,
        createdAt: FieldValue.serverTimestamp(),
      });

      await donationRef.update({ id: donationRef.id });

      return res.status(200).json({ success: true, donationId: donationRef.id });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

exports.confirmDonation = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    try {
      const { donationId } = req.body;
      if (!donationId) return res.status(400).json({ error: 'Falta donationId' });

      const ref = db.collection('donations').doc(donationId);
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: 'Donación no encontrada' });

      const donation = snap.data();
      if (donation.status === 'completed') return res.status(400).json({ error: 'Ya confirmada' });

      await ref.update({ status: 'completed' });

      const statsRef = db.collection('stats').doc('global');
      await statsRef.update({
        totalDonations: FieldValue.increment(1),
        totalAmount: FieldValue.increment(donation.amount),

        totalAmountUSD: donation.currency !== 'soles' ? FieldValue.increment(donation.amount) : FieldValue.increment(0),
        totalAmountSoles: donation.currency === 'soles' ? FieldValue.increment(donation.amount) : FieldValue.increment(0),
        
        ...(donation.type === 'sponsorship'
          ? { totalSponsors: FieldValue.increment(1) }
          : { totalUnique: FieldValue.increment(1) }
        ),
      });

      const userRef = db.collection('users').doc(donation.userId);
      await userRef.set({ totalDonated: FieldValue.increment(donation.amount) }, { merge: true });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error interno' });
    }
  });
});

exports.rejectDonation = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    try {
      const { donationId } = req.body;
      if (!donationId) return res.status(400).json({ error: 'Falta donationId' });
      const ref = db.collection('donations').doc(donationId);
      await ref.update({ status: 'rejected' });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Error interno' });
    }
  });
});