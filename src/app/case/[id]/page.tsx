"use client";

import { useParams } from "next/navigation";
import { CaseWorkspace } from "@/components/case-workspace";
import { useAppState } from "@/components/app-state";

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const { getCaseById } = useAppState();

  const propertyCase = getCaseById(params.id);

  if (!propertyCase) {
    return (
      <div className="workspace-grid">
        <section className="surface">
          <h2>Case not found</h2>
          <p>The case may have moved out of your queue or you may not have access to it.</p>
        </section>
      </div>
    );
  }

  return <CaseWorkspace propertyCase={propertyCase} />;
}
