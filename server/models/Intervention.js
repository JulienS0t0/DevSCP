const mongoose = require("mongoose");

//Note: An intervention must always be connected to exactly one room. An intervention cannot live without a room!
const interventionSchema = new mongoose.Schema({
  interventionId: { type: String, required: true, unique: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  notes: { type: String, required: true },
  media: [{ type: mongoose.Schema.Types.ObjectId }]
});

module.exports = mongoose.model("Intervention", interventionSchema);
