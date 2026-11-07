using Microsoft.AspNetCore.Authorization;

namespace UniSync.Api.Auth;

/// <summary>Named authorization policies. Scope checks (which department, which section) happen in handlers.</summary>
public static class Policies
{
    /// <summary>Role "admin". Handlers must still check the admin's managed department.</summary>
    public const string DepartmentAdmin = "department-admin";

    public static AuthorizationBuilder AddUniSyncPolicies(this AuthorizationBuilder builder) =>
        builder.AddPolicy(DepartmentAdmin, p => p.RequireAuthenticatedUser().RequireClaim(TokenService.RoleClaim, "admin"));
}
