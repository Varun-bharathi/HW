import { useCallback } from 'react'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  onLanguageChange?: (lang: string) => void
  height?: number | string
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  onLanguageChange,
  height = 240,
  readOnly = false,
}: CodeEditorProps) {
  const handleChange = useCallback(
    (v: string | undefined) => onChange(v ?? ''),
    [onChange]
  )

  return (
    <div className="assessment-container rounded-lg overflow-hidden border border-slate-300 h-full flex flex-col">
      <div className="bg-slate-100 p-2 flex items-center justify-between border-b border-slate-300">
        <span className="text-xs text-slate-600 font-medium ml-2">Code Editor</span>
        {!readOnly && (
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="bg-slate-50 text-slate-700 text-xs rounded border border-slate-300 px-2 py-1 outline-none focus:border-brand-500"
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
        )}
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
      />
    </div>
  )
}
