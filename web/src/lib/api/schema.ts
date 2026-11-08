import type { components } from './generated'

/** Shapes from the API contract (api/openapi/v1.json). */
type S = components['schemas']

export type Me = S['MeResponse']
export type Department = S['DepartmentView']
export type Batch = S['BatchView']
export type Section = S['SectionView']
export type Course = S['CourseView']
export type Teacher = S['TeacherView']
export type Student = S['StudentView']
export type StudentImportRow = S['StudentImportRow']
export type StudentImportResult = S['StudentImportResult']
export type Offering = S['OfferingView']
export type Routine = S['RoutineView']
export type Building = S['BuildingView']
export type Room = S['RoomView']
export type AccessRequest = S['AccessRequestView']
export type AuthTokens = S['AuthTokens']

/**
 * Request bodies list every field as required-but-nullable. The API reads a
 * missing or null field as "leave it as it is", so partial updates are fine:
 * `body: fields({ isActive: false })`. (Send '' to clear an optional text.)
 * The body type comes from where it is used, so call it inline.
 */
export const fields = <T>(
  values: NoInfer<Partial<NonNullable<T>>>
): NonNullable<T> => values as NonNullable<T>
