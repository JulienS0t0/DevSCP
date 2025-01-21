const express = require("express");
const { createRoom, getRoom } = require("../controllers/roomController");

const router = express.Router();

// Route pour créer une salle
router.post("/", createRoom);

// Route pour obtenir une salle spécifique
router.get("/:id", getRoom);

router.get("/:id/info", getRoomInfo);

module.exports = router;
