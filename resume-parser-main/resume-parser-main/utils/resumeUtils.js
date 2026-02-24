import pdf from 'pdf-parse-fork';
import { InferenceClient } from "@huggingface/inference";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CONFIG } from '../config.js';

const hf = new InferenceClient(CONFIG.hfToken);

export const sanitizeText = (text) => {
  return text.replace(/\\/g, '\\\\').replace(/\u0000/g, '').replace(/[\u007F-\uFFFF]/g, (chr) => {
    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4);
  });
};

export const getEmbedding = async (text) => {
  const response = await hf.featureExtraction({
    model: CONFIG.ai.embeddingModel,
    inputs: text,
  });
  return Array.isArray(response[0]) ? response[0] : response;
};

export const parsePDFAndChunk = async (buffer) => {
  const pdfData = await pdf(buffer, {});
  const cleanText = sanitizeText(pdfData.text);
  
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.chunks.size,
    chunkOverlap: CONFIG.chunks.overlap
  });
  
  const chunks = await splitter.splitText(cleanText);
  return { fullText: chunks.join(" "), rawText: cleanText };
};

export const generateMatchScore = async (resumeText, jobDesc) => {
  const prompt = `Analyze this resume against the Job Description. 
  Provide a match score from 0-100 based on technical fit.
  Return ONLY the numerical score.
  Job: ${jobDesc.substring(0, 500)}
  Resume: ${resumeText.substring(0, 2000)}`;

  const res = await hf.chatCompletion({
    model: CONFIG.ai.chatModel,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 10,
    temperature: 0.1
  });
  return parseInt(res.choices[0].message.content.replace(/\D/g, '')) || 0;
};