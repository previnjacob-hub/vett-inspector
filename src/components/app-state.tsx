"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  initialCases,
  sopDocuments,
  users,
  type AppUser,
  type PropertyCase,
  type Sector,
  type SopDocument,
} from "@/lib/mock-data";

export type CreateCaseInput = {
  enquirySource: string;
  clientName: string;
  assetName: string;
  sector: Sector;
  address: string;
  priority: "Routine" | "Fast Track";
  clientDocumentStatus: "All received" | "Pending from client";
  pendingClientDocumentsNote: string;
  officeNotes: string;
  verifierId: string;
  advocateId?: string;
};

export type AdvocateHandoffInput = {
  caseId: string;
  advocateId: string;
  sharedDocuments: string[];
  pendingDocumentsNote: string;
};

type AppStateValue = {
  cases: PropertyCase[];
  allCases: PropertyCase[];
  currentUser: AppUser | null;
  users: AppUser[];
  accessibleSops: SopDocument[];
  loginAs: (userId: string) => void;
  logout: () => void;
  createCase: (input: CreateCaseInput) => string;
  assignToAdvocate: (input: AdvocateHandoffInput) => void;
  submitVerifierCase: (caseId: string) => void;
  startAdvocateReview: (caseId: string) => void;
  completeAdvocateReview: (caseId: string) => void;
  getCaseById: (caseId: string) => PropertyCase | undefined;
};

type OfficeMetrics = {
  enquiriesToday: number;
  verifierInField: string[];
  readyForAdvocate: number;
  finalDeskCount: number;
};

const storageKey = "vett-session-user";
const AppStateContext = createContext<AppStateValue | null>(null);

function canAccessSector(user: AppUser, sector: Sector) {
  return user.sectors.includes(sector);
}

function readStoredUser(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userId = window.localStorage.getItem(storageKey);
  return users.find((user) => user.id === userId) ?? null;
}

function getVisibleCases(currentUser: AppUser | null, allCases: PropertyCase[]) {
  if (!currentUser) {
    return [];
  }

  if (currentUser.role === "admin" || currentUser.role === "office") {
    return allCases.filter((propertyCase) => canAccessSector(currentUser, propertyCase.sector));
  }

  if (currentUser.role === "verifier") {
    return allCases.filter(
      (propertyCase) =>
        propertyCase.verifierId === currentUser.id &&
        (propertyCase.stage === "Assigned to Verifier" || propertyCase.stage === "Verifier In Progress") &&
        canAccessSector(currentUser, propertyCase.sector),
    );
  }

  return allCases.filter(
    (propertyCase) =>
      propertyCase.advocateId === currentUser.id &&
      (propertyCase.stage === "Assigned to Advocate" || propertyCase.stage === "Advocate In Progress") &&
      canAccessSector(currentUser, propertyCase.sector),
  );
}

function appendTimeline(propertyCase: PropertyCase, title: string, owner: string, detail: string) {
  return [
    ...propertyCase.timeline,
    {
      title,
      owner,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      detail,
    },
  ];
}

function buildCaseRef(sector: Sector, currentCases: PropertyCase[]) {
  const prefix =
    sector === "property-verification"
      ? "VETT-PROP"
      : sector === "land-verification"
        ? "VETT-LAND"
        : "VETT-CAR";

  const existing = currentCases.filter((propertyCase) => propertyCase.sector === sector).length + 1;
  return `${prefix}-${String(100 + existing)}`;
}

function getDefaultVerifierSummary(sector: Sector) {
  if (sector === "property-verification") {
    return "Verifier will collect property photos, structural observations, utilities status, and field notes.";
  }

  if (sector === "land-verification") {
    return "Verifier will collect boundary, access, terrain, neighboring use, and environmental observations.";
  }

  return "Used car verification is a future workflow. Intake can be logged now for later product rollout.";
}

function getDefaultLegalSummary(sector: Sector) {
  if (sector === "used-car-verification") {
    return "No legal workflow is active yet for used car verification in this prototype.";
  }

  return "Legal review has not started yet. Office team will assign or notify an advocate after verifier submission.";
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<PropertyCase[]>(initialCases);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(readStoredUser);

  const accessibleSops = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return sopDocuments.filter(
      (document) =>
        document.audience.includes(currentUser.role) &&
        document.sectors.some((sector) => canAccessSector(currentUser, sector)),
    );
  }, [currentUser]);

  const value = useMemo<AppStateValue>(
    () => ({
      cases: getVisibleCases(currentUser, cases),
      allCases: cases,
      currentUser,
      users,
      accessibleSops,
      loginAs: (userId: string) => {
        const nextUser = users.find((user) => user.id === userId) ?? null;
        setCurrentUser(nextUser);

        if (typeof window !== "undefined") {
          if (nextUser) {
            window.localStorage.setItem(storageKey, nextUser.id);
          } else {
            window.localStorage.removeItem(storageKey);
          }
        }
      },
      logout: () => {
        setCurrentUser(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(storageKey);
        }
      },
      createCase: (input: CreateCaseInput) => {
        const caseId = `case-${Date.now()}`;
        const today = new Date().toISOString().slice(0, 10);
        const nextCase: PropertyCase = {
          id: caseId,
          caseRef: buildCaseRef(input.sector, cases),
          enquirySource: input.enquirySource,
          clientName: input.clientName,
          assetName: input.assetName,
          sector: input.sector,
          address: input.address,
          stage: "Assigned to Verifier",
          priority: input.priority,
          sla: input.priority === "Fast Track" ? "Verifier due today by 8:00 PM" : "Verifier due within 24 hours",
          verifierId: input.verifierId,
          advocateId: input.advocateId,
          clientDocumentStatus: input.clientDocumentStatus,
          pendingClientDocumentsNote: input.pendingClientDocumentsNote,
          officeNotes: input.officeNotes,
          overallRisk: "Moderate",
          verifierSubmitted: false,
          advocateCompleted: false,
          finalReportReady: false,
          verifierSummary: getDefaultVerifierSummary(input.sector),
          legalSummary: getDefaultLegalSummary(input.sector),
          finalReportSummary:
            "Final branded report will begin after verifier and advocate outputs are available.",
          structuralFlags: [],
          advocateDocuments: [],
          legalItems:
            input.sector === "used-car-verification"
              ? []
              : [
                  { label: "Ownership chain", status: "Pending" },
                  { label: "Supporting records", status: "Pending" },
                ],
          sections: [],
          finalReportNotes: [
            {
              title: "Office report task",
              body: "Prepare branded combined report and WhatsApp-ready client summary after all handoffs are complete.",
            },
          ],
          timeline: [
            {
              title: "Enquiry converted",
              owner: "Office Team",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              detail: "Case created from office intake form and assigned to verifier.",
            },
          ],
          createdOn: today,
        };

        setCases((current) => [nextCase, ...current]);
        return caseId;
      },
      assignToAdvocate: (input: AdvocateHandoffInput) => {
        setCases((current) =>
          current.map((propertyCase) =>
            propertyCase.id !== input.caseId
              ? propertyCase
              : {
                  ...propertyCase,
                  advocateId: input.advocateId,
                  stage: "Assigned to Advocate",
                  advocateDocuments: input.sharedDocuments,
                  pendingClientDocumentsNote: input.pendingDocumentsNote,
                  legalSummary:
                    input.pendingDocumentsNote.trim().length > 0
                      ? `Legal packet shared. Pending from client: ${input.pendingDocumentsNote}`
                      : "Legal packet shared with advocate from office desk.",
                  timeline: appendTimeline(
                    propertyCase,
                    "Advocate assigned",
                    "Office Team",
                    "Office shared legal details and attachments with the selected advocate.",
                  ),
                },
          ),
        );
      },
      submitVerifierCase: (caseId: string) => {
        setCases((current) =>
          current.map((propertyCase) =>
            propertyCase.id !== caseId
              ? propertyCase
              : {
                  ...propertyCase,
                  stage: "Verifier Submitted",
                  verifierSubmitted: true,
                  timeline: appendTimeline(
                    propertyCase,
                    "Verifier submitted",
                    "Verifier",
                    "Field report finished and returned to office for advocate assignment.",
                  ),
                },
          ),
        );
      },
      startAdvocateReview: (caseId: string) => {
        setCases((current) =>
          current.map((propertyCase) =>
            propertyCase.id !== caseId
              ? propertyCase
              : {
                  ...propertyCase,
                  stage: "Advocate In Progress",
                  timeline: appendTimeline(
                    propertyCase,
                    "Legal review started",
                    "Advocate",
                    "Advocate marked the case in progress.",
                  ),
                },
          ),
        );
      },
      completeAdvocateReview: (caseId: string) => {
        setCases((current) =>
          current.map((propertyCase) =>
            propertyCase.id !== caseId
              ? propertyCase
              : {
                  ...propertyCase,
                  stage: "Advocate Completed",
                  advocateCompleted: true,
                  timeline: appendTimeline(
                    propertyCase,
                    "Legal review completed",
                    "Advocate",
                    "Legal report uploaded and returned to office team.",
                  ),
                },
          ),
        );
      },
      getCaseById: (caseId: string) => cases.find((propertyCase) => propertyCase.id === caseId),
    }),
    [accessibleSops, cases, currentUser],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}

export function getOfficeMetrics(allCases: PropertyCase[], allUsers: AppUser[]): OfficeMetrics {
  const enquiriesToday = allCases.filter((propertyCase) => propertyCase.createdOn === "2026-03-24").length;
  const inFieldCaseUsers = allCases
    .filter((propertyCase) => propertyCase.stage === "Verifier In Progress")
    .map((propertyCase) => allUsers.find((user) => user.id === propertyCase.verifierId)?.name)
    .filter(Boolean) as string[];

  return {
    enquiriesToday,
    verifierInField: inFieldCaseUsers,
    readyForAdvocate: allCases.filter((propertyCase) => propertyCase.stage === "Verifier Submitted").length,
    finalDeskCount: allCases.filter(
      (propertyCase) =>
        propertyCase.stage === "Advocate Completed" ||
        propertyCase.stage === "Final Report In Progress" ||
        propertyCase.stage === "Ready to Send",
    ).length,
  };
}
