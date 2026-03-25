"use client";

import { useMemo, useState } from "react";
import { type FinalReportInput } from "@/components/app-state";
import { CaseFileUpload } from "@/components/case-file-upload";
import { parseAttachments, serializeAttachment } from "@/lib/case-attachments";
import { type PropertyCase } from "@/lib/mock-data";
import { openCombinedReport } from "@/lib/report-exports";

export function FinalReportForm({
  propertyCase,
  onSave,
}: {
  propertyCase: PropertyCase;
  onSave: (input: FinalReportInput) => Promise<void>;
}) {
  const attachments = useMemo(() => parseAttachments(propertyCase.advocateDocuments), [propertyCase.advocateDocuments]);
  const [overallRisk, setOverallRisk] = useState<PropertyCase["overallRisk"]>(propertyCase.overallRisk);
  const [customerSummary, setCustomerSummary] = useState(propertyCase.finalReportSummary);
  const [suggestions, setSuggestions] = useState(propertyCase.finalReportNotes[1]?.body ?? "");
  const [reportDocuments, setReportDocuments] = useState<string[]>(
    attachments.filter((item) => item.kind === "final-report").map(serializeAttachment),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!customerSummary.trim()) {
      setError("Add the customer summary before marking the final report ready.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSave({
        caseId: propertyCase.id,
        overallRisk,
        customerSummary,
        suggestions,
        reportDocuments,
      });
    } catch {
      setError("Could not save final report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="task-stack top-space">
      <div className="task-card">
        <strong>Inputs available for the final report</strong>
        <p>{propertyCase.verifierSummary}</p>
        <p>{propertyCase.legalSummary}</p>
        <div className="document-stack top-space">
          {attachments.length === 0 ? (
            <span className="small-note">No uploaded case files yet.</span>
          ) : (
            attachments.map((attachment) => (
              <a key={`${attachment.kind}-${attachment.url}`} className="document-pill document-link" href={attachment.url} rel="noreferrer" target="_blank">
                {attachment.label}
              </a>
            ))
          )}
        </div>
      </div>

      <div className="field-stack grid-two">
        <label className="field">
          <span className="field-label">Overall risk*</span>
          <select className="field-input" value={overallRisk} onChange={(event) => setOverallRisk(event.target.value as PropertyCase["overallRisk"])}>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field-label">Customer summary*</span>
        <textarea
          className="field-input"
          placeholder="Write the combined plain-language customer summary using structural and legal findings."
          rows={5}
          value={customerSummary}
          onChange={(event) => setCustomerSummary(event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">Suggestions</span>
        <textarea
          className="field-input"
          placeholder="Add neutral suggestions or follow-up questions for the client."
          rows={4}
          value={suggestions}
          onChange={(event) => setSuggestions(event.target.value)}
        />
      </label>

      <CaseFileUpload
        accept=".pdf,.doc,.docx"
        caseId={propertyCase.id}
        kind="final-report"
        label="Customer report PDF"
        onUploaded={({ fileName, publicUrl }) => {
          setReportDocuments((current) => [
            ...current,
            serializeAttachment({
              kind: "final-report",
              label: fileName,
              fileName,
              url: publicUrl,
              source: "final-desk",
              uploadedAt: new Date().toLocaleString(),
            }),
          ]);
        }}
      />

      {error ? <div className="field-error">{error}</div> : null}

      <div className="sticky-buttons">
        <button
          className="secondary-button"
          onClick={() => openCombinedReport(propertyCase, attachments, suggestions)}
          type="button"
        >
          Open combined report draft
        </button>
        <button className="primary-button" disabled={submitting} onClick={() => void handleSave()} type="button">
          {submitting ? "Saving..." : "Mark final report ready"}
        </button>
      </div>
    </div>
  );
}
