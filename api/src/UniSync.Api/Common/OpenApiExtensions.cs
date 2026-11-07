namespace UniSync.Api.Common;

/// <summary>
/// Endpoints return IResult, which OpenAPI can't see through. Every endpoint
/// declares its envelope here so /openapi/v1.json fully describes the API and
/// typed clients can be generated from it.
/// </summary>
public static class OpenApiExtensions
{
    private static readonly int[] ErrorStatuses =
    [
        StatusCodes.Status400BadRequest, StatusCodes.Status401Unauthorized, StatusCodes.Status403Forbidden,
        StatusCodes.Status404NotFound, StatusCodes.Status409Conflict, StatusCodes.Status429TooManyRequests,
    ];

    /// <summary>Success envelope carrying <typeparamref name="T"/>, plus the standard error envelope.</summary>
    public static RouteHandlerBuilder Returns<T>(this RouteHandlerBuilder builder, int status = StatusCodes.Status200OK)
    {
        builder.Produces<ApiEnvelope<T>>(status);
        foreach (var error in ErrorStatuses)
        {
            builder.Produces<ApiEnvelope<object>>(error);
        }

        return builder;
    }
}
