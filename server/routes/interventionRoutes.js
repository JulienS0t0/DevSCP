const express = require("express");
const { createIntervention, getIntervention, updateIntervention, deleteIntervention } = require("../controllers/interventionController");
const { addMedia, getMedia, deleteMedia, getAllMedia } = require("../controllers/mediaController");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route pour créer une intervention
router.post("/", createIntervention);

// Route pour obtenir une intervention spécifique
router.get("/:id", getIntervention);

// Route pour mettre à jour une intervention spécifique
router.put("/:id", updateIntervention);

// Route pour supprimer une intervention spécifique
router.delete("/:id", deleteIntervention);

// Routes pour gérer les fichiers média sur une intervention
router.post("/:interventionId/media", upload.single("file"), addMedia);
router.get("/:interventionId/media", getAllMedia);
router.get("/:interventionId/media/:mediaId", getMedia);
router.delete("/:interventionId/media/:mediaId", deleteMedia);

module.exports = router;
