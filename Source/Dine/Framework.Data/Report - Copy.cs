using AqUtility.Cached;
using NextGen.Core.Configuration;
using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Report;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Data.SqlClient;
using Newtonsoft.Json;

namespace Framework.Data
{
    public class Report : BaseChart, IReport
    {
        public Report() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }

        public Report(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public new virtual FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }
        public DataSet GetDataTableWithFrequency(FilterPanelInfo[] filter, DataTable additionalFilter, string module, List<ColorCodeData> codelist, string userId)
        {
            object[] param = new object[9];
            string spName = "USP_DinerReport";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Timeperiod Type").SelectedText;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            //param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.MetricType == "Advanced Filters" || x.MetricType == "Demographic Filters")?.SelectedID;//demofilter
            param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            //param[4] = filter.FirstOrDefault(x => x.Name == "Additional Filters")?.SelectedID;//demofilter
            param[4] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Slide Names").Data.Select(x => x.Text));//Slide Names
            param[5] = filter.FirstOrDefault(x => x.Name == "Frequency").SelectedID;//Frequency
            param[6] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest
            //
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "UserId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "ColourCode" });
            dt.Columns.Add(new DataColumn() { ColumnName = "Establishmentid" });
            dt.Columns.Add(new DataColumn() { ColumnName = "MeasureId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "GroupsId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "IsTrend" });
            if (codelist != null)
            {
                for (int i = 0; i < codelist.Count; i++)
                {
                    ColorCodeData cd = codelist[i];

                    dt.Rows.Add(userId, cd.ColourCode, cd.Establishmentid, cd.MeasureId, cd.GroupsId, cd.IsTrend);
                }
            }

            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@Reportid", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[5] ?? string.Empty);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[6] ?? string.Empty);
                database.AddInParameter(cmd, "@ColorCode", SqlDbType.Structured, dt);
                cmd.CommandTimeout = 12000;

                var ds = database.ExecuteDataSet(cmd);
                if (ds == null)
                    return null;
                else
                    return ds;
            }
        }
        public DataSet GetDataTable(FilterPanelInfo[] filter, DataTable additionalFilter, string module, List<ColorCodeData> codelist, string userId)
        {
            object[] param = new object[9];
            string spName = "USP_P2PReport_Visit";
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Timeperiod Type").SelectedText;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            //param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.MetricType == "Advanced Filters" || x.MetricType == "Demographic Filters")?.SelectedID;//demofilter
            param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            //param[4] = filter.FirstOrDefault(x => x.Name == "Additional Filters")?.SelectedID;//demofilter
            param[4] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Slide Names").Data.Select(x => x.Text));//Slide Names
            param[5] = filter.FirstOrDefault(x => x.Name == "StatTest")?.SelectedText;//stattsest


            //
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "UserId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "ColourCode" });
            dt.Columns.Add(new DataColumn() { ColumnName = "Establishmentid" });
            dt.Columns.Add(new DataColumn() { ColumnName = "MeasureId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "GroupsId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "IsTrend" });
            if (codelist != null)
            {
                for (int i = 0; i < codelist.Count; i++)
                {
                    ColorCodeData cd = codelist[i];

                    dt.Rows.Add(userId, cd.ColourCode, cd.Establishmentid, cd.MeasureId, cd.GroupsId, cd.IsTrend);
                }
            }

            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                database.AddInParameter(cmd, "@Reportid", SqlDbType.VarChar, param[4] ?? string.Empty);
                database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[5] ?? string.Empty);
                database.AddInParameter(cmd, "@ColorCode", SqlDbType.Structured, dt);
                cmd.CommandTimeout = 12000;


                var ds = database.ExecuteDataSet(cmd);
                if (ds == null)
                    return null;
                else
                    return ds;
            }
        }

        public DataTable GetValidEstablishmentList(FilterPanelInfo[] filter, DataTable additionalFilter, string module)
        {
            object[] param = new object[9];
            string spName = "";
            if (module == "situationassessmentreport")
            {
                spName = "USP_SituationAssesmentReport_SampleSizeValidation";
                var list = new List<SituationAnalysisData>();
                param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
                param[1] = filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID;
                param[2] = filter.FirstOrDefault(x => x.Name == "Advance Filters")?.SelectedID;
                param[3] = filter.FirstOrDefault(x => x.Name == "Competitors").SelectedID;
                param[4] = filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID ?? 6;
                param[5] = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID ?? 1;
                //sabat 12-02-2021
                if(filter.FirstOrDefault(x => x.Name == "Advance Visit Filters")?.SelectedID!=null)
                {
                    List<string> advanceVisitFilters = (JsonConvert.DeserializeObject<string[]>((string)(filter.FirstOrDefault(x => x.Name == "Advance Visit Filters")?.SelectedID))).ToList();
                    List<string> listparm = param[2].ToString().Split('|').ToList();
                    List<string> onlyGuestsList = new List<string>();
                    string isVisits = (string)param[5];
                    if (isVisits == "0")
                    {
                        param[2] = "";
                        for (int i = 0; i < listparm.Count; i++)
                        {
                            if (advanceVisitFilters.IndexOf(listparm[i]) == -1)
                                onlyGuestsList.Add(listparm[i]);
                        }
                        param[2] = string.Join("|", onlyGuestsList);
                    }
                }
                //end

                #region datatable for @selections parameter
                DataTable dt = new DataTable();
                dt.Columns.Add("UniqueId", typeof(Int32));
                dt.Columns.Add("EstablishmentId", typeof(Int32));
                dt.Columns.Add("EstablishmentName", typeof(string));
                dt.Columns.Add("SelectionType", typeof(string));

                string[] establishmentIds = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID.ToString().Split('|');
                string[] establishmentNames = string.Join("|", filter.FirstOrDefault(x => x.Name == "Establishment").Data.Select(x => x.Text)).Split('|');


                for (int i = 0; i < establishmentIds.Count(); i++)
                {
                    DataRow dRow = dt.NewRow();
                    dRow[0] = i + 1;
                    dRow[1] = establishmentIds[i];
                    dRow[2] = establishmentNames[i];
                    dRow[3] = i == 0 ? "Benchmark" : "Custombase";
                    dt.Rows.Add(dRow);
                }
                #endregion

                using (cmd = database.GetStoredProcCommand(spName))
                {
                    database.AddInParameter(cmd, "@TimePeriodId", SqlDbType.VarChar, param[0]);
                    database.AddInParameter(cmd, "@TimePeriodType", SqlDbType.VarChar, param[1]);
                    database.AddInParameter(cmd, "@Selections", SqlDbType.Structured, dt);
                    database.AddInParameter(cmd, "@FilterId", SqlDbType.VarChar, param[2]);
                    database.AddInParameter(cmd, "@CompetitorsId", SqlDbType.VarChar, param[3]);
                    database.AddInParameter(cmd, "@IsGuestorVisit", SqlDbType.VarChar, param[5]);
                    database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4]);

                    cmd.CommandTimeout = 12000;

                    var ds = database.ExecuteDataSet(cmd);
                    if (ds == null)
                        return null;
                    else
                        return ds.Tables[0];
                }
            }
            else
            {
                spName = "USP_SampleSize_Validation_Report";

                param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
                param[1] = filter.FirstOrDefault(x => x.Name == "Timeperiod Type").SelectedText;//timeperiodtype
                param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
                                                                                             //param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.MetricType == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.MetricType == "Additional Filters")?.SelectedID;//demofilter 
                param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
                param[4] = filter.FirstOrDefault(x => x.Name == "Frequency")?.SelectedID ?? 6;//Frequency
                using (cmd = database.GetStoredProcCommand(spName))
                {
                    database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                    database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                    database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                    database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                    database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4] ?? string.Empty);
                    cmd.CommandTimeout = 12000;

                    var ds = database.ExecuteDataSet(cmd);
                    if (ds == null)
                        return null;
                    else
                        return ds.Tables[0];
                }
            }
        }
        public DataTable GetValidEstablishmentListWithStat(FilterPanelInfo[] filter, DataTable additionalFilter, string module)
        {

            object[] param = new object[9];
            string spName = "";
            if (module == "dashboardp2pdashboard")
                spName = "USP_SampleSize_Validation_P2PDashBoard";
            else
                spName = "USP_SampleSize_Validation_DashBoard";

            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = filter.FirstOrDefault(x => x.Name == "Timeperiod Type").SelectedText;//timeperiodtype
            param[2] = filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID;//establishment
            param[3] = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            param[4] = filter.FirstOrDefault(x => x.Name == "Frequency" || x.Name == "Frequency Filters")?.SelectedID ?? 6;//Frequency
            param[5] = filter.FirstOrDefault(x => x.Name == "stat")?.SelectedText ?? "";//stattest


            if (module == "dashboard_demographics")
            {
                spName = "USP_SampleSizeValidation_DemographicsDashboard";
                param[6] = filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID ?? 0;//stattest
                using (cmd = database.GetStoredProcCommand(spName))
                {
                    database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                    database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                    database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                    database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4] ?? string.Empty);
                    database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                    database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[5] ?? string.Empty);
                    database.AddInParameter(cmd, "@Is_Visit", SqlDbType.VarChar, param[6] ?? 0);
                    cmd.CommandTimeout = 12000;
                }
            }
            else
            {
                param[6] = filter.FirstOrDefault(x => x.Name == "Advanced Filters Custom Base")?.SelectedID ?? "";//only for the p2p dashboard Advanced Filters custome base
                using (cmd = database.GetStoredProcCommand(spName))
                {
                    if (module == "dashboardp2pdashboard")
                    {
                        //if (param[4] != null)
                        //{
                        //    if (param[4].ToString() == "6")
                        //        param[4] = "";
                        //}
                        //if (param[3] == null)
                        //    param[3] = param[4] == null ? "" : param[4];
                        //else
                        //    param[3] = param[3] + "|" + param[4];

                        if (param[4] == null)
                            param[4] = "6";
                        database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                        database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                        database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                        database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                        database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4]);
                        database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[5] ?? string.Empty);
                        database.AddInParameter(cmd, "@CustomBaseFilterId", SqlDbType.VarChar, param[6] ?? string.Empty);

                    }
                    else
                    {
                        database.AddInParameter(cmd, "@Timeperiodid", SqlDbType.VarChar, param[0] ?? string.Empty);
                        database.AddInParameter(cmd, "@TimeperiodType", SqlDbType.VarChar, param[1] ?? string.Empty);
                        database.AddInParameter(cmd, "@Establishid", SqlDbType.VarChar, param[2] ?? string.Empty);
                        database.AddInParameter(cmd, "@DemoFilterId", SqlDbType.VarChar, param[3] ?? string.Empty);
                        database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4] ?? string.Empty);
                        database.AddInParameter(cmd, "@StatTestAgainst", SqlDbType.VarChar, param[5] ?? string.Empty);
                    }
                    cmd.CommandTimeout = 12000;
                }
            }

            var ds = database.ExecuteDataSet(cmd);
            if (ds == null)
                return null;
            else
                return ds.Tables[0];
        }
        public IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData)
        {
            IList<AdvancedFilterData> filter = new List<AdvancedFilterData>();
            string query = string.Empty;
            if (bitData == 0)
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

        DataSet IReport.GetOutputDataTable(params object[] param)
        {
            throw new NotImplementedException();
        }

        ReportInfo IReport.GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module, string timePeriodType)
        {
            throw new NotImplementedException();
        }

        //IEnumerable<AdvancedFilterData> IReport.GetAdvanceFilterData(int bitData)
        //{
        //    throw new NotImplementedException();
        //}
        public IEnumerable<AdvancedFilterData> GetAdvanceFilterData()
        {
            IList<AdvancedFilterData> filter = new List<AdvancedFilterData>();
            string query = string.Empty;
            //if (bitData == 0)
            //{
            //    query = "Select * from Master_TableTabs where showForEstablishment = 1";
            //}
            //else
            //{
            query = "Select * from DimFrequency where IsEstModule = 1";
            //}
            using (cmd = database.GetSqlStringCommand(query))
            {
                using (var dr = database.ExecuteReader(cmd))
                {
                    while (dr.Read())
                    {
                        //var firstlevel = filter.FirstOrDefault(c => c.Name == dr["ParentName"] as string);
                        //if (firstlevel != null && !string.IsNullOrEmpty(firstlevel.Name))
                        //{
                        //    if (firstlevel.Options == null)
                        //        firstlevel.Options = new List<AdvancedFilter>();
                        //    firstlevel.Options.Add(new AdvancedFilter()
                        //    {
                        //        Text = dr["FilterName"] as string,
                        //        Id = Convert.ToInt32(dr["Filterid"])
                        //    });
                        //}
                        //else
                        //{
                        filter.Add(new AdvancedFilterData()
                        {
                            Options = new List<AdvancedFilter>()
                                {
                                    new AdvancedFilter() { Text= dr["FrequencyName"] as string,Id=Convert.ToInt32( dr["FrequencyId"]) }
                                }
                        });
                        //}
                    }
                }
            }
            return filter;
        }

        //FilterPanelMenu IDataAccess<FilterPanelMenu, ReportInfo>.GetMenu()
        //{
        //    throw new NotImplementedException();
        //}

        ReportInfo IDataAccess<FilterPanelMenu, ReportInfo>.GetOutputData(ViewConfiguration config, params object[] param)
        {
            throw new NotImplementedException();
        }

        public List<SituationLeftPanelMetrics> GetSituationLeftPanelMetrics()
        {
            string spName = "USP_LeftPanel_SituationAssesmentReport_Metric";
            var list = new List<SituationLeftPanelMetrics>();
            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@UserId", SqlDbType.VarChar, "2");
                cmd.CommandTimeout = 12000;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    SituationLeftPanelMetrics sm = new SituationLeftPanelMetrics();
                    sm.MeasureId = Convert.ToInt32(dr["MeasureId"]);
                    sm.MeasureName = dr["MeasureName"].ToString();
                    sm.MeasureParentName = dr["MeasureParentName"].ToString();
                    sm.ParentId = dr["ParentId"].ToString();
                    sm.ToolOrderby = Convert.ToInt32(dr["ToolOrderby"]);
                    list.Add(sm);
                }
            }
            return list;
        }

        public List<SituationAnalysisData> GetTableOutput(FilterPanelInfo[] filter, string spName)
        {
            var list = new List<SituationAnalysisData>();
            object[] param = new object[10];
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = ((string[])(filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID))[0];
            if (((string[])(filter.FirstOrDefault(x => x.Name == "Advance Filters")?.SelectedID)) == null)
                param[2] = "";
            else
            {
                param[2] = ((string[])(filter.FirstOrDefault(x => x.Name == "Advance Filters")?.SelectedID))[0];
                List<string> listparm = param[2].ToString().Split('|').ToList();
                List<string> advanceVisitFilters = new List<string>();
                var isVisits = ((string[])(filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID))[0];
                if (((string[])(filter.FirstOrDefault(x => x.Name == "Advance Visit Filters")?.SelectedID)) == null)
                    advanceVisitFilters = new List<string>();
                else
                    advanceVisitFilters = ((string[])(filter.FirstOrDefault(x => x.Name == "Advance Visit Filters")?.SelectedID)).ToList();
                List<string> onlyGuestsList = new List<string>();
                if (isVisits == "0")
                {
                    param[2] = "";
                    for (int i = 0; i < listparm.Count; i++)
                    {
                        if (advanceVisitFilters.IndexOf(listparm[i]) == -1)
                            onlyGuestsList.Add(listparm[i]);
                    }
                    param[2] = string.Join("|", onlyGuestsList);
                }
            }
            param[3] = ((string[])(filter.FirstOrDefault(x => x.Name == "Competitors")?.SelectedID))[0];
            param[4] = ((string[])(filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID))[0];
            param[5] = ((string[])(filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID))[0];

            #region datatable for @selections parameter
            DataTable dt = new DataTable();
            dt.Columns.Add("UniqueId", typeof(Int32));
            dt.Columns.Add("EstablishmentId", typeof(string));
            dt.Columns.Add("EstablishmentName", typeof(string));
            dt.Columns.Add("SelectionType", typeof(string));

            string[] establishmentIds = ((string[])((filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID)))[0].Split('|');
            string[] establishmentNames = string.Join("|", filter.FirstOrDefault(x => x.Name == "Establishment").Data.Select(x => x.Text)).Split('|');


            for (int i = 0; i < establishmentIds.Count(); i++)
            {
                DataRow dRow = dt.NewRow();
                dRow[0] = i + 1;
                dRow[1] = (establishmentNames[i] == "Previous Year" || establishmentNames[i] == "Previous Period" ? null : establishmentIds[i]);
                dRow[2] = establishmentNames[i];
                dRow[3] = i == 0 ? "Benchmark" : "Custombase";
                dt.Rows.Add(dRow);
            }
            #endregion

            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@TimePeriodId", SqlDbType.VarChar, param[0]);
                database.AddInParameter(cmd, "@TimePeriodType", SqlDbType.VarChar, param[1]);
                database.AddInParameter(cmd, "@Selections", SqlDbType.Structured, dt);
                database.AddInParameter(cmd, "@FilterId", SqlDbType.VarChar, param[2]);
                database.AddInParameter(cmd, "@CompetitorsId", SqlDbType.VarChar, param[3]);
                database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4]);
                database.AddInParameter(cmd, "@IsGuestorVisit", SqlDbType.VarChar, param[5]);
                cmd.CommandTimeout = 12000;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    SituationAnalysisData sm = new SituationAnalysisData();

                    double metricPercentage = 0.0, significance1 = 0.0, significance2 = 0.0, deviationValue = 0.0, bicRating = 0.0, bicGap = 0.0, CB1Percentage = 0.0, CB2Percentage = 0.0, CompPercentage = 0.0, CompSig = 0.0; int sampleSize = 0, custombaseIndex1 = 0, custombaseIndex2 = 0;
                    if (spName == "USP_SituationAssesmentReport_CoreGuest_ShareofGuestTrips" || spName == "USP_SituationAssesmentReport_CoreGuest_FrequencyFunnel" || spName == "USP_SituationAssesmentReport_LoyaltyPyramid")
                    {
                        if (!double.TryParse(Convert.ToString(dr["MetricPercentage"]), out metricPercentage)) metricPercentage = 0.0;
                        if (!int.TryParse(Convert.ToString(dr["MetricSamplesize"]), out sampleSize)) sampleSize = 0;

                        if (!double.TryParse(Convert.ToString(dr["CompPercentage"]), out CompPercentage)) CompPercentage = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["CompSig"]), out CompSig)) CompSig = 0.0;

                        sm.MetricName = dr["MetricName"].ToString();
                        sm.MetricParentName = dr["MetricParentName"].ToString();
                        sm.EstablishmentName = dr["EstablishmentName"].ToString();
                        sm.MetricPercentage = metricPercentage;
                        sm.MetricSampleSize = dr["MetricSamplesize"] == DBNull.Value ? null : (int?)sampleSize;
                        sm.CompPercentage = CompPercentage;
                        sm.CompSig = CompSig;
                        sm.DefaultMetric = Convert.ToBoolean(dr["DefaultMetric"]);
                        list.Add(sm);
                    }
                    else if (spName == "USP_SituationAssesmentReport_FairShair_EstablishmentImegeries" || spName == "USP_SituationAssesmentReport_FairShair_StrengthOppurtunites" || spName == "USP_SituationAssesmentReport_FairShair_Perceptions")
                    {
                        if (!double.TryParse(Convert.ToString(dr["DeviationValue"]), out deviationValue)) deviationValue = 0.0;

                        sm.MetricName = dr["MetricName"].ToString();
                        sm.MetricParentName = dr["MetricParentName"].ToString();
                        sm.EstablishmentName = dr["EstablishmentName"].ToString();
                        sm.SignificanceColorFlag = dr["SignificanceColorFlag"].ToString();
                        sm.DeviationValue = deviationValue;
                        list.Add(sm);
                    }
                    else if (spName == "USP_SituationAssesmentReport_FairShair_BestInClass")
                    {
                        if (!double.TryParse(Convert.ToString(dr["MetricPercentage"]), out metricPercentage)) metricPercentage = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["BICRating"]), out bicRating)) bicRating = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["BICGap"]), out bicGap)) bicGap = 0.0;

                        sm.MetricName = dr["MetricName"].ToString();
                        sm.MetricParentName = dr["MetricParentName"].ToString();
                        sm.EstablishmentName = dr["EstablishmentName"].ToString();
                        sm.BICEstablishmentName = dr["BICEstablishmentName"].ToString();
                        sm.MetricPercentage = metricPercentage;
                        sm.BICGap = bicGap;
                        sm.BICRating = bicRating;
                        sm.GroupName = dr["GroupName"].ToString();
                        sm.SignificanceColorFlag = dr["SignificanceColorFlag"].ToString();
                        list.Add(sm);

                    }
                    else
                    {
                        if (!double.TryParse(Convert.ToString(dr["MetricPercentage"]), out metricPercentage)) metricPercentage = 0.0;
                        if (!int.TryParse(Convert.ToString(dr["MetricSamplesize"]), out sampleSize)) sampleSize = 0;
                        if (!double.TryParse(Convert.ToString(dr["CB1Sig"]), out significance1)) significance1 = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["CB2Sig"]), out significance2)) significance2 = 0.0;

                        if (!double.TryParse(Convert.ToString(dr["CB1Percentage"]), out CB1Percentage)) CB1Percentage = 0.0;
                        if (!double.TryParse(Convert.ToString(dr["CB2Percentage"]), out CB2Percentage)) CB2Percentage = 0.0;

                        if (!int.TryParse(Convert.ToString(dr["CB1Index"]), out custombaseIndex1)) custombaseIndex1 = 0;
                        if (!int.TryParse(Convert.ToString(dr["CB2Index"]), out custombaseIndex2)) custombaseIndex2 = 0;

                        sm.MetricName = dr["MetricName"].ToString();
                        sm.MetricParentName = dr["MetricParentName"].ToString();
                        sm.CustomBaseName1 = dr["CB1"].ToString();
                        sm.CustomBaseName2 = dr["CB2"].ToString();
                        sm.EstablishmentName = dr["EstablishmentName"].ToString();
                        sm.MetricPercentage = metricPercentage;// sampleSize < 30 ? null : (double?)
                        sm.MetricSampleSize = dr["MetricSamplesize"] == DBNull.Value ? null : (int?)sampleSize;
                        sm.CustomBaseIndex1 = dr["CB1Index"] == DBNull.Value ? null : (int?)custombaseIndex1;
                        sm.CustomBaseIndex2 = dr["CB2Index"] == DBNull.Value ? null : (int?)custombaseIndex2;
                        sm.CB1Percentage = CB1Percentage;
                        sm.CB2Percentage = CB2Percentage;
                        sm.Significance1 = significance1;
                        sm.Significance2 = significance2;
                        sm.DefaultMetric = Convert.ToBoolean(dr["DefaultMetric"]);
                        sm.IsChannelFlag = Convert.ToBoolean(dr["IsChannelFlag"]);
                        list.Add(sm);
                    }
                }


            }
            return list;
        }

        public DataTable GetTableOutputPPT(FilterPanelInfo[] filter, string spName)
        {
            var list = new List<SituationAnalysisData>();
            object[] param = new object[10];
            param[0] = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            param[1] = ((string[])(filter.FirstOrDefault(x => x.Name == "Time Period")?.SelectedID))[0];
            if (((string[])(filter.FirstOrDefault(x => x.Name == "Advance Filters")?.SelectedID)) == null)
                param[2] = "";
            else
            {
                param[2] = ((string[])(filter.FirstOrDefault(x => x.Name == "Advance Filters")?.SelectedID))[0];
                List<string> listparm = param[2].ToString().Split('|').ToList();
                List<string> advanceVisitFilters = new List<string>();
                var isVisits = ((string[])(filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID))[0];
                if (((string[])(filter.FirstOrDefault(x => x.Name == "Advance Visit Filters")?.SelectedID)) == null)
                    advanceVisitFilters = new List<string>();
                else
                    advanceVisitFilters = ((string[])(filter.FirstOrDefault(x => x.Name == "Advance Visit Filters")?.SelectedID)).ToList();

                List<string> onlyGuestsList = new List<string>();
                if (isVisits == "0")
                {
                    param[2] = "";
                    for (int i = 0; i < listparm.Count; i++)
                    {
                        if (advanceVisitFilters.IndexOf(listparm[i]) == -1)
                            onlyGuestsList.Add(listparm[i]);
                    }
                    param[2] = string.Join("|", onlyGuestsList);
                }
            }

            param[3] = ((string[])(filter.FirstOrDefault(x => x.Name == "Competitors")?.SelectedID))[0];
            param[4] = ((string[])(filter.FirstOrDefault(x => x.Name == "FREQUENCY")?.SelectedID))[0];
            param[5] = ((string[])(filter.FirstOrDefault(x => x.Name == "IsVisit")?.SelectedID))[0];

            #region datatable for @selections parameter
            DataTable dt = new DataTable();
            dt.Columns.Add("UniqueId", typeof(Int32));
            dt.Columns.Add("EstablishmentId", typeof(string));
            dt.Columns.Add("EstablishmentName", typeof(string));
            dt.Columns.Add("SelectionType", typeof(string));

            string[] establishmentIds = ((string[])((filter.FirstOrDefault(x => x.Name == "Establishment")?.SelectedID)))[0].Split('|');
            string[] establishmentNames = string.Join("|", filter.FirstOrDefault(x => x.Name == "Establishment").Data.Select(x => x.Text)).Split('|');


            for (int i = 0; i < establishmentIds.Count(); i++)
            {
                DataRow dRow = dt.NewRow();
                dRow[0] = i + 1;
                dRow[1] = (establishmentNames[i] == "Previous Year" || establishmentNames[i] == "Previous Period" ? null : establishmentIds[i]);
                dRow[2] = establishmentNames[i];
                dRow[3] = i == 0 ? "Benchmark" : "Custombase";
                dt.Rows.Add(dRow);
            }
            #endregion

            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@TimePeriodId", SqlDbType.VarChar, param[0]);
                database.AddInParameter(cmd, "@TimePeriodType", SqlDbType.VarChar, param[1]);
                database.AddInParameter(cmd, "@Selections", SqlDbType.Structured, dt);
                database.AddInParameter(cmd, "@FilterId", SqlDbType.VarChar, param[2]);
                database.AddInParameter(cmd, "@CompetitorsId", SqlDbType.VarChar, param[3]);
                database.AddInParameter(cmd, "@FrequencyId", SqlDbType.VarChar, param[4]);
                database.AddInParameter(cmd, "@IsGuestorVisit", SqlDbType.VarChar, param[5]);
                cmd.CommandTimeout = 12000;

            }
            var ds = database.ExecuteDataSet(cmd);


            if (ds == null)
                return null;
            else
                return ds.Tables[0];

        }

        public List<SituationLeftPanelMetrics> GetCompetitorsList(string selectedBenchMarkId)
        {
            var sl = new List<SituationLeftPanelMetrics>();
            string spName = "USP_SituationAssesmentReport_CompetiorsList";
            using (cmd = database.GetStoredProcCommand(spName))
            {
                database.AddInParameter(cmd, "@BenchMarkId", SqlDbType.VarChar, selectedBenchMarkId);
                cmd.CommandTimeout = 12000;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    var cl = new SituationLeftPanelMetrics();
                    cl.MeasureId = Convert.ToInt32(dr["CompetitorsId"]);
                    cl.MeasureName = Convert.ToString(dr["CompetitorsName"]);
                    sl.Add(cl);
                }
            }
            return sl;
        }
        public Int32 SaveChangedColorCodeForSAR(DataTable colorTable)
        {
            string _spName = "USP_SituationAssesmentReport_ColorCode";

            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@ColorCode", SqlDbType.Structured, colorTable);
                cmd.CommandTimeout = 300;
                return Convert.ToInt32(database.ExecuteScalar(cmd));
            }
        }

        public string CreateSection(DataTable sectionTable)
        {
            string _spName = "USP_InSightsMeetingPlanner_CreateParentSection";
            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@ParentSection", SqlDbType.Structured, sectionTable);
                cmd.CommandTimeout = 300;
                return Convert.ToString(database.ExecuteScalar(cmd));
            }
        }

        public string OverwriteSection(List<MacroDetails> sections,string username)
        {
            string _spName = "USP_InSightsMeetingPlanner_OverWriteParentSection";

            using (cmd = database.GetStoredProcCommand(_spName))
            {

                   
                    database.AddInParameter(cmd, "@SectionName ", SqlDbType.VarChar, Convert.ToString(sections[0].SectionName));
                    database.AddInParameter(cmd, "@SectionDescription", SqlDbType.VarChar, Convert.ToString(sections[0].SectionDesc));
                    database.AddInParameter(cmd, "@Createdby", SqlDbType.VarChar, Convert.ToString(username));
                    cmd.CommandTimeout = 12000;
                var ds = database.ExecuteScalar(cmd);
                return ds.ToString();
            }
        }
        public string DeleteSectionOrSubsection(DataTable sectionTable)
        {
            string _spName = "USP_InSightsMeetingPlanner_DeleteSectionsAndSubSections";
            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@DeleteSectionsAndSubSections", SqlDbType.Structured, sectionTable);
                cmd.CommandTimeout = 300;
                return Convert.ToString(database.ExecuteScalar(cmd));
            }
        }
        public string SubmitSectionOrder(DataTable sectionTable)
        {
            string _spName = "USP_InSightsMeetingPlanner_ReorderSectionsAndSubSections";
            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@Reorder", SqlDbType.Structured, sectionTable);
                cmd.CommandTimeout = 600;
                return Convert.ToString(database.ExecuteScalar(cmd));
            }
        }
     
        public string EditSection(MacroDetails sections)
        {
            string _spName = "USP_InSightsMeetingPlanner_ModifySectionsOrSubSections";

            using (cmd = database.GetStoredProcCommand(_spName))
            {

                using (cmd = database.GetStoredProcCommand(_spName))
                {
                    database.AddInParameter(cmd, "@SectionId", SqlDbType.Int, Convert.ToInt16(sections.SectionId));
                    database.AddInParameter(cmd, "@SubSectionId", SqlDbType.Int, null);
                    database.AddInParameter(cmd, "@SectionOrSubSectionName ", SqlDbType.VarChar, Convert.ToString(sections.SectionName));
                    database.AddInParameter(cmd, "@SectionOrSubSectionDescription", SqlDbType.VarChar, Convert.ToString(sections.SectionDesc));

                    cmd.CommandTimeout = 12000;

                }
                var ds = database.ExecuteScalar(cmd);
                return ds.ToString();
            }
        }
        public string LockSection(MacroDetails sections)
        {
            string _spName = "USP_InSightsMeetingPlanner_LockAndUnlockSections";

            using (cmd = database.GetStoredProcCommand(_spName))
            {

                using (cmd = database.GetStoredProcCommand(_spName))
                {
                    database.AddInParameter(cmd, "@ParentOrSubSecctionId ", SqlDbType.Int, Convert.ToInt16(sections.ParentorSubSectId));
                    database.AddInParameter(cmd, "@IsParentOrSubSection", SqlDbType.Bit,Convert.ToBoolean(sections.IsSectionorSubsection));
                    database.AddInParameter(cmd, "@IsLock ", SqlDbType.Bit,Convert.ToInt16(sections.IsLock));
                   

                    cmd.CommandTimeout = 12000;

                }
                var ds = database.ExecuteScalar(cmd);
                return ds.ToString();
            }
        }

        public string EditSubSection(MacroDetails sections)
        {
            string _spName = "USP_InSightsMeetingPlanner_ModifySectionsOrSubSections";

            using (cmd = database.GetStoredProcCommand(_spName))
            {

                using (cmd = database.GetStoredProcCommand(_spName))
                {
                    database.AddInParameter(cmd, "@SectionId", SqlDbType.Int, Convert.ToInt16(sections.SectionId));
                    database.AddInParameter(cmd, "@SubSectionId", SqlDbType.Int, sections.SubsectionId);
                    database.AddInParameter(cmd, "@SectionOrSubSectionName ", SqlDbType.VarChar, Convert.ToString(sections.SubSectionName));
                    database.AddInParameter(cmd, "@SectionOrSubSectionDescription", SqlDbType.VarChar, Convert.ToString(sections.SubSectionNamedesc));

                    cmd.CommandTimeout = 12000;

                }
                var ds = database.ExecuteScalar(cmd);
                return ds.ToString();
            }
        }
        public string UploadFile(DataTable SubsecTable)
        {
            string _spName = "USP_InSightsMeetingPlanner_CreateSubSection";
            using (cmd = database.GetStoredProcCommand(_spName))
            {
                database.AddInParameter(cmd, "@SubSection", SqlDbType.Structured, SubsecTable);
                cmd.CommandTimeout = 300;
                return Convert.ToString(database.ExecuteScalar(cmd));
            }
        }
        public string UploadOverwriteFile(List<MacroDetails> SubsecTable,string username)
        {
            string _spName = "USP_InSightsMeetingPlanner_OverWriteSubSection ";
            using (cmd = database.GetStoredProcCommand(_spName))
            {

                using (cmd = database.GetStoredProcCommand(_spName))
                {
                    database.AddInParameter(cmd, "@SubSectionName", SqlDbType.VarChar, Convert.ToString(SubsecTable[0].SubSectionName));
                    database.AddInParameter(cmd, "@SubSectionDescription", SqlDbType.VarChar, Convert.ToString(SubsecTable[0].SubSectionNamedesc));
                    database.AddInParameter(cmd, "@UploadedBy", SqlDbType.VarChar, Convert.ToString(username));
                    database.AddInParameter(cmd, "@SlideCount", SqlDbType.VarChar, Convert.ToString(SubsecTable[0].SlideCount));
                    database.AddInParameter(cmd, "@SectionId", SqlDbType.Int,SubsecTable[0].SectionId);

                    cmd.CommandTimeout = 12000;

                }
                var ds = database.ExecuteScalar(cmd);
                return ds.ToString();
            }
        }
        public List<MacroDetails> GetSectionNameDropDwnList()
        {
            var macroDetailsList = new List<MacroDetails>();
            string _spName = "USP_InSightsMeetingPlanner_SectionDropDown ";
            using (cmd = database.GetStoredProcCommand(_spName))
            {

                cmd.CommandTimeout = 300;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    var macroDetails = new MacroDetails();
                    macroDetails.SectionId = Convert.ToInt32(dr["SectionId"]);
                    macroDetails.SectionName = Convert.ToString(dr["SectionName"]);
                    macroDetailsList.Add(macroDetails);
                }
            }
            return macroDetailsList;
        }
        public List<MacroDetails> GetSubSectionName()
        {
            var macroDetailsList = new List<MacroDetails>();
            string _spName = "USP_InSightsMeetingPlanner_GetSubSectionNames";
            using (cmd = database.GetStoredProcCommand(_spName))
            {

                cmd.CommandTimeout = 300;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    var macroDetails = new MacroDetails();

                    macroDetails.SubSectionName = Convert.ToString(dr["SubSectionName"]);
                    macroDetailsList.Add(macroDetails);
                }
            }
            return macroDetailsList;
        }
        public List<MacroDetails> GetModifySectnsData()
        {
            var macroDetailsList = new List<MacroDetails>();
            string _spName = "USP_InSightsMeetingPlanner_GetSectionsandSubSections";
            using (cmd = database.GetStoredProcCommand(_spName))
            {

                cmd.CommandTimeout = 300;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    var macroDetails = new MacroDetails();

                    macroDetails.ParentorSubSectId = Convert.ToInt32(dr["SectionorSubSectionId"]);
                    macroDetails.ParentorSubSectName = Convert.ToString(dr["ParentorSubSectionName"]);
                    macroDetails.ParentorSubSectDesc = Convert.ToString(dr["ParentorSubSectionDescription"]);
                    macroDetails.UploadedBy = Convert.ToString(dr["UploadedBy"]);
                    macroDetails.UploadedDate = Convert.ToString(dr["UploadedDate"]);
                    macroDetails.SlideCount = Convert.ToInt32(dr["SlideCount"]);
                    macroDetails.IsSectLoced = Convert.ToBoolean(dr["IsSectionLocked"]);
                    macroDetails.ParentSectName = Convert.ToString(dr["ParentSectionName"]);
                    macroDetailsList.Add(macroDetails);
                }
            }
            return macroDetailsList;
        }
        public List<EstablishmentLogoDetails> GetEstablishmentLogoData()
        {
            var EstablishmentLogoList = new List<EstablishmentLogoDetails>();
            string _spName = "USP_InSightsMeetingPlanner_Logolist";
            using (cmd = database.GetStoredProcCommand(_spName))
            {

                cmd.CommandTimeout = 300;
                var dr = database.ExecuteReader(cmd);
                while (dr.Read())
                {
                    var EstablishmentDetails = new EstablishmentLogoDetails();
                    EstablishmentDetails.EstablishmentId = Convert.ToInt32(dr["EstablishmentId"]);
                    EstablishmentDetails.EstablishmentName = Convert.ToString(dr["Establishmentname"]);
                    EstablishmentDetails.LogoName = Convert.ToString(dr["LogoName"]);
                    EstablishmentLogoList.Add(EstablishmentDetails);
                }
            }
            return EstablishmentLogoList;
        }
    }
}