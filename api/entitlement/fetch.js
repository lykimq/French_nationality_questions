import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

let db = null;

function initFirebase() {
  if (db) return db;

  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  return db;
}

export default async function handler(req, res) {
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
    const docRef = doc(firestore, 'entitlements', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
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
}
