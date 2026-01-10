const admin = require('firebase-admin');
const { createHash } = require('crypto');

let db = null;

function initFirebase() {
  if (db) return db;

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  const missingVars = [];
  const debugInfo = {};

  if (!projectId || projectId.trim() === '') {
    missingVars.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  } else {
    debugInfo.EXPO_PUBLIC_FIREBASE_PROJECT_ID = `Set (length: ${projectId.length})`;
  }

  if (!privateKeyRaw || privateKeyRaw.trim() === '') {
    missingVars.push('FIREBASE_PRIVATE_KEY');
  } else {
    const keyLength = privateKeyRaw.length;
    const startsWith = privateKeyRaw.substring(0, 30);
    debugInfo.FIREBASE_PRIVATE_KEY = `Set (length: ${keyLength}, starts with: ${startsWith}...)`;
  }

  if (!clientEmail || clientEmail.trim() === '') {
    missingVars.push('FIREBASE_CLIENT_EMAIL');
  } else {
    debugInfo.FIREBASE_CLIENT_EMAIL = `Set (length: ${clientEmail.length})`;
  }

  if (missingVars.length > 0) {
    console.error('Environment variable check failed:', {
      missing: missingVars,
      found: debugInfo,
      rawCheck: {
        projectId: projectId ? `exists (${projectId.length} chars)` : 'undefined',
        privateKey: privateKeyRaw ? `exists (${privateKeyRaw.length} chars, first 30: ${privateKeyRaw.substring(0, 30)})` : 'undefined',
        clientEmail: clientEmail ? `exists (${clientEmail.length} chars)` : 'undefined',
      },
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE')),
    });
    const debugMsg = Object.keys(debugInfo).length > 0
      ? ` Debug: ${JSON.stringify(debugInfo)}`
      : '';
    throw new Error(`Missing required environment variables in Vercel: ${missingVars.join(', ')}.${debugMsg} Go to Vercel Dashboard → Settings → Environment Variables to add them.`);
  }

  // Robust parsing: handle literal \n, then extract the PEM block via Regex
  // This ignores surrounding quotes, commas, or other garbage
  let privateKey = privateKeyRaw.split(String.raw`\n`).join('\n'); // converting literal \n to real newlines

  const pemMatch = privateKey.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/);

  if (pemMatch) {
    privateKey = pemMatch[0];
  } else {
    // Fallback or error if no PEM block found
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"')) privateKey = privateKey.slice(1);
    if (privateKey.endsWith('"')) privateKey = privateKey.slice(0, -1);
  }

  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Private key format invalid: must start with "-----BEGIN PRIVATE KEY-----"');
  }

  if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
    if (privateKey.endsWith('-----END PRIVATE KEY-----\n')) {
      privateKey = privateKey.trim();
    } else {
      throw new Error('Private key format invalid: must end with "-----END PRIVATE KEY-----"');
    }
  }

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
      console.error('Failed to initialize Firebase Admin SDK:', {
        error: initError.message,
        projectId: projectId.trim(),
        clientEmail: clientEmail.trim(),
        privateKeyStart: privateKey.substring(0, 50),
        privateKeyEnd: privateKey.substring(privateKey.length - 50),
        privateKeyLength: privateKey.length,
      });
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
