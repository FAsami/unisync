using Microsoft.AspNetCore.Diagnostics;

namespace UniSync.Api.Common;

/// <summary>Turns unhandled exceptions into the standard envelope. Never leaks exception details.</summary>
public sealed partial class EnvelopeExceptionHandler(ILogger<EnvelopeExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is BadHttpRequestException bad)
        {
            // Malformed JSON, wrong content type, missing body.
            await ApiResponse.WriteFailAsync(httpContext, bad.StatusCode, ErrorCodes.InvalidRequest, "The request body is missing or malformed.");
            return true;
        }

        LogUnhandled(logger, exception, httpContext.Request.Method, httpContext.Request.Path);
        await ApiResponse.WriteFailAsync(httpContext, StatusCodes.Status500InternalServerError, ErrorCodes.Internal, "Something went wrong. Please try again.");
        return true;
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled exception for {Method} {Path}")]
    private static partial void LogUnhandled(ILogger logger, Exception exception, string method, string path);
}
