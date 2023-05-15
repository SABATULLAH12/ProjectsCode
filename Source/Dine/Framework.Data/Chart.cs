using AqUtility.Cached;
using NextGen.Core.Configuration;
using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Chart;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System;

namespace Framework.Data
{
    public class Chart : BaseChart, IChart
    {
        public Chart() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }

        public Chart(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public new virtual FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new virtual ChartInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            return null;
        }

        public DataTable GetDataTable(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module, string timePeriodType, string toTimePeriod, string fromTimePeriod, string UserId)
        {
            object[] param = new object[10];
            string spName = "", paramName = "";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = timePeriodType;//timeperiodtype

            //To check beverage or Establishment
            if (module.Contains("beverage"))
            {
                spName = "USP_Beverage_Chart";
                param[2] = filter.FirstOrDefault(x => x.Name == "Beverage")?.SelectedID;//Beverage
                paramName = "@Beverageid";
            }
            else
            {
                spName = "usp_Establishment_Chart";
                param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
                paramName = "@Establishid";
            }
            //       

            //To assign default frequency if frequency is null
            var isvisit = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID;
            var defaultfrequency = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID;
            if (Convert.ToInt32(isvisit) == 1 && defaultfrequency == null)
                defaultfrequency = "6";
            else if (Convert.ToInt32(isvisit) == 0 && defaultfrequency == null)
                defaultfrequency = "1";
            //

            param[3] = filter.FirstOrDefault(x => x.Name == "Metric Comparisons")?.SelectedID;//comparisonbanner
            param[4] = filter.FirstOrDefault(x => x.Name == "Demographic Filters")?.SelectedID;//demofilter
            param[5] = filter.FirstOrDefault(x => x.Name == "Measures")?.SelectedID;//measures
            param[6] = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID ?? defaultfrequency;//frequency
            param[7] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest
            param[8] = filter[0].IsVisit;//IsVisit
            param[9] = additionalFilter;//addtionalfilter
            //Custom Base
            if (param[7].ToString() == "custom base")
            {
                param[7] = filter[0].customBase == null ? "previous period" : filter[0].customBase;
            }

            var addtionalfilterstring = string.Empty;
            if (additionalFilter != null && additionalFilter.Rows.Count > 0)
            {
                foreach (DataRow dr in additionalFilter.Rows)
                    addtionalfilterstring += Convert.ToString(dr["Filtername"]) + ":" + Convert.ToString(dr["Filtervalue"]);
            }

            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, paramName, SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@MeasureId", SqlDbType.VarChar, param[5] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@Frequencyid", SqlDbType.VarChar, param[6] ?? string.Empty);
                database.AddInParameter(cmd, "@CompareBanner", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@IsVisit", SqlDbType.VarChar, param[8] ?? string.Empty);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[7] ?? string.Empty);
                database.AddInParameter(cmd, "@EstablishmentOrBeverage", SqlDbType.VarChar, "Establishment");
                //database.AddInParameter(cmd, "@ExecutingFrom", SqlDbType.VarChar, "Chart");
                database.AddInParameter(cmd, "@Additionalfilters", SqlDbType.Structured, additionalFilter);
                database.AddInParameter(cmd, "@userId", SqlDbType.VarChar, UserId ?? string.Empty);
                cmd.CommandTimeout = 12000;

                var ds = database.ExecuteDataSet(cmd);
                if (ds == null)
                    return null;
                else
                    return ds.Tables[0];
            }
        }

        public ChartInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module, string timePeriodType, string UserId)
        {
            ChartInfo info = null;
            object[] param = new object[10];
            string spName = "", paramName = "";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;//timeperiodtype

            //To check beverage or Establishment
            if (module.Contains("beverage"))
            {
                spName = "USP_Beverage_Chart";
                param[2] = filter.FirstOrDefault(x => x.Name == "Beverage")?.SelectedID;//Beverage
                paramName = "@Beverageid";
            }
            else
            {
                spName = "usp_Establishment_Chart";
                param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
                paramName = "@Establishid";
            }
            // 

            //To assign default frequency if frequency is null
            var isvisit = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID;
            var defaultfrequency = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID;
            if (Convert.ToInt32(isvisit) == 1  && defaultfrequency == null)
                defaultfrequency = "6";
            else if (Convert.ToInt32(isvisit) == 0 && defaultfrequency == null)
                defaultfrequency = "1";
            //

            param[3] = filter.FirstOrDefault(x => x.Name == "Metric Comparisons")?.SelectedID;//comparisonbanner
            param[4] = filter.FirstOrDefault(x => x.Name == "Demographic Filters")?.SelectedID;//demofilter
            param[5] = filter.FirstOrDefault(x => x.Name == "Measures")?.SelectedID;//measures
            param[6] = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID ?? defaultfrequency;//frequency
            param[7] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest
            param[8] = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID ?? 0;//IsVisit
            param[9] = additionalFilter;//addtionalfilter


            var addtionalfilterstring = string.Empty;
            if (additionalFilter != null && additionalFilter.Rows.Count > 0)
            {
                foreach (DataRow dr in additionalFilter.Rows)
                    addtionalfilterstring += Convert.ToString(dr["Filtername"]) + ":" + Convert.ToString(dr["Filtervalue"]);
            }

            //time period added by chandra
            var cachename = spName + " " + string.Join(",", param) + "," + addtionalfilterstring + "," + timePeriodType;
            info = CachedQuery<ChartInfo>.Cache.GetData(cachename);

            if (info != null)
                return info;
            info = new ChartInfo() { Series = new List<ChartSeries>() };

            IList<ChartSeries> Series = new List<ChartSeries>();


            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, paramName, SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@MeasureId", SqlDbType.VarChar, param[5] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@Frequencyid", SqlDbType.VarChar, param[6] ?? string.Empty);
                database.AddInParameter(cmd, "@CompareBanner", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@IsVisit", SqlDbType.VarChar, param[8] ?? string.Empty);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[7] ?? string.Empty);
                database.AddInParameter(cmd, "@EstablishmentOrBeverage", SqlDbType.VarChar, "Establishment");
                //database.AddInParameter(cmd, "@ExecutingFrom", SqlDbType.VarChar, "Chart");
                database.AddInParameter(cmd, "@Additionalfilters", SqlDbType.Structured, additionalFilter);
                database.AddInParameter(cmd, "@userId", SqlDbType.VarChar, UserId ?? string.Empty);
                cmd.CommandTimeout = 12000;

                DataSet ds = database.ExecuteDataSet(cmd);

                if (ds != null && ds.Tables != null && ds.Tables.Count > 0)
                {
                    string colName = string.Empty, colName2 = string.Empty;
                    if (module == "chartestablishmentdeepdive" || module == "chartbeveragedeepdive")
                    {

                        if (timePeriodType == "pit")
                        {
                            colName = "Col4";
                            colName2 = "Col1";
                        }
                        else
                        {
                            //colName = "Col4";
                            //colName2 = "TimePeriod";
                            colName = "TimePeriod";
                            colName2 = "Col4";
                            //colName2 = param[5].ToString().Split('|').Count() == 1? "col4":"col1";
                        }
                    }
                    else
                    {
                        if (timePeriodType == "pit")
                        {
                            colName = "Col2";
                            colName2 = "Col1";
                        }
                        else
                        {
                            //colName = "Col2";
                            //colName2 = "TimePeriod";
                            colName = "TimePeriod";
                            colName2 = "Col2";
                        }
                    }

                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        var seriesName = Series.FirstOrDefault(c => c.name == dr[colName] as string);
                        int totalSample = 0, sampleSize = 0, StatSampleSize = 0; double statvalue = 0.0, metricvalue = 0.0, col1 = 0.0; double? change1 = null;
                        
                        //var seriessample = ds.Tables[0].AsEnumerable().FirstOrDefault(x => x.Field<string>(colName) == dr[colName] as string && x.Field<object>("TotalSampleSize") != null);

                        //if (!int.TryParse(Convert.ToString(dr["TotalSamplesize"]), out seriessample)) seriessample = 0;
                        if (!int.TryParse(Convert.ToString(dr["TotalSamplesize"]), out totalSample)) totalSample = 0;
                        if (!int.TryParse(Convert.ToString(dr["StatSampleSize"]), out StatSampleSize)) StatSampleSize = 0;
                        //if (!int.TryParse(Convert.ToString(dr["SampleSize"]), out sampleSize)) sampleSize = 0;
                        if (!int.TryParse(Convert.ToString(dr["TotalSamplesize"]), out sampleSize)) sampleSize = 0;

                        if (!double.TryParse(Convert.ToString(dr["MetricValue"]), out metricvalue)) metricvalue = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["significanceValue"]), out statvalue)) statvalue = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["Col1"]), out col1)) col1 = 0.0;
                        if (!string.IsNullOrEmpty(Convert.ToString(dr["Change"])))
                        {
                            change1 = Convert.ToDouble(dr["Change"]);
                        }
                       
                        if (seriesName != null && !string.IsNullOrEmpty(seriesName.name))
                        {
                            if (seriesName.data == null)
                                seriesName.data = new List<ChartData>();
                            seriesName.SeriesSampleSize = dr["TotalSamplesize"] == DBNull.Value ? null : (int?)totalSample;
                            seriesName.data.Add(new ChartData()
                            {//dr["Incidence_L3Y_PtChg"] == DBNull.Value ? null : (dr["Incidence_L3Y_PtChg"] as double?)
                                x = dr[colName2] as string,
                                y = metricvalue * 100,
                                //y = dr["MetricValue"] == DBNull.Value ? null : (double?)metricvalue * 100.0,
                                #region Commented Statvalue as we are getting value from backend
                                // BenchMarkPercentage = dr["StatValue"] == DBNull.Value ? null : (double?)statvalue,
                                //BenchMarkSampleSize = dr["StatSampleSize"] == DBNull.Value ? null : (int?)StatSampleSize,
                                SampleSize = dr["TotalSamplesize"] == DBNull.Value ? null : (int?)sampleSize,
                                #endregion
                                //adding for timeperiod ="trend"
                                z = dr["Col1"] == DBNull.Value ? null : (double?)col1,
                                StatValue = statvalue,
                                //StatValue = dr["significanceValue"] == DBNull.Value ? null : (double?)statvalue,
                                ChartType = dr["ChartType"] as string,
                                change = change1 == null ? null : change1 * 100
                                //change = dr["Change"] == DBNull.Value ? null : (double?)dr["Change"] * 100
                            });
                        }
                        else
                        {
                            Series.Add(new ChartSeries()
                            {
                                name = dr[colName] as string,
                                SeriesSampleSize = dr["TotalSamplesize"] == DBNull.Value ? null : (int?)totalSample,//seriessample == null ? null : (int?)totalSample,
                                data = new List<ChartData>()
                                {
                                    new ChartData() {
                                        x = dr[colName2] as string,
                                        y = metricvalue * 100,
                                        //y = dr["MetricValue"] ==DBNull.Value ? null:  (double?)metricvalue * 100.0,//y = Convert.ToDouble(dr["MetricValue"])*100.0,
                                        #region Commented Statvalue as we are getting value from backend
                                        //BenchMarkPercentage = dr["StatValue"]==DBNull.Value?null:(double?)statvalue,
                                        //BenchMarkSampleSize = dr["StatSampleSize"]==DBNull.Value?null:(int?)StatSampleSize,
                                        SampleSize= dr["TotalSamplesize"]==DBNull.Value?null:(int?)sampleSize,
                                        #endregion
                                        StatValue = statvalue,
                                        //StatValue = dr["significanceValue"] == DBNull.Value ? null : (double?)statvalue,
                                        //adding for timeperiod ="trend"
                                         z = dr["Col1"] == DBNull.Value ? null : (double?)col1,
                                         ChartType=dr["ChartType"] as string,
                                         change =  change1 == null ? null : change1 * 100
                                        //change = dr["Change"] == DBNull.Value ? null : (double?)dr["Change"] * 100
                                    }
                                }
                            });
                        }
                    }
                }
                info.Series = Series;
            }
            if (info.Series != null && info.Series.Count > 0)
                CachedQuery<ChartInfo>.Cache.SetData(cachename, info);
            return info;
        }

        public Int32 SaveChangedColorCodes(DataTable colorTable, bool IsBeverageModule)
        {
            string _spName = "USP_ColorCode_Establishment";

            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@ColorCode", SqlDbType.Structured, colorTable);
                database.AddInParameter(cmd, "@IsBeverage", SqlDbType.Bit, IsBeverageModule);
                cmd.CommandTimeout = 300;
                return Convert.ToInt32(database.ExecuteScalar(cmd));
            }
        }

        public string ValidatePalletteColor(DataTable colorTable, bool IsBeverageModule)
        {
            string _spName = "USP_Color_Validation_ALL";

            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@ColorCode", SqlDbType.Structured, colorTable);
                database.AddInParameter(cmd, "@IsBeverage", SqlDbType.Bit, IsBeverageModule);
                cmd.CommandTimeout = 300;
                return Convert.ToString(database.ExecuteScalar(cmd));
            }
        }

        public new virtual DataSet GetOutputDataTable(params object[] param)
        {
            return base.GetOutputDataTable(param);
        }

        public IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData)
        {
            IList<AdvancedFilterData> filter = new List<AdvancedFilterData>();
            string query = string.Empty;
            if (bitData == 0 || bitData == 1)
            {
                query = "Select * from Master_TableTabs where showForEstablishment = 1 and ParentName !='BeverageGuest'";
            }
            else
            {
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

        public IList<TimeperiodYear> GetTimePeriod()
        {
            IList<TimeperiodYear> Tp = new List<TimeperiodYear>();
            string query = string.Empty;
            query = "select *  from DimTimeperiod where isDataAvailable = 1";
            using (cmd = database.GetSqlStringCommand(query))
            {
                using (var dr = database.ExecuteReader(cmd))
                {
                    while (dr.Read())
                    {
                        Tp.Add(new TimeperiodYear()
                        {
                            _ID = dr["TimePeriodID"],
                            Text = dr["Month_Year"].ToString(),
                            Year = dr["Year"].ToString()
                        });
                    }
                }
            }
            return Tp;
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