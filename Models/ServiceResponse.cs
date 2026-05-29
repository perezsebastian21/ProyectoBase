namespace ProyectoBase.Models
{
    public class ServiceResponse<T>
    {
        public ServiceResponse()
        {
            Success = true;
        }

        public ServiceResponse(T data)
        {
            Success = true;
            Data = data;
        }

        public ServiceResponse(bool success, string errorMessage)
        {
            Success = success;
            ErrorMessage = errorMessage;
        }

        public T Data { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
    }
}
