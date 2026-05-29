using ProyectoBase.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ProyectoBase.DataAccess.Interfaces
{
    public interface IRepositoryAsync<T> : IDisposable where T : class
    {
        Task<IEnumerable<T>> GetAll();
        Task<T> GetByID(int? id);
        Task<T> Insert(T entity);
        Task<T> Delete(int id);
        Task Update(T entity);
        Task<T> Find(Expression<Func<T, bool>> expr);
        Task<IEnumerable<TResult>> GetAllDTO<TResult>(
            Expression<Func<T, bool>> criterio,
            Expression<Func<T, TResult>> selector,
            bool? orderbydescending,
            PageInfo pageInfo,
            params Expression<Func<T, object>>[] order) where TResult : class;

        int Count(Expression<Func<T, bool>> criterio);
        Task Save();
    }
}
