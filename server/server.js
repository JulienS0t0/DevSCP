const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/nom_de_la_base", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

// Exemple de route
app.get("/", (req, res) => {
  res.send("Serveur Node.js opérationnel !");
});

// Importer les routes
const exempleRoutes = require("./routes/exemple");
app.use("/api/exemple", exempleRoutes);

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
