using Framework.Models;
using Framework.Models.DashBoard;
using NextGen.Core.Models;
using System.Collections.Generic;
using System.Data;
using System.Web;

namespace Framework.Data
{
    public interface IDashBoard : IDataAccess<FilterPanelMenu, DashBoardInfo>
    {
        DataSet GetOutputDataTable(params object[] param);
        string ExportToFullDashboardPPT(string filepath,string destFile, FilterPanelInfo[] filter, HttpContextBase context);
        DashBoardInfo GetOutputData(FilterPanelInfo[] filter);
        DashBoardInfo GetOutputDataForDemogpcs(FilterPanelInfo[] filter);
        string SaveorGetUserFilters(FilterPanelInfo[] filter,string filtermode, string userid,int dashboardType);
        
        IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData);

    }
}
