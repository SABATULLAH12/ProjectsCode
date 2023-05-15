using Framework.Models;
using Framework.Models.Chart;
using NextGen.Core.Models;
using System.Collections.Generic;
using System.Data;
using System;

namespace Framework.Data
{
    public interface IChart : IDataAccess<FilterPanelMenu, ChartInfo>
    {
        DataSet GetOutputDataTable(params object[] param);

        ChartInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module, string timePeriodType, string UserId);

        DataTable GetDataTable(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module, string timePeriodType, string toTimePeriod, string fromTimePeriod, string UserId);

        Int32 SaveChangedColorCodes(DataTable colorTable, bool IsBeverageModule);

        string ValidatePalletteColor(DataTable colorTable, bool IsBeverageModule);

        IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData);

    }
}
