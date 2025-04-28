import express from 'express';
import { createEvaluation, deleteEvaluation, getAllEvaluations, getEvaluationById, updateEvaluation } from '../Controllers/evaluationControllers.js';
//import { verifyToken } from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/', createEvaluation);
router.get('/', getAllEvaluations);
router.get('/:id', getEvaluationById);
router.put('/:id', updateEvaluation);
router.delete('/:id', deleteEvaluation);




export default router;