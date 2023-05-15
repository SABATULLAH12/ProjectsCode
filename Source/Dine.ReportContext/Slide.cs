using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dine.ReportContext
{
    [Table("Report_Slide")]
    public class Slide
    {
        [Key]
        public int SlideNo { get; set; }
        public string SlideName { get; set; }
        public bool IsFixed { get; set; }
        public string ReportName { get; set; }
        public int OrderBy { get; set; }
        public int HeaderCategory { get; set; }

    }
}