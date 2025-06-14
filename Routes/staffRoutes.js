import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getExpiredContracts, getStaffByDepartment, getStaffById, getStaffByManager, getStats, updateStaff } from "../Controllers/staff.controllers.js";
import authMiddleware, { authorizeRoles, verifyToken } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/', authMiddleware, authorizeRoles("RH"), createStaff);
router.get('/stats', getStats);
router.get('/All', authMiddleware, authorizeRoles("RH"), getAllStaffs);
router.get('/by-departement/:id', authMiddleware, getStaffByDepartment);
router.get('/manager', authMiddleware, authorizeRoles("Manager"), getStaffByManager);
router.get('/:id', getStaffById);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.get('/staff/expired-contracts', getExpiredContracts)







export default router;