using System.Collections.Generic;
using System.Data;

namespace Framework.Models.Snapshot
{
    public class AnalysesInfo
    {
        public IList<ChartSeries> Series { get; set; }
        public List<string> establishmentWithNulls { get; set; }
        public int NoOfEstablishment { get; set; }
        public List<RData> rData { get; set; }
    }

    public class RData {
        public string name { get; set; }
        public string x { get; set; }
        public string y { get; set; }
    }
    public class SampleSizeListCrossDiner
    {
        public string CompareName { get; set; }
        public string MetricName { get; set; }
        public int? SampleSize { get; set; }
    }
    public class AnalysesCrossDinerInfo
    {
        public GetTableDataResponse GetTableDataResopnse { get; set; }
    }

    public class GetTableDataResponse
    {
        public List<GetTableDataRespList> GetTableDataRespDt { get; set; }
    }
    public class GetTableDataRespList
    {
        public string MetricName { get; set; }
        public string MetricParentName { get; set; }
        public string EstablishmentName { get; set; }
        public double? MetricValue { get; set; }
        public int? SampleSize { get; set; }
        public double? StatSamplesize { get; set; }
        public int IsRestaurant { get; set; }
        public int ChannelFlag { get; set; }
        public string CompareName { get; set; }
        public int IsRestRetailer { get; set; }
    }
}