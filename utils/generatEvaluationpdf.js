import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";

export const generateEvaluationPdf = async (evaluation, fileName) => {
  const templatePath = path.join(__dirname, "../templates/evaluationTemplate.html");
  const html = await fs.readFile(templatePath, "utf8");

  const template = Handlebars.compile(html);

  const formattedData = {
    ...evaluation.agent,
    objectifs: evaluation.objectifs || [],
    competences: evaluation.competences || "—",
    integration: evaluation.integration || "—",
    appreciationGlobale: evaluation.appreciationGlobale || "—",
    decision: evaluation.decision || "—",
    responsable: evaluation.signatures?.responsable || "_______________",
    collaborateur: evaluation.signatures?.collaborateur || "_______________",
    dateEmbauche: new Date(evaluation.agent.dateEmbauche).toLocaleDateString("fr-FR"),
  };

  const finalHtml = template(formattedData);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(finalHtml, { waitUntil: "networkidle0" });

  const outputPath = path.join("exports", `${fileName}.pdf`);
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });

  await browser.close();
  return outputPath;
};
