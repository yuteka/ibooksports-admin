'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Undo,
  Redo,
  Eye,
  Code,
  Check,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write or edit content here...',
  minHeight = '320px',
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeValue, setCodeValue] = useState(value || '');
  const [selectionActive, setSelectionActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    h1: false,
    h2: false,
    h3: false,
    ul: false,
    ol: false,
    blockquote: false,
  });

  // Sync incoming value to contentEditable when not focused
  useEffect(() => {
    if (editorRef.current && !isCodeMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setCodeValue(value || '');
  }, [value, isCodeMode]);

  const updateActiveStates = () => {
    if (typeof document === 'undefined') return;
    try {
      setSelectionActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        h1: document.queryCommandValue('formatBlock') === 'h1',
        h2: document.queryCommandValue('formatBlock') === 'h2',
        h3: document.queryCommandValue('formatBlock') === 'h3',
        ul: document.queryCommandState('insertUnorderedList'),
        ol: document.queryCommandState('insertOrderedList'),
        blockquote: document.queryCommandValue('formatBlock') === 'blockquote',
      });
    } catch {
      // Safe fallback
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    if (disabled || isCodeMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    updateActiveStates();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleHeading = (tag: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote') => {
    if (disabled || isCodeMode) return;
    executeCommand('formatBlock', tag);
  };

  const handleLink = () => {
    if (disabled || isCodeMode) return;
    const url = prompt('Enter destination URL (e.g. https://...):', 'https://');
    if (url && url !== 'https://') {
      executeCommand('createLink', url);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setCodeValue(html);
      updateActiveStates();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCodeValue(val);
    onChange(val);
    if (editorRef.current) {
      editorRef.current.innerHTML = val;
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Text Style */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.bold ? 'bg-orange-100 text-orange-600 font-bold' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.italic ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.underline ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.strike ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => handleHeading('h1')}
            disabled={disabled || isCodeMode}
            className={`px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-0.5 ${
              selectionActive.h1 ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading('h2')}
            disabled={disabled || isCodeMode}
            className={`px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-0.5 ${
              selectionActive.h2 ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading('h3')}
            disabled={disabled || isCodeMode}
            className={`px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-0.5 ${
              selectionActive.h3 ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.ul ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.ol ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading('blockquote')}
            disabled={disabled || isCodeMode}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all ${
              selectionActive.blockquote ? 'bg-orange-100 text-orange-600' : ''
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Links */}
          <button
            type="button"
            onClick={handleLink}
            disabled={disabled || isCodeMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('unlink')}
            disabled={disabled || isCodeMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            disabled={disabled || isCodeMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools (Undo, Redo, HTML Code Toggle) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            disabled={disabled || isCodeMode}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            disabled={disabled || isCodeMode}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => setIsCodeMode(!isCodeMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isCodeMode
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle HTML Source Code View"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isCodeMode ? 'Visual Editor' : 'HTML Source'}</span>
          </button>
        </div>
      </div>

      {/* Editable Area */}
      <div className="relative p-4">
        {isCodeMode ? (
          <textarea
            value={codeValue}
            onChange={handleCodeChange}
            disabled={disabled}
            placeholder="Edit raw HTML..."
            className="w-full font-mono text-xs text-slate-800 bg-slate-900/5 p-3 rounded-xl focus:outline-none resize-y border border-slate-200"
            style={{ minHeight }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleEditorInput}
            onKeyUp={updateActiveStates}
            onMouseUp={updateActiveStates}
            className="prose prose-sm sm:prose-base max-w-none focus:outline-none text-slate-800 leading-relaxed font-normal
              [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-3 [&_h1]:mt-4
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-2.5 [&_h2]:mt-4
              [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-3
              [&_p]:mb-3 [&_p]:text-slate-700
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1
              [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:bg-orange-50/50 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:my-3
              [&_a]:text-orange-600 [&_a]:underline [&_a]:font-medium"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium">
            <Check className="w-3 h-3 text-emerald-500" />
            <span>Rich Text Mode</span>
          </span>
          <span>•</span>
          <span>HTML formatted output</span>
        </div>
        <div>
          <span>{value ? value.replace(/<[^>]*>/g, '').length : 0} characters</span>
        </div>
      </div>
    </div>
  );
};
