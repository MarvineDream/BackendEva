import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";

// 🧭 Résolution de __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateEvaluationPdf = async (evaluation, fileName) => {
  try {
    // 🧹 Nettoyer l'objet Mongoose
    const data = JSON.parse(JSON.stringify(evaluation));

    // 📄 Résoudre le chemin absolu du template HTML
    const templatePath = path.resolve(__dirname, "../templates/evaluationTemplate.html");

    // 🔐 Vérifie si le fichier existe avant de le lire
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Le fichier de template est introuvable : ${templatePath}`);
    }

    const html = await fs.readFile(templatePath, "utf8");

    // 🛠️ Compile le template Handlebars avec options de sécurité
    const template = Handlebars.compile(html, {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    });

    // 🗓️ Formatage des dates (format français)
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

    // 🖨️ Lance Puppeteer et génère le PDF
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    // 📂 Crée le dossier d'exports s’il n’existe pas
    const exportDir = path.resolve(__dirname, "../exports");
    await fs.ensureDir(exportDir);

    const outputPath = path.join(exportDir, `${fileName}.pdf`);
    await page.pdf({ path: outputPath, format: "A4", printBackground: true });

    await browser.close();
    return outputPath;
  } catch (error) {
    console.error("❌ Erreur génération PDF :", error.message);
    throw error;
  }
};