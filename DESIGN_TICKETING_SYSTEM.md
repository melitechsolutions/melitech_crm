# Client Ticketing System — Design

Overview
- Purpose: allow clients to raise and track requests (support/tickets) and request task work (poster design, logo design, etc.).
- Goals: simple ticket lifecycle, attachments, comments, status updates, client & staff views, ability to convert ticket to project/task.

Key Concepts
- Ticket: primary record created by a client with title, description, category, priority, attachments, requestedDueDate.
- Comment: threaded comments on a ticket by client or staff.
- Task Request: structured request (optional) where client can select service type (poster, logo) and provide brief + deliverables.
- Assignment & Status: statuses: `new`, `open`, `in_progress`, `awaiting_client`, `completed`, `closed`.
- Notifications: email/in-app notifications on status/comments.

Data Model (suggested)
- `tickets`:
  - id PK, clientId, title, description, category, priority, status, requestedDueDate, assignedTo, createdBy, createdAt, updatedAt
- `ticket_comments`:
  - id PK, ticketId FK, authorId, body, attachments (json), createdAt
- `ticket_attachments` (optional): id, ticketId, filename, mime, storagePath, createdAt
- `ticket_tasks` (optional): id, ticketId, serviceType, details, budget, dueDate, createdAt

API / Router (trpc)
- `tickets.list({ clientId?, status?, limit, offset })` -> list tickets
- `tickets.getById(id)` -> ticket detail with comments
- `tickets.create(input)` -> create ticket (clients)
- `tickets.update(input)` -> update ticket (staff/owner)
- `tickets.addComment({ ticketId, body })` -> append comment
- `tickets.attach({ ticketId, file })` -> upload (or return upload URL)
- `tickets.createTaskRequest({ ticketId, serviceType, details })` -> optional structured request

Permissions
- Clients: create tickets, view their tickets, comment on their tickets, close tickets
- Staff: view all tickets, assign, change status, comment, convert to task/project
- Admin: full control

UI / Client Dashboard
- Tickets List (client view): shows tickets with status badges, search, filter by category/status, create new ticket CTA
- Ticket Detail: title, timeline of status changes & comments, attachments, add comment box, request task button
- Create Ticket Modal: title, category (dropdown), description, priority, optional file upload, requested due date
- Request Task Modal: service type (poster/logo), deliverables checklist, optional budget, example attachments

Integration & Implementation Notes
- Attachments handled by existing file-storage layer (S3 or local). If not present, provide upload endpoint storing file metadata only.
- Notifications call existing `notifications` helpers.
- Add simple activity log entries on create/update using `db.logActivity`.
- Initially implement without heavy workflow automation; allow manual assignment and status updates.

Acceptance Criteria
- Clients can create tickets and see them in their dashboard.
- Staff can change ticket status and comment.
- Comments show author and timestamp.
- Ticket can contain a structured task request for poster/logo with required fields.

Next steps
- Add `tickets` table to `drizzle/schema-extended.ts`.
- Implement `server/routers/tickets.ts` CRUD & comment procedures.
- Add `client/src/pages/Tickets.tsx` with list and detail views; wire to TRPC procedures.
- Add lightweight tests for router validation and integration.

