namespace Dine.Models.Report
{
    public class RSlide
    {
        public int SlideNo { get; set; }
        public string SlideName { get; set; }
        public bool IsFixed { get; set; }
        public string ReportName { get; set; }
        public int OrderBy { get; set; }
        public int HeaderCategory { get; set; }
    }
}