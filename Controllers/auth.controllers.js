import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Department from '../models/Departement.js';

const JWT_SECRET = process.env.JWT_SECRET;



const createUserAccount = async (req, res) => {
  try {
    const { nom, email, password, role, departement } = req.body;

    console.log("👉 Requête reçue pour créer un utilisateur :", req.body);

    // ✅ Vérifie les champs obligatoires
    if (!nom?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ message: "Nom, email, mot de passe et rôle sont requis." });
    }

    // ✅ Vérifie le rôle autorisé
    const allowedRoles = ["admin", "RH", "Manager"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide. Rôles autorisés : admin, RH, Manager." });
    }

    // ✅ Vérifie l'unicité de l'email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // ✅ Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Données à enregistrer
    const newUserData = {
      nom: nom.trim(),
      email: email.trim(),
      password: hashedPassword,
      role,
    };

    // ✅ Cas particulier : Manager
    if (role === "Manager") {
      if (!departement) {
        return res.status(400).json({ message: "Le département est requis pour un manager." });
      }

      const existingDepartment = await Department.findById(departement);
      if (!existingDepartment) {
        return res.status(400).json({ message: "Département invalide." });
      }

      newUserData.departement = departement;
    }

    // ✅ Création du user
    const newUser = new User(newUserData);
    await newUser.save();

    // ✅ Si Manager, associer le manager au département
    if (role === "Manager") {
      await Department.findByIdAndUpdate(departement, {
        manager: newUser._id,
      });
    }

    // ✅ Réponse
    return res.status(201).json({
      message: "Compte utilisateur créé avec succès.",
      user: {
        id: newUser._id,
        nom: newUser.nom,
        email: newUser.email,
        role: newUser.role,
        departement: newUser.departement || null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};





// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Tentative avec email :', email);

    // Vérification des champs requis
    if (!email || !password) {
      console.warn('[LOGIN] Champs manquants');
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[LOGIN] Utilisateur non trouvé pour:', email);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[LOGIN] Mot de passe incorrect pour:', email);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Vérification de la clé secrète
    if (!JWT_SECRET) {
      console.error('[LOGIN] JWT_SECRET non défini');
      return res.status(500).json({ message: "La clé secrète n'est pas définie" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('[LOGIN] Connexion réussie pour:', email);
    console.log('[LOGIN] Rôle utilisateur:', user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        departement: user.departement, 
      },
    });
  } catch (err) {
    console.error('[LOGIN] Erreur serveur :', err);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};



// Récupérer tous les managers
const getAllUsers = async (req, res) => {
  try {
    console.log("Début récupération des utilisateurs");

    const { role } = req.query;
    const filter = role ? { role } : {};

    console.log("Filtre utilisé :", filter);

    const users = await User.find(filter).select("-password");

    if (!Array.isArray(users)) {
      console.warn("Résultat inattendu : users n'est pas un tableau");
      return res.status(200).json([]); // Fallback vide
    }

    console.log(`${users.length} utilisateur(s) récupéré(s)`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString(),
        Nom: `${u.nom ?? "(email?)"}`,
        Rôle: u.role,
      }))
    );

    res.status(200).json(users);
    console.log("Réponse envoyée avec succès");

  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};




// Modifier un utilisateur
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nom, email, role, password } = req.body;

    // Recherche de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Mise à jour des champs
    if (nom) user.nom = nom;
    if (email) user.email = email;
    if (role) {
      const allowedRoles = ["admin", "RH", "Manager"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Rôle invalide." });
      }
      user.role = role;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Utilisateur mis à jour avec succès.",
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};












  
  
export { login, createUserAccount, getAllUsers, updateUser, deleteUser };
