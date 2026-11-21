"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const BLOCK_OPTIONS = [
  { label: "Normal Text", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
  { label: "Heading 4", value: "H4" },
  { label: "Heading 5", value: "H5" },
  { label: "Heading 6", value: "H6" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Masukkan isi berita . . .",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentBlock, setCurrentBlock] = useState("P");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const isEmpty =
        html === "<br>" || html === "<p><br></p>" || html.trim() === "";
      onChange(isEmpty ? "" : html);
    }
  };

  const execCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    handleInput();
    detectCurrentBlock();
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value;
    setCurrentBlock(tag);
    execCommand("formatBlock", tag);
  };

  const detectCurrentBlock = () => {
    const block = document.queryCommandValue("formatBlock").toUpperCase();
    if (["H1", "H2", "H3", "H4", "H5", "H6", "P"].includes(block)) {
      setCurrentBlock(block);
    } else {
      setCurrentBlock("P");
    }
  };

  return (
    <div className="border-dark-greenblue focus-within:ring-greenblue/40 w-full overflow-hidden rounded-xl border bg-white transition focus-within:ring-2">
      {/* toolbar */}
      <div className="border-dark-greenblue/30 flex flex-wrap items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
        {/* heading */}
        <select
          value={currentBlock}
          onChange={handleBlockChange}
          aria-label="Format Teks"
          className="hover:border-dark-greenblue focus:ring-greenblue h-8 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 focus:ring-1 focus:outline-none"
        >
          {BLOCK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="mx-1 h-5 w-px bg-slate-300" />

        {/* text style */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("bold")}
          title="Tebal (Bold)"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("italic")}
          title="Miring (Italic)"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("underline")}
          title="Garis Bawah (Underline)"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-300" />

        {/* list */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("insertUnorderedList")}
          title="Daftar Poin"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("insertOrderedList")}
          title="Daftar Bernomor"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-300" />

        {/* alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyLeft")}
          title="Rata Kiri"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyCenter")}
          title="Rata Tengah"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyRight")}
          title="Rata Kanan"
          className="hover:text-dark-greenblue cursor-pointer rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/70"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      {/* writing area */}
      <div className="relative">
        {!value && (
          <span className="pointer-events-none absolute top-3.5 left-4 text-sm text-slate-400">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={detectCurrentBlock}
          onMouseUp={detectCurrentBlock}
          className="max-h-125 min-h-60 overflow-y-auto px-4 py-3.5 text-sm text-slate-800 focus:outline-none [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-2.5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:my-2 [&_h4]:text-base [&_h4]:font-semibold [&_h5]:my-1.5 [&_h5]:text-sm [&_h5]:font-semibold [&_h6]:my-1.5 [&_h6]:text-xs [&_h6]:font-semibold [&_h6]:tracking-wide [&_h6]:uppercase [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
    </div>
  );
}
