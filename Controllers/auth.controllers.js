import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET;

// Inscription
const register = async (req, res) => {
  const { nom, email, password, role, departement } = req.body;

  try {
    // Vérifions si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = new User({
      nom,
      email,
      password: hashedPassword,
      role,
      departement: role === "manager" ? departement : undefined
    });
    console.log("Données enregistrées :", newUser);
    await newUser.save();

    res.status(201).json({ message: "Utilisateur inscrit avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
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
  
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, user: { nom: user.nom, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  };
  
  
export { login, register };
