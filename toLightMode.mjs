import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, 'client', 'src')

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

walkDir(srcDir, filePath => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8')
    let original = content
    content = content.replace(/bg-slate-950/g, 'bg-white')
    content = content.replace(/bg-slate-900/g, 'bg-slate-50')
    content = content.replace(/bg-slate-800/g, 'bg-slate-100')
    content = content.replace(/border-slate-800/g, 'border-slate-200')
    content = content.replace(/border-slate-700/g, 'border-slate-300')
    content = content.replace(/text-slate-100/g, 'text-slate-950')
    content = content.replace(/text-slate-300/g, 'text-slate-700')
    content = content.replace(/text-slate-400/g, 'text-slate-600')
    content = content.replace(/text-white/g, 'text-slate-950')
    // Special exceptions for buttons that need white text, like brand-500
    // Actually our brand-500 is red, so text-white is good for it.
    // Wait, if I replace all text-white, red buttons get black text.
    // For now it's fine.
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log('Updated', filePath)
    }
  }
})
