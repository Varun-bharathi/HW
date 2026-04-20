import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, 'client', 'src')

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    if (fs.statSync(dirPath).isDirectory()) {
        walkDir(dirPath, callback)
    } else {
        callback(path.join(dir, f))
    }
  })
}

// Map light mode classes back to dark mode classes
const replacements = [
  { from: /bg-white/g, to: 'bg-black' },
  { from: /bg-slate-50/g, to: 'bg-slate-900' },
  { from: /bg-slate-100/g, to: 'bg-slate-800' },
  { from: /border-slate-200/g, to: 'border-slate-800' },
  { from: /border-slate-300/g, to: 'border-slate-700' },
  { from: /text-slate-950/g, to: 'text-slate-100' },
  { from: /text-slate-700/g, to: 'text-slate-300' },
  { from: /text-slate-600/g, to: 'text-slate-400' },
  { from: /bg-slate-200/g, to: 'bg-slate-800' },
]

walkDir(srcDir, filePath => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8')
    let original = content
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to)
    })
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log('Updated to Dark:', filePath)
    }
  }
})
