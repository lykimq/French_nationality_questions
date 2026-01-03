const admin = require('firebase-admin');

let db = null;

function initFirebase() {
  if (db) return db;

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKey = process.env.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL;

  if (!admin.apps.length) {
    if (!privateKey || !clientEmail) {
      console.error('Missing Firebase credentials:', {
        hasProjectId: !!projectId,
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
      });
      throw new Error('Firebase Admin SDK requires EXPO_PUBLIC_FIREBASE_PRIVATE_KEY and EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL environment variables. Please set them in Vercel Dashboard → Settings → Environment Variables for Production environment.');
    }

    if (!projectId) {
      throw new Error('EXPO_PUBLIC_FIREBASE_PROJECT_ID environment variable is required.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        privateKey: privateKey,
        clientEmail: clientEmail,
      }),
    });
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
