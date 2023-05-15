namespace Framework.Models
{
    public class FilterPanelInfo
    {
        public FilterPanelData[] Data { get; set; }
        public object SelectedID { get; set; }
        public string Name { get; set; }
        public string MetricType { get; set; }
        public string SelectedText { get; set; }
        public string DemoAndTopFilters { get; set; }
        public string isTrendTable { get; set; }
        public string customBase { get; set; }
        public string statOption { get; set; }
        public string active_chart_type { get; set; }
        public string StatTest { get; set; }
        public string IsVisit { get; set; }
        public int trendGap { get; set; }
    }

    public class ColorCodeData
    {
        public string ColourCode { get; set; }
        public string Establishmentid { get; set; }
        public string MeasureId { get; set; }
        public string GroupsId { get; set; }
        public bool IsTrend { get; set; }
    }
}
