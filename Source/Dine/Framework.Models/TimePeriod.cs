using System.Collections.Generic;

namespace Framework.Models
{
    public class TimePeriod
    {
        public string Interval { get; set; }
        public IList<TimeperiodYear> Years { get; set; }
    }
}
