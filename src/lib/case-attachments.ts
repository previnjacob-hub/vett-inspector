export type CaseAttachmentKind =
  | "inspection-media"
  | "inspection-document"
  | "title-deed"
  | "tax-receipt"
  | "approval-proof"
  | "additional-doc"
  | "advocate-report"
  | "final-report";

export type CaseAttachmentSource = "verifier" | "office" | "advocate" | "final-desk";

export type CaseAttachment = {
  kind: CaseAttachmentKind;
  label: string;
  fileName: string;
  url: string;
  source: CaseAttachmentSource;
  uploadedAt: string;
  mimeType?: string;
};

export function serializeAttachment(attachment: CaseAttachment) {
  return JSON.stringify(attachment);
}

export function parseAttachment(entry: string): CaseAttachment | null {
  try {
    const parsed = JSON.parse(entry) as CaseAttachment;

    if (!parsed?.label || !parsed?.url || !parsed?.kind || !parsed?.fileName || !parsed?.source) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function parseAttachments(entries: string[]) {
  return entries.map(parseAttachment).filter(Boolean) as CaseAttachment[];
}
