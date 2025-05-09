import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getStaffById, getStaffByManager, getStats, updateStaff } from "../Controllers/staff.controllers.js";
//import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/', createStaff);
router.get('/stats', getStats);
router.get('/All', getAllStaffs);
router.get('/:id', getStaffById);
router.get('/manager', getStaffByManager);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);




export default router;