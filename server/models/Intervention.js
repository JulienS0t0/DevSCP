const mongoose = require("mongoose");

const interventionSchema = new mongoose.Schema({
  interventionId: { type: String, required: true, unique: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  notes: { type: String, required: true },
  media: {
    photos: [{ type: mongoose.Schema.Types.ObjectId }], // IDs GridFS des photos
    videos: [{ type: mongoose.Schema.Types.ObjectId }], // IDs GridFS des vidéos
  }
});

module.exports = mongoose.model("Intervention", interventionSchema);
