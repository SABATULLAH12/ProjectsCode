using System.Configuration;
using System.Data.Entity;

namespace Dine.ReportContext
{
    public class ReportDbContext : DbContext
    {
        public ReportDbContext() : base(ConfigurationManager.AppSettings["ToolConn"])
        {

        }

        public DbSet<Slide> Slides { get; set; }
    }
}
