using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public abstract class GenericControllerAsync<T> : ControllerBase where T : class
    {
        protected readonly IServiceAsync<T> _service;

        protected GenericControllerAsync(IServiceAsync<T> service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public virtual async Task<ActionResult<ServiceResponse<IEnumerable<T>>>> GetAll()
        {
            var items = await _service.GetAll();
            return Ok(new ServiceResponse<IEnumerable<T>>(items));
        }

        [HttpGet("GetById")]
        public virtual async Task<ActionResult<ServiceResponse<T>>> GetById(int id)
        {
            var item = await _service.GetByID(id);
            return Ok(new ServiceResponse<T>(item));
        }

        [HttpGet("FindQP")]
        public virtual async Task<ActionResult<ServiceResponse<PagedResponse<T>>>> FindQP([FromQuery] QueryParams qp)
        {
            var items = await _service.FindBy(qp);
            var total = _service.Count(qp);

            var pagedResponse = new PagedResponse<T>(
                (List<T>)items,
                qp.page ?? 1,
                qp.limit ?? 10,
                total
            );

            return Ok(new ServiceResponse<PagedResponse<T>>(pagedResponse));
        }

        [HttpPost]
        public virtual async Task<ActionResult<ServiceResponse<T>>> Create([FromBody] T entity)
        {
            var newItem = await _service.Create(entity);
            return Ok(new ServiceResponse<T>(newItem));
        }

        [HttpPut]
        public virtual async Task<ActionResult<ServiceResponse<T>>> Update([FromBody] T entity)
        {
            var updatedItem = await _service.Update(entity);
            return Ok(new ServiceResponse<T>(updatedItem));
        }

        [HttpDelete("{id}")]
        public virtual async Task<ActionResult<ServiceResponse<object>>> Delete(int id)
        {
            await _service.Delete(id);
            return Ok(new ServiceResponse<object>(data: null));
        }
    }
}
