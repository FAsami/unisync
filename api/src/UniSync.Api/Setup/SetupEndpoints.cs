namespace UniSync.Api.Setup;

/// <summary>
/// Department setup on web (UX review: "web for setup, mobile for day-of-class
/// actions"). Department admins manage their own department; rooms are shared.
/// </summary>
public static class SetupEndpoints
{
    public static RouteGroupBuilder MapSetupEndpoints(this RouteGroupBuilder api)
    {
        api.MapDepartmentSetupEndpoints();
        api.MapCourseSetupEndpoints();
        api.MapTeacherSetupEndpoints();
        api.MapStudentSetupEndpoints();
        api.MapOfferingSetupEndpoints();
        api.MapRoutineSetupEndpoints();
        api.MapVenueEndpoints();
        return api;
    }
}
