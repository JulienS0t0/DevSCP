const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// GridFS Configuration
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads"); // Nom de la collection pour les fichiers
});

// Multer GridFS Storage
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads", // Stocke dans la collection "uploads"
    };
  },
});
const upload = multer({ storage });

const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

const interventionRoutes = require("./routes/interventionRoutes");
app.use("/api/interventionRoutes", interventionRoutes);


// Routes pour fichiers

app.get("/", (req, res) => {
  res.send("Serveur Node.js opérationnel !");
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.status(201).json({ fileId: req.file.id, filename: req.file.filename });
});

app.get("/file/:id", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    const readStream = gfs.createReadStream(file._id);
    readStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
