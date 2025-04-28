import nodemailer from "nodemailer";
import fs from "fs";

export const sendEvaluationEmail = async (to, filePath, subject) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Évaluations RH" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: "Veuillez trouver ci-joint la fiche d'évaluation du personnel.",
    attachments: [
      {
        filename: filePath.split("/").pop(),
        path: filePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
