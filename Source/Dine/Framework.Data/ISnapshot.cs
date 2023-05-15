using Framework.Models;
using Framework.Models.Chart;
using Framework.Models.Snapshot;
using NextGen.Core.Models;
using System.Collections.Generic;
using System.Data;

namespace Framework.Data
{
    public interface ISnapshot : IDataAccess<FilterPanelMenu, WidgetInfo>
    {
        //get single widget information
        WidgetData GetSingleWidgetDetails(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter);

        //get all widget together
        WidgetData GetAllWidgetDetails(WidgetInfo filter, params object[] param);

        AnalysesInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module);
        AnalysesCrossDinerInfo GetCrossDinerOutputData(ViewConfiguration config, FilterPanelInfo[] filter);

        IEnumerable<Widgets> GetWidgets(params object[] param);

        IEnumerable<AdvancedFilterData> GetAdvanceFilterData();
    }
}
