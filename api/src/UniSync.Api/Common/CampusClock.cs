using Microsoft.Extensions.Options;
using UniSync.Api.Configuration;

namespace UniSync.Api.Common;

/// <summary>
/// "Now" and "today" on campus. The timetable is written in campus-local time,
/// so every date and time comparison goes through this, never through UTC.
/// </summary>
public sealed class CampusClock(TimeProvider time, IOptions<CampusOptions> options)
{
    private readonly TimeZoneInfo _zone = TimeZoneInfo.FindSystemTimeZoneById(options.Value.TimeZone);

    public DateTimeOffset Now => TimeZoneInfo.ConvertTime(time.GetUtcNow(), _zone);

    public DateOnly Today => DateOnly.FromDateTime(Now.DateTime);

    public TimeOnly TimeOfDay => TimeOnly.FromDateTime(Now.DateTime);
}
