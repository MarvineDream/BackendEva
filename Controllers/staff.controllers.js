import Staff from "../models/Staff.js";



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

    if (role !== "Manager") {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const staffs = await Staff.find({ managerId: _id }).sort({ nom: 1 });
res.status(200).json(staffs);

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du staff" });
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