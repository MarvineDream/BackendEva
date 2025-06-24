import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import Department from "../models/Departement.js";
import dotenv from 'dotenv';



dotenv.config();


const updateManagerIdsForStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const allStaff = await Staff.find({ managerId: { $exists: false } });

    for (const staff of allStaff) {
      if (!staff.departement) continue;

      const department = await Department.findById(staff.departement);
      if (!department || !department.managerId) continue;

      staff.managerId = department.managerId;
      await staff.save();
      console.log(`✔️ ${staff.nom} ${staff.prenom} mis à jour (managerId: ${department.managerId})`);
    }

    console.log("✅ Mise à jour terminée");
    process.exit();
  } catch (error) {
    console.error("❌ Erreur pendant la mise à jour :", error);
    process.exit(1);
  }
};

updateManagerIdsForStaff();
