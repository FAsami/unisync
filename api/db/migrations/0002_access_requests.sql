-- Students missing from their department's roster can ask to join; a
-- department admin approves or rejects (UX review decision 1).

-- A department admin is an account with role 'admin' and the department it manages.
ALTER TABLE "user".account
    ADD COLUMN managed_department_id uuid REFERENCES academic.department (id) ON DELETE SET NULL;

COMMENT ON COLUMN "user".account.managed_department_id IS
    'For role admin: the department this admin manages. NULL = no department scope.';

CREATE TABLE "user".access_request (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    student_id text NOT NULL,
    department_id uuid NOT NULL REFERENCES academic.department (id) ON DELETE CASCADE,
    batch_id uuid NOT NULL REFERENCES academic.batch (id) ON DELETE CASCADE,
    section_id uuid NOT NULL REFERENCES academic.section (id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason text,
    decided_by uuid REFERENCES "user".account (id) ON DELETE SET NULL,
    decided_at timestamptz,
    account_id uuid REFERENCES "user".account (id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT access_request_decided_iff_not_pending CHECK ((status = 'pending') = (decided_at IS NULL))
);

COMMENT ON TABLE "user".access_request IS 'Requests to join from phones not on a department roster.';

-- One open request per phone; a rejected requester may ask again.
CREATE UNIQUE INDEX access_request_one_pending_per_phone ON "user".access_request (phone) WHERE status = 'pending';
CREATE INDEX access_request_department_queue ON "user".access_request (department_id, status, created_at DESC);

CREATE TRIGGER set_user_access_request_updated_at
    BEFORE UPDATE ON "user".access_request
    FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();
