const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  building: { type: String, required: true },
  campus: { type: String, required: true },
  unityEmbeddings: { type: mongoose.Schema.Types.ObjectId },
  interventions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Intervention" }],
});

module.exports = mongoose.model("Room", roomSchema);
