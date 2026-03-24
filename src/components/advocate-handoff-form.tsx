"use client";

import { useMemo, useState } from "react";
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
  const advocateOptions = useMemo(
    () =>
      users.filter(
        (user) => user.role === "advocate" && user.sectors.includes(propertyCase.sector),
      ),
    [propertyCase.sector, users],
  );

  const [advocateId, setAdvocateId] = useState(propertyCase.advocateId ?? "");
  const [sharedDocuments, setSharedDocuments] = useState(
    propertyCase.advocateDocuments.join("\n"),
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

    const docs = sharedDocuments
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);

    setSubmitting(true);

    try {
      await onAssign({
        caseId: propertyCase.id,
        advocateId,
        sharedDocuments: docs,
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
            placeholder="Example: original tax receipt still awaited"
            value={pendingDocumentsNote}
            onChange={(event) => setPendingDocumentsNote(event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Documents to pass now</span>
        <textarea
          className="field-input"
          placeholder="One document per line"
          rows={4}
          value={sharedDocuments}
          onChange={(event) => setSharedDocuments(event.target.value)}
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
