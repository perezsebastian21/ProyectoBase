FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS runtime

WORKDIR /app

# --- FIX PARA REPOSITORIOS OBSOLETOS DE DEBIAN ---
# Esto redirige las consultas de apt a archive.debian.org para que sigan funcionando
RUN sed -i 's/deb.debian.org/archive.debian.org/g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org/debian-security|archive.debian.org/debian-security|g' /etc/apt/sources.list && \
    sed -i '/stretch-updates/d' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list

# 1. Preparación de dependencias iniciales y Certificados
COPY ./certs/ ./certs/
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg2 \
    && cp /app/certs/fortigate.crt /usr/local/share/ca-certificates/ \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Configuración de Repositorios Externos (Microsoft y Node.js)
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && curl -s https://deb.nodesource.com/setup_18.x | bash -

# 3. Instalación de Nginx, Drivers SQL y librerías gráficas
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y --no-install-recommends \
    nginx \
    msodbcsql17 \
    unixodbc-dev \
    libgdiplus \
    libc6-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 4. Copia de archivos de la aplicación
COPY /publish/ ./

# 5. Configuración de Zona Horaria (Argentina)
ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone 

# 6. Scripts de inicio y configuración de Nginx
RUN rm -f /app/startup.sh
COPY startup.sh /app/
RUN chmod 755 /app/startup.sh

RUN rm -f /etc/nginx/nginx.conf
COPY ["build", "/usr/share/nginx/html"]
COPY ["nginx.conf", "/etc/nginx/nginx.conf"]

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 80

CMD ["sh", "/app/startup.sh"]