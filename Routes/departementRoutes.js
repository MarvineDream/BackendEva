import express from "express";
import { createDepartement, deleteDepartement, getAllDepartements, updateDepartement } from "../Controllers/departementControllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();


// Route pour créer un département
router.post('/', authMiddleware, authorizeRoles("RH"), createDepartement);

// Route pour lister tous les départements
router.get('/', authMiddleware, authorizeRoles("RH"), getAllDepartements);

// Route pour mettre à jour un département
router.put('/:id', authMiddleware, authorizeRoles("RH"), updateDepartement);

// Route pour supprimer un département
router.delete('/:id', authMiddleware, authorizeRoles("RH"), deleteDepartement);


export default router;