module.exports = async function handler(req, res) {
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  const allEnvVars = Object.keys(process.env).filter(key => key.includes('FIREBASE'));

  const debug = {
    availableFirebaseVars: allEnvVars,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: {
      exists: !!projectId,
      isEmpty: !projectId || projectId.trim() === '',
      length: projectId ? projectId.length : 0,
      firstChars: projectId ? projectId.substring(0, 50) : 'N/A',
    },
    FIREBASE_PRIVATE_KEY: {
      exists: !!privateKeyRaw,
      isEmpty: !privateKeyRaw || privateKeyRaw.trim() === '',
      length: privateKeyRaw ? privateKeyRaw.length : 0,
      firstChars: privateKeyRaw ? privateKeyRaw.substring(0, 50) : 'N/A',
      hasQuotes: privateKeyRaw ? (privateKeyRaw.startsWith('"') && privateKeyRaw.endsWith('"')) : false,
    },
    FIREBASE_CLIENT_EMAIL: {
      exists: !!clientEmail,
      isEmpty: !clientEmail || clientEmail.trim() === '',
      length: clientEmail ? clientEmail.length : 0,
      firstChars: clientEmail ? clientEmail.substring(0, 50) : 'N/A',
    },
    rawCheck: {
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'defined' : 'undefined',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'defined' : 'undefined',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'defined' : 'undefined',
    },
  };

  return res.status(200).json({
    message: 'Environment variables debug info',
    debug,
    allSet: debug.EXPO_PUBLIC_FIREBASE_PROJECT_ID.exists &&
      !debug.EXPO_PUBLIC_FIREBASE_PROJECT_ID.isEmpty &&
      debug.FIREBASE_PRIVATE_KEY.exists &&
      !debug.FIREBASE_PRIVATE_KEY.isEmpty &&
      debug.FIREBASE_CLIENT_EMAIL.exists &&
      !debug.FIREBASE_CLIENT_EMAIL.isEmpty,
  });
};
