import { useCallback } from 'react'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: number
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = 240,
  readOnly = false,
}: CodeEditorProps) {
  const handleChange = useCallback(
    (v: string | undefined) => onChange(v ?? ''),
    [onChange]
  )

  return (
    <div className="assessment-container rounded-lg overflow-hidden">
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
