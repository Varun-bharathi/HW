import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  hfToken: process.env.HF_TOKEN,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  ai: {
    embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
    chatModel: "meta-llama/Llama-3.2-3B-Instruct",
    temperature: 0.1
  },
  chunks: {
    size: 1500, // Slightly larger for resumes
    overlap: 200
  },
  port: process.env.PORT || 3001
};