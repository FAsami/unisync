import { gql } from '@apollo/client'

export const GET_USER_SESSIONS = gql`
  query GetUserSessions {
    user_session {
      id
      user_id
      revoked
      ip_address
      device_info
      user_agent
      last_used_at
      created_at
      updated_at
      access_token_expires_at
      refresh_token_expires_at
    }
  }
`

export const SUBSCRIBE_TO_SESSION_CHANGES = gql`
  subscription SubscribeToSessionChanges {
    user_session {
      id
      user_id
      revoked
      ip_address
      last_used_at
      created_at
      updated_at
    }
  }
`

export interface UserSession {
  id: string
  user_id?: number
  revoked: boolean
  ip_address: string
  device_info?: any
  user_agent: string
  last_used_at: string
  created_at: string
  updated_at: string
  access_token_expires_at?: string
  refresh_token_expires_at?: string
}

export interface GetUserSessionsData {
  user_session: UserSession[]
}

export const GET_EVENT_ROUTINES = gql`
  query GetEventRoutines {
    event_routine(where: { is_active: { _eq: true } }) {
      id
      name
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
      metadata
      course_offering {
        id
        section {
          id
          name
          batch {
            name
          }
        }
        course {
          id
          name
          code
        }
        faculty {
          id
          first_name
          last_name
        }
      }
    }
  }
`

export interface EventRoutine {
  id: string
  name: string
  day_of_week: number
  start_time: string
  end_time: string
  event_type: string
  effective_from: string
  effective_to: string
  is_active: boolean
  metadata?: any
  course_offering?: {
    id: string
    section?: {
      id: string
      name: string
      batch?: {
        name: string
      }
    }
    course?: {
      id: string
      name: string
      code: string
    }
    faculty?: {
      id: string
      first_name: string
      last_name: string
    }
  }
}

export interface GetEventRoutinesData {
  event_routine: EventRoutine[]
}

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($userId: uuid!) {
    user_account_by_pk(id: $userId) {
      id
      email
      phone
      role
      created_at
      updated_at
      is_active
      profiles {
        first_name
        last_name
      }
    }
  }
`

export interface UserAccount {
  id: string
  email?: string
  phone: string
  role: string
  created_at: string
  updated_at: string
  is_active: boolean
  deleted_at?: string | null
  profiles?: {
    first_name: string
    last_name: string
  }[]
}

export interface GetCurrentUserData {
  user_account_by_pk: UserAccount | null
}

export const GET_USERS_FOR_SELECT = gql`
  query GetUsersForSelect($search: String) {
    user_account(
      where: {
        _or: [
          { email: { _ilike: $search } }
          { phone: { _ilike: $search } }
          { profiles: { first_name: { _ilike: $search } } }
          { profiles: { last_name: { _ilike: $search } } }
        ]
        is_active: { _eq: true }
      }
      limit: 20
    ) {
      id
      email
      profiles {
        first_name
        last_name
      }
    }
  }
`

// User Management Operations
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    user_account(order_by: { created_at: desc }) {
      id
      email
      phone
      role
      is_active
      created_at
      updated_at
    }
  }
`

export interface GetAllUsersData {
  user_account: UserAccount[]
}

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($userId: uuid!, $isActive: Boolean!) {
    update_user_account_by_pk(
      pk_columns: { id: $userId }
      _set: { is_active: $isActive }
    ) {
      id
      is_active
    }
  }
`

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: uuid!, $role: String!) {
    update_user_account_by_pk(
      pk_columns: { id: $userId }
      _set: { role: $role }
    ) {
      id
      role
    }
  }
`

export const CREATE_USER = gql`
  mutation CreateUser(
    $email: String
    $phone: String!
    $role: String!
    $password: String
    $firstName: String!
    $lastName: String!
    $studentId: String
    $gender: String
    $bloodGroup: String
    $department: uuid
    $batch: uuid
    $section: uuid
  ) {
    insert_user_account_one(
      object: {
        email: $email
        phone: $phone
        role: $role
        password: $password
        is_active: true
        profiles: {
          data: {
            first_name: $firstName
            last_name: $lastName
            student_id: $studentId
            gender: $gender
            blood_group: $bloodGroup
            department_id: $department
            batch_id: $batch
            section_id: $section
          }
        }
      }
    ) {
      id
      email
      phone
      role
      is_active
      created_at
      profiles {
        id
        first_name
        last_name
      }
    }
  }
`

// --- STUDENTS ---
export const GET_ALL_STUDENTS = gql`
  query GetAllStudents {
    user_profile(order_by: { created_at: desc }) {
      id
      user_id
      first_name
      last_name
      student_id
      department {
        code
        name
      }
      batch {
        name
      }
      section {
        name
      }
      user {
        email
        phone
        is_active
      }
    }
  }
`

export const GET_STUDENT = gql`
  query GetStudent($userId: uuid!) {
    user_profile(where: { user_id: { _eq: $userId } }) {
      id
      user_id
      first_name
      last_name
      student_id
      gender
      blood_group
      address
      department_id
      batch_id
      section_id
      user {
        email
        phone
      }
    }
  }
`

export const UPDATE_STUDENT_PROFILE = gql`
  mutation UpdateStudentProfile($userId: uuid!, $set: user_profile_set_input!) {
    update_user_profile(where: { user_id: { _eq: $userId } }, _set: $set) {
      affected_rows
      returning {
        id
      }
    }
  }
`

// --- FACULTY ---
export const GET_ALL_FACULTIES_LIST = gql`
  query GetAllFaculties {
    user_faculty(order_by: { created_at: desc }) {
      id
      first_name
      last_name
      designation
      faculty_id
      department {
        code
        name
      }
      user {
        email
        phone
        is_active
      }
    }
  }
`

export const GET_FACULTY = gql`
  query GetFaculty($userId: uuid!) {
    user_faculty(where: { user_id: { _eq: $userId } }) {
      id
      first_name
      last_name
      faculty_id
      designation
      description
      department_id
      user {
        email
        phone
      }
    }
  }
`

export const UPDATE_FACULTY_PROFILE = gql`
  mutation UpdateFacultyProfile($userId: uuid!, $set: user_faculty_set_input!) {
    update_user_faculty(where: { user_id: { _eq: $userId } }, _set: $set) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: uuid!) {
    delete_user_account_by_pk(id: $id) {
      id
    }
  }
`

export const SOFT_DELETE_USER_ACCOUNT = gql`
  mutation SoftDeleteUserAccount($id: uuid!) {
    update_user_account_by_pk(
      pk_columns: { id: $id }
      _set: { is_active: false, deleted_at: "now()" }
    ) {
      id
      is_active
      deleted_at
    }
  }
`

export const RESTORE_USER_ACCOUNT = gql`
  mutation RestoreUserAccount($id: uuid!) {
    update_user_account_by_pk(
      pk_columns: { id: $id }
      _set: { is_active: true, deleted_at: null }
    ) {
      id
      is_active
      deleted_at
    }
  }
`

export const UPDATE_USER_ACCOUNT = gql`
  mutation UpdateUserAccount($id: uuid!, $set: user_account_set_input!) {
    update_user_account_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`

export const GET_ALL_FACULTIES_FOR_PICKER = gql`
  query GetAllFacultiesForPicker {
    user_faculty(order_by: { first_name: asc, last_name: asc }, limit: 1000) {
      id
      user_id
      first_name
      last_name
      designation
    }
  }
`

export interface GetAllFacultiesForPickerData {
  user_faculty: {
    id: string
    user_id: string
    first_name: string
    last_name: string
    designation: string
  }[]
}

// Academic Management Operations

// --- DEPARTMENTS ---
export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    academic_department(order_by: { name: asc }) {
      id
      name
      code
      description
      is_active
      created_at
      updated_at
      head_user_id
      faculty_id
      faculty {
        id
        name
      }
      head_of_department {
        id
        email
        profiles {
          first_name
          last_name
        }
      }
    }
  }
`

export const GET_FACULTIES = gql`
  query GetFaculties {
    academic_faculty(order_by: { name: asc }) {
      id
      name
    }
  }
`

export const GET_DEPARTMENT = gql`
  query GetDepartment($id: uuid!) {
    academic_department_by_pk(id: $id) {
      id
      name
      code
      description
      is_active
      head_user_id
      faculty_id
      head_of_department {
        id
        email
        profiles {
          first_name
          last_name
        }
      }
    }
  }
`

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($object: academic_department_insert_input!) {
    insert_academic_department_one(object: $object) {
      id
      name
    }
  }
`

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($id: uuid!, $set: academic_department_set_input!) {
    update_academic_department_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
    }
  }
`

export const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: uuid!) {
    delete_academic_department_by_pk(id: $id) {
      id
    }
  }
`

export const GET_DEPARTMENTS_FOR_REGISTRATION = gql`
  query GetDepartmentsForRegistration {
    academic_department(
      order_by: { name: asc }
      where: { is_active: { _eq: true } }
    ) {
      id
      name
      code
    }
  }
`

export const GET_BATCHES_FOR_REGISTRATION = gql`
  query GetBatchesForRegistration($departmentId: uuid) {
    academic_batch(
      where: { departmant_id: { _eq: $departmentId }, is_active: { _eq: true } }
      order_by: { year: desc, name: asc }
    ) {
      id
      name
    }
  }
`

export const GET_SECTIONS_FOR_REGISTRATION = gql`
  query GetSectionsForRegistration($batchId: uuid) {
    academic_section(
      where: { batch_id: { _eq: $batchId }, is_active: { _eq: true } }
      order_by: { name: asc }
    ) {
      id
      name
    }
  }
`

// --- BATCHES ---
export const GET_BATCHES = gql`
  query GetBatches($departmentId: uuid) {
    academic_batch(
      where: { departmant_id: { _eq: $departmentId } }
      order_by: { year: desc, name: asc }
    ) {
      id
      name
      departmant_id
      current_semester
      year
      semester_count
      start_date
      end_date
      is_active
    }
  }
`

export const GET_ALL_BATCHES = gql`
  query GetAllBatches {
    academic_batch(order_by: { year: desc, name: asc }) {
      id
      name
      departmant_id
      department {
        name
        code
      }
      current_semester
      year
      semester_count
      start_date
      end_date
      is_active
    }
  }
`

export const GET_BATCH = gql`
  query GetBatch($id: uuid!) {
    academic_batch_by_pk(id: $id) {
      id
      name
      departmant_id
      current_semester
      year
      semester_count
      start_date
      end_date
      is_active
    }
  }
`

export const CREATE_BATCH = gql`
  mutation CreateBatch($object: academic_batch_insert_input!) {
    insert_academic_batch_one(object: $object) {
      id
      name
    }
  }
`

export const UPDATE_BATCH = gql`
  mutation UpdateBatch($id: uuid!, $set: academic_batch_set_input!) {
    update_academic_batch_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
    }
  }
`

export const DELETE_BATCH = gql`
  mutation DeleteBatch($id: uuid!) {
    delete_academic_batch_by_pk(id: $id) {
      id
    }
  }
`

// --- SECTIONS ---
export const GET_SECTIONS = gql`
  query GetSections($batchId: uuid) {
    academic_section(
      where: { batch_id: { _eq: $batchId } }
      order_by: { name: asc }
    ) {
      id
      name
      batch_id
      capacity
      is_active
    }
  }
`

export const GET_ALL_SECTIONS = gql`
  query GetAllSections {
    academic_section(order_by: { created_at: desc }) {
      id
      name
      batch_id
      batch {
        name
        department {
          name
        }
      }
      capacity
      is_active
    }
  }
`

export const GET_USER_SECTION = gql`
  query GetUserSection($userId: uuid!) {
    user_profile(where: { user_id: { _eq: $userId } }) {
      section_id
    }
  }
`

export const GET_SECTION = gql`
  query GetSection($id: uuid!) {
    academic_section_by_pk(id: $id) {
      id
      name
      batch_id
      capacity
      is_active
    }
  }
`

export const CREATE_SECTION = gql`
  mutation CreateSection($object: academic_section_insert_input!) {
    insert_academic_section_one(object: $object) {
      id
      name
    }
  }
`

export const UPDATE_SECTION = gql`
  mutation UpdateSection($id: uuid!, $set: academic_section_set_input!) {
    update_academic_section_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
    }
  }
`

export const DELETE_SECTION = gql`
  mutation DeleteSection($id: uuid!) {
    delete_academic_section_by_pk(id: $id) {
      id
    }
  }
`

// --- COURSES ---
export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    academic_course(order_by: { code: asc }) {
      id
      name
      code
      description
      credit_hours
      semester
      course_type
      syllabus_url
      is_active
      department_id
      department {
        name
        code
      }
    }
  }
`

export const GET_COURSE = gql`
  query GetCourse($id: uuid!) {
    academic_course_by_pk(id: $id) {
      id
      name
      code
      description
      credit_hours
      semester
      course_type
      syllabus_url
      is_active
      department_id
    }
  }
`

export const CREATE_COURSE = gql`
  mutation CreateCourse($object: academic_course_insert_input!) {
    insert_academic_course_one(object: $object) {
      id
      name
    }
  }
`

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: uuid!, $set: academic_course_set_input!) {
    update_academic_course_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
    }
  }
`

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: uuid!) {
    delete_academic_course_by_pk(id: $id) {
      id
    }
  }
`

// --- COURSE OFFERINGS ---
export const GET_COURSE_OFFERINGS_BY_SECTION = gql`
  query GetCourseOfferingsBySection($sectionId: uuid!) {
    academic_course_offering(
      where: { section_id: { _eq: $sectionId }, is_active: { _eq: true } }
      order_by: { created_at: desc }
    ) {
      id
      course_id
      batch_id
      section_id
      teacher_id
      academic_year
      is_active
      created_at
      updated_at
      course {
        id
        name
        code
        credit_hours
        course_type
        department {
          name
          code
        }
      }
      faculty {
        id
        first_name
        last_name
      }
      section {
        id
        name
        batch {
          id
          name
          year
        }
      }
    }
  }
`

export const GET_COURSE_OFFERING = gql`
  query GetCourseOffering($id: uuid!) {
    academic_course_offering_by_pk(id: $id) {
      id
      course_id
      batch_id
      section_id
      teacher_id
      academic_year
      is_active
      created_at
      updated_at
    }
  }
`

export const CREATE_COURSE_OFFERING = gql`
  mutation CreateCourseOffering(
    $object: academic_course_offering_insert_input!
  ) {
    insert_academic_course_offering_one(object: $object) {
      id
      course_id
      teacher_id
      academic_year
    }
  }
`

export const UPDATE_COURSE_OFFERING = gql`
  mutation UpdateCourseOffering(
    $id: uuid!
    $set: academic_course_offering_set_input!
  ) {
    update_academic_course_offering_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      course_id
      teacher_id
      academic_year
    }
  }
`

export const DELETE_COURSE_OFFERING = gql`
  mutation DeleteCourseOffering($id: uuid!) {
    delete_academic_course_offering_by_pk(id: $id) {
      id
    }
  }
`

export interface CourseOffering {
  id: string
  course_id: string
  batch_id: string
  section_id: string
  teacher_id: string
  academic_year: string
  is_active: boolean
  created_at: string
  updated_at: string
  course?: {
    id: string
    name: string
    code: string
    credit_hours: number
    course_type: string
    department?: {
      name: string
      code: string
    }
  }
  faculty?: {
    id: string
    first_name: string
    last_name: string
  }
  teacher?: {
    id: string
    email: string
    faculties?: Array<{
      first_name: string
      last_name: string
      designation: string
    }>
  }
  section?: {
    id: string
    name: string
    batch?: {
      id: string
      name: string
      year: number
    }
  }
}

export interface GetCourseOfferingsBySectionData {
  academic_course_offering: CourseOffering[]
}

export interface GetCourseOfferingData {
  academic_course_offering_by_pk: CourseOffering | null
}

// --- ROUTINES ---
export const GET_ROUTINES_BY_SECTION = gql`
  query GetRoutinesBySection($sectionId: uuid!) {
    event_routine(
      where: {
        course_offering: { section_id: { _eq: $sectionId } }
        is_active: { _eq: true }
      }
      order_by: { day_of_week: asc, start_time: asc }
    ) {
      id
      name
      course_offering_id
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
      metadata
      created_at
      updated_at
      course_offering {
        id
        academic_year
        course {
          id
          name
          code
          credit_hours
        }
        faculty {
          id
          first_name
          last_name
          user {
            email
          }
        }
      }
    }
  }
`

export const GET_ROUTINE = gql`
  query GetRoutine($id: uuid!) {
    event_routine_by_pk(id: $id) {
      id
      name
      course_offering_id
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
      metadata
      created_at
      updated_at
    }
  }
`

export const CREATE_ROUTINE = gql`
  mutation CreateRoutine($object: event_routine_insert_input!) {
    insert_event_routine_one(object: $object) {
      id
      name
      day_of_week
      start_time
      end_time
    }
  }
`

export const UPDATE_ROUTINE = gql`
  mutation UpdateRoutine($id: uuid!, $set: event_routine_set_input!) {
    update_event_routine_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
      day_of_week
      start_time
      end_time
    }
  }
`

export const DELETE_ROUTINE = gql`
  mutation DeleteRoutine($id: uuid!) {
    delete_event_routine_by_pk(id: $id) {
      id
    }
  }
`

export const CHECK_ROUTINE_CONFLICTS = gql`
  query CheckRoutineConflicts(
    $sectionId: uuid!
    $dayOfWeek: Int!
    $startTime: timetz!
    $endTime: timetz!
    $excludeRoutineId: uuid
  ) {
    section_conflicts: event_routine(
      where: {
        course_offering: { section_id: { _eq: $sectionId } }
        day_of_week: { _eq: $dayOfWeek }
        is_active: { _eq: true }
        id: { _neq: $excludeRoutineId }
        _or: [
          {
            _and: [
              { start_time: { _lte: $startTime } }
              { end_time: { _gt: $startTime } }
            ]
          }
          {
            _and: [
              { start_time: { _lt: $endTime } }
              { end_time: { _gte: $endTime } }
            ]
          }
          {
            _and: [
              { start_time: { _gte: $startTime } }
              { end_time: { _lte: $endTime } }
            ]
          }
        ]
      }
    ) {
      id
      name
      start_time
      end_time
      course_offering {
        course {
          code
          name
        }
      }
    }
  }
`

export interface Routine {
  id: string
  name: string
  course_offering_id: string | null
  day_of_week: number
  start_time: string
  end_time: string
  event_type: string
  effective_from: string
  effective_to: string
  is_active: boolean
  metadata?: any
  created_at: string
  updated_at: string
  course_offering?: {
    id: string
    academic_year: string
    course?: {
      id: string
      name: string
      code: string
      credit_hours: number
    }
    account?: {
      id: string
      email: string
      faculties?: Array<{
        first_name: string
        last_name: string
      }>
    }
  }
}

export interface GetRoutinesBySectionData {
  event_routine: Routine[]
}

export interface GetRoutineData {
  event_routine_by_pk: Routine | null
}

export interface CheckRoutineConflictsData {
  section_conflicts: Array<{
    id: string
    name: string
    start_time: string
    end_time: string
    course_offering?: {
      course?: {
        code: string
        name: string
      }
    }
  }>
}

// --- DEVICE TOKENS (Multi-Provider Notifications) ---
export const UPSERT_DEVICE_TOKEN = gql`
  mutation UpsertDeviceToken(
    $user_id: uuid!
    $device_id: String!
    $provider: String!
    $token: String!
    $platform: String!
  ) {
    insert_user_device_one(
      object: {
        user_id: $user_id
        device_id: $device_id
        provider: $provider
        token: $token
        platform: $platform
      }
      on_conflict: {
        constraint: device_user_id_device_id_provider_key
        update_columns: [token, last_used_at, is_active]
      }
    ) {
      id
      token
    }
  }
`

export const DEACTIVATE_DEVICE = gql`
  mutation DeactivateDevice(
    $user_id: uuid!
    $device_id: String!
    $provider: String!
  ) {
    update_user_device(
      where: {
        user_id: { _eq: $user_id }
        device_id: { _eq: $device_id }
        provider: { _eq: $provider }
      }
      _set: { is_active: false }
    ) {
      affected_rows
    }
  }
`

// ===== SCHEDULE EXCEPTIONS =====
export const CREATE_ROUTINE_EXCEPTION = gql`
  mutation CreateRoutineException(
    $object: event_routine_exception_insert_input!
  ) {
    insert_event_routine_exception_one(object: $object) {
      id
      routine_id
      exception_date
      reason
      type
    }
  }
`

export const GET_ROUTINE_EXCEPTIONS = gql`
  query GetRoutineExceptions($startDate: date!, $endDate: date!) {
    event_routine_exception(
      where: { exception_date: { _gte: $startDate, _lte: $endDate } }
    ) {
      id
      routine_id
      exception_date
      reason
      type
    }
  }
`

export interface RoutineException {
  id: string
  routine_id?: string
  exception_date: string
  reason: string
  type: string
}

// ===== EXAMS =====
export const GET_EXAMS = gql`
  query GetExams($sectionId: uuid!, $startDate: date!, $endDate: date!) {
    event_event(
      where: {
        event_type: { _eq: "exam" }
        date: { _gte: $startDate, _lte: $endDate }
        event_targets: {
          target_type: { _eq: "section" }
          target_id: { _eq: $sectionId }
        }
      }
      order_by: { date: asc, start_time: asc }
    ) {
      id
      title
      description
      date
      start_time
      end_time
      status
      metadata
      course_offering {
        course {
          code
          name
        }
      }
    }
  }
`

export interface Exam {
  id: string
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  status: string
  metadata?: any
  course_offering?: {
    course?: {
      code: string
      name: string
    }
  }
}

// ===== CUSTOM NOTIFICATIONS =====
export const SEND_CUSTOM_NOTIFICATION = gql`
  mutation SendCustomNotification($object: notification_log_insert_input!) {
    insert_notification_log_one(object: $object) {
      id
      title
      status
    }
  }
`

export const GET_MY_SENT_NOTIFICATIONS = gql`
  query GetMySentNotifications {
    notification_log(order_by: { created_at: desc }, limit: 50) {
      id
      title
      body
      target_type
      status
      sent_count
      created_at
    }
  }
`

export interface NotificationLog {
  id: string
  title: string
  body: string
  target_type: string
  status: string
  sent_count: number
  created_at: string
}

export interface GetMySentNotificationsData {
  notification_log: NotificationLog[]
}

// ===== USER PROFILE =====
export const GET_USER_PROFILE_FOR_NOTIFICATIONS = gql`
  query GetUserProfileForNotifications($userId: uuid!) {
    user_profile(where: { user_id: { _eq: $userId } }, limit: 1) {
      section_id
      batch_id
      department_id
    }
  }
`

export interface UserProfileForNotifications {
  section_id?: string
  batch_id?: string
  department_id?: string
}

export interface GetUserProfileForNotificationsData {
  user_profile: UserProfileForNotifications[]
}

// ===== USER NOTIFICATIONS =====
export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications(
    $sectionId: uuid
    $batchId: uuid
    $departmentId: uuid
  ) {
    notification_log(
      where: {
        _or: [
          { target_type: { _eq: "all" } }
          {
            _and: [
              { target_type: { _eq: "section" } }
              { target_id: { _eq: $sectionId } }
            ]
          }
          {
            _and: [
              { target_type: { _eq: "batch" } }
              { target_id: { _eq: $batchId } }
            ]
          }
          {
            _and: [
              { target_type: { _eq: "department" } }
              { target_id: { _eq: $departmentId } }
            ]
          }
        ]
      }
      order_by: { created_at: desc }
      limit: 50
    ) {
      id
      title
      body
      target_type
      target_id
      image_url
      data
      created_at
      status
      sent_count
    }
  }
`

export interface UserNotification {
  id: string
  title: string
  body: string
  target_type: string
  target_id: string
  image_url?: string
  data?: any
  created_at: string
  status: string
  sent_count: number
}

export interface GetUserNotificationsData {
  notification_log: UserNotification[]
}
