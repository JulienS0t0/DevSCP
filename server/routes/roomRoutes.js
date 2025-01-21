const express = require("express");
const { createRoom, getRoom, getRoomInfo, getRoomEmbeddings, getRoomInterventions } = require("../controllers/roomController");

const router = express.Router();

// Route pour créer une salle
router.post("/", createRoom);

// Route pour obtenir une salle spécifique
router.get("/:id", getRoom);

router.get("/:id/info", getRoomInfo);

router.get("/:id/embeddings", getRoomEmbeddings);

router.get("/:id/interventions", getRoomInterventions);

module.exports = router;
