const Intervention = require("../models/Intervention");
const Room = require("../models/Room");

// Créer une intervention avec des fichiers liés
exports.createIntervention = async (req, res) => {
  try {
    const { interventionId, roomId, notes, photoIds, videoIds } = req.body;

    const existingRoom = await Room.findOne({ roomId: roomId });
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const newIntervention = new Intervention({
      interventionId,
      roomId: existingRoom._id,
      notes,
      media: [],
    });

    await newIntervention.save();

    // Add the new intervention to the room's interventions array
    existingRoom.interventions.push(newIntervention._id);
    await existingRoom.save();

    res.status(201).json(newIntervention);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création", error });
  }
};

// Obtenir une intervention par ID (avec les fichiers)
exports.getIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findOne({ interventionId: req.params.id }).populate("roomId");
    if (!intervention) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }
    res.status(200).json(intervention);
  } catch (error) {
    console.error("Error fetching intervention:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Mettre à jour une intervention
exports.updateIntervention = async (req, res) => {
  try {
    const { notes, photoIds, videoIds } = req.body;

    const updatedIntervention = await Intervention.findOneAndUpdate(
        { interventionId: req.params.id },
        {
          notes,
          media: [],
        },
        { new: true }
    );

    if (!updatedIntervention) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }

    console.log("Intervention mise à jour :", updatedIntervention);
    res.status(200).json(updatedIntervention);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

// Supprimer une intervention
exports.deleteIntervention = async (req, res) => {
  try {
    // Find and delete the intervention
    const deletedIntervention = await Intervention.findOneAndDelete({ interventionId: req.params.id });

    if (!deletedIntervention) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }

    // Remove the intervention reference from the room's interventions array
    const room = await Room.findById(deletedIntervention.roomId);
    if (room) {
      room.interventions = room.interventions.filter(id => id.toString() !== deletedIntervention._id.toString());
      await room.save();
    }

    console.log("Intervention supprimée :", deletedIntervention);
    res.status(200).json({ message: "Intervention supprimée", intervention: deletedIntervention });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(400).json({
      message: "Erreur lors de la suppression", error: error.message
    });
  }
};

