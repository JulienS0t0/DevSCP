const Intervention = require("../models/Intervention");

// Créer une intervention avec des fichiers liés
exports.createIntervention = async (req, res) => {
  try {
    const { roomId, notes, photoIds, videoIds } = req.body;

    // Créez une nouvelle intervention
    const newIntervention = new Intervention({
      roomId,
      notes,
      media: {
        photos: photoIds, // Liste des IDs GridFS des photos
        videos: videoIds, // Liste des IDs GridFS des vidéos
      },
    });

    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création", error });
  }
};

// Obtenir une intervention par ID (avec les fichiers)
exports.getIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id).populate("roomId");
    if (!intervention) {
      return res.status(404).json({ message: "Intervention introuvable" });
    }
    res.status(200).json(intervention);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
