using System.Collections.Generic;

namespace Framework.Models.Chart
{
    public class ChartSeries
    {
        public string name { get; set; }//series name
        public ICollection<ChartData> data { get; set; }
    }

    public class ChartData
    {
        public string x { get; set; }
        public double? y { get; set; }
        public double? z { get; set; }
    }
}