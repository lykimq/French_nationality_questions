const { initFirebase } = require('./firebase-init');

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
        error: 'Firebase not initialized. Check environment variables: EXPO_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL'
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
    const errorMessage = error?.message || String(error);
    const isMissingEnvVars = errorMessage.includes('Missing required environment variables');
    return res.status(500).json({
      error: isMissingEnvVars ? 'Configuration error' : 'Internal server error',
      message: errorMessage,
      hint: isMissingEnvVars ? 'Add the missing environment variables in Vercel Dashboard → Settings → Environment Variables, then redeploy.' : undefined
    });
  }
};
