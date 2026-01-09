--
-- PostgreSQL database dump
--

\restrict BG7cmhrUHOtWXZrqu50rGkwxXN2zT5WaqybBtQBbCHjPAofIElfvlsycrno5hJM

-- Dumped from database version 17.7 (e429a59)
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: academic; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA academic;


--
-- Name: event; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA event;


--
-- Name: hdb_catalog; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hdb_catalog;


--
-- Name: notification; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA notification;


--
-- Name: schedule; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA schedule;


--
-- Name: settings; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA settings;


--
-- Name: user; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "user";


--
-- Name: venue; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA venue;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: identifier_type_enum; Type: TYPE; Schema: user; Owner: -
--

CREATE TYPE "user".identifier_type_enum AS ENUM (
    'EMAIL',
    'PHONE'
);


--
-- Name: otp_action_type_enum; Type: TYPE; Schema: user; Owner: -
--

CREATE TYPE "user".otp_action_type_enum AS ENUM (
    'SEND',
    'RESEND',
    'VERIFY'
);


--
-- Name: otp_purpose_enum; Type: TYPE; Schema: user; Owner: -
--

CREATE TYPE "user".otp_purpose_enum AS ENUM (
    'LOGIN',
    'SIGNUP',
    'PASSWORD_RESET'
);


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: academic; Owner: -
--

CREATE FUNCTION academic.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: event; Owner: -
--

CREATE FUNCTION event.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


--
-- Name: gen_hasura_uuid(); Type: FUNCTION; Schema: hdb_catalog; Owner: -
--

CREATE FUNCTION hdb_catalog.gen_hasura_uuid() RETURNS uuid
    LANGUAGE sql
    AS $$select gen_random_uuid()$$;


--
-- Name: insert_event_log(text, text, text, text, json); Type: FUNCTION; Schema: hdb_catalog; Owner: -
--

CREATE FUNCTION hdb_catalog.insert_event_log(schema_name text, table_name text, trigger_name text, op text, row_data json) RETURNS text
    LANGUAGE plpgsql
    AS $$
  DECLARE
    id text;
    payload json;
    session_variables json;
    server_version_num int;
    trace_context json;
  BEGIN
    id := gen_random_uuid();
    server_version_num := current_setting('server_version_num');
    IF server_version_num >= 90600 THEN
      -- In some cases postgres sets the setting to an empty string, which is not a valid json.
      -- NULLIF will convert the empty string to NULL.
      -- Ref: https://github.com/hasura/graphql-engine/issues/8498
      session_variables := NULLIF(current_setting('hasura.user', 't'), '');
      trace_context := NULLIF(current_setting('hasura.tracecontext', 't'), '');
    ELSE
      BEGIN
        session_variables := current_setting('hasura.user');
      EXCEPTION WHEN OTHERS THEN
                  session_variables := NULL;
      END;
      BEGIN
        trace_context := current_setting('hasura.tracecontext');
      EXCEPTION WHEN OTHERS THEN
        trace_context := NULL;
      END;
    END IF;
    payload := json_build_object(
      'op', op,
      'data', row_data,
      'session_variables', session_variables,
      'trace_context', trace_context
    );
    INSERT INTO hdb_catalog.event_log
                (id, schema_name, table_name, trigger_name, payload)
    VALUES
    (id, schema_name, table_name, trigger_name, payload);
    RETURN id;
  END;
$$;


--
-- Name: notify_hasura_sendNotification_INSERT(); Type: FUNCTION; Schema: hdb_catalog; Owner: -
--

CREATE FUNCTION hdb_catalog."notify_hasura_sendNotification_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."target_type" , OLD."id" , OLD."status" , OLD."processed_at" , OLD."target_id" , OLD."failed_count" , OLD."sent_count" , OLD."image_url" , OLD."created_at" , OLD."error_message" , OLD."updated_at" , OLD."created_by" , OLD."title" , OLD."body" , OLD."data"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."target_type" , NEW."id" , NEW."status" , NEW."processed_at" , NEW."target_id" , NEW."failed_count" , NEW."sent_count" , NEW."image_url" , NEW."created_at" , NEW."error_message" , NEW."updated_at" , NEW."created_by" , NEW."title" , NEW."body" , NEW."data"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json((SELECT  "e"  FROM  (SELECT  NEW."target_type" , NEW."id" , NEW."status" , NEW."processed_at" , NEW."target_id" , NEW."failed_count" , NEW."sent_count" , NEW."image_url" , NEW."created_at" , NEW."error_message" , NEW."updated_at" , NEW."created_by" , NEW."title" , NEW."body" , NEW."data"        ) AS "e"      ) )
    );
    BEGIN
    /* NOTE: formerly we used TG_TABLE_NAME in place of tableName here. However in the case of
    partitioned tables this will give the name of the partitioned table and since we use the table name to
    get the event trigger configuration from the schema, this fails because the event trigger is only created
    on the original table.  */
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST('notification' AS text), CAST('log' AS text), CAST('sendNotification' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST('notification' AS text), CAST('log' AS text), CAST('sendNotification' AS text), TG_OP, _data);
        END IF;
    END;

    RETURN NULL;
  END;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: notification; Owner: -
--

CREATE FUNCTION notification.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: settings; Owner: -
--

CREATE FUNCTION settings.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: user; Owner: -
--

CREATE FUNCTION "user".set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


--
-- Name: set_current_timestamp_updated_at(); Type: FUNCTION; Schema: venue; Owner: -
--

CREATE FUNCTION venue.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.batch (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departmant_id uuid NOT NULL,
    name text NOT NULL,
    current_semester integer NOT NULL,
    year integer NOT NULL,
    semester_count integer NOT NULL,
    start_date date,
    end_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: class_representative; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.class_representative (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    section_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    appointed_at date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: course; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.course (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    credit_hours numeric NOT NULL,
    semester integer NOT NULL,
    course_type text DEFAULT 'THEORY'::text NOT NULL,
    syllabus_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE course; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TABLE academic.course IS 'Course catelog';


--
-- Name: course_offering; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.course_offering (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    section_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    academic_year text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE course_offering; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TABLE academic.course_offering IS 'Course instance for batched/sections';


--
-- Name: department; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.department (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    head_user_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    faculty_id uuid
);


--
-- Name: faculty; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.faculty (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: section; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.section (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    batch_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    capacity integer
);


--
-- Name: user_enrollment; Type: TABLE; Schema: academic; Owner: -
--

CREATE TABLE academic.user_enrollment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    course_offering_id uuid NOT NULL,
    status text DEFAULT 'ENROLLED'::text NOT NULL,
    enrolled_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE user_enrollment; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TABLE academic.user_enrollment IS 'Students course enrollments';


--
-- Name: event; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    title text NOT NULL,
    description text,
    course_offering_id uuid,
    date date NOT NULL,
    start_time time with time zone NOT NULL,
    end_time time with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    priority text DEFAULT 'normal'::text,
    routine_id uuid,
    metadata jsonb,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: event_attachment; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_attachment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    attachment_type text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    file_size integer,
    mime_type text,
    description text,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE event_attachment; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_attachment IS 'Documents and resources attached to events.';


--
-- Name: event_attendance; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    marked_at timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    marked_by uuid NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE event_attendance; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_attendance IS 'Attendance tracking for regular lectures (without participant records).';


--
-- Name: event_cancellation; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_cancellation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    cancelled_by uuid NOT NULL,
    reason text NOT NULL,
    cancelled_at timestamp with time zone DEFAULT now() NOT NULL,
    rescheduled_event_id uuid,
    notification_sent boolean DEFAULT false NOT NULL,
    notification_sent_at timestamp with time zone
);


--
-- Name: TABLE event_cancellation; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_cancellation IS 'Cancellation records with rescheduling links.';


--
-- Name: event_change; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_change (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    changed_by uuid NOT NULL,
    change_type text NOT NULL,
    old_value jsonb NOT NULL,
    new_value jsonb NOT NULL,
    reason text NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    notification_sent boolean DEFAULT false NOT NULL,
    notification_sent_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE event_change; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_change IS 'Audit trail for all event modifications.';


--
-- Name: event_instructor; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_instructor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_room_id uuid NOT NULL,
    instructor_id uuid NOT NULL,
    role text NOT NULL,
    is_primary boolean DEFAULT false,
    responsibility_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE event_instructor; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_instructor IS 'Instructor assignments per room (supports multi-instructor).';


--
-- Name: event_participant; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_participant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    event_room_id uuid NOT NULL,
    seat_number text,
    attendance_status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    requirements text,
    checked_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE event_participant; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_participant IS 'Individual participant tracking (Can be used for exams and to track attendance for a particular event).';


--
-- Name: event_room; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_room (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    room_id uuid NOT NULL,
    capacity integer,
    is_primary_room boolean DEFAULT false,
    room_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE event_room; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_room IS 'Room assignments for events (supports multi-room events).';


--
-- Name: event_target; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.event_target (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    target_type text NOT NULL,
    target_id uuid NOT NULL,
    group_identifier text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE event_target; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.event_target IS 'Group-based targeting (who should see the event).';


--
-- Name: group_assignment; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.group_assignment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    section_id uuid NOT NULL,
    course_offering_id uuid NOT NULL,
    group_identifier text NOT NULL,
    assigned_by uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: TABLE group_assignment; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.group_assignment IS 'Assign students to sub-groups within sections/courses (for labs).';


--
-- Name: routine; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.routine (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    course_offering_id uuid,
    day_of_week integer NOT NULL,
    start_time time with time zone NOT NULL,
    end_time time with time zone NOT NULL,
    event_type text DEFAULT 'lecture'::text NOT NULL,
    effective_from date NOT NULL,
    effective_to date NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: routine_exception; Type: TABLE; Schema: event; Owner: -
--

CREATE TABLE event.routine_exception (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    routine_id uuid,
    exception_date date NOT NULL,
    reason text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'cancellation'::text NOT NULL
);


--
-- Name: TABLE routine_exception; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TABLE event.routine_exception IS 'Skip dates for recurring routines (holidays).';


--
-- Name: event_invocation_logs; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.event_invocation_logs (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    trigger_name text,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: event_log; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.event_log (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    trigger_name text NOT NULL,
    payload jsonb NOT NULL,
    delivered boolean DEFAULT false NOT NULL,
    error boolean DEFAULT false NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    locked timestamp with time zone,
    next_retry_at timestamp without time zone,
    archived boolean DEFAULT false NOT NULL
);


--
-- Name: hdb_event_log_cleanups; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_event_log_cleanups (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    trigger_name text NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    deleted_event_logs integer,
    deleted_event_invocation_logs integer,
    status text NOT NULL,
    CONSTRAINT hdb_event_log_cleanups_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'paused'::text, 'completed'::text, 'dead'::text])))
);


--
-- Name: hdb_source_catalog_version; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_source_catalog_version (
    version text NOT NULL,
    upgraded_on timestamp with time zone NOT NULL
);


--
-- Name: log; Type: TABLE; Schema: notification; Owner: -
--

CREATE TABLE notification.log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    target_type text,
    target_id uuid NOT NULL,
    data jsonb,
    image_url text,
    created_by uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone
);


--
-- Name: config; Type: TABLE; Schema: settings; Owner: -
--

CREATE TABLE settings.config (
    id integer NOT NULL,
    identifier text NOT NULL,
    scope text NOT NULL,
    value jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE config; Type: COMMENT; Schema: settings; Owner: -
--

COMMENT ON TABLE settings.config IS 'This will store configuration across all the available platforms';


--
-- Name: config_id_seq; Type: SEQUENCE; Schema: settings; Owner: -
--

CREATE SEQUENCE settings.config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_id_seq; Type: SEQUENCE OWNED BY; Schema: settings; Owner: -
--

ALTER SEQUENCE settings.config_id_seq OWNED BY settings.config.id;


--
-- Name: account; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone text NOT NULL,
    email text,
    phone_verified_at timestamp with time zone,
    email_verified_at timestamp with time zone,
    role text DEFAULT 'consumer'::text NOT NULL,
    password text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: device; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".device (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    device_id text NOT NULL,
    provider text NOT NULL,
    token text NOT NULL,
    platform text NOT NULL,
    is_active boolean NOT NULL,
    last_used_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: faculty; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".faculty (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text,
    last_name text,
    designation text NOT NULL,
    faculty_id uuid NOT NULL,
    department_id uuid NOT NULL,
    description jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL
);


--
-- Name: otp_rate_limit; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".otp_rate_limit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    identifier_type text NOT NULL,
    attempt_count integer DEFAULT 1 NOT NULL,
    window_start timestamp with time zone DEFAULT now() NOT NULL,
    action_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text NOT NULL
);


--
-- Name: TABLE otp_rate_limit; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TABLE "user".otp_rate_limit IS 'Tracks rate limits for OTP operations';


--
-- Name: otp_transaction; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".otp_transaction (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    identifier_type text NOT NULL,
    purpose text NOT NULL,
    otp_hash text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE otp_transaction; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TABLE "user".otp_transaction IS 'Stores OTP codes for authentication flows';


--
-- Name: profile; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    student_id text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    avatar text,
    date_of_birth date,
    gender text,
    blood_group text,
    address text,
    department_id uuid NOT NULL,
    batch_id uuid,
    section_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: user; Owner: -
--

CREATE TABLE "user".session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    access_token_expires_at timestamp with time zone NOT NULL,
    refresh_token_expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    ip_address text NOT NULL,
    device_info jsonb,
    user_agent text NOT NULL,
    last_used_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE session; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TABLE "user".session IS 'This will store user sessions ';


--
-- Name: building; Type: TABLE; Schema: venue; Owner: -
--

CREATE TABLE venue.building (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    latitude text,
    longitude text
);


--
-- Name: room; Type: TABLE; Schema: venue; Owner: -
--

CREATE TABLE venue.room (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    building_id uuid NOT NULL,
    room_number text NOT NULL,
    floor text NOT NULL,
    capacity integer,
    facility jsonb,
    room_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: config id; Type: DEFAULT; Schema: settings; Owner: -
--

ALTER TABLE ONLY settings.config ALTER COLUMN id SET DEFAULT nextval('settings.config_id_seq'::regclass);


--
-- Name: batch batch_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.batch
    ADD CONSTRAINT batch_pkey PRIMARY KEY (id);


--
-- Name: class_representative class_representative_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.class_representative
    ADD CONSTRAINT class_representative_pkey PRIMARY KEY (id);


--
-- Name: class_representative class_representative_user_id_section_id_key; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.class_representative
    ADD CONSTRAINT class_representative_user_id_section_id_key UNIQUE (user_id, section_id);


--
-- Name: course course_department_id_code_key; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course
    ADD CONSTRAINT course_department_id_code_key UNIQUE (department_id, code);


--
-- Name: course_offering course_offering_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course_offering
    ADD CONSTRAINT course_offering_pkey PRIMARY KEY (id);


--
-- Name: course course_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (id);


--
-- Name: department department_code_key; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.department
    ADD CONSTRAINT department_code_key UNIQUE (code);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (id);


--
-- Name: section section_batch_id_name_key; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.section
    ADD CONSTRAINT section_batch_id_name_key UNIQUE (batch_id, name);


--
-- Name: section section_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (id);


--
-- Name: user_enrollment user_enrollment_pkey; Type: CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.user_enrollment
    ADD CONSTRAINT user_enrollment_pkey PRIMARY KEY (id);


--
-- Name: event_attachment event_attachment_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_attachment
    ADD CONSTRAINT event_attachment_pkey PRIMARY KEY (id);


--
-- Name: event_attendance event_attendance_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_attendance
    ADD CONSTRAINT event_attendance_pkey PRIMARY KEY (id);


--
-- Name: event_cancellation event_cancellation_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_cancellation
    ADD CONSTRAINT event_cancellation_pkey PRIMARY KEY (id);


--
-- Name: event_change event_change_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_change
    ADD CONSTRAINT event_change_pkey PRIMARY KEY (id);


--
-- Name: event_instructor event_instructor_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_instructor
    ADD CONSTRAINT event_instructor_pkey PRIMARY KEY (id);


--
-- Name: event_participant event_participant_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_participant
    ADD CONSTRAINT event_participant_pkey PRIMARY KEY (id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: event_room event_room_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_room
    ADD CONSTRAINT event_room_pkey PRIMARY KEY (id);


--
-- Name: event_target event_target_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_target
    ADD CONSTRAINT event_target_pkey PRIMARY KEY (id);


--
-- Name: group_assignment group_assignment_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.group_assignment
    ADD CONSTRAINT group_assignment_pkey PRIMARY KEY (id);


--
-- Name: routine_exception routine_exception_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.routine_exception
    ADD CONSTRAINT routine_exception_pkey PRIMARY KEY (id);


--
-- Name: routine routine_pkey; Type: CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.routine
    ADD CONSTRAINT routine_pkey PRIMARY KEY (id);


--
-- Name: event_invocation_logs event_invocation_logs_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_pkey PRIMARY KEY (id);


--
-- Name: event_log event_log_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_log
    ADD CONSTRAINT event_log_pkey PRIMARY KEY (id);


--
-- Name: hdb_event_log_cleanups hdb_event_log_cleanups_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_event_log_cleanups
    ADD CONSTRAINT hdb_event_log_cleanups_pkey PRIMARY KEY (id);


--
-- Name: hdb_event_log_cleanups hdb_event_log_cleanups_trigger_name_scheduled_at_key; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_event_log_cleanups
    ADD CONSTRAINT hdb_event_log_cleanups_trigger_name_scheduled_at_key UNIQUE (trigger_name, scheduled_at);


--
-- Name: log log_pkey; Type: CONSTRAINT; Schema: notification; Owner: -
--

ALTER TABLE ONLY notification.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- Name: config config_identifier_scope_key; Type: CONSTRAINT; Schema: settings; Owner: -
--

ALTER TABLE ONLY settings.config
    ADD CONSTRAINT config_identifier_scope_key UNIQUE (identifier, scope);


--
-- Name: config config_pkey; Type: CONSTRAINT; Schema: settings; Owner: -
--

ALTER TABLE ONLY settings.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);


--
-- Name: account account_phone_key; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".account
    ADD CONSTRAINT account_phone_key UNIQUE (phone);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: device device_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- Name: device device_user_id_device_id_provider_key; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".device
    ADD CONSTRAINT device_user_id_device_id_provider_key UNIQUE (user_id, device_id, provider);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (id);


--
-- Name: otp_rate_limit otp_rate_limit_identifier_action_type_window_start_key; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".otp_rate_limit
    ADD CONSTRAINT otp_rate_limit_identifier_action_type_window_start_key UNIQUE (identifier, action_type, window_start);


--
-- Name: otp_rate_limit otp_rate_limit_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".otp_rate_limit
    ADD CONSTRAINT otp_rate_limit_pkey PRIMARY KEY (id);


--
-- Name: otp_transaction otp_transaction_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".otp_transaction
    ADD CONSTRAINT otp_transaction_pkey PRIMARY KEY (id);


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- Name: profile profile_student_id_key; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".profile
    ADD CONSTRAINT profile_student_id_key UNIQUE (student_id);


--
-- Name: session session_access_token_key; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".session
    ADD CONSTRAINT session_access_token_key UNIQUE (access_token);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_refresh_token_key; Type: CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".session
    ADD CONSTRAINT session_refresh_token_key UNIQUE (refresh_token);


--
-- Name: building building_code_key; Type: CONSTRAINT; Schema: venue; Owner: -
--

ALTER TABLE ONLY venue.building
    ADD CONSTRAINT building_code_key UNIQUE (code);


--
-- Name: building building_pkey; Type: CONSTRAINT; Schema: venue; Owner: -
--

ALTER TABLE ONLY venue.building
    ADD CONSTRAINT building_pkey PRIMARY KEY (id);


--
-- Name: room room_building_id_room_number_key; Type: CONSTRAINT; Schema: venue; Owner: -
--

ALTER TABLE ONLY venue.room
    ADD CONSTRAINT room_building_id_room_number_key UNIQUE (building_id, room_number);


--
-- Name: room room_pkey; Type: CONSTRAINT; Schema: venue; Owner: -
--

ALTER TABLE ONLY venue.room
    ADD CONSTRAINT room_pkey PRIMARY KEY (id);


--
-- Name: event_invocation_logs_event_id_idx; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_invocation_logs_event_id_idx ON hdb_catalog.event_invocation_logs USING btree (event_id);


--
-- Name: event_log_fetch_events; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_log_fetch_events ON hdb_catalog.event_log USING btree (locked NULLS FIRST, next_retry_at NULLS FIRST, created_at) WHERE ((delivered = false) AND (error = false) AND (archived = false));


--
-- Name: event_log_trigger_name_idx; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_log_trigger_name_idx ON hdb_catalog.event_log USING btree (trigger_name);


--
-- Name: hdb_source_catalog_version_one_row; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE UNIQUE INDEX hdb_source_catalog_version_one_row ON hdb_catalog.hdb_source_catalog_version USING btree (((version IS NOT NULL)));


--
-- Name: idx_otp_expires_at; Type: INDEX; Schema: user; Owner: -
--

CREATE INDEX idx_otp_expires_at ON "user".otp_transaction USING btree (expires_at);


--
-- Name: idx_otp_identifier_purpose; Type: INDEX; Schema: user; Owner: -
--

CREATE UNIQUE INDEX idx_otp_identifier_purpose ON "user".otp_transaction USING btree (identifier, purpose, verified, expires_at);


--
-- Name: batch set_academic_batch_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_batch_updated_at BEFORE UPDATE ON academic.batch FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_batch_updated_at ON batch; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_batch_updated_at ON academic.batch IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: class_representative set_academic_class_representative_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_class_representative_updated_at BEFORE UPDATE ON academic.class_representative FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_class_representative_updated_at ON class_representative; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_class_representative_updated_at ON academic.class_representative IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: course_offering set_academic_course_offering_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_course_offering_updated_at BEFORE UPDATE ON academic.course_offering FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_course_offering_updated_at ON course_offering; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_course_offering_updated_at ON academic.course_offering IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: course set_academic_course_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_course_updated_at BEFORE UPDATE ON academic.course FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_course_updated_at ON course; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_course_updated_at ON academic.course IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: department set_academic_department_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_department_updated_at BEFORE UPDATE ON academic.department FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_department_updated_at ON department; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_department_updated_at ON academic.department IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: faculty set_academic_faculty_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_faculty_updated_at BEFORE UPDATE ON academic.faculty FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_faculty_updated_at ON faculty; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_faculty_updated_at ON academic.faculty IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: section set_academic_section_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_section_updated_at BEFORE UPDATE ON academic.section FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_section_updated_at ON section; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_section_updated_at ON academic.section IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: user_enrollment set_academic_user_enrollment_updated_at; Type: TRIGGER; Schema: academic; Owner: -
--

CREATE TRIGGER set_academic_user_enrollment_updated_at BEFORE UPDATE ON academic.user_enrollment FOR EACH ROW EXECUTE FUNCTION academic.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_academic_user_enrollment_updated_at ON user_enrollment; Type: COMMENT; Schema: academic; Owner: -
--

COMMENT ON TRIGGER set_academic_user_enrollment_updated_at ON academic.user_enrollment IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: event_attendance set_event_event_attendance_updated_at; Type: TRIGGER; Schema: event; Owner: -
--

CREATE TRIGGER set_event_event_attendance_updated_at BEFORE UPDATE ON event.event_attendance FOR EACH ROW EXECUTE FUNCTION event.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_event_event_attendance_updated_at ON event_attendance; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TRIGGER set_event_event_attendance_updated_at ON event.event_attendance IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: event_instructor set_event_event_instructor_updated_at; Type: TRIGGER; Schema: event; Owner: -
--

CREATE TRIGGER set_event_event_instructor_updated_at BEFORE UPDATE ON event.event_instructor FOR EACH ROW EXECUTE FUNCTION event.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_event_event_instructor_updated_at ON event_instructor; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TRIGGER set_event_event_instructor_updated_at ON event.event_instructor IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: event_participant set_event_event_participant_updated_at; Type: TRIGGER; Schema: event; Owner: -
--

CREATE TRIGGER set_event_event_participant_updated_at BEFORE UPDATE ON event.event_participant FOR EACH ROW EXECUTE FUNCTION event.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_event_event_participant_updated_at ON event_participant; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TRIGGER set_event_event_participant_updated_at ON event.event_participant IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: event_room set_event_event_room_updated_at; Type: TRIGGER; Schema: event; Owner: -
--

CREATE TRIGGER set_event_event_room_updated_at BEFORE UPDATE ON event.event_room FOR EACH ROW EXECUTE FUNCTION event.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_event_event_room_updated_at ON event_room; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TRIGGER set_event_event_room_updated_at ON event.event_room IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: event set_event_event_updated_at; Type: TRIGGER; Schema: event; Owner: -
--

CREATE TRIGGER set_event_event_updated_at BEFORE UPDATE ON event.event FOR EACH ROW EXECUTE FUNCTION event.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_event_event_updated_at ON event; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TRIGGER set_event_event_updated_at ON event.event IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: routine set_event_routine_updated_at; Type: TRIGGER; Schema: event; Owner: -
--

CREATE TRIGGER set_event_routine_updated_at BEFORE UPDATE ON event.routine FOR EACH ROW EXECUTE FUNCTION event.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_event_routine_updated_at ON routine; Type: COMMENT; Schema: event; Owner: -
--

COMMENT ON TRIGGER set_event_routine_updated_at ON event.routine IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: log notify_hasura_sendNotification_INSERT; Type: TRIGGER; Schema: notification; Owner: -
--

CREATE TRIGGER "notify_hasura_sendNotification_INSERT" AFTER INSERT ON notification.log FOR EACH ROW EXECUTE FUNCTION hdb_catalog."notify_hasura_sendNotification_INSERT"();


--
-- Name: log set_notification_log_updated_at; Type: TRIGGER; Schema: notification; Owner: -
--

CREATE TRIGGER set_notification_log_updated_at BEFORE UPDATE ON notification.log FOR EACH ROW EXECUTE FUNCTION notification.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_notification_log_updated_at ON log; Type: COMMENT; Schema: notification; Owner: -
--

COMMENT ON TRIGGER set_notification_log_updated_at ON notification.log IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: config set_settings_config_updated_at; Type: TRIGGER; Schema: settings; Owner: -
--

CREATE TRIGGER set_settings_config_updated_at BEFORE UPDATE ON settings.config FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_settings_config_updated_at ON config; Type: COMMENT; Schema: settings; Owner: -
--

COMMENT ON TRIGGER set_settings_config_updated_at ON settings.config IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: account set_user_account_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_account_updated_at BEFORE UPDATE ON "user".account FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_account_updated_at ON account; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_account_updated_at ON "user".account IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: device set_user_device_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_device_updated_at BEFORE UPDATE ON "user".device FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_device_updated_at ON device; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_device_updated_at ON "user".device IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: faculty set_user_faculty_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_faculty_updated_at BEFORE UPDATE ON "user".faculty FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_faculty_updated_at ON faculty; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_faculty_updated_at ON "user".faculty IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: otp_rate_limit set_user_otp_rate_limit_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_otp_rate_limit_updated_at BEFORE UPDATE ON "user".otp_rate_limit FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_otp_rate_limit_updated_at ON otp_rate_limit; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_otp_rate_limit_updated_at ON "user".otp_rate_limit IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: otp_transaction set_user_otp_transaction_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_otp_transaction_updated_at BEFORE UPDATE ON "user".otp_transaction FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_otp_transaction_updated_at ON otp_transaction; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_otp_transaction_updated_at ON "user".otp_transaction IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: profile set_user_profile_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_profile_updated_at BEFORE UPDATE ON "user".profile FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_profile_updated_at ON profile; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_profile_updated_at ON "user".profile IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: session set_user_session_updated_at; Type: TRIGGER; Schema: user; Owner: -
--

CREATE TRIGGER set_user_session_updated_at BEFORE UPDATE ON "user".session FOR EACH ROW EXECUTE FUNCTION "user".set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_user_session_updated_at ON session; Type: COMMENT; Schema: user; Owner: -
--

COMMENT ON TRIGGER set_user_session_updated_at ON "user".session IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: building set_venue_building_updated_at; Type: TRIGGER; Schema: venue; Owner: -
--

CREATE TRIGGER set_venue_building_updated_at BEFORE UPDATE ON venue.building FOR EACH ROW EXECUTE FUNCTION venue.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_venue_building_updated_at ON building; Type: COMMENT; Schema: venue; Owner: -
--

COMMENT ON TRIGGER set_venue_building_updated_at ON venue.building IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: room set_venue_room_updated_at; Type: TRIGGER; Schema: venue; Owner: -
--

CREATE TRIGGER set_venue_room_updated_at BEFORE UPDATE ON venue.room FOR EACH ROW EXECUTE FUNCTION venue.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_venue_room_updated_at ON room; Type: COMMENT; Schema: venue; Owner: -
--

COMMENT ON TRIGGER set_venue_room_updated_at ON venue.room IS 'trigger to set value of column "updated_at" to current timestamp on row update';


--
-- Name: batch batch_departmant_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.batch
    ADD CONSTRAINT batch_departmant_id_fkey FOREIGN KEY (departmant_id) REFERENCES academic.department(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: class_representative class_representative_batch_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.class_representative
    ADD CONSTRAINT class_representative_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES academic.batch(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: class_representative class_representative_section_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.class_representative
    ADD CONSTRAINT class_representative_section_id_fkey FOREIGN KEY (section_id) REFERENCES academic.section(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: class_representative class_representative_user_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.class_representative
    ADD CONSTRAINT class_representative_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user".account(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: course course_department_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course
    ADD CONSTRAINT course_department_id_fkey FOREIGN KEY (department_id) REFERENCES academic.department(id) ON DELETE CASCADE;


--
-- Name: course_offering course_offering_batch_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course_offering
    ADD CONSTRAINT course_offering_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES academic.batch(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: course_offering course_offering_course_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course_offering
    ADD CONSTRAINT course_offering_course_id_fkey FOREIGN KEY (course_id) REFERENCES academic.course(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: course_offering course_offering_section_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course_offering
    ADD CONSTRAINT course_offering_section_id_fkey FOREIGN KEY (section_id) REFERENCES academic.section(id) ON DELETE SET NULL;


--
-- Name: course_offering course_offering_teacher_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.course_offering
    ADD CONSTRAINT course_offering_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES "user".account(id) ON DELETE CASCADE;


--
-- Name: department department_head_user_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.department
    ADD CONSTRAINT department_head_user_id_fkey FOREIGN KEY (head_user_id) REFERENCES "user".account(id) ON UPDATE SET DEFAULT ON DELETE SET NULL;


--
-- Name: section section_batch_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.section
    ADD CONSTRAINT section_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES academic.batch(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_enrollment user_enrollment_course_offering_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.user_enrollment
    ADD CONSTRAINT user_enrollment_course_offering_id_fkey FOREIGN KEY (course_offering_id) REFERENCES academic.course_offering(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_enrollment user_enrollment_user_id_fkey; Type: FK CONSTRAINT; Schema: academic; Owner: -
--

ALTER TABLE ONLY academic.user_enrollment
    ADD CONSTRAINT user_enrollment_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user".account(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: event event_course_offering_id_fkey; Type: FK CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event
    ADD CONSTRAINT event_course_offering_id_fkey FOREIGN KEY (course_offering_id) REFERENCES academic.course_offering(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: event event_created_by_fkey; Type: FK CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event
    ADD CONSTRAINT event_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user".account(id);


--
-- Name: event event_routine_id_fkey; Type: FK CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event
    ADD CONSTRAINT event_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES event.routine(id) ON DELETE SET NULL;


--
-- Name: event_target event_target_event_id_fkey; Type: FK CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.event_target
    ADD CONSTRAINT event_target_event_id_fkey FOREIGN KEY (event_id) REFERENCES event.event(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: routine routine_course_offering_id_fkey; Type: FK CONSTRAINT; Schema: event; Owner: -
--

ALTER TABLE ONLY event.routine
    ADD CONSTRAINT routine_course_offering_id_fkey FOREIGN KEY (course_offering_id) REFERENCES academic.course_offering(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: log log_created_by_fkey; Type: FK CONSTRAINT; Schema: notification; Owner: -
--

ALTER TABLE ONLY notification.log
    ADD CONSTRAINT log_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user".account(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: device device_user_id_fkey; Type: FK CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".device
    ADD CONSTRAINT device_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user".account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profile profile_user_id_fkey; Type: FK CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".profile
    ADD CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user".account(id) ON DELETE CASCADE;


--
-- Name: session session_user_id_fkey; Type: FK CONSTRAINT; Schema: user; Owner: -
--

ALTER TABLE ONLY "user".session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user".account(id) ON DELETE CASCADE;


--
-- Name: room room_building_id_fkey; Type: FK CONSTRAINT; Schema: venue; Owner: -
--

ALTER TABLE ONLY venue.room
    ADD CONSTRAINT room_building_id_fkey FOREIGN KEY (building_id) REFERENCES venue.building(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BG7cmhrUHOtWXZrqu50rGkwxXN2zT5WaqybBtQBbCHjPAofIElfvlsycrno5hJM

