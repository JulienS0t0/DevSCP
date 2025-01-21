const express = require("express");
const { createIntervention } = require("../controllers/interventionController");

const router = express.Router();

router.post("/", createIntervention);

module.exports = router;
