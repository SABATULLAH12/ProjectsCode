using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Table;
using System.Configuration;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System;
using AqUtility.Cached;
using System.Web.Script.Serialization;

namespace Framework.Data
{
    public class Table : BaseTable, ITable
    {
        public Table() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }

        public Table(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public new virtual FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new virtual TableInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            return null;//return base.GetOutputData(config, param);
        }

        public TableInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module,string timePeriodType)
        {
            TableInfo info = null;
            object[] param = new object[10];
            string spName = "", paramName = "";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;//timeperiodtype

            //To check beverage or Establishment
            if (module.Contains("beverage"))
            {
                spName = "USP_Beverage_Table";
                param[2] = filter.FirstOrDefault(x => x.Name == "Beverage")?.SelectedID;//Beverage
                paramName = "@Beverageid";
            }
            else
            {
                spName = "usp_Establishment_Table";
                param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
                paramName = "@Establishid";
            }
            //
            var isVisit = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID;
            var frequencyId = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID ?? 6;
            if (module.Contains("beverage"))
            {
                if (!string.IsNullOrEmpty(Convert.ToString(isVisit)) && Convert.ToString(isVisit) == "0")
                {
                    if (Convert.ToString(frequencyId) == "6")
                    {
                        frequencyId = "1";
                    }
                }
            }
            else
            {
                if (!string.IsNullOrEmpty(Convert.ToString(isVisit)) && Convert.ToString(isVisit) == "0")
                {
                    if (Convert.ToString(frequencyId) == "6")
                    {
                        frequencyId = "3";
                    }
                }
            }

            param[3] = filter.FirstOrDefault(x => x.Name == "Metric Comparisons")?.SelectedID;//comparisonbanner
            param[4] = filter.FirstOrDefault(x => x.Name == "Demographic Filters")?.SelectedID;//demofilter
            param[5] = filter.FirstOrDefault(x => x.Name == "Top Filter")?.SelectedID;//topfilter
            param[6] = frequencyId;//frequency
            param[7] = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID;//isvisit
            param[8] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest
            param[9] = additionalFilter;//addtionalfilter

            var addtionalfilterstring = string.Empty;
            if (additionalFilter != null && additionalFilter.Rows.Count > 0)
            {
                foreach (DataRow dr in additionalFilter.Rows)
                    addtionalfilterstring += Convert.ToString(dr["Filtername"]) + ":" + Convert.ToString(dr["Filtervalue"]);
            }
            var cachename = spName + " " + string.Join(",", param) + "," + addtionalfilterstring + "," + timePeriodType; 
            info = CachedQuery<TableInfo>.Cache.GetData(cachename);

            if (info != null)
            {
                return info;
            }
               

            info = new TableInfo();

            var response = new GetTableDataResponse();
            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, paramName, SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@TopFilterId", SqlDbType.VarChar, param[5] ?? string.Empty);
                database.AddInParameter(cmd, "@Frequencyid", SqlDbType.VarChar, param[6] ?? string.Empty);
                database.AddInParameter(cmd, "@CompareBanner", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@IsVisit", SqlDbType.Bit, param[7] ?? 0);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[8] ?? string.Empty);
                database.AddInParameter(cmd, "@Additionalfilters", SqlDbType.Structured, additionalFilter);
              

                cmd.CommandTimeout = 12000;
                using (IDataReader dr = database.ExecuteReader(cmd))
                {
                    string colName = "";
                    if (module == "tableestablishmentdeepdive" || module == "tablebeveragedeepdive")
                    {
                        //Establishment Deepdive
                        if (param[3] != null)
                            colName = "CompareName";//pit
                        else
                            colName = "TimePeriod";//trend
                    }
                    else
                    {
                        //Establishment  Compare
                        colName = "EstablishmentName";
                    }

                    var getTableDataResp = new List<GetTableDataRespList>();
                    while (dr.Read())
                    {
                        int sampleSize = 0;double metricvalue = 0.0, statvalue =0.0;
                        if (!int.TryParse(Convert.ToString(dr["SampleSize"]), out sampleSize)) sampleSize = 0;

                        if (!double.TryParse(Convert.ToString(dr["MetricValue"]), out metricvalue)) metricvalue = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["significanceValue"]), out statvalue)) statvalue = 0.0;

                        var getTableDataResplst = new GetTableDataRespList();
                        int samplevariable = 0;
                        getTableDataResplst.MetricName = dr["Metricname"].ToString();
                        getTableDataResplst.EstablishmentName = dr[colName].ToString();
                        getTableDataResplst.DemoFilterName = dr["DemoFilterName"].ToString();
                        getTableDataResplst.MetricValue = dr["MetricValue"] == DBNull.Value ? null : (double?)metricvalue;
                        getTableDataResplst.SampleSize = dr["SampleSize"] == DBNull.Value ? null : (int?)sampleSize;
                        //getTableDataResplst.BenchMarkPercentage = dr["StatValue"] == DBNull.Value ? null : (double?)statvalue;//dr["StatValue"].ToString();
                        //if (int.TryParse(Convert.ToString(dr["StatSamplesize"]), out samplevariable))
                        //    getTableDataResplst.BenchMarkSampleSize = samplevariable;
                        if (int.TryParse(Convert.ToString(dr["TotalSamplesize"]), out samplevariable))
                            getTableDataResplst.MetricSampleSize = samplevariable;

                        getTableDataResplst.StatValue = dr["significanceValue"] == DBNull.Value ? null : (double?)statvalue;
                        getTableDataResp.Add(getTableDataResplst);

                        if (!info.Columns.Contains(Convert.ToString(dr[colName])))
                            info.Columns.Add(Convert.ToString(dr[colName]));
                    }
                    response.GetTableDataRespDt = getTableDataResp;

                }
                info.GetTableDataResopnse = response;

                if (info.GetTableDataResopnse != null && info.Columns != null && info.Columns.Count > 0)
                {
                    CachedQuery<TableInfo>.Cache.SetData(cachename, info);
                }
                return info;
            }
        }

        public IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData)
        {
            IList<AdvancedFilterData> filter = new List<AdvancedFilterData>();
            string query = string.Empty;
            if (bitData == 0)
            {
                query = "Select * from Master_TableTabs where showForEstablishment = 1";
            }
            else
            {
                query = "Select * from Master_TableTabs where showForBeverage = 1";
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
                                Text = dr["FilterName"] as string,
                                Id = Convert.ToInt32(dr["Filterid"])
                            });
                        }
                        else
                        {
                            filter.Add(new AdvancedFilterData()
                            {
                                Name = dr["ParentName"] as string,
                                CssName = dr["ParentName"] as string,
                                IsBeverage = bitData,
                                Options = new List<AdvancedFilter>()
                                {
                                    new AdvancedFilter() { Text= dr["FilterName"] as string,Id=Convert.ToInt32( dr["Filterid"]) }
                                }
                            });
                        }
                    }
                }
            }
            return filter;
        }
    }
}