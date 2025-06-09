import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getStaffById, getStaffByManager, getStats, updateStaff } from "../Controllers/staff.controllers.js";
import authMiddleware, { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/', authMiddleware, authorizeRoles("RH", "admin"), createStaff);
router.get('/stats', getStats);
router.get('/All', authMiddleware, authorizeRoles("RH", "admin"), getAllStaffs);
router.get('/manager', authMiddleware, authorizeRoles("Manager"), getStaffByManager);
router.get('/:id', getStaffById);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);





export default router;