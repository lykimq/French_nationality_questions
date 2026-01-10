const admin = require('firebase-admin');

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

  let privateKey = privateKeyRaw.trim();

  if (privateKey.startsWith('"')) {
    privateKey = privateKey.slice(1);
  }
  if (privateKey.endsWith('"')) {
    privateKey = privateKey.slice(0, -1);
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

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

module.exports = { initFirebase };
