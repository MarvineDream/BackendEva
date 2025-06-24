import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getExpiredContracts, getStaffByDepartment, getStaffById, getStaffByManager, getStaffEvolution, getStats, updateStaff } from "../Controllers/staff.controllers.js";
import authMiddleware, { authorizeRoles, verifyToken } from "../middleware/auth.middleware.js";


const router = express.Router();

// Route pour créer un nouveau staff uniquement accessible aux RH
router.post('/', authMiddleware, authorizeRoles("RH"), createStaff);

// Route pour récupérer les statistiques
router.get('/stats', getStats);

router.get('/evolution', getStaffEvolution);

// Route pour lister tous les staffs
router.get('/All', authMiddleware, authorizeRoles("RH"), getAllStaffs);

// Route pour récupérer les staffs par département
router.get('/by-departement/:id', authMiddleware, getStaffByDepartment);

// Route pour pour récupérer la liste des staff d'un manager
router.get('/manager', authMiddleware, authorizeRoles("Manager"), getStaffByManager);


router.get('/:id', getStaffById);


router.put('/:id', updateStaff);


router.delete('/:id', deleteStaff);


router.get('/staff/expired-contracts', getExpiredContracts)







export default router;