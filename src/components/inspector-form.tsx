"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { serializeAttachment } from "@/lib/case-attachments";
import type { Sector } from "@/lib/mock-data";
import {
  getInspectionSections,
  getInitialFormValues,
  type InspectionField,
} from "@/lib/inspection-template";
import { type VerifierSubmissionInput } from "@/components/app-state";

type InspectorFormProps = {
  caseId: string;
  inspector: string;
  sector: Sector;
  onSuccessfulSubmit?: (input: VerifierSubmissionInput) => Promise<void>;
};

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;
type MediaEntry = {
  name: string;
  type: "Photo / Video" | "Document";
  capturedAt: string;
  url?: string;
  mimeType?: string;
};
type LocationState = {
  status: "Not captured" | "Capturing..." | "Captured" | "Failed";
  value: string;
  capturedAt: string;
};
type DraftPayload = {
  values: FormValues;
  locationState: LocationState;
  evidenceFiles: MediaEntry[];
  documentFiles: MediaEntry[];
  fieldAttachments: Record<string, MediaEntry[]>;
};

const storagePrefix = "vett-inspector-form";

function isBlank(value: string) {
  return value.trim().length === 0;
}

function cleanLabel(label: string) {
  return label.replace(/\*/g, "").trim();
}

function getEmptyLocationState(): LocationState {
  return {
    status: "Not captured",
    value: "",
    capturedAt: "",
  };
}

function readDraft(caseId: string): DraftPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.localStorage.getItem(`${storagePrefix}-${caseId}`);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as DraftPayload;
  } catch {
    return null;
  }
}

function validate(
  values: FormValues,
  hasLocation: boolean,
  evidenceCount: number,
  sections: ReturnType<typeof getInspectionSections>,
) {
  const errors: FormErrors = {};

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.required && isBlank(values[field.id] ?? "")) {
        errors[field.id] = "This is mandatory.";
      }
    }
  }

  if (!hasLocation) {
    errors.locationCapture = "Location capture is mandatory before final submit.";
  }

  if (evidenceCount === 0) {
    errors.evidenceCapture = "Add at least one photo or video before final submit.";
  }

  return errors;
}

function getCompletionCount(
  values: FormValues,
  sections: ReturnType<typeof getInspectionSections>,
) {
  let completed = 0;
  let total = 0;

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.required) {
        total += 1;
        if (!isBlank(values[field.id] ?? "")) {
          completed += 1;
        }
      }
    }
  }

  return { completed, total };
}

function inferItemStatus(value: string): "Done" | "Pending" | "Blocked" {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return "Pending";
  }

  if (
    normalized.includes("access denied") ||
    normalized.includes("not found") ||
    normalized.includes("cannot confirm") ||
    normalized.includes("no access") ||
    normalized.includes("blocked")
  ) {
    return "Blocked";
  }

  return "Done";
}

function inferSectionRisk(sectionValues: string[]) {
  const joined = sectionValues.join(" ").toLowerCase();

  if (
    joined.includes("high") ||
    joined.includes("major") ||
    joined.includes("active leak") ||
    joined.includes("encroachment") ||
    joined.includes("government issue") ||
    joined.includes("do not proceed")
  ) {
    return "High" as const;
  }

  if (
    joined.includes("moderate") ||
    joined.includes("partial") ||
    joined.includes("weak") ||
    joined.includes("slow") ||
    joined.includes("pending")
  ) {
    return "Moderate" as const;
  }

  return "Low" as const;
}

async function uploadCaseFiles(
  caseId: string,
  files: File[],
  kind: string,
  entryType: "Photo / Video" | "Document",
) {
  const uploaded: MediaEntry[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseId", caseId);
    formData.append("kind", kind);

    const response = await fetch("/api/case-files", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const payload = (await response.json()) as { publicUrl: string; fileName: string };
    uploaded.push({
      name: payload.fileName,
      type: entryType,
      capturedAt: new Date().toLocaleString(),
      url: payload.publicUrl,
      mimeType: file.type,
    });
  }

  return uploaded;
}

function FieldControl({
  field,
  value,
  error,
  onChange,
}: {
  field: InspectionField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <label className="field">
        <span className="field-label">{field.label}</span>
        <textarea
          className={error ? "field-input has-error" : "field-input"}
          placeholder={field.placeholder}
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {field.helper ? <small>{field.helper}</small> : null}
        {error ? <span className="field-error">{error}</span> : null}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="field">
        <span className="field-label">{field.label}</span>
        <select
          className={error ? "field-input has-error" : "field-input"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {field.helper ? <small>{field.helper}</small> : null}
        {error ? <span className="field-error">{error}</span> : null}
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset className="field fieldset">
        <legend className="field-label">{field.label}</legend>
        <div className="choice-grid">
          {field.options?.map((option) => (
            <label
              key={option}
              className={value === option ? "choice-card active" : "choice-card"}
            >
              <input
                checked={value === option}
                name={field.id}
                type="radio"
                value={option}
                onChange={(event) => onChange(event.target.value)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {field.helper ? <small>{field.helper}</small> : null}
        {error ? <span className="field-error">{error}</span> : null}
      </fieldset>
    );
  }

  return (
    <label className="field">
      <span className="field-label">{field.label}</span>
      <input
        className={error ? "field-input has-error" : "field-input"}
        placeholder={field.placeholder}
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {field.helper ? <small>{field.helper}</small> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function InspectorForm({ caseId, inspector, sector, onSuccessfulSubmit }: InspectorFormProps) {
  const inspectionSections = useMemo(() => getInspectionSections(sector), [sector]);
  const initialDraft = readDraft(caseId);

  const [values, setValues] = useState<FormValues>(() => ({
    ...getInitialFormValues(sector),
    ...(initialDraft?.values ?? {}),
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState(0);
  const [draftState, setDraftState] = useState(
    initialDraft ? "Draft restored from this device" : "Draft not saved yet",
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>(
    initialDraft?.locationState ?? getEmptyLocationState(),
  );
  const [evidenceFiles, setEvidenceFiles] = useState<MediaEntry[]>(
    initialDraft?.evidenceFiles ?? [],
  );
  const [documentFiles, setDocumentFiles] = useState<MediaEntry[]>(
    initialDraft?.documentFiles ?? [],
  );
  const [fieldAttachments, setFieldAttachments] = useState<Record<string, MediaEntry[]>>(
    initialDraft?.fieldAttachments ?? {},
  );

  const completion = useMemo(() => getCompletionCount(values, inspectionSections), [inspectionSections, values]);
  const activeConfig = inspectionSections[activeSection];
  const handoffSectionIndex = inspectionSections.findIndex(
    (section) => section.id === "handoff",
  );

  function updateValue(fieldId: string, nextValue: string) {
    setValues((current) => ({ ...current, [fieldId]: nextValue }));
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function saveDraft() {
    const payload: DraftPayload = {
      values,
      locationState,
      evidenceFiles,
      documentFiles,
      fieldAttachments,
    };

    window.localStorage.setItem(`${storagePrefix}-${caseId}`, JSON.stringify(payload));
    setDraftState(
      `Draft saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    );
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationState({
        status: "Failed",
        value: "",
        capturedAt: "",
      });
      return;
    }

    setLocationState({
      status: "Capturing...",
      value: "",
      capturedAt: "",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          status: "Captured",
          value: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          capturedAt: new Date().toLocaleString(),
        });
        setErrors((current) => {
          const next = { ...current };
          delete next.locationCapture;
          return next;
        });
      },
      () => {
        setLocationState({
          status: "Failed",
          value: "",
          capturedAt: "",
        });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function handleMediaSelection(
    event: ChangeEvent<HTMLInputElement>,
    kind: "Photo / Video" | "Document",
  ) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const stampedFiles = await uploadCaseFiles(
        caseId,
        files,
        kind === "Photo / Video" ? "inspection-media" : "inspection-document",
        kind,
      );

      if (kind === "Photo / Video") {
        setEvidenceFiles((current) => [...current, ...stampedFiles]);
        setErrors((current) => {
          const next = { ...current };
          delete next.evidenceCapture;
          return next;
        });
      } else {
        setDocumentFiles((current) => [...current, ...stampedFiles]);
      }
    } finally {
      setUploading(false);
    }

    event.target.value = "";
  }

  async function handleFieldAttachmentSelection(
    event: ChangeEvent<HTMLInputElement>,
    fieldId: string,
    kind: "Photo / Video" | "Document",
  ) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const stampedFiles = await uploadCaseFiles(
        caseId,
        files,
        kind === "Photo / Video" ? "inspection-media" : "inspection-document",
        kind,
      );

      setFieldAttachments((current) => ({
        ...current,
        [fieldId]: [...(current[fieldId] ?? []), ...stampedFiles],
      }));
    } finally {
      setUploading(false);
    }

    event.target.value = "";
  }

  function buildSubmissionPayload(): VerifierSubmissionInput {
    const specialDocumentKinds: Record<string, "title-deed" | "tax-receipt" | "approval-proof"> = {
      saleDeedShared: "title-deed",
      titleDeedReceived: "title-deed",
      taxReceiptShared: "tax-receipt",
      taxReceiptReceived: "tax-receipt",
      approvalDocShared: "approval-proof",
    };
    const sections = inspectionSections.map((section) => {
      const items = section.fields.map((field) => ({
        label: cleanLabel(field.label),
        status: inferItemStatus(values[field.id] ?? ""),
        note: values[field.id] ? values[field.id] : undefined,
        attachments: (fieldAttachments[field.id] ?? [])
          .filter((entry) => entry.url)
          .map((entry) => ({
            label: entry.name,
            fileName: entry.name,
            url: entry.url as string,
            uploadedAt: entry.capturedAt,
            mimeType: entry.mimeType,
          })),
      }));
      const sectionValues = section.fields.map((field) => values[field.id] ?? "");

      return {
        id: section.id,
        title: section.title,
        risk: inferSectionRisk(sectionValues),
        evidenceCount: items.reduce((count, item) => count + (item.attachments?.length ?? 0), 0),
        items,
      };
    });

    const structuralFlags = Object.entries(values)
      .filter(([, value]) => {
        const normalized = value.toLowerCase();
        return (
          normalized.includes("high") ||
          normalized.includes("major") ||
          normalized.includes("active leak") ||
          normalized.includes("encroachment") ||
          normalized.includes("do not proceed") ||
          normalized.includes("hazard")
        );
      })
      .slice(0, 6)
      .map(([fieldId, value]) => {
        const field = inspectionSections.flatMap((section) => section.fields).find((entry) => entry.id === fieldId);
        return `${cleanLabel(field?.label ?? fieldId)}: ${value}`;
      });

    const verifierSummary =
      sector === "land-verification"
        ? `Land visit completed by ${inspector}. Boundary, access, terrain, and submitted site documents were recorded for office and legal review.`
        : `Property visit completed by ${inspector}. Structural condition, utilities, livability findings, and submitted site documents were recorded for office and legal review.`;

    const reportDocuments = [
      ...evidenceFiles.filter((entry) => entry.url).map((entry) =>
        serializeAttachment({
          kind: "inspection-media",
          label: entry.name,
          fileName: entry.name,
          url: entry.url as string,
          source: "verifier",
          uploadedAt: entry.capturedAt,
          mimeType: entry.mimeType,
        }),
      ),
      ...documentFiles.filter((entry) => entry.url).map((entry) =>
        serializeAttachment({
          kind: "inspection-document",
          label: entry.name,
          fileName: entry.name,
          url: entry.url as string,
          source: "verifier",
          uploadedAt: entry.capturedAt,
          mimeType: entry.mimeType,
        }),
      ),
      ...Object.entries(fieldAttachments).flatMap(([fieldId, entries]) =>
        entries
          .filter((entry) => entry.url)
          .map((entry) =>
            serializeAttachment({
              kind: specialDocumentKinds[fieldId] ?? (entry.type === "Document" ? "inspection-document" : "inspection-media"),
              label: entry.name,
              fileName: entry.name,
              url: entry.url as string,
              source: "verifier",
              uploadedAt: entry.capturedAt,
              mimeType: entry.mimeType,
            }),
          ),
      ),
    ];

    return {
      caseId,
      verifierSummary,
      structuralFlags,
      sections,
      reportDocuments,
    };
  }

  async function handleSubmit() {
    const nextErrors = validate(
      values,
      locationState.status === "Captured",
      evidenceFiles.length,
      inspectionSections,
    );
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstErrorField = inspectionSections.findIndex((section) =>
        section.fields.some((field) => nextErrors[field.id]),
      );

      if (firstErrorField >= 0) {
        setActiveSection(firstErrorField);
      } else if (nextErrors.locationCapture) {
        setActiveSection(0);
      } else if (nextErrors.evidenceCapture) {
        setActiveSection(3);
      }

      setSubmitted(false);
      return;
    }

    saveDraft();
    setSubmitting(true);

    try {
      const payload = buildSubmissionPayload();
      await onSuccessfulSubmit?.(payload);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface form-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Inspector capture</span>
          <h2>{sector === "land-verification" ? "Land verification checklist" : "Apartment / house checklist"}</h2>
        </div>
        <span className="small-note">{inspector}</span>
      </div>

      <div className="form-progress">
        <div>
          <strong>
            {completion.completed}/{completion.total}
          </strong>
          <span>required checks completed</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div
            className="progress-fill"
            style={{ width: `${(completion.completed / completion.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mobile-tabs">
        {inspectionSections.map((section, index) => (
          <button
            key={section.id}
            className={index === activeSection ? "mobile-tab active" : "mobile-tab"}
            onClick={() => setActiveSection(index)}
            type="button"
          >
            <span>{index + 1}</span>
            <strong>{section.title}</strong>
          </button>
        ))}
      </div>

      <article className="form-section-card">
        <div className="form-section-header">
          <div>
            <span className="eyebrow">Section {activeSection + 1}</span>
            <h3>{activeConfig.title}</h3>
          </div>
          <p>{activeConfig.description}</p>
        </div>

        <div className="field-stack">
          {activeConfig.id === "arrival" || activeConfig.id === "basic" || activeConfig.id === "location" ? (
            <div className="capture-panel">
              <div className="capture-header">
                <div>
                  <span className="eyebrow">Location</span>
                  <h3>Capture mobile location</h3>
                </div>
                <button className="secondary-button" onClick={captureLocation} type="button">
                  Allow and capture GPS
                </button>
              </div>
              <p>
                Ask the inspector to allow location access on mobile so the visit is tied to the
                {sector === "land-verification" ? " land entrance." : " property entrance."}
              </p>
              <div className="capture-status-row">
                <span
                  className={
                    locationState.status === "Captured" ? "status-pill status-done" : "status-pill"
                  }
                >
                  {locationState.status}
                </span>
                {locationState.value ? (
                  <strong>
                    {locationState.value} | {locationState.capturedAt}
                  </strong>
                ) : null}
              </div>
              {errors.locationCapture ? (
                <span className="field-error">{errors.locationCapture}</span>
              ) : null}
            </div>
          ) : null}

          {["utilities", "structure", "plumbing", "electrical", "fittings", "common", "boundary", "access", "physical", "assessment"].includes(activeConfig.id) ? (
            <div className="capture-panel">
              <div className="capture-header">
                <div>
                  <span className="eyebrow">Evidence</span>
                  <h3>Collect photos and videos</h3>
                </div>
                <label className="secondary-button file-trigger">
                  <input
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    type="file"
                    onChange={(event) => handleMediaSelection(event, "Photo / Video")}
                  />
                  Add photos / videos
                </label>
              </div>
              <p>
                This keeps the workflow testable right now. We stamp the selected evidence locally,
                and upload them to the shared case so office can use them in reports.
              </p>
              <div className="upload-list">
                {evidenceFiles.length === 0 ? (
                  <span className="small-note">No evidence selected yet.</span>
                ) : (
                  evidenceFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="upload-item">
                      <strong>{file.name}</strong>
                      <span>
                        {file.type} | {file.capturedAt}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {errors.evidenceCapture ? (
                <span className="field-error">{errors.evidenceCapture}</span>
              ) : null}
            </div>
          ) : null}

          {activeConfig.id === "handoff" ? (
            <div className="capture-panel">
              <div className="capture-header">
                <div>
                  <span className="eyebrow">Advocate packet</span>
                  <h3>Attach handoff documents</h3>
                </div>
                <label className="secondary-button file-trigger">
                  <input
                    accept=".pdf,image/*,.doc,.docx"
                    multiple
                    type="file"
                    onChange={(event) => handleMediaSelection(event, "Document")}
                  />
                  Add documents
                </label>
              </div>
              <p>
                Upload whatever the client or seller shared at site. Missing documents can still be
                marked here so office can follow up later instead of waiting for all papers up front.
              </p>
              <div className="upload-list">
                {documentFiles.length === 0 ? (
                  <span className="small-note">No handoff documents selected yet.</span>
                ) : (
                  documentFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="upload-item">
                      <strong>{file.name}</strong>
                      <span>
                        {file.type} | {file.capturedAt}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {activeConfig.fields.map((field) => (
            <div key={field.id} className="field-with-upload">
              <FieldControl
                error={errors[field.id]}
                field={field}
                value={values[field.id] ?? ""}
                onChange={(nextValue) => updateValue(field.id, nextValue)}
              />
              <div className="mini-upload-panel">
                <div className="mini-upload-header">
                  <span className="small-note">
                    {activeConfig.id === "handoff" ? "Attach this document here" : "Attach proof for this item"}
                  </span>
                  <label className="secondary-button file-trigger mini-upload-button">
                    <input
                      accept={activeConfig.id === "handoff" ? ".pdf,image/*,.doc,.docx" : "image/*,video/*"}
                      capture={activeConfig.id === "handoff" ? undefined : "environment"}
                      multiple
                      type="file"
                      onChange={(event) =>
                        handleFieldAttachmentSelection(
                          event,
                          field.id,
                          activeConfig.id === "handoff" ? "Document" : "Photo / Video",
                        )
                      }
                    />
                    Attach
                  </label>
                </div>
                {(fieldAttachments[field.id] ?? []).length > 0 ? (
                  <div className="mini-upload-list">
                    {(fieldAttachments[field.id] ?? []).map((file, index) => (
                      <div key={`${field.id}-${file.name}-${index}`} className="mini-upload-item">
                        <strong>{file.name}</strong>
                        <span>
                          {file.type} | {file.capturedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="sticky-actions">
        <div className="sticky-copy">
          <strong>{draftState}</strong>
          <span>
            {uploading
              ? "Uploading evidence to the case..."
              : "Submit stays blocked until mandatory fields, location, and evidence are added."}
          </span>
        </div>
        <div className="sticky-buttons">
          <button
            className="secondary-button"
            onClick={() => setActiveSection((current) => Math.max(current - 1, 0))}
            type="button"
          >
            Previous
          </button>
          <button
                className="secondary-button"
                onClick={() =>
                  setActiveSection((current) =>
                    Math.min(current + 1, inspectionSections.length - 1),
                  )
                }
            type="button"
          >
            {activeSection === handoffSectionIndex ? "Stay on handoff" : "Next"}
          </button>
          <button className="secondary-button" onClick={saveDraft} type="button">
            Save draft
          </button>
          <button className="primary-button" onClick={() => void handleSubmit()} type="button">
            {submitting ? "Submitting..." : "Final submit"}
          </button>
        </div>
      </div>

      {submitted ? (
        <div className="submit-banner">
          Inspection draft passed validation on this device. Next step is storing this in the
          shared database and locking the case after submit.
        </div>
      ) : null}
    </section>
  );
}
