const Room = require("../models/Room");
const mongoose = require("mongoose");

// Ajouter une salle avec un embedding Unity
exports.createRoom = async (req, res) => {
  try {
    const { roomId, number, building, campus, embeddingId } = req.body;

    const newRoom = new Room({
      roomId,
      number,
      building,
      campus,
      unityEmbeddings: embeddingId, // ID du fichier GridFS
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création", error });
  }
};

// Obtenir une salle par ID avec l'embedding
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("unityEmbeddings");
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
      const room = await Room.findById(req.params.id).select("-unityEmbeddings");
      if (!room) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };
