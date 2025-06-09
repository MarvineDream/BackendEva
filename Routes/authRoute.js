import express from "express";
import { createUserAccount, login} from "../Controllers/auth.controllers.js";
//import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";



const router = express.Router();

router.post('/login', login);

// 
router.post('/creer', createUserAccount);



export default router;