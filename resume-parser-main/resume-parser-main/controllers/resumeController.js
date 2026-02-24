import { supabase } from '../supabaseClient.js';
import * as utils from '../utils/resumeUtils.js';

export const uploadJobDescription = async (req, res) => {
  try {
    const { role, description, experience } = req.body;
    const embedding = await utils.getEmbedding(`${role} ${description} ${experience}`);

    const { data, error } = await supabase
      .from('jobs')
      .insert({ role, description, experience, embedding })
      .select('id').single();

    if (error) throw error;
    res.json({ job_id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const parseResume = async (req, res) => {
  try {
    const jobDesc = req.body.job_description;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!jobDesc) return res.status(400).json({ error: "Missing job description" });

    const { fullText, rawText } = await utils.parsePDFAndChunk(req.file.buffer);

    const score = await utils.generateMatchScore(fullText, jobDesc);

    res.json({ resume_score: score, extracted_text_preview: rawText.substring(0, 500) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ingestResume = async (req, res) => {
  try {
    const { candidate_id, candidate_name, job_id } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { fullText, rawText } = await utils.parsePDFAndChunk(req.file.buffer);

    const { data: job } = await supabase.from('jobs').select('description').eq('id', job_id).single();
    if (!job) return res.status(404).json({ error: "Job ID not found" });

    const embedding = await utils.getEmbedding(fullText.substring(0, 3000));
    const score = await utils.generateMatchScore(fullText, job.description);

    const { error } = await supabase.from('resumes').insert({
      candidate_id,
      candidate_name,
      job_id,
      resume_text: rawText,
      embedding,
      score
    });

    if (error) throw error;
    res.json({ message: "Resume processed", score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCandidateList = async (req, res) => {
  try {
    const { job_id } = req.body;
    const { data, error } = await supabase
      .from('resumes')
      .select('candidate_id, candidate_name, score')
      .eq('job_id', job_id)
      .order('score', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobIds = async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobs').select('id, role');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};