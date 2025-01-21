const Room = require("../models/Room");

// Ajouter une salle avec un embedding Unity
exports.createRoom = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    const { roomId, number, building, campus, embeddingId } = req.body;

    if (!roomId || !number || !building || !campus) {
      throw new Error("Tous les champs obligatoires ne sont pas fournis.");
    }

    const newRoom = new Room({
      roomId,
      number,
      building,
      campus,
      unityEmbeddings: embeddingId,
    });

    await newRoom.save();
    console.log("Salle créée :", newRoom);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(400).json({ message: "Erreur lors de la création", error: error.message });
  }
};


// Obtenir une salle par ID avec l'embedding
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id }).populate("unityEmbeddings");
    if (!room) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.getRoomInfo = async (req, res) => {
    try {
      const room = await Room.findOne({ roomId: req.params.id }).select("-unityEmbeddings");
      if (!room) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };

exports.getRoomEmbeddings = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id }).populate("unityEmbeddings");
    if (!room) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    res.status(200).json(room.unityEmbeddings);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.getRoomInterventions = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id }).populate("interventions");
    if (!room) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    res.status(200).json(room.interventions);
  } catch (error) { 
    res.status(500).json({ message: "Erreur serveur", error });
  }};
