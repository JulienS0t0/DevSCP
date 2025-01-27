const express = require("express");
const { createRoom, getRoom, getRoomInfo, getRoomEmbeddings, getRoomInterventions, updateRoom, deleteRoom } = require("../controllers/roomController");

const router = express.Router();

// Route pour créer une salle
router.post("/", createRoom);

// Route pour obtenir une salle spécifique
router.get("/:id", getRoom);

router.get("/:id/info", getRoomInfo);

router.get("/:id/embeddings", getRoomEmbeddings);

router.get("/:id/interventions", getRoomInterventions);

// Route pour mettre à jour une salle spécifique
router.put("/:id", updateRoom);

// Route pour supprimer une salle spécifique
router.delete("/:id", deleteRoom);

module.exports = router;
