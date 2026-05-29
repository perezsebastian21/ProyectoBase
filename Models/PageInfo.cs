namespace ProyectoBase.Models
{
    public class PageInfo
    {
        public PageInfo()
        {
            Page = 1;
            Limit = 10;
        }

        public PageInfo(int page, int limit)
        {
            Page = page <= 0 ? 1 : page;
            Limit = limit <= 0 ? 10 : limit;
        }

        public int Page { get; set; }
        public int Limit { get; set; }
    }
}
