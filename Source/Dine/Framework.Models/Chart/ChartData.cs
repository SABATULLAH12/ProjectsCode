using Framework.Models.Utility;
using System.Collections.Generic;

namespace Framework.Models.Chart
{
    public class ChartSeries
    {
        public string name { get; set; }//series name
        public ICollection<ChartData> data { get; set; }

        public int? SeriesSampleSize { get; set; }
    }

    public class ChartData
    {
        public string x { get; set; }
        public double? y { get; set; }
        public double? z { get; set; }
        public int? SampleSize { get; set; }
        //public double? StatValue
        //{
        //    get
        //    {
        //        return Calculation.GetStatValue(SampleSize, y == null ? y : y / 100, BenchMarkSampleSize, BenchMarkPercentage == null ? BenchMarkPercentage : BenchMarkPercentage);
        //    }
        //}

        public double? StatValue { get; set; }
        public int? BenchMarkSampleSize { get; set; }
        public double? BenchMarkPercentage { get; set; }
        public string ChartType { get; set; }
        public double? change { get; set; }
    }

    public class CalStatTestForExcel
    {
        public string Col1 { get; set; }
        public string Col2 { get; set; }
        public int? BenchMarkSampleSize { get; set; }
        public double? BenchMarkPercentage { get; set; }
    }
}