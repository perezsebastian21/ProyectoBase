using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;
using System;
using System.Net;
using System.Threading.Tasks;

namespace ProyectoBase.Utility
{
    public class GlobalErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalErrorHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError; // 500 si no se identifica
            string message = "Ocurrió un error interno en el servidor.";

            if (exception is BadRequestException)
            {
                code = HttpStatusCode.BadRequest;
                message = exception.Message;
            }
            else if (exception is NotFoundException)
            {
                code = HttpStatusCode.NotFound;
                message = exception.Message;
            }
            else if (exception is UnauthorizedAccessException)
            {
                code = HttpStatusCode.Unauthorized;
                message = "Acceso no autorizado.";
            }

            var response = new ServiceResponse<object>(success: false, errorMessage: message);
            var result = JsonConvert.SerializeObject(response);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            return context.Response.WriteAsync(result);
        }
    }
}
