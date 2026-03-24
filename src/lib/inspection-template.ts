export type FieldType = "text" | "textarea" | "select" | "radio" | "number";

export type InspectionField = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  options?: string[];
};

export type InspectionFormSection = {
  id: string;
  title: string;
  description: string;
  fields: InspectionField[];
};

export const apartmentInspectionSections: InspectionFormSection[] = [
  {
    id: "arrival",
    title: "Arrival & Access",
    description: "Confirm appointment, property match, and entry conditions before inspection starts.",
    fields: [
      {
        id: "appointmentConfirmed",
        label: "Appointment confirmed before arrival",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "gpsCaptured",
        label: "GPS captured at building entrance",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "unitNumberMatched",
        label: "Unit number matches work order",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "accessStatus",
        label: "Access status",
        type: "select",
        options: ["Full access", "Partial access", "Access denied"],
        required: true,
      },
      {
        id: "accessNote",
        label: "Access note",
        type: "textarea",
        placeholder: "Mention locked rooms, owner refusal, or restricted areas.",
      },
    ],
  },
  {
    id: "property",
    title: "Property Basics",
    description: "Capture the base facts needed for the report and downstream legal review.",
    fields: [
      {
        id: "floorNumber",
        label: "Floor number",
        type: "text",
        placeholder: "Example: 4th floor",
        required: true,
      },
      {
        id: "buildingFloors",
        label: "Total building floors",
        type: "number",
        placeholder: "Example: 12",
        required: true,
      },
      {
        id: "bedroomCount",
        label: "Bedrooms",
        type: "number",
        placeholder: "Example: 3",
        required: true,
      },
      {
        id: "bathroomCount",
        label: "Bathrooms",
        type: "number",
        placeholder: "Example: 2",
        required: true,
      },
      {
        id: "layoutType",
        label: "Layout type",
        type: "select",
        options: ["Open plan", "Semi-open", "Separate rooms"],
        required: true,
      },
    ],
  },
  {
    id: "structure",
    title: "Structure & Moisture",
    description: "Keep this tight and evidence-led. These are high-signal items for the buyer.",
    fields: [
      {
        id: "wallCracks",
        label: "Visible wall cracks",
        type: "select",
        options: ["None", "Minor hairline", "Moderate", "Major structural"],
        required: true,
      },
      {
        id: "ceilingCondition",
        label: "Ceiling condition",
        type: "select",
        options: ["Clear", "Minor stain", "Sagging", "Leak / active drip"],
        required: true,
      },
      {
        id: "moistureLevel",
        label: "Seepage or moisture",
        type: "select",
        options: ["None", "Past stain", "Active dampness", "Active leak"],
        required: true,
      },
      {
        id: "structureRisk",
        label: "Structure risk",
        type: "radio",
        options: ["Low", "Moderate", "High"],
        required: true,
      },
      {
        id: "structureNote",
        label: "Structure note",
        type: "textarea",
        placeholder: "Mention room, crack width, seepage location, or collapse risk indicators.",
        required: true,
      },
    ],
  },
  {
    id: "utilities",
    title: "Plumbing & Electrical",
    description: "Give the field agent clear, limited choices so the data stays consistent.",
    fields: [
      {
        id: "waterSupply",
        label: "Water supply condition",
        type: "select",
        options: ["Normal", "Weak pressure", "Intermittent", "No water"],
        required: true,
      },
      {
        id: "drainageStatus",
        label: "Bathroom / sink drainage",
        type: "select",
        options: ["Normal", "Slow", "Blocked", "Not tested"],
        required: true,
      },
      {
        id: "leakObserved",
        label: "Active leak observed",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "outletStatus",
        label: "Outlet testing",
        type: "select",
        options: ["All working", "One failed", "Multiple failed", "Not tested"],
        required: true,
      },
      {
        id: "electricalHazard",
        label: "Electrical hazard seen",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "utilitiesNote",
        label: "Utilities note",
        type: "textarea",
        placeholder: "Mention leak point, burn marks, exposed wiring, or owner denied test.",
        required: true,
      },
    ],
  },
  {
    id: "environment",
    title: "Ventilation, Safety & Surroundings",
    description: "Cover livability and immediate red flags without drifting into advice.",
    fields: [
      {
        id: "naturalLight",
        label: "Natural light",
        type: "select",
        options: ["Good", "Moderate", "Poor"],
        required: true,
      },
      {
        id: "ventilationStatus",
        label: "Ventilation",
        type: "select",
        options: ["Good", "Average", "Poor", "No operable windows"],
        required: true,
      },
      {
        id: "odorObservation",
        label: "Strong odor present",
        type: "select",
        options: ["None", "Mild damp", "Sewage", "Chemical / gas", "Other"],
        required: true,
      },
      {
        id: "safetyRisk",
        label: "Immediate safety risk",
        type: "radio",
        options: ["No", "Yes"],
        required: true,
      },
      {
        id: "safetyNote",
        label: "Safety note",
        type: "textarea",
        placeholder: "Mention fire exit issue, railing problem, pest evidence, or gas smell.",
        required: true,
      },
    ],
  },
  {
    id: "handoff",
    title: "Advocate Handoff",
    description: "Record what was received at site. If a document was not submitted, office can follow up later.",
    fields: [
      {
        id: "saleDeedShared",
        label: "Sale deed / title copy received",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "taxReceiptShared",
        label: "Latest tax receipt received",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "approvalDocShared",
        label: "Approval / occupancy document received",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "advocatePriority",
        label: "Priority for advocate",
        type: "select",
        options: ["Routine", "Check ownership urgently", "Approval mismatch", "High-risk hold"],
        required: true,
      },
      {
        id: "advocateNote",
        label: "Handoff note",
        type: "textarea",
        placeholder: "Keep it factual. Mention missing papers or mismatches only.",
        required: true,
      },
    ],
  },
];

export function getInitialFormValues() {
  const values: Record<string, string> = {};

  for (const section of apartmentInspectionSections) {
    for (const field of section.fields) {
      values[field.id] = "";
    }
  }

  return values;
}
