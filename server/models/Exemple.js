const mongoose = require("mongoose");

const exempleSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Exemple", exempleSchema);
