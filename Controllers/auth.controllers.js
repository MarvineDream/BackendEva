import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const createUserAccount = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;

    console.log("👉 Requête reçue pour créer un utilisateur :", req.body);

    // Vérifie que les champs sont présents
    if (!nom || !email || !password || !role) {
      console.warn("Champs manquants :", { nom, email, password, role });
      return res.status(400).json({ error: "Nom, email, mot de passe et rôle sont requis." });
    }

    // Vérifie que le rôle est autorisé
    const allowedRoles = ["admin", "RH", "Manager"];
    if (!allowedRoles.includes(role)) {
      console.warn("Rôle invalide :", role);
      return res.status(400).json({ error: "Rôle invalide. Rôles autorisés : admin, RH, Manager." });
    }

    // Vérifie si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("Email déjà utilisé :", email);
      return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    console.log("Hachage du mot de passe...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du compte
    const newUser = new User({
      nom,
      email,
      password: hashedPassword,
      role, 
    });

    console.log("Enregistrement du nouvel utilisateur en base de données...");
    await newUser.save();

    console.log("Compte créé avec succès :", {
      id: newUser._id,
      nom: newUser.nom,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      message: "Compte utilisateur créé avec succès.",
      user: {
        id: newUser._id,
        nom: newUser.nom,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur serveur." });
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

    // Vérification de la clé secrète
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "La clé secrète n'est pas définie" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Réponse avec les infos nécessaires
    res.json({
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        departement: user.departements, 
      },
    });
  } catch (err) {
    console.error(err); // Log de l'erreur pour le débogage
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};





  
  
export { login, createUserAccount };
