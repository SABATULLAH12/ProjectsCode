using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Framework.Models
{
    public class StoryBoardFilterInfo
    {
        public FilterPanelInfo[] Filter { get; set; }
        public string ChartType { get; set; }
        public bool IsStatTest { get; set; }
        public string Module { get; set; }
        public string StatID { get; set; }
        public string StatText { get; set; }
        public string ReportName { get; set; }
        public string Comment { get; set; }
        public int ReportID { get; set; }
        public int SlideID { get; set; }
        public string Image { get; set; }
        public string TimePeriodType { get; set; }
        //pit or trend
        public string TimePeriodText { get; set; }
        public string ToTimePeriod { get; set; }
        public string FromTimePeriod { get; set; }
        public string infoPanel { get; set; }
        public StoryBoardSlideData OutputData { get; set; }
        public string IsVisit { get; set; }
        
    }

    public class StoryBoardSlideData
    {
        public DataTable Data { get; set; }
        public string XColumn { get; set; }
        public string YColumn { get; set; }
        public string SerisColumn { get; set; }
        public string ChartType { get; set; }
        public string StatText { get; set; } 
    }

    public class ExportToExcel
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
