import Activity from "../models/Activites.js";


export const getRecentActivities = async (req, res) => {
  console.log('[GET /activities] Requête reçue');

  try {
    console.log('[GET /activities] Tentative de récupération des activités depuis la base de données...');
    
    const activities = await Activity.find()
      .sort({ time: -1 })  
      .limit(10);
    
    console.log(`[GET /activities] ${activities.length} activité(s) récupérée(s)`);
    res.status(200).json(activities);

  } catch (err) {
    console.error('[GET /activities] Erreur lors de la récupération des activités :', err);
    res.status(500).json({
      message: 'Erreur lors de la récupération des activités',
      error: err?.message || err,
    });
  }
};


export const createActivity = async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'activité', error: err });
  }
};