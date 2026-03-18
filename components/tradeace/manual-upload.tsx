"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface ManualUploadProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function ManualUpload({ onBack, onSuccess }: ManualUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [trade, setTrade] = useState("electrician");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Get presigned URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: false,
        }),
      });

      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      
      const { uploadUrl, cloud_storage_path, signedHeaders } = await presignedRes.json();

      // Upload to S3
      const uploadHeaders: Record<string, string> = {
        "Content-Type": file.type,
      };
      if (signedHeaders?.includes("content-disposition")) {
        uploadHeaders["Content-Disposition"] = "attachment";
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: uploadHeaders,
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      // Save manual to database
      const saveRes = await fetch("/api/tradeace/manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          cloudStoragePath: cloud_storage_path,
          trade,
          title: title || file.name.replace(".pdf", ""),
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save manual");

      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const trades = [
    { id: "electrician", name: "Electrician", icon: "⚡" },
    { id: "plumber", name: "Plumber", icon: "🔧" },
    { id: "hvac", name: "HVAC", icon: "❄️" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: "#9ca3af" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="rounded-2xl p-6" style={{ background: "#1f1f1f", border: "1px solid #333" }}>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: "#fff" }}>
          <Upload className="w-5 h-5" style={{ color: "#f97316" }} />
          Upload Technical Manual
        </h2>

        {/* Trade Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block" style={{ color: "#9ca3af" }}>Select Trade</label>
          <div className="grid grid-cols-3 gap-3">
            {trades.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrade(t.id)}
                className="p-3 rounded-xl text-center transition-all"
                style={{
                  background: trade === t.id ? "rgba(249,115,22,0.2)" : "#2a2a2a",
                  border: `1px solid ${trade === t.id ? "#f97316" : "#333"}`,
                }}
              >
                <span className="text-2xl block mb-1">{t.icon}</span>
                <span className="text-sm" style={{ color: trade === t.id ? "#f97316" : "#9ca3af" }}>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block" style={{ color: "#9ca3af" }}>Manual Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., NEC 2020 Handbook"
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: "#2a2a2a", border: "1px solid #333", color: "#fff" }}
          />
        </div>

        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("manual-upload")?.click()}
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-orange-500/50"
          style={{ borderColor: file ? "#f97316" : "#333" }}
        >
          <input
            id="manual-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="w-8 h-8" style={{ color: "#10b981" }} />
              <div className="text-left">
                <p className="font-medium" style={{ color: "#fff" }}>{file.name}</p>
                <p className="text-sm" style={{ color: "#6b7280" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(249,115,22,0.1)" }}>
                <FileText className="w-8 h-8" style={{ color: "#f97316" }} />
              </div>
              <p className="font-medium mb-1" style={{ color: "#fff" }}>Drop your PDF here</p>
              <p className="text-sm" style={{ color: "#6b7280" }}>or click to browse</p>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#000" }}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Manual
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
