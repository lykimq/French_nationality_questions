const admin = require('firebase-admin');

let db = null;

function initFirebase() {
  if (db) return db;

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKeyRaw = process.env.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL;

  if (!projectId || projectId.trim() === '') {
    throw new Error('EXPO_PUBLIC_FIREBASE_PROJECT_ID environment variable is required and cannot be empty.');
  }

  if (!privateKeyRaw || privateKeyRaw.trim() === '') {
    throw new Error('EXPO_PUBLIC_FIREBASE_PRIVATE_KEY environment variable is required.');
  }

  if (!clientEmail || clientEmail.trim() === '') {
    throw new Error('EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL environment variable is required.');
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  let app;
  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId.trim(),
          privateKey: privateKey,
          clientEmail: clientEmail.trim(),
        }),
      });
    } catch (initError) {
      console.error('Failed to initialize Firebase Admin SDK:', initError);
      throw initError;
    }
  } else {
    app = admin.app();
  }

  db = app.firestore();
  return db;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountHash, platform } = req.body;

  if (!accountHash || !platform) {
    return res.status(400).json({ error: 'Missing required fields: accountHash, platform' });
  }

  try {
    const firestore = initFirebase();
    if (!firestore) {
      return res.status(500).json({ 
        error: 'Firebase not initialized. Check environment variables: EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_PRIVATE_KEY, EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL' 
      });
    }
    const docId = `${platform}_${accountHash}`;
    const docRef = firestore.collection('entitlements').doc(docId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return res.status(200).json({
        isPremium: data.isPremium || false,
        hasUsedFreeExam: data.hasUsedFreeExam || false,
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    } else {
      return res.status(200).json({
        isPremium: false,
        hasUsedFreeExam: false,
      });
    }
  } catch (error) {
    console.error('Error fetching entitlement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
