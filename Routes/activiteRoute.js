import express from 'express';
import { createActivity, getRecentActivities } from '../Controllers/activiteControllers.js';


const router = express.Router();

router.get('/', getRecentActivities);
router.post('/', createActivity);

export default router;
