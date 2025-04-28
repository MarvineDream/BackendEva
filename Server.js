import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import EvaluationRoutes from './Routes/EvaluationRoutes.js';
import { connectToDatabase } from './config/db.js';
import authRoutes from './Routes/authRoute.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT;


connectToDatabase();

// Middleware pour permettre l'accès à l'API (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '1800');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, Origin, X-Requested-With, Content, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    
    // Gérer les requêtes OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); 
    }
  
    next(); 
  });



app.use(cors());
app.use(express.json());



app.use('/Evaluation', EvaluationRoutes);
app.use('/auth', authRoutes);





app.listen(PORT, () =>
    console.log(`Serveur a démarré 🚀 sur http://localhost:${PORT}`)
  );