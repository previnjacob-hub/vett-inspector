"use client";

import { useMemo, useState } from "react";
import { type CreateCaseInput } from "@/components/app-state";
import { sectorLabels, type AppUser, type Sector } from "@/lib/mock-data";

type OfficeIntakeFormProps = {
  users: AppUser[];
  allowedSectors: Sector[];
  onCreateCase: (input: CreateCaseInput) => Promise<string>;
  onCaseCreated?: (caseId: string) => void;
};

const initialForm: CreateCaseInput = {
  enquirySource: "",
  clientName: "",
  assetName: "",
  sector: "property-verification",
  address: "",
  priority: "Routine",
  clientDocumentStatus: "Pending from client",
  pendingClientDocumentsNote: "",
  officeNotes: "",
  verifierId: "",
  advocateId: "",
};

export function OfficeIntakeForm({
  users,
  allowedSectors,
  onCreateCase,
  onCaseCreated,
}: OfficeIntakeFormProps) {
  const [form, setForm] = useState<CreateCaseInput>({
    ...initialForm,
    sector: allowedSectors[0] ?? "property-verification",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const verifierOptions = useMemo(
    () =>
      users.filter(
        (user) => user.role === "verifier" && user.sectors.includes(form.sector),
      ),
    [form.sector, users],
  );

  const advocateOptions = useMemo(
    () =>
      users.filter(
        (user) => user.role === "advocate" && user.sectors.includes(form.sector),
      ),
    [form.sector, users],
  );

  function update<K extends keyof CreateCaseInput>(key: K, value: CreateCaseInput[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "sector" ? { verifierId: "", advocateId: "" } : {}),
    }));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.enquirySource || !form.clientName || !form.assetName || !form.address || !form.verifierId) {
      setError("Fill all required intake fields and assign a verifier.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const caseId = await onCreateCase(form);
      setForm({
        ...initialForm,
        sector: allowedSectors[0] ?? "property-verification",
      });
      onCaseCreated?.(caseId);
    } catch {
      setError("Could not create case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <span className="eyebrow">New Intake</span>
          <h2>Create case</h2>
        </div>
      </div>

      <form className="intake-form" onSubmit={handleSubmit}>
        <div className="field-stack grid-two">
          <label className="field">
            <span className="field-label">
              Enquiry source
              <em>*</em>
            </span>
            <input
              className="field-input"
              placeholder="Broker / website / partner"
              value={form.enquirySource}
              onChange={(event) => update("enquirySource", event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">
              Client name
              <em>*</em>
            </span>
            <input
              className="field-input"
              placeholder="Client name"
              value={form.clientName}
              onChange={(event) => update("clientName", event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">
              Verification line
              <em>*</em>
            </span>
            <select
              className="field-input"
              value={form.sector}
              onChange={(event) => update("sector", event.target.value as Sector)}
            >
              {allowedSectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sectorLabels[sector]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Priority</span>
            <select
              className="field-input"
              value={form.priority}
              onChange={(event) => update("priority", event.target.value as CreateCaseInput["priority"])}
            >
              <option value="Routine">Routine</option>
              <option value="Fast Track">Fast Track</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">
              Property / asset name
              <em>*</em>
            </span>
            <input
              className="field-input"
              placeholder="Flat / plot / asset"
              value={form.assetName}
              onChange={(event) => update("assetName", event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">
              Assign verifier
              <em>*</em>
            </span>
            <select
              className="field-input"
              value={form.verifierId}
              onChange={(event) => update("verifierId", event.target.value)}
            >
              <option value="">Select verifier</option>
              {verifierOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} | {user.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">
            Address / location
            <em>*</em>
          </span>
          <textarea
            className="field-input"
            placeholder="Address / location"
            rows={3}
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
          />
        </label>

        <div className="field-stack grid-two">
          <label className="field">
            <span className="field-label">Client document status</span>
            <select
              className="field-input"
              value={form.clientDocumentStatus}
              onChange={(event) =>
                update(
                  "clientDocumentStatus",
                  event.target.value as CreateCaseInput["clientDocumentStatus"],
                )
              }
            >
              <option value="Pending from client">Pending from client</option>
              <option value="All received">All received</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Pending document note</span>
            <input
              className="field-input"
              placeholder="Pending doc note"
              value={form.pendingClientDocumentsNote}
              onChange={(event) => update("pendingClientDocumentsNote", event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Office notes</span>
          <textarea
            className="field-input"
            placeholder="Office notes"
            rows={3}
            value={form.officeNotes}
            onChange={(event) => update("officeNotes", event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Pre-assign advocate</span>
          <select
            className="field-input"
            value={form.advocateId ?? ""}
            onChange={(event) => update("advocateId", event.target.value)}
          >
            <option value="">Assign later</option>
            {advocateOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} | {user.title}
              </option>
            ))}
          </select>
        </label>

        {error ? <div className="field-error">{error}</div> : null}

        <div className="sticky-buttons">
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create case"}
          </button>
        </div>
      </form>
    </section>
  );
}
