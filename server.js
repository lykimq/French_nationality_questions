const express = require('express');
const app = express();

app.use(express.json());

const entitlements = new Map();

app.post('/entitlement/fetch', (req, res) => {
  const { accountHash, platform } = req.body;
  const key = `${platform}_${accountHash}`;
  
  const entitlement = entitlements.get(key) || {
    isPremium: false,
    hasUsedFreeExam: false
  };
  
  console.log(`[FETCH] ${key}:`, entitlement);
  res.json(entitlement);
});

app.post('/entitlement/sync', (req, res) => {
  const { accountHash, platform, isPremium, hasUsedFreeExam, purchaseToken, productId, receipt } = req.body;
  const key = `${platform}_${accountHash}`;
  
  const existing = entitlements.get(key) || {};
  const now = new Date().toISOString();
  
  const entitlement = {
    isPremium: isPremium !== undefined ? isPremium : existing.isPremium || false,
    hasUsedFreeExam: hasUsedFreeExam !== undefined ? hasUsedFreeExam : existing.hasUsedFreeExam || false,
    updatedAt: now,
    createdAt: existing.createdAt || now,
    platform,
    accountHash
  };
  
  entitlements.set(key, entitlement);
  
  console.log(`[SYNC] ${key}:`, entitlement);
  res.json({
    isPremium: entitlement.isPremium,
    hasUsedFreeExam: entitlement.hasUsedFreeExam,
    updatedAt: entitlement.updatedAt
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Entitlement API server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   POST http://localhost:${PORT}/entitlement/fetch`);
  console.log(`   POST http://localhost:${PORT}/entitlement/sync`);
});
