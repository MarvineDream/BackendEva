import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";

// ⚙️ Support ESM (__dirname alternative)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateEvaluationPdf = async (evaluation, fileName) => {
  try {
    // 🔄 Nettoyer les données Mongoose
    const data = JSON.parse(JSON.stringify(evaluation));

    // 📄 Charger le template HTML
    const templatePath = path.join(__dirname, "../templates/evaluationTemplate.html");
    const html = await fs.readFile(templatePath, "utf8");

    // 🛠️ Compiler Handlebars avec les options pour permettre l'accès aux propriétés héritées
    const template = Handlebars.compile(html, {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true, // optionnelle
    });

    // 📊 Préparer les données à injecter dans le template
    const formattedData = {
      ...data,
      dateEmbauche: data.agent?.dateEmbauche
        ? new Date(data.agent.dateEmbauche).toLocaleDateString("fr-FR")
        : "",
      dateDebutCDD: data.agent?.dateDebutCDD
        ? new Date(data.agent.dateDebutCDD).toLocaleDateString("fr-FR")
        : "",
      dateFinCDD: data.agent?.dateFinCDD
        ? new Date(data.agent.dateFinCDD).toLocaleDateString("fr-FR")
        : "",
    };

    const finalHtml = template(formattedData);

    // 🖨️ Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    const outputPath = path.join("exports", `${fileName}.pdf`);
    await page.pdf({ path: outputPath, format: "A4", printBackground: true });

    await browser.close();
    return outputPath;
  } catch (error) {
    console.error("Erreur génération PDF :", error.message);
    throw error;
  }
};
