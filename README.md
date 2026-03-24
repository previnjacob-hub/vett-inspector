# Vett Inspector MVP

Local Next.js prototype for Vett's role-based verification workflow.

This first version is focused on:

- office intake and assignment workflow
- property verification and land verification
- separate portals for office team, verifier, advocate, and admin
- verifier field submission flow
- advocate legal handoff and completion flow
- final office report desk
- future placeholder for used car verification

## Local run

From this folder:

```bash
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current screens

- user-based login simulation for admin, office team, verifier, and advocate
- office dashboard for enquiries, in-field verifiers, advocate-ready cases, and final desk workload
- verifier queue with assigned cases only
- advocate queue with legal-review cases only
- office case view with verifier, legal, and final report sections
- mobile-first apartment verifier form with mandatory validation
- device-local draft save for field capture
- SOP visibility restricted by role and sector
- future-facing sector cards for property, land, and used car verification

## App structure

- `src/app/page.tsx`: dashboard entry
- `src/app/case/[id]/page.tsx`: case workspace
- `src/components/vett-mvp.tsx`: role-based portal dashboard
- `src/components/case-workspace.tsx`: case handoff flow
- `src/components/app-state.tsx`: role/session state and lifecycle transitions
- `src/lib/mock-data.ts`: demo users, sectors, cases, and SOP access

## Suggested next build steps

1. Add real authentication and user creation in the backend by role.
2. Move cases, uploads, and status transitions into PostgreSQL.
3. Add office forms for enquiry intake, verifier assignment, and advocate assignment.
4. Add real media upload and legal report upload.
5. Add branded final report generation and WhatsApp-ready dispatch workflow.
