import Evaluation from "../models/Evaluation.js";
import EvaluationPotentiel from "../models/EvaluationPotentiel.js";
import { sendEvaluationEmail } from "../services/mail.service.js";
import { generateEvaluationPdf } from "../utils/generatEvaluationpdf.js";
import Activity from "../models/Activites.js";



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
    const { staffId, managerId, periodeEvaluation, data } = req.body;

    try {
        const evaluationExistante = await Evaluation.findOne({
            staffId,
            managerId,
            periodeEvaluation,
            statut: { $ne: 'Finalisé' }
        });

        if (evaluationExistante) {
            // Mise à jour progressive
            Object.assign(evaluationExistante, {
                objectifs: data.objectifs,
                integration: data.integration,
                competences: data.competences,
                appreciationGlobale: data.appreciationGlobale,
                commentaire: data.commentaire,
            });

            await evaluationExistante.save();

            // Créer une activité dans la collection
            await Activity.create({
                type: 'evaluation',
                title: 'Évaluation mise à jour',
                description: `Évaluation de ${staffId} mise à jour pour la période ${periodeEvaluation}`,
                time: new Date()
            });

            return res.status(200).json(evaluationExistante);
        } else {
            const nouvelle = new Evaluation(data);
            await nouvelle.save();

            // Créer une activité dans la collection
            await Activity.create({
                type: 'evaluation',
                title: 'Nouvelle évaluation créée',
                description: `Nouvelle évaluation créée pour ${staffId} pendant la période ${periodeEvaluation}`,
                time: new Date()
            });

            return res.status(201).json(nouvelle);
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour ou de la création de l'évaluation :", error);
        return res.status(500).json({ message: "Erreur interne du serveur", error });
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
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Fiche non trouvée" });
    res.json(evaluation);
  } catch (err) {
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



