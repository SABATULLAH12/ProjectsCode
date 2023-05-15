using NextGen.Core.Configuration;
using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Snapshot;
using System;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Collections.Generic;

namespace Framework.Data
{
    public class Snapshot : BaseSnapshot, ISnapshot
    {
        public Snapshot() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        { }

        public Snapshot(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        { }

        public new FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new WidgetData GetSingleWidgetDetails(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter)
        {
            WidgetData data = new WidgetData();
            var _configwidget = _config.GetInfo.Widgets.Where(x => x.WidgetName == widget.WidgetName).FirstOrDefault();
            if (_configwidget == null)
                return data;

            var param = _config.GetWidgetQuery(filter, customFilter, widget.WidgetName);
            switch (widget.WidgetType)
            {
                #region custom widgets

                #endregion

                #region default
                default:
                    data.Data = GetSingleWidgetDetails(filter, widget, customFilter);
                    break;
                    #endregion
            }

            return data;
        }

        public new virtual WidgetInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            return null;
        }
        public AnalysesInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module)
        {
            AnalysesInfo info = new AnalysesInfo();
            IList<ChartSeries> Series = new List<ChartSeries>();
            info.Series = Series;

            object[] param = new object[9];
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            param[3] = filter.FirstOrDefault(x => x.Name == "Metric Comparisons")?.SelectedID;//comparisonbanner
            param[4] = filter.FirstOrDefault(x => x.Name == "Demographic Filters")?.SelectedID;//demofilter
            param[5] = filter.FirstOrDefault(x => x.Name == "Measures")?.SelectedID;//measures
            param[6] = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID ?? 6;//frequency
            param[7] = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID ?? 1;//frequency
            param[8] = additionalFilter;//addtionalfilter


            using (cmd = database.GetStoredProcCommand("USP_Establishment_CorrespondenceMap"))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@MeasureId", SqlDbType.VarChar, param[5] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@Frequencyid", SqlDbType.VarChar, param[6] ?? string.Empty);
                database.AddInParameter(cmd, "@CompareBanner", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@IsVisit", SqlDbType.VarChar, param[7] ?? string.Empty);
                database.AddInParameter(cmd, "@Additionalfilters", SqlDbType.Structured, additionalFilter);

                cmd.CommandTimeout = 12000;
                using (IDataReader dr = database.ExecuteReader(cmd))
                {
                    string colName = "", colName2 = "",sampleSize= "TotalSamplesize";
                    if (module == "analysesestablishmentcompare")
                    {
                        colName = "Col2";
                        colName2 = "Col1";
                    }
                    else
                    {   
                        colName = "Col4";
                        colName2 = "Col1";
                        //sampleSize = "Samplesize";
                    }
                    while (dr.Read())
                    {
                        var seriesName = Series.FirstOrDefault(c => c.name == dr[colName] as string);
                        if (seriesName != null && !string.IsNullOrEmpty(seriesName.name))
                        {
                            if (seriesName.data == null)
                                seriesName.data = new List<AnalysesData>();
                            var tempSS = Series.Where(x => x.name == seriesName.name && x.SeriesSampleSize != null).FirstOrDefault();
                            seriesName.SeriesSampleSize = dr[sampleSize] == DBNull.Value ? (tempSS == null?0:tempSS.SeriesSampleSize) : (int?)Convert.ToInt32(dr[sampleSize]);
                            seriesName.data.Add(new AnalysesData()
                            {//dr["Incidence_L3Y_PtChg"] == DBNull.Value ? null : (dr["Incidence_L3Y_PtChg"] as double?)
                                x = dr[colName2] as string,
                                y = dr["MetricValue"] == DBNull.Value ? null : (double?)Convert.ToDouble(dr["MetricValue"]) * 100.0,
                                AVG = dr["AVG"] == DBNull.Value ? null : (dr["AVG"] as double?) * 100.0,
                                StatSampleSize = dr["StatSampleSize"] == DBNull.Value ? null : (int?)Convert.ToInt32(dr["StatSampleSize"]),//(dr["StatSampleSize"] as int?),
                                comparisonPercentage = dr["Tempvar"] == DBNull.Value ? null : (dr["Tempvar"] as double?),
                                SampleSize = dr["SampleSize"] == DBNull.Value ? null : (int?)Convert.ToInt32(dr["SampleSize"]),//(dr["SampleSize"] as int?),
                                TotalSampleSize = dr["TotalSampleSize"] == DBNull.Value ? null : (int?)Convert.ToInt32(dr["TotalSampleSize"]),//(dr["TotalSampleSize"] as int?),
                                StatValue = dr["SignificanceValue"] == DBNull.Value ? 0 : (dr["SignificanceValue"] as double?),
                                //adding for timeperiod ="trend"
                                z = dr["Col1"] == DBNull.Value ? null : (dr["Col1"] as double?)
                            });
                        }
                        else
                        {
                            Series.Add(new ChartSeries()
                            {
                                name = dr[colName] as string,
                                SeriesSampleSize = dr[sampleSize] == DBNull.Value ? null : (int?)Convert.ToInt32(dr[sampleSize]),
                                data = new List<AnalysesData>()
                                {
                                    new AnalysesData() {
                                        x = dr[colName2] as string,
                                        y = dr["MetricValue"] ==DBNull.Value ? null: (double?)Convert.ToDouble(dr["MetricValue"]) * 100.0,//y = Convert.ToDouble(dr["MetricValue"])*100.0,
                                        AVG = dr["AVG"]==DBNull.Value?null:(dr["AVG"]as double?) * 100.0,
                                        comparisonPercentage = dr["Tempvar"] == DBNull.Value ? null : (dr["Tempvar"] as double?),
                                        StatSampleSize = dr["StatSampleSize"]==DBNull.Value?null:(int?)Convert.ToInt32(dr["StatSampleSize"]),//(dr["StatSampleSize"]as int?),
                                        SampleSize= dr["SampleSize"]==DBNull.Value?null:(int?)Convert.ToInt32(dr["SampleSize"]),//(dr["SampleSize"] as int?),
                                        TotalSampleSize = dr["TotalSampleSize"] == DBNull.Value ? null : (int?)Convert.ToInt32(dr["TotalSampleSize"]),//(dr["TotalSampleSize"] as int?),
                                        StatValue = dr["SignificanceValue"] == DBNull.Value ? 0 : (dr["SignificanceValue"] as double?),
                                        //adding for timeperiod ="trend"
                                         z = dr["Col1"] == DBNull.Value ? null : (dr["Col1"] as double?)
                                    }
                                }
                            });
                        }
                    }
                }
            }
        return info;
        }

        public AnalysesCrossDinerInfo GetCrossDinerOutputData(ViewConfiguration config, FilterPanelInfo[] filter)
        {
            AnalysesCrossDinerInfo info = null;
            object[] param = new object[9];
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            info = new AnalysesCrossDinerInfo();
            var response = new GetTableDataResponse();
            using (cmd = database.GetStoredProcCommand("USP_CrossDinerFrequency"))
            {
                database.AddInParameter(cmd, "@TimeperiodID", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, "@EstablishID", SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterID", SqlDbType.VarChar, param[3] ?? string.Empty);

                cmd.CommandTimeout = 600;
                using (IDataReader dr = database.ExecuteReader(cmd))
                {
                    var getTableDataResp = new List<GetTableDataRespList>();
                    while (dr.Read())
                    {
                        int sampleSize = 0; double metricvalue = 0.0, statvalue = 0.0;
                        if (!int.TryParse(Convert.ToString(dr["TotalSampleSize"]), out sampleSize)) sampleSize = 0;

                        if (!double.TryParse(Convert.ToString(dr["MetricValue"]), out metricvalue)) metricvalue = 0.0;
                        //if (!double.TryParse(Convert.ToString(dr["significanceValue"]), out statvalue)) statvalue = 0.0;

                        var getTableDataResplst = new GetTableDataRespList();
                        getTableDataResplst.MetricName = dr["Metricname"].ToString();
                        getTableDataResplst.EstablishmentName = dr["SelectedEstablishmentName"].ToString();
                        getTableDataResplst.MetricParentName = dr["MetricParentName"].ToString();
                        getTableDataResplst.MetricValue = dr["MetricValue"] == DBNull.Value ? null : (double?)metricvalue;
                        getTableDataResplst.SampleSize = dr["TotalSampleSize"] == DBNull.Value ? null : (int?)sampleSize;
                        getTableDataResplst.IsRestaurant = Convert.ToInt32(dr["IsRestaurant"]);
                        getTableDataResplst.ChannelFlag = Convert.ToInt32(dr["ChannelFlag"]);
                        getTableDataResplst.CompareName = dr["CompareName"].ToString();
                        getTableDataResplst.IsRestRetailer = Convert.ToInt32(dr["IsRestRetailer"]);
                        getTableDataResp.Add(getTableDataResplst);
                    }
                    response.GetTableDataRespDt = getTableDataResp;
                }
                info.GetTableDataResopnse = response;
            }
            
            return info;
        }
        public IEnumerable<AdvancedFilterData> GetAdvanceFilterData()
        {
            throw new NotImplementedException();
        }

        

        public new WidgetData GetAllWidgetDetails(WidgetInfo filter, params object[] param)
        {
            WidgetData widgets = null;
            using (IDataReader dr = ExecuteReader("", param))
            {
                while (dr.Read())
                {
                    //based on switch case fill the data
                    //switch (filter.)
                    //{
                    //    case "":
                    //        break;

                    //    case "":
                    //        break;

                    //    case "":
                    //        break;

                    //    default:
                    //        widget = new WidgetsInfo()
                    //        {
                    //        };
                    //        break;
                    //}
                }
            }

            return widgets;
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

        IEnumerable<AdvancedFilterData> ISnapshot.GetAdvanceFilterData()
        {
            IList<AdvancedFilterData> filter = new List<AdvancedFilterData>();
            using (cmd = database.GetSqlStringCommand("Select * from Master_TableTabs"))
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
    }
}
