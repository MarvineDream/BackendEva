import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generateEvaluationPdf = async (evaluation, fileName) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = height - 50;

  const drawText = (text, options = {}) => {
    page.drawText(text, {
      x: options.x || 50,
      y: y,
      size: options.size || 12,
      font: options.font || font,
      color: rgb(0, 0, 0)
    });
    y -= options.spacing || 20;
  };

  const drawSectionTitle = (title) => {
    drawText(title.toUpperCase(), { font: fontBold, size: 14, spacing: 25 });
  };

  const drawLine = (space = 15) => {
    y -= space;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7)
    });
    y -= 10;
  };

  // 🟦 Titre centré
  page.drawText("FICHE D'ÉVALUATION", {
    x: 180,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0)
  });
  y -= 40;

  // 👤 Informations Agent
  drawSectionTitle("Informations de l'agent");
  drawText(`Nom : ${evaluation.agent.nom}`);
  drawText(`Prénom : ${evaluation.agent.prenom}`);
  drawText(`Poste : ${evaluation.agent.emploi}`);
  drawText(`Date d'embauche : ${new Date(evaluation.agent.dateEmbauche).toLocaleDateString()}`);
  drawLine();

  // 🎯 Objectifs atteints
  drawSectionTitle("Objectifs atteints");
  if (evaluation.objectifs?.length > 0) {
    evaluation.objectifs.forEach((obj, index) => {
      drawText(`• ${obj.activite} — ${obj.pourcentageAtteinte}%`);
    });
  } else {
    drawText("Aucun objectif renseigné.");
  }
  drawLine();

  // ✅ Compétences & intégration
  drawSectionTitle("Compétences & intégration");
  drawText(`Intégration : ${evaluation.integration || "—"}`);
  drawText(`Compétences : ${evaluation.competences || "—"}`);
  drawLine();

  // 💬 Appréciation globale
  drawSectionTitle("Appréciation globale");
  drawText(evaluation.appreciationGlobale || "—", { spacing: 40 });
  drawLine();

  // 🔏 Signatures
  drawSectionTitle("Signatures");
  drawText(`Responsable : ${evaluation.signatures?.responsable || "_______________"}`);
  drawText(`Collaborateur : ${evaluation.signatures?.collaborateur || "_______________"}`);
  drawLine();

  // 🧾 Décision
  drawSectionTitle("Décision");
  drawText(evaluation.decision || "—");
  drawLine(30);

  // 💾 Sauvegarde
  const pdfBytes = await pdfDoc.save();
  const filePath = path.join("exports", `${fileName}.pdf`);
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
};
