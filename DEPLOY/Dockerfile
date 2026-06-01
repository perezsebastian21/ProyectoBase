# ============================================================
# Stage 1: BUILD
# Usa el SDK completo para restaurar dependencias y compilar.
# Esta imagen NO va al contenedor final.
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copiamos solo el .csproj primero para aprovechar el cache de capas:
# si no cambiaron las dependencias, dotnet restore no se vuelve a ejecutar.
COPY ./Backend/ProyectoBase.csproj ./Backend/
RUN dotnet restore ./Backend/ProyectoBase.csproj

# Copiamos el resto del código y publicamos en modo Release
COPY ./Backend ./Backend
RUN dotnet publish ./Backend/ProyectoBase.csproj -c Release -o /app/out

# ============================================================
# Stage 2: RUNTIME
# Imagen final liviana — solo el runtime de ASP.NET Core 10.
# Sin SDK, sin herramientas de compilación.
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

# Zona horaria Argentina
ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copiamos solo los binarios publicados desde el stage anterior
COPY --from=build /app/out .

# Render inyecta $PORT dinámicamente. Kestrel lo toma de ASPNETCORE_URLS.
# Si no hay $PORT (entorno local), usa 5000 por defecto.
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

CMD ["dotnet", "ProyectoBase.dll"]