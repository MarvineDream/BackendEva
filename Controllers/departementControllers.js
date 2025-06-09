import Department from '../models/Departement.js';
import User from '../models/User.js';



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

// Lister tous les départements
export const getAllDepartements = async (req, res) => {
  try {
    const departements = await departements.find();
    res.status(200).json(departements);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération.' });
  }
};

// Modifier un département
export const updateDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Department.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Département introuvable.' });
    res.status(200).json(updated);
  } catch (err) {
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

    if (!Array.isArray(departements) || departements.length === 0) {
      return res.status(400).json({ error: 'Le tableau des départements est requis.' });
    }

    // Vérifie que les départements existent bien
    const existingDepartements = await departements.find({ _id: { $in: departements } });
    if (existingDepartements.length !== departements.length) {
      return res.status(400).json({ error: 'Un ou plusieurs départements sont invalides.' });
    }

    // Vérifie que le manager existe et est bien un Manager
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'Manager') {
      return res.status(404).json({ error: 'Manager introuvable ou invalide.' });
    }

    // Attribue les départements au manager
    manager.departements = departements; // Ce champ doit exister dans le modèle User
    await manager.save();

    res.status(200).json({ message: 'Départements attribués avec succès.', manager });
  } catch (err) {
    console.error('Erreur assignation départements:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l’attribution des départements.' });
  }
};
