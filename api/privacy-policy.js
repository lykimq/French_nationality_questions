const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'privacy-policy.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Error reading privacy policy:', error);
    
    // Fallback: return inline HTML if file not found
    const fallbackHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Politique de Confidentialité - Naturalisation Test Civique</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .meta {
            color: #777;
            font-style: italic;
            margin-bottom: 30px;
        }
        .contact {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Politique de Confidentialité</h1>
    <p class="meta">Dernière mise à jour : 2 janvier 2026</p>
    
    <h2>Responsable du Traitement</h2>
    <p>Cette application ("l'Application") est développée et exploitée par un développeur indépendant basé en France. Conformément au Règlement Général sur la Protection des Données (RGPD), nous sommes responsables du traitement de vos données personnelles.</p>
    
    <h2>Introduction</h2>
    <p>Cette application est conçue pour vous aider à préparer votre entretien de naturalisation française. Nous nous engageons à protéger votre vie privée et vos données personnelles conformément au RGPD et à la législation française en vigueur.</p>
    
    <h2>Données Collectées</h2>
    <p>L'Application stocke les données suivantes uniquement sur votre appareil : préférences d'affichage, statistiques de progression, historique de recherche. Ces données sont stockées localement et ne sont jamais transmises à nos serveurs.</p>
    
    <h2>Services Tiers</h2>
    <p>L'Application utilise Firebase Storage pour charger du contenu et Sentry pour les rapports d'erreurs. Aucune donnée personnelle identifiable n'est collectée.</p>
    
    <div class="contact">
        <h2>Contact</h2>
        <p>Pour toute question, contactez-nous à : <strong>lykimq@gmail.com</strong></p>
    </div>
    
    <h2>Conformité</h2>
    <p>Cette application est conforme au RGPD de l'Union Européenne et à la loi Informatique et Libertés française.</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallbackHtml);
  }
};
