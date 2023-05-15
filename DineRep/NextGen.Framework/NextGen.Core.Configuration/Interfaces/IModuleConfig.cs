using NextGen.Core.Models;
using Framework.Models;

namespace NextGen.Core.Configuration.Interfaces
{
    public interface IModuleConfig
    {
        string ActiveUserName { get; }
        ViewConfiguration GetInfo { get; }

        string BuildQuery(ViewConfigDatabase db);

        string GetMenuFilterQuery();

        object[] GetFactQuery(FilterPanelInfo[] filter, CustomPropertyLabel customFilter);

        object[] GetWidgetQuery(FilterPanelInfo[] filter, CustomPropertyLabel customFilter, string WidgetName);

        void Update(ViewFilter filter);

        void Update(ViewConfigProcedure filter);

        void Update(SnapshotWidgets[] widgets);
    }
}
