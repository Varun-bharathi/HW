import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import resumeRoutes from './routes/resumeRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api', resumeRoutes);

app.listen(CONFIG.port, () => {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║         📄 RESUME PARSER - MODULAR SERVICE             ║`);
  console.log(`╚════════════════════════════════════════════════════════╝\n`);
  console.log(`🚀 Server running on http://localhost:${CONFIG.port}`);
});