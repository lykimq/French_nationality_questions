module.exports = async function handler(req, res) {
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKeyRaw = process.env.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL;

  const allEnvVars = Object.keys(process.env).filter(key => key.includes('FIREBASE'));
  
  const debug = {
    availableFirebaseVars: allEnvVars,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: {
      exists: !!projectId,
      isEmpty: !projectId || projectId.trim() === '',
      length: projectId ? projectId.length : 0,
      firstChars: projectId ? projectId.substring(0, 50) : 'N/A',
    },
    EXPO_PUBLIC_FIREBASE_PRIVATE_KEY: {
      exists: !!privateKeyRaw,
      isEmpty: !privateKeyRaw || privateKeyRaw.trim() === '',
      length: privateKeyRaw ? privateKeyRaw.length : 0,
      firstChars: privateKeyRaw ? privateKeyRaw.substring(0, 50) : 'N/A',
      hasQuotes: privateKeyRaw ? (privateKeyRaw.startsWith('"') && privateKeyRaw.endsWith('"')) : false,
    },
    EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL: {
      exists: !!clientEmail,
      isEmpty: !clientEmail || clientEmail.trim() === '',
      length: clientEmail ? clientEmail.length : 0,
      firstChars: clientEmail ? clientEmail.substring(0, 50) : 'N/A',
    },
    rawCheck: {
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'defined' : 'undefined',
      EXPO_PUBLIC_FIREBASE_PRIVATE_KEY: process.env.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY ? 'defined' : 'undefined',
      EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL: process.env.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL ? 'defined' : 'undefined',
    },
  };

  return res.status(200).json({
    message: 'Environment variables debug info',
    debug,
    allSet: debug.EXPO_PUBLIC_FIREBASE_PROJECT_ID.exists && 
            !debug.EXPO_PUBLIC_FIREBASE_PROJECT_ID.isEmpty &&
            debug.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY.exists && 
            !debug.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY.isEmpty &&
            debug.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL.exists && 
            !debug.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL.isEmpty,
  });
};
