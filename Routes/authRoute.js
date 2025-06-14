import express from "express";
import { createUserAccount, deleteUser, getAllUsers, login, updateUser} from "../Controllers/auth.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
//import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";



const router = express.Router();

router.post('/login', login);

// Route protegée pour créer un compte utilisateur
router.post('/creer', authMiddleware, authorizeRoles("RH"), createUserAccount);

// Route protegée pour obtenir tous les utilisateurs
router.get('/users', authMiddleware, authorizeRoles("RH"), getAllUsers);

// Route protegée pour mettre à jour un utilisateur
router.put('/:id', authMiddleware, authorizeRoles('RH'), updateUser);

// Route protegée pour supprimer un utilisateur
router.delete('/id', authMiddleware, authorizeRoles('RH'), deleteUser);








export default router;