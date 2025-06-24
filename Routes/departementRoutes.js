import express from "express";
import { assignDepartementsToManager, createDepartement, deleteDepartement, getAllDepartements, getDepartementById, updateDepartement } from "../Controllers/departementControllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();


// Route pour créer un département
router.post('/', authMiddleware, authorizeRoles("RH"), createDepartement);

// Route pour assigner des départements à un manager
router.post('/managers/:managerId/departements', authMiddleware, authorizeRoles("RH"), assignDepartementsToManager);

// Route pour lister tous les départements
router.get('/', getAllDepartements);

// Route pour recuperer un departement
router.get('/:id', getDepartementById);

// Route pour mettre à jour un département
router.put('/:id', authMiddleware, authorizeRoles("RH"), updateDepartement);


// Route pour supprimer un département
router.delete('/:id', authMiddleware, authorizeRoles("RH"), deleteDepartement);


export default router;