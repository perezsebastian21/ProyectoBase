using ProyectoBase.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectoBase.Services
{
    public interface IServiceAsync<T> where T : class
    {
        Task<IEnumerable<T>> GetAll();
        Task<T> GetByID(int id);
        Task<T> Create(T entity);
        Task<T> Update(T entity);
        Task Delete(int id);
        Task<IEnumerable<T>> FindBy(QueryParams qp);
        int Count(QueryParams qp);
    }
}
