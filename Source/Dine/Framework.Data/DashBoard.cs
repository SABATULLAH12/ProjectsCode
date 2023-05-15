using AqUtility.Cached;
using NextGen.Core.Configuration;
using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.DashBoard;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System;
using System.Web.Script.Serialization;
using System.Web;

namespace Framework.Data
{
    public class DashBoard : BaseChart,IDashBoard
    {
        public DashBoard() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }

        public DashBoard(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public new virtual FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new virtual DashBoardInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            return null;
        }
        public string ExportToFullDashboardPPT(string filepath, string destFile, FilterPanelInfo[] filter, HttpContextBase context) {
            return null;
        }

        public DashBoardInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module, string timePeriodType)
        {
            DashBoardInfo info = null;
            
            return info;
        }

        public new virtual DataSet GetOutputDataTable(params object[] param)
        {
            return base.GetOutputDataTable(param);
        }

        public string SaveorGetUserFilters(FilterPanelInfo[] filter,string filtermode,string userid,int dashboardType)
        {
            string spName = "", selectedfilter = ""; string result="";
            spName = "USP_Dashboard_Selections";
            selectedfilter = new JavaScriptSerializer().Serialize(filter);
            object[] param = new object[1];
            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@UserId", SqlDbType.VarChar, userid ?? string.Empty);
                database.AddInParameter(cmd, "@FilterString", SqlDbType.VarChar, selectedfilter ?? string.Empty);
                database.AddInParameter(cmd, "@in_Or_Out", SqlDbType.VarChar, filtermode ?? string.Empty);
                database.AddInParameter(cmd, "@Dashboard_type", SqlDbType.VarChar, dashboardType);
                cmd.CommandTimeout = 300;

                var ds = database.ExecuteDataSet(cmd);
                if (ds == null)
                    return result;
                else
                {
                    if (ds.Tables[0].Rows.Count > 0)
                        result = ds.Tables[0].Rows[0]["FILTERS"].ToString();
                }
                return result;
            }
        }

        public DashBoardInfo GetOutputData(FilterPanelInfo[] filter)
        {
            DashBoardInfo dashbrdInfo = null;
            object[] param = new object[9];
            string spName = "";
            spName = "USP_DashBoard_P2P";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            //param[3] = filter.FirstOrDefault(x => x.Name == "Demographic Filters")?.SelectedID;//demofilter
            param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" ||  x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" ||  x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            param[4] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest
            param[5] = filter.FirstOrDefault(x => x.Name == "SKew_Or_Highestpercent")?.SelectedID;//Is_HighestPercentage
            param[6] = filter.FirstOrDefault(x => x.Name == "Frequency Filters")?.SelectedID;//frequency
            param[7]= filter.FirstOrDefault(x => x.MetricType == "Advanced Filters Custom Base" || x.Name == "Advanced Filters Custom Base" )?.SelectedID;
            param[8] = filter.FirstOrDefault(x => x.Name == "Frequency Filters Custom Base")?.SelectedID;

            if (param[6] != null)
            {
                if (param[6].ToString() == "6")
                    param[6] = "";
            }
            if (param[3] == null)
                param[3] = param[6] == null ? "" : param[6];
            else
                param[3] = param[3] + "|" + param[6];


            if (param[8] != null)
            {
                if (param[8].ToString() == "6")
                    param[8] = "";
            }
            if (param[7] == null)
                param[7] = param[8] == null ? "" : param[8];
            else
                param[7] = param[7] + "|" + param[8];


            var cachename = spName + " " + string.Join(",", param);
            dashbrdInfo = CachedQuery<DashBoardInfo>.Cache.GetData(cachename);

            if (dashbrdInfo != null)
                return dashbrdInfo;

            dashbrdInfo = new DashBoardInfo();

            var response=new  GetDashboardDataResp();
            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@Is_HighestPercentage", SqlDbType.Bit, param[5] ?? 1);
                database.AddInParameter(cmd, "@CustomBaseFilterId", SqlDbType.VarChar, param[7] ?? string.Empty);
                cmd.CommandTimeout = 3000;
                using (IDataReader dr = database.ExecuteReader(cmd))
                {
                    var getDashboardResp = new List<GetDashboardDataRespLst>();
                    while (dr.Read())
                    {
                        #region Bind data to list
                        var getDashboardResplst = new GetDashboardDataRespLst();
                        double metricvalue = 0.0, statvalue = 0.0, significancevalue = 0.0, change = 0.0,skew=0.0 ; int sampleSize = 0;
                        if (!double.TryParse(Convert.ToString(dr["MetricValue"]), out metricvalue)) metricvalue = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["SignificanceValue"]), out significancevalue)) significancevalue = 0.0;
                        if (!int.TryParse(Convert.ToString(dr["TotalSampleSize"]), out sampleSize)) sampleSize = 0;
                        if (!double.TryParse(Convert.ToString(dr["Change"]), out change)) change = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["Skew"]), out skew)) skew = 0.0;

                        getDashboardResplst.EstType = dr["Estcolumn"].ToString();
                        getDashboardResplst.MetricName = dr["Metricname"].ToString();
                        getDashboardResplst.EstablishmentName = dr["EstablishmentName"].ToString();
                        getDashboardResplst.DemofilterName = dr["DemoFilterName"].ToString();
                        getDashboardResplst.Month_Year = dr["Month_Year"].ToString();
                        getDashboardResplst.MetricValue = dr["MetricValue"] == DBNull.Value ? null : (double?)metricvalue;
                        getDashboardResplst.TotalSamplesize = dr["TotalSampleSize"] == DBNull.Value ? null : (int?)sampleSize;
                        getDashboardResplst.Significancevalue = dr["SignificanceValue"] == DBNull.Value ? null : (double?)significancevalue;
                        getDashboardResplst.Change = dr["Change"] == DBNull.Value ? null : (double?)change;
                        getDashboardResplst.Skew = dr["Skew"] == DBNull.Value ? null : (double?)skew;
                        getDashboardResplst.isHighest = dr["IsHighestFlag"] == DBNull.Value ? 0 : Convert.ToInt32(dr["IsHighestFlag"]);
                        getDashboardResplst.StatSampleSize = dr["StatSampleSize"] == DBNull.Value ? 0 : Convert.ToInt32(dr["StatSampleSize"]);

                        getDashboardResp.Add(getDashboardResplst);
                        #endregion
                    }
                    response.GetDashboardDataRespdt = getDashboardResp;
                }
               dashbrdInfo.GetDashboardDataresp = response;
                if (dashbrdInfo.GetDashboardDataresp != null)
                    CachedQuery<DashBoardInfo>.Cache.SetData(cachename, dashbrdInfo);
                return dashbrdInfo;
            }
        }
        public DashBoardInfo GetOutputDataForDemogpcs(FilterPanelInfo[] filter)
        {
            DashBoardInfo dashbrdInfo = null;
            object[] param = new object[9];
            string spName = "";
            spName = "USP_Dashboard_Demographics";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            //param[3] = filter.FirstOrDefault(x => x.Name == "Demographic Filters")?.SelectedID;//demofilter
            param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            param[4] = filter.FirstOrDefault(x => x.Name == "Frequency Filters")?.SelectedID;//stattsest
            param[5] = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID ?? 0;//visits/guest
            param[6] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest
            param[7] = filter.FirstOrDefault(x => x.Name == "SKew_Or_Highestpercent")?.SelectedID;//Is_HighestPercentage

            var cachename = spName + " " + string.Join(",", param);
            dashbrdInfo = CachedQuery<DashBoardInfo>.Cache.GetData(cachename);

            if (dashbrdInfo != null)
                return dashbrdInfo;

            dashbrdInfo = new DashBoardInfo();

            var response = new GetDashboardDataResp();
            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@IsVisit", SqlDbType.VarChar, param[5] ?? 0);
                database.AddInParameter(cmd, "@IsSkew", SqlDbType.Bit, param[7] ?? 1);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[6] ?? string.Empty);
                //database.AddInParameter(cmd, "@Is_HighestPercentage", SqlDbType.Bit, param[5] ?? 1);
                cmd.CommandTimeout = 3000;
                using (IDataReader dr = database.ExecuteReader(cmd))
                {
                    var getDashboardResp = new List<GetDashboardDataRespLst>();
                    while (dr.Read())
                    {
                        #region Bind data to list
                        var getDashboardResplst = new GetDashboardDataRespLst();
                        double metricvalue = 0.0, statvalue = 0.0, significancevalue = 0.0, change = 0.0, skew = 0.0; int sampleSize = 0, flag = 0;
                        if (!double.TryParse(Convert.ToString(dr["MetricValue"]), out metricvalue)) metricvalue = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["SignificanceValue"]), out significancevalue)) significancevalue = 0.0;
                        if (!int.TryParse(Convert.ToString(dr["TotalSampleSize"]), out sampleSize)) sampleSize = 0;
                        if (!double.TryParse(Convert.ToString(dr["Change"]), out change)) change = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["Skew"]), out skew)) skew = 0.0;
                        if (!int.TryParse(Convert.ToString(dr["Flag"]), out flag)) flag = 0;

                        //getDashboardResplst.EstType = dr["Estcolumn"].ToString();
                        getDashboardResplst.MetricName = dr["Metricname"].ToString();
                        getDashboardResplst.EstablishmentName = dr["EstablishmentName"].ToString();
                        getDashboardResplst.DemofilterName = dr["DemoFilterName"].ToString();
                        //getDashboardResplst.Month_Year = dr["Month_Year"].ToString();
                        getDashboardResplst.MetricValue = dr["MetricValue"] == DBNull.Value ? null : (double?)metricvalue;
                        getDashboardResplst.TotalSamplesize = dr["TotalSampleSize"] == DBNull.Value ? null : (int?)sampleSize;
                        getDashboardResplst.Significancevalue = dr["SignificanceValue"] == DBNull.Value ? null : (double?)significancevalue;
                        getDashboardResplst.Change = dr["Change"] == DBNull.Value ? null : (double?)change;
                        getDashboardResplst.Skew = dr["Skew"] == DBNull.Value ? null : (double?)skew;
                        getDashboardResplst.Flag = flag;
                        getDashboardResp.Add(getDashboardResplst);
                        #endregion
                    }
                    response.GetDashboardDataRespdt = getDashboardResp;
                }
                dashbrdInfo.GetDashboardDataresp = response;
                if (dashbrdInfo.GetDashboardDataresp != null)
                    CachedQuery<DashBoardInfo>.Cache.SetData(cachename, dashbrdInfo);
              return dashbrdInfo;
            }
        }

        public IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData)
        {
            IList<AdvancedFilterData> filter = new List<AdvancedFilterData>();
            string query = string.Empty;
            if (bitData==0) {
                query = "Select * from Master_TableTabs where showForEstablishment = 1 and ParentName !='BeverageGuest'"; }
            else{
                query = "Select * from Master_TableTabs where showForBeverage = 1 and ParentName !='BeverageGuest'";
            }
            using (cmd = database.GetSqlStringCommand(query))
            {
                using (var dr = database.ExecuteReader(cmd))
                {
                    while (dr.Read())
                    {
                        var firstlevel = filter.FirstOrDefault(c => c.Name == dr["ParentName"] as string);
                        if (firstlevel != null && !string.IsNullOrEmpty(firstlevel.Name))
                        {
                            if (firstlevel.Options == null)
                                firstlevel.Options = new List<AdvancedFilter>();
                            firstlevel.Options.Add(new AdvancedFilter()
                            {
                                Text = dr["FilterName"] as string
                            });
                        }
                        else
                        {
                            filter.Add(new AdvancedFilterData()
                            {
                                Name = dr["ParentName"] as string,
                                CssName = dr["ParentName"] as string,
                                Options = new List<AdvancedFilter>()
                                {
                                    new AdvancedFilter() { Text= dr["FilterName"] as string}
                                }
                            });
                        }
                    }
                }
            }
            return filter;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                cmd.Dispose();
            }
            disposed = true;
        }
    }
}