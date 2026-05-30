using System;
using System.Collections.Generic;

namespace ProyectoBase.Models
{
    public class PagedResponse<T> where T : class
    {
        public PagedResponse()
        {
            data = new List<T>();
        }

        public PagedResponse(List<T> data, int page, int limit, int totalRows)
        {
            this.data = data;
            this.Page = page;
            this.Limit = limit;
            this.TotalRows = totalRows;
            this.TotalPage = limit > 0 ? (int)Math.Ceiling((double)totalRows / limit) : 0;
        }

        public List<T> data { get; set; }
        public int Page { get; set; }
        public decimal Limit { get; set; }
        public int TotalRows { get; set; }
        public int TotalPage { get; set; }
    }
}
