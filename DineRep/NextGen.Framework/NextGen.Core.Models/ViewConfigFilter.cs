namespace NextGen.Core.Models
{
    public class ViewConfigFilter
    {
        public int OrderNumber { get; set; }
        public string Label { get; set; }
        public bool IsMultiSelect { get; set; }
        public bool IsRequired { get; set; }
        public string Image { get; set; }
        public bool IsTimePeriod { get; set; }
        public bool HideTrend { get; set; }
        public ViewConfigDatabase Database { get; set; }

        #region Dynamic filter
        public bool IsFilterBasedOnOtherFilter { get; set; }
        public ViewConfigProcedureParam[] Parameters { get; set; }
        #endregion
    }
}
