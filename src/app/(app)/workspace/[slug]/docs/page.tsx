"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Plus,
  Loader2,
  Eye,
  Edit3,
  Clock,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Doc } from "@/types";

export default function DocsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [previewMode, setPreviewMode] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [contentValue, setContentValue] = useState("");

  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load workspace ID from slug
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/workspaces/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ws) => { if (ws) setWorkspaceId(ws.id); })
      .finally(() => setLoadingWorkspace(false));
  }, [slug]);

  // Load docs
  const loadDocs = useCallback(async () => {
    if (!workspaceId) return;
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/docs`);
      if (res.ok) {
        const data: Doc[] = await res.json();
        setDocs(data);
        if (data.length > 0 && !selectedDoc) {
          const first = data[0];
          setSelectedDoc(first);
          setTitleValue(first.title);
          setContentValue(first.content);
        }
      }
    } finally {
      setLoadingDocs(false);
    }
  }, [workspaceId, selectedDoc]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const selectDoc = (doc: Doc) => {
    setSelectedDoc(doc);
    setTitleValue(doc.title);
    setContentValue(doc.content);
    setPreviewMode(false);
    setSaveStatus("idle");
  };

  const debouncedSave = useCallback(
    (docId: string, title: string, content: string) => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      setSaveStatus("saving");
      saveDebounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/workspaces/${workspaceId}/docs/${docId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, content }),
            }
          );
          if (res.ok) {
            const updated: Doc = await res.json();
            setDocs((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
            if (selectedDoc?.id === updated.id) {
              setSelectedDoc(updated);
            }
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          }
        } catch {
          setSaveStatus("idle");
        }
      }, 1500);
    },
    [workspaceId, selectedDoc]
  );

  const handleTitleChange = (val: string) => {
    setTitleValue(val);
    if (selectedDoc) debouncedSave(selectedDoc.id, val, contentValue);
  };

  const handleContentChange = (val: string) => {
    setContentValue(val);
    if (selectedDoc) debouncedSave(selectedDoc.id, titleValue, val);
  };

  const handleCreateDoc = async () => {
    if (!workspaceId || creatingDoc) return;
    setCreatingDoc(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document", content: "" }),
      });
      if (res.ok) {
        const doc: Doc = await res.json();
        setDocs((prev) => [doc, ...prev]);
        selectDoc(doc);
      }
    } finally {
      setCreatingDoc(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
        {/* Doc list sidebar */}
        <div className="w-64 shrink-0 flex flex-col border-r border-[#1e1e2e] bg-[#0d0d14]">
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white/40" />
              <h2 className="text-sm font-semibold text-white/80">Docs</h2>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleCreateDoc}
              loading={creatingDoc}
              title="New Document"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Separator />

          <ScrollArea className="flex-1">
            {loadingDocs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#ff5c00]/60" />
              </div>
            ) : docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a26] flex items-center justify-center">
                  <FilePlus className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-xs text-white/30">No documents yet</p>
                <Button size="sm" variant="outline" onClick={handleCreateDoc} loading={creatingDoc}>
                  <Plus className="w-3.5 h-3.5" />
                  New Doc
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => selectDoc(doc)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-all",
                      selectedDoc?.id === doc.id
                        ? "bg-[#cc3d00]/15 border border-[#ff5c00]/20"
                        : "hover:bg-[#1a1a26]"
                    )}
                  >
                    <p className={cn(
                      "text-sm font-medium truncate",
                      selectedDoc?.id === doc.id ? "text-[#ff8a40]" : "text-white/70"
                    )}>
                      {doc.title || "Untitled"}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">
                      {formatRelativeTime(doc.updatedAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e2e] shrink-0">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Clock className="w-3.5 h-3.5" />
                  {saveStatus === "saving" && (
                    <span className="flex items-center gap-1.5 text-white/40">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving…
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="text-emerald-400/70">Saved</span>
                  )}
                  {saveStatus === "idle" && (
                    <span>Last saved {formatRelativeTime(selectedDoc.updatedAt)}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="gap-2"
                >
                  {previewMode ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </>
                  )}
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto px-8 py-8">
                  {/* Title */}
                  <input
                    value={titleValue}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Untitled Document"
                    className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-white/20 outline-none mb-6 border-b border-transparent focus:border-white/10 pb-2 transition-colors"
                    readOnly={previewMode}
                  />

                  {/* Content */}
                  {previewMode ? (
                    <div className="prose prose-invert max-w-none text-white/70">
                      {contentValue ? (
                        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-white/70">
                          {contentValue}
                        </pre>
                      ) : (
                        <p className="text-white/25 italic">Start writing something…</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={contentValue}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Start writing… (supports markdown)"
                      className={cn(
                        "w-full bg-transparent text-base text-white/80 placeholder:text-white/20 outline-none resize-none",
                        "leading-relaxed font-mono",
                        "min-h-[calc(100vh-280px)]"
                      )}
                    />
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a26] flex items-center justify-center">
                <FileText className="w-8 h-8 text-white/15" />
              </div>
              <div className="text-center">
                <p className="text-white/50 font-medium">No document selected</p>
                <p className="text-white/25 text-sm mt-1">
                  {docs.length > 0 ? "Select a document from the sidebar" : "Create your first document"}
                </p>
              </div>
              {docs.length === 0 && (
                <Button onClick={handleCreateDoc} loading={creatingDoc}>
                  <Plus className="w-4 h-4" />
                  New Document
                </Button>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
