"use client";

import { useState } from "react";
import { sectorLabels, type Role, type Sector } from "@/lib/mock-data";

const roleOptions: Role[] = ["office", "verifier", "advocate", "admin"];
const sectorOptions: Sector[] = [
  "property-verification",
  "land-verification",
  "used-car-verification",
];

export function AdminUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<Role>("office");
  const [sectors, setSectors] = useState<Sector[]>(["property-verification"]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleSector(sector: Sector) {
    setSectors((current) =>
      current.includes(sector) ? current.filter((item) => item !== sector) : [...current, sector],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          title,
          role,
          sectors,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create user.");
      }

      setMessage("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setTitle("");
      setRole("office");
      setSectors(["property-verification"]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Create portal users</h2>
        </div>
      </div>

      <form className="intake-form" onSubmit={handleSubmit}>
        <div className="field-stack grid-two">
          <label className="field">
            <span className="field-label">
              Name
              <em>*</em>
            </span>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">
              Email
              <em>*</em>
            </span>
            <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">
              Password
              <em>*</em>
            </span>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">
              Title
              <em>*</em>
            </span>
            <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">
              Role
              <em>*</em>
            </span>
            <select className="field-input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="field fieldset">
          <legend className="field-label">
            Sector access
            <em>*</em>
          </legend>
          <div className="choice-grid">
            {sectorOptions.map((sector) => (
              <label
                key={sector}
                className={sectors.includes(sector) ? "choice-card active" : "choice-card"}
              >
                <input
                  checked={sectors.includes(sector)}
                  type="checkbox"
                  onChange={() => toggleSector(sector)}
                />
                <span>{sectorLabels[sector]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <div className="field-error">{error}</div> : null}
        {message ? <div className="submit-banner">{message}</div> : null}

        <div className="sticky-buttons">
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create user"}
          </button>
        </div>
      </form>
    </section>
  );
}
