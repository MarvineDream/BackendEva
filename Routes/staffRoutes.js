import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getStaffById, getStaffByManager, getStaffByRh, getStats, updateStaff } from "../Controllers/staff.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import { get } from "mongoose";


const router = express.Router();

router.post('/', authorizeRoles("RH", "admin"), createStaff);
router.get('/RH', getStaffByRh);
router.get('/stats', getStats);
router.get('/All', authMiddleware, authorizeRoles("RH", "admin"), getAllStaffs);
router.get('/:id', getStaffById);
router.get('/manager', authMiddleware, authorizeRoles(["manager"]), getStaffByManager);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);




export default router;