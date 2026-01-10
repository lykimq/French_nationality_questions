const { createHash } = require('crypto');
const { initFirebase } = require('./firebase-init');

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
    const errorMessage = error?.message || String(error);
    const isMissingEnvVars = errorMessage.includes('Missing required environment variables');
    return res.status(500).json({
      error: isMissingEnvVars ? 'Configuration error' : 'Internal server error',
      message: errorMessage,
      hint: isMissingEnvVars ? 'Add the missing environment variables in Vercel Dashboard → Settings → Environment Variables, then redeploy.' : undefined
    });
  }
};
