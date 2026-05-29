# Plan de Implementación y Arquitectura del Proyecto de Pruebas Unitarias

Este documento define la estructura, componentes y metodología de pruebas unitarias adoptada para **ProyectoBase** utilizando **xUnit**, **FluentAssertions** y **Moq**.

---

## 1. Arquitectura del Proyecto de Pruebas

El proyecto de pruebas se ha estructurado como un proyecto independiente llamado **`ProyectoBase.Tests`** dentro de la carpeta raíz de la aplicación. 

### 1.1 Stack de Pruebas Seleccionado

* **xUnit (v2.9.2)**: Framework de pruebas unitarias estándar para .NET. Define el ciclo de vida de los tests, las teorías y la ejecución paralela.
* **FluentAssertions (v7.0.0)**: Biblioteca de aserciones que permite escribir tests más legibles y expresivos mediante un estilo de sintaxis fluido (`result.Should().NotBeNull()`).
* **Moq (v4.20.72)**: Biblioteca para simular dependencias e interfaces (mocks), aislando la lógica del componente bajo prueba (ej. simular el comportamiento de `IRepositoryAsync<T>`).

---

## 2. Configuración y Dependencias (`ProyectoBase.Tests.csproj`)

El archivo del proyecto contiene las siguientes dependencias de paquetes NuGet esenciales y la referencia al proyecto principal de la Web API:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>disable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageReference Include="xunit" Version="2.9.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="FluentAssertions" Version="7.0.0" />
    <PackageReference Include="Moq" Version="4.20.72" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\ProyectoBase.csproj" />
  </ItemGroup>

</Project>
```

---

## 3. Ejemplo de Prueba de Servicio (`ServiceAsyncTests.cs`)

Para ilustrar el patrón de mocking y aserciones, se ha creado una clase de prueba para el servicio genérico `ServiceAsync<T>` utilizando la entidad `Persona`:

```csharp
using Moq;
using FluentAssertions;
using Xunit;
using ProyectoBase.Services;
using ProyectoBase.DataAccess.Interfaces;
using ProyectoBase.Models;
using ProyectoBase.Exceptions;
using System;
using System.Threading.Tasks;

namespace ProyectoBase.Tests.Services
{
    public class ServiceAsyncTests
    {
        private readonly Mock<IRepositoryAsync<Persona>> _mockRepository;
        private readonly ServiceAsync<Persona> _service;

        public ServiceAsyncTests()
        {
            _mockRepository = new Mock<IRepositoryAsync<Persona>>();
            _service = new ServiceAsync<Persona>(_mockRepository.Object);
        }

        [Fact]
        public async Task GetByID_WhenEntityExists_ShouldReturnEntity()
        {
            // Arrange
            var personaId = 1;
            var expectedPersona = new Persona 
            { 
                IDPersona = personaId, 
                Nombre = "Juan", 
                Apellido = "Perez",
                FechaNacimiento = new DateTime(1990, 5, 20),
                Dni = "12345678",
                Email = "juan.perez@example.com"
            };
            _mockRepository.Setup(r => r.GetByID(personaId)).ReturnsAsync(expectedPersona);

            // Act
            var result = await _service.GetByID(personaId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEquivalentTo(expectedPersona);
            _mockRepository.Verify(r => r.GetByID(personaId), Times.Once);
        }

        [Fact]
        public async Task GetByID_WhenEntityDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var personaId = 99;
            _mockRepository.Setup(r => r.GetByID(personaId)).ReturnsAsync((Persona)null);

            // Act
            Func<Task> act = async () => await _service.GetByID(personaId);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage($"Registro con ID {personaId} no encontrado en Persona.");
        }
    }
}
```

---

## 4. Ejecución de Pruebas

Para ejecutar las pruebas en tu entorno de desarrollo, utiliza los siguientes comandos:

1. **Compilar el proyecto de pruebas**:
   ```bash
   dotnet build
   ```
2. **Ejecutar todos los tests**:
   ```bash
   dotnet test
   ```
