"use client";

import { useMemo, useState } from "react";
import { type AdvocateCompletionInput } from "@/components/app-state";
import { CaseFileUpload } from "@/components/case-file-upload";
import { parseAttachments, serializeAttachment } from "@/lib/case-attachments";
import { type PropertyCase } from "@/lib/mock-data";

export function AdvocateReviewForm({
  propertyCase,
  onComplete,
}: {
  propertyCase: PropertyCase;
  onComplete: (input: AdvocateCompletionInput) => Promise<void>;
}) {
  const attachments = useMemo(() => parseAttachments(propertyCase.advocateDocuments), [propertyCase.advocateDocuments]);
  const [legalSummary, setLegalSummary] = useState(propertyCase.legalSummary);
  const [reportDocuments, setReportDocuments] = useState<string[]>(
    attachments.filter((item) => item.kind === "advocate-report").map(serializeAttachment),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    if (!legalSummary.trim()) {
      setError("Add the advocate summary before completing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onComplete({
        caseId: propertyCase.id,
        legalSummary,
        reportDocuments,
      });
    } catch {
      setError("Could not complete advocate review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="task-stack top-space">
      <div className="task-card">
        <strong>Office packet received</strong>
        <div className="document-stack top-space">
          {attachments.length === 0 ? (
            <span className="small-note">No uploaded files yet.</span>
          ) : (
            attachments.map((attachment) => (
              <a key={`${attachment.kind}-${attachment.url}`} className="document-pill document-link" href={attachment.url} rel="noreferrer" target="_blank">
                {attachment.label}
              </a>
            ))
          )}
        </div>
      </div>

      <label className="field">
        <span className="field-label">Advocate summary*</span>
        <textarea
          className="field-input"
          placeholder="Summarize title clarity, encumbrance status, chain of title, and any legal flags."
          rows={5}
          value={legalSummary}
          onChange={(event) => setLegalSummary(event.target.value)}
        />
      </label>

      <CaseFileUpload
        accept=".pdf,.doc,.docx,image/*"
        caseId={propertyCase.id}
        kind="advocate-report"
        label="Advocate report"
        onUploaded={({ fileName, publicUrl }) => {
          setReportDocuments((current) => [
            ...current,
            serializeAttachment({
              kind: "advocate-report",
              label: fileName,
              fileName,
              url: publicUrl,
              source: "advocate",
              uploadedAt: new Date().toLocaleString(),
            }),
          ]);
        }}
      />

      {error ? <div className="field-error">{error}</div> : null}

      <div className="sticky-buttons">
        <button className="primary-button" disabled={submitting} onClick={() => void handleComplete()} type="button">
          {submitting ? "Completing..." : "Upload report and complete"}
        </button>
      </div>
    </div>
  );
}
