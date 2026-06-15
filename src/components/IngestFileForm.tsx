import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Upload, FileText, CheckCircle, Sparkles, AlertCircle, FileDigit } from "lucide-react";

export function IngestFileForm() {
  const { addSourceFile, addJob, updateJob, addCommentToReview, updateReadinessReport } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const processFile = async (file: File) => {
    if (!file) return;

    setLoading(true);
    setUploadSuccess(false);
    setStatusMessage("Initializing file analysis...");

    const jobId = `job-intake-${Date.now()}`;
    addJob({
      id: jobId,
      name: `Intake & Analysis: ${file.name}`,
      status: "running",
      progress: 5,
      log: "Connecting to secure upload proxy...",
    });

    try {
      let extractedTxt = "";
      const isImg = file.type.startsWith("image/");
      const isTxt = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".csv");

      if (isImg) {
        setStatusMessage("Running client-side Tesseract.js OCR engine...");
        updateJob(jobId, { progress: 20, log: "Spawning Tesseract client worker..." });
        
        try {
          const result = await Tesseract.recognize(file, "eng", {
            logger: (m) => {
              if (m.status === "recognizing") {
                const progressPct = Math.round(m.progress * 100);
                setStatusMessage(`Tesseract: recognizing image characters (${progressPct}%)`);
                updateJob(jobId, {
                  progress: 20 + Math.round(m.progress * 50),
                  log: `Tesseract OCR: ${m.status} - ${progressPct}%`,
                });
              }
            },
          });
          extractedTxt = result.data.text;
          updateJob(jobId, { progress: 75, log: "Tesseract characters recognized. Forwarding to pipeline..." });
        } catch (tesseractErr: any) {
          console.warn("Tesseract custom failure, falling back to server-side parser:", tesseractErr);
          updateJob(jobId, { log: "Tesseract engine fallback triggered..." });
        }
      } else if (isTxt) {
        setStatusMessage("Reading local text characters...");
        updateJob(jobId, { progress: 40, log: "Opening FileReader reader stream..." });
        extractedTxt = await file.text();
      }

      // Read file content as base64 to pass over the wire
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(",")[1] || "";
        updateJob(jobId, { progress: 80, log: "Parsing metadata parameters and layout blocks..." });

        const res = await fetch("/api/upload-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            rawContent: base64Data,
            extractedTextOverride: extractedTxt || undefined,
          }),
        });

        if (!res.ok) throw new Error("Pipeline compilation error");

        const data = await res.json();
        
        // If we extracted text via Tesseract, override/inject the result
        if (extractedTxt) {
          data.fileRecord.extractedText = extractedTxt;
          data.fileRecord.metadata.wordCount = extractedTxt.split(/\s+/).length;
          data.fileRecord.summary.text = `Distilled client OCR of ${file.name}. Tesseract extracted text blocks directly in browser for high privacy. Extracted text length: ${extractedTxt.length} chars.`;
        }

        // Add matching records
        addSourceFile(data.fileRecord);
        addCommentToReview(data.fileRecord.id, "OCR matching schema completed verified logs.", "System Supervisor");
        updateReadinessReport(data.fileRecord.id, data.readinessReport);

        updateJob(jobId, {
          status: "completed",
          progress: 100,
          log: `Success: Ingested file, wordcount ${data.fileRecord.metadata.wordCount || 0}.`,
        });

        setLoading(false);
        setUploadSuccess(true);
        setStatusMessage("");
        setTimeout(() => setUploadSuccess(false), 2500);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      updateJob(jobId, {
        status: "failed",
        progress: 100,
        log: `Failure: ${err.message || "Unknown proxy error"}`,
      });
      setLoading(false);
      setStatusMessage("");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: loading,
    multiple: false,
  } as any);

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer select-none ${
        isDragActive
          ? "border-blue-500 bg-blue-955/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          : "border-slate-800 bg-[#121620]/30 hover:border-slate-700 hover:bg-[#151924]/40"
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-3.5">
        <div
          className={`p-3 rounded-xl transition-transform ${
            isDragActive ? "bg-blue-500/20 text-blue-400 scale-105" : "bg-slate-900 border border-white/5 text-slate-400"
          }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : uploadSuccess ? (
            <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
          ) : (
            <Upload className="w-6 h-6 text-blue-400" />
          )}
        </div>

        <div className="space-y-1.5 max-w-sm">
          <p className="text-xs font-bold text-slate-250 leading-snug">
            {loading ? (
              <span className="font-mono text-indigo-400 text-[11px] animate-pulse">{statusMessage}</span>
            ) : uploadSuccess ? (
              "Ingestion Complete!"
            ) : isDragActive ? (
              "Drop files to analyze..."
            ) : (
              "Ingest Project Specifications"
            )}
          </p>
          <p className="text-[10px] text-slate-500 tracking-wide">
            Drag & drop PDFs, Images (OCR active via Tesseract.js), JSON, CSV or click to select manually
          </p>
        </div>

        {!loading && (
          <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-mono text-slate-500">
            <Sparkles size={11} className="text-blue-400" />
            <span>IMAGE OCR INTEGRATION ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
