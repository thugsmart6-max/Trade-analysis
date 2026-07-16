"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { AnalysisFormData } from "@/types/analysis";
import { WizardNav } from "./WizardNav";
import {
  Bold,
  Italic,
  List,
  Highlighter,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step6Props {
  data: AnalysisFormData;
  onNext: (data: Partial<AnalysisFormData>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-all",
        active
          ? "bg-[rgba(240,180,41,0.15)] text-[#F0B429]"
          : "text-muted-foreground hover:text-muted-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}

export function Step6AnalysisReason({ data, onNext, onBack, isSubmitting }: Step6Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder:
          "Write your analysis reasoning here...\n\n• Describe why you are taking this position\n• Mention key technical levels\n• Note any fundamental catalysts\n• Add risk factors to watch",
      }),
    ],
    content: data.analysisReason || "",
        editorProps: {
      attributes: {
        class:
          "min-h-[280px] px-4 py-3 text-foreground text-sm leading-relaxed focus:outline-none prose prose-invert prose-sm max-w-none font-sans",
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const html = editor?.getHTML() || "";
    onNext({ analysisReason: html });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-[#2a2622] mx-1" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().setParagraph().run()}
            active={editor?.isActive("paragraph")}
            title="Paragraph"
          >
            <Type className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-4 bg-[#2a2622] mx-1" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            active={editor?.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />
      </div>

      <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
        Use toolbar to format. Highlighted text appears prominently in the report.
      </p>

      <WizardNav
        showBack
        onBack={onBack}
        isLastStep
        isSubmitting={isSubmitting}
        nextLabel="Preview Analysis"
      />
    </form>
  );
}
