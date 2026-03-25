"use client";

import Link from "next/link";
import Image from "next/image";
import { AdminReassignPanel } from "@/components/admin-reassign-panel";
import { AdvocateHandoffForm } from "@/components/advocate-handoff-form";
import { AdvocateReviewForm } from "@/components/advocate-review-form";
import { FinalReportForm } from "@/components/final-report-form";
import { InspectorForm } from "@/components/inspector-form";
import { useAppState } from "@/components/app-state";
import { parseAttachments } from "@/lib/case-attachments";
import { getRiskClass, getStageClass, sectorLabels, type PropertyCase } from "@/lib/mock-data";

function getRoleViewTitle(role: string) {
  if (role === "office" || role === "admin") {
    return "Office pipeline view";
  }

  if (role === "verifier") {
    return "Verifier workspace";
  }

  return "Advocate workspace";
}

function canOpenCase(userId: string, role: string, propertyCase: PropertyCase) {
  if (role === "admin" || role === "office") {
    return true;
  }

  if (role === "verifier") {
    return (
      propertyCase.verifierId === userId &&
      (propertyCase.stage === "Assigned to Verifier" || propertyCase.stage === "Verifier In Progress")
    );
  }

  return (
    propertyCase.advocateId === userId &&
    (propertyCase.stage === "Assigned to Advocate" || propertyCase.stage === "Advocate In Progress")
  );
}

export function CaseWorkspace({ propertyCase }: { propertyCase: PropertyCase }) {
  const {
    assignToAdvocate,
    completeAdvocateReview,
    currentUser,
    reassignAdvocate,
    reassignVerifier,
    saveFinalReport,
    startAdvocateReview,
    submitVerifierCase,
    users,
  } = useAppState();
  const attachments = parseAttachments(propertyCase.advocateDocuments);

  if (!currentUser) {
    return (
      <div className="workspace-grid">
        <section className="surface">
          <h2>Login required</h2>
          <p>Go back and sign in to the correct role-based portal first.</p>
          <Link className="back-link" href="/">
            Back to dashboard
          </Link>
        </section>
      </div>
    );
  }

  if (!canOpenCase(currentUser.id, currentUser.role, propertyCase)) {
    return (
      <div className="workspace-grid">
        <section className="surface">
          <h2>Access restricted</h2>
          <p>This case is not part of your current workflow queue.</p>
          <Link className="back-link" href="/">
            Back to dashboard
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="workspace-grid">
      <section className="topbar-shell">
        <div className="topbar-brand">
          <Image alt="Vett" className="brand-mark" height={30} priority src="/vett-mark.svg" width={118} />
          <div>
            <strong>Case workspace</strong>
            <span>{currentUser.name}</span>
          </div>
        </div>
        <div className="topbar-chip-row">
          <span className="topbar-chip">{sectorLabels[propertyCase.sector]}</span>
          <span className="topbar-chip">{propertyCase.caseRef}</span>
        </div>
      </section>

      <section className="surface case-hero">
        <div>
          <Link className="back-link" href="/">
            Back to dashboard
          </Link>
          <span className="eyebrow">{getRoleViewTitle(currentUser.role)}</span>
          <h1>{propertyCase.assetName}</h1>
          <p>{propertyCase.address}</p>
        </div>
        <div className="hero-stats">
          <div>
            <span className="label">Case ID</span>
            <strong>{propertyCase.caseRef}</strong>
          </div>
          <div>
            <span className="label">Current stage</span>
            <strong className={getStageClass(propertyCase.stage)}>{propertyCase.stage}</strong>
          </div>
          <div>
            <span className="label">Overall risk</span>
            <strong className={getRiskClass(propertyCase.overallRisk)}>{propertyCase.overallRisk}</strong>
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Case summary</span>
            <h2>What this case is and where it stands</h2>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <span className="label">Sector</span>
            <strong>{sectorLabels[propertyCase.sector]}</strong>
          </div>
          <div>
            <span className="label">Client</span>
            <strong>{propertyCase.clientName}</strong>
          </div>
          <div>
            <span className="label">Enquiry source</span>
            <strong>{propertyCase.enquirySource}</strong>
          </div>
          <div>
            <span className="label">Priority</span>
            <strong>{propertyCase.priority}</strong>
          </div>
          <div>
            <span className="label">Client document status</span>
            <strong>{propertyCase.clientDocumentStatus}</strong>
          </div>
          <div>
            <span className="label">Pending client documents</span>
            <strong>{propertyCase.pendingClientDocumentsNote || "None noted"}</strong>
          </div>
        </div>

        <div className="task-stack top-space">
          <article className="task-card">
            <strong>Office notes</strong>
            <p>{propertyCase.officeNotes || "No office notes added yet."}</p>
          </article>
        </div>
      </section>

      {currentUser.role === "admin" ? (
        <AdminReassignPanel
          onReassignAdvocate={reassignAdvocate}
          onReassignVerifier={reassignVerifier}
          propertyCase={propertyCase}
          users={users}
        />
      ) : null}

      {(currentUser.role === "office" || currentUser.role === "admin" || currentUser.role === "verifier") && (
        <section className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Verifier report</span>
              <h2>Field report and structural findings</h2>
            </div>
          </div>

          <p>{propertyCase.verifierSummary}</p>

          <div className="inspection-grid">
            {propertyCase.sections.length > 0 ? (
              propertyCase.sections.map((section) => (
                <article key={section.id} className="inspection-card">
                  <div className="inspection-card-top">
                    <h3>{section.title}</h3>
                    <span className={getRiskClass(section.risk)}>{section.risk}</span>
                  </div>
                  <p>{section.evidenceCount} evidence items attached</p>
                  <div className="checklist">
                    {section.items.map((item) => (
                      <div key={item.label} className="check-item">
                        <div className="check-item-row">
                          <strong>{item.label}</strong>
                          <span className={getStageClass(item.status)}>{item.status}</span>
                        </div>
                        {item.note ? <p>{item.note}</p> : null}
                      </div>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <article className="inspection-card">
                <h3>Verifier work pending</h3>
                <p>
                  This case has been created by office intake and assigned, but the verifier has not
                  uploaded the field report yet.
                </p>
              </article>
            )}
          </div>

          <div className="flag-group">
            {propertyCase.structuralFlags.map((flag) => (
              <span key={flag} className="flag-chip">
                {flag}
              </span>
            ))}
          </div>
        </section>
      )}

      {currentUser.role === "verifier" &&
      (propertyCase.sector === "property-verification" || propertyCase.sector === "land-verification") ? (
        <InspectorForm
          caseId={propertyCase.id}
          inspector={currentUser.name}
          sector={propertyCase.sector}
          onSuccessfulSubmit={() => submitVerifierCase(propertyCase.id)}
        />
      ) : null}

      {(currentUser.role === "office" || currentUser.role === "admin" || currentUser.role === "advocate") && (
        <section className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Advocate handoff</span>
              <h2>Legal packet and legal report status</h2>
            </div>
          </div>

          <p>{propertyCase.legalSummary}</p>

          <div className="document-stack">
            {attachments.length === 0 ? (
              <span className="small-note">No legal packet files uploaded yet.</span>
            ) : (
              attachments.map((attachment) => (
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
            )}
          </div>

          <div className="task-stack">
            {propertyCase.legalItems.map((item) => (
              <div key={item.label} className="task-card">
                <div className="check-item-row">
                  <strong>{item.label}</strong>
                  <span className={getStageClass(item.status)}>{item.status}</span>
                </div>
                {item.note ? <p>{item.note}</p> : null}
              </div>
            ))}
          </div>

          {(currentUser.role === "office" || currentUser.role === "admin") &&
          (propertyCase.stage === "Verifier Submitted" ||
            propertyCase.stage === "Assigned to Advocate" ||
            propertyCase.stage === "Advocate In Progress") ? (
            <AdvocateHandoffForm
              onAssign={assignToAdvocate}
              propertyCase={propertyCase}
              users={users}
            />
          ) : null}

          {currentUser.role === "advocate" ? (
            <div className="sticky-buttons top-space">
              {propertyCase.stage === "Assigned to Advocate" ? (
                <button
                  className="secondary-button"
                  onClick={() => startAdvocateReview(propertyCase.id)}
                  type="button"
                >
                  Mark In Progress
                </button>
              ) : null}
            </div>
          ) : null}

          {currentUser.role === "advocate" ? (
            <AdvocateReviewForm
              onComplete={completeAdvocateReview}
              propertyCase={propertyCase}
            />
          ) : null}
        </section>
      )}

      {(currentUser.role === "office" || currentUser.role === "admin") && (
        <section className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Final report desk</span>
              <h2>Combine structural and legal reports for client delivery</h2>
            </div>
          </div>

          <p>{propertyCase.finalReportSummary}</p>

          <div className="task-stack">
            {propertyCase.finalReportNotes.map((note) => (
              <article key={note.title} className="task-card">
                <strong>{note.title}</strong>
                <p>{note.body}</p>
              </article>
            ))}
          </div>

          <FinalReportForm onSave={saveFinalReport} propertyCase={propertyCase} />

          <div className="bullet-panel top-space">
            <p>Office team generates the branded combined report after verifier and advocate reports are available.</p>
            <p>The final report should show risk, no-risk notes, and neutral suggestions only.</p>
            <p>Client dispatch happens over WhatsApp after office review.</p>
          </div>
        </section>
      )}

      <section className="surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Timeline</span>
            <h2>Case handoff history</h2>
          </div>
        </div>

        <div className="timeline">
          {propertyCase.timeline.map((event) => (
            <div key={`${event.time}-${event.title}`} className="timeline-item">
              <span className="timeline-time">{event.time}</span>
              <div>
                <strong>
                  {event.title} | {event.owner}
                </strong>
                <p>{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
