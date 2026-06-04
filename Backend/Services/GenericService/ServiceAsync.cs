using ProyectoBase.DataAccess.Interfaces;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ProyectoBase.Services.GenericService
{
    public class ServiceAsync<T> : IServiceAsync<T> where T : class
    {
        protected readonly IRepositoryAsync<T> _repository;

        public ServiceAsync(IRepositoryAsync<T> repository)
        {
            _repository = repository;
        }

        public virtual async Task<IEnumerable<T>> GetAll()
        {
            return await _repository.GetAll();
        }

        public virtual async Task<T> GetByID(int id)
        {
            var entity = await _repository.GetByID(id);
            if (entity == null)
            {
                throw new NotFoundException($"Registro con ID {id} no encontrado en {typeof(T).Name}.");
            }
            return entity;
        }

        public virtual async Task<T> Create(T entity)
        {
            if (entity == null)
            {
                throw new BadRequestException("La entidad provista es nula.");
            }
            return await _repository.Insert(entity);
        }

        public virtual async Task<T> Update(T entity)
        {
            if (entity == null)
            {
                throw new BadRequestException("La entidad provista es nula.");
            }
            await _repository.Update(entity);
            return entity;
        }

        public virtual async Task Delete(int id)
        {
            var entity = await _repository.GetByID(id);
            if (entity == null)
            {
                throw new NotFoundException($"Registro con ID {id} no encontrado para eliminar en {typeof(T).Name}.");
            }
            await _repository.Delete(id);
        }

        public virtual async Task<IEnumerable<T>> FindBy(QueryParams qp)
        {
            var criterio = BuildCriterio(qp);
            var pageInfo = new PageInfo(qp.page ?? 1, qp.limit ?? 10);
            
            return await _repository.GetAllDTO(
                criterio,
                e => e,
                false,
                pageInfo,
                BuildOrder(qp)
            );
        }

        public virtual int Count(QueryParams qp)
        {
            var criterio = BuildCriterio(qp);
            return _repository.Count(criterio);
        }

        protected virtual Expression<Func<T, bool>> BuildCriterio(QueryParams qp)
        {
            return null; // Por defecto sin filtro
        }

        protected virtual Expression<Func<T, object>>[] BuildOrder(QueryParams qp)
        {
            return new Expression<Func<T, object>>[0]; // Por defecto sin orden específico
        }
    }
}
