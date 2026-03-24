import {
  type AppUser,
  type FinalReportNote,
  type InspectionSection,
  type LegalItem,
  type PropertyCase,
  type TimelineEvent,
} from "@/lib/mock-data";

type DbCaseRow = {
  id: string;
  case_ref: string;
  enquiry_source: string;
  client_name: string;
  asset_name: string;
  sector: PropertyCase["sector"];
  address: string;
  stage: PropertyCase["stage"];
  priority: PropertyCase["priority"];
  sla: string;
  verifier_id: string | null;
  advocate_id: string | null;
  client_document_status: PropertyCase["clientDocumentStatus"];
  pending_client_documents_note: string;
  office_notes: string;
  overall_risk: PropertyCase["overallRisk"];
  verifier_submitted: boolean;
  advocate_completed: boolean;
  final_report_ready: boolean;
  verifier_summary: string;
  legal_summary: string;
  final_report_summary: string;
  structural_flags: string[] | null;
  advocate_documents: string[] | null;
  legal_items: LegalItem[] | null;
  sections: InspectionSection[] | null;
  final_report_notes: FinalReportNote[] | null;
  timeline: TimelineEvent[] | null;
  created_on: string;
};

type DbUserRow = {
  id: string;
  name: string;
  email?: string | null;
  role: AppUser["role"];
  title: string;
  sectors: AppUser["sectors"] | null;
};

export function mapDbUser(row: DbUserRow): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    role: row.role,
    title: row.title,
    sectors: row.sectors ?? [],
  };
}

export function mapDbCase(row: DbCaseRow): PropertyCase {
  return {
    id: row.id,
    caseRef: row.case_ref,
    enquirySource: row.enquiry_source,
    clientName: row.client_name,
    assetName: row.asset_name,
    sector: row.sector,
    address: row.address,
    stage: row.stage,
    priority: row.priority,
    sla: row.sla,
    verifierId: row.verifier_id ?? undefined,
    advocateId: row.advocate_id ?? undefined,
    clientDocumentStatus: row.client_document_status,
    pendingClientDocumentsNote: row.pending_client_documents_note,
    officeNotes: row.office_notes,
    overallRisk: row.overall_risk,
    verifierSubmitted: row.verifier_submitted,
    advocateCompleted: row.advocate_completed,
    finalReportReady: row.final_report_ready,
    verifierSummary: row.verifier_summary,
    legalSummary: row.legal_summary,
    finalReportSummary: row.final_report_summary,
    structuralFlags: row.structural_flags ?? [],
    advocateDocuments: row.advocate_documents ?? [],
    legalItems: row.legal_items ?? [],
    sections: row.sections ?? [],
    finalReportNotes: row.final_report_notes ?? [],
    timeline: row.timeline ?? [],
    createdOn: row.created_on,
  };
}
