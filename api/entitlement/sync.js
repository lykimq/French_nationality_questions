const admin = require('firebase-admin');
const { createHash } = require('crypto');

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

  const { accountHash, platform, isPremium, hasUsedFreeExam, purchaseToken, productId, receipt } = req.body;

  if (!accountHash || !platform) {
    return res.status(400).json({ error: 'Missing required fields: accountHash, platform' });
  }

  try {
    const firestore = initFirebase();
    const docId = `${platform}_${accountHash}`;
    const docRef = firestore.collection('entitlements').doc(docId);
    const docSnap = await docRef.get();

    const now = new Date().toISOString();
    const existing = docSnap.exists ? docSnap.data() : {};

    const updateData = {
      isPremium: isPremium !== undefined ? isPremium : (existing.isPremium || false),
      hasUsedFreeExam: hasUsedFreeExam !== undefined ? hasUsedFreeExam : (existing.hasUsedFreeExam || false),
      updatedAt: now,
      platform,
      accountHash,
    };

    if (!docSnap.exists) {
      updateData.createdAt = now;
    }

    if (purchaseToken || receipt) {
      if (!updateData.receipts) {
        updateData.receipts = [];
      }
      updateData.receipts.push({
        store: platform,
        tokenHash: purchaseToken ? createHash('sha256').update(purchaseToken).digest('hex') : null,
        productId: productId || null,
        updatedAt: now,
      });
    }

    await docRef.set(updateData, { merge: true });

    return res.status(200).json({
      isPremium: updateData.isPremium,
      hasUsedFreeExam: updateData.hasUsedFreeExam,
      updatedAt: updateData.updatedAt,
    });
  } catch (error) {
    console.error('Error syncing entitlement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
