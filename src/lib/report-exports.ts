"use client";

import { type CaseAttachment } from "@/lib/case-attachments";
import { sectorLabels, type PropertyCase } from "@/lib/mock-data";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function attachmentList(title: string, attachments: CaseAttachment[]) {
  if (attachments.length === 0) {
    return `
      <section class="report-block">
        <h3>${escapeHtml(title)}</h3>
        <p class="muted">No files available.</p>
      </section>
    `;
  }

  return `
    <section class="report-block">
      <h3>${escapeHtml(title)}</h3>
      <ul class="report-list">
        ${attachments
          .map(
            (attachment) => `
              <li>
                <a href="${escapeHtml(attachment.url)}" target="_blank" rel="noreferrer">${escapeHtml(attachment.label)}</a>
                <span>${escapeHtml(attachment.uploadedAt)}</span>
              </li>
            `,
          )
          .join("")}
      </ul>
    </section>
  `;
}

function imageGallery(title: string, attachments: CaseAttachment[]) {
  if (attachments.length === 0) {
    return `
      <section class="report-block">
        <h3>${escapeHtml(title)}</h3>
        <p class="muted">No images available.</p>
      </section>
    `;
  }

  return `
    <section class="report-block">
      <h3>${escapeHtml(title)}</h3>
      <div class="gallery">
        ${attachments
          .map(
            (attachment) => `
              <figure class="gallery-card">
                <img alt="${escapeHtml(attachment.label)}" src="${escapeHtml(attachment.url)}" />
                <figcaption>${escapeHtml(attachment.label)}</figcaption>
              </figure>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

export function openInspectionReport(propertyCase: PropertyCase, attachments: CaseAttachment[]) {
  const inspectionMedia = attachments.filter((item) => item.kind === "inspection-media");
  const inspectionImages = inspectionMedia.filter((item) => item.mimeType?.startsWith("image/"));
  const inspectionDocuments = attachments.filter((item) => item.kind === "inspection-document");
  const packetDocs = attachments.filter((item) =>
    ["title-deed", "tax-receipt", "approval-proof", "additional-doc"].includes(item.kind),
  );
  const legalReports = attachments.filter((item) => item.kind === "advocate-report");
  const finalReports = attachments.filter((item) => item.kind === "final-report");

  const reportWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=900");

  if (!reportWindow) {
    return;
  }

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(propertyCase.caseRef)} Inspection Report</title>
        <style>
          body {
            font-family: "Segoe UI", Arial, sans-serif;
            margin: 0;
            background: #f3f6fb;
            color: #132238;
          }
          .page {
            max-width: 980px;
            margin: 0 auto;
            padding: 32px 24px 48px;
          }
          .hero {
            background: #ffffff;
            border: 1px solid #dbe3ef;
            border-radius: 20px;
            padding: 28px;
            margin-bottom: 20px;
          }
          .hero h1 {
            margin: 8px 0 6px;
            font-size: 28px;
          }
          .eyebrow {
            display: inline-block;
            color: #325784;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-top: 20px;
          }
          .meta-card,
          .report-block {
            background: #ffffff;
            border: 1px solid #dbe3ef;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
          }
          .meta-card span,
          .muted {
            color: #62748a;
            font-size: 12px;
          }
          .meta-card strong {
            display: block;
            margin-top: 6px;
            font-size: 15px;
          }
          .report-block h2,
          .report-block h3 {
            margin: 0 0 10px;
          }
          .report-list,
          .check-list {
            margin: 0;
            padding-left: 18px;
          }
          .report-list li,
          .check-list li {
            margin-bottom: 8px;
          }
          .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
          }
          .gallery-card {
            margin: 0;
            border: 1px solid #dbe3ef;
            border-radius: 14px;
            overflow: hidden;
            background: #fafcff;
          }
          .gallery-card img {
            display: block;
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
            background: #edf2f7;
          }
          .gallery-card figcaption {
            padding: 10px 12px;
            color: #4a5a6d;
            font-size: 12px;
          }
          .section-card {
            border-top: 1px solid #e8edf4;
            padding-top: 14px;
            margin-top: 14px;
          }
          .section-card:first-child {
            border-top: 0;
            padding-top: 0;
            margin-top: 0;
          }
          .toolbar {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 16px;
          }
          button {
            background: #0f4c81;
            color: #ffffff;
            border: 0;
            border-radius: 999px;
            padding: 10px 16px;
            font-size: 13px;
            cursor: pointer;
          }
          a {
            color: #0f4c81;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="toolbar">
            <button onclick="window.print()">Print / Save PDF</button>
          </div>

          <section class="hero">
            <span class="eyebrow">Vett Physical Verification Report</span>
            <h1>${escapeHtml(propertyCase.assetName)}</h1>
            <p>${escapeHtml(propertyCase.address)}</p>
            <div class="meta">
              <div class="meta-card"><span>Case ID</span><strong>${escapeHtml(propertyCase.caseRef)}</strong></div>
              <div class="meta-card"><span>Verification Type</span><strong>${escapeHtml(sectorLabels[propertyCase.sector])}</strong></div>
              <div class="meta-card"><span>Client</span><strong>${escapeHtml(propertyCase.clientName)}</strong></div>
              <div class="meta-card"><span>Current Stage</span><strong>${escapeHtml(propertyCase.stage)}</strong></div>
              <div class="meta-card"><span>Overall Risk</span><strong>${escapeHtml(propertyCase.overallRisk)}</strong></div>
              <div class="meta-card"><span>Document Status</span><strong>${escapeHtml(propertyCase.clientDocumentStatus)}</strong></div>
            </div>
          </section>

          <section class="report-block">
            <h2>Verifier Summary</h2>
            <p>${escapeHtml(propertyCase.verifierSummary || "Verifier summary not added yet.")}</p>
          </section>

          <section class="report-block">
            <h2>Structural Flags</h2>
            ${
              propertyCase.structuralFlags.length > 0
                ? `<ul class="report-list">${propertyCase.structuralFlags
                    .map((flag) => `<li>${escapeHtml(flag)}</li>`)
                    .join("")}</ul>`
                : `<p class="muted">No structural flags recorded.</p>`
            }
          </section>

          <section class="report-block">
            <h2>Inspection Checklist</h2>
            ${
              propertyCase.sections.length > 0
                ? propertyCase.sections
                    .map(
                      (section) => `
                        <div class="section-card">
                          <h3>${escapeHtml(section.title)} - ${escapeHtml(section.risk)}</h3>
                          <p class="muted">Evidence items captured: ${section.evidenceCount}</p>
                          <ul class="check-list">
                            ${section.items
                              .map(
                                (item) =>
                                  `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.status)}${
                                    item.note ? ` - ${escapeHtml(item.note)}` : ""
                                  }${
                                    item.attachments && item.attachments.length > 0
                                      ? `<ul class="report-list">${item.attachments
                                          .map(
                                            (attachment) =>
                                              `<li><a href="${escapeHtml(attachment.url)}" target="_blank" rel="noreferrer">${escapeHtml(attachment.label)}</a></li>`,
                                          )
                                          .join("")}</ul>`
                                      : ""
                                  }</li>`,
                              )
                              .join("")}
                          </ul>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="muted">No checklist sections available yet.</p>`
            }
          </section>

          ${imageGallery("Verifier Images", inspectionImages)}
          ${attachmentList("Verifier Files And Collected Site Documents", [...inspectionMedia.filter((item) => !item.mimeType?.startsWith("image/")), ...inspectionDocuments])}
          ${attachmentList("Legal Packet Shared With Advocate", packetDocs)}
          ${attachmentList("Advocate Report", legalReports)}
          ${attachmentList("Final Customer Report", finalReports)}
        </div>
      </body>
    </html>
  `;

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
}

export function openCombinedReport(
  propertyCase: PropertyCase,
  attachments: CaseAttachment[],
  suggestions: string,
) {
  const inspectionMedia = attachments.filter((item) => item.kind === "inspection-media");
  const inspectionImages = inspectionMedia.filter((item) => item.mimeType?.startsWith("image/"));
  const inspectionDocuments = attachments.filter((item) => item.kind === "inspection-document");
  const packetDocs = attachments.filter((item) =>
    ["title-deed", "tax-receipt", "approval-proof", "additional-doc"].includes(item.kind),
  );
  const legalReports = attachments.filter((item) => item.kind === "advocate-report");
  const finalReports = attachments.filter((item) => item.kind === "final-report");

  const reportWindow = window.open("", "_blank", "noopener,noreferrer,width=1080,height=920");

  if (!reportWindow) {
    return;
  }

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(propertyCase.caseRef)} Combined Report</title>
        <style>
          body {
            font-family: "Segoe UI", Arial, sans-serif;
            margin: 0;
            background: #eef3f9;
            color: #132238;
          }
          .page {
            max-width: 1020px;
            margin: 0 auto;
            padding: 28px 24px 48px;
          }
          .toolbar {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 16px;
          }
          button {
            background: #0f4c81;
            color: #ffffff;
            border: 0;
            border-radius: 999px;
            padding: 10px 16px;
            font-size: 13px;
            cursor: pointer;
          }
          .hero {
            background: linear-gradient(135deg, #163d63 0%, #1f5f67 100%);
            color: #ffffff;
            border-radius: 22px;
            padding: 28px;
            margin-bottom: 20px;
          }
          .eyebrow {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            opacity: 0.82;
          }
          h1 {
            margin: 10px 0 6px;
            font-size: 30px;
            line-height: 1.1;
          }
          h2 {
            margin: 0 0 12px;
            font-size: 19px;
          }
          h3 {
            margin: 0 0 8px;
            font-size: 15px;
          }
          p {
            margin: 0;
            line-height: 1.55;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-top: 18px;
          }
          .meta-card,
          .report-block {
            background: #ffffff;
            border: 1px solid #d7e1ee;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
          }
          .meta-card span,
          .muted {
            color: #62748a;
            font-size: 12px;
          }
          .meta-card strong {
            display: block;
            margin-top: 6px;
            font-size: 15px;
            color: #132238;
          }
          .two-col {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 16px;
          }
          .report-list,
          .check-list {
            margin: 0;
            padding-left: 18px;
          }
          .report-list li,
          .check-list li {
            margin-bottom: 8px;
          }
          .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
          }
          .gallery-card {
            margin: 0;
            border: 1px solid #d7e1ee;
            border-radius: 14px;
            overflow: hidden;
            background: #fafcff;
          }
          .gallery-card img {
            display: block;
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
            background: #edf2f7;
          }
          .gallery-card figcaption {
            padding: 10px 12px;
            color: #4a5a6d;
            font-size: 12px;
          }
          .section-card {
            border-top: 1px solid #e8edf4;
            padding-top: 14px;
            margin-top: 14px;
          }
          .section-card:first-child {
            border-top: 0;
            padding-top: 0;
            margin-top: 0;
          }
          .risk {
            display: inline-flex;
            align-items: center;
            min-height: 28px;
            padding: 0 12px;
            border-radius: 999px;
            background: #e6eef8;
            color: #173d66;
            font-size: 12px;
            font-weight: 700;
          }
          .highlight {
            background: #f7fafc;
            border-left: 4px solid #1f5f67;
            padding: 14px 16px;
            border-radius: 14px;
          }
          a {
            color: #0f4c81;
            text-decoration: none;
          }
          @media print {
            .toolbar {
              display: none;
            }
            body {
              background: #ffffff;
            }
            .page {
              padding: 0;
              max-width: none;
            }
            .hero {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="toolbar">
            <button onclick="window.print()">Print / Save PDF</button>
          </div>

          <section class="hero">
            <span class="eyebrow">Vett Integrated Verification Report</span>
            <h1>${escapeHtml(propertyCase.assetName)}</h1>
            <p>${escapeHtml(propertyCase.address)}</p>
            <div class="meta">
              <div class="meta-card"><span>Case ID</span><strong>${escapeHtml(propertyCase.caseRef)}</strong></div>
              <div class="meta-card"><span>Verification Type</span><strong>${escapeHtml(sectorLabels[propertyCase.sector])}</strong></div>
              <div class="meta-card"><span>Client</span><strong>${escapeHtml(propertyCase.clientName)}</strong></div>
              <div class="meta-card"><span>Stage</span><strong>${escapeHtml(propertyCase.stage)}</strong></div>
              <div class="meta-card"><span>Overall Risk</span><strong>${escapeHtml(propertyCase.overallRisk)}</strong></div>
              <div class="meta-card"><span>Document Status</span><strong>${escapeHtml(propertyCase.clientDocumentStatus)}</strong></div>
            </div>
          </section>

          <section class="report-block">
            <h2>Client Summary</h2>
            <div class="highlight">
              <p>${escapeHtml(propertyCase.finalReportSummary || "Final combined summary has not been written yet.")}</p>
            </div>
          </section>

          <div class="two-col">
            <section class="report-block">
              <h2>Physical Verification Summary</h2>
              <p>${escapeHtml(propertyCase.verifierSummary || "Verifier summary not available.")}</p>
            </section>

            <section class="report-block">
              <h2>Legal Verification Summary</h2>
              <p>${escapeHtml(propertyCase.legalSummary || "Legal summary not available.")}</p>
            </section>
          </div>

          <section class="report-block">
            <h2>Risk Overview</h2>
            <p><span class="risk">${escapeHtml(propertyCase.overallRisk)}</span></p>
            ${
              propertyCase.structuralFlags.length > 0
                ? `<ul class="report-list" style="margin-top: 14px;">${propertyCase.structuralFlags
                    .map((flag) => `<li>${escapeHtml(flag)}</li>`)
                    .join("")}</ul>`
                : `<p class="muted" style="margin-top: 12px;">No structural flags recorded.</p>`
            }
          </section>

          <section class="report-block">
            <h2>Physical Checklist Highlights</h2>
            ${
              propertyCase.sections.length > 0
                ? propertyCase.sections
                    .map(
                      (section) => `
                        <div class="section-card">
                          <h3>${escapeHtml(section.title)} - ${escapeHtml(section.risk)}</h3>
                          <ul class="check-list">
                            ${section.items
                              .map(
                                (item) =>
                                  `<li><strong>${escapeHtml(item.label)}</strong>: ${escapeHtml(item.status)}${
                                    item.note ? ` - ${escapeHtml(item.note)}` : ""
                                  }${
                                    item.attachments && item.attachments.length > 0
                                      ? `<ul class="report-list">${item.attachments
                                          .map(
                                            (attachment) =>
                                              `<li><a href="${escapeHtml(attachment.url)}" target="_blank" rel="noreferrer">${escapeHtml(attachment.label)}</a></li>`,
                                          )
                                          .join("")}</ul>`
                                      : ""
                                  }</li>`,
                              )
                              .join("")}
                          </ul>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="muted">No physical checklist available.</p>`
            }
          </section>

          <section class="report-block">
            <h2>Suggestions</h2>
            <p>${escapeHtml(suggestions || "No suggestions added yet.")}</p>
          </section>

          ${imageGallery("Verifier Images", inspectionImages)}
          ${attachmentList("Verifier Files And Collected Site Documents", [...inspectionMedia.filter((item) => !item.mimeType?.startsWith("image/")), ...inspectionDocuments])}
          ${attachmentList("Legal Packet Shared", packetDocs)}
          ${attachmentList("Advocate Report Files", legalReports)}
          ${attachmentList("Uploaded Final Report Files", finalReports)}
        </div>
      </body>
    </html>
  `;

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
}
