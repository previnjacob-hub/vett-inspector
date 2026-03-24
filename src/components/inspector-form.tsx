"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  apartmentInspectionSections,
  getInitialFormValues,
  type InspectionField,
} from "@/lib/inspection-template";

type InspectorFormProps = {
  caseId: string;
  inspector: string;
  onSuccessfulSubmit?: () => void;
};

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;
type MediaEntry = {
  name: string;
  type: "Photo / Video" | "Document";
  capturedAt: string;
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
};

const storagePrefix = "vett-inspector-form";

function isBlank(value: string) {
  return value.trim().length === 0;
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

function validate(values: FormValues, hasLocation: boolean, evidenceCount: number) {
  const errors: FormErrors = {};

  for (const section of apartmentInspectionSections) {
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

function getCompletionCount(values: FormValues) {
  let completed = 0;
  let total = 0;

  for (const section of apartmentInspectionSections) {
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
        <span className="field-label">
          {field.label}
          {field.required ? <em>Mandatory</em> : null}
        </span>
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
        <span className="field-label">
          {field.label}
          {field.required ? <em>Mandatory</em> : null}
        </span>
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
        <legend className="field-label">
          {field.label}
          {field.required ? <em>Mandatory</em> : null}
        </legend>
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
      <span className="field-label">
        {field.label}
        {field.required ? <em>Mandatory</em> : null}
      </span>
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

export function InspectorForm({ caseId, inspector, onSuccessfulSubmit }: InspectorFormProps) {
  const initialDraft = readDraft(caseId);

  const [values, setValues] = useState<FormValues>(() => ({
    ...getInitialFormValues(),
    ...(initialDraft?.values ?? {}),
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState(0);
  const [draftState, setDraftState] = useState(
    initialDraft ? "Draft restored from this device" : "Draft not saved yet",
  );
  const [submitted, setSubmitted] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>(
    initialDraft?.locationState ?? getEmptyLocationState(),
  );
  const [evidenceFiles, setEvidenceFiles] = useState<MediaEntry[]>(
    initialDraft?.evidenceFiles ?? [],
  );
  const [documentFiles, setDocumentFiles] = useState<MediaEntry[]>(
    initialDraft?.documentFiles ?? [],
  );

  const completion = useMemo(() => getCompletionCount(values), [values]);
  const activeConfig = apartmentInspectionSections[activeSection];
  const handoffSectionIndex = apartmentInspectionSections.findIndex(
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

  function handleMediaSelection(
    event: ChangeEvent<HTMLInputElement>,
    kind: "Photo / Video" | "Document",
  ) {
    const files = Array.from(event.target.files ?? []);
    const stampedFiles = files.map((file) => ({
      name: file.name,
      type: kind,
      capturedAt: new Date().toLocaleString(),
    }));

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

    event.target.value = "";
  }

  function handleSubmit() {
    const nextErrors = validate(values, locationState.status === "Captured", evidenceFiles.length);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstErrorField = apartmentInspectionSections.findIndex((section) =>
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
    setSubmitted(true);
    onSuccessfulSubmit?.();
  }

  return (
    <section className="surface form-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Inspector capture</span>
          <h2>Mobile-first mandatory checklist</h2>
        </div>
        <span className="small-note">{inspector}</span>
      </div>

      <div className="form-progress">
        <div>
          <strong>
            {completion.completed}/{completion.total}
          </strong>
          <span>mandatory checks completed</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div
            className="progress-fill"
            style={{ width: `${(completion.completed / completion.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mobile-tabs">
        {apartmentInspectionSections.map((section, index) => (
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
          {activeConfig.id === "arrival" ? (
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
                property entrance.
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

          {activeConfig.id === "utilities" ? (
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
                then move to real shared uploads in the backend step.
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
                Attach only the papers that should move to legal review, like sale deed copy, tax
                receipt, approvals, or other title-related records.
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
            <FieldControl
              key={field.id}
              error={errors[field.id]}
              field={field}
              value={values[field.id] ?? ""}
              onChange={(nextValue) => updateValue(field.id, nextValue)}
            />
          ))}
        </div>
      </article>

      <div className="sticky-actions">
        <div className="sticky-copy">
          <strong>{draftState}</strong>
          <span>Submit stays blocked until mandatory fields, location, and evidence are added.</span>
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
                Math.min(current + 1, apartmentInspectionSections.length - 1),
              )
            }
            type="button"
          >
            {activeSection === handoffSectionIndex ? "Stay on handoff" : "Next"}
          </button>
          <button className="secondary-button" onClick={saveDraft} type="button">
            Save draft
          </button>
          <button className="primary-button" onClick={handleSubmit} type="button">
            Final submit
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
