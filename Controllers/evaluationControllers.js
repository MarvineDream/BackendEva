import Evaluation from "../models/Evaluation.js";
import EvaluationPotentiel from "../models/EvaluationPotentiel.js";
import { sendEvaluationEmail } from "../services/mail.service.js";
import { generateEvaluationPdf } from "../utils/generatEvaluationpdf.js";
import Activity from "../models/Activites.js";
import EvaluationPotentiel from "../models/EvaluationPotentiel.js";



// ✏️ Créer une évaluation
export const createEvaluation = async (req, res) => {
  try {
    const evaluation = new Evaluation({
      staffId,
      agent: req.body.agent,
      objectifs: req.body.objectifs,
      integration: req.body.integration,
      competences: req.body.competences,
      appreciationGlobale: req.body.appreciationGlobale,
      signatures: req.body.signatures,
      decision: req.body.decision,
      createdBy: req.user._id,
      statut: req.body.statut || "En attente",
      dateSoumission: req.body.dateSoumission || new Date()
    });

    await evaluation.save();

    // 📄 Génération du PDF
    const filePath = await generateEvaluationPdf(evaluation, `evaluation_${evaluation._id}.pdf`);

    // 📧 Envoi par mail au RH (adresse à adapter dynamiquement si besoin)
    await sendEvaluationEmail(
      "rh@tonentreprise.com",
      filePath,
      `Évaluation de ${agent.nom} ${agent.prenom}`,
      `Voici la fiche d'évaluation de ${agent.nom} ${agent.prenom}.`
    );

    res.status(201).json({
      message: "Évaluation soumise avec succès.",
      evaluation
    });
  } catch (err) {
    console.error("Erreur lors de la création d'une évaluation :", err);
    res.status(500).json({
      message: "Erreur lors de la création de l'évaluation.",
      error: err.message
    });
  }
};


export const updateOrCreateEvaluation = async (req, res) => {
  const { staffId, managerId, dateEvaluation, data, isFinal = false, lastStep } = req.body;

  console.log("📥 Requête POST /Evaluation/save reçue");
  console.log({ staffId, managerId, dateEvaluation, isFinal, lastStep, data });

  if (!staffId || !managerId || !dateEvaluation) {
    return res.status(400).json({
      message: "Les champs staffId, managerId et dateEvaluation sont obligatoires",
    });
  }

  if (!data) {
    return res.status(400).json({
      message: "Les données d'évaluation (data) sont obligatoires",
    });
  }

  if (!data.agent) {
    return res.status(400).json({
      message: "Les informations de l'agent sont obligatoires dans les données",
    });
  }

  try {
    // Recherche d'une évaluation existante non finalisée
    let evaluation = await Evaluation.findOne({
      staffId,
      dateEvaluation,
      statutEvaluation: { $ne: "Terminée" },
    });

    // Fonction utilitaire pour s'assurer qu'on a une string
    const safeString = (value) => {
      if (typeof value === 'string') return value;
      if (value === undefined || value === null) return '';
      // Si c'est un objet, on peut le transformer en JSON string ou retourner vide
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    if (evaluation) {
      console.log("Mise à jour de l’évaluation existante :", evaluation._id);

      if (data.agent !== undefined) evaluation.agent = data.agent;
      if (data.objectifsFixes !== undefined) evaluation.objectifs = data.objectifsFixes;
      if (data.objectifsHorsFixes !== undefined) evaluation.objectifsHorsFixes = data.objectifsHorsFixes;
      if (data.integration !== undefined) evaluation.integration = data.integration;
      if (data.competences !== undefined) evaluation.competences = data.competences;
      if (data.appreciationGlobale !== undefined) evaluation.appreciationGlobale = data.appreciationGlobale;
      if (data.commentaire !== undefined) evaluation.commentaire = data.commentaire;
      if (data.decision !== undefined) evaluation.decision = safeString(data.decision);
      if (data.signatures !== undefined) evaluation.signatures = data.signatures;

      evaluation.statutEvaluation = isFinal ? "Terminée" : "En cours";
      evaluation.dateDerniereModification = new Date();
      evaluation.createdBy = managerId;

      if (lastStep) {
        evaluation.lastStep = lastStep;
      }

      await evaluation.save();

      await Activity.create({
        type: "evaluation",
        title: isFinal ? "Évaluation finalisée" : "Évaluation mise à jour",
        description: `Évaluation de ${staffId} ${isFinal ? "finalisée" : "mise à jour"} pour la période ${dateEvaluation}`,
        time: new Date(),
      });

      return res.status(200).json({
        message: isFinal ? "Évaluation finalisée avec succès" : "Brouillon mis à jour",
        evaluation,
      });
    }

    // Création d'une nouvelle évaluation
    evaluation = new Evaluation({
      staffId,
      createdBy: managerId,
      dateEvaluation,
      statutEvaluation: isFinal ? "Terminée" : "En cours",
      lastStep: lastStep || "objectifs",
      agent: data.agent,
      objectifs: data.objectifsFixes || [],
      objectifsHorsFixes: data.objectifsHorsFixes || [],
      integration: data.integration || {},
      competences: data.competences || {},
      appreciationGlobale: data.appreciationGlobale || {},
      commentaire: data.commentaire || '',
      decision: safeString(data.decision),
      signatures: data.signatures || {},
      dateCreation: new Date(),
      dateDerniereModification: new Date(),
    });

    await evaluation.save();

    await Activity.create({
      type: "evaluation",
      title: "Nouvelle évaluation créée",
      description: `Nouvelle évaluation créée pour ${staffId} pendant la période ${dateEvaluation}`,
      time: new Date(),
    });

    return res.status(201).json({
      message: isFinal ? "Évaluation créée et finalisée" : "Nouvelle évaluation créée",
      evaluation,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création/mise à jour de l’évaluation :", error);
    return res.status(500).json({
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};



// Récupérer toutes les évaluations
export const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

// Récupérer une évaluation par ID
export const getEvaluationById = async (req, res) => {
  console.log("📥 [getEvaluationById] Requête reçue");
  console.log("🔍 ID reçu :", req.params.id);

  try {
    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      console.warn("⚠️ Aucune fiche trouvée pour cet ID :", req.params.id);
      return res.status(404).json({ message: "Fiche non trouvée" });
    }

    console.log(" Évaluation trouvée :", evaluation);
    res.json(evaluation);
  } catch (err) {
    console.error("❌❌ Erreur lors de la récupération de l'évaluation :", err);
    res.status(500).json({ message: "Erreur de récupération", error: err.message });
  }
};


// Evaluations soumises par un manager
export const getEvaluationsByManager = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ createdBy: req.user._id });
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: "Erreur", error });
  }
};

// Mettre à jour une évaluation
export const updateEvaluation = async (req, res) => {
  try {
    const updated = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Fiche non trouvée" });
    res.json({ message: "Mise à jour réussie", evaluation: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur de mise à jour", error: err.message });
  }
};


// Mettre à jour le statut d'une évaluation (RH ou Admin)
export const updateEvaluationStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const updated = await Evaluation.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Fiche non trouvée" });
    res.status(200).json({ message: "Statut mis à jour", updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une évaluation
export const deleteEvaluation = async (req, res) => {
  try {
    const deleted = await Evaluation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Fiche non trouvée" });
    res.json({ message: "Fiche supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};


export const getEvaluationsByStaff = async (req, res) => {
  const { id: staffId } = req.params;

  console.log("📥 GET /Evaluation/staff/:id reçu");
  console.log("🔍 Param staffId:", staffId);

  try {
    const evaluations = await Evaluation.find({ staffId });

    console.log(`📦 ${evaluations.length} évaluation(s) trouvée(s)`);
    return res.status(200).json(evaluations); // ✅ même si vide
  } catch (error) {
    console.error("❌ Erreur dans getEvaluationsByStaff:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};



// Récupérer l'évaluation en cours pour un staff et une date donnée
export const getEvaluationInProgress = async (req, res) => {
  const { id, dateEvaluation } = req.params;

  console.log("📥 GET /Evaluation/staff/:staffId/:dateEvaluation reçu");
  console.log(`🔍 Params reçus -> staffId: ${id}, dateEvaluation: ${dateEvaluation}`);

  if (!id || !dateEvaluation) {
    console.warn("⚠️ staffId ou dateEvaluation manquants dans la requête");
    return res.status(400).json({ message: "Le staffId et la dateEvaluation sont obligatoires." });
  }

  try {
    console.log("🔎 Recherche de l'évaluation en cours dans la base...");

    // Convertir la date string en Date + créer un intervalle de 24h
    const dateStart = new Date(dateEvaluation);
    const dateEnd = new Date(dateEvaluation);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const evaluation = await Evaluation.findOne({
      staffId: id,
      dateEvaluation: { $gte: dateStart, $lt: dateEnd },
      statutEvaluation: { $ne: "Terminée" },
    });

    if (!evaluation) {
      console.info(`ℹ️ Aucune évaluation en cours trouvée pour staffId=${id}, date=${dateEvaluation}`);
      return res.status(404).json({ message: "Aucune évaluation en cours trouvée pour ce staff et cette période." });
    }

    console.log(`✅ Évaluation trouvée : id=${evaluation._id}`);
    return res.status(200).json({ evaluation });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'évaluation :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};




/*export const saveStepEvaluation = async (req, res) => {
  const { staffId, managerId, periodeEvaluation, data, isFinal } = req.body;

  console.log(' Reçu pour /Evaluation/save:', {
    staffId,
    managerId,
    periodeEvaluation,
    isFinal,
  });

  // Vérifie juste la présence des IDs de base, pas les données complètes
  if (!staffId || !managerId || !periodeEvaluation) {
    return res.status(400).json({
      message: 'Les champs staffId, managerId et periodeEvaluation sont obligatoires',
    });
  }

  try {
    // Recherche une évaluation non finalisée existante
    let evaluation = await Evaluation.findOne({
      staffId,
      managerId,
      periodeEvaluation,
      statut: { $ne: 'Finalisé' },
    });

    if (evaluation) {
      console.log(' Mise à jour évaluation existante :', evaluation._id);

      // Pour chaque champ dans data, on met à jour seulement s'il existe
      if (data.objectifs !== undefined) evaluation.objectifs = data.objectifs;
      if (data.integration !== undefined) evaluation.integration = data.integration;
      if (data.competences !== undefined) evaluation.competences = data.competences;
      if (data.appreciationGlobale !== undefined) evaluation.appreciationGlobale = data.appreciationGlobale;
      if (data.decision !== undefined) evaluation.decision = data.decision;
      if (data.signatures !== undefined) evaluation.signatures = data.signatures;
      if (data.commentaire !== undefined) evaluation.commentaire = data.commentaire;

      if (isFinal) {
        evaluation.statut = 'Finalisé';
      }

      await evaluation.save();

      await Activity.create({
        type: 'evaluation',
        title: isFinal ? 'Évaluation finalisée' : 'Évaluation mise à jour',
        description: `Évaluation de ${staffId} ${isFinal ? 'finalisée' : 'mise à jour'} pour ${periodeEvaluation}`,
        time: new Date(),
      });

      return res.status(200).json({ message: 'Évaluation mise à jour', evaluation });
    }

    // Si aucune évaluation existante, on crée avec les données reçues
    evaluation = new Evaluation({
      staffId,
      managerId,
      periodeEvaluation,
      statut: isFinal ? 'Finalisé' : 'En cours',
      objectifs: data.objectifs || [],
      integration: data.integration || [],
      competences: data.competences || {},
      appreciationGlobale: data.appreciationGlobale || {},
      decision: data.decision || {},
      signatures: data.signatures || {},
      commentaire: data.commentaire || '',
    });

    await evaluation.save();

    await Activity.create({
      type: 'evaluation',
      title: 'Nouvelle évaluation créée',
      description: `Nouvelle évaluation pour ${staffId}, période ${periodeEvaluation}`,
      time: new Date(),
    });

    return res.status(201).json({ message: 'Évaluation créée', evaluation });
  } catch (error) {
    console.error(' Erreur sauvegarde évaluation :', error);
    return res.status(500).json({ message: 'Erreur interne serveur', error: error.message });
  }
}; */

export const createEvaluationPotentiel = async (req, res) => {
  try {
    const {
      staffId,
      criteres,
      commentaire,
      classificationFinale,
      periodeEvaluation = 'Potentiel',
    } = req.body;

    if (!staffId || !criteres || criteres.length === 0) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const noteGlobale = criteres.reduce((acc, curr) => acc + curr.note, 0);
    const moyenne = noteGlobale / criteres.length;

    let classificationAutomatique = '';
    if (moyenne <= 2.5) classificationAutomatique = 'PROFESSIONAL';
    else if (moyenne <= 4) classificationAutomatique = 'ACHIEVER';
    else classificationAutomatique = 'POTENTIAL';

    const evaluation = await EvaluationPotentiel.create({
      staffId,
      dateEvaluation: new Date(),
      criteres,
      commentaire,
      type: 'EvaluationPotentiel',
      noteGlobale,
      moyenne,
      classificationAutomatique,
      classificationFinale,
    });

    res.status(201).json({ message: 'Évaluation enregistrée', evaluation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création." });
  }
};