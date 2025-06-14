import express from 'express';
import { deleteEvaluation, getAllEvaluations, getEvaluationById, getEvaluationsByManager, updateEvaluation, updateEvaluationStatus, updateOrCreateEvaluation } from '../Controllers/evaluationControllers.js';
import authMiddleware, { authorizeRoles } from '../middleware/auth.middleware.js';



const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Soumission de fiche (Manager ou RH)
router.post("/", authorizeRoles("manager", "RH"), updateOrCreateEvaluation);

// Lire une fiche spécifique
router.get("/:id", getEvaluationById);

// Toutes les fiches (Admin et RH uniquement)
router.get("/", authorizeRoles("admin", "RH"), getAllEvaluations);

// Fiches du manager connecté (Manager uniquement)
router.get("/manager/mine", authorizeRoles("Manager"), getEvaluationsByManager);

// Modifier une fiche
router.put("/:id", authorizeRoles("Manager", "RH"), updateEvaluation);

// Mettre à jour le statut d'une fiche (RH ou Admin)
router.put("/statut/:id", authorizeRoles("RH", "admin"), updateEvaluationStatus)

// Supprimer une fiche
router.delete("/:id", authorizeRoles("admin", "RH"), deleteEvaluation);




export default router;