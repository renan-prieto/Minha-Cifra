const fs = require("node:fs");
const path = require("node:path");

const KNOWLEDGE_FILE = path.join(__dirname, "knowledge", "financial-guidance.md");
const STOP_WORDS = new Set([
  "a", "ao", "aos", "aquela", "aquele", "as", "com", "como", "da", "das",
  "de", "do", "dos", "e", "ela", "ele", "em", "essa", "esse", "esta", "este",
  "eu", "isso", "isto", "ja", "mais", "mas", "me", "meu", "minha", "na", "nas",
  "no", "nos", "o", "os", "ou", "para", "pela", "pelas", "pelo", "pelos", "por",
  "qual", "que", "se", "sem", "sua", "suas", "tambem", "um", "uma", "voce",
]);

const tokenize = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]{2,}/g)
    ?.filter((token) => !STOP_WORDS.has(token)) || [];

const loadKnowledgeBase = (filePath = KNOWLEDGE_FILE) => {
  const markdown = fs.readFileSync(filePath, "utf8");
  const sections = markdown.split(/(?=^## )/m).filter(Boolean);

  return sections.flatMap((section) => {
    const [heading, ...paragraphs] = section.trim().split(/\n\s*\n/);
    const title = heading.replace(/^##\s*/, "").trim();

    return paragraphs
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map((text) => ({ title, text }));
  });
};

const retrieveRelevantDocuments = (query, documents = loadKnowledgeBase(), limit = 4) => {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || documents.length === 0) return [];

  const tokenizedDocuments = documents.map((document) => tokenize(`${document.title} ${document.text}`));
  const averageLength = tokenizedDocuments.reduce((sum, tokens) => sum + tokens.length, 0) / documents.length || 1;
  const documentFrequency = new Map();

  for (const tokens of tokenizedDocuments) {
    for (const term of new Set(tokens)) {
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
    }
  }

  const ranked = documents.map((document, index) => {
    const tokens = tokenizedDocuments[index];
    const frequencies = new Map();
    for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);

    const score = queryTerms.reduce((total, term) => {
      const frequency = frequencies.get(term) || 0;
      if (frequency === 0) return total;

      const documentFrequencyForTerm = documentFrequency.get(term) || 0;
      const inverseFrequency = Math.log(
        1 + (documents.length - documentFrequencyForTerm + 0.5) / (documentFrequencyForTerm + 0.5),
      );
      const lengthNormalization = frequency + 1.2 * (0.25 + 0.75 * (tokens.length / averageLength));
      return total + inverseFrequency * ((frequency * 2.2) / lengthNormalization);
    }, 0);

    return { ...document, score };
  });

  return ranked
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
};

const buildGroundingContext = (documents) =>
  documents
    .map((document, index) => `[${index + 1}] ${document.title}\n${document.text}`)
    .join("\n\n");

module.exports = { buildGroundingContext, loadKnowledgeBase, retrieveRelevantDocuments };