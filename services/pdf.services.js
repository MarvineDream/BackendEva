import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const generateEvaluationPdf = async (evaluation, fileName) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 format
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = height - 50;

  const drawText = (text, options = {}) => {
    page.drawText(text, {
      x: 50,
      y: y,
      size: options.size || 12,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= options.spacing || 20;
  };

  // 📋 Titre
  drawText("FICHE D'ÉVALUATION", { size: 18, spacing: 30 });

  // 👤 Agent
  drawText(`Nom : ${evaluation.agent.nom}`);
  drawText(`Poste : ${evaluation.agent.emploi}`);
  drawText(`Date d'embauche : ${new Date(evaluation.agent.dateEmbauche).toLocaleDateString()}`);
  y -= 10;

  // 🎯 Objectifs
  drawText("Objectifs atteints :", { spacing: 25 });
  evaluation.objectifs.forEach((obj, i) => {
    drawText(`• ${obj.activite} - ${obj.pourcentageAtteinte}%`);
  });

  y -= 15;

  // 💬 Appréciation
  drawText("Appréciation globale :", { spacing: 25 });
  drawText(evaluation.appreciationGlobale || "—", { spacing: 40 });

  // ✍️ Signatures
  drawText(`Responsable : ${evaluation.signatures?.responsable || ""}`);
  drawText(`Collaborateur : ${evaluation.signatures?.collaborateur || ""}`);

  // 💾 Enregistrement
  const pdfBytes = await pdfDoc.save();
  const filePath = path.join("exports", `${fileName}.pdf`);
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
};
