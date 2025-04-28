import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Inscription
const register = async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    // Vérification des champs requis
    if (!nom || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérification de l'email existant
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Vérification de la force du mot de passe
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ nom, email, password: hashed });

    await user.save();
    res.status(201).json({ message: "Utilisateur enregistré" });
  } catch (err) {
    console.error(err); // Log de l'erreur pour le débogage
    res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisateur" });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const user = await User.findOne({ email });

    // Vérification de l'utilisateur et du mot de passe
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { nom: user.nom, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err); // Log de l'erreur pour le débogage
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export { login, register };
