export type Role = "admin" | "office" | "verifier" | "advocate";

export type Sector = "property-verification" | "land-verification" | "used-car-verification";

export type Risk = "Low" | "Moderate" | "High";

export type WorkflowStage =
  | "New Intake"
  | "Assigned to Verifier"
  | "Verifier In Progress"
  | "Verifier Submitted"
  | "Assigned to Advocate"
  | "Advocate In Progress"
  | "Advocate Completed"
  | "Final Report In Progress"
  | "Ready to Send"
  | "Sent to Client";

export type SectionItem = {
  label: string;
  status: "Done" | "Pending" | "Blocked";
  note?: string;
};

export type InspectionSection = {
  id: string;
  title: string;
  risk: Risk;
  evidenceCount: number;
  items: SectionItem[];
};

export type TimelineEvent = {
  title: string;
  owner: string;
  time: string;
  detail: string;
};

export type LegalItem = {
  label: string;
  status: "Pending" | "In Progress" | "Completed";
  note?: string;
};

export type FinalReportNote = {
  title: string;
  body: string;
};

export type PropertyCase = {
  id: string;
  caseRef: string;
  enquirySource: string;
  clientName: string;
  assetName: string;
  sector: Sector;
  address: string;
  stage: WorkflowStage;
  priority: "Routine" | "Fast Track";
  sla: string;
  verifierId?: string;
  advocateId?: string;
  clientDocumentStatus: "All received" | "Pending from client";
  pendingClientDocumentsNote: string;
  officeNotes: string;
  overallRisk: Risk;
  verifierSubmitted: boolean;
  advocateCompleted: boolean;
  finalReportReady: boolean;
  verifierSummary: string;
  legalSummary: string;
  finalReportSummary: string;
  structuralFlags: string[];
  advocateDocuments: string[];
  legalItems: LegalItem[];
  sections: InspectionSection[];
  finalReportNotes: FinalReportNote[];
  timeline: TimelineEvent[];
  createdOn: string;
};

export type AppUser = {
  id: string;
  name: string;
  email?: string;
  role: Role;
  sectors: Sector[];
  title: string;
};

export type SopDocument = {
  id: string;
  title: string;
  audience: Role[];
  sectors: Sector[];
  note: string;
};

export const sectorLabels: Record<Sector, string> = {
  "property-verification": "Property Verification",
  "land-verification": "Land Verification",
  "used-car-verification": "Used Car Verification",
};

export const roles: { id: Role; label: string; description: string }[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Manage users, role setup, and future sector configuration.",
  },
  {
    id: "office",
    label: "Office Team",
    description: "Create cases, assign people, review reports, and send final reports.",
  },
  {
    id: "verifier",
    label: "Verifier",
    description: "Collect field details, photos, and structural observations.",
  },
  {
    id: "advocate",
    label: "Advocate",
    description: "Review legal details, upload legal report, and complete legal status.",
  },
];

export const users: AppUser[] = [
  {
    id: "user-admin-1",
    name: "Ritika Vett",
    email: "ritika@usevett.com",
    role: "admin",
    sectors: ["property-verification", "land-verification", "used-car-verification"],
    title: "Platform Admin",
  },
  {
    id: "user-office-1",
    name: "Karan Office",
    email: "office@usevett.com",
    role: "office",
    sectors: ["property-verification", "land-verification"],
    title: "Operations Desk",
  },
  {
    id: "user-ver-1",
    name: "Naveen P",
    email: "naveen@usevett.com",
    role: "verifier",
    sectors: ["property-verification"],
    title: "Apartment Verifier",
  },
  {
    id: "user-ver-2",
    name: "Rafiq S",
    email: "rafiq@usevett.com",
    role: "verifier",
    sectors: ["land-verification"],
    title: "Land Verifier",
  },
  {
    id: "user-adv-1",
    name: "Adv. Meera Nair",
    email: "meera@usevett.com",
    role: "advocate",
    sectors: ["property-verification"],
    title: "Property Advocate",
  },
  {
    id: "user-adv-2",
    name: "Adv. Ramesh B",
    email: "ramesh@usevett.com",
    role: "advocate",
    sectors: ["land-verification"],
    title: "Land Advocate",
  },
];

export const sopDocuments: SopDocument[] = [
  {
    id: "sop-property-field",
    title: "Property Verifier SOP",
    audience: ["admin", "office", "verifier"],
    sectors: ["property-verification"],
    note: "Apartment and used property inspection workflow with field evidence rules.",
  },
  {
    id: "sop-land-field",
    title: "Land Verifier SOP",
    audience: ["admin", "office", "verifier"],
    sectors: ["land-verification"],
    note: "Boundary, road access, encroachment, and terrain workflow for land checks.",
  },
  {
    id: "sop-legal-review",
    title: "Advocate Review SOP",
    audience: ["admin", "office", "advocate"],
    sectors: ["property-verification", "land-verification"],
    note: "Legal packet handling, report upload, and completion rules.",
  },
];

const apartmentSections: InspectionSection[] = [
  {
    id: "property-identification",
    title: "Property Identification",
    risk: "Low",
    evidenceCount: 6,
    items: [
      { label: "Building exterior and unit door captured", status: "Done" },
      { label: "GPS at entrance captured", status: "Done" },
      { label: "Unit number matched", status: "Done" },
    ],
  },
  {
    id: "structure",
    title: "Structural Condition",
    risk: "Moderate",
    evidenceCount: 11,
    items: [
      { label: "Cracks and moisture points recorded", status: "Done" },
      { label: "Facade and balcony evidence attached", status: "Done" },
      { label: "Ceiling review complete", status: "Done" },
    ],
  },
  {
    id: "utilities",
    title: "Plumbing and Electrical",
    risk: "High",
    evidenceCount: 12,
    items: [
      { label: "Water flow and leak check done", status: "Done" },
      { label: "Outlet and switchboard check done", status: "Done" },
      { label: "Meter room access denied", status: "Blocked", note: "Owner did not open utility room." },
    ],
  },
];

export const initialCases: PropertyCase[] = [
  {
    id: "case-101",
    caseRef: "VETT-PROP-101",
    enquirySource: "Broker Partner",
    clientName: "Aarav Sharma",
    assetName: "Prestige Cedar, Flat 4B",
    sector: "property-verification",
    address: "Indiranagar, Bengaluru",
    stage: "Verifier In Progress",
    priority: "Fast Track",
    sla: "Verifier due today by 6:00 PM",
    verifierId: "user-ver-1",
    advocateId: "user-adv-1",
    clientDocumentStatus: "Pending from client",
    pendingClientDocumentsNote: "Original approval copy still awaited from seller.",
    officeNotes: "Fast-track brokerage case. Client wants both structural and legal review before token advance.",
    overallRisk: "High",
    verifierSubmitted: false,
    advocateCompleted: false,
    finalReportReady: false,
    verifierSummary:
      "Verifier is collecting structural findings, utilities status, and field media for apartment review.",
    legalSummary:
      "Legal review has not started yet. Office team will assign after verifier submission.",
    finalReportSummary:
      "Final office report not started. This step begins after both structural and legal reports are available.",
    structuralFlags: [
      "Active plumbing leak under kitchen sink",
      "Moisture on balcony-facing wall",
      "Utility room access denied by owner",
    ],
    advocateDocuments: [
      "Sale deed copy",
      "Tax receipt",
      "Khata extract",
    ],
    legalItems: [
      { label: "Ownership chain", status: "Pending" },
      { label: "Encumbrance certificate", status: "Pending" },
      { label: "Approval / occupancy papers", status: "Pending" },
    ],
    sections: apartmentSections,
    finalReportNotes: [
      {
        title: "Risk statement",
        body: "Office team will combine structural and legal findings before issuing branded client summary.",
      },
    ],
    timeline: [
      {
        title: "Enquiry converted",
        owner: "Office Team",
        time: "09:00",
        detail: "Broker lead converted and entered into the system.",
      },
      {
        title: "Verifier assigned",
        owner: "Office Team",
        time: "09:25",
        detail: "Apartment verifier assigned with property SOP and visit schedule.",
      },
      {
        title: "Verifier started",
        owner: "Verifier",
        time: "13:05",
        detail: "Field visit started and evidence collection is in progress.",
      },
    ],
    createdOn: "2026-03-24",
  },
  {
    id: "case-102",
    caseRef: "VETT-LAND-202",
    enquirySource: "Direct Website Lead",
    clientName: "Priya Reddy",
    assetName: "Survey Plot 28",
    sector: "land-verification",
    address: "Shamshabad, Hyderabad",
    stage: "Assigned to Verifier",
    priority: "Routine",
    sla: "Visit scheduled for tomorrow",
    verifierId: "user-ver-2",
    advocateId: "user-adv-2",
    clientDocumentStatus: "Pending from client",
    pendingClientDocumentsNote: "EC request and latest tax receipt are still pending.",
    officeNotes: "Direct website lead. Client needs clarity on access road and land records.",
    overallRisk: "Moderate",
    verifierSubmitted: false,
    advocateCompleted: false,
    finalReportReady: false,
    verifierSummary:
      "Land verifier will inspect boundary markers, road access, neighboring usage, and flood indicators.",
    legalSummary:
      "Land legal packet will be reviewed after field submission is complete.",
    finalReportSummary:
      "Final report not started yet.",
    structuralFlags: ["Boundary stones not confirmed yet"],
    advocateDocuments: ["Survey sketch", "Patta copy"],
    legalItems: [
      { label: "Revenue records", status: "Pending" },
      { label: "EC verification", status: "Pending" },
    ],
    sections: [
      {
        id: "boundary-access",
        title: "Boundary and Access",
        risk: "Moderate",
        evidenceCount: 0,
        items: [
          { label: "Approach road capture", status: "Pending" },
          { label: "Boundary stone confirmation", status: "Pending" },
          { label: "Neighboring land use capture", status: "Pending" },
        ],
      },
    ],
    finalReportNotes: [],
    timeline: [
      {
        title: "Enquiry converted",
        owner: "Office Team",
        time: "11:20",
        detail: "Land verification case created from website enquiry.",
      },
      {
        title: "Verifier assigned",
        owner: "Office Team",
        time: "12:10",
        detail: "Land verifier assigned for next day site visit.",
      },
    ],
    createdOn: "2026-03-24",
  },
  {
    id: "case-103",
    caseRef: "VETT-PROP-099",
    enquirySource: "Channel Partner",
    clientName: "Divya Menon",
    assetName: "Sobha Heights, Flat 9A",
    sector: "property-verification",
    address: "Whitefield, Bengaluru",
    stage: "Advocate In Progress",
    priority: "Routine",
    sla: "Legal review due today by 5:00 PM",
    verifierId: "user-ver-1",
    advocateId: "user-adv-1",
    clientDocumentStatus: "All received",
    pendingClientDocumentsNote: "",
    officeNotes: "Verifier work complete. Legal packet shared after office review.",
    overallRisk: "Moderate",
    verifierSubmitted: true,
    advocateCompleted: false,
    finalReportReady: false,
    verifierSummary:
      "Verifier has completed property inspection and uploaded field findings with supporting media.",
    legalSummary:
      "Advocate is reviewing ownership chain and approvals with the legal packet shared by office.",
    finalReportSummary:
      "Office team is waiting for legal closure before preparing branded combined report.",
    structuralFlags: ["Moderate seepage in utility area"],
    advocateDocuments: [
      "Sale deed copy",
      "Tax receipt",
      "OC copy",
      "Field caveat note",
    ],
    legalItems: [
      { label: "Ownership chain", status: "In Progress" },
      { label: "Encumbrance certificate", status: "In Progress" },
      { label: "Approval / occupancy papers", status: "Pending" },
    ],
    sections: apartmentSections,
    finalReportNotes: [
      {
        title: "Client summary",
        body: "Final branded report will merge structural and legal inputs and include neutral suggestions.",
      },
    ],
    timeline: [
      {
        title: "Verifier submitted",
        owner: "Verifier",
        time: "11:35",
        detail: "Field work finished and sent back to office for advocate assignment.",
      },
      {
        title: "Advocate assigned",
        owner: "Office Team",
        time: "12:05",
        detail: "Legal packet shared with advocate.",
      },
      {
        title: "Legal review started",
        owner: "Advocate",
        time: "13:10",
        detail: "Advocate marked the case in progress.",
      },
    ],
    createdOn: "2026-03-24",
  },
  {
    id: "case-104",
    caseRef: "VETT-PROP-088",
    enquirySource: "Repeat Client",
    clientName: "Nikhil Rao",
    assetName: "Purva Sky, Flat 12C",
    sector: "property-verification",
    address: "Sarjapur, Bengaluru",
    stage: "Final Report In Progress",
    priority: "Routine",
    sla: "Client dispatch by tonight",
    verifierId: "user-ver-1",
    advocateId: "user-adv-1",
    clientDocumentStatus: "All received",
    pendingClientDocumentsNote: "",
    officeNotes: "Final branded report being prepared for WhatsApp dispatch.",
    overallRisk: "Low",
    verifierSubmitted: true,
    advocateCompleted: true,
    finalReportReady: false,
    verifierSummary:
      "Verifier report complete with low structural concerns and full media set.",
    legalSummary:
      "Advocate legal report uploaded and marked complete.",
    finalReportSummary:
      "Office team is preparing the combined branded report and WhatsApp dispatch summary.",
    structuralFlags: ["Minor cosmetic crack near utility wall"],
    advocateDocuments: [
      "Legal report.pdf",
      "Title chain summary.pdf",
    ],
    legalItems: [
      { label: "Ownership chain", status: "Completed" },
      { label: "Encumbrance certificate", status: "Completed" },
      { label: "Approval / occupancy papers", status: "Completed" },
    ],
    sections: apartmentSections,
    finalReportNotes: [
      {
        title: "Branded report",
        body: "Combine structural and legal report, assign overall risk, add suggestions, and prepare WhatsApp share text.",
      },
    ],
    timeline: [
      {
        title: "Advocate completed",
        owner: "Advocate",
        time: "10:20",
        detail: "Legal report uploaded and case returned to office team.",
      },
      {
        title: "Final report started",
        owner: "Office Team",
        time: "11:00",
        detail: "Office drafting branded combined report.",
      },
    ],
    createdOn: "2026-03-23",
  },
];

export const futureSectors = [
  {
    title: "Property Verification",
    body: "Active workflow for used apartments and resale property checks.",
  },
  {
    title: "Land Verification",
    body: "Active workflow for plots, survey land, and boundary/legal review.",
  },
  {
    title: "Used Car Verification",
    body: "Future placeholder sector for later rollout and role assignment.",
  },
];

export function getRiskClass(risk: string) {
  return `risk-chip risk-${risk.toLowerCase()}`;
}

export function getStageClass(stage: string) {
  return `status-pill status-${stage.toLowerCase().replaceAll(" ", "-")}`;
}
