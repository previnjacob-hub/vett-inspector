"use client";

import { useState } from "react";

type CaseFileUploadProps = {
  caseId: string;
  kind: string;
  label: string;
  accept?: string;
  onUploaded: (result: { fileName: string; publicUrl: string }) => void;
};

export function CaseFileUpload({
  caseId,
  kind,
  label,
  accept,
  onUploaded,
}: CaseFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);
      formData.append("kind", kind);

      const response = await fetch("/api/case-files", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string; fileName: string; publicUrl: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Upload failed.");
      }

      onUploaded({ fileName: result.fileName, publicUrl: result.publicUrl });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="upload-slot">
      <div className="upload-slot-header">
        <span className="field-label">{label}</span>
        <label className="secondary-button file-trigger">
          <input accept={accept} type="file" onChange={handleFileChange} />
          {uploading ? "Uploading..." : "Upload"}
        </label>
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
