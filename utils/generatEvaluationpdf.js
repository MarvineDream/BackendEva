import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";

// ✅ Reconstitution de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📄 Fonction principale exportable
export const generateEvaluationPdf = async (evaluation, fileName) => {
  // 📂 Lecture du template HTML
  const templatePath = path.join(__dirname, "../templates/evaluationTemplate.html");
  const html = await fs.readFile(templatePath, "utf8");
  const template = Handlebars.compile(html);

  // 🧩 Données formatées pour le template
  const formattedData = {
    ...evaluation.agent,
    objectifs: evaluation.objectifs || [],
    competences: evaluation.competences || "—",
    integration: evaluation.integration || "—",
    appreciationGlobale: evaluation.appreciationGlobale || "—",
    decision: evaluation.decision || "—",
    responsable: evaluation.signatures?.responsable || "_______________",
    collaborateur: evaluation.signatures?.collaborateur || "_______________",
    dateEmbauche: evaluation.agent.dateEmbauche
      ? new Date(evaluation.agent.dateEmbauche).toLocaleDateString("fr-FR")
      : "—"
  };

  // 🔧 Génération du HTML final
  const finalHtml = template(formattedData);

  // 🧾 Lancement de Puppeteer
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: "networkidle0" });

  // 📁 Chemin de sortie du PDF
  const outputPath = path.join("exports", `${fileName}.pdf`);
  await fs.ensureDir("exports");
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });

  await browser.close();
  return outputPath;
};
