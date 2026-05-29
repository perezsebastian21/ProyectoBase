namespace ProyectoBase.Models
{
    public class QueryParams
    {
        public QueryParams()
        {
            page = 1;
            limit = 10;
        }

        public string searchString { get; set; }
        public int? page { get; set; }
        public int? limit { get; set; }
    }
}
