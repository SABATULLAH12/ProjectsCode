using Framework.Models;
using Framework.Models.Table;
using NextGen.Core.Models;
using System.Collections.Generic;
using System.Data;

namespace Framework.Data
{
    public interface ITable : IDataAccess<FilterPanelMenu, TableInfo>
    {
        //DataSet GetOutputData(params object[] param);

        TableInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module,string timePeriodType);
        IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData);
    }
}
