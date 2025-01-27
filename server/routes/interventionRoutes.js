const express = require("express");
const { createIntervention, getIntervention, updateIntervention, deleteIntervention } = require("../controllers/interventionController");

const router = express.Router();

// Route pour créer une intervention
router.post("/", createIntervention);

// Route pour obtenir une intervention spécifique
router.get("/:id", getIntervention);

// Route pour mettre à jour une intervention spécifique
router.put("/:id", updateIntervention);

// Route pour supprimer une intervention spécifique
router.delete("/:id", deleteIntervention);

module.exports = router;
