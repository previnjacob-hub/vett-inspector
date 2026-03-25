import type { Sector } from "@/lib/mock-data";

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

export const propertyInspectionSections: InspectionFormSection[] = [
  {
    id: "arrival",
    title: "Arrival & Access",
    description: "Confirm appointment, property match, and entry conditions before inspection starts.",
    fields: [
      {
        id: "appointmentConfirmed",
        label: "Appointment confirmed*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "gpsCaptured",
        label: "GPS captured at entrance*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "unitNumberMatched",
        label: "Unit / house number matches request*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "accessStatus",
        label: "Access status*",
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
    title: "Apartment / House Basics",
    description: "Capture the basic facts needed for the report and downstream legal review.",
    fields: [
      {
        id: "propertyKind",
        label: "Property type*",
        type: "select",
        options: ["Apartment", "House", "Villa", "Row house"],
        required: true,
      },
      {
        id: "floorNumber",
        label: "Floor / level*",
        type: "text",
        placeholder: "Example: 4th floor or Ground + 1",
        required: true,
      },
      {
        id: "buildingFloors",
        label: "Total building floors*",
        type: "number",
        placeholder: "Example: 12",
        required: true,
      },
      {
        id: "bedroomCount",
        label: "Bedrooms*",
        type: "number",
        placeholder: "Example: 3",
        required: true,
      },
      {
        id: "bathroomCount",
        label: "Bathrooms*",
        type: "number",
        placeholder: "Example: 2",
        required: true,
      },
      {
        id: "layoutType",
        label: "Layout type*",
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
        label: "Visible wall cracks*",
        type: "select",
        options: ["None", "Minor hairline", "Moderate", "Major structural"],
        required: true,
      },
      {
        id: "ceilingCondition",
        label: "Ceiling condition*",
        type: "select",
        options: ["Clear", "Minor stain", "Sagging", "Leak / active drip"],
        required: true,
      },
      {
        id: "moistureLevel",
        label: "Seepage or moisture*",
        type: "select",
        options: ["None", "Past stain", "Active dampness", "Active leak"],
        required: true,
      },
      {
        id: "structureRisk",
        label: "Structure risk*",
        type: "radio",
        options: ["Low", "Moderate", "High"],
        required: true,
      },
      {
        id: "structureNote",
        label: "Structure note*",
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
        label: "Water supply condition*",
        type: "select",
        options: ["Normal", "Weak pressure", "Intermittent", "No water"],
        required: true,
      },
      {
        id: "drainageStatus",
        label: "Bathroom / sink drainage*",
        type: "select",
        options: ["Normal", "Slow", "Blocked", "Not tested"],
        required: true,
      },
      {
        id: "leakObserved",
        label: "Active leak observed*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "outletStatus",
        label: "Outlet testing*",
        type: "select",
        options: ["All working", "One failed", "Multiple failed", "Not tested"],
        required: true,
      },
      {
        id: "electricalHazard",
        label: "Electrical hazard seen*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "utilitiesNote",
        label: "Utilities note*",
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
        label: "Natural light*",
        type: "select",
        options: ["Good", "Moderate", "Poor"],
        required: true,
      },
      {
        id: "ventilationStatus",
        label: "Ventilation*",
        type: "select",
        options: ["Good", "Average", "Poor", "No operable windows"],
        required: true,
      },
      {
        id: "odorObservation",
        label: "Strong odor present*",
        type: "select",
        options: ["None", "Mild damp", "Sewage", "Chemical / gas", "Other"],
        required: true,
      },
      {
        id: "safetyRisk",
        label: "Immediate safety risk*",
        type: "radio",
        options: ["No", "Yes"],
        required: true,
      },
      {
        id: "safetyNote",
        label: "Safety note*",
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
        label: "Sale deed / title copy received*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "taxReceiptShared",
        label: "Latest tax receipt received*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "approvalDocShared",
        label: "Approval / occupancy document received*",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "advocatePriority",
        label: "Priority for advocate*",
        type: "select",
        options: ["Routine", "Check ownership urgently", "Approval mismatch", "High-risk hold"],
        required: true,
      },
      {
        id: "advocateNote",
        label: "Handoff note*",
        type: "textarea",
        placeholder: "Keep it factual. Mention missing papers or mismatches only.",
        required: true,
      },
    ],
  },
];

export const landInspectionSections: InspectionFormSection[] = [
  {
    id: "basic",
    title: "Basic Property Information",
    description: "Confirm land details against the document set before starting the site walk.",
    fields: [
      { id: "verifierName", label: "Verifier full name*", type: "text", required: true },
      { id: "inspectionDate", label: "Inspection date*", type: "text", placeholder: "DD/MM/YYYY", required: true },
      { id: "arrivalTime", label: "Arrival time*", type: "text", placeholder: "Example: 10:30 AM", required: true },
      { id: "propertyAddress", label: "Property address / location*", type: "textarea", placeholder: "Village, desom, nearest landmark.", required: true },
      { id: "resurveyNumber", label: "Re-survey number*", type: "text", required: true },
      { id: "village", label: "Village*", type: "text", required: true },
      { id: "desom", label: "Desom*", type: "text", required: true },
      { id: "blockNumber", label: "Block number*", type: "text", required: true },
      { id: "statedExtent", label: "Stated extent*", type: "text", required: true },
      { id: "ownerName", label: "Owner name*", type: "text", required: true },
    ],
  },
  {
    id: "location",
    title: "Location Evidence",
    description: "Capture GPS, entrance proof, map proof, and visible survey markers.",
    fields: [
      { id: "entranceGps", label: "GPS at land entrance*", type: "text", required: true },
      { id: "mapsShot", label: "Google Maps screenshot uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "entrancePhoto", label: "Land entrance photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "landmarkPhoto", label: "Road sign / landmark photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "northEastGps", label: "North-east corner GPS", type: "text" },
      { id: "southWestGps", label: "South-west corner GPS", type: "text" },
      { id: "surveyStoneFound", label: "Survey / boundary stones found*", type: "select", options: ["Yes — photographed", "Partially visible", "Not found"], required: true },
    ],
  },
  {
    id: "boundary",
    title: "Boundary Verification",
    description: "Walk all four sides and record mismatch, encroachment, and government marker risk clearly.",
    fields: [
      { id: "boundaryWalkVideo", label: "Boundary walk video uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "northBoundaryPhoto", label: "North boundary photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "southBoundaryPhoto", label: "South boundary photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "eastBoundaryPhoto", label: "East boundary photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "westBoundaryPhoto", label: "West boundary photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "eastMatch", label: "East boundary neighbour match*", type: "select", options: ["Yes — matches", "Partially matches", "Does not match", "Cannot confirm"], required: true },
      { id: "westMatch", label: "West boundary neighbour match*", type: "select", options: ["Yes — matches", "Partially matches", "Does not match", "Cannot confirm"], required: true },
      { id: "northMatch", label: "North boundary neighbour match*", type: "select", options: ["Yes — matches", "Partially matches", "Does not match", "Cannot confirm"], required: true },
      { id: "southMatch", label: "South boundary neighbour match*", type: "select", options: ["Yes — matches", "Partially matches", "Does not match", "Cannot confirm"], required: true },
      { id: "encroachmentVisible", label: "Encroachment visible*", type: "select", options: ["No encroachment found", "Possible encroachment — minor", "Clear encroachment found — High risk"], required: true },
      { id: "governmentMarkers", label: "Government marker / notice visible*", type: "select", options: ["None found", "Possible marker — uncertain", "Government marker / notice found — High risk"], required: true },
      { id: "boundaryRating", label: "Boundary section rating*", type: "select", options: ["Low — All boundaries clear and confirmed", "Moderate — Minor issues, needs verification", "High — Encroachment or government issue found"], required: true },
      { id: "boundaryNotes", label: "Boundary notes", type: "textarea", placeholder: "Summarise boundary observations in plain language." },
    ],
  },
  {
    id: "access",
    title: "Access & Road",
    description: "Record whether the land has direct access, what road exists, and whether dispute signs are visible.",
    fields: [
      { id: "accessRouteVideo", label: "Road-to-entrance video uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "roadTouchesLand", label: "Road directly touches land*", type: "select", options: ["Yes — road directly touches land", "No — access only through another person's land", "No — no access at all (landlocked)"], required: true },
      { id: "roadType", label: "Road type*", type: "select", options: ["Public Road", "Panchayat Road", "Private Pathway — right of way recorded", "Private Pathway — no recorded right of way", "Dirt track only", "No road"], required: true },
      { id: "vehicleAccess", label: "Vehicle can reach entrance*", type: "select", options: ["Yes — vehicle can reach easily", "Yes — with difficulty", "No — foot access only"], required: true },
      { id: "accessRoadPhoto", label: "Access road photo uploaded*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "accessDispute", label: "Access dispute visible or mentioned*", type: "select", options: ["No — clear and uncontested", "Someone mentioned a dispute", "Dispute clearly visible"], required: true },
      { id: "accessRating", label: "Access section rating*", type: "select", options: ["Low — Clear legal direct road access", "Moderate — Shared or pathway access", "High — No access or disputed access"], required: true },
      { id: "accessNotes", label: "Access notes", type: "textarea" },
    ],
  },
  {
    id: "physical",
    title: "Physical Condition of Land",
    description: "Capture terrain, waterlogging, fill quality, waste, and visible structures.",
    fields: [
      { id: "landTerrain", label: "Land terrain*", type: "select", options: ["Flat", "Gently sloped", "Steeply sloped", "Hilly / uneven"], required: true },
      { id: "landLevel", label: "Land level relative to road*", type: "select", options: ["Above road level", "At road level", "Below road level — drainage issue possible"], required: true },
      { id: "waterlogging", label: "Waterlogging or flooding signs*", type: "select", options: ["None visible", "Minor low patches", "Clear waterlogging signs — High risk"], required: true },
      { id: "waterBody", label: "Water body near land*", type: "select", options: ["No water body nearby", "Water body more than 50m away", "Water body within 50m of boundary", "Water body on or at boundary"], required: true },
      { id: "filledLand", label: "Land fill condition*", type: "select", options: ["Natural ground", "Partially filled — soil or murrum", "Heavily filled", "Filled with debris or waste — High risk"], required: true },
      { id: "wasteOdour", label: "Waste or strong odour*", type: "select", options: ["None", "Minor debris", "Significant waste or strong odour — High risk"], required: true },
      { id: "structuresPresent", label: "Existing structures on land*", type: "select", options: ["None", "Old boundary wall only", "Well present", "Old building or shed present", "Multiple structures"], required: true },
      { id: "physicalRating", label: "Physical condition rating*", type: "select", options: ["Low — Good condition, natural ground, no issues", "Moderate — Minor issues noted", "High — Waterlogging / waste / unstable fill found"], required: true },
      { id: "physicalNotes", label: "Physical condition notes", type: "textarea" },
    ],
  },
  {
    id: "handoff",
    title: "Document Capture & Advocate Handoff",
    description: "Mark what was collected on site and what office must follow up later.",
    fields: [
      { id: "titleDeedReceived", label: "Title deed / pramanam received*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "possessionCertReceived", label: "Possession certificate received*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "taxReceiptReceived", label: "Land tax receipt received*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "ecReceived", label: "Encumbrance certificate received*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "thandaperReceived", label: "Thandaper extract received*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "locationMapReceived", label: "Location map received*", type: "radio", options: ["Yes", "No"], required: true },
      { id: "missingDocsNote", label: "Missing documents / reason", type: "textarea", placeholder: "Mention what was not shared and the reason given." },
      { id: "advocatePriority", label: "Priority for advocate*", type: "select", options: ["Routine", "Boundary concern", "Access concern", "Ownership / title urgent", "High-risk hold"], required: true },
      { id: "advocateNote", label: "Handoff note*", type: "textarea", placeholder: "Mention pending papers, mismatch, or office follow-up needed.", required: true },
    ],
  },
  {
    id: "assessment",
    title: "Neighbourhood & Overall Assessment",
    description: "Capture nearby conditions and end with a plain-language risk summary and declaration.",
    fields: [
      { id: "neighbourhoodType", label: "Neighbourhood type*", type: "select", options: ["Residential area", "Agricultural / rural", "Mixed residential and agricultural", "Commercial / industrial nearby"], required: true },
      { id: "industrialActivity", label: "Industrial activity / quarry nearby*", type: "select", options: ["None", "Light commercial only", "Industrial activity present — High risk", "Active quarry or mining — High risk"], required: true },
      { id: "electricityNearby", label: "Electricity infrastructure visible*", type: "select", options: ["Yes — directly adjacent or on road", "Yes — within 100 metres", "No — not visible"], required: true },
      { id: "mobileSignal", label: "Mobile signal strength*", type: "select", options: ["Strong — 4-5 bars", "Moderate — 2-3 bars", "Weak — 0-1 bar", "No signal"], required: true },
      { id: "overallRisk", label: "Overall risk rating*", type: "select", options: ["Low — Safe to proceed", "Moderate — Verify before proceeding", "High — Do not proceed without resolution"], required: true },
      { id: "redFlags", label: "Red flags found", type: "textarea", placeholder: "List each red flag or write NONE." },
      { id: "overallSummary", label: "Overall summary*", type: "textarea", placeholder: "Write 3 to 5 plain-language sentences.", required: true },
      { id: "departureTime", label: "Departure time*", type: "text", placeholder: "Example: 12:30 PM", required: true },
      { id: "declarationName", label: "Verifier declaration name*", type: "text", required: true },
    ],
  },
];

export function getInspectionSections(sector: Sector) {
  return sector === "land-verification" ? landInspectionSections : propertyInspectionSections;
}

export function getInitialFormValues(sector: Sector) {
  const values: Record<string, string> = {};

  for (const section of getInspectionSections(sector)) {
    for (const field of section.fields) {
      values[field.id] = "";
    }
  }

  return values;
}
