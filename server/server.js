const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
require("dotenv").config(); // This is used to enable .env support (to get Gemini API Key)

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connection to MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/DB";
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

const conn = mongoose.connection;
let gfsBucket;
conn.once("open", () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
  console.log("GridFSBucket initialized");
});

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for file upload
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const uploadStream = gfsBucket.openUploadStream(file.originalname);
  uploadStream.end(file.buffer);

  uploadStream.on("finish", () => {
    res.status(201).json({ message: "File uploaded successfully", fileId: uploadStream.id });
  });

  uploadStream.on("error", (err) => {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file", error: err.message });
  });
});

// Route for retrieving file
app.get("/file/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gfsBucket.openDownloadStream(fileId);

    downloadStream.on("error", (err) => {
      console.error("Error retrieving file:", err);
      res.status(500).json({ message: "Error retrieving file", error: err.message });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ message: "Error retrieving file", error: err.message });
  }
});

// Routes
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

const interventionRoutes = require("./routes/interventionRoutes");
app.use("/api/interventions", interventionRoutes);

const geminiRoutes = require("./routes/geminiRoutes");
app.use("/api/gemini", geminiRoutes);

// Middleware global for errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
