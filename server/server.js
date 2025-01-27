const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { upload } = require("./util/upload");
require('dotenv').config(); // This is used to enable .env support (to get Gemini API Key)

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/DB";
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.error("Erreur de connexion à MongoDB :", err));

let bucket;
(() => {
  mongoose.connection.on("connected", () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "filesBucket",
    });
    console.log(`bucket created: ${bucket}`);
    console.log("New bucket created:", bucket.s.options.bucketName);
  });
})();

// Routes
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

const interventionRoutes = require("./routes/interventionRoutes");
app.use("/api/interventions", interventionRoutes);

const geminiRoutes = require("./routes/geminiRoutes");
app.use("/api/gemini", geminiRoutes);

// Upload a single file
app.post("/upload/file", upload().single("file"), async (req, res) => {
  try {
    console.log(req.file); // Log file details for debugging
    if (!req.file) {
      return res.status(400).json({ text: "No file uploaded." });
    }
    res.status(201).json({ text: "File uploaded successfully!", file: req.file });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: { text: "Unable to upload the file", error },
    });
  }
});



// Middleware global pour les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
