import Department from '../models/Departement.js';
import User from '../models/User.js';
import mongoose from 'mongoose';



// Créer un département

export const createDepartement = async (req, res) => {
  try {
    const { name, description } = req.body;

    console.log('Requête reçue pour créer un département :', { name, description });

    // Vérifie que les deux champs sont bien fournis
    if (!name || !description) {
      console.warn('Champs requis manquants : name ou description');
      return res.status(400).json({ error: 'Le nom et la description sont requis.' });
    }

    // Vérifie si un département avec le même nom existe déjà
    const existing = await Department.findOne({ name });
    if (existing) {
      console.warn('Conflit : département déjà existant', existing.name);
      return res.status(400).json({ error: 'Ce département existe déjà.' });
    }

    // Création du département
    const department = await Department.create({ name, description });

    console.log('Département créé avec succès :', department);
    res.status(201).json(department);
  } catch (err) {
    console.error('Erreur lors de la création du département :', err);
    res.status(500).json({ error: 'Erreur lors de la création du département.' });
  }
};

// Lister tous les départements avec les informations du manager
export const getAllDepartements = async (req, res) => {
  console.log('[getAllDepartements] Début de la récupération des départements');

  try {
    // Récupérer tous les départements et peupler le champ managerId
    const departements = await Department.find().populate('managerId');
    
    console.log(`[getAllDepartements] Nombre de départements récupérés : ${departements.length}`);
    
    // Retourner la réponse avec les départements peuplés
    res.status(200).json(departements);
  } catch (err) {
    console.error('[getAllDepartements] Erreur lors de la récupération des départements:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération.' });
  }
};



// Modifier un département
export const updateDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("🔧 Requête de mise à jour du département");
    console.log("🆔 ID du département :", id);
    console.log("📦 Données reçues :", updateData);

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn("⚠️ ID invalide :", id);
      return res.status(400).json({ error: 'ID invalide.' });
    }

    const updated = await Department.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      console.warn("⚠️ Département introuvable pour l'ID :", id);
      return res.status(404).json({ error: 'Département introuvable.' });
    }

    console.log("✅ Département mis à jour :", updated);
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du département :", err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};


// Supprimer un département
export const deleteDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);
    res.status(200).json({ message: 'Département supprimé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};



export const assignDepartementsToManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { departements } = req.body; 

    // Vérifie si le tableau des départements est valide
    if (!Array.isArray(departements) || departements.length === 0) {
      return res.status(400).json({ error: 'Le tableau des départements est requis.' });
    }

    // Vérifie que les départements existent bien
    const existingDepartements = await Department.find({ _id: { $in: departements } });
    if (existingDepartements.length !== departements.length) {
      return res.status(400).json({ error: 'Un ou plusieurs départements sont invalides.' });
    }

    // Vérifie que le manager existe et est bien un Manager
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'Manager') {
      return res.status(404).json({ error: 'Manager introuvable ou invalide.' });
    }

    // Attribue les départements au manager
    manager.departements = existingDepartements.map(dept => dept._id); 
    await manager.save();

    res.status(200).json({ message: 'Départements attribués avec succès.', manager });
  } catch (err) {
    console.error('Erreur lors de l\'assignation des départements:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l’attribution des départements.' });
  }
};


// Récupérer un département par ID avec les infos du manager
export const getDepartementById = async (req, res) => {
  const { id } = req.params;
  console.log("📥 [getDepartementById] Requête reçue pour l'ID :", id);

  // Vérifie que l'ID est valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn("⚠️ ID invalide fourni :", id);
    return res.status(400).json({ error: 'ID de département invalide.' });
  }

  try {
    console.log("🔍 Recherche du département dans la base de données...");
    const departement = await Department.findById(id).populate('managerId');

    if (!departement) {
      console.warn("❗ Département non trouvé pour l'ID :", id);
      return res.status(404).json({ error: 'Département introuvable.' });
    }

    console.log("✅ Département trouvé :", {
      id: departement._id,
      name: departement.name,
      manager: departement.managerId ? `${departement.managerId.nom}` : "Aucun manager"
    });

    res.status(200).json(departement);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération du département :", err);
    res.status(500).json({ error: 'Erreur lors de la récupération du département.' });
  }
};
