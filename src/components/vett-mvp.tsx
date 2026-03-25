"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminUserForm } from "@/components/admin-user-form";
import { getOfficeMetrics, useAppState } from "@/components/app-state";
import { AuthLoginForm } from "@/components/auth-login-form";
import { OfficeIntakeForm } from "@/components/office-intake-form";
import {
  futureSectors,
  getRiskClass,
  getStageClass,
  sectorLabels,
  type AppUser,
  type PropertyCase,
} from "@/lib/mock-data";

const portalTitles = {
  admin: "Admin setup for roles, sectors, and user creation",
  office: "Office desk for intake, assignments, and final branded report handling",
  verifier: "Verifier portal for field photos, details, and structural submission",
  advocate: "Advocate portal for legal review, attachments, and report upload",
};

function LoginPanel({
  users,
  onLogin,
}: {
  users: AppUser[];
  onLogin: (userId: string) => void;
}) {
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Portal Access</span>
          <h2>Select a role-based login</h2>
        </div>
      </div>

      <div className="role-switcher">
        {users.map((user) => (
          <button key={user.id} className="role-card" onClick={() => onLogin(user.id)} type="button">
            <strong>{user.name}</strong>
            <span>{user.title}</span>
            <span className="small-note">
              {user.role} | {user.sectors.map((sector) => sectorLabels[sector]).join(", ")}
            </span>
            <span className="card-action-hint">Open portal</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CaseList({
  cases,
  selectedCase,
  onSelect,
}: {
  cases: PropertyCase[];
  selectedCase?: PropertyCase;
  onSelect: (id: string) => void;
}) {
  if (cases.length === 0) {
    return (
      <article className="case-preview">
        <h3>No active cases</h3>
        <p>This queue is clear right now.</p>
      </article>
    );
  }

  return (
    <div className="case-list">
      {cases.map((item) => (
        <button
          key={item.id}
          className={item.id === selectedCase?.id ? "case-card active" : "case-card"}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          <div className="case-card-top">
            <strong>{item.caseRef}</strong>
            <span className={getStageClass(item.stage)}>{item.stage}</span>
          </div>
          <span className="case-card-client">{item.assetName}</span>
          <span className="case-card-meta">
            {sectorLabels[item.sector]} | {item.address}
          </span>
          <div className="case-card-bottom">
            <span className={getRiskClass(item.overallRisk)}>{item.overallRisk} risk</span>
            <span>{item.sla}</span>
          </div>
          <span className="card-action-hint">Click to open case</span>
        </button>
      ))}
    </div>
  );
}

export function VettMvp() {
  const {
    accessibleSops,
    allCases,
    authEnabled,
    cases,
    createCase,
    currentUser,
    loading,
    loginAs,
    loginWithPassword,
    logout,
    users,
  } = useAppState();
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) ?? cases[0],
    [cases, selectedCaseId],
  );

  const officeMetrics = getOfficeMetrics(allCases, users);

  if (loading) {
    return (
      <div className="workspace-grid">
        <section className="surface">
          <span className="eyebrow">Loading</span>
          <h2>Connecting to workspace data</h2>
          <p>Fetching users and cases from the shared database.</p>
        </section>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="workspace-grid">
        <section className="surface hero-panel">
          <div className="hero-copy">
            <div className="brand-lockup">
              <Image alt="Vett" className="brand-mark" height={40} priority src="/vett-mark.svg" width={148} />
            </div>
            <span className="eyebrow">Vett Workflow Portal</span>
            <h1>Property verification operations, cleaned up for field, legal, and office teams.</h1>
            <p>
              Office team creates the case, verifier collects field evidence, advocate uploads legal
              report, and office team prepares the branded combined report for client sharing.
            </p>
            <div className="hero-badges">
              <span className="document-pill">Apartment</span>
              <span className="document-pill">Land</span>
              <span className="document-pill">Used Car later</span>
            </div>
          </div>
        </section>

        {authEnabled ? <AuthLoginForm onLogin={loginWithPassword} /> : <LoginPanel onLogin={loginAs} users={users} />}

        <section className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Sectors</span>
              <h2>Current and future verification lines</h2>
            </div>
          </div>

          <div className="playbook-grid">
            {futureSectors.map((sector) => (
              <article key={sector.title} className="playbook-card">
                <h3>{sector.title}</h3>
                <p>{sector.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="workspace-grid">
      <section className="surface hero-panel">
          <div className="hero-copy">
            <div className="brand-lockup">
              <Image alt="Vett" className="brand-mark" height={36} priority src="/vett-mark.svg" width={134} />
            </div>
            <span className="eyebrow">{currentUser.role} Portal</span>
            <h1>{portalTitles[currentUser.role]}</h1>
            <p>
              Logged in as {currentUser.name}. Access is filtered by role and sector, and the queue
              only shows work meant for this user.
            </p>
          </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={logout} type="button">
            Switch login
          </button>
          {selectedCase ? (
            <Link className="primary-button" href={`/case/${selectedCase.id}`}>
              Open selected case
            </Link>
          ) : null}
        </div>
      </section>

      {currentUser.role === "office" || currentUser.role === "admin" ? (
        <>
          <section className="surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Office Dashboard</span>
                <h2>Track the full pipeline</h2>
              </div>
            </div>

            <div className="three-column">
              <article className="metric-card metric-teal">
                <span>Enquiries added today</span>
                <strong>{officeMetrics.enquiriesToday}</strong>
              </article>
              <article className="metric-card metric-amber">
                <span>Ready for advocate assignment</span>
                <strong>{officeMetrics.readyForAdvocate}</strong>
              </article>
              <article className="metric-card metric-coral">
                <span>Final desk workload</span>
                <strong>{officeMetrics.finalDeskCount}</strong>
              </article>
              <article className="metric-card metric-slate">
                <span>Verifiers in field</span>
                <strong>{officeMetrics.verifierInField.length}</strong>
              </article>
            </div>

            <div className="bullet-panel">
              <p>In field now: {officeMetrics.verifierInField.join(", ") || "No one in field right now"}</p>
              <p>Office team controls case creation, verifier assignment, advocate assignment, and client dispatch.</p>
              <p>Final branded report is prepared only after both structural and legal reports are complete.</p>
            </div>
          </section>

          <OfficeIntakeForm
            allowedSectors={currentUser.sectors}
            onCaseCreated={setSelectedCaseId}
            onCreateCase={createCase}
            users={users}
          />
          {currentUser.role === "admin" ? <AdminUserForm /> : null}
        </>
      ) : null}

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {currentUser.role === "verifier"
                ? "Verifier Queue"
                : currentUser.role === "advocate"
                  ? "Advocate Queue"
                  : "All Cases"}
            </span>
            <h2>
              {currentUser.role === "verifier"
                ? "Only properties assigned to you for field work"
                : currentUser.role === "advocate"
                  ? "Only legal review cases assigned to you"
                  : "Office view of all pipeline stages"}
            </h2>
          </div>
          <span className="small-note">{cases.length} visible cases</span>
        </div>

        <div className="queue-layout">
          <CaseList cases={cases} onSelect={setSelectedCaseId} selectedCase={selectedCase} />

          {selectedCase ? (
            <article className="case-preview">
              <div className="case-preview-header">
                <div>
                  <span className="eyebrow">Selected case</span>
                  <h3>{selectedCase.caseRef}</h3>
                </div>
                <Link className="inline-link" href={`/case/${selectedCase.id}`}>
                  Open case
                </Link>
              </div>

              <p>{selectedCase.assetName}</p>
              <div className="detail-grid">
                <div>
                  <span className="label">Sector</span>
                  <strong>{sectorLabels[selectedCase.sector]}</strong>
                </div>
                <div>
                  <span className="label">Client</span>
                  <strong>{selectedCase.clientName}</strong>
                </div>
                <div>
                  <span className="label">Enquiry source</span>
                  <strong>{selectedCase.enquirySource}</strong>
                </div>
                <div>
                  <span className="label">Current stage</span>
                  <strong>{selectedCase.stage}</strong>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="split-layout">
        <article className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SOP Access</span>
              <h2>Only visible to the relevant people</h2>
            </div>
          </div>

          <div className="playbook-grid single-column">
            {accessibleSops.map((document) => (
              <article key={document.id} className="playbook-card">
                <h3>{document.title}</h3>
                <p>{document.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Verification Lines</span>
              <h2>What this system handles</h2>
            </div>
          </div>

          <div className="playbook-grid single-column">
            {futureSectors.map((sector) => (
              <article key={sector.title} className="playbook-card">
                <h3>{sector.title}</h3>
                <p>{sector.body}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
