const express = require("express");
const { getExemples, createExemple } = require("../controllers/exempleController");

const router = express.Router();

router.get("/", getExemples);
router.post("/", createExemple);

module.exports = router;
