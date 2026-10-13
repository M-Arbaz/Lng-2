'use client'

import { useId, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import {
  Undo2, Redo2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, IndentDecrease, IndentIncrease, Link as LinkIcon,
  Link2Off, Table as TableIcon, Image as ImageIcon, Code2, Loader2,
} from 'lucide-react'
import { uploadEditorImage } from '../utils/richTextUploadService.js'

const HEADER_OPTIONS = [
  { value: '', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
  { value: '4', label: 'Heading 4' },
]

function insertTableHtml(quill) {
  if (!quill) return
  const range = quill.getSelection(true)
  const index = range ? range.index : quill.getLength()
  const rows = 3
  const cols = 3
  let html = '<table style="width:100%;border-collapse:collapse;margin:0.5rem 0;">'
  for (let r = 0; r < rows; r++) {
    html += '<tr>'
    for (let c = 0; c < cols; c++) {
      html += r === 0
        ? '<td style="border:1px solid #d6d3d1;padding:8px;background:#f5f5f4;text-align:left;"><strong>Header</strong></td>'
        : '<td style="border:1px solid #d6d3d1;padding:8px;">Cell</td>'
    }
    html += '</tr>'
  }
  html += '</table><p><br></p>'
  quill.clipboard.dangerouslyPasteHTML(index, html, 'user')
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 220 }) {
  const toolbarId = useId().replace(/:/g, '')
  const quillRef = useRef(null)
  const fileInputRef = useRef(null)
  const [showSource, setShowSource] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const getQuill = () => quillRef.current?.getEditor()

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const quill = getQuill()
    const range = quill?.getSelection(true)
    setUploadingImage(true)
    try {
      const url = await uploadEditorImage(file)
      if (quill) {
        quill.insertEmbed(range ? range.index : quill.getLength(), 'image', url, 'user')
        quill.setSelection((range ? range.index : quill.getLength()) + 1)
      }
    } catch (err) {
      console.error('Editor image upload failed:', err)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const modules = {
    toolbar: {
      container: `#${toolbarId}`,
    },
    history: {
      delay: 500,
      maxStack: 200,
      userOnly: true,
    },
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'color', 'background',
    'align', 'list', 'indent', 'link', 'image', 'table',
  ]

  const btnClass = 'inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 text-gray-700 transition-colors'

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div id={toolbarId} className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <button type="button" className={btnClass} title="Undo" onClick={() => getQuill()?.history.undo()}>
          <Undo2 className="w-4 h-4" />
        </button>
        <button type="button" className={btnClass} title="Redo" onClick={() => getQuill()?.history.redo()}>
          <Redo2 className="w-4 h-4" />
        </button>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <select className="ql-header h-8 rounded border border-gray-200 text-sm px-1 bg-white" defaultValue="">
          {HEADER_OPTIONS.map((h) => (
            <option key={h.label} value={h.value}>{h.label}</option>
          ))}
        </select>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <label className={btnClass} title="Text color">
          <span className="text-xs font-bold underline decoration-2">A</span>
          <input
            type="color"
            className="sr-only"
            onChange={(e) => getQuill()?.format('color', e.target.value)}
          />
        </label>
        <label className={btnClass} title="Highlight color">
          <span className="relative inline-flex items-center justify-center w-4 h-4 bg-[#FFD400]/60 rounded-sm text-[9px] font-bold">A</span>
          <input
            type="color"
            className="sr-only"
            onChange={(e) => getQuill()?.format('background', e.target.value)}
          />
        </label>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <button type="button" className={`ql-bold ${btnClass}`} title="Bold"><Bold className="w-4 h-4" /></button>
        <button type="button" className={`ql-italic ${btnClass}`} title="Italic"><Italic className="w-4 h-4" /></button>
        <button type="button" className={`ql-underline ${btnClass}`} title="Underline"><Underline className="w-4 h-4" /></button>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <button type="button" className={`ql-align ${btnClass}`} value="" title="Align left"><AlignLeft className="w-4 h-4" /></button>
        <button type="button" className={`ql-align ${btnClass}`} value="center" title="Align center"><AlignCenter className="w-4 h-4" /></button>
        <button type="button" className={`ql-align ${btnClass}`} value="right" title="Align right"><AlignRight className="w-4 h-4" /></button>
        <button type="button" className={`ql-align ${btnClass}`} value="justify" title="Justify"><AlignJustify className="w-4 h-4" /></button>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <button type="button" className={`ql-list ${btnClass}`} value="bullet" title="Bullet list"><List className="w-4 h-4" /></button>
        <button type="button" className={`ql-list ${btnClass}`} value="ordered" title="Numbered list"><ListOrdered className="w-4 h-4" /></button>
        <button type="button" className={`ql-indent ${btnClass}`} value="-1" title="Decrease indent"><IndentDecrease className="w-4 h-4" /></button>
        <button type="button" className={`ql-indent ${btnClass}`} value="+1" title="Increase indent"><IndentIncrease className="w-4 h-4" /></button>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <button type="button" className={`ql-link ${btnClass}`} title="Insert link"><LinkIcon className="w-4 h-4" /></button>
        <button
          type="button"
          className={btnClass}
          title="Remove link"
          onClick={() => getQuill()?.format('link', false)}
        >
          <Link2Off className="w-4 h-4" />
        </button>

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <button type="button" className={btnClass} title="Insert table" onClick={() => insertTableHtml(getQuill())}>
          <TableIcon className="w-4 h-4" />
        </button>

        <button type="button" className={btnClass} title="Insert image" onClick={handleImageClick} disabled={uploadingImage}>
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />

        <span className="mx-1 w-px h-5 bg-gray-300" />

        <button
          type="button"
          className={`${btnClass} ${showSource ? 'bg-gray-200' : ''}`}
          title="HTML source view"
          onClick={() => setShowSource((v) => !v)}
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>

      {showSource ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full p-4 font-mono text-xs text-gray-800 focus:outline-none resize-y"
        />
      ) : (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ minHeight }}
        />
      )}

      <style>{`
        .ql-container.ql-snow { border: none; font-size: 0.9rem; }
        .ql-editor { min-height: ${minHeight}px; }
        .ql-editor table { width: 100%; border-collapse: collapse; }
        .ql-editor table td, .ql-editor table th { border: 1px solid #d6d3d1; padding: 8px; }
      `}</style>
    </div>
  )
}
