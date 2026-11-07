# Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Directory.Build.props Directory.Packages.props global.json ./
COPY src/UniSync.Api/UniSync.Api.csproj src/UniSync.Api/
RUN dotnet restore src/UniSync.Api/UniSync.Api.csproj
COPY src/ src/
COPY db/ db/
RUN dotnet publish src/UniSync.Api/UniSync.Api.csproj -c Release -o /app --no-restore

# Run (non-root user provided by the base image)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_CLI_TELEMETRY_OPTOUT=1
EXPOSE 8080
USER $APP_UID
# `docker run <image> migrate` applies schema changes and exits.
ENTRYPOINT ["dotnet", "UniSync.Api.dll"]
