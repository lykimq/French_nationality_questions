const admin = require('firebase-admin');

let db = null;

function initFirebase() {
  if (db) return db;

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKey = process.env.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL;

  if (!admin.apps.length) {
    if (privateKey && clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: clientEmail,
        }),
      });
    } else if (projectId) {
      admin.initializeApp({
        projectId: projectId,
      });
    } else {
      throw new Error('Firebase configuration missing. Need EXPO_PUBLIC_FIREBASE_PROJECT_ID and either (EXPO_PUBLIC_FIREBASE_PRIVATE_KEY + EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL) or Application Default Credentials.');
    }
  }

  db = admin.firestore();
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
