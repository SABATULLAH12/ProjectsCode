using System.Collections.Generic;

namespace Framework.Models
{
    public class PanelInfo
    {
        public string Label { get; set; }
        public bool IsMultiSelect { get; set; }
        public bool IsRequired { get; set; }
        public string Image { get; set; }
        public IList<PanelList> PanelPopup { get; set; }
        public bool IsTimeperiod { get; set; }
        public bool IsFilterBasedOnOtherFilter { get; set; }
        public IList<TimePeriod> Time { get; set; }
    }
}
