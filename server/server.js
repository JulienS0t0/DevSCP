const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
require('dotenv').config() // This is used to enable .env support (to get Gemini API Key)

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

let gfs;
const conn = mongoose.connection;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Multer GridFS Storage
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    };
  },
});
const upload = multer({ storage });

// Routes
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

const interventionRoutes = require("./routes/interventionRoutes");
app.use("/api/interventions", interventionRoutes);

const geminiRoutes = require("./routes/geminiRoutes");
app.use("/api/gemini", geminiRoutes);

// Routes pour fichiers
app.post("/upload", upload.single("file"), (req, res) => {
  res.status(201).json({ fileId: req.file.id, filename: req.file.filename });
});

app.get("/file/:id", async (req, res) => {
  if (!gfs) {
    return res.status(500).json({ message: "GridFS non initialisé" });
  }
  try {
    const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    const readStream = gfs.createReadStream(file._id);
    readStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
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
