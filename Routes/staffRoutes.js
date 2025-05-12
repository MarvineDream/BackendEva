import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getCurrentUser, getStaffById, getStaffByManager, getStaffByRh, getStats, updateStaff } from "../Controllers/staff.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/', authMiddleware, authorizeRoles("RH", "admin"), createStaff);
router.get('/RH', getStaffByRh);
router.get('/stats', getStats);
router.get('/All', authMiddleware, authorizeRoles("RH", "admin"), getAllStaffs);
router.get('/:id', getStaffById);
router.get('/manager', authMiddleware, authorizeRoles(["Manager"]), getStaffByManager);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.get('/me', authMiddleware, getCurrentUser);




export default router;