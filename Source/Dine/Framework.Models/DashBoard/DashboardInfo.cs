using System.Collections.Generic;

namespace Framework.Models.DashBoard
{
    public class DashBoardInfo
    {
        public GetDashboardDataResp GetDashboardDataresp { get; set; }
        
    }

    public class GetDashboardDataResp
    {
        public List<GetDashboardDataRespLst> GetDashboardDataRespdt { get; set; }

    }
    public class GetDashboardDataRespLst
    {
        public string MetricName { get; set; }
        public string EstablishmentName { get; set; }
        public string DemofilterName { get; set; }
        public string Month_Year { get; set; }
        public double? MetricValue { get; set; }
        public double? TotalSamplesize { get; set; }
        public double? Significancevalue { get; set; }
        public double? Change { get; set; }
        public double? Skew { get; set; }
        public string EstType { get; set; }
        public int Flag { get; set; }
        public int isHighest { get; set; }
        public int StatSampleSize { get; set; }
    }
}