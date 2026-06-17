const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connecté à la base de données MongoDB (Post Service)");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error);
    process.exit(1);
  }
};

module.exports = connectDB;