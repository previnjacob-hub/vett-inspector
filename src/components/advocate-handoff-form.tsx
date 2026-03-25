"use client";

import { useMemo, useState } from "react";
import { CaseFileUpload } from "@/components/case-file-upload";
import { parseAttachments, serializeAttachment } from "@/lib/case-attachments";
import { type AdvocateHandoffInput } from "@/components/app-state";
import { type AppUser, type PropertyCase } from "@/lib/mock-data";

type AdvocateHandoffFormProps = {
  propertyCase: PropertyCase;
  users: AppUser[];
  onAssign: (input: AdvocateHandoffInput) => Promise<void>;
};

export function AdvocateHandoffForm({
  propertyCase,
  users,
  onAssign,
}: AdvocateHandoffFormProps) {
  const existingAttachments = useMemo(
    () => parseAttachments(propertyCase.advocateDocuments),
    [propertyCase.advocateDocuments],
  );
  const advocateOptions = useMemo(
    () =>
      users.filter(
        (user) => user.role === "advocate" && user.sectors.includes(propertyCase.sector),
      ),
    [propertyCase.sector, users],
  );
  const [advocateId, setAdvocateId] = useState(propertyCase.advocateId ?? "");
  const verifierCollectedDocs = existingAttachments.filter(
    (item) =>
      item.source === "verifier" &&
      (item.kind === "title-deed" ||
        item.kind === "tax-receipt" ||
        item.kind === "approval-proof" ||
        item.kind === "inspection-document"),
  );
  const [titleDeed, setTitleDeed] = useState(existingAttachments.find((item) => item.kind === "title-deed")?.url ?? "");
  const [taxReceipt, setTaxReceipt] = useState(existingAttachments.find((item) => item.kind === "tax-receipt")?.url ?? "");
  const [approvalProof, setApprovalProof] = useState(existingAttachments.find((item) => item.kind === "approval-proof")?.url ?? "");
  const [otherDocuments, setOtherDocuments] = useState(
    existingAttachments
      .filter((item) => item.kind === "additional-doc")
      .map((item) => item.url)
      .join("\n"),
  );
  const [pendingDocumentsNote, setPendingDocumentsNote] = useState(
    propertyCase.pendingClientDocumentsNote,
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!advocateId) {
      setError("Select an advocate before passing the case.");
      return;
    }

    if (!titleDeed || !taxReceipt || !approvalProof) {
      setError("Upload the three core legal documents before passing the case.");
      return;
    }

    const docs = otherDocuments
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);

    const sharedDocuments = [
      titleDeed
        ? serializeAttachment({
            kind: "title-deed",
            label: "Title deed / sale deed",
            fileName: "Uploaded file",
            url: titleDeed,
            source: "office",
            uploadedAt: new Date().toLocaleString(),
          })
        : "",
      taxReceipt
        ? serializeAttachment({
            kind: "tax-receipt",
            label: "Tax receipt",
            fileName: "Uploaded file",
            url: taxReceipt,
            source: "office",
            uploadedAt: new Date().toLocaleString(),
          })
        : "",
      approvalProof
        ? serializeAttachment({
            kind: "approval-proof",
            label: "Approval / occupancy proof",
            fileName: "Uploaded file",
            url: approvalProof,
            source: "office",
            uploadedAt: new Date().toLocaleString(),
          })
        : "",
      ...existingAttachments
        .filter(
          (item) =>
            item.kind === "inspection-media" ||
            item.kind === "inspection-document" ||
            item.kind === "title-deed" ||
            item.kind === "tax-receipt" ||
            item.kind === "approval-proof",
        )
        .map(serializeAttachment),
      ...docs.map((url) =>
        serializeAttachment({
          kind: "additional-doc",
          label: "Additional legal document",
          fileName: "Uploaded file",
          url,
          source: "office",
          uploadedAt: new Date().toLocaleString(),
        }),
      ),
    ].filter(Boolean);

    setSubmitting(true);

    try {
      await onAssign({
        caseId: propertyCase.id,
        advocateId,
        sharedDocuments,
        pendingDocumentsNote,
      });
      setError("");
    } catch {
      setError("Could not pass case to advocate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="intake-form top-space" onSubmit={handleSubmit}>
      <div className="field-stack grid-two">
        <label className="field">
          <span className="field-label">
            Assign advocate
            <em>*</em>
          </span>
          <select
            className="field-input"
            value={advocateId}
            onChange={(event) => setAdvocateId(event.target.value)}
          >
            <option value="">Select advocate</option>
            {advocateOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} | {user.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
              <span className="field-label">Pending from client</span>
          <input
            className="field-input"
            placeholder="Example: verifier marked original tax receipt as pending from owner"
            value={pendingDocumentsNote}
            onChange={(event) => setPendingDocumentsNote(event.target.value)}
          />
        </label>
      </div>

      <div className="field-stack">
        <div className="task-card">
          <strong>Documents collected by verifier</strong>
          <p>
            These are the legal files and site documents already collected during the field visit.
            Office only needs to follow up for anything still missing before passing to the advocate.
          </p>
          <div className="document-stack top-space">
            {verifierCollectedDocs.length > 0 ? (
              verifierCollectedDocs.map((attachment) => (
                <a
                  key={`${attachment.kind}-${attachment.url}`}
                  className="document-pill document-link"
                  href={attachment.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {attachment.label}
                </a>
              ))
            ) : (
              <span className="small-note">No verifier-collected legal documents are on the case yet.</span>
            )}
          </div>
        </div>

        <CaseFileUpload
          accept=".pdf,image/*"
          caseId={propertyCase.id}
          kind="title-deed"
          label="Title deed / sale deed"
          onUploaded={({ publicUrl }) => {
            setTitleDeed(publicUrl);
            setError("");
          }}
        />
        <CaseFileUpload
          accept=".pdf,image/*"
          caseId={propertyCase.id}
          kind="tax-receipt"
          label="Tax receipt"
          onUploaded={({ publicUrl }) => {
            setTaxReceipt(publicUrl);
            setError("");
          }}
        />
        <CaseFileUpload
          accept=".pdf,image/*"
          caseId={propertyCase.id}
          kind="approval-proof"
          label="Approval / occupancy proof"
          onUploaded={({ publicUrl }) => {
            setApprovalProof(publicUrl);
            setError("");
          }}
        />
      </div>

      <div className="field-stack grid-two">
        <label className="field">
          <span className="field-label">Title deed / sale deed URL*</span>
          <input className="field-input" placeholder="Paste uploaded file URL" value={titleDeed} onChange={(event) => setTitleDeed(event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Tax receipt URL*</span>
          <input className="field-input" placeholder="Paste uploaded file URL" value={taxReceipt} onChange={(event) => setTaxReceipt(event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Approval / occupancy URL*</span>
          <input className="field-input" placeholder="Paste uploaded file URL" value={approvalProof} onChange={(event) => setApprovalProof(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Other documents</span>
        <textarea
          className="field-input"
          placeholder="One uploaded file URL per line"
          rows={4}
          value={otherDocuments}
          onChange={(event) => setOtherDocuments(event.target.value)}
        />
      </label>

      {error ? <div className="field-error">{error}</div> : null}

      <div className="sticky-buttons">
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Passing..." : "Pass to advocate"}
        </button>
      </div>
    </form>
  );
}
