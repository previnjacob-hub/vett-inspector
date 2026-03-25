"use client";

import Link from "next/link";
import { parseAttachments } from "@/lib/case-attachments";
import { sectorLabels, type PropertyCase } from "@/lib/mock-data";
import { openInspectionReport } from "@/lib/report-exports";

export function ReportsCenter({ cases }: { cases: PropertyCase[] }) {
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Reports Center</span>
          <h2>Inspection, legal, and final outputs together</h2>
          <p className="section-copy">
            Use this desk to review each case in one table, export the inspection summary, open the legal report, and download the final customer report.
          </p>
        </div>
      </div>

      <div className="reports-table-wrap">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Case</th>
              <th>Type</th>
              <th>Stage</th>
              <th>Inspection</th>
              <th>Legal</th>
              <th>Final</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((propertyCase) => {
              const attachments = parseAttachments(propertyCase.advocateDocuments);
              const legalReports = attachments.filter((item) => item.kind === "advocate-report");
              const finalReports = attachments.filter((item) => item.kind === "final-report");

              return (
                <tr key={propertyCase.id}>
                  <td>
                    <strong>{propertyCase.caseRef}</strong>
                    <span>{propertyCase.assetName}</span>
                  </td>
                  <td>{sectorLabels[propertyCase.sector]}</td>
                  <td>{propertyCase.stage}</td>
                  <td>
                    <button className="inline-link reports-link-button" onClick={() => openInspectionReport(propertyCase, attachments)} type="button">
                      Open / Print PDF
                    </button>
                  </td>
                  <td>
                    {legalReports.length > 0 ? (
                      legalReports.map((report) => (
                        <a key={report.url} className="document-pill document-link" href={report.url} rel="noreferrer" target="_blank">
                          {report.label}
                        </a>
                      ))
                    ) : (
                      <span className="small-note">Pending</span>
                    )}
                  </td>
                  <td>
                    {finalReports.length > 0 ? (
                      finalReports.map((report) => (
                        <a key={report.url} className="document-pill document-link" href={report.url} rel="noreferrer" target="_blank">
                          {report.label}
                        </a>
                      ))
                    ) : (
                      <span className="small-note">Not ready</span>
                    )}
                  </td>
                  <td>
                    <Link className="inline-link" href={`/case/${propertyCase.id}`}>
                      Open case
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
