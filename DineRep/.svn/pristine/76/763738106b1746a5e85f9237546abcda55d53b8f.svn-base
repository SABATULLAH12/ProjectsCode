using Framework.Models;
using Framework.Models.Snapshot;
using System.Collections.Generic;

namespace Framework.Data
{
    public interface ISnapshot : IDataAccess<FilterPanelMenu, WidgetInfo>
    {
        //get single widget information
        WidgetData GetSingleWidgetDetails(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter);

        //get all widget together
        WidgetData GetAllWidgetDetails(WidgetInfo filter, params object[] param);

        IEnumerable<Widgets> GetWidgets(params object[] param);
    }
}
