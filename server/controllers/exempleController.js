const Exemple = require("../models/Exemple");

// Obtenir tous les documents
exports.getExemples = async (req, res) => {
  try {
    const exemples = await Exemple.find();
    res.status(200).json(exemples);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Ajouter un document
exports.createExemple = async (req, res) => {
  try {
    const newExemple = new Exemple(req.body);
    await newExemple.save();
    res.status(201).json(newExemple);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création", error });
  }
};
