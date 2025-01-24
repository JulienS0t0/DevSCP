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

// Mettre à jour une salle
exports.updateRoom = async (req, res) => {
  try {
    const { roomId, number, building, campus, embeddingId } = req.body;

    if (!roomId || !number || !building || !campus) {
      throw new Error("Tous les champs obligatoires ne sont pas fournis.");
    }

    const updatedRoom = await Room.findOneAndUpdate(
        { roomId: req.params.id },
        { roomId, number, building, campus, unityEmbeddings: embeddingId },
        { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Salle introuvable" });
    }

    console.log("Salle mise à jour :", updatedRoom);
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

// Supprimer une salle
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findOneAndDelete({ roomId: req.params.id });

    if (!deletedRoom) {
      return res.status(404).json({ message: "Salle introuvable" });
    }

    console.log("Salle supprimée :", deletedRoom);
    res.status(200).json({ message: "Salle supprimée", room: deletedRoom });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(400).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};
