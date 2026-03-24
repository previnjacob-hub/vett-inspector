"use client";

import { useState } from "react";

export function AuthLoginForm({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onLogin(email, password);
    } catch {
      setError("Login failed. Check email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Login</span>
          <h2>Sign in with your Vett account</h2>
        </div>
      </div>

      <form className="intake-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">
            Email
            <em>*</em>
          </span>
          <input
            className="field-input"
            placeholder="name@usevett.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">
            Password
            <em>*</em>
          </span>
          <input
            className="field-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <div className="field-error">{error}</div> : null}

        <div className="sticky-buttons">
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </section>
  );
}
