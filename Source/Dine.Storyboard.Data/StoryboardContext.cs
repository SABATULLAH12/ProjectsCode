using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    public class StoryboardContext : DbContext
    {
        public StoryboardContext() : base(ConfigurationManager.AppSettings["ToolConn"])
        {
        }

        public DbSet<SbReport> Reports { get; set; }
        public DbSet<SbSlide> Slides { get; set; }
        public DbSet<SbCustomDownload> CustomDownload { get; set; }

        public DbSet<SbSlideShare> SlideShare { get; set; }

        public DbSet<SbSlideNotes> SlideNotes { get; set; }
        public DbSet<SbUserGroup> UserGroup { get; set; }

        public DbSet<SbFavoriteReport> Favorites { get; set; }
    }
}