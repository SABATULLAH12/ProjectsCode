
namespace Framework.Models.Snapshot
{
    public class WidgetInfo
    {
        public string WidgetName { get; set; }
        public string WidgetId { get; set; }
        public EWidgetType WidgetType { get; set; }
    }

    public enum EWidgetType { Table = 0, LineChart = 1, BarChart = 2, ColumnChart = 3, Visualization = 4 }
}