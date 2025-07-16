import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Department from "../models/Departement.js";



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
      dateFinContrat,
      dateDebutStage,
      dateFinStage,
    } = req.body;

    if (!nom || !email || !poste || !departement || !typeContrat) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    // 🔍 Vérification des dates selon le type de contrat
    if (typeContrat === "CDI") {
      if (!dateEmbauche) {
        return res.status(400).json({ message: "Date d'embauche requise pour un CDI." });
      }
    } else if (typeContrat === "CDD") {
      if (!dateEmbauche || !dateFinContrat) {
        return res.status(400).json({ message: "Date d'embauche et de fin de contrat requises pour un CDD." });
      }
    } else if (typeContrat === "Stagiaire") {
      if (!dateDebutStage || !dateFinStage) {
        return res.status(400).json({ message: "Date de début et de fin de stage requises pour un stagiaire." });
      }
    }

    // 🔍 Récupérer le département
    const department = await Department.findById(departement);
    if (!department) {
      return res.status(404).json({ message: "Département introuvable" });
    }

    const managerId = department.managerId;
    const responsableId = role === "RH" ? _id : null;

    // 🎯 Construire dynamiquement le staff selon le type de contrat
    const newStaff = new Staff({
      nom,
      prenom,
      email,
      poste,
      departement,
      typeContrat,
      managerId,
      responsableId,
    });

    if (typeContrat === "CDI" || typeContrat === "CDD") {
      newStaff.dateEmbauche = new Date(dateEmbauche);
      if (typeContrat === "CDD") {
        newStaff.dateFinContrat = new Date(dateFinContrat);
      }
    }

    if (typeContrat === "Stagiaire") {
      newStaff.dateDebutStage = new Date(dateDebutStage);
      newStaff.dateFinStage = new Date(dateFinStage);
    }

    await newStaff.save();
    res.status(201).json({ message: "Staff ajouté avec succès", staff: newStaff });

  } catch (err) {
    console.error("Erreur création staff :", err);
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
    const staffs = await Staff.find()
      .populate("departement")
      .sort({ createdAt: -1 });

    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération staff", error: err.message });
  }
};


// Récupérer un membre du staff par ID avec logs

export const getStaffById = async (req, res) => {
  const { staffId } = req.params;

  console.log("📥 Requête GET /staff/:staffId");
  console.log("🔍 ID reçu :", staffId);

  try {
    const staff = await Staff.findById(staffId)
      .populate({
        path: "departement",
        select: "name",
        transform: (doc) => ({ _id: doc._id, nom: doc.name }) 
      })
      .lean();
    // Pour renvoyer un objet simple, optimisé pour la lecture

    if (!staff) {
      console.warn("⚠️ Staff non trouvé pour l'ID :", staffId);
      return res.status(404).json({ message: "Staff non trouvé" });
    }

    return res.status(200).json(staff);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération du staff :", err);
    return res.status(500).json({
      message: "Erreur récupération staff",
      error: err.message,
    });
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
    const { id: _id, role } = req.user;
    console.log("req.user = ", req.user);

    console.log(`Requête reçue pour récupérer les staffs du manager ID: ${_id}, rôle: ${role}`);

    if (role !== "Manager") {
      console.warn(`Accès refusé pour l'utilisateur ID: ${_id} avec rôle: ${role}`);
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const staffs = await Staff.find({ managerId: _id })
      .populate('departement', 'name description')
      .sort({ nom: 1 });

    console.log(`${staffs.length} staff(s) trouvé(s) pour le manager ID: ${_id}`);
    staffs.forEach(s => {
      console.log(`- Staff: ${s.nom} ${s.prenom}, Département: ${s.departement ? s.departement.name : "Non renseigné"}`);
    });

    res.status(200).json(staffs);

  } catch (error) {
    console.error("Erreur lors de la récupération du staff :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du staff" });
  }
};


export const getStaffByDepartment = async (req, res) => {
  const managerId = req.user.id;

  try {
    // Récupérer les départements gérés par ce manager
    const departments = await Department.find({ managerId });
    const departmentIds = departments.map(dep => dep._id);

    console.log(`Départements trouvés : ${departments.map(d => d.name).join(", ")}`);

    // Récupérer les staffs de ces départements
    const staffs = await Staff.find({ department: { $in: departmentIds } }).populate('department');

    console.log(`${staffs.length} staff(s) trouvé(s) pour le manager ${managerId}`);
    res.status(200).json(staffs);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};




// Statistiques globales
export const getStats = async (req, res) => {
  console.log("[getStats] Démarrage de la récupération des statistiques");

  try {
    const totalStaff = await Staff.countDocuments();
    console.log(`[getStats] Nombre total de staff : ${totalStaff}`);

    const contratsExpirants = await Staff.find({
      dateFinContrat: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    console.log(`[getStats] Contrats expirants dans 30 jours : ${contratsExpirants.length}`);

    const parDepartement = await Staff.aggregate([
      {
        $group: {
          _id: "$departement",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "departementInfo"
        }
      },
      { $unwind: "$departementInfo" },
      {
        $project: {
          nom: "$departementInfo.name",
          count: 1
        }
      }
    ]);
    console.log(`[getStats] Statistiques par département :`, parDepartement);

    const parTypeContrat = await Staff.aggregate([
      {
        $group: {
          _id: "$typeContrat",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    console.log(`[getStats] Statistiques par type de contrat :`, parTypeContrat);

    res.json({
      totalStaff,
      contratsExpirants,
      parDepartement,
      parTypeContrat
    });

    console.log("[getStats] Réponse envoyée avec succès !");
  } catch (err) {
    console.error("[getStats] Erreur :", err.message);
    res.status(500).json({
      message: "Erreur statistiques",
      error: err.message
    });
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


export const getStaffEvolution = async (req, res) => {
  console.log('[GET] /api/staff/evolution - Démarrage du traitement');

  try {
    console.log('Agrégation MongoDB en cours...');
    const result = await Staff.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log('Résultat agrégation brut :', result);

    const moisMap = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    const formatted = result.map((item) => ({
      mois: moisMap[item._id - 1],
      total: item.total,
    }));

    console.log('Données formatées pour le frontend :', formatted);

    res.json(formatted);
  } catch (err) {
    console.error('Erreur pendant l\'agrégation du personnel :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
