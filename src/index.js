const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
// --- LIGNE AJOUTÉE : On importe le fichier de nos routes ---
const postRoutes = require('./routes/post.routes');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB
connectDB();

// --- LIGNE AJOUTÉE : On dit à Express d'écouter les requêtes sur /api/posts ---
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Service Post démarré sur http://localhost:${PORT}`);
});