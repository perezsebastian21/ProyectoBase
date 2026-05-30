using Microsoft.EntityFrameworkCore;
using ProyectoBase.DataAccess.Interfaces;
using ProyectoBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ProyectoBase.DataAccess.Servicios
{
    public class RepositoryAsync<T> : IRepositoryAsync<T> where T : class
    {
        private readonly ApplicationDbContext context;
        private bool disposed = false;

        public RepositoryAsync(ApplicationDbContext context)
        {
            this.context = context;
        }

        protected DbSet<T> EntitySet => context.Set<T>();

        public async Task<IEnumerable<T>> GetAll()
        {
            return await EntitySet.ToListAsync();
        }

        public async Task<T> GetByID(int? id)
        {
            return await EntitySet.FindAsync(id);
        }

        public async Task<T> Insert(T entity)
        {
            await EntitySet.AddAsync(entity);
            await Save();
            return entity;
        }

        public async Task<T> Delete(int id)
        {
            T entity = await EntitySet.FindAsync(id);
            if (entity != null)
            {
                EntitySet.Remove(entity);
                await Save();
            }
            return entity;
        }

        public async Task Update(T entity)
        {
            context.Entry(entity).State = EntityState.Modified;
            await Save();
        }

        public async Task<T> Find(Expression<Func<T, bool>> expr)
        {
            return await EntitySet.AsNoTracking().FirstOrDefaultAsync(expr);
        }

        public async Task<IEnumerable<TResult>> GetAllDTO<TResult>(
            Expression<Func<T, bool>> criterio,
            Expression<Func<T, TResult>> selector,
            bool? orderbydescending,
            PageInfo pageInfo,
            params Expression<Func<T, object>>[] order) where TResult : class
        {
            IQueryable<T> query = EntitySet.AsQueryable();

            if (criterio != null)
            {
                query = query.Where(criterio);
            }

            if (order != null && order.Length > 0)
            {
                IOrderedQueryable<T> ordenado;
                if (orderbydescending == true)
                {
                    ordenado = query.OrderByDescending(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ordenado.ThenByDescending(order[i]);
                    }
                }
                else
                {
                    ordenado = query.OrderBy(order[0]);
                    for (int i = 1; i < order.Length; i++)
                    {
                        ordenado = ordenado.ThenBy(order[i]);
                    }
                }
                query = ordenado;
            }

            IQueryable<TResult> queryFinal = selector != null 
                ? query.Select(selector) 
                : (IQueryable<TResult>)query;

            if (pageInfo != null)
            {
                queryFinal = queryFinal.Skip((pageInfo.Page - 1) * pageInfo.Limit).Take(pageInfo.Limit);
            }

            return await queryFinal.ToListAsync();
        }

        public int Count(Expression<Func<T, bool>> criterio)
        {
            return criterio != null 
                ? EntitySet.Where(criterio).Count() 
                : EntitySet.Count();
        }

        public async Task Save()
        {
            await context.SaveChangesAsync();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed && disposing)
            {
                context.Dispose();
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
