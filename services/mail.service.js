import nodemailer from "nodemailer";
import fs from "fs";

export const sendEvaluationEmail = async (to, pdfPath, subject) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // ou smtp.office365.com, selon ton service
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Évaluations RH" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: "Veuillez trouver ci-joint la fiche d’évaluation au format PDF.",
    attachments: [
      {
        filename: "fiche_evaluation.pdf",
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
