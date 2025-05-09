import Evaluation from "../models/Evaluation.js";
import { sendEvaluationEmail } from "../services/mail.service.js";
import { generateEvaluationPdf } from "../utils/generatEvaluationpdf.js";


// ✏️ Créer une évaluation
export const createEvaluation = async (req, res) => {
  try {
    const evaluation = new Evaluation({
      agent: req.body.agent,
      objectifs: req.body.objectifs,
      integration: req.body.integration,
      competences: req.body.competences,
      appreciationGlobale: req.body.appreciationGlobale,
      signatures: req.body.signatures,
      decision: req.body.decision,
      statut: req.body.statut || "En attente",
      dateSoumission: req.body.dateSoumission || new Date()
    });

    await evaluation.save();

    // ✅ GÉNÉRATION AVEC PUPPETEER
    const filePath = await generateEvaluationPdf(evaluation, `evaluation_${evaluation._id}`);

    await sendEvaluationEmail("mougoulastevine@gmail.com", filePath, `Évaluation PDF de ${evaluation.agent.nom}`);
    res.status(201).json({ message: "Évaluation créée avec succès.", evaluation });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de l'évaluation : " + err.message });
  }
};

// 📝 Récupérer toutes les évaluations
export const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des évaluations : " + err.message });
  }
};

// 🔍 Récupérer une évaluation par ID
export const getEvaluationById = async (req, res) => {
  try {
    const evalua = await Evaluation.findById(req.params.id);
    if (!evalua) return res.status(404).json({ message: "Évaluation non trouvée" });
    res.json(evalua);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'évaluation : " + err.message });
  }
};

// ✏️ Mettre à jour une évaluation
export const updateEvaluation = async (req, res) => {
  try {
    const updated = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Évaluation non trouvée" });
    res.json({ message: "Évaluation mise à jour avec succès.", updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'évaluation : " + err.message });
  }
};

// 🗑 Supprimer une évaluation
export const deleteEvaluation = async (req, res) => {
  try {
    const deleted = await Evaluation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Évaluation non trouvée" });
    res.json({ message: "Évaluation supprimée avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'évaluation : " + err.message });
  }
};
