-- Gala-dinner-only tickets issued from the admin tickets route.
--
-- The `Ticket_forum_type_required` check constraint still requires every FORUM
-- record to carry a `type`, so a gala-only ticket is stored with a placeholder
-- type and `origin = 'GALA_ONLY'`, which is authoritative for scanner scope
-- validation and admin presentation — the same arrangement JURY_GALA uses.
--
-- `ALTER TYPE ... ADD VALUE` cannot run inside the same transaction that uses
-- the new value, so apply this file on its own before deploying the code.
ALTER TYPE "forum_next"."TicketOrigin" ADD VALUE IF NOT EXISTS 'GALA_ONLY';
