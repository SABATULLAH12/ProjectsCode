using Framework.Models.Utility;
using System.Collections.Generic;

namespace Framework.Models.Snapshot
{
    public class ChartSeries
    {
        public string name { get; set; }//series name
        public ICollection<AnalysesData> data { get; set; }

        public int? SeriesSampleSize { get; set; }
    }

    public class AnalysesData
    {
        public string x { get; set; }
        public double? y { get; set; }
        public double? z { get; set; }
        public double? AVG { get; set; }
        public int? SampleSize { get; set; }
        public int? TotalSampleSize { get; set; }

        public int? StatSampleSize { get; set; }
        public double? StatValue { get; set; }
        //public double? StatValue
        //{
        //    get
        //    {
        //        return Calculation.GetStatValue(TotalSampleSize, y == null ? y : y / 100, StatSampleSize, StatSampleSize == null ? AVG : AVG / 100);
        //    }
        //}
        public int? comparisonSampleSize { get; set; }
        public double? comparisonPercentage { get; set; }
    }
}