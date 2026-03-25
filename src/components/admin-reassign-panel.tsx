"use client";

import { useEffect, useMemo, useState } from "react";
import { type ReassignInput } from "@/components/app-state";
import { type AppUser, type PropertyCase } from "@/lib/mock-data";

export function AdminReassignPanel({
  propertyCase,
  users,
  onReassignVerifier,
  onReassignAdvocate,
}: {
  propertyCase: PropertyCase;
  users: AppUser[];
  onReassignVerifier: (input: ReassignInput) => Promise<void>;
  onReassignAdvocate: (input: ReassignInput) => Promise<void>;
}) {
  const verifierOptions = useMemo(
    () => users.filter((user) => user.role === "verifier" && user.sectors.includes(propertyCase.sector)),
    [propertyCase.sector, users],
  );
  const advocateOptions = useMemo(
    () => users.filter((user) => user.role === "advocate" && user.sectors.includes(propertyCase.sector)),
    [propertyCase.sector, users],
  );
  const [verifierId, setVerifierId] = useState(propertyCase.verifierId ?? "");
  const [advocateId, setAdvocateId] = useState(propertyCase.advocateId ?? "");
  const [submitting, setSubmitting] = useState<"" | "verifier" | "advocate">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const currentVerifier = users.find((user) => user.id === propertyCase.verifierId);
  const currentAdvocate = users.find((user) => user.id === propertyCase.advocateId);

  useEffect(() => {
    setVerifierId(propertyCase.verifierId ?? "");
    setAdvocateId(propertyCase.advocateId ?? "");
  }, [propertyCase.advocateId, propertyCase.verifierId]);

  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin Control</span>
          <h2>Reassign verifier or advocate</h2>
        </div>
      </div>

      <div className="field-stack grid-two">
        <label className="field">
          <span className="field-label">Verifier</span>
          <span className="small-note">
            Current: {currentVerifier ? `${currentVerifier.name} | ${currentVerifier.title}` : "Not assigned"}
          </span>
          <select className="field-input" value={verifierId} onChange={(event) => setVerifierId(event.target.value)}>
            <option value="">Select verifier</option>
            {verifierOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} | {user.title}
              </option>
            ))}
          </select>
          <div className="sticky-buttons">
            <button
              className="secondary-button"
              disabled={!verifierId || submitting !== "" || verifierId === propertyCase.verifierId}
              onClick={async () => {
                setSubmitting("verifier");
                setMessage("");
                setError("");
                try {
                  await onReassignVerifier({ caseId: propertyCase.id, userId: verifierId });
                  const nextVerifier = users.find((user) => user.id === verifierId);
                  setMessage(`Verifier reassigned to ${nextVerifier?.name ?? "selected verifier"}.`);
                } catch {
                  setError("Could not reassign verifier.");
                } finally {
                  setSubmitting("");
                }
              }}
              type="button"
            >
              {submitting === "verifier" ? "Saving..." : "Reassign verifier"}
            </button>
          </div>
        </label>

        <label className="field">
          <span className="field-label">Advocate</span>
          <span className="small-note">
            Current: {currentAdvocate ? `${currentAdvocate.name} | ${currentAdvocate.title}` : "Not assigned"}
          </span>
          <select className="field-input" value={advocateId} onChange={(event) => setAdvocateId(event.target.value)}>
            <option value="">Select advocate</option>
            {advocateOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} | {user.title}
              </option>
            ))}
          </select>
          <div className="sticky-buttons">
            <button
              className="secondary-button"
              disabled={!advocateId || submitting !== "" || advocateId === propertyCase.advocateId}
              onClick={async () => {
                setSubmitting("advocate");
                setMessage("");
                setError("");
                try {
                  await onReassignAdvocate({ caseId: propertyCase.id, userId: advocateId });
                  const nextAdvocate = users.find((user) => user.id === advocateId);
                  setMessage(`Advocate reassigned to ${nextAdvocate?.name ?? "selected advocate"}.`);
                } catch {
                  setError("Could not reassign advocate.");
                } finally {
                  setSubmitting("");
                }
              }}
              type="button"
            >
              {submitting === "advocate" ? "Saving..." : "Reassign advocate"}
            </button>
          </div>
        </label>
      </div>

      {message ? <p className="field-success top-space">{message}</p> : null}
      {error ? <p className="field-error top-space">{error}</p> : null}
    </section>
  );
}
