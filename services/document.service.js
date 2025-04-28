import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";

export const generateEvaluationDoc = async (evaluation, fileName) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "FICHE D'ÉVALUATION", bold: true, size: 32 }),
              new TextRun("\n\n"),
              new TextRun(`Nom : ${evaluation.agent.nom}`),
              new TextRun(`\nPoste : ${evaluation.agent.emploi}`),
              new TextRun(`\nDate embauche : ${new Date(evaluation.agent.dateEmbauche).toLocaleDateString()}`),
              new TextRun("\n\nObjectifs atteints :")
            ],
          }),
          ...evaluation.objectifs.map((obj, index) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `Objectif ${index + 1} : ${obj.activite} (${obj.pourcentageAtteinte}%)`,
                }),
              ],
            })
          ),
          new Paragraph({
            children: [
              new TextRun("\n\nAppréciation :"),
              new TextRun(`\n${evaluation.appreciationGlobale}`),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join("exports", `${fileName}.docx`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};
