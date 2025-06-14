import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Department from "../models/Departement.js";



// Créer un membre du personnel (RH uniquement)
export const createStaff = async (req, res) => {
  try {
    const { role, _id } = req.user;

    const {
      nom,
      prenom,
      email,
      poste,
      departement,
      typeContrat,
      dateEmbauche,
      dateFinContrat
    } = req.body;

    if (!nom || !email || !poste || !departement || !typeContrat || !dateEmbauche) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    const responsableId = role === "RH" ? _id : null;

    const newStaff = new Staff({
      nom,
      prenom,
      email,
      poste,
      departement,
      typeContrat,
      dateEmbauche: new Date(dateEmbauche),
      dateFinContrat: dateFinContrat ? new Date(dateFinContrat) : null,
      responsableId
    });

    await newStaff.save();
    res.status(201).json({ message: "Staff ajouté avec succès", staff: newStaff });
  } catch (err) {
    res.status(500).json({ message: "Erreur création staff", error: err.message });
  }
};


// Mettre à jour un membre
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!staff) return res.status(404).json({ message: "Staff non trouvé" });

    res.json({ message: "Mise à jour réussie", staff });
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour", error: err.message });
  }
};

// Supprimer un membre
export const deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Staff non trouvé" });

    res.json({ message: "Staff supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression staff", error: err.message });
  }
};

// Récupérer tous les membres (admin uniquement ou RH)
export const getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find().sort({ createdAt: -1 });
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération staff", error: err.message });
  }
};

// Récupérer un membre par ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff non trouvé" });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération staff", error: err.message });
  }
};

// Récupérer le staff d'un responsable RH
export const getStaffByResponsable = async (req, res) => {
  try {
    const { _id } = req.user;
    const staffs = await Staff.find({ responsableId: _id }).sort({ nom: 1 });
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération staff RH", error: err.message });
  }
};

// Staff filtré pour le manager (par département)
export const getStaffByManager = async (req, res) => {
  try {
    const { _id, role } = req.user;
    console.log(`🔍 Requête reçue pour récupérer les staffs du manager ID: ${_id}, rôle: ${role}`);

    if (role !== "Manager") {
      console.warn(`⚠️ Accès refusé pour l'utilisateur ID: ${_id} avec rôle: ${role}`);
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const staffs = await Staff.find({ managerId: _id })
      .populate('departement', 'name description')  // Populer seulement certains champs
      .sort({ nom: 1 });

    console.log(`✅ ${staffs.length} staff(s) trouvé(s) pour le manager ID: ${_id}`);
    staffs.forEach(s => {
      console.log(`- Staff: ${s.nom} ${s.prenom}, Département: ${s.departement ? s.departement.name : "Non renseigné"}`);
    });

    res.status(200).json(staffs);

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du staff :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du staff" });
  }
};


export const getStaffByDepartment = async (req, res) => {
  const managerId = req.user.id;

  try {
    // Récupérer les départements gérés par ce manager
    const departments = await Department.find({ managerId });
    const departmentIds = departments.map(dep => dep._id);

    console.log(`🔍 Départements trouvés : ${departments.map(d => d.name).join(", ")}`);

    // Récupérer les staffs de ces départements
    const staffs = await Staff.find({ department: { $in: departmentIds } }).populate('department');

    console.log(`👥 ${staffs.length} staff(s) trouvé(s) pour le manager ${managerId}`);
    res.status(200).json(staffs);
  } catch (error) {
    console.error("❌ Erreur :", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};




// Statistiques globales
export const getStats = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const contratsExpirants = await Staff.find({
      dateFinContrat: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });

    const parDepartement = await Staff.aggregate([
      { $group: { _id: "$departement", count: { $sum: 1 } } }
    ]);

    const parTypeContrat = await Staff.aggregate([
      { $group: { _id: "$typeContrat", count: { $sum: 1 } } }
    ]);

    res.json({
      totalStaff,
      contratsExpirants,
      parDepartement: parDepartement.map(d => ({ nom: d._id, count: d.count })),
      parTypeContrat: parTypeContrat.map(t => ({ type: t._id, count: t.count }))
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur statistiques", error: err.message });
  }
};


// Récupérer les contrats expirants
export const getExpiredContracts = async (req, res) => {
  try {
    const expiredContracts = await Staff.find({
      dateFinContrat: { $lt: new Date() }
    }).sort({ dateFinContrat: 1 }); // Tri par date de fin de contrat

    if (expiredContracts.length === 0) {
      return res.status(404).json({ message: "Aucun contrat expirant trouvé." });
    }

    res.json(expiredContracts);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des contrats expirants", error: err.message });
  }
};

