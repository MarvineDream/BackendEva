import Staff from '../models/Staff.js';
import dayjs from 'dayjs';
import authMiddleware from "../middleware/auth.middleware.js";



// POST créer un staff
export const createStaff = async (req, res) => {
    try {
      const { nom, prenom, email, poste, departement, typeContrat, dateEmbauche, dateFinContrat, managerId } = req.body;
  
      // Validation des champs requis
      if (!nom || !poste || !email||!departement || !typeContrat || !dateEmbauche) {
        return res.status(400).json({ message: "Champs requis manquants." });
      }
  
      const newStaff = new Staff({
        nom,
        prenom,
        poste,
        email,
        departement,
        typeContrat,
        dateEmbauche,
        dateFinContrat,
        managerId
      });
      
      await newStaff.save();
      res.status(201).json(newStaff);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  

export const getStats = async (req, res) => {
  try {
    const staffs = await Staff.find();

    const totalStaff = staffs.length;

    // 🔢 Groupement par département
    const parDepartement = staffs.reduce((acc, staff) => {
      const dep = staff.departement || "Non défini";
      acc[dep] = (acc[dep] || 0) + 1;
      return acc;
    }, {});

    const parDepartementFormatted = Object.entries(parDepartement).map(
      ([nom, count]) => ({ nom, count })
    );

    // 📅 Contrats expirant dans les 30 jours
    const dans30Jours = dayjs().add(30, "day");
    const contratsExpirants = staffs.filter((s) => {
      return s.dateFin && dayjs(s.dateFin).isBefore(dans30Jours);
    });

    res.json({
      totalStaff,
      parDepartement: parDepartementFormatted,
      contratsExpirants
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// GET tous les staffs
export const getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find().sort({ dateFinContrat: 1 });
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET staff par ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Introuvable" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT (mise à jour)
export const updateStaff = async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Introuvable" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Introuvable" });
    res.json({ message: "Supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les agents liés au manager connecté
export const getStaffByManager = async (req, res) => {
  try {
    const managerId = req.user.id; // injecté par le middleware d'auth
    const staff = await Staff.find({ managerId });
    res.json(staff);
  } catch (err) {
    console.error("Erreur getStaffByManager:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getStaffByRh = async (req, res) => {
  try {
    const { _id, departement, role } = req.user;

    // Vérification de rôle RH
    if (role !== "RH") {
      return res.status(403).json({ message: "Accès interdit" });
    }

    // Ne récupérer que le staff enregistré par ce RH dans ce département
    const staffs = await Staff.find({
      departement,
      managerId: _id // doit être défini lors de la création du staff
    });

    res.json(staffs);
  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération du staff RH" });
  }
};


export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};