using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Framework.Models;
using Framework.Data;
using System.Data;
using Aspose.Slides;
using AsposeSlide = Aspose.Slides;
using Aq.Plugin.AsposeExport.Contracts;
using Aq.Plugin.AsposeExport;
using AsposeChart = Aspose.Slides.Charts;
using System.Drawing;
using System.Text.RegularExpressions;
using Aq.Plugin.AsposeExport.Domain;
using Framework.Models.Report;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Svg;
using System.IO;
using System.Collections;

namespace Dine.BusinessLayer
{
    public class ReportDine : Interface.IReport
    {
        private static readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        internal string[] _CurrentColors;
        private readonly object PPTLock = new object();
        public string timePeriodForSlide;
        public string FooterNoteForSlide;
        public ReportDine()
        {
            _CurrentColors = new string[] { };
        }
        public ReportDine(string colorList)
        {
            _CurrentColors = colorList.Split('|').ToArray();
        }

        AsposeChart.IChart chart_to_change_dataLabelColors;
        List<Significance_Color> sig_col;
        ISlide cur_Slide;
        string selectedStatText = "";
        int deviationValue = 0;
        int rangeValue = 0;
        public DataTable dt24 = new DataTable();
        public IEnumerable<LowSampleSizeEstList> GetValidEstablishmentList(FilterPanelInfo[] filter, string module)
        {
            DataTable dt = (new Report()).GetValidEstablishmentList(filter, null, module);
            List<LowSampleSizeEstList> lst = new List<LowSampleSizeEstList>(); //lst.estList = new List<string>();
            if (module == "situationassessmentreport")
            {
                foreach (DataRow item in dt.Rows)
                {
                    int ss = 0, compss = 0;
                    //sabat
                    int mss = 0;
                    int.TryParse(item["SampleSize"].ToString(), out ss);
                    int.TryParse(item["TotalVisitSampleSize"].ToString(), out compss);
                    //sabat
                    int.TryParse(item["MonthlyPlusSampleSize"].ToString(), out mss);
                    string selectionType = item["SelectionType"].ToString();
                    

                    if (selectionType!= "Competitors" && (ss < 30))
                    {
                        //sabat
                        if (mss < 30)
                        {
                            lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "LSS", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });
                        }
                        else
                        {
                            lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "MSS", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });
                        }
                        //lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "LSS", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });

                    }
                    else if (selectionType != "Competitors" && (ss > 30 && ss < 99))
                        lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "Directional", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });
                    else if(selectionType == "Competitors" && compss < 30)
                    {
                        if (mss < 30)
                        {
                            lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "LSS", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });
                        }
                        else
                        {
                            lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "TotalVisitsLSS", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });
                        }
                    }
                    //if (compss < 30 && item["SelectionType"].ToString() == "Competitors")
                    //    lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "TotalVisitsLSS", SelectionType = item["SelectionType"].ToString(), TimePeriodType = item["TimePeriodType"].ToString(), EstablishmentId = item["EstablishmentId"].ToString() });
                }
            }
            else
            {
                foreach (DataRow item in dt.Rows)
                {
                    int ss = 0;
                    int.TryParse(item["SampleSize"].ToString(), out ss);
                    if (ss < 30)
                        lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "LSS" });
                    else if (ss > 30 && ss < 99)
                        lst.Add(new LowSampleSizeEstList() { EstName = item["EstName"].ToString(), IsUseDirectional = "Directional" });
                }
            }
            return lst;
        }
        public string PrepareReport(string sourceTemplatePath, FilterPanelInfo[] filter, string module, string selectedDemofiltersList, HttpContextBase context, List<ColorCodeData> colorCodeList, string userId)
        {
            var destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            DataSet outputDataSet = null;
            string benchmark = filter.FirstOrDefault(x => x.Name == "Benchmark").Data[0].ID.ToString();
            string isCustmDownld = (filter.FirstOrDefault(x => x.Name == "IsCustomDownload")).SelectedText;
            selectedDemofiltersList = filter.FirstOrDefault(x => x.MetricType == "Advanced Filters").Data == null ? "" : string.Join(",", filter.FirstOrDefault(x => x.MetricType == "Advanced Filters").Data.Select(x => x.Text));
            IEnumerable<string> comparisions;
            if ((filter.FirstOrDefault(x => x.Name == "Comparisions")).Data == null) { comparisions = new List<string>(); }
            else { comparisions = filter.FirstOrDefault(x => x.Name == "Comparisions").Data.Select(x => x.ID).ToList().OfType<string>(); }

            var listofIDs = (filter.FirstOrDefault(x => x.Name == "Slide Names").Data.Select(x => x.Text)).ToList();
            List<int> slideIDs = listofIDs.Select(int.Parse).ToList();
            slideIDs.Sort();
            if (module == "Dine")
            {
                outputDataSet = (new Report()).GetDataTable(filter, null, module, colorCodeList, userId);
                prepareP2PReportPPT(sourceTemplatePath, destinationtemplate, benchmark, comparisions, context, outputDataSet, slideIDs, filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text).FirstOrDefault().ToString(), selectedDemofiltersList, isCustmDownld, filter, colorCodeList);
            }
            else
            {
                outputDataSet = (new Report()).GetDataTableWithFrequency(filter, null, module, colorCodeList, userId);
                prepareDinerReportPPT(sourceTemplatePath, destinationtemplate, benchmark, comparisions, context, outputDataSet, slideIDs, filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text).FirstOrDefault().ToString(), selectedDemofiltersList, isCustmDownld, filter, colorCodeList);
            }
            return destinationtemplate;
        }
        public void prepareDinerReportPPT(string sourceTemplatePath, string destinationtemplate, string benchmark, IEnumerable<string> comparisions, HttpContextBase context, DataSet outputDataSet, List<int> slideIDs, string timeperiod, string selectedDemofiltersList, string isCustmDownld, FilterPanelInfo[] filter, List<ColorCodeData> colorCodeList)
        {
            ISlideReplace _slideReplace = new SlideReplace();
            IList<ChartDetail> charts = new List<ChartDetail>();
            int series_ind = 0, dp_index = 0, i = 0;
            int tbl_ind = 0;
            sbyte overlap_val = -20;
            double xAxis_fact = 1, additionalFact = 0.2, temp_hld = 0.0; DataRow tempDr;
            string totalSamplesizeComp = "", totalSamplesize = "", frequency = filter.FirstOrDefault(x => x.Name == "Frequency").Data.Select(x => x.Text).FirstOrDefault().ToString();
            selectedStatText = (filter.FirstOrDefault(x => x.Name == "StatTest")).SelectedText;
            //Slides
            using (Presentation pres = new Presentation(sourceTemplatePath))
            {
                #region Set Legends and Footer in the master slide Layout 0

                AsposeSlide.ITable tb = (AsposeSlide.ITable)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TableLegends");

                if (tb != null)
                {
                    totalSamplesize = (from row in outputDataSet.Tables[0].AsEnumerable()
                                       where Convert.ToString(row.Field<object>("EstablishmentName")) == benchmark && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                       select Convert.ToString(row.Field<object>(slideIDs.Contains(4) ? "Samplesize" : "TotalSamplesize"))).FirstOrDefault();
                    tb.Rows[0][2].TextFrame.Text = benchmark + "\n(" + Convert.ToInt32(totalSamplesize).ToString("###,##0") + ")";
                    tb.Rows[0][1].FillFormat.FillType = FillType.Solid;
                    tb.Rows[0][1].FillFormat.SolidFillColor.Color = (0 >= _CurrentColors.Length) ? GlobalConstants.LegendColors[0] : ColorTranslator.FromHtml(_CurrentColors[0]);

                    for (i = 0; i < comparisions.Count(); i++)
                    {
                        totalSamplesizeComp = (from row in outputDataSet.Tables[0].AsEnumerable()
                                               where Convert.ToString(row.Field<object>("EstablishmentName")) == comparisions.ElementAt(i) && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                               select Convert.ToString(row.Field<object>(slideIDs.Contains(4) ? "Samplesize" : "TotalSamplesize"))).FirstOrDefault();

                        tb.Rows[0][4 + 2 * i].TextFrame.Text = comparisions.ElementAt(i) + "\n(" + Convert.ToInt32(totalSamplesizeComp).ToString("###,##0") + ")";
                        tb.Rows[0][3 + 2 * i].FillFormat.FillType = FillType.Solid;
                        tb.Rows[0][3 + 2 * i].FillFormat.SolidFillColor.Color = ((i + 1) >= _CurrentColors.Length) ? GlobalConstants.LegendColors[i + 1] : ColorTranslator.FromHtml(_CurrentColors[i + 1]);
                    }
                    //If not full then remove the Other Legends
                    if (comparisions.Count() != 4)
                    {
                        i = 3 + 2 * comparisions.Count();
                        for (; i < tb.Columns.Count; i++)
                        {
                            tb.Rows[0][i].FillFormat.FillType = FillType.Solid;
                            tb.Rows[0][i].FillFormat.SolidFillColor.Color = Color.White;
                            tb.Rows[0][i].TextFrame.Text = "";
                        }
                    }
                }
                #endregion Set Legends and Footer in the master slide

                #region  Master Footer
                //((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: DINE\x2083\x2086\x2080 - Time Period: " + timeperiod + "; Base: Total Visits; % Visits\nFilters:" + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                if (selectedStatText.ToString().ToLower() == "previous period" || selectedStatText.ToString().ToLower() == "previous year")
                {
                    ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "benchmark")).TextFrame.Text = selectedStatText;
                }
                else
                {
                    selectedStatText = benchmark;
                    ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "benchmark")).TextFrame.Text = "Benchmark - " + benchmark;
                }

                ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "StatTestAgainst")).TextFrame.Text = "* Stat tested at 95% CL against " + selectedStatText;
                //, Base: Guests(Monthly +), Time Period: 12MMT Sep 2018
                ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: DINE\x2083\x2086\x2080 - Time Period: " + timeperiod + "; Base: Guests (" + frequency + "); % Guests\nFilters: " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                //((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: CCNA DINE\x2083\x2086\x2080 Tracker, Base: Guests (" + frequency + "), Time Period: " + timeperiod + "\nFilters: " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                #endregion  Master Footer

                #region Slide 1
                cur_Slide = pres.Slides[0];
                charts = new List<ChartDetail>();
                string estList = "";
                for (i = 0; i < comparisions.Count(); i++)
                {
                    estList = String.Concat(estList, ", " + comparisions.ElementAt(i));
                }
                ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Brands")).TextFrame.Text = benchmark + estList;
                ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Filter_Timeperiod")).TextFrame.Text = "Base – Guests (" + frequency + ") ," + "Filters - " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList) + "\n" + timeperiod;
                #endregion Slide 1

                List<int> fixedSlides = new List<int>() { 1, 2, 3, 6, 10, 14, 20 };
                //Loop through each  SlideIDs/dataSet
                foreach (int slideId in slideIDs)
                {
                    if (outputDataSet.Tables.Count > tbl_ind)
                    {
                        if (outputDataSet.Tables[tbl_ind].Rows.Count > 0)
                        {
                            xAxis_fact = (Convert.ToDouble(outputDataSet.Tables[tbl_ind].Compute("max([MetricValue])", string.Empty))) * 100;
                            xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                            sig_col = new List<Significance_Color>();
                            //#region Set sample size in table
                            //AsposeSlide.ITable tb = (AsposeSlide.ITable)pres.Slides[slideId - 1].Shapes.FirstOrDefault(x => x.Name == "TableLegends");
                            //if (tb != null)
                            //{
                            //    totalSamplesize = (from row in outputDataSet.Tables[tbl_ind].AsEnumerable()
                            //                       where Convert.ToString(row.Field<object>("EstablishmentName")) == benchmark && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                            //                       select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();
                            //    totalSamplesize = totalSamplesize == "" ? "0" : totalSamplesize;
                            //    tb.Rows[0][2].TextFrame.Text = benchmark + "\n(" + Convert.ToInt32(totalSamplesize).ToString("#,##,##0") + ")";
                            //    tb.Rows[0][1].FillFormat.FillType = FillType.Solid;
                            //    tb.Rows[0][1].FillFormat.SolidFillColor.Color = (0 >= _CurrentColors.Length) ? GlobalConstants.LegendColors[0] : ColorTranslator.FromHtml(_CurrentColors[0]);


                            //    for (i = 0; i < comparisions.Count(); i++)
                            //    {
                            //        totalSamplesizeComp = (from row in outputDataSet.Tables[tbl_ind].AsEnumerable()
                            //                               where Convert.ToString(row.Field<object>("EstablishmentName")) == comparisions.ElementAt(i) && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                            //                               select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();
                            //        totalSamplesize = totalSamplesize == "" ? "0" : totalSamplesize;
                            //        tb.Rows[0][4 + 2 * i].TextFrame.Text = comparisions.ElementAt(i) + "\n(" + Convert.ToInt32(totalSamplesizeComp).ToString("#,##,##0") + ")";
                            //        tb.Rows[0][3 + 2 * i].FillFormat.FillType = FillType.Solid;
                            //        tb.Rows[0][3 + 2 * i].FillFormat.SolidFillColor.Color = ((i + 1) >= _CurrentColors.Length) ? GlobalConstants.LegendColors[i + 1] : ColorTranslator.FromHtml(_CurrentColors[i + 1]);
                            //    }
                            //    //If not full then remove the Other Legends
                            //    if (comparisions.Count() != 4)
                            //    {
                            //        i = 3 + 2 * comparisions.Count();
                            //        for (; i < tb.Columns.Count; i++)
                            //        {
                            //            tb.Rows[0][i].FillFormat.FillType = FillType.Solid;
                            //            tb.Rows[0][i].FillFormat.SolidFillColor.Color = Color.White;
                            //            tb.Rows[0][i].TextFrame.Text = "";
                            //        }
                            //    }
                            //}
                            //#endregion Set sample size in table
                            switch (slideId)
                            {
                                #region Slide 4
                                case 4:
                                    cur_Slide = pres.Slides[3];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    #region //TotalGB
                                    //TotalGB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Guest Frequency").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "TotalGB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of  Total Guests Are Also " + frequency + " Guests To " + benchmark + ".";
                                    charts = GetChartDetails(charts, "TotalGB", outputDataSet.Tables[tbl_ind], "Guest Frequency");
                                    #endregion //TotalGB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "TotalGB", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 4
                                #region Slide 5
                                case 5:
                                    cur_Slide = pres.Slides[4];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Frequency Profile - " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Guest Frequency (" + frequency + " Guest Base)";
                                    #region //MGB
                                    //MGB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Guest Frequency").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "MGB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are Also " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Guests To " + benchmark + ".";
                                    charts = GetChartDetails(charts, "MGB", outputDataSet.Tables[tbl_ind], "Guest Frequency");
                                    #endregion //MGB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "MGB", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 5
                                #region Slide 7
                                case 7:
                                    cur_Slide = pres.Slides[6];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    #region //Gender
                                    //Gender_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Male").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Gender_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are Male.";
                                    charts = GetChartDetails(charts, "Gender_Chart", outputDataSet.Tables[tbl_ind], "Gender");
                                    #endregion //Gender
                                    #region //Age
                                    //Age_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "13 - 18").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Age_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are 13-18 Year Old.";
                                    charts = GetChartDetails(charts, "Age_Chart", outputDataSet.Tables[tbl_ind], "Age");

                                    #endregion //Age
                                    #region //Race/Ethnicity
                                    //Race-Ethnicity_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "White").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Race/Ethinicity_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are White.";
                                    charts = GetChartDetails(charts, "Race-Ethnicity_Chart", outputDataSet.Tables[tbl_ind], "Race/ Ethnicity");
                                    #endregion //Race/Ethnicity
                                    #region //Occupation
                                    //Occupation_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "White Collar").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Occupation_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are White Collar.";
                                    charts = GetChartDetails(charts, "Occupation_Chart", outputDataSet.Tables[tbl_ind], "Occupation");
                                    #endregion //Occupation
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Gender_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Age_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Race-Ethnicity_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Occupation_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 7
                                #region Slide 8
                                case 8:
                                    cur_Slide = pres.Slides[7];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    #region //Socioeconomic_Level
                                    //Socioeconomic_Level_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Single Low Income").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Socioeconomic_Level_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are Single Low Income.";
                                    charts = GetChartDetails(charts, "Socioeconomic_Level_Chart", outputDataSet.Tables[tbl_ind], "Socioeconomic Level");
                                    #endregion //Socioeconomic_Level
                                    #region //HH_Income
                                    //HH_Income_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Less Than $25,000").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "HH_Income_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Have Less Than $25,000 HH Income";
                                    charts = GetChartDetails(charts, "HH_Income_Chart", outputDataSet.Tables[tbl_ind], "HH Income");
                                    #endregion //HH_Income
                                    #region //HH_Size
                                    //HH_Size_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "1 Person Household").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "HH_Size_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are 1 Person Household Members.";
                                    charts = GetChartDetails(charts, "HH_Size_Chart", outputDataSet.Tables[tbl_ind], "HH Size");
                                    #endregion //HH_Size
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Socioeconomic_Level_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "HH_Income_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "HH_Size_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 8
                                #region Slide 9
                                case 9:
                                    cur_Slide = pres.Slides[8];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    #region //Marital_Status
                                    //Marital_Status_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Married").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Marital_Status_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are Married.";
                                    charts = GetChartDetails(charts, "Marital_Status_Chart", outputDataSet.Tables[tbl_ind], "Marital Status");
                                    #endregion //Marital_Status
                                    #region //Parental_Identification
                                    //Parental_Identification_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Parent Of Child <18 in HH").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Parental_Identification_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are Parents Of Child <18 In HH.";
                                    charts = GetChartDetails(charts, "Parental_Identification_Chart", outputDataSet.Tables[tbl_ind], "Parental Identification");
                                    #endregion //Parental_Identification
                                    #region //Diner_Segmentation
                                    //Diner_Segmentation_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Diner Segmentation").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Diner_Segmentation_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Are " + tempDr.Field<string>("Metricname");
                                    charts = GetChartDetails(charts, "Diner_Segmentation_Chart", outputDataSet.Tables[tbl_ind], "Diner Segmentation");
                                    #endregion //Diner_Segmentation
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Marital_Status_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Parental_Identification_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Diner_Segmentation_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 9

                                #region Slide 11
                                case 11:
                                    cur_Slide = pres.Slides[10];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Brnd_Hlth__Hdr")).TextFrame.Text = " Brand Health – " + frequency;
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Could Dine").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Brnd_Hlth_Readastxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Could Dine in " + benchmark;
                                    //charts = GetChartDetails(charts, "Brnd_Hlth_Chart", outputDataSet.Tables[tbl_ind], "Establishment Loyality Pyramid");
                                    UpdatePyramidSeriesData(outputDataSet.Tables[tbl_ind], overlap_val, dp_index, series_ind, benchmark, "Brnd_Hlth_Chart", xAxis_fact);
                                    break;
                                #endregion Slide 11
                                #region Slide 12
                                case 12:
                                    cur_Slide = pres.Slides[11];
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Brnd_Hlth__Hdr")).TextFrame.Text = " Brand Health – " + frequency;
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                    createDinerImageryTable(cur_Slide, outputDataSet.Tables[tbl_ind]);
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Readastxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Say The Establishment " + Convert.ToString(tempDr.Field<string>("Metricname")) + ".";
                                    break;
                                #endregion Slide 12
                                #region Slide 13
                                case 13:
                                    cur_Slide = pres.Slides[12];
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Brnd_Hlth__Hdr")).TextFrame.Text = " Brand Health – " + frequency;
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Readastxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Say The Establishment " + Convert.ToString(tempDr.Field<string>("Metricname")) + ".";
                                    createDinerImageryTable(cur_Slide, outputDataSet.Tables[tbl_ind]);
                                    break;
                                #endregion Slide 13
                                #region Slide 15
                                case 15:
                                    cur_Slide = pres.Slides[14];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Beverage Categories Summary (" + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Beverage Categories (Top 10 For " + benchmark + " " + frequency + ")";
                                    #region //Beverage_Categories_Summary
                                    //Beverage_Categories_Summary_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Beverage Categories Summary").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Categories_Summary_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume SSD At Least Once A Month.";
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Categories_Summary_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Beverages Consumed By " + frequency + " Guests Atleast Once A Month Belong To Carbonated Soft Drinks.";
                                    charts = GetChartDetails(charts, "Beverage_Categories_Summary_Chart", outputDataSet.Tables[tbl_ind], "Beverage Categories Summary");
                                    #endregion //Beverage_Categories_Summary
                                    #region //Beverage_Categories
                                    //Beverage_Categories_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Beverage Categories (Top 10)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Categories_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume Reg SSD At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Beverage_Categories_Chart", outputDataSet.Tables[tbl_ind], "Beverage Categories (Top 10)");
                                    #endregion //Beverage_Categories
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Categories_Summary_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Categories_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 15

                                #region Slide 16
                                case 16:
                                    cur_Slide = pres.Slides[15];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Manufacture_Header")).TextFrame.Text = "Manufacturer Beverage Summary (" + frequency + ")";
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                    //Read As: <22%> Of <Monthly+> Guests to <McDonald’s> Consume Brands Manufactured By <TCCC> At Least Once A Month
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Manufacture_ReadTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests to " + benchmark + " Consume Brands Manufactured By " + tempDr.Field<string>("Metricname") + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Manufact_Bev_Sum_Chart", outputDataSet.Tables[tbl_ind], "Manufacturer Beverage Summary");
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Manufact_Bev_Sum_Chart", xAxis_fact);
                                    break;
                                #endregion Slide 16

                                #region Slide 17
                                case 17:
                                    cur_Slide = pres.Slides[16];
                                    charts = new List<ChartDetail>();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Favorite_Brnd_Hdr")).TextFrame.Text = "Favorite Brand Across NAB  (By Manufacturer For " + benchmark + " " + frequency + ")";
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                    //Read As: < 22 %> Of < Monthly +> Guests to < McDonald’s > Have A<TCCC> Manufactured Brand As Their Favorite Across NAB     
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Favt_Brnd_Manfact_ReadTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests to " + benchmark + " Have A " + tempDr.Field<string>("Metricname") + " Manufactured Brand As Their Favorite Across NAB";
                                    charts = GetChartDetails(charts, "Favt_Manfact_Chart", outputDataSet.Tables[tbl_ind], "Favorite Brand Across NAB (By Manufacturer)");
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Favt_Manfact_Chart", xAxis_fact);
                                    break;
                                #endregion Slide 17
                                #region Slide 18
                                case 18:
                                    cur_Slide = pres.Slides[17];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Total SSD (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Total SSD (Top 10 For " + benchmark + " Favorite Brand Within Category)";
                                    #region //Total_SSD
                                    //Total_SSD_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Total SSD(Top 10 for Midscale monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Total_SSD_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Total_SSD_Chart", outputDataSet.Tables[tbl_ind], "Total SSD(Top 10 for Midscale monthly+)");
                                    #endregion //Total_SSD
                                    #region //Total_SSD_FB
                                    //Total_SSD_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Total SSD(Top 10 for Midscale Favorite in Category").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Total_SSD_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Total SSD.";
                                    charts = GetChartDetails(charts, "Total_SSD_FB_Chart", outputDataSet.Tables[tbl_ind], "Total SSD(Top 10 for Midscale Favorite in Category");
                                    #endregion //Total_SSD_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Total_SSD_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Total_SSD_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 18
                                #region Slide 19
                                case 19:
                                    cur_Slide = pres.Slides[18];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = " Guest Demographics – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Favorite Brand Across NAB (Top 10 For " + benchmark + ")";
                                    #region //FBA
                                    //FBA_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Favorite Brand Across NAB").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "FBA_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Across NAB.";
                                    charts = GetChartDetails(charts, "FBA_Chart", outputDataSet.Tables[tbl_ind], "Favorite Brand Across NAB");
                                    #endregion //FBA
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "FBA_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 19
                                #region Slide 21
                                case 21:
                                    cur_Slide = pres.Slides[20];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Regular SSD (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Regular SSD (Top 10 For " + benchmark + " Favorite Brand Within Category)";
                                    #region Regular SSD
                                    //Regular_SSD_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Regular SSD (Top 10 for Midscale monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Regular_SSD_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Regular_SSD_Chart", outputDataSet.Tables[tbl_ind], "Regular SSD (Top 10 for Midscale monthly+)");
                                    #endregion Regular SSD
                                    #region Regular_SSD_FB
                                    //Regular_SSD_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Regular SSD (Top 10 for Midscale Favorite Brand in category))").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Regular_SSD_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Total SSD.";
                                    charts = GetChartDetails(charts, "Regular_SSD_FB_Chart", outputDataSet.Tables[tbl_ind], "Regular SSD (Top 10 for Midscale Favorite Brand in category))");
                                    #endregion Regular SSD_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Regular_SSD_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Regular_SSD_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 21
                                #region Slide 22
                                case 22:
                                    cur_Slide = pres.Slides[21];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Diet SSD (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Diet SSD (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Diet SSD
                                    //Diet_SSD_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Diet SSD(Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Diet_SSD_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Diet_SSD_Chart", outputDataSet.Tables[tbl_ind], "Diet SSD(Top 10 for Midscale Monthly+)");
                                    #endregion Diet SSD
                                    #region Diet_SSD_FB
                                    //Diet_SSD_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Diet SSD(Top 10 for Midscale Favorite Brand in Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Diet_SSD_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Diet SSD.";
                                    charts = GetChartDetails(charts, "Diet_SSD_FB_Chart", outputDataSet.Tables[tbl_ind], "Diet SSD(Top 10 for Midscale Favorite Brand in Category)");
                                    #endregion Diet_SSD_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Diet_SSD_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Diet_SSD_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 22
                                #region Slide 23
                                case 23:
                                    cur_Slide = pres.Slides[22];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "RTD Coffee (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "RTD Coffee (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region RTD_Coffee
                                    //RTD_Coffee_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "RTD Coffee (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Coffee_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "RTD_Coffee_Chart", outputDataSet.Tables[tbl_ind], "RTD Coffee (Top 10 for Midscale Monthly+)");
                                    #endregion RTD_Coffee
                                    #region RTD_Coffee_FB
                                    //RTD_Coffee_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "RTD Coffee (Top 10 for Midscale favorite in category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Coffee_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of RTD Coffee.";
                                    charts = GetChartDetails(charts, "RTD_Coffee_FB_Chart", outputDataSet.Tables[tbl_ind], "RTD Coffee (Top 10 for Midscale favorite in category)");
                                    #endregion RTD_Coffee_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Coffee_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Coffee_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 23
                                #region Slide 24
                                case 24:
                                    cur_Slide = pres.Slides[23];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Packaged RTD Tea (Bottle/Can/Carton) (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Packaged RTD Tea (Bottle/Can/Carton) (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region RTD_Tea
                                    //RTD_Coffee_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Packaged RTD Tea (Bottle/Can/Carton) (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Tea_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "RTD_Tea_Chart", outputDataSet.Tables[tbl_ind], "Packaged RTD Tea (Bottle/Can/Carton) (Top 10 for Midscale Monthly+)");//RTD Tea (Top 10 for Midscale Monthly+)
                                    #endregion RTD_Tea
                                    #region RTD_Tea_FB
                                    //RTD_Coffee_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Packaged RTD Tea (Bottle/Can/Carton) (Top 10 for Midscale favorite in category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Tea_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of RTD Tea.";
                                    charts = GetChartDetails(charts, "RTD_Tea_FB_Chart", outputDataSet.Tables[tbl_ind], "Packaged RTD Tea (Bottle/Can/Carton) (Top 10 for Midscale favorite in category)");//RTD Tea (Top 10 for Midscale favorite in category)
                                    #endregion RTD_Tea_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Tea_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Tea_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 24
                                #region Slide 25
                                case 25:
                                    cur_Slide = pres.Slides[24];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Fountain/ Soda Machine Tea (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Fountain/ Soda Machine Tea (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Fountain_Soda_Machine_Tea
                                    //Fountain_Soda_Machine_Tea_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Fountain/Soda Machine Tea (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Fountain_Soda_Machine_Tea_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Fountain_Soda_Machine_Tea_Chart", outputDataSet.Tables[tbl_ind], "Fountain/Soda Machine Tea (Top 10 for Midscale Monthly+)");
                                    #endregion Fountain_Soda_Machine_Tea
                                    #region Fountain_Soda_Machine_Tea_FB
                                    //Fountain_Soda_Machine_Tea_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Fountain/Soda Machine Tea (Top 10 for Midscale favorite in category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Fountain_Soda_Machine_Tea_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Fountain/ Soda Machine Tea.";
                                    charts = GetChartDetails(charts, "Fountain_Soda_Machine_Tea_FB_Chart", outputDataSet.Tables[tbl_ind], "Fountain/Soda Machine Tea (Top 10 for Midscale favorite in category)");
                                    #endregion Fountain_Soda_Machine_Tea_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Fountain_Soda_Machine_Tea_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Fountain_Soda_Machine_Tea_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 25
                                #region Slide 26
                                case 26:
                                    cur_Slide = pres.Slides[25];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Dairy Alternative (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Dairy Alternative (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Dairy_Alternatives
                                    //Dairy_Alternatives_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Dairy Alternative (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dairy_Alternatives_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Dairy_Alternatives_Chart", outputDataSet.Tables[tbl_ind], "Dairy Alternative (Top 10 for Midscale Monthly+)");
                                    #endregion Dairy_Alternatives
                                    #region Dairy_Alternatives_FB
                                    //Dairy_Alternatives_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Dairy Alternative (Top 10 for Midscale Favorite In category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dairy_Alternatives_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Dairy Alternative.";
                                    charts = GetChartDetails(charts, "Dairy_Alternatives_FB_Chart", outputDataSet.Tables[tbl_ind], "Dairy Alternative (Top 10 for Midscale Favorite In category)");
                                    #endregion Dairy_Alternatives_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Dairy_Alternatives_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Dairy_Alternatives_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 26
                                #region Slide 27
                                case 27:
                                    cur_Slide = pres.Slides[26];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Protein Drinks (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Protein Drinks (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Protein_Drinks
                                    //Protein_Drinks_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Protein Drinks (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Protein_Drinks_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Protein_Drinks_Chart", outputDataSet.Tables[tbl_ind], "Protein Drinks (Top 10 for Midscale Monthly+)");
                                    #endregion Protein_Drinks
                                    #region Protein_Drinks_FB
                                    //Protein_Drinks_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Protein Drinks (Top 10 for Midscale Favorite in category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Protein_Drinks_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Protein Drink.";
                                    charts = GetChartDetails(charts, "Protein_Drinks_FB_Chart", outputDataSet.Tables[tbl_ind], "Protein Drinks (Top 10 for Midscale Favorite in category)");
                                    #endregion Protein_Drinks_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Protein_Drinks_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Protein_Drinks_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 27
                                #region Slide 28
                                case 28:
                                    cur_Slide = pres.Slides[27];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "RTD Smoothies (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "RTD Smoothies (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region RTD_Smoothies
                                    //RTD_Smoothies_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "RTD Smoothies (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Smoothies_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "RTD_Smoothies_Chart", outputDataSet.Tables[tbl_ind], "RTD Smoothies (Top 10 for Midscale Monthly+)");
                                    #endregion RTD_Smoothies
                                    #region RTD_Smoothies_FB
                                    //RTD_Smoothies_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "RTD Smoothies (Top 10 for Midscale favorite in category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Smoothies_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of RTD Smoothie.";
                                    charts = GetChartDetails(charts, "RTD_Smoothies_FB_Chart", outputDataSet.Tables[tbl_ind], "RTD Smoothies (Top 10 for Midscale favorite in category)");
                                    #endregion RTD_Smoothies_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Smoothies_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Smoothies_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 28
                                #region Slide 29
                                case 29:
                                    cur_Slide = pres.Slides[28];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Meal Replacements (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Meal Replacements (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Meal_Replacements
                                    //Meal_Replacements_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Meal Replacements (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Meal_Replacements_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Meal_Replacements_Chart", outputDataSet.Tables[tbl_ind], "Meal Replacements (Top 10 for Midscale Monthly+)");
                                    #endregion Meal_Replacements
                                    #region Meal_Replacements_FB
                                    //Meal_Replacements_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Meal Replacements (Top 10 for Midscale favorite in category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Meal_Replacements_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Meal Replacement";
                                    charts = GetChartDetails(charts, "Meal_Replacements_FB_Chart", outputDataSet.Tables[tbl_ind], "Meal Replacements (Top 10 for Midscale favorite in category)");
                                    #endregion Meal_Replacements_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Meal_Replacements_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Meal_Replacements_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 29
                                #region Slide 30
                                case 30:
                                    cur_Slide = pres.Slides[29];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Drinkable Yogurt (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Drinkable Yogurt (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Drinkable_Yogurt
                                    //Drinkable_Yogurt_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Drinkable Yogurt (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Drinkable_Yogurt_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Drinkable_Yogurt_Chart", outputDataSet.Tables[tbl_ind], "Drinkable Yogurt (Top 10 for Midscale Monthly+)");
                                    #endregion Drinkable_Yogurt
                                    #region Drinkable_Yogurt_FB
                                    //Drinkable_Yogurt_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Drinkable Yogurt (Top 10 for Midscale Favorite In category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Drinkable_Yogurt_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Drinkable Yogurt.";
                                    charts = GetChartDetails(charts, "Drinkable_Yogurt_FB_Chart", outputDataSet.Tables[tbl_ind], "Drinkable Yogurt (Top 10 for Midscale Favorite In category)");
                                    #endregion Drinkable_Yogurt_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Drinkable_Yogurt_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Drinkable_Yogurt_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 30
                                #region Slide 31
                                case 31:
                                    cur_Slide = pres.Slides[30];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Packaged 100% Orange Juice (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Packaged 100% Orange Juice (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region 100%_Orange_Juice
                                    //100%_Orange_Juice_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Packaged 100% Orange Juice (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "100%_Orange_Juice_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "100%_Orange_Juice_Chart", outputDataSet.Tables[tbl_ind], "Packaged 100% Orange Juice (Top 10 for Midscale Monthly+)");//100% Orange Juice (Top 10 for Midscale Monthly+)
                                    #endregion 100%_Orange_Juice
                                    #region 100%_Orange_Juice_FB
                                    //100%_Orange_Juice_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Packaged 100% Orange Juice (Top 10 for Midscale Favorite In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "100%_Orange_Juice_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of 100% Orange Juice.";
                                    charts = GetChartDetails(charts, "100%_Orange_Juice_FB_Chart", outputDataSet.Tables[tbl_ind], "Packaged 100% Orange Juice (Top 10 for Midscale Favorite In Category)");//100% Orange Juice (Top 10 for Midscale Favorite In Category)
                                    #endregion 100%_Orange_Juice_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "100%_Orange_Juice_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "100%_Orange_Juice_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 31
                                #region Slide 32
                                case 32:
                                    cur_Slide = pres.Slides[31];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Vegetable Juice/ Vegetable + Juice Blends (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Vegetable Juice/ Vegetable + Juice Blends (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region 100%_Vegetable_Juices
                                    //100%_Vegetable_Juices_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Vegetable Juice/ Vegetable + Juice Blends (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "100%_Vegetable_Juices_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "100%_Vegetable_Juices_Chart", outputDataSet.Tables[tbl_ind], "Vegetable Juice/ Vegetable + Juice Blends (Top 10 for Midscale Monthly+)");//100% Vegetable Juices/ Blends (Top 10 for Midscale Monthly+)
                                    #endregion 100%_Vegetable_Juices
                                    #region 100%_Vegetable_Juices_FB
                                    //100%_Vegetable_Juices_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Vegetable Juice/ Vegetable + Juice Blends (Top 10 for Midscale Favorite In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "100%_Vegetable_Juices_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of 100% Vegetable Juice/ Blend.";
                                    charts = GetChartDetails(charts, "100%_Vegetable_Juices_FB_Chart", outputDataSet.Tables[tbl_ind], "Vegetable Juice/ Vegetable + Juice Blends (Top 10 for Midscale Favorite In Category)");//100% Vegetable Juices/ Blends (Top 10 for Midscale Favorite In Category)
                                    #endregion 100%_Vegetable_Juices_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "100%_Vegetable_Juices_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "100%_Vegetable_Juices_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 32
                                #region Slide 33
                                case 33:
                                    cur_Slide = pres.Slides[32];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Packaged 100% Juice (Not Orange) (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Packaged 100% Juice (Not Orange) (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region 100%_Juice_(Non_OJ)
                                    //100%_Juice_(Non_OJ)_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Packaged 100% Juice (Not Orange) (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "100%_Juice_(Non_OJ)_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "100%_Juice_(Non_OJ)_Chart", outputDataSet.Tables[tbl_ind], "Packaged 100% Juice (Not Orange) (Top 10 for Midscale Monthly+)");//100% Juice (Non OJ) (Top 10 for Midscale Monthly+)
                                    #endregion 100%_Juice_(Non_OJ)
                                    #region 100%_Juice_(Non_OJ)_FB
                                    //100%_Juice_(Non_OJ)_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Packaged 100% Juice (Not Orange) (Top 10 for Midscale Favorite In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "100%_Juice_(Non_OJ)_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of 100% Juice (Non OJ).";
                                    charts = GetChartDetails(charts, "100%_Juice_(Non_OJ)_FB_Chart", outputDataSet.Tables[tbl_ind], "Packaged 100% Juice (Not Orange) (Top 10 for Midscale Favorite In Category)");//100% Juice (Non OJ) (Top 10 for Midscale Favorite In Category)
                                    #endregion 100%_Juice_(Non_OJ)_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "100%_Juice_(Non_OJ)_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "100%_Juice_(Non_OJ)_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 33
                                #region Slide 34
                                case 34:
                                    cur_Slide = pres.Slides[33];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Lemonade (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Lemonade (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Lemonade
                                    //Lemonade_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Lemonade (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Lemonade_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Lemonade_Chart", outputDataSet.Tables[tbl_ind], "Lemonade (Top 10 for Midscale Monthly+)");
                                    #endregion Lemonade
                                    #region Lemonade_FB
                                    //Lemonade_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Lemonade (Top 10 for Midscale Favorite In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Lemonade_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Lemonade.";
                                    charts = GetChartDetails(charts, "Lemonade_FB_Chart", outputDataSet.Tables[tbl_ind], "Lemonade (Top 10 for Midscale Favorite In Category)");
                                    #endregion Lemonade_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Lemonade_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Lemonade_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 34
                                #region Slide 35
                                case 35:
                                    cur_Slide = pres.Slides[34];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Limeade (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Limeade (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Limeade
                                    //Limeade_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Limeade (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Limeade_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Limeade_Chart", outputDataSet.Tables[tbl_ind], "Limeade (Top 10 for Midscale Monthly+)");
                                    #endregion Limeade
                                    #region Limeade_FB
                                    //Limeade_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Limeade (Top 10 for Midscale Favorite In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Limeade_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Limeade.";
                                    charts = GetChartDetails(charts, "Limeade_FB_Chart", outputDataSet.Tables[tbl_ind], "Limeade (Top 10 for Midscale Favorite In Category)");
                                    #endregion Limeade_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Limeade_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Limeade_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 35
                                #region Slide 36
                                case 36:
                                    cur_Slide = pres.Slides[35];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "RTD Juice Drink or Ade (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "RTD Juice Drink or Ade (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Juice_Drinks
                                    //Juice_Drinks_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "RTD Juice Drink or Ade (Top 10 for Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Juice_Drinks_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Juice_Drinks_Chart", outputDataSet.Tables[tbl_ind], "RTD Juice Drink or Ade (Top 10 for Midscale Monthly+)");//Juice Drinks (Top 10 for Midscale Monthly+)
                                    #endregion Juice_Drinks
                                    #region Juice_Drinks_FB
                                    //Juice_Drinks_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "RTD Juice Drink or Ade (Top 10 for Midscale Favorite In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Juice_Drinks_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Juice Drink.";
                                    charts = GetChartDetails(charts, "Juice_Drinks_FB_Chart", outputDataSet.Tables[tbl_ind], "RTD Juice Drink or Ade (Top 10 for Midscale Favorite In Category)");//Juice Drinks (Top 10 for Midscale Favorite In Category)
                                    #endregion Juice_Drinks_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Juice_Drinks_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Juice_Drinks_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 36
                                #region Slide 37
                                case 37:
                                    cur_Slide = pres.Slides[36];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Unflavored Non-Sparkling Packaged Water (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Unflavored Non-Sparkling Packaged Water (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Unflavored_BW_Non-Sparkling
                                    //Unflavored_BW_Non-Sparkling_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Unflavored Non-Sparkling Packaged Water (Top 10 For Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Unflavored_BW_Non-Sparkling_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Unflavored_BW_Non-Sparkling_Chart", outputDataSet.Tables[tbl_ind], "Unflavored Non-Sparkling Packaged Water (Top 10 For Midscale Monthly+)");//Unflavored BW Non-Sparkling (Top 10 For Midscale Monthly+)
                                    #endregion Unflavored_BW_Non-Sparkling
                                    #region Unflavored_BW_Non-Sparkling_FB
                                    //Unflavored_BW_Non-Sparkling_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Unflavored Non-Sparkling Packaged Water (Top 10 For Midscale Favorite Brand In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Unflavored_BW_Non-Sparkling_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Unflavored BW Non-Sparkling.";
                                    charts = GetChartDetails(charts, "Unflavored_BW_Non-Sparkling_FB_Chart", outputDataSet.Tables[tbl_ind], "Unflavored Non-Sparkling Packaged Water (Top 10 For Midscale Favorite Brand In Category)");
                                    #endregion Unflavored_BW_Non-Sparkling_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Unflavored_BW_Non-Sparkling_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Unflavored_BW_Non-Sparkling_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 37
                                #region Slide 38
                                case 38:
                                    cur_Slide = pres.Slides[37];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Unflavored Sparkling Packaged Water (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Unflavored Sparkling Packaged Water (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Unflavored_Sparkling_Water
                                    //Unflavored_Sparkling_Water_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Unflavored Sparkling Packaged Water (Top 10 For Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Unflavored_Sparkling_Water_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Unflavored_Sparkling_Water_Chart", outputDataSet.Tables[tbl_ind], "Unflavored Sparkling Packaged Water (Top 10 For Midscale Monthly+)");
                                    #endregion Unflavored_Sparkling_Water
                                    #region Unflavored_Sparkling_Water_FB
                                    //Juice_Drinks_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Unflavored Sparkling Packaged Water (Top 10 For Midscale Favorite Brand In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Unflavored_Sparkling_Water_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Unflavored Sparkling Water.";
                                    charts = GetChartDetails(charts, "Unflavored_Sparkling_Water_FB_Chart", outputDataSet.Tables[tbl_ind], "Unflavored Sparkling Packaged Water (Top 10 For Midscale Favorite Brand In Category)");
                                    #endregion Unflavored_Sparkling_Water_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Unflavored_Sparkling_Water_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Unflavored_Sparkling_Water_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 38
                                #region Slide 39
                                case 39:
                                    cur_Slide = pres.Slides[38];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Flavored Non-Sparkling Packaged Water (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Flavored Non-Sparkling Packaged Water (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Flavored_Non-Sparkling_Water
                                    //Flavored_Non-Sparkling_Water_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Flavored Non-Sparkling Packaged Water (Top 10 For Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Flavored_Non-Sparkling_Water_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Flavored_Non-Sparkling_Water_Chart", outputDataSet.Tables[tbl_ind], "Flavored Non-Sparkling Packaged Water (Top 10 For Midscale Monthly+)");
                                    #endregion Flavored_Non-Sparkling_Water
                                    #region Flavored_Non-Sparkling_Water_FB
                                    //Flavored_Non-Sparkling_Water_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Flavored Non-Sparkling Packaged Water (Top 10 For Midscale Favorite Brand In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Flavored_Non-Sparkling_Water_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Flavored Non-Sparkling Water.";
                                    charts = GetChartDetails(charts, "Flavored_Non-Sparkling_Water_FB_Chart", outputDataSet.Tables[tbl_ind], "Flavored Non-Sparkling Packaged Water (Top 10 For Midscale Favorite Brand In Category)");
                                    #endregion Flavored_Non-Sparkling_Water_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Flavored_Non-Sparkling_Water_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Flavored_Non-Sparkling_Water_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 39
                                #region Slide 40
                                case 40:
                                    cur_Slide = pres.Slides[39];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Flavored Sparkling Water (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Flavored Sparkling Water (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Flavored_Sparkling_Water
                                    //Flavored Sparkling Water_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Flavored Sparkling Water (Top 10 For Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Flavored_Sparkling_Water_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Flavored_Sparkling_Water_Chart", outputDataSet.Tables[tbl_ind], "Flavored Sparkling Water (Top 10 For Midscale Monthly+)");
                                    #endregion Flavored_Sparkling_Water
                                    #region Flavored_Sparkling_Water_FB
                                    //Flavored Sparkling Water_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Flavored Sparkling Water (Top 10 For Midscale Favorite Brand In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Flavored_Sparkling_Water_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Flavored Sparkling Water.";
                                    charts = GetChartDetails(charts, "Flavored_Sparkling_Water_FB_Chart", outputDataSet.Tables[tbl_ind], "Flavored Sparkling Water (Top 10 For Midscale Favorite Brand In Category)");
                                    #endregion Flavored_Sparkling_Water_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Flavored_Sparkling_Water_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Flavored_Sparkling_Water_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 40
                                #region Slide 41
                                case 41:
                                    cur_Slide = pres.Slides[40];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Sports Drinks (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Sports Drinks (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Sports_Drinks
                                    //Sports_Drinks_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Sports Drinks (Top 10 For Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Sports_Drinks_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Sports_Drinks_Chart", outputDataSet.Tables[tbl_ind], "Sports Drinks (Top 10 For Midscale Monthly+)");
                                    #endregion Sports_Drinks
                                    #region Sports_Drinks_FB
                                    //Sports_Drinks_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Sports Drinks (Top 10 For Midscale Favorite Brand In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Sports_Drinks_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Sports Drink.";
                                    charts = GetChartDetails(charts, "Sports_Drinks_FB_Chart", outputDataSet.Tables[tbl_ind], "Sports Drinks (Top 10 For Midscale Favorite Brand In Category)");
                                    #endregion Sports_Drinks_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Sports_Drinks_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Sports_Drinks_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                #endregion Slide 41
                                #region Slide 42
                                case 42:
                                    cur_Slide = pres.Slides[41];
                                    charts = new List<ChartDetail>();
                                    //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "main_h")).TextFrame.Text = "Guest Beverage Consumption – " + frequency;
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h1")).TextFrame.Text = "Energy Drinks/ Shots (Top 10 For " + benchmark + " " + frequency + ")";
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "h2")).TextFrame.Text = "Energy Drinks/ Shots (Top 10 For " + benchmark + " Favorite Brand In Category)";
                                    #region Energy_Drinks_Shots
                                    //Energy_Drinks_Shots_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Energy Drinks/ Shots (Top 10 For Midscale Monthly+)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Energy_Drinks_Shots_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consume " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " At Least Once A Month.";
                                    charts = GetChartDetails(charts, "Energy_Drinks_Shots_Chart", outputDataSet.Tables[tbl_ind], "Energy Drinks/ Shots (Top 10 For Midscale Monthly+)");
                                    #endregion Energy_Drinks_Shots
                                    #region Energy_Drinks_Shots_FB
                                    //Energy_Drinks_Shots_FB_ReadAsText
                                    tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Energy Drinks/ Shots (Top 10 For Midscale Favorite Brand In Category)").FirstOrDefault();
                                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Energy_Drinks_Shots_FB_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of " + frequency + " Guests To " + benchmark + " Consider " + (tempDr == null ? "" : tempDr.Field<string>("Metricname").ToString()) + " Their Favorite Brand Of Energy Drink/ Shot.";
                                    charts = GetChartDetails(charts, "Energy_Drinks_Shots_FB_Chart", outputDataSet.Tables[tbl_ind], "Energy Drinks/ Shots (Top 10 For Midscale Favorite Brand In Category)");
                                    #endregion Energy_Drinks_Shots_FB
                                    _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                    #region Updating Charts with Data
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Energy_Drinks_Shots_Chart", xAxis_fact);
                                    UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Energy_Drinks_Shots_FB_Chart", xAxis_fact);
                                    #endregion Setting color for every charts
                                    break;
                                    #endregion Slide 42
                            }
                            if (fixedSlides.IndexOf(slideId) == -1 && slideId != 2)
                            {
                                tbl_ind++;
                            }
                        }
                        else
                        {
                            tbl_ind++;
                        }
                    }
                }
                #region Remove Slides which are not Selected in Custom Tiles
                //Remove the Extra slides
                if (isCustmDownld == "True")
                {
                    for (i = pres.Slides.Count - 1; i >= 0; i--)
                    {
                        if (!slideIDs.Contains(i + 1))
                        {
                            pres.Slides.Remove(pres.Slides[i]);
                        }
                    }
                    //to remove disabled slides when downloadall Button Clicked
                    if (slideIDs.Count == 42)
                    {
                        //pres.Slides[16].Remove();
                        //pres.Slides[15].Remove();
                        //pres.Slides[12].Remove();
                        //pres.Slides[11].Remove();
                    }
                    //
                }
                else
                {
                    //to remove disabled slides when downloadall Button Clicked
                    //pres.Slides[16].Remove();
                    //pres.Slides[15].Remove();
                    //pres.Slides[12].Remove();
                    //pres.Slides[11].Remove();
                    //
                }
                #endregion Remove Slides which are not Selected in Custom Tiles
                pres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);
            }
        }
        public void prepareP2PReportPPT(string sourceTemplatePath, string destinationtemplate, string benchmark, IEnumerable<string> comparisions, HttpContextBase context, DataSet outputDataSet, List<int> slideIDs, string timeperiod, string selectedDemofiltersList, string isCustmDownld, FilterPanelInfo[] filter, List<ColorCodeData> colorCodeList)
        {
            ISlideReplace _slideReplace = new SlideReplace();
            IList<ChartDetail> charts = new List<ChartDetail>();
            int series_ind = 0, dp_index = 0, i = 0;
            int tbl_ind = 0;
            sbyte overlap_val = -20;
            double xAxis_fact = 1, additionalFact = 0.2, temp_hld = 0.0; DataRow tempDr;
            string totalSamplesizeComp = "", totalSamplesize = "";
            selectedStatText = (filter.FirstOrDefault(x => x.Name == "StatTest")).SelectedText;
            //Slides
            using (Presentation pres = new Presentation(sourceTemplatePath))
            {
                #region Set Legends and Footer in the master slide Layout 0

                AsposeSlide.ITable tb = (AsposeSlide.ITable)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TableLegends");
                if (tb != null)
                {
                    totalSamplesize = (from row in outputDataSet.Tables[0].AsEnumerable()
                                       where Convert.ToString(row.Field<object>("EstablishmentName")) == benchmark && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                       select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();
                    tb.Rows[0][2].TextFrame.Text = benchmark + "\n(" + Convert.ToInt32(totalSamplesize).ToString("#,##,##0") + ")";
                    tb.Rows[0][1].FillFormat.FillType = FillType.Solid;
                    tb.Rows[0][1].FillFormat.SolidFillColor.Color = (0 >= _CurrentColors.Length) ? GlobalConstants.LegendColors[0] : ColorTranslator.FromHtml(_CurrentColors[0]);


                    for (i = 0; i < comparisions.Count(); i++)
                    {
                        totalSamplesizeComp = (from row in outputDataSet.Tables[0].AsEnumerable()
                                               where Convert.ToString(row.Field<object>("EstablishmentName")) == comparisions.ElementAt(i) && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                               select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();

                        tb.Rows[0][4 + 2 * i].TextFrame.Text = comparisions.ElementAt(i) + "\n(" + Convert.ToInt32(totalSamplesizeComp).ToString("#,##,##0") + ")";
                        tb.Rows[0][3 + 2 * i].FillFormat.FillType = FillType.Solid;
                        tb.Rows[0][3 + 2 * i].FillFormat.SolidFillColor.Color = ((i + 1) >= _CurrentColors.Length) ? GlobalConstants.LegendColors[i + 1] : ColorTranslator.FromHtml(_CurrentColors[i + 1]);
                    }
                    //If not full then remove the Other Legends
                    if (comparisions.Count() != 4)
                    {
                        i = 3 + 2 * comparisions.Count();
                        for (; i < tb.Columns.Count; i++)
                        {
                            tb.Rows[0][i].FillFormat.FillType = FillType.Solid;
                            tb.Rows[0][i].FillFormat.SolidFillColor.Color = Color.White;
                            tb.Rows[0][i].TextFrame.Text = "";
                        }
                    }
                }
                #endregion Set Legends and Footer in the master slide

                #region Set Legends and Footer in the master slide Layout 1
                tb = (AsposeSlide.ITable)pres.LayoutSlides[1].Shapes.FirstOrDefault(x => x.Name == "TableLegends");
                if (tb != null)
                {
                    totalSamplesize = (from row in outputDataSet.Tables[0].AsEnumerable()
                                       where Convert.ToString(row.Field<object>("EstablishmentName")) == benchmark && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                       select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();
                    tb.Rows[0][2].TextFrame.Text = benchmark + "\n(" + Convert.ToInt32(totalSamplesize).ToString("#,##,##0") + ")";
                    tb.Rows[0][1].FillFormat.FillType = FillType.Solid;
                    tb.Rows[0][1].FillFormat.SolidFillColor.Color = (0 >= _CurrentColors.Length) ? GlobalConstants.LegendColors[0] : ColorTranslator.FromHtml(_CurrentColors[0]);

                    for (i = 0; i < comparisions.Count(); i++)
                    {
                        totalSamplesizeComp = (from row in outputDataSet.Tables[0].AsEnumerable()
                                               where Convert.ToString(row.Field<object>("EstablishmentName")) == comparisions.ElementAt(i) && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                               select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();

                        tb.Rows[0][4 + 2 * i].TextFrame.Text = comparisions.ElementAt(i) + "\n(" + Convert.ToInt32(totalSamplesizeComp).ToString("#,##,##0") + ")"; ;
                        tb.Rows[0][3 + 2 * i].FillFormat.FillType = FillType.Solid;
                        tb.Rows[0][3 + 2 * i].FillFormat.SolidFillColor.Color = ((i + 1) >= _CurrentColors.Length) ? GlobalConstants.LegendColors[i + 1] : ColorTranslator.FromHtml(_CurrentColors[i + 1]);
                    }
                    //If not full then remove the Other Legends
                    if (comparisions.Count() != 4)
                    {
                        i = 3 + 2 * comparisions.Count();
                        for (; i < tb.Columns.Count; i++)
                        {
                            tb.Rows[0][i].FillFormat.FillType = FillType.Solid;
                            tb.Rows[0][i].FillFormat.SolidFillColor.Color = Color.White;
                            tb.Rows[0][i].TextFrame.Text = "";
                        }
                    }

                }
                #endregion Set Legends and Footer in the master slide Layout 1

                #region Dynamic Images png Commented Code
                //For Dynamic Images
                //for (int j = 0; j < pres.Slides.Count; j++)
                //{
                //    var tempPath="~/Temp";
                //    ISlide slide = pres.Slides[j];
                //    Image img = slide.GetThumbnail(new Size(1280, 700));
                //    img.Save(context.Server.MapPath(tempPath) + "/slide" + j + ".png", System.Drawing.Imaging.ImageFormat.Png);

                //}
                //
                #endregion Dynamic Images png Commented Code

                #region  Master Footer
                //((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: CCNA DINE\x2083\x2086\x2080 Tracker, Base: Total Visits,- Time Period: " + timeperiod + "\nFilters: " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: DINE\x2083\x2086\x2080 - Time Period: " + timeperiod + "; Base: Total Visits; % Visits\nFilters:" + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                if (selectedStatText.ToString().ToLower() == "previous period" || selectedStatText.ToString().ToLower() == "previous year")
                {
                    ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "benchmark")).TextFrame.Text = selectedStatText;
                    ((IAutoShape)pres.LayoutSlides[1].Shapes.FirstOrDefault(x => x.Name == "benchmark")).TextFrame.Text = selectedStatText;
                }
                else
                {
                    selectedStatText = benchmark;
                    ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "benchmark")).TextFrame.Text = "Benchmark - " + benchmark;
                    ((IAutoShape)pres.LayoutSlides[1].Shapes.FirstOrDefault(x => x.Name == "benchmark")).TextFrame.Text = "Benchmark - " + benchmark;
                }

                ((IAutoShape)pres.LayoutSlides[0].Shapes.FirstOrDefault(x => x.Name == "StatTestAgainst")).TextFrame.Text = "* Stat tested at 95% CL against " + selectedStatText;
                //Source:  DINE360 Tracker, Base: Total Visits, Time Period: 12MMT Sep 2018
                ((IAutoShape)pres.LayoutSlides[1].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: DINE\x2083\x2086\x2080 - Time Period: " + timeperiod + "; Base: Total Visits; % Visits\nFilters: " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                //((IAutoShape)pres.LayoutSlides[1].Shapes.FirstOrDefault(x => x.Name == "TPandFilters")).TextFrame.Text = "Source: CCNA DINE\x2083\x2086\x2080 Tracker, Base: Total Visits,- Time Period: " + timeperiod + "\nFilters: " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);

                ((IAutoShape)pres.LayoutSlides[1].Shapes.FirstOrDefault(x => x.Name == "StatTestAgainst")).TextFrame.Text = "* Stat tested at 95% CL against " + selectedStatText;
                ((IAutoShape)pres.LayoutSlides[3].Shapes.FirstOrDefault(x => x.Name == "Selections")).TextFrame.Text = "Base – Total Visits, Filters –" + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList);
                #endregion  Master Footer

                #region Slide 1
                cur_Slide = pres.Slides[0];
                charts = new List<ChartDetail>();
                //tempDr = outputDataSet.Tables[0].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Male").FirstOrDefault();
                string estList = "";
                for (i = 0; i < comparisions.Count(); i++)
                {
                    estList = String.Concat(estList, ", " + comparisions.ElementAt(i));
                }
                ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Brands")).TextFrame.Text = benchmark + estList;
                ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Filter_Timeperiod")).TextFrame.Text = "Base – Total Visits ," + "Filters - " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList) + "\n" + timeperiod;
                #endregion Slide 1                
                List<int> fixedSlides = new List<int>() { 1, 3, 7, 15, 27, 32, 38, 47 };
                //Loop through each  SlideIDs/dataSet
                try
                {


                    foreach (int slideId in slideIDs)
                    {
                        if (outputDataSet.Tables.Count > tbl_ind)
                        {
                            if (outputDataSet.Tables[tbl_ind].Rows.Count > 0)
                            {
                                xAxis_fact = (Convert.ToDouble(outputDataSet.Tables[tbl_ind].Compute("max([MetricValue])", string.Empty))) * 100;
                                xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                                sig_col = new List<Significance_Color>(); IAutoShape textShape;
                                //#region Set sample size in table
                                //AsposeSlide.ITable tb = (AsposeSlide.ITable)pres.Slides[slideId - 1].Shapes.FirstOrDefault(x => x.Name == "TableLegends");
                                //if (tb != null)
                                //{
                                //    totalSamplesize = (from row in outputDataSet.Tables[tbl_ind].AsEnumerable()
                                //                       where Convert.ToString(row.Field<object>("EstablishmentName")) == benchmark && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                //                       select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();
                                //    totalSamplesize = totalSamplesize == "" ? "0" : totalSamplesize;
                                //    tb.Rows[0][2].TextFrame.Text = benchmark + "\n(" + Convert.ToInt32(totalSamplesize).ToString("#,##,##0") + ")";
                                //    tb.Rows[0][1].FillFormat.FillType = FillType.Solid;
                                //    tb.Rows[0][1].FillFormat.SolidFillColor.Color = (0 >= _CurrentColors.Length) ? GlobalConstants.LegendColors[0] : ColorTranslator.FromHtml(_CurrentColors[0]);


                                //    for (i = 0; i < comparisions.Count(); i++)
                                //    {
                                //        totalSamplesizeComp = (from row in outputDataSet.Tables[tbl_ind].AsEnumerable()
                                //                               where Convert.ToString(row.Field<object>("EstablishmentName")) == comparisions.ElementAt(i) && Convert.ToString(row.Field<object>("TotalSamplesize")) != ""
                                //                               select Convert.ToString(row.Field<object>("TotalSamplesize"))).FirstOrDefault();
                                //        totalSamplesize = totalSamplesize == "" ? "0" : totalSamplesize;
                                //        tb.Rows[0][4 + 2 * i].TextFrame.Text = comparisions.ElementAt(i) + "\n(" + Convert.ToInt32(totalSamplesizeComp).ToString("#,##,##0") + ")";
                                //        tb.Rows[0][3 + 2 * i].FillFormat.FillType = FillType.Solid;
                                //        tb.Rows[0][3 + 2 * i].FillFormat.SolidFillColor.Color = ((i + 1) >= _CurrentColors.Length) ? GlobalConstants.LegendColors[i + 1] : ColorTranslator.FromHtml(_CurrentColors[i + 1]);
                                //    }
                                //    //If not full then remove the Other Legends
                                //    if (comparisions.Count() != 4)
                                //    {
                                //        i = 3 + 2 * comparisions.Count();
                                //        for (; i < tb.Columns.Count; i++)
                                //        {
                                //            tb.Rows[0][i].FillFormat.FillType = FillType.Solid;
                                //            tb.Rows[0][i].FillFormat.SolidFillColor.Color = Color.White;
                                //            tb.Rows[0][i].TextFrame.Text = "";
                                //        }
                                //    }
                                //}
                                //#endregion Set sample size in table
                                switch (slideId)
                                {
                                    #region Visit Demographics1 Slide 1
                                    case 1:
                                        cur_Slide = pres.Slides[0];
                                        charts = new List<ChartDetail>();
                                        #region //Gender
                                        //tempDr = outputDataSet.Tables[0].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Male").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Filter_Timeperiod")).TextFrame.Text = "Base – Total Visits ," + "Filters - " + ((selectedDemofiltersList == null || selectedDemofiltersList == "") ? "None" : selectedDemofiltersList) + "\n" + timeperiod;
                                        #endregion //Gender
                                        break;
                                    #endregion Visit Demographics1

                                    #region Visit Demographics1 Slide 4
                                    case 4:
                                        cur_Slide = pres.Slides[3];
                                        charts = new List<ChartDetail>();
                                        #region //Gender
                                        //Gender_ReadAsText
                                        tempDr = outputDataSet.Tables[0].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Male").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Gender_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By Males.";
                                        charts = GetChartDetails(charts, "Gender_Chart", outputDataSet.Tables[tbl_ind], "Gender");
                                        #endregion //Gender
                                        #region //Age
                                        //Age_ReadAsText
                                        tempDr = outputDataSet.Tables[0].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "13 - 18").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Age_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By 13 - 18 Year Olds.";
                                        charts = GetChartDetails(charts, "Age_Chart", outputDataSet.Tables[tbl_ind], "Age");

                                        #endregion //Age
                                        #region //Race/Ethnicity
                                        //Race-Ethnicity_ReadAsText
                                        tempDr = outputDataSet.Tables[0].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "White").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Race/Ethinicity_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By White.";
                                        charts = GetChartDetails(charts, "Race-Ethnicity_Chart", outputDataSet.Tables[tbl_ind], "Race/ Ethnicity");
                                        #endregion //Race/Ethnicity
                                        #region //Occupation
                                        //Occupation_ReadAsText
                                        tempDr = outputDataSet.Tables[0].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "White Collar").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Occupation_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By White Collar.";
                                        charts = GetChartDetails(charts, "Occupation_Chart", outputDataSet.Tables[tbl_ind], "Occupation");
                                        #endregion //Occupation
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Gender_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Age_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Race-Ethnicity_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Occupation_Chart", xAxis_fact);
                                        #endregion Setting color for every charts
                                        break;
                                    #endregion Visit Demographics1

                                    #region Visit Demographics2 Slide 5
                                    case 5:
                                        cur_Slide = pres.Slides[4];
                                        charts = new List<ChartDetail>();
                                        #region //SocioEconomic
                                        //SocioEconomic_ReadAsText
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Single Low Income").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Socioeconomic_Level_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By Single Low Income.";
                                        charts = GetChartDetails(charts, "Socioeconomic_Level_Chart", outputDataSet.Tables[tbl_ind], "Socioeconomic Level");
                                        #endregion //SocioEconomic

                                        #region //HH Income
                                        //HH Income_ReadAsText
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Less Than $25,000").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "HH_Income_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By Less Than $25,000 HH Incomes.";
                                        charts = GetChartDetails(charts, "HH_Income_Chart", outputDataSet.Tables[tbl_ind], "HH Income");
                                        #endregion //HH Income

                                        #region //HH Size
                                        //HH Income_ReadAsText
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "1 Person Household").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "HH_Size_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By 1 Person Household Members";
                                        charts = GetChartDetails(charts, "HH_Size_Chart", outputDataSet.Tables[tbl_ind], "HH Size");
                                        #endregion //HH Size

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Socioeconomic_Level_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "HH_Income_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "HH_Size_Chart", xAxis_fact);
                                        #endregion Setting color for every charts
                                        break;
                                    #endregion Visit Demographics2

                                    #region Visit Demographics3 Slide 6
                                    case 6:
                                        cur_Slide = pres.Slides[5];
                                        charts = new List<ChartDetail>();
                                        #region Married
                                        //HH Income_ReadAsText
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Married").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Marital_Status_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By Married.";
                                        charts = GetChartDetails(charts, "Marital_Status_Chart", outputDataSet.Tables[tbl_ind], "Marital Status");
                                        #endregion Married

                                        #region Parental_Identification
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Parent Of Child <18 in HH").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Parental_Identification_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By Parents Of Child <18 In HH.";
                                        charts = GetChartDetails(charts, "Parental_Identification_Chart", outputDataSet.Tables[tbl_ind], "Parental Identification");
                                        #endregion //HH Income

                                        #region //HH Size
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Diner Segmentation").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Diner_Segmentation_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are By " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Diner_Segmentation_Chart", outputDataSet.Tables[tbl_ind], "Diner Segmentation");
                                        #endregion //HH Size

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Marital_Status_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Parental_Identification_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Diner_Segmentation_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Visit Demographics3

                                    #region Occasion Context1 Slide 8
                                    case 8:
                                        cur_Slide = pres.Slides[7];
                                        charts = new List<ChartDetail>();
                                        #region //Daypart
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Daypart_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are At " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Daypart_Chart", outputDataSet.Tables[tbl_ind], "Daypart");
                                        #endregion //Daypart
                                        #region //Day of the Week
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Monday").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Day_of_the_Week_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are On Mondays.";
                                        charts = GetChartDetails(charts, "Day_of_the_Week_Chart", outputDataSet.Tables[tbl_ind], "Day of the Week");
                                        #endregion //Day of the Week

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Daypart_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Day_of_the_Week_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context1

                                    #region Occasion Context2 Slide 9
                                    case 9:
                                        cur_Slide = pres.Slides[8];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Service_Mode_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Service By " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Service_Mode_Chart", outputDataSet.Tables[tbl_ind], "Service Mode");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Service_Mode_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context2


                                    #region Occasion Context3 Slide 10
                                    case 10:
                                        cur_Slide = pres.Slides[9];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Type of Visit").FirstOrDefault();//Food & Beverage Consumed
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Food_&_Beverage_Consumed_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Both " + tempDr.Field<string>("Metricname") + ".";

                                        charts = GetChartDetails(charts, "Food_&_Beverage_Consumed_Chart", outputDataSet.Tables[tbl_ind], "Type of Visit");//Food & Beverage Consumed

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Meal Type").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Meal_Type_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Meal_Type_Chart", outputDataSet.Tables[tbl_ind], "Meal Type");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Food_&_Beverage_Consumed_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Meal_Type_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context3

                                    #region Occasion Context2 Slide 11
                                    case 11:
                                        try
                                        {
                                            cur_Slide = pres.Slides[10];
                                            charts = new List<ChartDetail>();
                                            tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                            Log.LogMessage("******Line1*******");
                                            ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "MacroMealMissions_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Service By " + tempDr.Field<string>("Metricname") + ".";
                                            Log.LogMessage("******Line2*******");
                                            charts = GetChartDetails(charts, "MacroMealMissions_Chart", outputDataSet.Tables[tbl_ind], "Macro Meal Missions");
                                            Log.LogMessage("******Line3*******");
                                            _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                            Log.LogMessage("******Line4*******");
                                            #region Updating Charts with Data
                                            UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "MacroMealMissions_Chart", xAxis_fact);
                                            Log.LogMessage("******Line5*******");
                                            #endregion Updating Charts with Data
                                        }
                                        catch(Exception ex)
                                        {
                                            Log.LogMessage("******slide11 p2p report******");
                                            Log.LogMessage(ex.Message);
                                            Log.LogMessage(ex.StackTrace);
                                        }
                                        break;
                                    #endregion Occasion Context2
                                    #region Occasion Context2 Slide 12
                                    case 12:
                                        try
                                        {
                                            cur_Slide = pres.Slides[11];
                                            charts = new List<ChartDetail>();
                                            tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                            ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "MicroMealMissionsLevel1_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Service By " + tempDr.Field<string>("Metricname") + ".";
                                            charts = GetChartDetails(charts, "MicroMealMissionsLevel1_Chart", outputDataSet.Tables[tbl_ind], "Micro Meal Missions Level 1");
                                            _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                            #region Updating Charts with Data
                                            UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "MicroMealMissionsLevel1_Chart", xAxis_fact);
                                            #endregion Updating Charts with Data
                                        }
                                        catch(Exception ex)
                                        {
                                            Log.LogMessage("******slide12 p2p report******");
                                            Log.LogMessage(ex.Message);
                                            Log.LogMessage(ex.StackTrace);
                                        }
                                        break;
                                    #endregion Occasion Context2
                                    #region Occasion Context2 Slide 13
                                    case 13:
                                        try
                                        {
                                            cur_Slide = pres.Slides[12];
                                            charts = new List<ChartDetail>();
                                            tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                            ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "MicroMealMissionsLevel2_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Service By " + tempDr.Field<string>("Metricname") + ".";
                                            charts = GetChartDetails(charts, "MicroMealMissionsLevel2_Chart", outputDataSet.Tables[tbl_ind], "Micro Meal Missions Level 2");
                                            _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                            #region Updating Charts with Data
                                            UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "MicroMealMissionsLevel2_Chart", xAxis_fact);
                                            #endregion Updating Charts with Data
                                        }
                                        catch(Exception ex)
                                        {
                                            Log.LogMessage("******slide13 p2p report******");
                                            Log.LogMessage(ex.Message);
                                            Log.LogMessage(ex.StackTrace);
                                        }
                                        break;
                                    #endregion Occasion Context2

                                    #region Occasion Context4 Slide 14
                                    case 14:
                                        cur_Slide = pres.Slides[13];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Number Of Companions").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Number_Of_Companions_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are Made With " + tempDr.Field<string>("Metricname") + ".";
                                        //No One Else
                                        #region Number Of Companions
                                        charts = GetChartDetails(charts, "Number_Of_Companions_Chart", outputDataSet.Tables[tbl_ind], "Number Of Companions");
                                        #endregion Number Of Companions
                                        #region Companion Detail
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Companion Detail").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Companion_Detail_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are With " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Companion_Detail_Chart", outputDataSet.Tables[tbl_ind], "Companion Detail");

                                        #endregion Companion Detail

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Number_Of_Companions_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Companion_Detail_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit1 Slide 16
                                    case 16:
                                        cur_Slide = pres.Slides[15];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "The Decision Was Completely Spur Of The Moment").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "When_Planned_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are Decided Completely Spur Of The Moment.";
                                        charts = GetChartDetails(charts, "When_Planned_Chart", outputDataSet.Tables[tbl_ind], "Planning Type");//When Planned

                                        #endregion When_Planned
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Decision Location").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Decision_Location_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are Planned At " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Decision_Location_Chart", outputDataSet.Tables[tbl_ind], "Decision Location");
                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "When_Planned_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Decision_Location_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit2 Slide 17
                                    case 17:
                                        cur_Slide = pres.Slides[16];
                                        charts = new List<ChartDetail>();
                                        #region Main_Decision_Maker
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Main Decision Maker").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Main_Decision_Maker_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Main Decision Maker - " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Main_Decision_Maker_Chart", outputDataSet.Tables[tbl_ind], "Main Decision Maker");
                                        #endregion Main_Decision_Maker
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Decision Makers").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Decision_Makers_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Decision Maker - " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Decision_Makers_Chart", outputDataSet.Tables[tbl_ind], "Decision Makers");
                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Main_Decision_Maker_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Decision_Makers_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit3 Slide 18
                                    case 18:
                                        cur_Slide = pres.Slides[17];
                                        charts = new List<ChartDetail>();
                                        #region Main_Decision_Maker
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Pre-Visit_Origin_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Origin - " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Pre-Visit_Origin_Chart", outputDataSet.Tables[tbl_ind], "Pre-Visit Origin");

                                        #endregion Main_Decision_Maker
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Pre-Visit_Origin_Chart", xAxis_fact);

                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit4 Slide 19
                                    case 19:
                                        cur_Slide = pres.Slides[18];
                                        charts = new List<ChartDetail>();
                                        //Special case for xAxis_fact calculation
                                        xAxis_fact = (Convert.ToDouble(outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("Demofiltername") != "Distance Travelled – Average").CopyToDataTable().Compute("max([MetricValue])", string.Empty))) * 100;
                                        xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                                        #region Main_Decision_Maker
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Distance_Travelled_–_Average_ReadAsText")).TextFrame.Text = "Read As: Average Distance Travelled For " + benchmark + "  In Total Visits - " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0.0") : "0" : "0") + " Miles.";
                                        //Data from datatable for average distance
                                        series_ind = 1;
                                        foreach (DataRow item in (outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("Metricname") == "-")))
                                        {

                                            //textShape = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Distance_Rect_" + series_ind));
                                            //textShape.TextFrame.Text = Convert.ToDouble(item["MetricValue"]).ToString("##0.0");
                                            //textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;

                                            //textShape = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Distance_Miles_Box_" + series_ind));
                                            ////textShape.TextFrame.Text = Convert.ToDouble(item["MetricValue"]).ToString("##0.0");
                                            //textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            ////textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);
                                            //textShape.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(_CurrentColors[series_ind]);

                                            //textShape = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Distance_OuterRect_" + series_ind));
                                            //textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            ////textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);
                                            //textShape.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(_CurrentColors[series_ind]);

                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Distance_Rect_" + series_ind));
                                            textShape.TextFrame.Text = Convert.ToDouble(item["MetricValue"]).ToString("##0.0");
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            assignStatTestColor(textShape, item, series_ind == 1);
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Distance_Miles_Box_" + series_ind));
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);
                                            assignStatTestColor(textShape, item, series_ind == 1);
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Distance_OuterRect_" + series_ind));
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);
                                            assignStatTestColor(textShape, item, series_ind == 1);

                                            series_ind++;
                                        }
                                        switch (comparisions.Count())
                                        {
                                            case 0:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)214.86;

                                                #endregion setPosition
                                                #region removeShp

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault());

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault());

                                                #endregion removeShp
                                                break;
                                            case 1:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault().X = (float)246.89;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)161.85;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)252.85;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault());

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault());

                                                #endregion removeShp
                                                break;
                                            case 2:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault().X = (float)209.19;
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault().X = (float)299.90;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)124.72;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)207.49;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault().X = (float)297.63;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault());

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());

                                                #endregion removeShp
                                                break;
                                            case 3:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault().X = (float)155.47;
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault().X = (float)248.89;
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault().X = (float)340.07;

                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)70.47;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)161.85;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault().X = (float)252.85;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault().X = (float)347.44;

                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                        }
                                        #endregion Main_Decision_Maker
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Distance Travelled – Detailed").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Distance_Travelled_–_Detailed_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + "  Were " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Distance_Travelled_–_Detailed_Chart", outputDataSet.Tables[tbl_ind], "Distance Travelled – Detailed");
                                        #endregion Decision_Location

                                        #region Mode_Of_Transportation
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Mode Of Transportation").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Mode_Of_Transportation_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are Made In " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Mode_Of_Transportation_Chart", outputDataSet.Tables[tbl_ind], "Mode Of Transportation");
                                        #endregion Mode_Of_Transportation

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Distance_Travelled_–_Detailed_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Mode_Of_Transportation_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Pre-Visit4 Slide 16

                                    #region Pre-Visit5 Slide 20
                                    case 20:
                                        cur_Slide = pres.Slides[19];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Trip Purpose").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Trip_Purpose_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are " + tempDr.Field<string>("Metricname") + " Establishment.";
                                        charts = GetChartDetails(charts, "Trip_Purpose_Chart", outputDataSet.Tables[tbl_ind], "Trip Purpose");
                                        #endregion When_Planned
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Trip Activities").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Trip_Activities_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include Trip Activity – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Trip_Activities_Chart", outputDataSet.Tables[tbl_ind], "Trip Activities");

                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Trip_Purpose_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Trip_Activities_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit6 Slide 21
                                    case 21:
                                        cur_Slide = pres.Slides[20];
                                        charts = new List<ChartDetail>();
                                        //#region When_Planned
                                        //tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Primarily To Visit Establishment").FirstOrDefault();
                                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Primy_Occsn_Motivtn_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For Primary Occasion Motivation - “I Didn’t Want To Cook.”";
                                        //charts = GetChartDetails(charts, "Primy_Occsn_Motivtn_Chart", outputDataSet.Tables[tbl_ind], "Trip Purpose");

                                        //#endregion When_Planned
                                        //#region Decision_Location
                                        //tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Home").FirstOrDefault();
                                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Trip_Activities_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are Planned At Home.";
                                        //charts = GetChartDetails(charts, "Trip_Activities_Chart", outputDataSet.Tables[tbl_ind], "Trip Activities");

                                        //#endregion Decision_Location

                                        //_slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        //#region Updating Charts with Data
                                        //UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Trip_Purpose_Chart", xAxis_fact);
                                        //UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Trip_Activities_Chart", xAxis_fact);
                                        //#endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit7 Slide 22
                                    case 22:
                                        cur_Slide = pres.Slides[21];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Primary Occasion Motivation (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Primy_Occsn_Motivtn_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For Primary Occasion Motivation - “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Primy_Occsn_Motivtn")).TextFrame.Text = "Primary Occasion Motivation (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Primy_Occsn_Motivtn_Chart", outputDataSet.Tables[tbl_ind], "Primary Occasion Motivation (Top 10 For Midscale)");

                                        #endregion When_Planned
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Occasion Motivations – Total Mentions (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Occsn_Motivn_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For Occasion Motivations – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Occsn_Motivn")).TextFrame.Text = "Occasion Motivations – Total Mentions (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Occsn_Motivn_Chart", outputDataSet.Tables[tbl_ind], "Occasion Motivations – Total Mentions (Top 10 For Midscale)");

                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Primy_Occsn_Motivtn_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Occsn_Motivn_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit7 Slide 23
                                    case 23:
                                        cur_Slide = pres.Slides[22];
                                        charts = new List<ChartDetail>();

                                        #region Establishment Motivation Segmentation
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Establishment Motivation Segmentation").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Establi_Movtn_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For Establishment Motivation Segment – " + tempDr.Field<string>("Metricname") + ".";
                                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Primy_Occsn_Motivtn")).TextFrame.Text = "Primary Occasion Motivation (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Establi_Movtn_Seg_Chart", outputDataSet.Tables[tbl_ind], "Establishment Motivation Segmentation");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Establi_Movtn_Seg_Chart", xAxis_fact);
                                        #endregion Establishment Motivation Segmentation



                                        break;
                                    #endregion Pre-Visit

                                    #region Pre-Visit7 Slide 24
                                    case 24:
                                        cur_Slide = pres.Slides[23];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Primary Establishment Motivation (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Prm_Est_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For Primary Establishment Motivation – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Prm_Est_Mot")).TextFrame.Text = "Primary Establishment Motivation (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Prm_Est_Chart", outputDataSet.Tables[tbl_ind], "Primary Establishment Motivation (Top 10 For Midscale)");

                                        #endregion When_Planned
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Establishment Motivations – Total Mentions (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Est_Motiv_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are For Establishment Motivation – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Est_Motivation_Total")).TextFrame.Text = "Establishment Motivations – Total Mentions (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Est_Motiv_Chart", outputDataSet.Tables[tbl_ind], "Establishment Motivations – Total Mentions (Top 10 For Midscale)");

                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Prm_Est_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Est_Motiv_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion Occasion Context4

                                    #region Pre-Visit7 Slide 25
                                    case 25:
                                        cur_Slide = pres.Slides[24];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Primary Mood Upon Arrival (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Prm_Mood_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Primary Mood Upon Arrival - “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Prm_Mood")).TextFrame.Text = "Primary Mood Upon Arrival (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Prm_Mood_Chart", outputDataSet.Tables[tbl_ind], "Primary Mood Upon Arrival (Top 10 For Midscale)");
                                        #endregion When_Planned
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Mood Upon Arrival – Total Mentions (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Mood_Arrv_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Mood Upon Arrival - “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Mood_Arrv")).TextFrame.Text = "Mood Upon Arrival – Total Mentions (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Mood_Arrv_Chart", outputDataSet.Tables[tbl_ind], "Mood Upon Arrival – Total Mentions (Top 10 For Midscale)");
                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Prm_Mood_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Mood_Arrv_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 26
                                    case 26:
                                        cur_Slide = pres.Slides[25];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Food Was Much More Important").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Food_Bev_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Are Driven By “Food Was Much More Important.”";
                                        charts = GetChartDetails(charts, "Food_Bev_Chart", outputDataSet.Tables[tbl_ind], "Food Vs Beverage As Driver");

                                        #endregion When_Planned
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Food_Bev_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 28
                                    case 28:
                                        cur_Slide = pres.Slides[27];
                                        charts = new List<ChartDetail>();
                                        #region 
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Order_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Order Method – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Order_Chart", outputDataSet.Tables[tbl_ind], "Order Method");

                                        #endregion When_Planned
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Order_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 29
                                    case 29:
                                        cur_Slide = pres.Slides[28];
                                        charts = new List<ChartDetail>();

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Food_Consumed_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Food Consumed - “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Food_Consumed")).TextFrame.Text = "Food Consumed Detail (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Food_Consumed_Chart", outputDataSet.Tables[tbl_ind], "Food Consumed Detail (Top 10 For Midscale)");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });

                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Food_Consumed_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 30
                                    case 30:
                                        cur_Slide = pres.Slides[29];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Yes" && x.Field<string>("DemofilterName") == "Beverage Consumption On Visit").FirstOrDefault();
                                        textShape = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_RdTxt"));
                                        textShape.TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include Beverage Consumption.";
                                        textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        //Data from datatable for average distance
                                        series_ind = 1;
                                        foreach (DataRow item in (outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("DemofilterName") == "Beverage Consumption On Visit" && x.Field<string>("Metricname") == "Yes")))
                                        {
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Can_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "img_text_" + series_ind));
                                            textShape.TextFrame.Text = Convert.ToDouble(item["MetricValue"]).ToString("##0%");
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            assignStatTestColor(textShape, item, series_ind == 1);

                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Can_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Trapezoid_" + series_ind));
                                            //textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            //textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);

                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Gradient;
                                            textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind - 1] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);

                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.GradientFormat.GradientShape = GradientShape.Linear;
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.GradientFormat.LinearGradientAngle = 90;
                                            Color _Stop1Col = (series_ind > _CurrentColors.Length) ? GlobalConstants.Stop1Col[series_ind - 1] : GlobalConstants.Colorluminance(ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]), 0.25f);
                                            Color _Stop2Col = (series_ind > _CurrentColors.Length) ? GlobalConstants.Stop2Col[series_ind - 1] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.GradientFormat.GradientStops.Add(0, _Stop1Col);
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.GradientFormat.GradientStops.Add(1, _Stop2Col);
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.EffectFormat.EnableOuterShadowEffect();
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.EffectFormat.OuterShadowEffect.BlurRadius = 2;
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.EffectFormat.OuterShadowEffect.Direction = 90;
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.EffectFormat.OuterShadowEffect.Distance = 1.5;
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.EffectFormat.OuterShadowEffect.ShadowColor.Color = Color.Black;

                                            series_ind++;
                                        }
                                        switch (comparisions.Count())
                                        {
                                            case 0:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_1").FirstOrDefault().X = (float)430.86;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault());

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_2").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 1:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault().X = (float)479.9;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_1").FirstOrDefault().X = (float)368.50;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_2").FirstOrDefault().X = 504;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault());

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_3").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 2:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault().X = (float)406.20;
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault().X = (float)547.93;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_1").FirstOrDefault().X = (float)295.37;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_2").FirstOrDefault().X = (float)430.86;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_3").FirstOrDefault().X = (float)570.04;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault());

                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_5").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 3:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_1").FirstOrDefault().X = (float)343.84;
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_2").FirstOrDefault().X = (float)479.9;
                                                cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_3").FirstOrDefault().X = (float)623.05;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_1").FirstOrDefault().X = (float)227.62;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_2").FirstOrDefault().X = (float)368.50;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_3").FirstOrDefault().X = 504;
                                                cur_Slide.Shapes.Where(x => x.Name == "Can_4").FirstOrDefault().X = (float)645.16;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Distance_Stragt_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Can_5").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                        }
                                        #endregion When_Planned
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Barriers Of Beverage Consumption").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Barriers_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Beverage Consumption Barrier – “" + tempDr.Field<string>("Metricname") + "”.";
                                        xAxis_fact = (Convert.ToDouble(outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("Demofiltername") == "Barriers Of Beverage Consumption").CopyToDataTable().Compute("max([MetricValue])", string.Empty))) * 100;
                                        xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                                        charts = GetChartDetails(charts, "Barriers_Chart", outputDataSet.Tables[tbl_ind], "Barriers Of Beverage Consumption");
                                        #endregion Decision_Location
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Barriers_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 31
                                    case 31:
                                        cur_Slide = pres.Slides[30];
                                        charts = new List<ChartDetail>();
                                        #region When_Planned
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Consumption_RdTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Consumption Location – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Consumption_Chart", outputDataSet.Tables[tbl_ind], "Consumption Location");
                                        #endregion When_Planned
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Consumption_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 33
                                    case 33:
                                        cur_Slide = pres.Slides[32];
                                        charts = new List<ChartDetail>();
                                        #region Average Time Spent In Outlet
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Average Time Spent In Outlet").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "AvgTime_ReadAsText")).TextFrame.Text = "Read As:  Average Time Spent For Visits To " + benchmark + " Is " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0") : "0" : "0") + " Minutes.";
                                        //Data from datatable for average distance
                                        series_ind = 1;
                                        TimeSpan time_spn;
                                        foreach (DataRow item in (outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("DemofilterName") == "Average Time Spent In Outlet")))
                                        {
                                            time_spn = TimeSpan.FromMinutes(Convert.ToDouble(Convert.ToDouble(item["MetricValue"]).ToString("##0")));
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Time_Value_" + series_ind));
                                            textShape.TextFrame.Text = time_spn.ToString("hh\\:mm");
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            assignStatTestColor(textShape, item, series_ind == 1);
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Time_RectOut_" + series_ind));
                                            //textShape.TextFrame.Text = time_spn.ToString("hh\\:mm");
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind - 1] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);
                                            assignStatTestColor(textShape, item, series_ind == 1);
                                            series_ind++;
                                        }
                                        switch (comparisions.Count())
                                        {
                                            case 0:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)418.96;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 1:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)313.51;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)495.41;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 2:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)225.63;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)418.96;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault().X = (float)598.11;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 3:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)131.51;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)313.51;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault().X = (float)495.41;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault().X = (float)677.12;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                        }
                                        #endregion Average Time Spent In Outlet
                                        #region Decision_Location
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "5 Minutes Or Less").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Time_Spent_RdTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Time Spent In Outlet Detail – 5 Minutes Or Less.";
                                        xAxis_fact = (Convert.ToDouble(outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("Demofiltername") == "Time Spent In Outlet – Detail").CopyToDataTable().Compute("max([MetricValue])", string.Empty))) * 100;
                                        xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                                        charts = GetChartDetails(charts, "Time_Spent_Chart", outputDataSet.Tables[tbl_ind], "Time Spent In Outlet – Detail");

                                        #endregion Decision_Location

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Time_Spent_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 34
                                    case 34:
                                        cur_Slide = pres.Slides[33];
                                        charts = new List<ChartDetail>();
                                        #region Expenditure_Average
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "--").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Expenditure_ReadAsText")).TextFrame.Text = "Read As: Average Per Diner Expenditure for Visits To " + benchmark + " Is $" + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0.00") : "0" : "0") + ".";
                                        //Dynamic Images
                                        series_ind = 1;
                                        foreach (DataRow item in (outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("DemofilterName") == "Expenditure – Average")))
                                        {
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "val_" + series_ind));
                                            textShape.TextFrame.Text = "$" + Convert.ToDouble(item["MetricValue"]).ToString("##0.00");
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            assignStatTestColor(textShape, item, series_ind == 1);
                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Rect_Out_" + series_ind));
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);

                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Group_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "Rect_Inn_" + series_ind));
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            // textShape.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);
                                            textShape.LineFormat.FillFormat.SolidFillColor.Color = (series_ind > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);


                                            series_ind++;
                                        }
                                        switch (comparisions.Count())
                                        {
                                            case 0:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)430.01;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 1:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)329.66;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)502.58;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 2:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)257.10;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)430.01;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault().X = (float)602.07;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                            case 3:
                                                #region setPosition
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_1").FirstOrDefault().X = (float)157.6;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_2").FirstOrDefault().X = (float)329.66;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_3").FirstOrDefault().X = (float)502.58;
                                                cur_Slide.Shapes.Where(x => x.Name == "Group_4").FirstOrDefault().X = (float)674.64;
                                                #endregion setPosition
                                                #region removeShp
                                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "Group_5").FirstOrDefault());
                                                #endregion removeShp
                                                break;
                                        }
                                        #endregion Expenditure_Average

                                        #region Expenditure_Details
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "$5.00 Or Less").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Expenditure_Det_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Expenditure Detail - $5.00 Or Less.";
                                        xAxis_fact = (Convert.ToDouble(outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("Demofiltername") == "Expenditure – Detail").CopyToDataTable().Compute("max([MetricValue])", string.Empty))) * 100;
                                        xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                                        charts = GetChartDetails(charts, "Expenditure_Det_Chart", outputDataSet.Tables[tbl_ind], "Expenditure – Detail");
                                        #endregion Expenditure_Details

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Expenditure_Det_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 35
                                    case 35:
                                        cur_Slide = pres.Slides[34];
                                        charts = new List<ChartDetail>();
                                        #region Expenditure
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Payment_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Payment Method – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Payment_Chart", outputDataSet.Tables[tbl_ind], "Payment Method");
                                        #endregion

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Payment_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region Pre-Visit7 Slide 36
                                    case 36:
                                        cur_Slide = pres.Slides[35];
                                        charts = new List<ChartDetail>();
                                        #region Overall Satisfaction – Top 2 Box
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Overall Satisfaction – Top 2 Box").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Overall_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Is The Overall Satisfaction (Top 2 Box) For " + benchmark;
                                        Aspose.Slides.Charts.IChart donutChart1;
                                        donutChart1 = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_1")).Shapes.FirstOrDefault(x => x.Name == "donut_chart");
                                        DataRow tempDrItem = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Overall Satisfaction – Top 2 Box").FirstOrDefault();
                                        temp_hld = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Overall Satisfaction – Top 2 Box").FirstOrDefault().Field<double>("MetricValue");
                                        donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = 1;
                                        series_ind = 1;
                                        //If low sample size then temp_hld should be 0
                                        int tmpSS = 0;
                                        int.TryParse(Convert.ToString(tempDr["TotalSamplesize"]), out tmpSS);
                                        if (tmpSS < 30)
                                        {
                                            temp_hld = 0;
                                        }
                                        donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = Convert.ToDouble(temp_hld);
                                        donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.FillType = FillType.Solid;
                                        donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.SolidFillColor.Color = ((series_ind) > _CurrentColors.Length) ? GlobalConstants.LegendColors[0] : ColorTranslator.FromHtml(_CurrentColors[0]);
                                        textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_1")).Shapes.FirstOrDefault(x => x.Name == "data_val"));
                                        textShape.TextFrame.Text = temp_hld.ToString("##0%");
                                        textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        assignStatTestColor(textShape, tempDr, true);
                                        donutChart1.ChartData.Series[0].DataPoints[2].Value.Data = Convert.ToDouble(1 - temp_hld);
                                        series_ind = 2;
                                        foreach (var item in comparisions)
                                        {
                                            //chart n
                                            tempDrItem = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == item && x.Field<string>("Demofiltername") == "Overall Satisfaction – Top 2 Box").FirstOrDefault();
                                            temp_hld = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == item && x.Field<string>("Demofiltername") == "Overall Satisfaction – Top 2 Box").FirstOrDefault().Field<double>("MetricValue");
                                            int.TryParse(Convert.ToString(tempDrItem["TotalSamplesize"]), out tmpSS);
                                            if (tmpSS < 30)
                                            {
                                                temp_hld = 0;
                                            }
                                            donutChart1 = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "donut_chart");
                                            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = 1;
                                            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = Convert.ToDouble(temp_hld);
                                            donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.FillType = FillType.Solid;
                                            //donutChart1.FillFormat.SolidFillColor.Color= ((series_ind - 1) > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind-2] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 2]);
                                            donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.SolidFillColor.Color = ((series_ind - 1) > _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind - 1] : ColorTranslator.FromHtml(_CurrentColors[series_ind - 1]);

                                            textShape = ((IAutoShape)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_" + series_ind)).Shapes.FirstOrDefault(x => x.Name == "data_val"));
                                            textShape.TextFrame.Text = temp_hld.ToString("##0%");
                                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            assignStatTestColor(textShape, tempDrItem, series_ind == 1);
                                            donutChart1.ChartData.Series[0].DataPoints[2].Value.Data = Convert.ToDouble(1 - temp_hld);

                                            series_ind++;
                                        }
                                        //Remove extra donut charts
                                        for (series_ind = 0; series_ind < 4 - comparisions.Count(); series_ind++)
                                        {
                                            cur_Slide.Shapes.Remove((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_" + (5 - series_ind)));
                                        }
                                        //position the donuts
                                        switch (comparisions.Count())
                                        {
                                            case 0:
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_1").X = (float)396.85;
                                                break;
                                            case 1:
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_1").X = (float)305.29;
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_2").X = (float)485.29;
                                                break;
                                            case 2:
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_1").X = (float)225.07;
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_2").X = (float)396.85;
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_3").X = (float)572.31;
                                                break;
                                            case 3:
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_1").X = (float)126.42;
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_2").X = (float)305.29;
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_3").X = (float)485.29;
                                                cur_Slide.Shapes.FirstOrDefault(x => x.Name == "donut_4").X = (float)663.02;
                                                break;
                                        }
                                        #endregion Overall Satisfaction – Top 2 Box
                                        #region Detailed Satisfaction
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Food").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Detailed_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Is The Detailed Satisfaction – Top 2 Box. For Food For Total Visits To " + benchmark;
                                        charts = GetChartDetails(charts, "Detailed_Chart", outputDataSet.Tables[tbl_ind], "Detailed Satisfaction – Top 2 Box");
                                        #endregion Detailed Satisfaction

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Detailed_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region  Slide 37
                                    case 37:
                                        cur_Slide = pres.Slides[36];
                                        charts = new List<ChartDetail>();
                                        #region Expenditure
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Destination_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Destination After Trip - " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Destination_Chart", outputDataSet.Tables[tbl_ind], "Destination After Trip");
                                        #endregion

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Destination_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region  Slide 39
                                    case 39:
                                        cur_Slide = pres.Slides[38];
                                        charts = new List<ChartDetail>();
                                        #region Expenditure
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Cat_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include Beverage Categories Consumed – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Cat")).TextFrame.Text = "Beverage Categories Consumed (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Beverage_Cat_Chart", outputDataSet.Tables[tbl_ind], "Beverage Categories Consumed (Top 10 For Midscale)");
                                        #endregion

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Cat_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region  Slide 40
                                    case 40:
                                        cur_Slide = pres.Slides[39];
                                        charts = new List<ChartDetail>();
                                        #region Expenditure
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Beverage Motivation Segmentation").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Mot_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits to " + benchmark + " Involve Beverage Motivation Segment – " + tempDr.Field<string>("Metricname");
                                        charts = GetChartDetails(charts, "Beverage_Mot_Chart", outputDataSet.Tables[tbl_ind], "Beverage Motivation Segmentation");
                                        #endregion

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Mot_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 41
                                    case 41:
                                        cur_Slide = pres.Slides[40];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Primary Beverage Motivation (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Primary_Bev_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Primary Beverage Motivation – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Primary_Bev")).TextFrame.Text = "Primary Beverage Motivation (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Primary_Bev_Chart", outputDataSet.Tables[tbl_ind], "Primary Beverage Motivation (Top 10 For Midscale)");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Beverage Motivations – Total Mentions (Top 10 For Midscale)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Beverage Motivations: Total Mentions – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Total")).TextFrame.Text = "Beverage Motivations – Total Mentions (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Beverage_Chart", outputDataSet.Tables[tbl_ind], "Beverage Motivations – Total Mentions (Top 10 For Midscale)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Primary_Bev_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 42
                                    case 42:
                                        cur_Slide = pres.Slides[41];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Beverage Origin Nets").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Beverage Origin Net – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Beverage_Chart", outputDataSet.Tables[tbl_ind], "Beverage Origin Nets");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Beverage Origin (Other Than Outlet)").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Beverage_Orgn_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Beverage Origin (Other Than Outlet) - " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Beverage_Orgn_Chart", outputDataSet.Tables[tbl_ind], "Beverage Origin (Other Than Outlet)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Beverage_Orgn_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 43
                                    case 43:
                                        cur_Slide = pres.Slides[42];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Total_SSD_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include Total SSD Brand – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Total_SSD")).TextFrame.Text = "Total SSD Brands (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Total_SSD_Chart", outputDataSet.Tables[tbl_ind], "Total SSD Brands (Top 10 For Midscale)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Total_SSD_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 44
                                    case 44:
                                        cur_Slide = pres.Slides[43];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Regular_SSD_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include Regular SSD Brands – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Regular_SSD")).TextFrame.Text = "Regular SSD Brands (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Regular_SSD_Chart", outputDataSet.Tables[tbl_ind], "Regular SSD Brands (Top 10 For Midscale)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Regular_SSD_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 45
                                    case 45:
                                        cur_Slide = pres.Slides[44];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Diet_SSD_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include Diet SSD Brands – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Diet_SSD")).TextFrame.Text = "Diet SSD Brands (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Diet_SSD_Chart", outputDataSet.Tables[tbl_ind], "Diet SSD Brands (Top 10 For Midscale)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Diet_SSD_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 46
                                    case 46:
                                        cur_Slide = pres.Slides[45];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Package_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Involve Beverage Package Type – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Package")).TextFrame.Text = "Package Type (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Package_Chart", outputDataSet.Tables[tbl_ind], "Package Type (Top 10 For Midscale)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Package_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 48
                                    case 48:
                                        cur_Slide = pres.Slides[47];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Made Reservations").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Made_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To  " + benchmark + " Have Reservations Made.";
                                        charts = GetChartDetails(charts, "Made_Chart", outputDataSet.Tables[tbl_ind], "Made Reservation*");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Reservation Method*").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Reservation_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To  " + benchmark + " Involve Reservation Method – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Reservation_Chart", outputDataSet.Tables[tbl_ind], "Reservation Method*");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Online Reservation Detail*").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Online_ReadAsText")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Online Reservation Detail – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Online_Chart", outputDataSet.Tables[tbl_ind], "Online Reservation Detail*");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Made_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Reservation_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Online_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion

                                    #region slide 49
                                    case 49:
                                        cur_Slide = pres.Slides[48];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Used Online Reviews").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Online_Used_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Used Online Reviews.";
                                        charts = GetChartDetails(charts, "Online_Used_Chart", outputDataSet.Tables[tbl_ind], "Online Reviews Used");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Online Review Site Used").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Online_SiteUsed_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Used Online Review Site – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Online_SiteUsed_Chart", outputDataSet.Tables[tbl_ind], "Online Review Site Used");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Online_Used_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Online_SiteUsed_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region slide 50
                                    case 50:
                                        cur_Slide = pres.Slides[49];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Dine-In: How Food/ Bev Was Received").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dine_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Received Food – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Dine_Chart", outputDataSet.Tables[tbl_ind], "Dine-In: How Food/ Bev Was Received");
                                        #region Dine_in_Table
                                        AsposeSlide.ITable tbl = (AsposeSlide.ITable)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dine_in_Table");
                                        series_ind = 2;
                                        temp_hld = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Demofiltername") == "Service Mode").FirstOrDefault().Field<double>("MetricValue");
                                        tbl.Rows[1][0].TextFrame.Text = benchmark;
                                        tbl.Rows[1][2].TextFrame.Text = temp_hld.ToString("##0%");
                                        tbl.Rows[1][3].TextFrame.Text = (1 - temp_hld).ToString("##0%");
                                        foreach (var item in comparisions)
                                        {
                                            temp_hld = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == item && x.Field<string>("Demofiltername") == "Service Mode").FirstOrDefault().Field<double>("MetricValue");
                                            tbl.Rows[series_ind][0].TextFrame.Text = item;
                                            tbl.Rows[series_ind][2].TextFrame.Text = temp_hld.ToString("##0%");
                                            tbl.Rows[series_ind][3].TextFrame.Text = (1 - temp_hld).ToString("##0%");
                                            series_ind++;
                                        }
                                        //Remove the table  cells if required
                                        for (series_ind = 0; series_ind < 4 - comparisions.Count(); series_ind++)
                                        {
                                            tbl.Rows.RemoveAt(5 - series_ind, true);
                                        }
                                        #endregion Dine_in_Table
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Dine_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region slide 51
                                    case 51:
                                        cur_Slide = pres.Slides[50];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Device Used To Place Order").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Device_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have " + tempDr.Field<string>("Metricname") + " Used To Place Order.";
                                        charts = GetChartDetails(charts, "Device_Chart", outputDataSet.Tables[tbl_ind], "Device Used To Place Order");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Website/ App Order Detail").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Website_RdTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Ordering Website/ App – " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Website_Chart", outputDataSet.Tables[tbl_ind], "Website/ App Order Detail");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Device_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Website_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 52
                                    case 52:
                                        cur_Slide = pres.Slides[51];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Ordered A Combo Meal").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Combo_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Includes A Combo Meal.";
                                        charts = GetChartDetails(charts, "Combo_Chart", outputDataSet.Tables[tbl_ind], "Combo Meal (Only For Fast Food/ Fast Casual)");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Ordered From Dollar Menu").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dollar_RdTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Includes Order From A Dollar Menu.";
                                        charts = GetChartDetails(charts, "Dollar_Chart", outputDataSet.Tables[tbl_ind], "Dollar Menu (Only For Fast Food/ Fast Casual)");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Took Advantage Of A Promotion").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Took_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Took Advantage Of A Promotion.";
                                        charts = GetChartDetails(charts, "Took_Chart", outputDataSet.Tables[tbl_ind], "Took Advantage Of A Promotion (Only For Midscale/ Casual)");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Combo_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Dollar_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Took_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 53
                                    case 53:
                                        cur_Slide = pres.Slides[52];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("Metricname") == "Used Coupons").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Coupons_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Used Coupons.";
                                        charts = GetChartDetails(charts, "Coupons_Chart", outputDataSet.Tables[tbl_ind], "Coupon Usage");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Coupon Usage – Detail").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Coupon_Det_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Used " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "Coupon_Det_Chart", outputDataSet.Tables[tbl_ind], "Coupon Usage – Detail");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Coupons_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Coupon_Det_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 54
                                    case 54:
                                        cur_Slide = pres.Slides[53];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "RTD_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 55
                                    case 55:
                                        cur_Slide = pres.Slides[54];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Tea_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_Tea")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "RTD_Tea_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD_Tea_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 56
                                    case 56:
                                        cur_Slide = pres.Slides[55];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dairy_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Dairy")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Dairy_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Dairy_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 57
                                    case 57:
                                        cur_Slide = pres.Slides[56];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Protein_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Protein")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Protein_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Protein_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 58
                                    case 58:
                                        cur_Slide = pres.Slides[57];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "RTD")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "RTD1_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "RTD1_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 59
                                    case 59:
                                        cur_Slide = pres.Slides[58];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Orange_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Orange")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Orange_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Orange_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 60
                                    case 60:
                                        cur_Slide = pres.Slides[59];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark).FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Lemonade_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Include " + tempDr.Field<string>("Demofiltername") + " – “" + tempDr.Field<string>("Metricname") + ".”";
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "Lemonade")).TextFrame.Text = tempDr.Field<string>("Demofiltername") + " (Top 10 For " + benchmark + ")";
                                        charts = GetChartDetails(charts, "Lemonade_Chart", outputDataSet.Tables[tbl_ind], "@@@");
                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "Lemonade_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                    #endregion
                                    #region Slide 61
                                    case 61:
                                        cur_Slide = pres.Slides[60];
                                        charts = new List<ChartDetail>();
                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Freestyle: Drove Outlet Choice").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "FreeStyle_Drove_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + (tempDr.Field<string>("Metricname").ToLower() == "no" ? " Do Not " : "") + " Have Freestyle Driven Outlet Choice.";
                                        charts = GetChartDetails(charts, "FreeStyle_Drove_Chart", outputDataSet.Tables[tbl_ind], "Freestyle: Drove Outlet Choice");

                                        tempDr = outputDataSet.Tables[tbl_ind].AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == benchmark && x.Field<string>("DemofilterName") == "Freestyle: Flavors Selected").FirstOrDefault();
                                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "FreeStyle_Flvr_RdAsTxt")).TextFrame.Text = "Read As: " + (tempDr != null ? (!String.IsNullOrEmpty(Convert.ToString(tempDr.Field<object>("MetricValue")))) ? tempDr.Field<double>("MetricValue").ToString("##0%") : "0%" : "0%") + " Of Visits To " + benchmark + " Have Freestyle: Flavors Selected - " + tempDr.Field<string>("Metricname") + ".";
                                        charts = GetChartDetails(charts, "FreeStyle_Flvr_Chart", outputDataSet.Tables[tbl_ind], "Freestyle: Flavors Selected");

                                        _slideReplace.ReplaceShape(cur_Slide, new SlideDetail() { Charts = charts });
                                        #region Updating Charts with Data
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "FreeStyle_Drove_Chart", xAxis_fact);
                                        UpdateSeriesData(overlap_val, dp_index, series_ind, benchmark, "FreeStyle_Flvr_Chart", xAxis_fact);
                                        #endregion Updating Charts with Data
                                        break;
                                        #endregion
                                }
                            }
                            else
                            {
                                //remove every charts
                                foreach (var item in pres.Slides[slideId - 1].Shapes)
                                {
                                    var shp = item.Name;
                                    var chart = item as Aspose.Slides.Charts.IChart;
                                    if (chart != null)
                                    {
                                        //Set all datapoints value to be 0
                                        foreach (var ser in chart.ChartData.Series)
                                        {
                                            foreach (var dp in ser.DataPoints)
                                            {
                                                dp.Value.Data = 0;
                                            }
                                        }
                                    }
                                }
                            }
                            if (fixedSlides.IndexOf(slideId) == -1 && slideId != 2)
                            {
                                tbl_ind++;
                            }
                        }
                    }
                }
                catch(Exception ex)
                {
                    Log.LogMessage("********" + '\n' + "*****");
                    Log.LogMessage(ex.Message+'\n'+ex.StackTrace+'\n');
                }

                #region Remove Slides which are not Selected in Custom Tiles
                //Remove the Extra slides
                int removeableCount = 0;
                if (isCustmDownld == "True")
                {

                    System.Collections.ArrayList sliD = new System.Collections.ArrayList();
                    for (int sl = 1; sl <= pres.Slides.Count; sl++)
                    {
                        if (!slideIDs.Contains(sl))
                        {
                            sliD.Add(sl);
                        }
                    }
                    foreach (int sNumber in sliD)
                    {
                        pres.Slides[(sNumber - 1 - removeableCount)].Remove();
                        removeableCount++;
                    }
                    //to remove disabled slides when downloadall Button Clicked
                    if (slideIDs.Count == 61)
                    {
                        //pres.Slides[46].Remove();
                        //pres.Slides[38].Remove();
                        pres.Slides[20].Remove();

                    }
                    //

                }
                else
                {
                    //to remove disabled slides when downloadall Button Clicked
                    //pres.Slides[46].Remove();
                    //pres.Slides[38].Remove();
                    pres.Slides[20].Remove();

                }
                //
                #endregion Remove Slides which are not Selected in Custom Tiles
                pres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);
            }

        }

        public string PrepareInsightsReport(List<MacroDetails> pptList, string filepath, HttpContextBase context)
        {
            var destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            PrepareInsightsReportSave(pptList, filepath, context, destinationtemplate);
            return destinationtemplate;
        }

        public string cleanText(string str)
        {
            string res = str.Trim();
            try
            {

                string res1 = Regex.Replace(res, @"[^0-9a-zA-Z\._]", "");

                return res1;

            }
            catch (Exception e)
            {
                throw e;
            }

        }
        public void PrepareInsightsReportSave(List<MacroDetails> pptList, string filepath, HttpContextBase context, string destinationtemplate)
        {
            List<string> sec = new List<string>();
            List<string> subsec = new List<string>();
            sec.Clear();
            int delimiterSlide = 3;
            int clonesubSlide = 3;
            string dir;
            string loc = "";
            string subPath = "";
            using (Presentation masterPres = new Presentation(filepath))
            {
                Presentation prnt = new Presentation();

                var c = 0;
                var subname = "";
                int h = 100;
                sec.Clear();
                int l = 150;
                var secname = "";
                int grpId = 1;
                IGroupShape tempGroup;
                int slideInex = 2;
                var parntSectionNameList = pptList.Select(o => o.SectionName).Distinct().ToList();
                var parntSubSectionNameList = pptList.Select(o => o.SubSectionName).Distinct().ToList();
                int slideId = 0;

                #region slide1
                cur_Slide = masterPres.Slides[0];

                subPath = "~/Images/temp/" + context.Session.SessionID + Utils.getUniqueConst();
                if (!String.IsNullOrEmpty(pptList[0].logoName))
                    loc = "~/Images/P2PDashboardEsthmtImages/" + pptList[0].logoName.Replace("/", "") + ".svg";
                if (!String.IsNullOrEmpty(pptList[0].customerName))
                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "customerName")).TextFrame.Text = pptList[0].customerName;
                else
                    ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "customerName")).TextFrame.Text = "";

                PictureFrame logoImage = (PictureFrame)masterPres.Slides[2].Shapes.Where(x => x.Name == "customerLogo").FirstOrDefault();

                float height = logoImage.Height;
                float width = logoImage.Width;
                float xPosition = logoImage.X;
                float yPosition = logoImage.Y;

                imageReplace((PictureFrame)cur_Slide.Shapes.Where(x => x.Name == "customerLogo").FirstOrDefault(), loc, context, slideId, -2, subPath);

                #endregion
                #region slide2
                cur_Slide = masterPres.Slides[1];
                AddImage(xPosition, yPosition, width, height, cur_Slide, masterPres, loc, context, slideId, -2, subPath);
                //slideId++;
                //imageReplace((PictureFrame)cur_Slide.Shapes.Where(x => x.Name == "customerLogo").FirstOrDefault(), loc, context, slideId, -2, subPath);

                #endregion
                #region Selections summary slide
                cur_Slide = masterPres.Slides[2];
                slideId++;
                imageReplace((PictureFrame)cur_Slide.Shapes.Where(x => x.Name == "customerLogo").FirstOrDefault(), loc, context, slideId, -2, subPath);
                double totalsectionsHeightCount = (parntSectionNameList.Count * 16) + (parntSubSectionNameList.Count * 16) + ((parntSectionNameList.Count - 1) * 21);
                int totalextraslindes = (int)Math.Ceiling(totalsectionsHeightCount / 400);
                if (totalsectionsHeightCount < 420)
                    totalextraslindes = 1;
                for (int slideclone = 1; slideclone < totalextraslindes; slideclone++)
                {
                    masterPres.Slides.InsertClone(slideclone + 2, masterPres.Slides[2]);
                }
                delimiterSlide = totalextraslindes + 2;
                clonesubSlide = totalextraslindes + 2;
                int subSectnCount = 0;
                //float verticalPositionGrp = 0;
                List<double> verticalPositionGrp = new List<double>();
                double postn = 0.0, totalpostn = 0.0;
                int slidesCountCheck = 0, parentHeaderCount = 0;
                for (int k = 0; k < parntSectionNameList.Count; k++)
                {
                    var totalSubsectionCountofParentsect = (from r in pptList.AsEnumerable()
                                                            where Convert.ToString(r.SectionName).Equals(Convert.ToString(parntSectionNameList[k]), StringComparison.OrdinalIgnoreCase)
                                                            select new
                                                            {
                                                                value = r.SubSectionName
                                                            }).ToList();
                    if (totalpostn > 300 && totalpostn < 336 && totalSubsectionCountofParentsect.Count > 3)
                        postn = 401;
                    else if (totalpostn > 335 && totalSubsectionCountofParentsect.Count > 2)
                        postn = 401;
                    else if (totalpostn > 268 && totalSubsectionCountofParentsect.Count > 6)
                        postn = 401;
                    else if (totalpostn > 350 && totalSubsectionCountofParentsect.Count > 2)
                        postn = 401;

                    if (postn > 400)
                    {
                        //delete groups in current slides that was left over
                        for (int del = 5; grpId <= del; grpId++)
                        {
                            cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault());
                        }
                        //
                        verticalPositionGrp = new List<double>();
                        postn = 0.0;
                        totalpostn = 0.0;
                        grpId = 1;
                        parentHeaderCount = 0;
                        if (slidesCountCheck < totalextraslindes)
                            cur_Slide = masterPres.Slides[slidesCountCheck + 3];
                        slidesCountCheck++;
                    }
                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault();
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "parentnme_" + grpId).FirstOrDefault()).TextFrame.Text = parntSectionNameList[k];
                    string subSectnNamesappend = "";
                    subSectnCount = 0;
                    for (int m = 0; m < totalSubsectionCountofParentsect.Count; m++)
                    {
                        if (subSectnCount == 0)
                            subSectnNamesappend += totalSubsectionCountofParentsect[m].value;
                        else
                            subSectnNamesappend += "\n" + totalSubsectionCountofParentsect[m].value;
                        subSectnCount++;

                    }
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "subsectn_" + grpId).FirstOrDefault()).TextFrame.Text = subSectnNamesappend;
                    IConnector textShape = (IConnector)tempGroup.Shapes.Where(x => x.Name == "leftbar_" + grpId).FirstOrDefault();
                    textShape.Height = (float)(16 * (subSectnCount + 1));
                    verticalPositionGrp.Add(16 * (subSectnCount + 1));

                    postn = 0.0;
                    for (int v = 0; v < (verticalPositionGrp.Count - 1); v++)
                    {
                        postn = postn + verticalPositionGrp[v];
                    }

                    if (grpId == 1)
                        cur_Slide.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault().Y = (float)70;
                    else
                        cur_Slide.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault().Y = (float)postn + (21 * parentHeaderCount) + 70;

                    totalpostn = postn + (21 * parentHeaderCount) + 70;
                    grpId++;
                    parentHeaderCount++;

                }
                for (int del = 5; grpId <= del; grpId++)
                {
                    cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault());
                }
                #endregion selection summary
                #region slide4
                cur_Slide = masterPres.Slides[3];
                slideId++;
                //imageReplace((PictureFrame)cur_Slide.Shapes.Where(x => x.Name == "customerLogo").FirstOrDefault(), loc, context, slideId, -2, subPath);
                AddImage(xPosition, yPosition, width, height, cur_Slide, masterPres, loc, context, slideId, -2, subPath);
                #endregion

                #region Cloning code
                for (int j = 0; j < pptList.Count; j++)
                {
                    string pptFileName = pptList[j].Filename.ToString().Trim();
                    dir = "~/PPTBuilder/" + cleanText(pptList[j].SectionName).Trim() + "/" + cleanText(pptList[j].SubSectionName.Trim()) + ".pptx";
                    Presentation srcPres = new Presentation(HttpContext.Current.Server.MapPath(dir));

                    ISlide slide = masterPres.Slides[delimiterSlide];
                    ((IAutoShape)slide.Shapes.FirstOrDefault(x => x.Name == "sub-section-name")).TextFrame.Text = pptList[j].SubSectionName;
                    ((IAutoShape)slide.Shapes.FirstOrDefault(x => x.Name == "sub-section-desc")).TextFrame.Text = pptList[j].SubSectionNamedesc;

                    ISlideCollection slds = masterPres.Slides;
                    for (int i = 0; i < Convert.ToInt16(pptList[j].SlideCount); i++)
                    {

                        slds.AddClone(srcPres.Slides[i]);
                        AddImage(xPosition, yPosition, width, height, masterPres.Slides[slds.Count - 1], masterPres, loc, context, slideId, -2, subPath);
                    }
                    delimiterSlide += pptList[j].SlideCount + 1;
                    if (j < pptList.Count - 1)
                        slds.AddClone(masterPres.Slides[clonesubSlide]);
                }
                #endregion

                //HttpContext.Session["Aspose"] = masterPres;
                masterPres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);

            }
        }
        public System.Data.DataTable FillStatValueColumn(System.Data.DataTable dt, List<string> colName)
        {
            //add one column calculated stat value and calculate the stat value here , then return the modified data table
            //for adding and calculation use ChartBO.cs > GetDataTable > line no 64 to 146
            //this needs to be called at each chart.Add function while assigning chart.Add({ data = "here".....
            return null;
        }
        public virtual DataColor GetDataPointColorForPercentage(string columnName)
        {
            //var per = 100;
            ColorRange index = new ColorRange()
            {
                Min = new ColorCode() { Range = -1.96, Color = Color.Red },
                Max = new ColorCode() { Range = 1.96, Color = Color.Green },
                DefaultColor = Color.FromArgb(89, 89, 89)
            };
            return new DataColor() { ColumnName = columnName, Range = index };
        }

        public static void prepareCustomTileList()
        {

        }

        public IList<ChartDetail> GetChartDetails(IList<ChartDetail> charts, string elementid, DataTable dt, string demofilterName)
        {
            DataTable md_dt = demofilterName == "@@@" ? dt : dt.AsEnumerable().Where(x => x.Field<string>("Demofiltername") == demofilterName).CopyToDataTable();
            Significance_Color temp_Sig = new Significance_Color();
            temp_Sig.ElementID = elementid;
            temp_Sig.significance_color = new List<Color>();
            foreach (DataRow item in md_dt.Rows)
            {
                double calstatvalue = 0.0; int total_SS = 0;
                double.TryParse(Convert.ToString(item["SignificanceValue"]), out calstatvalue);
                int.TryParse(Convert.ToString(item[elementid == "TotalGB" ? "Samplesize" : "TotalSamplesize"]), out total_SS);
                if (total_SS < 30)
                {
                    item["Metricvalue"] = 0.0; temp_Sig.significance_color.Add(Color.Black);
                }
                else
                {
                    if (total_SS >= 30 && total_SS <= 99)
                    {
                        if (calstatvalue > 1.96)
                        {
                            temp_Sig.significance_color.Add(Color.Green);
                        }
                        else
                        {
                            if (calstatvalue < -1.96)
                                temp_Sig.significance_color.Add(Color.Red);
                            else
                                temp_Sig.significance_color.Add(Color.Gray);
                        }
                    }
                    else
                    {
                        if (calstatvalue > 1.96)
                        {
                            temp_Sig.significance_color.Add(Color.Green);
                        }
                        else
                        {
                            if (calstatvalue < -1.96)
                                temp_Sig.significance_color.Add(Color.Red);
                            else
                                temp_Sig.significance_color.Add(Color.Black);
                        }
                    }
                }
            }
            sig_col.Add(temp_Sig);

            charts.Add(new ChartDetail()
            {
                ElementID = elementid,
                Data = md_dt,
                XAxisColumnName = "Metricname",
                YAxisColumnName = "MetricValue",
                SeriesColumnName = "EstablishmentName",
                ShowLabel = true,
                Type = AsposeChart.ChartType.ClusteredColumn,
                DataFormat = "###,##0%",
                DataLabelFontHeight = (float)8.5,
                Font = new FontData("Franklin Gothic Book")
            });
            return charts;
        }
        public void UpdateSeriesData(sbyte overlap_val, int dp_index, int series_ind, string benchmark, string chart_id, double xAxis_fact)
        {
            chart_to_change_dataLabelColors = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == chart_id).FirstOrDefault();
            //Set length of Vetical Axis
            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsAutomaticMaxValue = false;
            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsAutomaticMinValue = false;
            chart_to_change_dataLabelColors.Axes.VerticalAxis.MaxValue = xAxis_fact;
            chart_to_change_dataLabelColors.Axes.VerticalAxis.MinValue = 0;

            series_ind = 0; dp_index = 0;
            foreach (var temp_series in chart_to_change_dataLabelColors.ChartData.Series)
            {
                temp_series.ParentSeriesGroup.Overlap = overlap_val;
                //temp_series.Format.Fill.FillType = FillType.Solid;
                temp_series.Format.Fill.SolidFillColor.Color = (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);

                temp_series.Format.Fill.FillType = FillType.Gradient;
                temp_series.Format.Fill.GradientFormat.GradientShape = GradientShape.Linear;
                temp_series.Format.Fill.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                temp_series.Format.Fill.GradientFormat.LinearGradientAngle = 90;

                Color _Stop2Col = (series_ind >= _CurrentColors.Length) ? GlobalConstants.Stop2Col[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);
                Color _Stop1Col = (series_ind >= _CurrentColors.Length) ? GlobalConstants.Stop1Col[series_ind] : GlobalConstants.Colorluminance(ColorTranslator.FromHtml(_CurrentColors[series_ind]), 0.25f);
                temp_series.Format.Fill.GradientFormat.GradientStops.Add(0, _Stop1Col);
                temp_series.Format.Fill.GradientFormat.GradientStops.Add(1, _Stop2Col);
                temp_series.Format.Effect.EnableOuterShadowEffect();
                temp_series.Format.Effect.OuterShadowEffect.BlurRadius = 2;
                temp_series.Format.Effect.OuterShadowEffect.Direction = 90;
                temp_series.Format.Effect.OuterShadowEffect.Distance = 1.5;
                temp_series.Format.Effect.OuterShadowEffect.ShadowColor.Color = Color.Black;
                dp_index = 0;
                foreach (var datapoints in temp_series.DataPoints)
                {
                    datapoints.Label.TextFormat.TextBlockFormat.TextVerticalType = TextVerticalType.Vertical270;
                    if (temp_series.Name.ToString() == benchmark)
                    {
                        if (selectedStatText.ToString().ToLower() != "previous period" && selectedStatText.ToString().ToLower() != "previous year")
                        {
                            datapoints.Label.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                            datapoints.Label.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Blue;
                        }
                        else
                        {
                            datapoints.Label.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                            datapoints.Label.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = sig_col.Where(x => x.ElementID == chart_id).FirstOrDefault().significance_color.ElementAt(series_ind + dp_index * chart_to_change_dataLabelColors.ChartData.Series.Count);
                        }
                    }
                    else
                    {
                        datapoints.Label.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                        datapoints.Label.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = sig_col.Where(x => x.ElementID == chart_id).FirstOrDefault().significance_color.ElementAt(series_ind + dp_index * chart_to_change_dataLabelColors.ChartData.Series.Count);
                    }
                    dp_index++;
                }
                series_ind++;
            }
        }

        //For Pyramid Chart
        public void UpdatePyramidSeriesData(DataTable dt, sbyte overlap_val, int dp_index, int series_ind, string benchmark, string chart_id, double xAxis_fact)
        {
            int defaultIndex = 0;
            List<string> ser = dt.AsEnumerable().Select(x => x.Field<string>("EstablishmentName")).Distinct().ToList();
            chart_to_change_dataLabelColors = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == chart_id).FirstOrDefault();
            if (ser.Count < 5)
            {
                //Remove other Pyramids
                int countToDel = 3 + 4 * (4 - ser.Count);
                for (int i = 18; i >= (19 - countToDel); i--)
                {
                    chart_to_change_dataLabelColors.ChartData.Series.RemoveAt(i);
                }
            }
            //Set length of Vetical Axis
            chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
            chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMinValue = false;
            chart_to_change_dataLabelColors.Axes.HorizontalAxis.MinValue = 0;
            chart_to_change_dataLabelColors.Axes.HorizontalAxis.MaxValue = ser.Count + (ser.Count - 1) * 0.05;
            chart_to_change_dataLabelColors.Axes.HorizontalAxis.NumberFormat = @"##0%";
            AsposeChart.IChartDataWorkbook fact = chart_to_change_dataLabelColors.ChartData.ChartDataWorkbook;
            //Add Series

            List<string> xCol = dt.AsEnumerable().Select(x => x.Field<string>("Metricname")).Distinct().ToList();
            //List<string> metricvalue = dt.AsEnumerable().Select(x => x.Field<string>("MetricValue")).ToList();
            series_ind = 1; dp_index = 1;
            int pyramid_ind = 0;
            foreach (var item in ser)
            {
                fact.GetCell(defaultIndex, 0, 1 + dp_index, item);
                series_ind = 1;

                //Update the color
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.SolidFillColor.Color = (pyramid_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[pyramid_ind] : ColorTranslator.FromHtml(_CurrentColors[pyramid_ind]);
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.FillType = FillType.Gradient;
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.GradientShape = GradientShape.Linear;
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.LinearGradientAngle = 90;
                Color _Stop2Col = (pyramid_ind >= _CurrentColors.Length) ? GlobalConstants.Stop2Col[pyramid_ind] : ColorTranslator.FromHtml(_CurrentColors[pyramid_ind]);
                Color _Stop1Col = (pyramid_ind >= _CurrentColors.Length) ? GlobalConstants.Stop1Col[pyramid_ind] : GlobalConstants.Colorluminance(ColorTranslator.FromHtml(_CurrentColors[pyramid_ind]), 0.25f);
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.GradientStops.RemoveAt(0);
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.GradientStops.RemoveAt(0);
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.GradientStops.Add(0, _Stop1Col);
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.GradientFormat.GradientStops.Add(1, _Stop2Col);
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Effect.EnableOuterShadowEffect();
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Effect.OuterShadowEffect.BlurRadius = 2;
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Effect.OuterShadowEffect.Direction = 90;
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Effect.OuterShadowEffect.Distance = 1.5;
                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Effect.OuterShadowEffect.ShadowColor.Color = Color.White;

                foreach (var x in xCol)
                {
                    if (dp_index == 1)
                    {
                        fact.GetCell(defaultIndex, series_ind, 0, x);
                    }
                    var val = dt.AsEnumerable().Where(y => y.Field<string>("EstablishmentName") == item && y.Field<string>("Metricname") == x).FirstOrDefault();
                    double mv = val["MetricValue"] == DBNull.Value ? 0 : Convert.ToDouble(val["MetricValue"]);
                    fact.GetCell(defaultIndex, series_ind, 1 + dp_index, mv);
                    fact.GetCell(defaultIndex, series_ind, dp_index, (1 - mv) / 2);
                    fact.GetCell(defaultIndex, series_ind, 2 + dp_index, (1 - mv) / 2);
                    //Set the labels
                    chart_to_change_dataLabelColors.ChartData.Series[dp_index].DataPoints[series_ind - 1].Label.DataLabelFormat.NumberFormat = "#0%";
                    chart_to_change_dataLabelColors.ChartData.Series[dp_index].DataPoints[series_ind - 1].Label.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                    chart_to_change_dataLabelColors.ChartData.Series[dp_index].DataPoints[series_ind - 1].Label.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = returnStatTestColor(val, dp_index == 1);
                    series_ind++;
                }
                dp_index = dp_index + 4;
                pyramid_ind++;
            }
        }

        public void assignStatTestColor(IAutoShape textShape, DataRow tempDr, bool isFirst)
        {
            if (selectedStatText.ToString().ToLower() != "previous period" && selectedStatText.ToString().ToLower() != "previous year")
            {

                double sig_val = 0; int Total_SS = 0;
                double.TryParse(Convert.ToString(tempDr.Field<object>("SignificanceValue")), out sig_val);
                int.TryParse(Convert.ToString(tempDr.Field<object>("TotalSamplesize")), out Total_SS);
                if (Total_SS < 30)
                {
                    textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Transparent;
                }
                else
                {
                    if (isFirst)
                    {
                        textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Blue;
                    }
                    else
                    {
                        if (Total_SS >= 30 && Total_SS <= 99)
                        {
                            textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Gray;
                        }
                        else
                        {
                            if (sig_val < -1.96)
                            {
                                textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Red;
                            }
                            else
                            {
                                if (sig_val > 1.96)
                                {
                                    textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Green;
                                }
                                else
                                {
                                    textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;

                                }
                            }
                        }
                    }
                }
            }
            else
            {
                textShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
            }
        }
        public Color returnStatTestColor(DataRow tempDr, bool isFirst)
        {
            if (selectedStatText.ToString().ToLower() != "previous period" && selectedStatText.ToString().ToLower() != "previous year")
            {

                double sig_val = 0; int Total_SS = 0;
                double.TryParse(Convert.ToString(tempDr.Field<object>("SignificanceValue")), out sig_val);
                int.TryParse(Convert.ToString(tempDr.Field<object>("TotalSamplesize")), out Total_SS);
                if (Total_SS < 30)
                {
                    return Color.Transparent;
                }
                else
                {
                    if (isFirst)
                    {
                        return Color.Blue;
                    }
                    else
                    {
                        if (Total_SS >= 30 && Total_SS <= 99)
                        {
                            if (sig_val < -1.96)
                            {
                                return Color.Red;
                            }
                            else
                            {
                                if (sig_val > 1.96)
                                {
                                    return Color.Green;
                                }
                                else
                                {
                                    return Color.Gray;
                                }
                            }
                        }
                        else
                        {
                            if (sig_val < -1.96)
                            {
                                return Color.Red;
                            }
                            else
                            {
                                if (sig_val > 1.96)
                                {
                                    return Color.Green;
                                }
                                else
                                {
                                    return Color.Black;
                                }
                            }
                        }
                    }
                }
            }
            return Color.Black;
        }
        public Color returnStatTestColorSARBG(DataRow tempDr, bool isTextColor)
        {
            double sig_val = 0;
            double devitionVal = 0;
            double.TryParse(Convert.ToString(tempDr.Field<object>("DeviationValue")), out devitionVal);
            double.TryParse(Convert.ToString(tempDr.Field<object>("SigRangeValue")), out sig_val);
            if (devitionVal == 999 && isTextColor)
                return Color.Black;
            else if (devitionVal == 999)
                return Color.Transparent;

            if (isTextColor)
            {
                if (devitionVal > sig_val)
                    return Color.FromArgb(0, 100, 0);
                else
                {
                    if (devitionVal < -sig_val)
                        return Color.FromArgb(192, 0, 0);
                    else
                        return Color.Black;
                }
            }
            else
            {
                if (devitionVal > sig_val)
                    return Color.FromArgb(239, 242, 218);
                else
                {
                    if (devitionVal < -sig_val)
                        return Color.FromArgb(252, 232, 233);
                    else
                        return Color.Transparent;
                }
            }
        }
        //For Diner Report Imagery Tables
        public void createDinerImageryTable(ISlide sld, DataTable dt)
        {
            int index = 0, jInd = 0, kInd = 0, cur_row_ind = 2;
            double tbl_width = 913.8067, tbl_x = 23.09668, tbl_y = 101.2809, first_col_w = 230, padd_w = 15;
            List<string> groups = dt.AsEnumerable().Select(x => x.Field<string>("Groups")).Distinct().ToList();
            List<string> estList = dt.AsEnumerable().Select(x => x.Field<string>("EstablishmentName")).Distinct().ToList();
            List<string> metricList = dt.AsEnumerable().Select(x => x.Field<string>("MetricName")).Distinct().ToList();
            double[] cols = new double[1 + 2 * estList.Count];
            double[] rows = new double[2 + groups.Count + dt.Rows.Count / estList.Count];
            //Initialize cols
            double leftoutwidth = (tbl_width - first_col_w - (padd_w * estList.Count)) / estList.Count;
            cols[0] = first_col_w;
            for (index = 1; index < cols.Length; index++)
            {
                if (index % 2 == 0)
                {
                    cols[index] = leftoutwidth;
                }
                else
                {
                    cols[index] = padd_w;
                }
            }
            //Place shadow accordingly
            if (estList.Count > 1)
            {
                for (index = 2; index <= estList.Count; index++)
                {
                    //Create one more shadow and place
                    PictureFrame img = (PictureFrame)sld.Shapes.Where(x => x.Name == "p" + (index)).FirstOrDefault();
                    img.X = (float)(tbl_x + first_col_w + (index - 1) * (padd_w + leftoutwidth) + padd_w / 2 - img.Width / 4);
                }
            }
            //Delete extra shadows
            for (index = estList.Count + 1; index <= 5; index++)
            {
                sld.Shapes.Remove(sld.Shapes.Where(x => x.Name == ("p" + index)).FirstOrDefault());
            }
            //Create table
            AsposeSlide.ITable tbl = (Aspose.Slides.ITable)sld.Shapes.AddTable((float)tbl_x, (float)tbl_y, cols, rows);
            tbl.FirstRow = true;
            tbl.StylePreset = TableStylePreset.MediumStyle2Accent1;
            formatTableCell(tbl[0, 0], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 11, TextAlignment.Center, TextCapType.All, 6, 0);
            formatTableCell(tbl[0, 1], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 1, TextAlignment.Center, TextCapType.All, 3, 0);
            //Fill table
            for (index = 0; index < estList.Count; index++)
            {
                cur_row_ind = 2;
                //Add column header
                tbl[2 + 2 * index, 0].TextFrame.Text = estList[index];
                //Format Column Headers
                Color _HeaderColor = (index >= _CurrentColors.Length) ? GlobalConstants.LegendColors[index] : ColorTranslator.FromHtml(_CurrentColors[index]);
                formatTableCell(tbl[2 + 2 * index, 0], LineDashStyle.Solid, _HeaderColor, Color.FromArgb(64, 64, 64), Color.FromArgb(208, 206, 206), 11, TextAlignment.Center, TextCapType.All, 6, 0);
                formatTableCell(tbl[1 + 2 * index, 0], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 11, TextAlignment.Center, TextCapType.All, 6, 0);
                formatTableCell(tbl[2 + 2 * index, 1], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 1, TextAlignment.Center, TextCapType.All, 3, 0);
                formatTableCell(tbl[1 + 2 * index, 1], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 1, TextAlignment.Center, TextCapType.All, 3, 0);
                for (jInd = 0; jInd < groups.Count; jInd++)
                {
                    var dt_rows = dt.AsEnumerable().Where(x => x.Field<string>("Groups") == groups[jInd] && x.Field<string>("EstablishmentName") == estList[index]);
                    kInd = 0;
                    //Add the group row
                    if (index == 0)
                    {
                        tbl[0, cur_row_ind].TextFrame.Text = groups[jInd];
                        formatTableCell(tbl[0, cur_row_ind], LineDashStyle.Solid, Color.FromArgb(100, 100, 100), Color.FromArgb(64, 64, 64), Color.FromArgb(230, 230, 230), 11, TextAlignment.Left, TextCapType.All, 5, 5);
                    }
                    //Format the group-column header
                    formatTableCell(tbl[2 + 2 * index, cur_row_ind], LineDashStyle.Solid, Color.FromArgb(100, 100, 100), Color.FromArgb(64, 64, 64), Color.FromArgb(230, 230, 230), 11, TextAlignment.Left, TextCapType.All, 5, 0);
                    formatTableCell(tbl[1 + 2 * index, cur_row_ind], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 11, TextAlignment.Center, TextCapType.All, 5, 0);
                    cur_row_ind++;
                    foreach (DataRow dr in dt_rows)
                    {
                        if (index == 0)
                        {
                            //Update the 1st Column
                            tbl[0, cur_row_ind].TextFrame.Text = Convert.ToString(dr["Metricname"]);
                            formatTableCell(tbl[0, cur_row_ind], LineDashStyle.Dot, Color.FromArgb(100, 100, 100), Color.Black, Color.Transparent, 9, TextAlignment.Left, TextCapType.None, 3, 15);
                        }
                        //Update the values
                        tbl[2 + 2 * index, cur_row_ind].TextFrame.Text = Convert.ToString(dr["TotalSampleSize"]) == "" ? "" : (Convert.ToDouble(dr["MetricValue"])).ToString("#0%");
                        formatTableCell(tbl[2 + 2 * index, cur_row_ind], LineDashStyle.Dot, Color.FromArgb(100, 100, 100), returnStatTestColor(dr, index == 0), Color.Transparent, 9, TextAlignment.Center, TextCapType.None, 3, 0);
                        formatTableCell(tbl[1 + 2 * index, cur_row_ind], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 9, TextAlignment.Center, TextCapType.All, 3, 0);
                        kInd++; cur_row_ind++;
                    }
                }
            }
            //Remove existing table
            sld.Shapes.Remove(sld.Shapes.Where(x => x.Name == "tbl").FirstOrDefault());
        }

        //Format table cells
        public void formatTableCell(ICell x, LineDashStyle bdr_lds, Color bdr_clr, Color font_clr, Color bg_clr, float fontH, TextAlignment align, TextCapType tcp, float top, float left, NullableBool isFB = NullableBool.False)
        {
            //Border
            x.BorderTop.Width = 0;
            x.BorderLeft.Width = 0;
            x.BorderRight.Width = 0;
            x.BorderBottom.DashStyle = bdr_lds;
            x.BorderBottom.FillFormat.FillType = FillType.Solid;
            x.BorderBottom.FillFormat.SolidFillColor.Color = bdr_clr;

            //Background color, font color, font size, alignment
            x.FillFormat.FillType = FillType.Solid;
            x.FillFormat.SolidFillColor.Color = bg_clr;
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FillFormat.FillType = FillType.Solid;
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FillFormat.SolidFillColor.Color = font_clr;
            x.TextFrame.Paragraphs[0].ParagraphFormat.FontAlignment = FontAlignment.Center;
            x.TextFrame.Paragraphs[0].ParagraphFormat.Alignment = align;
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FontHeight = fontH;

            //Case
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.TextCapType = tcp;

            //Margins top,bottom : 0.1cm
            x.MarginTop = x.MarginBottom = top;
            x.MarginLeft = left;
            x.MarginRight = 0;

            //Vertical Alignment Center
            x.TextAnchorType = TextAnchorType.Center;

            //Font-family Franklin Gothic Book
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.LatinFont = new FontData("Franklin Gothic Book");
            //Font-bold
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FontBold = isFB;
        }

        //public async void PrepareSARReport(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId)
        //public string PrepareSARReport(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId)
        //{
        //    var destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
        //    SlideReplace _slideReplace = new SlideReplace();
        //    IList<ChartDetail> charts = new List<ChartDetail>();
        //    int task = 0;
        //    //Slides
        //    using (Presentation pres = new Presentation(filepath))
        //    {

        //        //foreach (var spName in spNames)
        //        //{
        //        //   var result = await Task.Run(()=> (new Report()).PrepareSARReport(filter, spName));

        //        //    //Task TRetailer = Task.Run(async () =>
        //        //    //{
        //        //        prepareSARportPPT(pres, filter, result, filepath, destinationtemplate, context);
        //        //    //});
        //        //    //await TRetailer;
        //        //}

        //        pres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);
        //    }
        //   return "";

        //}

        // Demonstrates a basic producer and consumer pattern that uses dataflow.

        #region Producer and consumer
        static void Produce(ITargetBlock<ListTempData> target, string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId, List<SituationAnalysisSelectList> selectionList, Presentation pres)
        {

            SlideReplace _slideReplace = new SlideReplace();
            IList<ChartDetail> charts = new List<ChartDetail>();
            int slideId = 3;
            DataSet ds = new DataSet();
            //DataTable result;
            DataTable copytable;
            int spIncrmt = 0;
            ListTempData resultSlideIdTemp = new ListTempData();
            var buffer = new BufferBlock<ListTempData>();

            // In a loop, fill a buffer with random data and
            // post the buffer to the target block.
            foreach (var spName in spNames)
            {
                slideId++;
                if (!string.IsNullOrEmpty(spName))
                {
                    Thread t = new Thread(() =>
                    {
                        //filter = filtModifications(filter, spName, selectionList, spIncrmt);
                    });

                    resultSlideIdTemp.Result = (new Report()).GetTableOutputPPT(filter, spName);
                    resultSlideIdTemp.SlideId = slideId;
                }
                // Post the result to the message block.
                target.Post(resultSlideIdTemp);
                var consumer = ConsumeAsync(buffer, filepath, filter, spNames, context, userId, selectionList, pres);

            }

            // Set the target to the completed state to signal to the consumer
            // that no more data will be available.
            target.Complete();

        }

        // Demonstrates the consumption end of the producer and consumer pattern.
        static async Task<string> ConsumeAsync(ISourceBlock<ListTempData> source, string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId, List<SituationAnalysisSelectList> selectionList, Presentation pres)
        {
            // Initialize a counter to track the number of bytes that are processed.
            string destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            // Read from the source buffer until the source buffer has no 
            // available output data.
            while (await source.OutputAvailableAsync())
            {
                ListTempData data = source.Receive();
                (new ReportDine()).prepareSARportPPT(pres, filter, data.Result, filepath, destinationtemplate, context, data.SlideId, selectionList);
                //spIncrmt++;
            }
            pres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);
            return destinationtemplate;
        }

        #region Main SAR Report

        public string PrepareSARReport1(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId, List<SituationAnalysisSelectList> selectionList)
        {
            // Create a BufferBlock<byte[]> object. This object serves as the 
            // target block for the producer and the source block for the consumer.
            Presentation pres = new Presentation(filepath);
            var buffer = new BufferBlock<ListTempData>();

            // Start the consumer. The Consume method runs asynchronously. 

            // Post source data to the dataflow block.
            Produce(buffer, filepath, filter, spNames, context, userId, selectionList, pres);

            // Wait for the consumer to process all data.
            //consumer.Wait();
            return "";
        }
        #endregion
        #endregion
        public async Task<string> PrepareSARReport(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId, List<SituationAnalysisSelectList> selectionList)
        {
            string destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            SlideReplace _slideReplace = new SlideReplace();
            IList<ChartDetail> charts = new List<ChartDetail>();
            int slideId = 4;
            DataSet ds = new DataSet();
            //DataTable result;
            DataTable copytable;
            int spIncrmt = 0;
            //using (Presentation pres = new Presentation(filepath))
            //{
            //    var tasks = new List<Task>();
            //    foreach (var spName in spNames)
            //    {
            //        slideId++;
            //        if (!string.IsNullOrEmpty(spName))
            //        {
            //            tasks.Add(Task.Factory.StartNew(new Action<object>((args) =>
            //            {
            //                var paramsArr = (object[])args;
            //                var newFilter = (FilterPanelInfo[])paramsArr[0];
            //                var newSpName = (string)paramsArr[1];
            //                var newSlideId = (int)paramsArr[2];
            //                var newSpIncrmt = (int)paramsArr[3];

            //                newFilter = filtModifications(newFilter, newSpName, selectionList, newSpIncrmt);
            //                DataTable result = (new Report()).GetTableOutputPPT(newFilter, newSpName);
            //                lock (PPTLock)
            //                {
            //                    prepareSARportPPT(pres, newFilter, result, filepath, destinationtemplate, context, newSlideId, selectionList);
            //                }
            //            }), new object[] { filter, spName, slideId, spIncrmt }));
            //            spIncrmt++;
            //        }
            //    }
            //    Task.WaitAll(tasks.ToArray());
            //    pres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);

            //}
            //return "";

            //Slides
            using (Presentation pres = new Presentation(filepath))
            {
                await Task.Run(async () =>
                {
                    foreach (var spName in spNames)
                    {
                        slideId++;
                        if (!string.IsNullOrEmpty(spName))
                        {
                            filter = filtModifications(filter, spName, selectionList, spIncrmt);
                            var result = await Task.Run(() => (new Report()).GetTableOutputPPT(filter, spName));
                            result.TableName = result.TableName + spIncrmt;
                            copytable = result.Copy();
                            ds.Tables.Add(copytable);
                            await Task.Run(() =>
                            {
                                prepareSARportPPT(pres, filter, ds.Tables[spIncrmt], filepath, destinationtemplate, context, slideId, selectionList);
                                spIncrmt++;
                            });
                        }
                    }
                });

                if(!selectionList[0].IsImageries)
                {
                    for (int i = pres.Slides.Count - 1; i >= 22; i--)
                    {
                        pres.Slides.Remove(pres.Slides[i]);
                    }
                }

                if (selectionList[0].IsChannelSelected)
                {
                    for (int i = pres.Slides.Count - 1; i >= 20; i--)
                    {
                        pres.Slides.Remove(pres.Slides[i]);
                    }
                }
                else
                {
                    //for (int i = pres.Slides.Count - 1; i >= 23; i--)
                    //{
                    //    pres.Slides.Remove(pres.Slides[i]);
                    //}
                }
                //Added By SABAT ULLAH
                if (selectionList[0].IsFromMSS)
                {
                    pres.Slides[19].Remove();
                    pres.Slides[18].Remove();
                    pres.Slides[17].Remove();
                    pres.Slides[16].Remove();
                    pres.Slides[15].Remove();
                }

                if (selectionList[0].DeleteTripsandGuestsSlide == true || selectionList[0].IsFromMSS == true)
                {
                    pres.Slides[14].Remove();
                }

                //Added By SABAT ULLAH
                if (selectionList[0].IsFromMSS && selectionList[0].IsVisits)
                {
                    pres.Slides[9].Remove();
                    pres.Slides[8].Remove();
                    pres.Slides[7].Remove();
                    pres.Slides[6].Remove();
                    pres.Slides[5].Remove();
                    pres.Slides[4].Remove();
                }
                pres.Save(context.Server.MapPath(destinationtemplate), AsposeSlide.Export.SaveFormat.Pptx);
            }
            return "";
        }

        public void prepareSARportPPT(Presentation pres, FilterPanelInfo[] filter, DataTable result, string sourceTemplatePath, string destinationtemplate, HttpContextBase context, int slideId, List<SituationAnalysisSelectList> selectionList)
        {
            //if(slideId!=24)
            //{
            //    if (selectionList[0].IsVisits)
            //    {
            //        foreach (DataRow row in result.Rows)
            //        {
            //            if (((dynamic)row["MetricSampleSize"]) < 30)
            //            {
            //                row["MetricPercentage"] = 0.0;
            //            }
            //        }
            //    }
            //}


            SlideReplace _slideReplace = new SlideReplace();
            IList<ChartDetail> charts = new List<ChartDetail>();
            string subPath = "~/Images/temp/" + context.Session.SessionID + Utils.getUniqueConst();
            IGroupShape tempGroup;
            Aspose.Slides.Charts.IChart tempChart;
            PictureFrame tempImg;
            IAutoShape tempShape;
            string loc;
            //local variables
            double point1 = 0.0, point2 = 0.0, point3 = 0.0, point4 = 0.0;
            double metricPercentage = 0.0;
            dynamic tempRow = null;
            SituationAnalysisData sDataRow = new SituationAnalysisData();
            string footerFreqName = "";
            int frequencyIdIndex = 5;
            string[] custombase = selectionList[0].CompareEstablishment.Split(',');
            DataTable tbl;

            #region selection Summary
            string selectedEstName = selectionList[0].EstablishmentName;
            string selectedTime = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));
            //Added by Sabat Ullah
            string timePeriod = (from r in result.AsEnumerable()
                                 select r.Field<string>("TimePeriod")).FirstOrDefault();
            string footerNote = (from r in result.AsEnumerable()
                                 select r.Field<string>("FooterNote")).FirstOrDefault();


            string footerNote2 = (from r in result.AsEnumerable()
                                  select r.Field<string>("ReadAsText")).FirstOrDefault();

            #endregion
            string Filters = (selectionList[0].Filters == null) ? "NONE" : selectionList[0].Filters;
            //if (slideId == 5)
            //{
            switch (slideId)
            {

                case 5:
                    try
                    {
                        #region Slide 1

                        loc = "~/Images/P2PDashboardEsthmtImages/" + selectedEstName.Replace("/", "") + ".svg";

                        //imageReplace((PictureFrame)pres.LayoutSlides[2].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);
                        //imageReplace((PictureFrame)pres.LayoutSlides[3].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);

                        cur_Slide = pres.Slides[0];
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "SelectedEstablishmentNme")).TextFrame.Text = "BRIEFING BOOK " + "\n\n" + selectedEstName;
                        //imageReplace((PictureFrame)pres.Slides[0].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);
                        //sabat
                        timePeriod = "";
                        string footer_note = "";
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footer_note);
                        //Notes Update
                        // updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update

                        #endregion

                        #region Slide 2
                        cur_Slide = pres.Slides[1];
                        //sabat
                        timePeriod = "";
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footer_note);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        #endregion
                        #region Slide 3
                        cur_Slide = pres.Slides[2];
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "estabment")).TextFrame.Paragraphs[0].Portions[2].Text = "- " + selectedEstName;
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "timeperiod")).TextFrame.Paragraphs[0].Portions[1].Text = "- " + selectedTime;
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "custombase")).TextFrame.Paragraphs[0].Portions[1].Text = "- " + selectionList[0].CompareEstablishment;
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "competitor")).TextFrame.Paragraphs[0].Portions[1].Text = "- " + selectionList[0].Competitors;
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "filter")).TextFrame.Paragraphs[0].Portions[1].Text = "- " + Filters;

                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "estabment")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "estabment")).TextFrame.Text.Replace("_est", selectedEstName);
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "timeperiod")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "timeperiod")).TextFrame.Text.Replace("_time", selectedTime);
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "custombase")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "custombase")).TextFrame.Text.Replace("_custom", selectionList[0].CompareEstablishment);
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "competitor")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "competitor")).TextFrame.Text.Replace("_comp", selectionList[0].Competitors);
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "filter")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "filter")).TextFrame.Text.Replace("_flter", Filters);

                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "SelectionSummary")).TextFrame.Text = "Main Establishment/Channel – " + selectedEstName + " \n" +
                        //                                                                                                  "Time Period – " + selectedTime + " \n" +
                        //                                                                                                  "Comparison Establishment/Channel – " + selectionList[0].CompareEstablishment + " \n" +
                        //                                                                                                  "Competitors – " + selectionList[0].Competitors + " \n" +
                        //                                                                                                  "Filters – " + Filters;
                        //imageReplace((PictureFrame)pres.Slides[2].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);
                        //sabat
                        timePeriod = "";
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footer_note);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        #endregion

                        #region Slide 4
                        cur_Slide = pres.Slides[3];
                        //imageReplace((PictureFrame)pres.Slides[3].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);
                        //sabat
                        timePeriod = "";

                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footer_note);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        #endregion

                        #region Slide 5
                        cur_Slide = pres.Slides[4];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();
                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        timePeriod = tempShape.TextFrame.Text;

                        #endregion

                        //update header

                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[2].Text = selectionList[0].EstablishmentName;

                        for (int z = 0; z < selectionList[0].DemogActiveList.Count; z++)
                        {
                            switch (selectionList[0].DemogActiveList[z].ToString())
                            {
                                case "gender":
                                    #region Gender Widzet
                                    double metricPercentage1 = 0.0;
                                    #region Donut Chart

                                    tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "demographics_gender")).Shapes.FirstOrDefault(x => x.Name == "chart");
                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Male", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   CustomBaseName1 = r["CB1"].ToString(),
                                                   CustomBaseName2 = r["CB2"].ToString(),
                                                   CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                                   CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                                   CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                                   CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage1)) metricPercentage1 = 0.0;
                                    point2 = metricPercentage1 * 100;
                                    //point2 = result.AsEnumerable().Where(x => x.Field<string>("MetricName") == "Male").FirstOrDefault().Field<double>("MetricPercentage");
                                    //point3 = result.AsEnumerable().Where(x => x.Field<string>("MetricName") == "Female").FirstOrDefault().Field<double>("MetricPercentage");
                                    //if (!string.IsNullOrEmpty(Convert.ToString(point2)))
                                    //    point2 = point2 * 100;
                                    //if (!string.IsNullOrEmpty(Convert.ToString(point3)))
                                    //    point3 = point3 * 100;



                                    #endregion Donut Chart


                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_gender").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "male_value").FirstOrDefault()).TextFrame.Text = metricPercentage1 == 0.0 ? "0.0" : Convert.ToDouble(metricPercentage1 * 100).ToString("#0.0") + "%";

                                    tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_gender").FirstOrDefault()).Shapes.Where(x => x.Name == "Gender_Male").FirstOrDefault();
                                    updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Female", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   CustomBaseName1 = r["CB1"].ToString(),
                                                   CustomBaseName2 = r["CB2"].ToString(),
                                                   CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                                   CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                                   CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                                   CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                               }).FirstOrDefault();
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_gender").FirstOrDefault();
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "male_connector_bottom", selectionList[0].SelectedColorCode, "Solid");
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage1)) metricPercentage1 = 0.0;
                                    point3 = metricPercentage1 * 100;
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "female_value").FirstOrDefault()).TextFrame.Text = metricPercentage1 == 0.0 ? "0.0" : Convert.ToDouble(metricPercentage1 * 100).ToString("#0.0") + "%";

                                    tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_gender").FirstOrDefault()).Shapes.Where(x => x.Name == "Gender_Female").FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage1)) metricPercentage1 = 0.0;
                                    updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);
                                    //Donut Chart
                                    updateDonutfourPoints(tempChart, point1, point2 + point3, point2, point3, 2, selectionList[0].DefaultColorsList);
                                    //
                                    #endregion
                                    break;
                                case "age":
                                    #region Age Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_age").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    var query = result
                                        .AsEnumerable()
                                        .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Age", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_age_table", "MetricName", 0, -1, 3, 4);
                                    #endregion
                                    break;
                                case "ethnicity":
                                    #region Ethnicity Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_ethnicity").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    query = result
                                        .AsEnumerable()
                                        .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Ethnicity", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_ethnicity_table", "MetricName", 0, -1, 3, 4);
                                    #endregion
                                    break;

                                case "hh_size":
                                    #region HH Size Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_hh_size").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("HouseHold Size", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   CustomBaseName1 = r["CB1"].ToString(),
                                                   CustomBaseName2 = r["CB2"].ToString(),
                                                   CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                                   CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                                   CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                                   CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])

                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage).ToString("0.00");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                                    #endregion
                                    break;
                                case "children_in_hh":
                                    #region Children in HH Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_children_in_hh").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Children in HH", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   CustomBaseName1 = r["CB1"].ToString(),
                                                   CustomBaseName2 = r["CB2"].ToString(),
                                                   CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                                   CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                                   CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                                   CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])

                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage).ToString("0.00");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                                    #endregion
                                    break;
                                case "parental_identification":
                                    #region Parental Identification Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_parental_identification").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Parent of child <18 in HH", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   CustomBaseName1 = r["CB1"].ToString(),
                                                   CustomBaseName2 = r["CB2"].ToString(),
                                                   CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                                   CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                                   CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                                   CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                                    tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "demographics_parental_identification")).Shapes.FirstOrDefault(x => x.Name == "chart");
                                    point1 = Convert.ToDouble((metricPercentage * 100).ToString("0.00"));
                                    point2 = (100 - point1);
                                    updateDonutTwoPointsWithLabel(tempChart, point1, point2, "", selectionList[0].SelectedColorCode);

                                    #endregion
                                    break;
                                case "marital_status":
                                    #region Marital Status Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_marital_status").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    query = result
                                     .AsEnumerable()
                                     .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Marital Status", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_marital_status_table", "MetricName", 0, -1, 2, 3);

                                    #endregion
                                    break;
                                case "hh_income":
                                    #region HH Income Widzet
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_hh_income").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Average HH Income", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   CustomBaseName1 = r["CB1"].ToString(),
                                                   CustomBaseName2 = r["CB2"].ToString(),
                                                   CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                                   CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                                   CB1Percnt = r["CB1Percentage"].ToString(),
                                                   CB2Percnt = r["CB2Percentage"].ToString(),
                                                   CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                                   CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    //((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = "$" + Math.Round(Convert.ToDouble(metricPercentage))+ " k";
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = "$" + Convert.ToDouble(metricPercentage).ToString("0.00") + " k";
                                    if (!double.TryParse(tempRow.CB1Percnt, out metricPercentage)) metricPercentage = 0.0;
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase1_value").FirstOrDefault()).TextFrame.Text = "$" + Convert.ToDouble(metricPercentage).ToString("0.00") + " k";
                                    if (!double.TryParse(tempRow.CB2Percnt, out metricPercentage)) metricPercentage = 0.0;
                                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase2_value").FirstOrDefault()).TextFrame.Text = "$" + Convert.ToDouble(metricPercentage).ToString("0.00") + " k";
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    query = result
                                     .AsEnumerable()
                                     .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("HH income", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    for (int i = tbl.Rows.Count - 1; i >= 0; i--)
                                    {
                                        DataRow dr = tbl.Rows[i];
                                        if (dr["MetricName"].ToString() == "Average HH Income")
                                            dr.Delete();
                                    }
                                    tbl.AcceptChanges();
                                    updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_hh_income_table", "MetricName", 0, -1, 3, 4);

                                    #endregion
                                    break;
                                case "employement_status":
                                    #region Employee Status
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_employement_status").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    query = result
                                     .AsEnumerable()
                                     .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Employement Status", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_employement_status_table", "MetricName", 0, -1, 3, 4);
                                    #endregion
                                    break;
                                case "education":
                                    #region Education
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_education").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    query = result
                                     .AsEnumerable()
                                     .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Education", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_education_table", "MetricName", 0, 1, 2, 3);
                                    #endregion
                                    break;
                                case "socio_economic":
                                    #region Socio Economic
                                    tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "demographics_socio_economic").FirstOrDefault();
                                    updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                    updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                    IConnector textShape;
                                    textShape = (IConnector)tempGroup.Shapes.Where(x => x.Name == "header_color1").FirstOrDefault();
                                    textShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].SelectedColorCode);
                                    updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    query = result
                                     .AsEnumerable()
                                     .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Socio Economic", StringComparison.OrdinalIgnoreCase));

                                    tbl = query.CopyToDataTable();
                                    //donut chart of socio economic
                                    tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "demographics_socio_economic")).Shapes.FirstOrDefault(x => x.Name == "chart");

                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Single Low Income", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    point1 = metricPercentage;

                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Strugglers", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    point2 = metricPercentage;
                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Middle Class", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    point3 = metricPercentage;

                                    tempRow = (from r in result.AsEnumerable()
                                               where Convert.ToString(r.Field<object>("MetricName")).Equals("Affluent", StringComparison.OrdinalIgnoreCase)
                                               select new
                                               {
                                                   MetricPercentage = r["MetricPercentage"].ToString(),
                                               }).FirstOrDefault();
                                    if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                    point4 = metricPercentage;
                                    //point1 = result.AsEnumerable().Where(x => x.Field<string>("MetricName") == "Single Low Income").FirstOrDefault().Field<double>("MetricPercentage");
                                    //point2 = result.AsEnumerable().Where(x => x.Field<string>("MetricName") == "Strugglers").FirstOrDefault().Field<double>("MetricPercentage");
                                    //point3 = result.AsEnumerable().Where(x => x.Field<string>("MetricName") == "Middle Class").FirstOrDefault().Field<double>("MetricPercentage");
                                    //point4 = result.AsEnumerable().Where(x => x.Field<string>("MetricName") == "Affluent").FirstOrDefault().Field<double>("MetricPercentage");
                                    if (!string.IsNullOrEmpty(Convert.ToString(point1)))
                                        point1 = Convert.ToDouble((point1).ToString("0.000"));
                                    if (!string.IsNullOrEmpty(Convert.ToString(point2)))
                                        point2 = Convert.ToDouble((point2).ToString("0.000"));
                                    if (!string.IsNullOrEmpty(Convert.ToString(point3)))
                                        point3 = Convert.ToDouble((point3).ToString("0.000"));
                                    if (!string.IsNullOrEmpty(Convert.ToString(point4)))
                                        point4 = Convert.ToDouble((point4).ToString("0.000"));
                                    updateDonutfourPoints(tempChart, point1, point2, point3, point4, 0, selectionList[0].DefaultColorsList);
                                    //
                                    updateSARportIndexTable(cur_Slide, tbl, "demographics_socio_economic_table", "MetricName", 0, 1, 2, 3);
                                    #endregion
                                    break;
                            }
                        }
                        imageReplace((PictureFrame)pres.Slides[2].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        foreach (var demog in selectionList[0].DemogFixedList)
                        {
                            if (selectionList[0].DemogActiveList.IndexOf(demog.ToString()) == -1)
                            {
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "demographics_" + demog.ToString()).FirstOrDefault());
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "demographics_" + demog.ToString() + "_table").FirstOrDefault());
                            }
                        }
                        #region set Table Position
                        for (int i = 0; i < selectionList[0].DemogActiveList.Count; i++)
                        {
                            switch (i)
                            {
                                case 1:
                                    if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)302.85;
                                    else
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)328.85;
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].DemogActiveList[i]);
                                    break;
                                case 2:
                                    if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)605.85;
                                    else
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)645.85;

                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].DemogActiveList[i]);
                                    break;
                                case 3:
                                    if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)-30.10;
                                    else
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)10.10;

                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().Y = (float)281.85;
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].DemogActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().Y = (float)getDynamicTablePositionY(i, selectionList[0].DemogActiveList[i]);

                                    break;
                                case 4:
                                    if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)302.85;
                                    else
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)328.85;

                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().Y = (float)281.85;
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].DemogActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().Y = (float)getDynamicTablePositionY(i, selectionList[0].DemogActiveList[i]);
                                    break;
                                case 5:
                                    if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)605.85;
                                    else
                                        cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)638.85;

                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i]).FirstOrDefault().Y = (float)281.85;
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].DemogActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == "demographics_" + selectionList[0].DemogActiveList[i] + "_table").FirstOrDefault().Y = (float)getDynamicTablePositionY(i, selectionList[0].DemogActiveList[i]);
                                    break;
                            }
                        }
                        #endregion

                        #endregion
                    }
                    catch (Exception e)
                    {
                        //Log.LogMessage(e +  " slide 5");
                    }
                    break;
                case 6:
                    try
                    {
                        #region Slide 6

                        cur_Slide = pres.Slides[5];
                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion

                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update

                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[2].Text = selectionList[0].EstablishmentName;
                        DataTable filtered = result.AsEnumerable().Where(r => r.Field<string>("MetricParentName") == "Highly Engaged Consumers").CopyToDataTable();

                        //Ultra HECs
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "hec_ultra").FirstOrDefault();
                        tempRow = (from r in result.AsEnumerable()
                                   where Convert.ToString(r.Field<object>("MetricName")).Equals("Ultra HECs", StringComparison.OrdinalIgnoreCase)
                                   select new
                                   {
                                       CustomBaseName1 = r["CB1"].ToString(),
                                       CustomBaseName2 = r["CB2"].ToString(),
                                       CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                       CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                       MetricPercentage = r["MetricPercentage"].ToString(),
                                       CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                       CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                   }).FirstOrDefault();

                        if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                        point1 = metricPercentage;
                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                        updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                        //Core HECs
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "hec_core").FirstOrDefault();
                        tempRow = (from r in result.AsEnumerable()
                                   where Convert.ToString(r.Field<object>("MetricName")).Equals("Core HECs", StringComparison.OrdinalIgnoreCase)
                                   select new
                                   {
                                       CustomBaseName1 = r["CB1"].ToString(),
                                       CustomBaseName2 = r["CB2"].ToString(),
                                       CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                       CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                       MetricPercentage = r["MetricPercentage"].ToString(),
                                       CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                       CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                   }).FirstOrDefault();
                        if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                        point2 = metricPercentage;
                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                        updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                        //Aspirational HECs
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "hec_aspirational").FirstOrDefault();
                        tempRow = (from r in result.AsEnumerable()
                                   where Convert.ToString(r.Field<object>("MetricName")).Equals("Aspirational HECs", StringComparison.OrdinalIgnoreCase)
                                   select new
                                   {
                                       CustomBaseName1 = r["CB1"].ToString(),
                                       CustomBaseName2 = r["CB2"].ToString(),
                                       CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                       CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                       MetricPercentage = r["MetricPercentage"].ToString(),
                                       CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                       CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                   }).FirstOrDefault();
                        if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                        point3 = metricPercentage;
                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                        updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                        //Non-HEC
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "non_hec").FirstOrDefault();
                        tempRow = (from r in result.AsEnumerable()
                                   where Convert.ToString(r.Field<object>("MetricName")).Equals("Non-HEC", StringComparison.OrdinalIgnoreCase)
                                   select new
                                   {
                                       CustomBaseName1 = r["CB1"].ToString(),
                                       CustomBaseName2 = r["CB2"].ToString(),
                                       CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                       CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                       MetricPercentage = r["MetricPercentage"].ToString(),
                                       CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                       CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                   }).FirstOrDefault();
                        if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                        point4 = metricPercentage;
                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                        updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                        //Donut Chart Update 
                        tempChart = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == "hec_highEngagedConsumer_chart").FirstOrDefault();
                        //updateDonutfourPoints(tempChart, point1, point2, point3, point4, 0, selectionList[0].DefaultColorsList);
                        updateDonutfourPointsWithLabel(tempChart, filtered, 0, selectionList[0].DefaultColorsList);

                        //Health & Wellness Attributes Top 2 Box - Bar Chart Update                  
                        var query = result
                            .AsEnumerable()
                            .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Health and Wellness Attributes (Top 2 Box)", StringComparison.OrdinalIgnoreCase));

                        tbl = query.CopyToDataTable();
                        updateSARportBarChart(cur_Slide, tbl, "hec_health_wellness_top10_chart", "EstablishmentName", "MetricName", null, selectionList[0].SelectedColorCode);
                        updateSARportIndexTable(cur_Slide, tbl, "hec_health_wellness_top10_table", "MetricName", 0, -1, 3, 4);

                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "hec_top10_index").FirstOrDefault();
                        updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, "", "", tempRow.CB1Sig, tempRow.CB2Sig, false);
                        cur_Slide.Shapes.Where(x => x.Name == "hec_health_wellness_top10_table").FirstOrDefault().X = (float)487.0;
                        //cur_Slide.Shapes.Where(x => x.Name == "hec_health_wellness_top10_table").FirstOrDefault().Width = (float)150;

                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 2; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                            updateSARportHeaderConnectorColor(cur_Slide, "HECTopMetricConnector", selectionList[0].SelectedColorCode, "Solid");


                        }
                        catch (Exception e)
                        { }


                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 7:
                    try
                    {
                        #region Slide 7
                        cur_Slide = pres.Slides[6];
                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        // updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[2].Text = selectionList[0].EstablishmentName;

                        int metricCount = 0;
                        string deviceName = "device_", frequencyName = "frequency_";

                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Smartphone/Tablet ownership", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();

                        //Device Used
                        metricCount = 0;
                        foreach (string _device in metriclist)
                        {
                            metricCount++;
                            var tempDeviceName = deviceName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempDeviceName).FirstOrDefault();
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_device, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Smartphone/Tablet ownership", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (metricCount == 1)
                            {
                                ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "custombase1_text")).TextFrame.Text = "Index v " + tempRow.CustomBaseName1;
                                ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "custombase2_text")).TextFrame.Text = "Index v " + tempRow.CustomBaseName2;
                            }
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;

                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = tempRow.MetricName;
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                            tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "device_image").FirstOrDefault();
                            var imgLoc = "~/Images/SituationAssessmentReport/digital_page/" + removeBlankSpace(tempRow.MetricName) + ".png";
                            imgLoc = context.Server.MapPath(imgLoc);
                            using (Image img = Image.FromFile(imgLoc, true))
                            {
                                tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                            }
                        }

                        //Social Media Usage
                        var query = result
                            .AsEnumerable()
                            .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Social Media Usage", StringComparison.OrdinalIgnoreCase));

                        tbl = query.CopyToDataTable();
                        updateSARportIndexTable(cur_Slide, tbl, "social_media_usage_table", "MetricName", 1, 2, 3, 4);


                        //Use of Review Sites - Frequency
                        cur_Slide.Shapes.Where(x => x.Name == "social_media_usage_table").FirstOrDefault().X = (float)328.0;
                        metriclist = (from r in result.AsEnumerable()
                                      where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Use of review - Frequency", StringComparison.OrdinalIgnoreCase)
                                      select Convert.ToString(r["MetricName"])).ToList();

                        metricCount = 0;
                        foreach (string _frequency in metriclist)
                        {
                            metricCount++;
                            var tempfrequencyName = frequencyName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempfrequencyName).FirstOrDefault();
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_frequency, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Use of review - Frequency", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                            point1 = 1;
                            point2 = metricPercentage;
                            point3 = 1 - point2;
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                            updateDonutThreePoints(tempChart, point1, point2, point3, 1, selectionList[0].SelectedColorCode);
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = tempRow.MetricName;
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);
                        }

                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 3; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                        }
                        catch (Exception e)
                        { }


                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 8:
                    try
                    {
                        #region Slide 8

                        cur_Slide = pres.Slides[7];

                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;
                        string dinerName = "diner_";
                        var dinerPositions = new List<Tuple<float, float, string>>();

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[2].Text = selectionList[0].EstablishmentName + " - ";


                        var metriclist = (from r in result.AsEnumerable() select Convert.ToString(r["MetricName"])).ToList();

                        foreach (string _diner in metriclist)
                        {
                            metricCount++;
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == _diner).FirstOrDefault();
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "headerImage_chart").FirstOrDefault();
                            updateHeaderImageChart(tempChart, selectionList[0].SelectedColorCode);
                            dinerPositions.Add(new Tuple<float, float, string>(tempGroup.X, tempGroup.Y, tempGroup.Shapes.Where(x => x.Name.Contains("image_")).FirstOrDefault().Name));
                        }
                        dinerPositions.Sort((x, y) =>
                        {
                            int flag = x.Item3.CompareTo(y.Item3);
                            return flag;
                        });

                        //Diner Segments
                        metricCount = 0;
                        foreach (string _diner in metriclist)
                        {
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == _diner).FirstOrDefault();
                            tempGroup.X = dinerPositions[metricCount].Item1;
                            tempGroup.Y = dinerPositions[metricCount].Item2;
                            metricCount++;
                            var tempDinerName = dinerName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempDinerName).FirstOrDefault();
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_diner, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Diner Segments", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                            point1 = metricPercentage;
                            point2 = 1 - point1;
                            ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == tempDinerName + "_header").FirstOrDefault()).TextFrame.Text = tempRow.MetricName.ToUpper();
                            tempChart = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == tempDinerName + "_chart").FirstOrDefault();
                            ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == tempDinerName + "_chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, tempRow.MetricName, selectionList[0].SelectedColorCode);
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                            //color change for headers
                            try
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage1").FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_1", selectionList[0].SelectedColorCode, "Gradient");
                            }
                            catch (Exception e)
                            { }
                        }

                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 9:
                    try
                    {
                        #region Slide 9

                        cur_Slide = pres.Slides[8];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[2].Text = selectionList[0].EstablishmentName + " - ";


                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;
                        string dinerName = "diner_";

                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Diner Segments", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();

                        metricCount = 0;
                        foreach (string _diner in metriclist)
                        {
                            int subMetricCount;
                            metricCount++;
                            var tempDinerName = dinerName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempDinerName).FirstOrDefault();
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_diner, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Diner Segments", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           GroupName = r["GroupName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                            point1 = metricPercentage;
                            point2 = 1 - point1;
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = tempRow.MetricName.ToUpper();
                            tempChart = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == tempDinerName + "_chart").FirstOrDefault();
                            ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == tempDinerName + "_chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, tempRow.MetricName, selectionList[0].SelectedColorCode);
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + metricCount.ToString()).FirstOrDefault();
                            tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault();
                            var imgLoc = "~/Images/SituationAssessmentReport/diner_segments/" + removeBlankSpace(tempRow.MetricName) + ".png";
                            imgLoc = context.Server.MapPath(imgLoc);
                            using (Image img = Image.FromFile(imgLoc, true))
                            {
                                tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                            }

                            var subMetricList = (from r in result.AsEnumerable()
                                                 where Convert.ToString(r.Field<object>("GroupName")).Equals(_diner, StringComparison.OrdinalIgnoreCase)
                                                 select Convert.ToString(r["MetricName"])).ToList();
                            subMetricCount = 0;
                            var AttrName = "_AttTop2_";
                            foreach (string subMetric in subMetricList)
                            {
                                subMetricCount++;
                                var tempAttrName = tempDinerName + AttrName + subMetricCount.ToString();
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempAttrName).FirstOrDefault();
                                tempRow = (from r in result.AsEnumerable()
                                           where Convert.ToString(r.Field<object>("MetricName")).Equals(subMetric, StringComparison.OrdinalIgnoreCase)
                                                 && Convert.ToString(r.Field<object>("GroupName")).Equals(_diner, StringComparison.OrdinalIgnoreCase)
                                           select new
                                           {
                                               CustomBaseName1 = r["CB1"].ToString(),
                                               CustomBaseName2 = r["CB2"].ToString(),
                                               CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                               CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                               MetricPercentage = r["MetricPercentage"].ToString(),
                                               MetricName = r["MetricName"].ToString(),
                                               CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                               CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                           }).FirstOrDefault();
                                if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(tempRow.MetricName);
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                                updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, false);

                                updateSingleIndexChart(tempGroup, "index1_chart", tempRow.CustomBaseIndex1, tempRow.CB1Sig, false);
                                updateSingleIndexChart(tempGroup, "index2_chart", tempRow.CustomBaseIndex2, tempRow.CB2Sig, false);

                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == tempAttrName + "_cb_sig1").FirstOrDefault()).TextFrame.Text = Convert.ToString(tempRow.CustomBaseIndex1);
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == tempAttrName + "_cb_sig1").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == tempAttrName + "_cb_sig1").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(tempRow.CB1Sig);

                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == tempAttrName + "_cb_sig2").FirstOrDefault()).TextFrame.Text = Convert.ToString(tempRow.CustomBaseIndex2);
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == tempAttrName + "_cb_sig2").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == tempAttrName + "_cb_sig2").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(tempRow.CB2Sig);

                                updateSARportHeaderConnectorColor(cur_Slide, tempAttrName + "_header_connector", selectionList[0].SelectedColorCode, "Gradient");

                                tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image_Top2").FirstOrDefault();
                                imgLoc = "~/Images/SituationAssessmentReport/attitudinal_statements/" + removeBlankSpace(tempRow.MetricName) + ".png";
                                imgLoc = context.Server.MapPath(imgLoc);
                                using (Image img = Image.FromFile(imgLoc, true))
                                {
                                    tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                                }
                            }
                        }
                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 3; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                        }
                        catch (Exception e)
                        { }
                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 10:
                    try
                    {
                        #region Slide 10

                        cur_Slide = pres.Slides[9];

                        var point = new double[] { 0.0, 0.0, 0.0, 0.0 };
                        int densityCount = 0, divisionCount = 0;
                        string densityName = "density_";
                        string divisionName = "division_";

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        var metriclist = (from r in result.AsEnumerable() select Convert.ToString(r["MetricName"])).ToList();
                        DataTable filtered = result.AsEnumerable().Where(r => r.Field<string>("MetricParentName") == "Density").CopyToDataTable();
                        //Density
                        densityCount = 0; divisionCount = 0;
                        foreach (string _metric in metriclist)
                        {
                            var tempName = "";
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_metric, StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           MetricParentName = r["MetricParentName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;

                            if (tempRow.MetricParentName.Equals("Density", StringComparison.OrdinalIgnoreCase))
                            {
                                densityCount++;
                                tempName = densityName + densityCount.ToString();
                                point[densityCount - 1] = metricPercentage;
                            }
                            else
                            {
                                divisionCount++;
                                tempName = divisionName + divisionCount.ToString();
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name.Equals(tempRow.MetricName, StringComparison.OrdinalIgnoreCase)).FirstOrDefault();
                                tempGroup.FillFormat.FillType = FillType.Solid;
                                tempGroup.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].DefaultColorsList[divisionCount - 1]);
                            }
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempName).FirstOrDefault();

                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = tempRow.MetricName;
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                        }
                        tempChart = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == densityName + "chart").FirstOrDefault();
                        //updateDonutfourPoints(tempChart, point[0], point[1], point[2], point[3], 0, selectionList[0].DefaultColorsList);
                        updateDonutfourPointsWithLabel(tempChart, filtered, 0, selectionList[0].DefaultColorsList);


                        //color change for headers
                        try
                        {
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage1").FirstOrDefault();
                            updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                            updateSARportHeaderConnectorColor(cur_Slide, "header_connector_1", selectionList[0].SelectedColorCode, "Gradient");

                            updateSARportHeaderConnectorColor(cur_Slide, "DensityTopMetricConnector", selectionList[0].SelectedColorCode, "Solid");
                            updateSARportHeaderConnectorColor(cur_Slide, "DivisionTopMetricConnector", selectionList[0].SelectedColorCode, "Solid");

                            updateSARportHeaderConnectorColor(cur_Slide, "DensityLeftConnector", selectionList[0].SelectedColorCode, "Solid");
                            updateSARportHeaderConnectorColor(cur_Slide, "DivisionLeftConnector", selectionList[0].SelectedColorCode, "Solid");
                        }
                        catch (Exception e)
                        { }

                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 11:
                    try
                    {
                        #region Slide 11

                        cur_Slide = pres.Slides[10];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[3].Text = selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " visits to channels ";


                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;
                        string crossDinerName = "crossDiner_";

                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Cross Dining (Channel)", StringComparison.OrdinalIgnoreCase)
                                          && Convert.ToString(r.Field<object>("GroupName")).Equals(string.Empty)
                                          select Convert.ToString(r["MetricName"])).ToList();

                        metricCount = 0;
                        var subMetricGroupName = "_sub_";
                        var tempsubMetricGroupName = ""; var tempcrossDinerName = "";
                        int subMetricCount = 0;
                        foreach (string _crossDiner in metriclist)
                        {
                            metricCount++;
                            tempcrossDinerName = crossDinerName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempcrossDinerName).FirstOrDefault();
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_crossDiner, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Cross Dining (Channel)", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           GroupName = r["GroupName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();

                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;

                            point1 = metricPercentage;
                            point2 = 1 - point1;
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = tempRow.MetricName.ToUpper();
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            //((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = (tempRow.MetricPercentage=="" || tempRow.MetricPercentage== null) ? "NA": Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, tempRow.MetricName, selectionList[0].SelectedColorCode);
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                            //Image change
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + metricCount.ToString()).FirstOrDefault();
                            tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault();
                            var imgLoc = "~/Images/SituationAssessmentReport/cross_dining_channel_fill_images/" + removeBlankSpace(tempRow.MetricName) + ".png";
                            imgLoc = context.Server.MapPath(imgLoc);
                            using (Image img = Image.FromFile(imgLoc, true))
                            {
                                tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                            }

                            var subMetricList = (from r in result.AsEnumerable()
                                                 where Convert.ToString(r.Field<object>("GroupName")).Equals(_crossDiner, StringComparison.OrdinalIgnoreCase)
                                                 select Convert.ToString(r["MetricName"])).ToList();
                            subMetricCount = 0;
                            subMetricGroupName = "_sub_";
                            tempsubMetricGroupName = "";
                            foreach (string subMetric in subMetricList)
                            {
                                subMetricCount++;
                                tempsubMetricGroupName = tempcrossDinerName + subMetricGroupName + subMetricCount.ToString();
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempsubMetricGroupName).FirstOrDefault();
                                tempRow = (from r in result.AsEnumerable()
                                           where Convert.ToString(r.Field<object>("MetricName")).Equals(subMetric, StringComparison.OrdinalIgnoreCase)
                                                 && Convert.ToString(r.Field<object>("GroupName")).Equals(_crossDiner, StringComparison.OrdinalIgnoreCase)
                                           select new
                                           {
                                               CustomBaseName1 = r["CB1"].ToString(),
                                               CustomBaseName2 = r["CB2"].ToString(),
                                               CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                               CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                               MetricPercentage = r["MetricPercentage"].ToString(),
                                               MetricName = r["MetricName"].ToString(),
                                               CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                               CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                           }).FirstOrDefault();
                                if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(tempRow.MetricName);
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                                updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                                tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "crossDiner_image").FirstOrDefault();
                                imgLoc = "~/Images/SituationAssessmentReport/cross_dining_channel/" + removeBlankSpace(tempRow.MetricName) + ".png";
                                imgLoc = context.Server.MapPath(imgLoc);
                                using (Image img = Image.FromFile(imgLoc, true))
                                {
                                    tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                                }
                            }
                            for (int i = 4; i >= 1 && subMetricCount < i; i--)
                            {
                                tempsubMetricGroupName = tempcrossDinerName + subMetricGroupName + i.ToString();
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempsubMetricGroupName).FirstOrDefault());
                                tempsubMetricGroupName = tempcrossDinerName + subMetricGroupName + subMetricCount.ToString();
                            }
                        }

                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 5; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }

                            subMetricCount = 1;
                            metricCount++;
                            var shadow = "crossDiner_shadow_";
                            var topbx = "crossDiner_Topbx_"; var headerbx = "header_colouredImage";
                            var shadowtopbx = "crossDiner_shadowtop_";
                            var connectr = "header_connector_";
                            for (int j = metricCount; j <= 5; j++)
                            {
                                for (int i = 4; i >= 1 && subMetricCount <= i; i--)
                                {
                                    tempsubMetricGroupName = crossDinerName + j + subMetricGroupName + i.ToString();
                                    cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempsubMetricGroupName).FirstOrDefault());
                                }
                                tempcrossDinerName = crossDinerName + j.ToString();
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempcrossDinerName).FirstOrDefault());
                                tempcrossDinerName = topbx + j.ToString();
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempcrossDinerName).FirstOrDefault());
                                tempcrossDinerName = headerbx + j.ToString();
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempcrossDinerName).FirstOrDefault());
                                tempcrossDinerName = shadowtopbx + j.ToString();
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempcrossDinerName).FirstOrDefault());
                                tempsubMetricGroupName = shadow + (j - 1).ToString();
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempsubMetricGroupName).FirstOrDefault());

                                IConnector connectorShape;
                                tempcrossDinerName = connectr + j.ToString();
                                connectorShape = (IConnector)cur_Slide.Shapes.Where(x => x.Name == tempcrossDinerName).FirstOrDefault();
                                connectorShape.LineFormat.FillFormat.FillType = FillType.NoFill;
                            }
                        }
                        catch (Exception e)
                        { }
                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 12:
                    try
                    {
                        #region Slide 12

                        cur_Slide = pres.Slides[11];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //header update
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[3].Text = selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " visits to channels ";

                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;
                        string visitRestaurantName = "visit_otherRestaurant_";

                        //visits to other restaurants (AcrossEstablishments)
                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Cross Dining (Across Establishments)", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _restaurant in metriclist)
                        {
                            metricCount++;
                            var tempVisitRestaurantName = visitRestaurantName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempVisitRestaurantName).FirstOrDefault();
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_restaurant, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Cross Dining (Across Establishments)", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                            point1 = metricPercentage;
                            point2 = 1 - point1;
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, _restaurant, selectionList[0].SelectedColorCode);
                            var imgLoc = "~/Images/P2PDashboardEsthmtImages/" + tempRow.MetricName.Replace("/", "") + ".svg";
                            imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault(), imgLoc, context, slideId, -2, subPath);
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);
                        }
                        int removeleftover = metricCount + 1;
                        for (int i = removeleftover; i < 13; i++)
                        {
                            cur_Slide.Shapes.Remove((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "visit_otherRestaurant_" + i).FirstOrDefault());
                        }
                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 2; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                        }
                        catch (Exception e)
                        { }

                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 13:
                    try
                    {
                        #region Slide 13

                        cur_Slide = pres.Slides[12];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[3].Text = selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " visits to other restaurants ";

                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;
                        string visitRestaurantName = "visit_otherRestaurant_";

                        //visits to other restaurants (Competitors)
                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Cross Dining (Competitors)", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = metriclist.Count;
                        //float minX = cur_Slide.Shapes.Where(x => x.Name == "visit_otherRestaurant_" + (metricCount / 2).ToString()).FirstOrDefault().X;
                        //float maxX = cur_Slide.Shapes.Where(x => x.Name == "visit_otherRestaurant_6").FirstOrDefault().X;
                        for (int i = 0; i < metricCount; i++)
                        {
                            //if (metricCount < 12 && (metricCount / 2) < i + 1)
                            //{
                            //    j = 6 + k;
                            //    if (12 - metricCount - (k * 2) >= 0)
                            //    {
                            //        cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "visit_otherRestaurant_" + (7 - k).ToString()).FirstOrDefault());
                            //        cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == "visit_otherRestaurant_" + (13 - k).ToString()).FirstOrDefault());
                            //    }
                            //    k++;
                            //}
                            //else
                            //{
                            //    j = i + 1;
                            //}
                            var _restaurant = metriclist[i];
                            var tempVisitRestaurantName = visitRestaurantName + (i + 1).ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempVisitRestaurantName).FirstOrDefault();
                            //if (metricCount < 12)
                            //{
                            //    tempGroup.X += ((i) % (metricCount / 2) + 1) * (maxX - minX - (tempGroup.Width * (((float)(6 / 5)) * (6 - (metricCount / 2)) / (metricCount / 2)))) / (metricCount / 2);
                            //}
                            tempRow = (from r in result.AsEnumerable()
                                       where Convert.ToString(r.Field<object>("MetricName")).Equals(_restaurant, StringComparison.OrdinalIgnoreCase)
                                             && Convert.ToString(r.Field<object>("MetricParentName")).Equals("Cross Dining (Competitors)", StringComparison.OrdinalIgnoreCase)
                                       select new
                                       {
                                           CustomBaseName1 = r["CB1"].ToString(),
                                           CustomBaseName2 = r["CB2"].ToString(),
                                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : r["CB1Index"].ToString(),
                                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : r["CB2Index"].ToString(),
                                           MetricPercentage = r["MetricPercentage"].ToString(),
                                           MetricName = r["MetricName"].ToString(),
                                           CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                           CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                       }).FirstOrDefault();
                            if (!double.TryParse(tempRow.MetricPercentage, out metricPercentage)) metricPercentage = 0.0;
                            point1 = metricPercentage;
                            point2 = 1 - point1;
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, _restaurant, selectionList[0].SelectedColorCode);

                            var imgLoc = "~/Images/P2PDashboardEsthmtImages/" + tempRow.MetricName.Replace("/", "") + ".svg";
                            imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault(), imgLoc, context, slideId, -2, subPath);
                            updateCompetitorsTextAndValue(tempGroup, tempRow.CustomBaseName1, tempRow.CustomBaseName2, tempRow.CustomBaseIndex1, tempRow.CustomBaseIndex2, tempRow.CB1Sig, tempRow.CB2Sig, true);

                        }
                        for (int i = 12; i >= 1 && metricCount < i; i--)
                        {
                            var tempVisitRestaurantName = visitRestaurantName + i.ToString();
                            cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == tempVisitRestaurantName).FirstOrDefault());
                        }
                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 1; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                        }
                        catch (Exception e)
                        { }


                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 14:
                    try
                    {

                        #region Slide 14

                        cur_Slide = pres.Slides[13];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – Establishment In Trade Area"; //+ " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Text.Replace("_retailer", selectionList[0].EstablishmentName);
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "EstName")).TextFrame.Text = selectedEstName;
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "footer_comptitr")).TextFrame.Text = "Competitors: " + selectionList[0].Competitors;
                        var query = result
                        .AsEnumerable()
                        .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Establishment Frequency", StringComparison.OrdinalIgnoreCase));

                        tbl = query.CopyToDataTable();
                        //updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                        UpdatePyramidSeriesDataSAR(tbl, 0, 0, 4, selectionList[0].SelectedColorCode);
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "pyramidcurved").FirstOrDefault();
                        updatePyamidCurveColor(tempGroup, selectionList[0].SelectedColorCode);
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                        updatePyramidGap(cur_Slide, tbl);
                        #endregion

                    }
                    catch (Exception e)
                    { }
                    break;
                case 15:
                    try
                    {
                        #region Slide 15

                        cur_Slide = pres.Slides[14];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "footer_comptitr")).TextFrame.Text = "Competitors: " + selectionList[0].Competitors;

                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[3].Text = " Share of Guest & Trip Contribution to " + selectionList[0].EstablishmentName;
                        //updateBarChartTwo(cur_Slide, result, selectionList[0].SelectedColorCode);
                        updateStackChart(cur_Slide, result, selectionList[0].SelectedColorCode);

                        ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "EstName").FirstOrDefault()).TextFrame.Text = selectedEstName;
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "bottom_guestcolorbox")).FillFormat.FillType = FillType.Solid;
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "bottom_guestcolorbox")).FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].SelectedColorCode);
                        //update header colors
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage1").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");

                        #endregion
                    }
                    catch (Exception e)
                    { }
                    break;
                case 17:
                    try
                    {
                        #region Slide 17
                        cur_Slide = pres.Slides[16];

                        dynamic metriclistTble = null; int metricCount = 0;
                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - frequencyIdIndex].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - frequencyIdIndex] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        for (int z = 0; z < selectionList[0].TripsActiveList.Count; z++)
                        {
                            switch (selectionList[0].TripsActiveList[z].ToString())
                            {
                                case "day_of_week":
                                    #region day of week Widzet
                                    {
                                        #region Donut Chart
                                        point1 = 50; point2 = 50;
                                        tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "day_of_week")).Shapes.FirstOrDefault(x => x.Name == "chart");
                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "weekend")), (new Tuple<string, string>("MetricParentName", "Day of week")) });
                                        point3 = Convert.ToDouble(sDataRow.MetricPercentage * 100);
                                        #endregion Donut Chart

                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "day_of_week").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "weekend_connector_bottom", selectionList[0].SelectedColorCode, "Solid");
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "weekend_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";

                                        tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "day_of_week").FirstOrDefault()).Shapes.Where(x => x.Name == "weekend").FirstOrDefault();
                                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);

                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "weekday")), (new Tuple<string, string>("MetricParentName", "Day of week")) });
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "day_of_week").FirstOrDefault();
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        point4 = twoDecimals(sDataRow.MetricPercentage);
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "weekday_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";

                                        tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "day_of_week").FirstOrDefault()).Shapes.Where(x => x.Name == "weekday").FirstOrDefault();
                                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);

                                        //Donut Chart
                                        updateDonutfourPoints(tempChart, point1, point2, point3, point4, 2, selectionList[0].DefaultColorsList);
                                        //
                                    }
                                    #endregion
                                    break;
                                case "location_prior":
                                    #region location prior Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "location_prior").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                  .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Location Prior", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportIndexTable(cur_Slide, tbl, "location_prior_table", "MetricName", 0, -1, 2, 3);
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    }
                                    #endregion
                                    break;
                                case "trip_purpose":
                                    #region trip purpose
                                    {
                                        #region Donut Chart

                                        tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "trip_purpose")).Shapes.FirstOrDefault(x => x.Name == "chart");
                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Primarily to Visit the restraunt")), (new Tuple<string, string>("MetricParentName", "Trip Purpose")) });
                                        point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                                        #endregion Donut Chart

                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_purpose").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "visit_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_color1", selectionList[0].SelectedColorCode, "Solid");
                                        tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_purpose").FirstOrDefault()).Shapes.Where(x => x.Name == "visit_purpose").FirstOrDefault();
                                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);

                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Part of a larger trip")), (new Tuple<string, string>("MetricParentName", "Trip Purpose")) });
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_purpose").FirstOrDefault();
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        point2 = Convert.ToDouble(sDataRow.MetricPercentage);

                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "trip_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";

                                        tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_purpose").FirstOrDefault()).Shapes.Where(x => x.Name == "larger_trip").FirstOrDefault();
                                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                        //Donut Chart
                                        updateDonutTwoPointsWithLabel(tempChart, point1, point2, "", selectionList[0].SelectedColorCode);
                                        //

                                    }
                                    #endregion
                                    break;
                                case "considered_another_establishment":
                                    #region considered another establishment Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "considered_another_establishment").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");

                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "I Considered Another Establishment")), (new Tuple<string, string>("MetricParentName", "Considered Another Establishment")) });
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                                        tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "considered_another_establishment").FirstOrDefault()).Shapes.Where(x => x.Name == "another_estmt").FirstOrDefault();

                                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                        tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "considered_another_establishment")).Shapes.FirstOrDefault(x => x.Name == "chart");
                                        point1 = twoDecimals(sDataRow.MetricPercentage);
                                        point2 = (100 - point1);
                                        updateDonutTwoPointsWithLabel(tempChart, point1, point2, "", selectionList[0].SelectedColorCode);
                                    }
                                    #endregion
                                    break;
                                case "other_places_considered":
                                    #region other places 
                                    {

                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "other_places_considered").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                   .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Other Places Considered", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                        metricCount = 0;
                                        metriclistTble = (from r in result.AsEnumerable()
                                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Other Places Considered", StringComparison.OrdinalIgnoreCase)
                                                          select Convert.ToString(r["MetricName"])).ToList();
                                        foreach (var _metric in metriclistTble)
                                        {
                                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Other Places Considered")) });
                                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "other_places_considered").FirstOrDefault();
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "legend_" + metricCount).FirstOrDefault()).TextFrame.Text = _metric;
                                            if (metricCount == 0)
                                            {
                                                tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "other_places_considered").FirstOrDefault()).Shapes.Where(x => x.Name == "other_places_1").FirstOrDefault();
                                                updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                            }
                                            else
                                            {
                                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase1_value").FirstOrDefault()).TextFrame.Text = sDataRow.CustomBaseIndex1.ToString();
                                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase2_value").FirstOrDefault()).TextFrame.Text = sDataRow.CustomBaseIndex2.ToString();
                                            }

                                            metricCount++;
                                        }

                                    }
                                    #endregion
                                    break;
                                case "planning_type":
                                    #region planning type
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "planning_type").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        metriclistTble = (from r in result.AsEnumerable()
                                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Planning Type", StringComparison.OrdinalIgnoreCase)
                                                          select Convert.ToString(r["MetricName"])).ToList();
                                        metricCount = 0;
                                        foreach (var _metric in metriclistTble)
                                        {
                                            var tempAttrName = "chart" + metricCount.ToString();
                                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Planning Type")) });
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value_" + metricCount + "_0").FirstOrDefault()).TextFrame.Text = sDataRow.CustomBaseIndex1.ToString();
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value_" + metricCount + "_1").FirstOrDefault()).TextFrame.Text = sDataRow.CustomBaseIndex2.ToString();

                                            point1 = twoDecimals(sDataRow.MetricPercentage);
                                            metricCount++;
                                            updateSingleBarChart(tempGroup, tempAttrName, point1, Convert.ToDouble(sDataRow.Significance1), true, selectionList[0].SelectedColorCode);
                                        }
                                        //sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "The decision was made well ahead of time")), (new Tuple<string, string>("MetricParentName", "Planning Type")) });
                                        //point2 = Convert.ToDouble(sDataRow.MetricPercentage);
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    }
                                    #endregion
                                    break;
                                case "decision_location":
                                    #region decision location activities
                                    {
                                        metricCount = 0;

                                        metriclistTble = (from r in result.AsEnumerable()
                                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Decision Location", StringComparison.OrdinalIgnoreCase)
                                                          select Convert.ToString(r["MetricName"])).ToList();
                                        foreach (var _metric in metriclistTble)
                                        {
                                            tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "decision_location")).Shapes.FirstOrDefault(x => x.Name == "chart" + metricCount);
                                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "decision_location").FirstOrDefault();

                                            updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                            updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Decision Location")) });
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "legend_" + metricCount).FirstOrDefault()).TextFrame.Text = _metric;
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart" + metricCount + "_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                                            tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "decision_location").FirstOrDefault()).Shapes.Where(x => x.Name == "custombasegrp_" + metricCount).FirstOrDefault();
                                            point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                                            point2 = 1 - point1;
                                            point3 = 1;

                                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                            metricCount++;
                                            //Donut Chart
                                            //updateDonutOnePointsWithLabel(tempChart, point1, _metric, selectionList[0].SelectedColorCode);
                                            updateDonutThreePointsWithLabel(tempChart, point1, point2, point3, 0, selectionList[0].SelectedColorCode, _metric);
                                            //
                                        }
                                    }
                                    #endregion
                                    break;
                                case "decision_made_with_time_left_before_arrival":
                                    #region main decision maker Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "decision_made_with_time_left_before_arrival").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        IConnector textShape;
                                        textShape = (IConnector)tempGroup.Shapes.Where(x => x.Name == "header_color1").FirstOrDefault();
                                        textShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].SelectedColorCode);

                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Average")), (new Tuple<string, string>("MetricParentName", "Decision Made with time left before arrival")) });
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase0_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage).ToString("0.00") + " Hour(s)";
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase1_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.CB1Percentage).ToString("0.00") + " Hour(s)";
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase2_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.CB2Percentage).ToString("0.00") + " Hour(s)";
                                    }
                                    #endregion
                                    break;
                                case "main_decision_maker":
                                    #region main decision maker Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "main_decision_maker").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                        var query = result
                                            .AsEnumerable()
                                            .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Main decision Maker", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                        updateSARportIndexTable(cur_Slide, tbl, "main_decision_maker_table", "MetricName", 0, -1, 2, 3);
                                    }
                                    #endregion
                                    break;
                                case "decision_makers":
                                    #region decision makers Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "decision_makers").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                   .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Decision Makers", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportIndexTable(cur_Slide, tbl, "decision_makers_table", "MetricName", 0, -1, 2, 3);
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    }
                                    #endregion
                                    break;
                                case "distance_travelled":
                                    #region distance travelled Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "distance_travelled").FirstOrDefault();
                                        IConnector textShape;
                                        textShape = (IConnector)tempGroup.Shapes.Where(x => x.Name == "header_color1").FirstOrDefault();
                                        textShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].SelectedColorCode);

                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Average")), (new Tuple<string, string>("MetricParentName", "Distance Travelled")) });
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase0_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage).ToString("0.00") + " Mile(S)";
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase1_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.CB1Percentage).ToString("0.00") + " Mile(s)";
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase2_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.CB2Percentage).ToString("0.00") + " Mile(s)";
                                    }
                                    #endregion
                                    break;
                                case "mode_of_transportation":
                                    #region decision makers Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "mode_of_transportation").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                   .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Mode of Transportation", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportIndexTable(cur_Slide, tbl, "mode_of_transportation_table", "MetricName", 0, -1, 2, 3);
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    }
                                    #endregion
                                    break;
                                case "mode_of_reservation":
                                    #region mode_of_reservation Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "mode_of_reservation").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                   .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Mode of reservation", StringComparison.OrdinalIgnoreCase));
                                        tbl = query.CopyToDataTable();
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);

                                        IConnector textShape;
                                        textShape = (IConnector)tempGroup.Shapes.Where(x => x.Name == "header_color1").FirstOrDefault();
                                        textShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].SelectedColorCode);

                                        metriclistTble = (from r in result.AsEnumerable()
                                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Mode of reservation", StringComparison.OrdinalIgnoreCase)
                                                          select Convert.ToString(r["MetricName"])).ToList();
                                        metricCount = 0;
                                        foreach (var _metric in metriclistTble)
                                        {
                                            tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "mode_of_reservation").FirstOrDefault()).Shapes.Where(x => x.Name == "grp_" + metricCount.ToString()).FirstOrDefault();
                                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Mode of reservation")) });
                                            updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                            metricCount++;
                                        }
                                    }
                                    #endregion
                                    break;
                                case "mode_of_doing_online_booking":
                                    #region mode_of_doing_online_booking Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "mode_of_doing_online_booking").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                   .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Mode of Doing online Booking", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);

                                        metricCount = 0;
                                        metriclistTble = (from r in result.AsEnumerable()
                                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Mode of Doing online Booking", StringComparison.OrdinalIgnoreCase)
                                                          select Convert.ToString(r["MetricName"])).ToList();
                                        foreach (var _metric in metriclistTble)
                                        {

                                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Mode of Doing online Booking")) });
                                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "mode_of_doing_online_booking").FirstOrDefault();
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "legend_" + metricCount).FirstOrDefault()).TextFrame.Text = _metric;
                                            if (metricCount == 0)
                                            {
                                                tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "mode_of_doing_online_booking").FirstOrDefault()).Shapes.Where(x => x.Name == "mode_0").FirstOrDefault();
                                                updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                            }
                                            else
                                            {
                                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase1_value").FirstOrDefault()).TextFrame.Text = sDataRow.CustomBaseIndex1.ToString();
                                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "custombase2_value").FirstOrDefault()).TextFrame.Text = sDataRow.CustomBaseIndex2.ToString();
                                            }


                                            metricCount++;
                                        }
                                    }
                                    #endregion
                                    break;
                                case "use_of_online_review_or_social_media_sites":
                                    #region use of online review
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "use_of_online_review_or_social_media_sites").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_color1", selectionList[0].SelectedColorCode, "Solid");
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Used Online Review or Social Media Sites for choosing Outlet")), (new Tuple<string, string>("MetricParentName", "Use of Online Review or Social Media Sites")) });
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";

                                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                        tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "use_of_online_review_or_social_media_sites")).Shapes.FirstOrDefault(x => x.Name == "chart");
                                        point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Did Not Use Online Review or Social Media Sites for choosing Outlet")), (new Tuple<string, string>("MetricParentName", "Use of Online Review or Social Media Sites")) });
                                        point2 = Convert.ToDouble(sDataRow.MetricPercentage);
                                        updateDonutTwoPointsWithTwoLabel(tempChart, point1, point2, "Used Online Review or Social Media Sites for choosing Outlet", "Did Not Use Online Review or Social Media Sites for choosing Outlet", selectionList[0].SelectedColorCode);
                                    }
                                    #endregion
                                    break;
                                case "online_review_or_social_media_sites":
                                    #region online_review_or_social_media_sites Widzet
                                    {
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "online_review_or_social_media_sites").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        var query = result.AsEnumerable()
                                                   .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Online Review or Social Media Sites", StringComparison.OrdinalIgnoreCase));

                                        tbl = query.CopyToDataTable();
                                        updateSARportIndexTable(cur_Slide, tbl, "online_review_or_social_media_sites_table", "MetricName", 0, -1, 2, 3);
                                        updateSARportBarChart(cur_Slide, tbl, "chart", "EstablishmentName", "MetricName", tempGroup, selectionList[0].SelectedColorCode);
                                        updateCompetitorsTextAndValue(tempGroup, custombase[0].ToString(), custombase[1].ToString(), "", "", 0.0, 0.0, false);
                                    }
                                    #endregion
                                    break;
                                case "trip_activities":
                                    #region trip activities
                                    {
                                        metricCount = 0;

                                        metriclistTble = (from r in result.AsEnumerable()
                                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Trip Activities", StringComparison.OrdinalIgnoreCase)
                                                          select Convert.ToString(r["MetricName"])).ToList();
                                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_activities").FirstOrDefault();
                                        updateSARportHeaderConnectorColorGrp(tempGroup, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                                        updateSARportHeaderColor(tempGroup, "header_chart", selectionList[0].SelectedColorCode, "header_color");
                                        foreach (var _metric in metriclistTble)
                                        {
                                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_activities").FirstOrDefault();
                                            tempChart = (Aspose.Slides.Charts.IChart)((IGroupShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "trip_activities")).Shapes.FirstOrDefault(x => x.Name == "chart" + metricCount);
                                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Trip Activities")) });
                                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart" + metricCount + "_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                                            tempGroup = (IGroupShape)((IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "trip_activities").FirstOrDefault()).Shapes.Where(x => x.Name == "group_" + metricCount).FirstOrDefault();
                                            point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                                            point2 = 1 - point1;
                                            point3 = 1;

                                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                            metricCount++;
                                            //Donut Chart
                                            updateDonutThreePointsWithLabel(tempChart, point1, point2, point3, 0, selectionList[0].SelectedColorCode, _metric);
                                            //
                                        }
                                    }
                                    #endregion

                                    break;
                            }
                        }

                        //imageReplace((PictureFrame)pres.Slides[2].Shapes.Where(x => x.Name == "SelectedEstablish_Img").FirstOrDefault(), loc, context, slideId, -2, subPath);

                        foreach (var trips in selectionList[0].TripsFixedList)
                        {
                            if (selectionList[0].TripsActiveList.IndexOf(trips.ToString()) == -1)
                            {
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == trips.ToString()).FirstOrDefault());
                                cur_Slide.Shapes.Remove(cur_Slide.Shapes.Where(x => x.Name == trips.ToString() + "_table").FirstOrDefault());
                            }
                        }

                        #region set Table Position
                        for (int i = 0; i < selectionList[0].TripsActiveList.Count; i++)
                        {
                            switch (i)
                            {
                                case 1:
                                    //if (selectionList[0].TripsActiveList[i].ToString() == "trip_purpose")
                                    //    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)275.85 getDynamicWidzetPositionX(i, selectionList[0].TripsActiveList[i]);
                                    //else
                                    //    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)328.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)getDynamicWidzetPositionX(i, selectionList[0].TripsActiveList[i]);

                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].TripsActiveList[i]);
                                    break;
                                case 2:
                                    //if (selectionList[0].TripsActiveList[i].ToString() == "trip_purpose")
                                    //    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)580.85;
                                    //else
                                    //    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)645.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)getDynamicWidzetPositionX(i, selectionList[0].TripsActiveList[i]);


                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].TripsActiveList[i]);
                                    break;
                                case 3:
                                    //if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                    //    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)-30.10;
                                    //else
                                    //cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)10.10;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)getDynamicWidzetPositionX(i, selectionList[0].TripsActiveList[i]);

                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().Y = (float)281.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].TripsActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().Y = (float)getDynamicTablePositionY(i, selectionList[0].TripsActiveList[i]);

                                    break;
                                case 4:
                                    //if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                    //    cur_Slide.Shapes.Where(x => x.Name ==selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)302.85;
                                    //else
                                    //cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)328.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)getDynamicWidzetPositionX(i, selectionList[0].TripsActiveList[i]);


                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().Y = (float)281.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].TripsActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().Y = (float)getDynamicTablePositionY(i, selectionList[0].TripsActiveList[i]);
                                    break;
                                case 5:
                                    //if (selectionList[0].DemogActiveList[i].ToString() == "parental_identification")
                                    //    cur_Slide.Shapes.Where(x => x.Name ==selectionList[0].DemogActiveList[i]).FirstOrDefault().X = (float)605.85;
                                    //else
                                    //cur_Slide.Shapes.Where(x => x.Name ==selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)638.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().X = (float)getDynamicWidzetPositionX(i, selectionList[0].TripsActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i]).FirstOrDefault().Y = (float)281.85;
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().X = (float)getDynamicTablePositionX(i, selectionList[0].TripsActiveList[i]);
                                    cur_Slide.Shapes.Where(x => x.Name == selectionList[0].TripsActiveList[i] + "_table").FirstOrDefault().Y = (float)getDynamicTablePositionY(i, selectionList[0].TripsActiveList[i]);
                                    break;
                            }
                        }
                        #endregion

                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 18:
                    try
                    {
                        #region Slide 18

                        cur_Slide = pres.Slides[17];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - 6].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - 6].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;

                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 4; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                            updateSARportHeaderConnectorColor(cur_Slide, "header_connector_5", selectionList[0].SelectedColorCode, "Gradient");
                        }
                        catch (Exception e)
                        { }

                        //Meal Type
                        string groupName = "mealType_";
                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Meal Type", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _metric in metriclist)
                        {
                            metricCount++;
                            var tempGroupName = groupName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Meal Type")) });
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                        }

                        //Visit Type - Detailed Nets
                        groupName = "occasionType_";
                        string _dyynamicParentName = "";
                        metriclist = (from r in result.AsEnumerable()
                                      where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Visit Type - Detailed Nets", StringComparison.OrdinalIgnoreCase)
                                      select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _metric in metriclist)
                        {
                            metricCount++;
                            var tempGroupName = groupName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Visit Type - Detailed Nets")) });
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                        }

                        //Day Part
                        var query = result
                                    .AsEnumerable()
                                    .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Day Part", StringComparison.OrdinalIgnoreCase));

                        tbl = query.CopyToDataTable();
                        updateSARportIndexTable(cur_Slide, tbl, "daypart_table", "MetricName", 1, 0, 2, 3);
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "daypart").FirstOrDefault();
                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, "", "", 0, 0, false);


                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Average check size per diner")), (new Tuple<string, string>("MetricParentName", "Average check size per diner")) });
                        var aspose_tbl = (AsposeSlide.ITable)cur_Slide.Shapes.Where(x => x.Name == "Average_table").FirstOrDefault();
                        aspose_tbl[0, 1].TextFrame.Text = sDataRow.EstablishmentName;
                        aspose_tbl[0, 2].TextFrame.Text = sDataRow.CustomBaseName1;
                        aspose_tbl[0, 3].TextFrame.Text = sDataRow.CustomBaseName2;
                        aspose_tbl[1, 1].TextFrame.Text = "$ " + Convert.ToDouble(sDataRow.MetricPercentage).ToString("#0.00");
                        aspose_tbl[1, 2].TextFrame.Text = "$ " + Convert.ToDouble(sDataRow.CB1Percentage).ToString("#0.00");
                        aspose_tbl[1, 3].TextFrame.Text = "$ " + Convert.ToDouble(sDataRow.CB2Percentage).ToString("#0.00");

                        //Service Mode
                        groupName = "serviceMode_";
                        metriclist = (from r in result.AsEnumerable()
                                      where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Service Mode", StringComparison.OrdinalIgnoreCase)
                                      select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _metric in metriclist)
                        {
                            metricCount++;
                            var tempGroupName = groupName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Service Mode")) });
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                        }

                        try
                        {
                            //Combo or Value Meal
                            groupName = "Combo_or_Value_Meal_";
                            metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Combo or Value Meal", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();
                            _dyynamicParentName = "Combo or Value Meal";
                            if (metriclist.Count == 0)
                            {
                                metriclist = (from r in result.AsEnumerable()
                                              where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Prior-Reservation Made for the Visit", StringComparison.OrdinalIgnoreCase)
                                              select Convert.ToString(r["MetricName"])).ToList();
                                _dyynamicParentName = "Prior-Reservation Made for the Visit";
                            }
                            if (metriclist.Count == 0)
                            {
                                metriclist = (from r in result.AsEnumerable()
                                              where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Specific Deal or Promotion", StringComparison.OrdinalIgnoreCase)
                                              select Convert.ToString(r["MetricName"])).ToList();
                                _dyynamicParentName = "Specific Deal or Promotion";
                            }
                            if (metriclist.Count == 0)
                            {
                                metriclist = (from r in result.AsEnumerable()
                                              where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Mode of Placing order", StringComparison.OrdinalIgnoreCase)
                                              select Convert.ToString(r["MetricName"])).ToList();
                                _dyynamicParentName = "Mode of Placing order";
                            }

                            metricCount = 0;
                            foreach (var _metric in metriclist)
                            {
                                metricCount++;
                                var tempGroupName = metricCount == 1 ? "Combo_or_Value_Meal_1" : "Combo_or_Value_Meal_2";
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                                sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", _dyynamicParentName)) });
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header_text").FirstOrDefault()).TextFrame.Text = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(sDataRow.MetricName);
                                updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                                tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault();
                                var imgLoc = "~/Images/SituationAssessmentReport/occasion_context/" + removeBlankSpace(sDataRow.MetricName) + ".png";
                                imgLoc = context.Server.MapPath(imgLoc);
                                using (Image img = Image.FromFile(imgLoc, true))
                                {
                                    tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                                }
                            }
                        }
                        catch (Exception e)
                        {
                            Log.LogException(e);                            
                        }




                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 19:
                    try
                    {
                        #region Slide 19

                        cur_Slide = pres.Slides[18];

                        //tempShape = ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "slide_header_text").FirstOrDefault());
                        //tempShape.TextFrame.Paragraphs[0].Portions[2].Text = selectionList[0].EstablishmentName;

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - 6].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - 6].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;

                        //Primary Ocassion Motivations
                        string groupName = "Primary_Ocassion_Motivations_";
                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Primary Occasion Motivations", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _metric in metriclist)
                        {
                            metricCount++;
                            var tempGroupName = groupName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Primary Occasion Motivations")) });
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header").FirstOrDefault()).TextFrame.Text = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(sDataRow.MetricName);
                            point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                            point2 = 1 - point1;
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, _metric, selectionList[0].SelectedColorCode);
                            tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault();
                            var imgLoc = "~/Images/SituationAssessmentReport/primary_ocassion_motivations/" + removeBlankSpace(sDataRow.MetricName) + ".png";
                            imgLoc = context.Server.MapPath(imgLoc);
                            using (Image img = Image.FromFile(imgLoc, true))
                            {
                                tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                            }
                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                        }

                        //Primary Outlet Motivations
                        groupName = "Primary_Outlet_Motivations_";
                        metriclist = (from r in result.AsEnumerable()
                                      where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Primary Outlet Motivations", StringComparison.OrdinalIgnoreCase)
                                      select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _metric in metriclist)
                        {
                            metricCount++;
                            var tempGroupName = groupName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Primary Outlet Motivations")) });
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "header").FirstOrDefault()).TextFrame.Text = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(sDataRow.MetricName);
                            point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                            point2 = 1 - point1;
                            tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                            updateDonutTwoPointsWithLabel(tempChart, point1, point2, _metric, selectionList[0].SelectedColorCode);
                            tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault();
                            var imgLoc = "~/Images/SituationAssessmentReport/primary_outlet_motivations/" + removeBlankSpace(sDataRow.MetricName) + ".png";
                            imgLoc = context.Server.MapPath(imgLoc);
                            using (Image img = Image.FromFile(imgLoc, true))
                            {
                                tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                            }
                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                        }

                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 2; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                        }
                        catch (Exception e)
                        { }
                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 20:
                    try
                    {
                        #region Slide 20

                        cur_Slide = pres.Slides[19];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            if (selectionList[0].DefualtIsVisitGuestList[slideId - 6].ToString() == "1")
                            {
                                if (selectionList[0].DefaultFrequencyNameList[slideId - 6].ToString() == "Total Visits")
                                    footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                                else
                                    footerFreqName = " | Freq. – Visits by " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                            }
                            else
                                footerFreqName = " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6] + " Guests";
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + footerFreqName;
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        point1 = 0.0; point2 = 0.0; point3 = 0.0; point4 = 0.0;
                        int metricCount = 0;

                        //Overall Staisfaction
                        string groupName = "Overall_Staisfaction";

                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == groupName).FirstOrDefault();
                        sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", "Very Satisfied")), (new Tuple<string, string>("MetricParentName", "Overall Staisfaction")) });
                        ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "chart_value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                        point1 = Convert.ToDouble(sDataRow.MetricPercentage);
                        point2 = 1 - point1;
                        tempChart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                        updateDonutTwoPointsWithLabel(tempChart, point1, point2, sDataRow.MetricName, selectionList[0].SelectedColorCode);
                        updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);


                        //Satisfaction Drivers
                        groupName = "Satisfaction_Drivers_";
                        var metriclist = (from r in result.AsEnumerable()
                                          where Convert.ToString(r.Field<object>("MetricParentName")).Equals("Satisfaction Drivers", StringComparison.OrdinalIgnoreCase)
                                          select Convert.ToString(r["MetricName"])).ToList();
                        metricCount = 0;
                        foreach (var _metric in metriclist)
                        {
                            metricCount++;
                            var tempGroupName = groupName + metricCount.ToString();
                            tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == tempGroupName).FirstOrDefault();
                            sDataRow = getSituationAnalysisDataRow(result, new List<Tuple<string, string>> { (new Tuple<string, string>("MetricName", _metric)), (new Tuple<string, string>("MetricParentName", "Satisfaction Drivers")) });
                            ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "value").FirstOrDefault()).TextFrame.Text = Convert.ToDouble(sDataRow.MetricPercentage * 100).ToString("#0.0") + "%";
                            updateSingleIndexChart(tempGroup, "index1_chart", sDataRow.CustomBaseIndex1.ToString(), Convert.ToDouble(sDataRow.Significance1), false);
                            updateSingleIndexChart(tempGroup, "index2_chart", sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance2), false);
                            updateCompetitorsTextAndValue(tempGroup, sDataRow.CustomBaseName1, sDataRow.CustomBaseName2, sDataRow.CustomBaseIndex1.ToString(), sDataRow.CustomBaseIndex2.ToString(), Convert.ToDouble(sDataRow.Significance1), Convert.ToDouble(sDataRow.Significance2), true);
                        }

                        //color change for headers
                        try
                        {
                            for (int i = 1; i <= 2; i++)
                            {
                                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage" + i.ToString()).FirstOrDefault();
                                updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                                updateSARportHeaderConnectorColor(cur_Slide, "header_connector_" + i.ToString(), selectionList[0].SelectedColorCode, "Gradient");
                            }
                        }
                        catch (Exception e)
                        { }
                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 22:
                    try
                    {
                        #region Slide 22
                        cur_Slide = pres.Slides[21];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "footer_comptitr")).TextFrame.Text = "Competitors: " + selectionList[0].Competitors;

                        if (tempShape != null)
                        {
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header
                        ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "EstName")).TextFrame.Text = selectedEstName;

                        var query = result
                        .AsEnumerable()
                        .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Loyalty Pyramid", StringComparison.OrdinalIgnoreCase));

                        tbl = query.CopyToDataTable();
                        UpdatePyramidSeriesDataSAR(tbl, 0, 0, 5, selectionList[0].SelectedColorCode);
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 24:
                    try
                    {
                        #region Slide 27
                        cur_Slide = pres.Slides[26];



                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 7];
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        createDinerImageryTableSAR(cur_Slide, result, 26, selectionList[0].DefaultFrequencyNameList[slideId - 7], selectionList[0].SelectedColorCode, "");

                        //update header colors
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 25:
                    try
                    {
                        #region Slide 28
                        //sabat 
                        timePeriodForSlide = timePeriod;
                        FooterNoteForSlide = footerNote;
                        cur_Slide = pres.Slides[27];

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 6];
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, FooterNoteForSlide, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header colors
                        dt24 = result;
                        createDinerImageryTableSAR(cur_Slide, result, 27, selectionList[0].DefaultFrequencyNameList[slideId - 7], selectionList[0].SelectedColorCode, "");
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");


                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 26:
                    try
                    {
                        #region Slide 29
                        cur_Slide = pres.Slides[28];
                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Text = ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Text.Replace("_channel", custombase[1].ToString());


                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();
                        if (tempShape != null)
                        {
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 7];
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, FooterNoteForSlide, footerNote2);//Notes Update
                        //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                        //update header colors
                        string correlationChannelName = "";
                        correlationChannelName = result.Rows.Count==0? custombase[1].ToString() : result.AsEnumerable().Select(x => x.Field<string>("CoefficientType")).FirstOrDefault();
                        createDinerImageryTableSAR(cur_Slide, result, 28, selectionList[0].DefaultFrequencyNameList[slideId - 7], selectionList[0].SelectedColorCode, correlationChannelName);
                        //createDinerImageryTableSAR(cur_Slide, result, 28, selectionList[0].DefaultFrequencyNameList[slideId - 7], selectionList[0].SelectedColorCode, custombase[1].ToString());
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");

                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "arrow").FirstOrDefault();
                        tempShape.FillFormat.FillType = FillType.Gradient;
                        tempShape.FillFormat.GradientFormat.GradientStops.RemoveAt(2);
                        tempShape.FillFormat.GradientFormat.GradientStops.RemoveAt(0);
                        tempShape.FillFormat.GradientFormat.GradientShape = GradientShape.Linear;
                        tempShape.FillFormat.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                        tempShape.FillFormat.GradientFormat.LinearGradientAngle = 90;
                        tempShape.FillFormat.GradientFormat.GradientStops.Add(0, ColorTranslator.FromHtml(selectionList[0].SelectedColorCode));
                        tempShape.FillFormat.GradientFormat.GradientStops.Add(2, ColorTranslator.FromHtml(selectionList[0].SelectedColorCode));
                        tempShape.FillFormat.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                        tempShape.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectionList[0].SelectedColorCode);

                        #endregion
                        #region Slide 30
                        cur_Slide = pres.Slides[29];



                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 9];
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        string footerNoteForGraph = "Attributes in the upper right quadrant are both a relative strength for " + selectedEstName + " and have a high correlation to Dining frequency and should therefore be protected. Attributes in the bottom right quadrant are a relative strength for " + selectedEstName + " but have a lower correlation to dining frequency- they should still be protected but are less vital. Attributes in the top left quadrant are relative weaknesses for " + selectedEstName + " but have a high correlation to dining frequency. These should be improved as they are the biggest opportunities to increase frequency. Attributes in the bottom left quadrant are relative weaknesses for " + selectedEstName + " and have a low correlation to dining frequency. These can be ignored.";



                        //sabat
                        updateNotesSection(cur_Slide, selectedEstName, Filters, timePeriod, FooterNoteForSlide, footerNoteForGraph);//Notes Update
                                                                                                                                    //updateNotesSection(cur_Slide, selectedEstName, Filters);//Notes Update
                                                                                                                                    //updateScatteredChart(cur_Slide, dt24, result, selectionList[0].EstablishmentName);
                        updateScatteredChart(cur_Slide, dt24, result, selectionList[0].EstablishmentName, correlationChannelName);
                        //update header colors
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                        ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "txt_devtn_1").FirstOrDefault()).TextFrame.Text = Convert.ToString(deviationValue);
                        ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "txt_devtn_2").FirstOrDefault()).TextFrame.Text = "- " + Convert.ToString(deviationValue);
                        setStrengthWeekPosition(cur_Slide);

                        #endregion
                    }
                    catch (Exception e) { }
                    break;
                case 27:
                    try
                    {
                        #region Slide 31
                        cur_Slide = pres.Slides[30];


                        //((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[1].Text = selectionList[0].EstablishmentName + " vs Competition ";

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 8];
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //sabat
                        updateNotesSectionBIC(cur_Slide, selectedEstName, Filters, selectionList[0].Competitors, timePeriod, footerNote, footerNote2);//Notes Update
                                                                                                                                                      //updateNotesSectionBIC(cur_Slide, selectedEstName, Filters, selectionList[0].Competitors);
                        var query = result
                        .AsEnumerable()
                        .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Best In Class", StringComparison.OrdinalIgnoreCase)
                        && ((Convert.ToString(r.Field<object>("GroupName")).Equals("Atmosphere", StringComparison.OrdinalIgnoreCase)
                        || (Convert.ToString(r.Field<object>("GroupName")).Equals("Menu Items", StringComparison.OrdinalIgnoreCase)))));

                        var metricList27 = query.CopyToDataTable();
                        updateStackedBarChart(cur_Slide, metricList27, "chart_1", selectionList[0].SelectedColorCode, context, subPath, slideId);

                        //update header colors
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");
                        #endregion

                        #region slide 32
                        cur_Slide = pres.Slides[31];


                        // ((IAutoShape)cur_Slide.Shapes.FirstOrDefault(x => x.Name == "slide_header_text")).TextFrame.Paragraphs[0].Portions[1].Text = selectionList[0].EstablishmentName + " vs Competition ";

                        #region Time Period and Frequency 
                        tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();

                        if (tempShape != null)
                        {
                            tempShape.TextFrame.Text = "Time Period: " + selectedTime + " | Freq. – " + selectionList[0].DefaultFrequencyNameList[slideId - 8];
                        }
                        #endregion
                        timePeriod = tempShape.TextFrame.Text;
                        //string FooterNoteForCompetitors= footerNote2+""
                        //sabat
                        // updateNotesSectionBIC(cur_Slide, selectedEstName, Filters, selectionList[0].Competitors, timePeriod, footerNote, footerNote2);//Notes Update
                        //updateNotesSectionBIC(cur_Slide, selectedEstName, Filters, selectionList[0].Competitors);
                        query = result
                        .AsEnumerable()
                        .Where(r => Convert.ToString(r.Field<object>("MetricParentName")).Equals("Best In Class", StringComparison.OrdinalIgnoreCase)
                        && ((Convert.ToString(r.Field<object>("GroupName")).Equals("Kids", StringComparison.OrdinalIgnoreCase)
                        || (Convert.ToString(r.Field<object>("GroupName")).Equals("Service", StringComparison.OrdinalIgnoreCase)
                        || (Convert.ToString(r.Field<object>("GroupName")).Equals("Convenience", StringComparison.OrdinalIgnoreCase)
                        || (Convert.ToString(r.Field<object>("GroupName")).Equals("Price", StringComparison.OrdinalIgnoreCase)
                        || (Convert.ToString(r.Field<object>("GroupName")).Equals("Other", StringComparison.OrdinalIgnoreCase))))))));
                        var metricList28 = query.CopyToDataTable();

                        updateStackedBarChart(cur_Slide, metricList28, "chart_1", selectionList[0].SelectedColorCode, context, subPath, slideId);

                        //update header colors
                        tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "header_colouredImage").FirstOrDefault();
                        updateSARportHeaderColor(tempGroup, "chart", selectionList[0].SelectedColorCode, "connector");
                        updateSARportHeaderConnectorColor(cur_Slide, "header_connector", selectionList[0].SelectedColorCode, "Gradient");

                        //Update Footer Note


                        if (metricList28.Rows.Count > 0)
                        {
                            DataColumn col = metricList28.Columns["BICGap"];
                            foreach (DataRow row in metricList28.Rows)
                            {
                                if (row[col].ToString() != "0")
                                {

                                    var MetricName = row["MetricName"].ToString();

                                    var BICRating = Convert.ToDouble(row["MetricPercentage"].ToString()).ToString("#0.0") + "%";

                                    var BICGap = Convert.ToDouble(row["BICGap"].ToString()).ToString("#0.0") + "%";
                                    var BICEstablishmentName = row["BICEstablishmentName"].ToString();
                                    var FooterNoteForCompetitor = "" + BICRating + " of respondents believe " + selectedEstName + " has a \"" + MetricName + "\". This represents a " + BICGap + " gap with " + BICEstablishmentName + ".";
                                    updateNotesSectionBIC(cur_Slide, selectedEstName, Filters, selectionList[0].Competitors, timePeriod, footerNote, FooterNoteForCompetitor);
                                    break;
                                }
                            }
                        }

                        //if(BICEstablishmentName!= selectedEstName)
                        //{ 
                        //    FooterNoteForCompetitor = "" + BICRating+ " of respondents believe " + selectedEstName + " has a \"" + MetricName + "\". This represents a " + BICGap+ " gap with " + BICEstablishmentName + ".";
                        //}
                        //updateNotesSectionBIC(cur_Slide, selectedEstName, Filters, selectionList[0].Competitors, timePeriod, footerNote, FooterNoteForCompetitor);


                        #endregion
                    }
                    catch (Exception e) { }
                    break;
            }
            //}

        }

        private void updateStackedBarChart(ISlide sld, DataTable tbl, string chart_shape_name, string selectedColorCode, HttpContextBase context, string subPath, int slideId)
        {
            AsposeChart.IChart chart;
            AsposeChart.IDataLabel lbl;
            IGroupShape tempGroup;
            IAutoShape tempShape;
            double metricPercentage = 0.0, gap = 0.0;
            chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == chart_shape_name).FirstOrDefault();
            //for (var i = 0; i < tbl.Rows.Count; i++)
            //{
            int i = 0;
            int defaultWorksheetIndex = 0;

            chart.ChartData.Categories.Clear();
            AsposeChart.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;
            //chart.ChartData.Categories.Add(fact.GetCell(defaultWorksheetIndex, 0, 0, ""));
            var metriclist = (from r in tbl.AsEnumerable() select Convert.ToString(r["MetricName"])).Distinct().ToList();
            foreach (string metric in metriclist)
            {
                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "Group " + (i + 1)).FirstOrDefault();
                var query = (from r in tbl.AsEnumerable()
                             where Convert.ToString(r.Field<object>("MetricName")).Equals(metric, StringComparison.OrdinalIgnoreCase)
                             select new
                             {
                                 MetricPercentage = Convert.ToString(r.Field<object>("MetricPercentage")),
                                 BICGap = Convert.ToString(r.Field<object>("BICGap")),
                                 BICRating = Convert.ToString(r.Field<object>("BICRating")),
                                 BICEstablishmentName = Convert.ToString(r.Field<object>("BICEstablishmentName")),
                                 SignificanceColorFlag = Convert.ToString(r.Field<object>("SignificanceColorFlag"))
                             }).FirstOrDefault();
                if (!double.TryParse(Convert.ToString(query.MetricPercentage), out metricPercentage)) metricPercentage = 0.0;
                if (!double.TryParse(Convert.ToString(query.BICGap), out gap)) gap = 0.0;


                chart.ChartData.Series[0].DataPoints[i].Value.Data = metricPercentage / 100;
                chart.ChartData.Series[1].DataPoints[i].Value.Data = gap / 100;

                chart.ChartData.Series[0].Name.AsCells[0].Value = Convert.ToString(tbl.Rows[0]["EstablishmentName"]);
                //chart.ChartData.Series[i].DataPoints[0].Value.Data = "Metric";
                chart.ChartData.Series[0].Format.Fill.FillType = FillType.Solid;
                chart.ChartData.Series[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
                //Setting Category Name
                chart.ChartData.Categories.Add(fact.GetCell(defaultWorksheetIndex, i + 1, 0, metriclist[i]));
                tempShape = (IAutoShape)tempGroup.Shapes.Where(x => x.Name == "Rectangle").FirstOrDefault();
                tempShape.TextFrame.Text = (query.BICRating == "") ? "" : Convert.ToDouble(query.BICRating).ToString("#0.0") + "%";
                tempShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                tempShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigColorRating(query.SignificanceColorFlag);
                var imgLoc = "~/Images/P2PDashboardEsthmtImages/" + query.BICEstablishmentName.Replace("/", "") + ".svg";
                imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "image").FirstOrDefault(), imgLoc, context, slideId, -2, subPath);
                i++;
            }
        }

        private SituationAnalysisData getSituationAnalysisDataRow(DataTable tbl, List<Tuple<string, string>> columnData)
        {
            SituationAnalysisData dataRow = new SituationAnalysisData();
            foreach (var _column in columnData)
            {
                var query = tbl
                           .AsEnumerable()
                           .Where(r => Convert.ToString(r.Field<object>(_column.Item1)).Equals(_column.Item2, StringComparison.OrdinalIgnoreCase));
                tbl = query.CopyToDataTable<DataRow>();
            }

            dataRow = (from r in tbl.AsEnumerable()
                       select new SituationAnalysisData()
                       {
                           CustomBaseName1 = r["CB1"].ToString(),
                           CustomBaseName2 = r["CB2"].ToString(),
                           CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? null : stringToInt(r["CB1Index"].ToString()),
                           CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? null : stringToInt(r["CB2Index"].ToString()),
                           MetricPercentage = r["MetricPercentage"] == DBNull.Value ? null : stringToDouble(r["MetricPercentage"].ToString()),
                           CB1Percentage = r["CB1Percentage"] == DBNull.Value ? null : stringToDouble(r["CB1Percentage"].ToString()),
                           CB2Percentage = r["CB2Percentage"] == DBNull.Value ? null : stringToDouble(r["CB2Percentage"].ToString()),
                           MetricName = r["MetricName"].ToString(),
                           EstablishmentName = tbl.Columns.Contains("EstablishmentName") ? r["EstablishmentName"].ToString() : string.Empty,
                           GroupName = tbl.Columns.Contains("GroupName") ? (r["GroupName"] == DBNull.Value ? string.Empty : r["GroupName"].ToString()) : "",
                           Significance1 = r["CB1Sig"] == DBNull.Value ? 0.0 : stringToDouble(r["CB1Sig"].ToString()),
                           Significance2 = r["CB2Sig"] == DBNull.Value ? 0.0 : stringToDouble(r["CB2Sig"].ToString())
                       }).FirstOrDefault();

            return dataRow;
        }
        private void updateHeaderImageChart(AsposeChart.IChart chart, string selectedColorCode)
        {
            if (chart == null)
                return;
            chart.ChartData.Series[0].Format.Fill.FillType = FillType.Solid;
            chart.ChartData.Series[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
        }

        public void updateSingleIndexChart(IGroupShape group, String chart_shape_name, string custombaseIndexValue, double sign, bool isShowLable)
        {
            AsposeChart.IChart chart;
            AsposeChart.IDataLabel lbl;
            chart = (AsposeChart.IChart)group.Shapes.Where(x => x.Name == chart_shape_name).FirstOrDefault();
            chart.ChartData.Series[0].DataPoints[0].Value.Data = custombaseIndexValue;

            if (isShowLable)
            {
                lbl = chart.ChartData.Series[0].DataPoints[0].Label;
                lbl.DataLabelFormat.ShowValue = true;
                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.True;
                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(sign);
                lbl.DataLabelFormat.TextFormat.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;
            }

        }
        public void updateSingleBarChart(IGroupShape group, String chart_shape_name, double custombaseIndexValue, double sign, bool isShowLable, string selectedColorCode)
        {
            AsposeChart.IChart chart;
            AsposeChart.IDataLabel lbl;
            chart = (AsposeChart.IChart)group.Shapes.Where(x => x.Name == chart_shape_name).FirstOrDefault();
            chart.ChartData.Series[0].DataPoints[0].Value.Data = custombaseIndexValue;
            chart.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
            chart.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            if (isShowLable)
            {
                lbl = chart.ChartData.Series[0].DataPoints[0].Label;
                lbl.DataLabelFormat.ShowValue = true;
                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.True;
                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(sign);
                lbl.DataLabelFormat.TextFormat.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;
            }

        }

        //Format table cells
        public void formatTableCellSAR(ICell x, LineDashStyle bdr_lds, Color bdr_clr, Color bdrright_clr, Color font_clr, Color bg_clr, float fontH, TextAlignment align, TextCapType tcp, float top, float left, NullableBool isFB)
        {
            //Border
            x.BorderTop.Width = 0;
            x.BorderLeft.Width = 0;

            x.BorderBottom.DashStyle = bdr_lds;
            x.BorderBottom.FillFormat.FillType = FillType.Solid;
            x.BorderBottom.FillFormat.SolidFillColor.Color = bdr_clr;

            x.BorderRight.Width = .5;
            x.BorderRight.DashStyle = bdr_lds;
            x.BorderRight.FillFormat.FillType = FillType.Solid;
            x.BorderRight.FillFormat.SolidFillColor.Color = bdrright_clr;


            //Background color, font color, font size, alignment
            x.FillFormat.FillType = FillType.Solid;
            x.FillFormat.SolidFillColor.Color = bg_clr;
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FillFormat.FillType = FillType.Solid;
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FillFormat.SolidFillColor.Color = font_clr;
            x.TextFrame.Paragraphs[0].ParagraphFormat.FontAlignment = FontAlignment.Center;
            x.TextFrame.Paragraphs[0].ParagraphFormat.Alignment = align;
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FontHeight = fontH;

            //Case
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.TextCapType = tcp;

            //Margins top,bottom : 0.1cm
            x.MarginTop = x.MarginBottom = top;
            x.MarginLeft = left;
            x.MarginRight = 0;

            //Vertical Alignment Center
            x.TextAnchorType = TextAnchorType.Center;

            //Font-family Franklin Gothic Book
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.LatinFont = new FontData("Franklin Gothic Book");
            //Font-bold
            x.TextFrame.Paragraphs[0].ParagraphFormat.DefaultPortionFormat.FontBold = isFB;
        }

        public void createDinerImageryTableSAR(ISlide sld, DataTable dt, int slideId, string seltFreq, string selectedColor, string channelParentName)
        {
            int index = 0, jInd = 0, kInd = 0, cur_row_ind = 0;
            double tbl_width = 935, tbl_x = 13.09668, tbl_y = 91.2809, first_col_w = 270, padd_w = 2;
            List<string> allestList = dt.AsEnumerable().Select(x => x.Field<string>("EstablishmentName")).Distinct().ToList();
            List<string> estList = new List<string>();
            if (allestList.Count > 10)
            {
                for (int i = 0; i < 10; i++)
                {
                    estList.Add(allestList[i]);
                }
            }
            else
            {
                estList = allestList;
            }
            List<string> metricList = dt.AsEnumerable().Select(x => x.Field<string>("MetricName")).Distinct().ToList();
            double[] cols = new double[estList.Count + 1];
            double[] rows = new double[metricList.Count + 1];
            //Initialize cols
            double leftoutwidth = (tbl_width - first_col_w) / estList.Count;
            cols[0] = first_col_w;
            if (slideId == 28)
            {
                tbl_width = 700;
                cols[0] = 580;
                cols[1] = 160;
            }
            else
            {
                for (index = 1; index < cols.Length; index++)
                {
                    cols[index] = leftoutwidth;
                }

            }

            //Create table
            AsposeSlide.ITable tbl = (Aspose.Slides.ITable)sld.Shapes.AddTable((float)tbl_x, (float)tbl_y, cols, rows);
            tbl.FirstRow = true;
            tbl.StylePreset = TableStylePreset.NoStyleTableGrid;
            formatTableCellSAR(tbl[0, 0], LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.Transparent, 11, TextAlignment.Center, TextCapType.All, 6, 1, NullableBool.True);
            formatTableCellSAR(tbl[1, 0], LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.Transparent, 1, TextAlignment.Center, TextCapType.All, 3, 0, NullableBool.False);
            formatTableCellSAR(tbl[0, 0], LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.FromArgb(242, 242, 242), 11, TextAlignment.Center, TextCapType.None, 6, 1, NullableBool.True);
            formatTableCellSAR(tbl[1, 0], LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.FromArgb(242, 242, 242), 11, TextAlignment.Center, TextCapType.None, 6, 1, NullableBool.False);

            if (slideId == 28)
            {
                tbl[0, 0].TextFrame.Text = "Correlation to Dining Frequency for " + channelParentName + " (Index vs Average Correlation)";
                tbl.MergeCells(tbl[0, 0], tbl[1, 0], true);
                formatTableCellSAR(tbl.MergeCells(tbl[0, 0], tbl[1, 0], true), LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.FromArgb(242, 242, 242), 11, TextAlignment.Center, TextCapType.None, 6, 1, NullableBool.True);
                formatTableCellSAR(tbl[1, 0], LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.FromArgb(242, 242, 242), 11, TextAlignment.Center, TextCapType.None, 6, 1, NullableBool.True);

            }
            else
                tbl[0, 0].TextFrame.Text = "Establishment Imageries";

            //Fill table
            for (index = 0; index < estList.Count; index++)
            {
                cur_row_ind = 0;
                //Add column header
                if (slideId != 28)
                {
                    tbl[1 + index, 0].TextFrame.Text = estList[index];
                    //Format Column Headers
                    formatTableCellSAR(tbl[1 + index, 0], LineDashStyle.Solid, ColorTranslator.FromHtml(selectedColor), Color.LightGray, Color.Black, Color.FromArgb(242, 242, 242), 11, TextAlignment.Center, TextCapType.None, 6, 0, NullableBool.True);
                }
                var dt_rows = dt.AsEnumerable().Where(x => x.Field<string>("EstablishmentName") == estList[index]);
                kInd = 0;
                //Format the group-column header
                //formatTableCellSAR(tbl[1+ 1 * index, cur_row_ind], LineDashStyle.Solid, Color.FromArgb(100, 100, 100), Color.FromArgb(64, 64, 64), Color.FromArgb(230, 230, 230), 11, TextAlignment.Left, TextCapType.All, 5, 0);
                //formatTableCellSAR(tbl[1 + 2 * index, cur_row_ind], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 11, TextAlignment.Center, TextCapType.All, 5, 0);
                cur_row_ind++;
                foreach (DataRow dr in dt_rows)
                {
                    if (index == 0)
                    {
                        //Update the 1st Column
                        tbl[0, cur_row_ind].TextFrame.Text = Convert.ToString(dr["Metricname"]);
                        formatTableCellSAR(tbl[0, cur_row_ind], LineDashStyle.Solid, Color.LightGray, Color.LightGray, Color.Black, Color.Transparent, 8, TextAlignment.Left, TextCapType.None, -30, 1, NullableBool.False);
                    }
                    //Update the values
                    if (slideId == 28)
                    {
                        if (dr["DeviationValue"].ToString() == "999")
                            tbl[1 + index, cur_row_ind].TextFrame.Text = "NA";
                        else
                            tbl[1 + index, cur_row_ind].TextFrame.Text = dr["DeviationValue"] == DBNull.Value ? "NA" : (Convert.ToDouble(dr["DeviationValue"])).ToString();
                    }
                    else
                    {

                        if (dr["DeviationValue"].ToString() == "999")
                            tbl[1 + index, cur_row_ind].TextFrame.Text = "NA";
                        else
                            tbl[1 + index, cur_row_ind].TextFrame.Text = dr["DeviationValue"] == DBNull.Value ? "NA" : (Convert.ToDouble(dr["DeviationValue"])).ToString("#0.0") + "%";
                    }
                    if (slideId == 27)
                    {
                        formatTableCellSAR(tbl[1 + index, cur_row_ind], LineDashStyle.Solid, Color.LightGray, Color.LightGray, returnStatTestColorSARBG(dr, true), returnStatTestColorSARBG(dr, false), 8, TextAlignment.Center, TextCapType.None, 3, 0, NullableBool.False);
                        ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "txt_devtn_1").FirstOrDefault()).TextFrame.Text = dr["SigRangeValue"].ToString();
                        ((IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "txt_devtn_2").FirstOrDefault()).TextFrame.Text = "- " + dr["SigRangeValue"].ToString();
                        deviationValue = dr["SigRangeValue"] == DBNull.Value ? 0 : Convert.ToInt32(dr["SigRangeValue"]);
                    }
                    else if (slideId == 26)
                    {
                        formatTableCellSAR(tbl[1 + index, cur_row_ind], LineDashStyle.Solid, Color.LightGray, Color.LightGray, getSigColor(dr["SignificanceColorFlag"].ToString()), Color.Transparent, 8, TextAlignment.Center, TextCapType.None, 3, 0, NullableBool.False);
                    }
                    else
                        formatTableCellSAR(tbl[1 + index, cur_row_ind], LineDashStyle.Solid, Color.LightGray, Color.LightGray, Color.Black, Color.Transparent, 8, TextAlignment.Center, TextCapType.None, 3, 0, NullableBool.False);
                    //formatTableCellSAR(tbl[1 + index, cur_row_ind], LineDashStyle.Solid, Color.Transparent, Color.Transparent, Color.Transparent, 9, TextAlignment.Center, TextCapType.All, 3, 0);
                    kInd++; cur_row_ind++;
                }



                //}
            }
            //Remove existing table
            sld.Shapes.Remove(sld.Shapes.Where(x => x.Name == "tbl").FirstOrDefault());
        }

        public void updateScatteredChart(ISlide sld, DataTable dt24, DataTable dt, string establishmentName, string channelName)
        {
            AsposeChart.IChart chart;
            AsposeChart.IChartSeries Series;
            AsposeChart.IDataLabel lbl;

            chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
            int i = 0, j = 0;
            //Aspose.Slides.Charts.IChart chart = null;
            chart.ChartData.Series.Clear();
            int defaultWorksheetIndex = 0;
            AsposeChart.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;
            //chart.ChartData.Series.Add(fact.GetCell(0, 1, 1, ""), chart.Type);
            chart.ChartData.Series.Add(fact.GetCell(0, 0, 1, "Category Lift with Monthly+ Dining"), chart.Type);
            //first chart series
            AsposeChart.IChartSeries series = chart.ChartData.Series[0];
            series.Marker.Size = 10;
            series.Marker.Format.Fill.FillType = FillType.Solid;

            series.Marker.Format.Fill.SolidFillColor.Color = Color.Red;
            series.Marker.Symbol = AsposeChart.MarkerStyleType.Circle;
            series.Marker.Format.Line.FillFormat.FillType = FillType.Solid;

            series.Marker.Format.Line.FillFormat.SolidFillColor.Color = Color.Red;
            //Adding data to series 1
            i = 0; AsposeChart.IChartDataPoint pointIndex; int tempCount = 0;
            double _vminxAxis = 0.0; double _vmaxxAxis = 0.0;
            double _hminxAxis = 0.0; double _hmaxxAxis = 0.0; double xvalue = 0.0;
            _vmaxxAxis = (Convert.ToDouble(dt.Compute("max([DeviationValue])", string.Empty)));
            _vminxAxis = (Convert.ToDouble(dt.Compute("min([DeviationValue])", string.Empty)));

            var d24reslt1 = (from r in dt24.AsEnumerable()
                             where Convert.ToString(r.Field<object>("EstablishmentName")).Equals(Convert.ToString(establishmentName), StringComparison.OrdinalIgnoreCase)
                             select new
                             {
                                 value = Convert.ToDouble(r.Field<object>("DeviationValue")),
                             }).ToList();
            //            var sortD24reslt11 = d24reslt1;

            var d24reslt = (from r in dt24.AsEnumerable()
                            where Convert.ToString(r.Field<object>("EstablishmentName")).Equals(Convert.ToString(establishmentName), StringComparison.OrdinalIgnoreCase)
                            select new
                            {
                                value = Convert.ToDouble(r.Field<object>("DeviationValue")),
                                metricName = Convert.ToString(r.Field<object>("MetricName"))
                            }).ToList();
            var sortD24reslt11 = d24reslt.OrderBy(d => d.value).ToList();

            _hmaxxAxis = sortD24reslt11[sortD24reslt11.Count - 1].value;
            _hminxAxis = sortD24reslt11[0].value;

            chart.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
            chart.Axes.HorizontalAxis.IsAutomaticMinValue = false;

            double maxvalue = (getNearestValue(_hmaxxAxis, false, true)) / 100;

            double minvalue = (getNearestValue(_hminxAxis, false, false)) / 100;

            //double maxvalue = (getNearestValue(_hmaxxAxis, false, true)) / 100;
            //double minvalue = (getNearestValue(_hminxAxis, false, false)) / 100;
            //double mxvalue = maxvalue * 0.35;
            //double mnvalue = minvalue * 0.35;
            //maxvalue += 0.10;
            //minvalue += 0.10;

            if (maxvalue > Math.Abs(minvalue))
            {
                chart.Axes.HorizontalAxis.MaxValue = maxvalue;
                chart.Axes.HorizontalAxis.MinValue = -maxvalue;
                rangeValue = Math.Abs(Convert.ToInt32((maxvalue * 2) * 100));
            }
            else
            {
                chart.Axes.HorizontalAxis.MaxValue = -minvalue;
                chart.Axes.HorizontalAxis.MinValue = minvalue;
                rangeValue = Math.Abs(Convert.ToInt32((minvalue * 2) * 100));
            }

            chart.Axes.VerticalAxis.IsAutomaticMaxValue = false;
            chart.Axes.VerticalAxis.IsAutomaticMinValue = false;
            //double V_maxvalue = ((Math.Round(getNearestValue(_vmaxxAxis, true, true) / 5d) * 5) + 10);
            //double V_minvalue = ((Math.Round(getNearestValue(_vminxAxis, true, false) / 5d) * 5) - 10);
            chart.Axes.VerticalAxis.MaxValue = getNearestValue(_vmaxxAxis, true, true);
            chart.Axes.VerticalAxis.MinValue = getNearestValue(_vminxAxis, true, false);
            //chart.Axes.VerticalAxis.MaxValue = V_maxvalue;
            //chart.Axes.VerticalAxis.MinValue = V_minvalue;
            dynamic d25reslt = (from r in dt.AsEnumerable()
                                where Convert.ToString(r.Field<object>("EstablishmentName")).Equals(Convert.ToString(establishmentName), StringComparison.OrdinalIgnoreCase)
                                select new
                                {
                                    value = Convert.ToString(r.Field<object>("DeviationValue")),
                                    metricName = Convert.ToString(r.Field<object>("MetricName"))
                                }).ToList();

            foreach (var r in d25reslt)
            {
                foreach (var d in d24reslt)
                {
                    if (r.metricName == d.metricName)
                    {
                        if (!double.TryParse(Convert.ToString(d.value), out xvalue)) xvalue = 0.0;
                        series.DataPoints.AddDataPointForScatterSeries(fact.GetCell(defaultWorksheetIndex, 1 + tempCount, 0, xvalue == 0.0 ? 0.0 : xvalue / 100), fact.GetCell(defaultWorksheetIndex, 1 + tempCount, 1, Convert.ToDouble(r.value)));
                        pointIndex = series.DataPoints[tempCount];
                        pointIndex.Label.TextFrameForOverriding.Text = r.metricName;
                        series.DataPoints[tempCount].Label.TextFrameForOverriding.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 8;
                        series.DataPoints[tempCount].Label.DataLabelFormat.TextFormat.TextBlockFormat.WrapText = NullableBool.True;
                        //series.Labels.DefaultDataLabelFormat.ShowLeaderLines = true;
                        //series.Labels.DefaultDataLabelFormat.ShowSeriesName = true;
                        //series.Labels.DefaultDataLabelFormat.ShowCategoryName = true;
                        //series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.AutofitType = TextAutofitType.Normal;
                        //series.Labels.DefaultDataLabelFormat.Position = AsposeChart.LegendDataLabelPosition.Right;
                        series.Marker.Size = 10;
                        chart.ChartData.Series.Add(fact.GetCell(defaultWorksheetIndex, 1 + tempCount, 2, r.metricName), chart.Type);
                        tempCount++;
                        i++;
                    }
                }
            }
            chart.HasLegend = false;
            chart.HasTitle = false;
            chart.Axes.VerticalAxis.Title.AddTextFrameForOverriding(channelName + " Correlation to Dining Frequency");
            chart.Axes.HorizontalAxis.Title.AddTextFrameForOverriding(establishmentName + " Imagery Weaknesses/ Strengths");
            chart.Axes.HorizontalAxis.MajorTickMark = AsposeChart.TickMarkType.None;
            chart.Axes.HorizontalAxis.MinorTickMark = AsposeChart.TickMarkType.None;
            chart.Axes.VerticalAxis.MajorTickMark = AsposeChart.TickMarkType.None;
            chart.Axes.VerticalAxis.MinorTickMark = AsposeChart.TickMarkType.None;
            chart.Axes.HorizontalAxis.TickLabelPosition = AsposeChart.TickLabelPositionType.Low;
            chart.Axes.VerticalAxis.TickLabelPosition = AsposeChart.TickLabelPositionType.Low;

        }

        //public void updateScatteredChart(ISlide sld, DataTable dt24, DataTable dt, string establishmentName)
        //{
        //    AsposeChart.IChart chart;
        //    AsposeChart.IChartSeries Series;
        //    AsposeChart.IDataLabel lbl;

        //    chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
        //    int i = 0, j = 0;
        //    Aspose.Slides.Charts.IChart chart = null;
        //    chart.ChartData.Series.Clear();
        //    int defaultWorksheetIndex = 0;
        //    AsposeChart.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;
        //    chart.ChartData.Series.Add(fact.GetCell(0, 1, 1, ""), chart.Type);
        //    chart.ChartData.Series.Add(fact.GetCell(0, 0, 1, "Category Lift with Monthly+ Dining"), chart.Type);
        //    first chart series
        //    AsposeChart.IChartSeries series = chart.ChartData.Series[0];
        //    series.Marker.Size = 10;
        //    series.Marker.Format.Fill.FillType = FillType.Solid;
        //    series.Marker.Format.Fill.SolidFillColor.Color = Color.Red;

        //    series.Marker.Symbol = AsposeChart.MarkerStyleType.Circle;
        //    series.Marker.Format.Line.FillFormat.FillType = FillType.Solid;

        //    series.Marker.Format.Line.FillFormat.SolidFillColor.Color = Color.Red;
        //    Adding data to series 1
        //    i = 0; AsposeChart.IChartDataPoint pointIndex; int tempCount = 0;
        //    double _vminxAxis = 0.0; double _vmaxxAxis = 0.0;
        //    double _hminxAxis = 0.0; double _hmaxxAxis = 0.0; double xvalue = 0.0;
        //    _vmaxxAxis = (Convert.ToDouble(dt.Compute("max([DeviationValue])", string.Empty)));
        //    _vminxAxis = (Convert.ToDouble(dt.Compute("min([DeviationValue])", string.Empty)));

        //    var d24reslt1 = (from r in dt24.AsEnumerable()
        //                     where Convert.ToString(r.Field<object>("EstablishmentName")).Equals(Convert.ToString(establishmentName), StringComparison.OrdinalIgnoreCase)
        //                     select new
        //                     {
        //                         value = Convert.ToDouble(r.Field<object>("DeviationValue")),
        //                     }).ToList();
        //    var sortD24reslt11 = d24reslt1;

        //    var d24reslt = (from r in dt24.AsEnumerable()
        //                    where Convert.ToString(r.Field<object>("EstablishmentName")).Equals(Convert.ToString(establishmentName), StringComparison.OrdinalIgnoreCase)
        //                    select new
        //                    {
        //                        value = Convert.ToDouble(r.Field<object>("DeviationValue")),
        //                        metricName = Convert.ToString(r.Field<object>("MetricName"))
        //                    }).ToList();
        //    var sortD24reslt11 = d24reslt.OrderBy(d => d.value).ToList();

        //    _hmaxxAxis = sortD24reslt11[sortD24reslt11.Count - 1].value;
        //    _hminxAxis = sortD24reslt11[0].value;

        //    chart.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
        //    chart.Axes.HorizontalAxis.IsAutomaticMinValue = false;
        //    double maxvalue = (getNearestValue(_hmaxxAxis, false, true)) / 100;
        //    double minvalue = (getNearestValue(_hminxAxis, false, false)) / 100;
        //    if (maxvalue > Math.Abs(minvalue))
        //    {
        //        chart.Axes.HorizontalAxis.MaxValue = maxvalue;
        //        chart.Axes.HorizontalAxis.MinValue = -maxvalue;
        //        rangeValue = Math.Abs(Convert.ToInt32((maxvalue * 2) * 100));
        //    }
        //    else
        //    {
        //        chart.Axes.HorizontalAxis.MaxValue = -minvalue;
        //        chart.Axes.HorizontalAxis.MinValue = minvalue;
        //        rangeValue = Math.Abs(Convert.ToInt32((minvalue * 2) * 100));
        //    }

        //    chart.Axes.VerticalAxis.IsAutomaticMaxValue = false;
        //    chart.Axes.VerticalAxis.IsAutomaticMinValue = false;
        //    chart.Axes.VerticalAxis.MaxValue = getNearestValue(_vmaxxAxis, true, true);
        //    chart.Axes.VerticalAxis.MinValue = getNearestValue(_vminxAxis, true, false);

        //    dynamic d25reslt = (from r in dt.AsEnumerable()
        //                        where Convert.ToString(r.Field<object>("EstablishmentName")).Equals(Convert.ToString(establishmentName), StringComparison.OrdinalIgnoreCase)
        //                        select new
        //                        {
        //                            value = Convert.ToString(r.Field<object>("DeviationValue")),
        //                            metricName = Convert.ToString(r.Field<object>("MetricName"))
        //                        }).ToList();

        //    foreach (var r in d25reslt)
        //    {
        //        foreach (var d in d24reslt)
        //        {
        //            if (r.metricName == d.metricName)
        //            {
        //                if (!double.TryParse(Convert.ToString(d.value), out xvalue)) xvalue = 0.0;
        //                series.DataPoints.AddDataPointForScatterSeries(fact.GetCell(defaultWorksheetIndex, 1 + tempCount, 0, xvalue == 0.0 ? 0.0 : xvalue / 100), fact.GetCell(defaultWorksheetIndex, 1 + tempCount, 1, Convert.ToDouble(r.value)));
        //                pointIndex = series.DataPoints[tempCount];
        //                pointIndex.Label.TextFrameForOverriding.Text = r.metricName;
        //                series.DataPoints[tempCount].Label.TextFrameForOverriding.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 8;
        //                series.DataPoints[tempCount].Label.DataLabelFormat.TextFormat.TextBlockFormat.WrapText = NullableBool.True;
        //                series.Labels.DefaultDataLabelFormat.ShowLeaderLines = true;
        //                series.Labels.DefaultDataLabelFormat.ShowSeriesName = true;
        //                series.Labels.DefaultDataLabelFormat.ShowCategoryName = true;
        //                series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.AutofitType = TextAutofitType.Normal;
        //                series.Labels.DefaultDataLabelFormat.Position = AsposeChart.LegendDataLabelPosition.Right;
        //                series.Marker.Size = 10;
        //                chart.ChartData.Series.Add(fact.GetCell(defaultWorksheetIndex, 1 + tempCount, 2, r.metricName), chart.Type);
        //                tempCount++;
        //                i++;
        //            }
        //        }
        //    }
        //    chart.HasLegend = false;
        //    chart.HasTitle = false;

        //    chart.Axes.HorizontalAxis.MajorTickMark = AsposeChart.TickMarkType.None;
        //    chart.Axes.HorizontalAxis.MinorTickMark = AsposeChart.TickMarkType.None;
        //    chart.Axes.VerticalAxis.MajorTickMark = AsposeChart.TickMarkType.None;
        //    chart.Axes.VerticalAxis.MinorTickMark = AsposeChart.TickMarkType.None;
        //    chart.Axes.HorizontalAxis.TickLabelPosition = AsposeChart.TickLabelPositionType.Low;
        //    chart.Axes.VerticalAxis.TickLabelPosition = AsposeChart.TickLabelPositionType.Low;

        //}
        private void updateDonutfourPointsWithLabel(AsposeChart.IChart donutChart1, DataTable dt, int colorpostn, List<string> colorCode)
        {
            for (int row = 0; row < 4; row++)
            {
                donutChart1.ChartData.Series[0].DataPoints[row].Value.Data = dt.Rows[row]["MetricPercentage"] == DBNull.Value ? 0.0 : Convert.ToDouble(dt.Rows[row]["MetricPercentage"]);
                donutChart1.ChartData.Categories[row].Value = dt.Rows[row]["MetricName"];
            }
            if (colorpostn == 0)
            {
                donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[0]);
                donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[1]);
                donutChart1.ChartData.Series[0].DataPoints[2].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[2].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[2]);
                donutChart1.ChartData.Series[0].DataPoints[3].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[3].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[3]);
            }
            else
            {
                donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[0]);
            }

        }

        private void updateDonutfourPoints(AsposeChart.IChart donutChart1, double point1, double point2, double point3, double point4, int colorpostn, List<string> colorCode)
        {
            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;
            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = point2;
            donutChart1.ChartData.Series[0].DataPoints[2].Value.Data = point3;
            donutChart1.ChartData.Series[0].DataPoints[3].Value.Data = point4;
            if (colorpostn == 0)
            {
                donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[0]);
                donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[1].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[1]);
                donutChart1.ChartData.Series[0].DataPoints[2].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[2].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[2]);
                donutChart1.ChartData.Series[0].DataPoints[3].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[3].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[3]);
            }
            else
            {
                donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.FillType = FillType.Solid;
                donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCode[0]);
            }

        }
        private void updateDonutThreePoints(AsposeChart.IChart donutChart1, double point1, double point2, double point3, int colorpostn, string selectedColorCode)
        {
            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;
            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = point2;
            donutChart1.ChartData.Series[0].DataPoints[2].Value.Data = point3;
            donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.FillType = FillType.Solid;
            donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
        }

        private void updateDonutTwoPointsWithLabel(AsposeChart.IChart donutChart1, double point1, double point2, string restaurant, string selectedColorCode)
        {
            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;

            if (restaurant != "") donutChart1.ChartData.Categories[0].Value = restaurant;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = point2;
        }
        private void updateDonutTwoPointsWithLabelForGuestFrequency(AsposeChart.IChart donutChart1, double point1, double point2, string restaurant, string selectedColorCode)
        {
            if (point1 == 0)
            {
                donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = 0;
            }
            else
            {
                donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;
            }

            if (restaurant != "") donutChart1.ChartData.Categories[0].Value = restaurant;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = point2;
        }

        private void updateDonutThreePointsWithLabel(AsposeChart.IChart donutChart1, double point1, double point2, double point3, int colorpostn, string selectedColorCode, string metricname)
        {
            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;
            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = point2;
            donutChart1.ChartData.Series[0].DataPoints[2].Value.Data = point3;
            donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.FillType = FillType.Solid;
            donutChart1.ChartData.Series[0].DataPoints[colorpostn].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            if (metricname != "") donutChart1.ChartData.Categories[0].Value = metricname;

        }

        private void updateDonutTwoPointsWithTwoLabel(AsposeChart.IChart donutChart1, double point1, double point2, string restaurant, string restaurant1, string selectedColorCode)
        {
            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;
            if (restaurant != "") donutChart1.ChartData.Categories[0].Value = restaurant;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            if (restaurant1 != "") donutChart1.ChartData.Categories[1].Value = restaurant1;
            donutChart1.ChartData.Series[0].DataPoints[1].Value.Data = point2;
        }

        private void updateDonutOnePointsWithLabel(AsposeChart.IChart donutChart1, double point1, string restaurant, string selectedColorCode)
        {
            donutChart1.ChartData.Series[0].DataPoints[0].Value.Data = point1;
            if (restaurant != "") donutChart1.ChartData.Categories[0].Value = restaurant;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.FillType = FillType.Solid;
            donutChart1.ChartData.Series[0].DataPoints[0].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
        }
        private void updateSARportIndexTable(ISlide sld, DataTable tbl, string tableName, string metricName, int textCol, int valueCol, int index1Col, int index2Col)
        {
            var aspose_tbl = (AsposeSlide.ITable)sld.Shapes.Where(x => x.Name == tableName).FirstOrDefault();
            var metriclist = (from r in tbl.AsEnumerable() select Convert.ToString(r[metricName])).Distinct().ToList();
            int rowCount = 0;
            double metricPercentage = 0.0;
            double sign1 = 0.0, sign2 = 0.0;

            if (aspose_tbl != null)
            {

                foreach (string metric in metriclist)
                {
                    int k = rowCount + (tableName == "daypart_table" ? 0 : 1);
                    rowCount++;
                    for (int j = 0; j < aspose_tbl.Columns.Count; j++)
                    {
                        if (!(j == textCol || j == valueCol || j == index1Col | j == index2Col))
                            continue;
                        aspose_tbl[j, k].FillFormat.FillType = Aspose.Slides.FillType.Solid;
                        aspose_tbl[j, k].FillFormat.SolidFillColor.Color = Color.White;

                        var query = (from r in tbl.AsEnumerable()
                                     where Convert.ToString(r.Field<object>(metricName)).Equals(metric, StringComparison.OrdinalIgnoreCase)
                                     select new
                                     {
                                         MetricPercentage = Convert.ToString(r.Field<object>("MetricPercentage")),
                                         CustomBaseIndex1 = r["CB1Index"] == DBNull.Value ? "NA" : r["CB1Index"].ToString(),
                                         CustomBaseIndex2 = r["CB2Index"] == DBNull.Value ? "NA" : r["CB2Index"].ToString(),
                                         MetricName = r["MetricName"].ToString(),
                                         CB1Sig = r["CB1Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB1Sig"]),
                                         CB2Sig = r["CB2Sig"] == DBNull.Value ? 0.0 : Convert.ToDouble(r["CB2Sig"])
                                     }).FirstOrDefault();
                        if (!double.TryParse(Convert.ToString(query.MetricPercentage), out metricPercentage)) metricPercentage = 0.0;
                        if (!double.TryParse(Convert.ToString(query.CB1Sig), out sign1)) sign1 = 0.0;
                        if (!double.TryParse(Convert.ToString(query.CB2Sig), out sign2)) sign2 = 0.0;
                        if (j == textCol)
                        {
                            aspose_tbl[j, k].TextFrame.Text = query.MetricName;
                        }
                        else if (j == valueCol)
                        {
                            aspose_tbl[j, k].TextFrame.Text = Convert.ToDouble(metricPercentage * 100).ToString("#0.0") + "%";
                            aspose_tbl[j, k].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                            aspose_tbl[j, k].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                        }
                        else if (j == index1Col)
                        {
                            aspose_tbl[j, k].TextFrame.Text = query.CustomBaseIndex1;
                            aspose_tbl[j, k].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                            aspose_tbl[j, k].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(sign1);
                        }
                        else if (j == index2Col)
                        {
                            aspose_tbl[j, k].TextFrame.Text = query.CustomBaseIndex2;
                            aspose_tbl[j, k].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                            aspose_tbl[j, k].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(sign2);
                        }

                    }
                }
            }
        }
        public void updateSARportBarChart(ISlide sld, System.Data.DataTable tbl, String chart_shape_name, string seriesName, string categoriesName, IGroupShape group, string SelectedColorCode)
        {
            AsposeChart.IChart chart;
            AsposeChart.IChartSeries Series;
            AsposeChart.IDataLabel lbl;

            List<string> objectivelist = null;
            List<string> metriclist = null;
            int defaultWorksheetIndex = 0;
            int serCount = 1;
            int catcount = 1;
            double metricPercentage = 0.0;

            chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == chart_shape_name).FirstOrDefault();

            if (chart == null && group != null)
                chart = (AsposeChart.IChart)group.Shapes.Where(x => x.Name == chart_shape_name).FirstOrDefault();

            //Getting the chart data worksheet
            AsposeChart.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;

            //Delete default generated series and categories
            chart.ChartData.Series.Clear();
            chart.ChartData.Categories.Clear();
            chart.ChartData.ChartDataWorkbook.Clear(0);

            int s = chart.ChartData.Series.Count;
            objectivelist = (from r in tbl.AsEnumerable() select Convert.ToString(r[seriesName])).Distinct().ToList();
            metriclist = (from r in tbl.AsEnumerable() select Convert.ToString(r[categoriesName])).Distinct().ToList();
            string parentName = (from r in tbl.AsEnumerable() select Convert.ToString(r["MetricParentName"])).FirstOrDefault();

            for (int i = 1; i < objectivelist.Count + 1; i++)
            {
                chart.ChartData.Series.Add(fact.GetCell(defaultWorksheetIndex, 0, i, objectivelist[i - 1]), chart.Type);
                chart.ChartData.Series[i - 1].ParentSeriesGroup.Overlap = -20;
            }
            chart.ChartData.Categories.Add(fact.GetCell(defaultWorksheetIndex, 0, 0, parentName));
            //Adding new categories
            for (int i = 0; i < metriclist.Count; i++)
            {
                //Setting Category Name
                chart.ChartData.Categories.Add(fact.GetCell(defaultWorksheetIndex, i + 1, 0, metriclist[i]));
            }

            foreach (string _objective in objectivelist)
            {
                Series = chart.ChartData.Series[serCount - 1];
                Series.Format.Fill.FillType = FillType.Solid;
                Series.Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(SelectedColorCode);

                foreach (string series in metriclist)
                {
                    var query = (from r in tbl.AsEnumerable()
                                 where Convert.ToString(r.Field<object>(seriesName)).Equals(_objective, StringComparison.OrdinalIgnoreCase)
                                 && Convert.ToString(r.Field<object>(categoriesName)).Equals(series, StringComparison.OrdinalIgnoreCase)
                                 select new
                                 {
                                     value = Convert.ToString(r.Field<object>("MetricPercentage")),
                                     sampleSize = double.Parse(Convert.ToString(r["MetricSamplesize"])),
                                 }).FirstOrDefault();

                    if (!double.TryParse(Convert.ToString(query.value), out metricPercentage)) metricPercentage = 0.0;
                    Series.DataPoints.AddDataPointForBarSeries(fact.GetCell(defaultWorksheetIndex, catcount, serCount, (!string.IsNullOrEmpty(Convert.ToString(query.value)) ? (metricPercentage) : 0)));
                    Series.Labels.DefaultDataLabelFormat.NumberFormat = "0.0%";
                    Series.DataPoints[catcount - 1].Value.AsCell.CustomNumberFormat = "0.0%";
                    //Set Data Point Label Style
                    lbl = Series.DataPoints[catcount - 1].Label;
                    //lbl.DataLabelFormat.Position = LegendDataLabelPosition.OutsideEnd;
                    lbl.DataLabelFormat.ShowValue = true;
                    lbl.Width = (float)15.5;
                    lbl.TextFormat.TextBlockFormat.WrapText = NullableBool.False;
                    lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                    lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.True;
                    lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                    lbl.DataLabelFormat.TextFormat.PortionFormat.FontHeight = (float)8.5;
                    lbl.DataLabelFormat.TextFormat.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                    lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;
                    catcount++;
                }
                catcount = 1;
                serCount++;
            }
        }
        private void updateCompetitorsTextAndValue(IGroupShape group, string CustomBaseName1, string CustomBaseName2, string CustomBaseIndex1, string CustomBaseIndex2, double CB1Sig, double CB2Sig, bool isUpdateIndex)
        {
            IAutoShape tempShape;
            int index1 = 0, index2 = 0;

            if (!int.TryParse(Convert.ToString(CustomBaseIndex1), out index1)) index1 = -999;
            if (!int.TryParse(Convert.ToString(CustomBaseIndex2), out index2)) index2 = -999;
            CustomBaseIndex1 = index1 == -999 ? "NA" : index1.ToString();
            CustomBaseIndex2 = index2 == -999 ? "NA" : index2.ToString();
            //custom base name 1
            tempShape = ((IAutoShape)group.Shapes.Where(x => x.Name == "custombase1_text").FirstOrDefault());
            tempShape.TextFrame.Text = tempShape.TextFrame.Text.Replace("_custombase1", CustomBaseName1);
            tempShape.TextFrame.Text = "Index v " + CustomBaseName1;

            //custom base index 1  
            if (isUpdateIndex)
            {
                tempShape = ((IAutoShape)group.Shapes.Where(x => x.Name == "custombase1_value").FirstOrDefault());
                tempShape.TextFrame.Text = CustomBaseIndex1.ToString();
                tempShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                tempShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(CB1Sig);
            }

            //custom base name 2
            tempShape = ((IAutoShape)group.Shapes.Where(x => x.Name == "custombase2_text").FirstOrDefault());
            tempShape.TextFrame.Text = tempShape.TextFrame.Text.Replace("_custombase2", CustomBaseName2);
            tempShape.TextFrame.Text = "Index v " + CustomBaseName2;
            //custom base index 2
            if (isUpdateIndex)
            {
                tempShape = ((IAutoShape)group.Shapes.Where(x => x.Name == "custombase2_value").FirstOrDefault());
                tempShape.TextFrame.Text = CustomBaseIndex2.ToString();
                tempShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                tempShape.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getSigcolor(CB2Sig);
            }
        }
        public void AddImage(float x, float y, float width, float height, ISlide cu_slide, Presentation pres, string loc, HttpContextBase context, int indx, int fact, string subPath, bool isDemog = false)
        {
            string pathToSvg = context.Server.MapPath(loc);
            double ratio = 1;
            double widthRatio = width / height;
            //Create a directory            
            bool exists = System.IO.Directory.Exists(context.Server.MapPath(subPath));
            if (!exists)
                System.IO.Directory.CreateDirectory(context.Server.MapPath(subPath));
            string tempPath = context.Server.MapPath(subPath + "/img" + indx + ".emf");

            if (System.IO.File.Exists(pathToSvg))
            {
                var xyz = SvgDocument.Open(pathToSvg);
                if (File.Exists(tempPath))
                {
                    File.Delete(tempPath);
                }
                var svgBounds = true;
                try
                {
                    var svgBounds1 = xyz.Bounds;
                }
                catch (Exception ex)
                {
                    svgBounds = false;
                }
                if (svgBounds)
                {
                    if (xyz.ViewBox.Width > xyz.ViewBox.Height)
                    {
                        ratio = xyz.ViewBox.Width / xyz.ViewBox.Height;
                        xyz.Height = (int)((4 * ratio) * xyz.Bounds.Height);
                        xyz.Width = (int)((4 * widthRatio) * xyz.Bounds.Width);
                    }
                    else
                    {
                        if (xyz.ViewBox.Width < xyz.ViewBox.Height)
                        {
                            ratio = xyz.ViewBox.Height / xyz.ViewBox.Width;
                            xyz.Width = (int)((4 * ratio * widthRatio) * xyz.Bounds.Width);
                            xyz.Height = 4 * xyz.Bounds.Height;
                        }
                        else
                        {
                            xyz.Height = 4 * xyz.Bounds.Height;
                            xyz.Width = (int)((4 * widthRatio) * xyz.Bounds.Width);
                        }

                    }
                }
                xyz.Draw().Save(tempPath, System.Drawing.Imaging.ImageFormat.Emf);
                using (Image img = Image.FromFile(tempPath, true))
                {
                    IPPImage imgx = pres.Images.AddImage(img);
                    cu_slide.Shapes.AddPictureFrame(ShapeType.Rectangle, x, y, width, height, imgx);
                    //cu_Slide.Shapes.AddPictureFrame(ShapeType.Rectangle, x, y, width, height, imgx);
                }
            }

        }
        public void imageReplace(PictureFrame tempImg, string loc, HttpContextBase context, int indx, int fact, string subPath, bool isDemog = false)
        {
            string pathToSvg = context.Server.MapPath(loc);
            double ratio = 1;
            double widthRatio = tempImg.Width / tempImg.Height;
            //Create a directory            
            bool exists = System.IO.Directory.Exists(context.Server.MapPath(subPath));
            if (!exists)
                System.IO.Directory.CreateDirectory(context.Server.MapPath(subPath));
            string tempPath = context.Server.MapPath(subPath + "/img" + indx + ".emf");
            if (System.IO.File.Exists(pathToSvg))
            {
                var xyz = SvgDocument.Open(pathToSvg);
                if (File.Exists(tempPath))
                {
                    File.Delete(tempPath);
                }
                var svgBounds = true;
                try
                {
                    var svgBounds1 = xyz.Bounds;
                }
                catch (Exception ex)
                {
                    svgBounds = false;
                }
                if (svgBounds)
                {
                    if (xyz.ViewBox.Width > xyz.ViewBox.Height)
                    {
                        ratio = xyz.ViewBox.Width / xyz.ViewBox.Height;
                        xyz.Height = (int)((4 * ratio) * xyz.Bounds.Height);
                        xyz.Width = (int)((4 * widthRatio) * xyz.Bounds.Width);
                    }
                    else
                    {
                        if (xyz.ViewBox.Width < xyz.ViewBox.Height)
                        {
                            ratio = xyz.ViewBox.Height / xyz.ViewBox.Width;
                            xyz.Width = (int)((4 * ratio * widthRatio) * xyz.Bounds.Width);
                            xyz.Height = 4 * xyz.Bounds.Height;
                        }
                        else
                        {
                            xyz.Height = 4 * xyz.Bounds.Height;
                            xyz.Width = (int)((4 * widthRatio) * xyz.Bounds.Width);
                        }

                    }

                }
                xyz.Draw().Save(tempPath, System.Drawing.Imaging.ImageFormat.Emf);
                using (Image img = Image.FromFile(tempPath, true))
                {
                    tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                }
            }
            else
            {
                //Remove the Image holder
                tempImg.Hidden = true;
            }
        }
        public double getDynamicTablePositionX(int metricId, string selectedMetric)
        {
            double tblpostn = 0.0;
            switch (selectedMetric)
            {
                #region demog
                case "age":
                    {
                        if (metricId == 1)
                            tblpostn = 328.85;
                    }
                    break;
                case "ethnicity":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                    }
                    break;
                case "hh_size":
                    {
                        if (metricId == 3)
                            tblpostn = 159.85;
                        else if (metricId == 4)
                            tblpostn = 317.85;
                        else if (metricId == 5)
                            tblpostn = 619.85;

                    }
                    break;
                case "marital_status":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 328.85;
                        else if (metricId == 5)
                            tblpostn = 634.85;

                    }
                    break;
                case "hh_income":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;

                    }
                    break;
                case "employement_status":
                    {
                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 330.85;
                        else if (metricId == 5)
                            tblpostn = 640.85;

                    }
                    break;
                case "education":
                    {
                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 330.85;
                        else if (metricId == 5)
                            tblpostn = 639.85;

                    }
                    break;
                case "socio_economic":
                    {
                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 317.85;
                        else if (metricId == 5)
                            tblpostn = 758.85;

                    }
                    break;

                #endregion

                #region Trips

                case "day_of_week":
                    {
                        if (metricId == 1)
                            tblpostn = 328.85;
                    }
                    break;
                case "location_prior":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                    }
                    break;
                case "trip_purpose":
                    {
                        if (metricId == 3)
                            tblpostn = 159.85;
                        else if (metricId == 4)
                            tblpostn = 317.85;
                        else if (metricId == 5)
                            tblpostn = 619.85;
                    }
                    break;
                case "considered_another_establishment":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 328.85;
                        else if (metricId == 5)
                            tblpostn = 634.85;
                    }
                    break;
                case "other_places_considered":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "planning_type":
                    {
                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 330.85;
                        else if (metricId == 5)
                            tblpostn = 640.85;
                    }
                    break;
                case "decision_location":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "decision_made_with_time_left_before_arrival":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "main_decision_maker":
                    {
                        if (metricId == 1)
                            tblpostn = 332.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "decision_makers":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "distance_travelled":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;

                case "mode_of_transportation":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "mode_of_reservation":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "mode_of_doing_online_booking":
                    {
                        if (metricId == 1)
                            tblpostn = 327.85;
                        else if (metricId == 2)
                            tblpostn = 645.85;
                        else if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 329.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "use_of_online_review_or_social_media_sites":
                    {

                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 317.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "online_review_or_social_media_sites":
                    {
                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 326.85;
                        else if (metricId == 5)
                            tblpostn = 645.85;
                    }
                    break;
                case "trip_activities":
                    {
                        if (metricId == 3)
                            tblpostn = 10.85;
                        else if (metricId == 4)
                            tblpostn = 317.85;
                    }
                    break;

                    #endregion
            }
            return tblpostn;
        }
        public double getDynamicTablePositionY(int metricId, string selectedMetric)
        {
            double tblpostn = 0.0;
            switch (selectedMetric)
            {
                #region demog
                case "hh_size":
                    tblpostn = 331.85;
                    break;
                case "marital_status":
                    tblpostn = 330.85;
                    break;
                case "hh_income":
                    tblpostn = 358.85;
                    break;
                case "employement_status":
                    tblpostn = 336.85;
                    break;
                case "education":
                    tblpostn = 329.85;
                    break;
                case "socio_economic":
                    tblpostn = 325.85;
                    break;
                #endregion

                #region

                case "day_of_week":
                    tblpostn = 358.85;
                    break;
                case "location_prior":
                    tblpostn = 358.85;
                    break;
                case "trip_purpose":
                    tblpostn = 358.85;
                    break;
                case "considered_another_establishment":
                    tblpostn = 336.85;
                    break;
                case "other_places_considered":
                    tblpostn = 329.85;
                    break;
                case "planning_type":
                    tblpostn = 325.85;
                    break;

                case "decision_location":
                    tblpostn = 331.85;
                    break;
                case "decision_made_with_time_left_before_arrival":
                    tblpostn = 331.85;
                    break;
                case "main_decision_maker":
                    tblpostn = 348.85;
                    break;
                case "decision_makers":
                    tblpostn = 351.85;
                    break;
                case "distance_travelled":
                    tblpostn = 337.85;
                    break;
                case "mode_of_transportation":
                    tblpostn = 356.85;
                    break;
                case "mode_of_reservation":
                    tblpostn = 351.85;
                    break;
                case "mode_of_doing_online_booking":
                    tblpostn = 337.85;
                    break;
                case "use_of_online_review_or_social_media_sites":
                    tblpostn = 337.85;
                    break;
                case "online_review_or_social_media_sites":
                    tblpostn = 353.85;
                    break;
                case "trip_activities":
                    tblpostn = 337.85;
                    break;
                    #endregion

            }
            return tblpostn;
        }


        public double getDynamicWidzetPositionX(int metricId, string selectedMetric)
        {
            double tblpostn = 0.0;
            switch (selectedMetric)
            {
                #region

                case "location_prior":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    break;
                case "trip_purpose":
                    if (metricId == 1)
                        tblpostn = 262.85;// 275.85;
                    else if (metricId == 2)
                        tblpostn = 580.85;
                    break;
                case "considered_another_establishment":
                    if (metricId == 1)
                        tblpostn = 291.85;//328.85;
                    else if (metricId == 2)
                        tblpostn = 609.85;// 645.85;
                    else if (metricId == 3)
                        tblpostn = -26.10;//10.10
                    else if (metricId == 4)
                        tblpostn = 291.85;
                    else if (metricId == 5)
                        tblpostn = 638.85;
                    break;
                case "other_places_considered":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 638.85;
                    break;
                case "planning_type":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 638.85;
                    break;

                case "decision_location":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 638.85;
                    break;
                case "decision_made_with_time_left_before_arrival":
                    if (metricId == 1)
                        tblpostn = 322.85;
                    else if (metricId == 2)
                        tblpostn = 640.85;//645.85;
                    else if (metricId == 3)
                        tblpostn = 6.10;//10.10;
                    else if (metricId == 4)
                        tblpostn = 323.85;//328.85;
                    else if (metricId == 5)
                        tblpostn = 638.85;
                    break;
                case "main_decision_maker":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 327.85;//328.85;
                    else if (metricId == 5)
                        tblpostn = 644.85;//638.85;
                    break;
                case "decision_makers":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 644.85;//638.85;
                    break;
                case "distance_travelled":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 6.10;
                    else if (metricId == 4)
                        tblpostn = 324.85;//328.85;
                    else if (metricId == 5)
                        tblpostn = 640.85;//638.85;
                    break;

                case "mode_of_transportation":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 327.85;
                    else if (metricId == 5)
                        tblpostn = 642.85;//638.85;
                    break;
                case "mode_of_reservation":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 644.85;
                    break;
                case "mode_of_doing_online_booking":
                    if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 331.85;
                    else if (metricId == 5)
                        tblpostn = 645.85;
                    break;
                case "use_of_online_review_or_social_media_sites":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 645.85;
                    break;
                case "online_review_or_social_media_sites":
                    if (metricId == 1)
                        tblpostn = 328.85;
                    else if (metricId == 2)
                        tblpostn = 645.85;
                    else if (metricId == 3)
                        tblpostn = 10.10;
                    else if (metricId == 4)
                        tblpostn = 328.85;
                    else if (metricId == 5)
                        tblpostn = 645.85;
                    break;
                case "trip_activities":
                    if (metricId == 5)
                        tblpostn = 645.85;// 638.85;
                    break;
                    #endregion

            }
            return tblpostn;
        }
        public void updateSARportHeaderColor(IGroupShape group, String chart_shape_name, string selectedColorCode, String label_name)
        {
            AsposeChart.IChart chart;
            AsposeChart.IChartSeries Series; IConnector textShape;
            chart = (AsposeChart.IChart)group.Shapes.Where(x => x.Name == chart_shape_name).FirstOrDefault();
            Series = chart.ChartData.Series[0];
            Series.Format.Fill.FillType = FillType.Solid;
            Series.Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);

            if (!string.IsNullOrEmpty(label_name))
            {
                textShape = (IConnector)group.Shapes.Where(x => x.Name == label_name).FirstOrDefault();
                textShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            }

        }
        public void updateSARportHeaderConnectorColor(ISlide sld, String shape_name, string selectedColorCode, string lineType)
        {
            IConnector connectorShape;
            if (!string.IsNullOrEmpty(shape_name))
            {
                connectorShape = (IConnector)sld.Shapes.Where(x => x.Name == shape_name).FirstOrDefault();
                if (lineType == "Gradient")
                {
                    connectorShape.LineFormat.FillFormat.FillType = FillType.Gradient;
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.RemoveAt(2);
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.RemoveAt(1);
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.Add(0, ColorTranslator.FromHtml(selectedColorCode));
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.Add(1, ColorTranslator.FromHtml(selectedColorCode));
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                }
                else
                {
                    connectorShape.LineFormat.FillFormat.FillType = FillType.Solid;
                    //connectorShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
                }
                connectorShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            }
        }

        public void setStrengthWeekPosition(ISlide sld)
        {

            AsposeChart.IChart chart;
            chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
            float markValue = chart.Width / rangeValue;
            float devatnNegative = (rangeValue / 2) - deviationValue;
            float devatnPostive = (rangeValue + deviationValue + deviationValue) / 2;
            IConnector connectorShape = (IConnector)cur_Slide.Shapes.Where(x => x.Name == "weekness").FirstOrDefault();
            connectorShape.X = chart.X + 22 + markValue * devatnNegative;
            connectorShape = (IConnector)cur_Slide.Shapes.Where(x => x.Name == "strength").FirstOrDefault();
            connectorShape.X = chart.X + markValue * devatnPostive;

        }
        public void updateSARportHeaderConnectorColorGrp(IGroupShape sld, String shape_name, string selectedColorCode, string lineType)
        {
            IConnector connectorShape;
            if (!string.IsNullOrEmpty(shape_name))
            {
                connectorShape = (IConnector)sld.Shapes.Where(x => x.Name == shape_name).FirstOrDefault();
                if (lineType == "Gradient")
                {
                    connectorShape.LineFormat.FillFormat.FillType = FillType.Gradient;
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.RemoveAt(2);
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.RemoveAt(1);
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.Add(0, ColorTranslator.FromHtml(selectedColorCode));
                    connectorShape.LineFormat.FillFormat.GradientFormat.GradientStops.Add(1, ColorTranslator.FromHtml(selectedColorCode));

                }
                else
                { connectorShape.LineFormat.FillFormat.FillType = FillType.Solid; }

                connectorShape.LineFormat.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
            }
        }

        public string removeBlankSpace(string inputText)
        {
            if (string.IsNullOrEmpty(inputText))
                return "";
            inputText = inputText.Trim();
            var outputText = Regex.Replace(inputText, @"[- &:,0-9]", "_");
            outputText = Regex.Replace(outputText, @"[/()%.|'+~!@#$?=]", "");
            return outputText.ToLower();
        }

        public int? stringToInt(string inputText)
        {
            int outputValue = 0;
            if (!int.TryParse(inputText, out outputValue)) outputValue = 0;
            return outputValue;
        }
        public double? stringToDouble(string inputText)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return outputValue;
        }

        public double twoDecimals(double? inputText)
        {
            double outputValue = 0.0;
            outputValue = Convert.ToDouble(Convert.ToDouble(inputText * 100).ToString("0.0"));
            return outputValue;
        }
        //For Pyramid Chart
        public void UpdatePyramidSeriesDataSAR(System.Data.DataTable dt, int dp_index, int series_ind, int pyramid_Bars_ind, string selectedColorCode)
        {
            int defaultIndex = 0;
            List<string> ser = dt.AsEnumerable().Select(x => x.Field<string>("Metricname")).Distinct().ToList();
            series_ind = 1; dp_index = 1;
            int pyramid_ind = 1;
            foreach (var item in ser)
            {
                if (pyramid_ind == 3)
                    break;

                chart_to_change_dataLabelColors = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == "pyramid_" + pyramid_ind).FirstOrDefault();

                //Set length of Vetical Axis
                chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
                chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMinValue = false;
                chart_to_change_dataLabelColors.Axes.HorizontalAxis.MinValue = 0;
                //chart_to_change_dataLabelColors.Axes.HorizontalAxis.MaxValue = ser.Count + (ser.Count - 1) * 0.05;
                chart_to_change_dataLabelColors.Axes.HorizontalAxis.NumberFormat = @"##0%";
                AsposeChart.IChartDataWorkbook fact = chart_to_change_dataLabelColors.ChartData.ChartDataWorkbook;
                //Add Series

                List<string> xCol = dt.AsEnumerable().Select(x => x.Field<string>("Metricname")).Distinct().ToList();

                //fact.GetCell(defaultIndex, 0, 1 + dp_index, item);
                series_ind = 1;

                //Update the color

                chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.FillType = FillType.Solid;
                if (pyramid_ind == 1)
                    chart_to_change_dataLabelColors.ChartData.Series[dp_index].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
                series_ind = pyramid_Bars_ind;
                foreach (var x in xCol)
                {
                    if (dp_index == 1)
                    {
                        fact.GetCell(defaultIndex, series_ind, 0, x);
                    }
                    var val = dt.AsEnumerable().Where(y => y.Field<string>("Metricname") == x).FirstOrDefault();
                    double mv = 0.0;
                    if (pyramid_ind == 2)
                        mv = val["CompPercentage"] == DBNull.Value ? 0 : Convert.ToDouble(val["CompPercentage"]);
                    else
                        mv = val["MetricPercentage"] == DBNull.Value ? 0 : Convert.ToDouble(val["MetricPercentage"]);
                    fact.GetCell(defaultIndex, series_ind, 1 + dp_index, mv);
                    fact.GetCell(defaultIndex, series_ind, dp_index, (1 - mv) / 2);
                    fact.GetCell(defaultIndex, series_ind, 2 + dp_index, (1 - mv) / 2);

                    if (pyramid_ind == 1) chart_to_change_dataLabelColors.ChartData.Series[1].Name.AsCells[0].Value = val["EstablishmentName"];
                    //Set the labels
                    chart_to_change_dataLabelColors.ChartData.Series[dp_index].DataPoints[series_ind - 1].Label.DataLabelFormat.NumberFormat = "#0%";
                    chart_to_change_dataLabelColors.ChartData.Series[dp_index].DataPoints[series_ind - 1].Label.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                    if (pyramid_ind == 2) chart_to_change_dataLabelColors.ChartData.Series[dp_index].DataPoints[series_ind - 1].Label.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = (val["CompSig"] == DBNull.Value) ? Color.Black : getSigcolorNormal(Convert.ToDouble(val["CompSig"]));//getSigcolor(Convert.ToDouble(val["CompSig"]));
                    series_ind--;
                }
                //dp_index = dp_index + 4;
                //pyramid_ind++;
                pyramid_ind++;
            }
        }
        public void updatePyamidCurveColor(IGroupShape group, string selectedColorCode)
        {
            IAutoShape tempShape;
            for (int i = 1; i <= group.Shapes.Count(); i++)
            {
                tempShape = ((IAutoShape)group.Shapes.Where(x => x.Name == "curve_" + i).FirstOrDefault());
                tempShape.FillFormat.FillType = FillType.Solid;
                tempShape.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);

            }
        }

        public void updateStackChart(ISlide sld, DataTable tble, string selectedColorCode)
        {
            AsposeChart.IChart chart;
            AsposeChart.IChartSeries Series;
            AsposeChart.IDataLabel lbl;
            double metricPercentage = 0.0, sign = 0.0;
            double xAxis_fact = 1, xAxis_fact1 = 1, additionalFact = 0.2;
            int serCount = 1;

            for (int i = 1; i < 3; i++)
            {
                chart = (AsposeChart.IChart)cur_Slide.Shapes.Where(x => x.Name == "stackchart" + i).FirstOrDefault();
                serCount = 0;
                for (int j = 4; j >= 1; j--)
                {
                    //Getting the chart data worksheet 
                    dynamic query = (from r in tble.AsEnumerable()
                                        where Convert.ToString(r.Field<object>("MetricGroupId")).Equals(Convert.ToString(j), StringComparison.OrdinalIgnoreCase)
                                        select new
                                        {
                                            value = Convert.ToString(r.Field<object>("MetricPercentage")),
                                            sign1 = Convert.ToString(r.Field<object>("CompSig"))
                                        }).ToList();
                    if (query[0].value != "")
                        xAxis_fact = (Convert.ToDouble(tble.Compute("max([MetricPercentage])", string.Empty))) * 100;
                    xAxis_fact1 = (Convert.ToDouble(tble.Compute("max([CompPercentage])", string.Empty))) * 100;
                    if (xAxis_fact1 > xAxis_fact)
                        xAxis_fact = xAxis_fact1;

                    xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                    if (i == 2)
                    {
                        query = (from r in tble.AsEnumerable()
                                    where Convert.ToString(r.Field<object>("MetricGroupId")).Equals(Convert.ToString(j), StringComparison.OrdinalIgnoreCase)
                                    select new
                                    {
                                        value = Convert.ToString(r.Field<object>("CompPercentage")),
                                        sign1 = Convert.ToString(r.Field<object>("CompSig")),
                                    }).ToList();
                    }

                    for (int k = 0; k < query.Count; k++)
                    {
                        if (!double.TryParse(Convert.ToString(query[k].value), out metricPercentage)) metricPercentage = 0.0;
                        if (!double.TryParse(Convert.ToString(query[k].sign1), out sign)) sign = 0.0;
                           
                        chart.ChartData.Series[serCount].DataPoints[k].Value.Data = metricPercentage;

                        Series = chart.ChartData.Series[serCount];

                        if (serCount == 0)
                        {
                            Series.Format.Fill.FillType = FillType.Solid;
                            Series.Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
                        }

                        lbl = chart.ChartData.Series[serCount].DataPoints[k].Label;
                        lbl.DataLabelFormat.ShowValue = true;
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                        lbl.DataLabelFormat.Format.Fill.FillType = FillType.Solid;
                        lbl.DataLabelFormat.Format.Fill.SolidFillColor.Color = Color.White;
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.True;
                        if (i == 2) lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = getSigcolorNormal(sign);
                        lbl.DataLabelFormat.TextFormat.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;

                    }
                    serCount++;
                }
            }
        }
        public void updateBarChartTwo(ISlide sld, DataTable tble, string selectedColorCode)
        {
            AsposeChart.IChart chart;
            AsposeChart.IChartSeries Series;
            AsposeChart.IDataLabel lbl;
            IGroupShape tempGroup;
            double metricPercentage = 0.0, sign = 0.0;
            double xAxis_fact = 1, xAxis_fact1 = 1, additionalFact = 0.2;
            int serCount = 1;

            for (int i = 1; i < 3; i++)
            {
                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "barchart_" + i).FirstOrDefault();
                serCount = 0;
                for (int j = 1; j <= tempGroup.Shapes.Count(); j++)
                {
                    chart = (AsposeChart.IChart)tempGroup.Shapes.Where(x => x.Name == "chart_" + j).FirstOrDefault();

                    //Getting the chart data worksheet
                    AsposeChart.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;

                    dynamic query = (from r in tble.AsEnumerable()
                                     where Convert.ToString(r.Field<object>("MetricGroupId")).Equals(Convert.ToString(j), StringComparison.OrdinalIgnoreCase)
                                     select new
                                     {
                                         value = Convert.ToString(r.Field<object>("MetricPercentage")),
                                         sign1 = Convert.ToString(r.Field<object>("CompSig"))
                                     }).ToList();
                    if (query[0].value != "")
                        xAxis_fact = (Convert.ToDouble(tble.Compute("max([MetricPercentage])", string.Empty))) * 100;
                    xAxis_fact1 = (Convert.ToDouble(tble.Compute("max([CompPercentage])", string.Empty))) * 100;
                    if (xAxis_fact1 > xAxis_fact)
                        xAxis_fact = xAxis_fact1;

                    xAxis_fact = xAxis_fact % 10 == 0 ? (xAxis_fact / 100) + additionalFact : (Math.Ceiling(xAxis_fact / 10)) / 10;
                    if (i == 2)
                    {
                        query = (from r in tble.AsEnumerable()
                                 where Convert.ToString(r.Field<object>("MetricGroupId")).Equals(Convert.ToString(j), StringComparison.OrdinalIgnoreCase)
                                 select new
                                 {
                                     value = Convert.ToString(r.Field<object>("CompPercentage")),
                                     sign1 = Convert.ToString(r.Field<object>("CompSig")),
                                 }).ToList();
                    }

                    chart.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
                    chart.Axes.HorizontalAxis.IsAutomaticMinValue = false;
                    chart.Axes.HorizontalAxis.MaxValue = xAxis_fact;
                    chart.Axes.HorizontalAxis.MinValue = 0;

                    for (int k = 0; k < query.Count; k++)
                    {
                        if (!double.TryParse(Convert.ToString(query[k].value), out metricPercentage)) metricPercentage = 0.0;
                        if (!double.TryParse(Convert.ToString(query[k].sign1), out sign)) sign = 0.0;

                        chart.ChartData.Series[0].DataPoints[k].Value.Data = metricPercentage;
                        if (i == 1) chart.ChartData.Series[0].Name.AsCells[0].Value = Convert.ToString(tble.Rows[0]["EstablishmentName"]);


                        Series = chart.ChartData.Series[0];

                        if (k == 0)
                        {
                            Series.DataPoints[k].Format.Fill.FillType = FillType.Solid;
                            Series.DataPoints[k].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(selectedColorCode);
                        }

                        lbl = chart.ChartData.Series[0].DataPoints[k].Label;
                        lbl.DataLabelFormat.ShowValue = true;
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.True;
                        if (i == 2) lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = getSigcolorNormal(sign);
                        lbl.DataLabelFormat.TextFormat.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;
                        serCount++;

                    }
                }
            }
        }
        public void updatePyramidGap(ISlide sld, DataTable tbl)
        {
            List<string> metricPecentgelist = (from r in tbl.AsEnumerable() select Convert.ToString(r["MetricPercentage"])).Distinct().ToList();
            IGroupShape tempGroup;
            double mvnumertor = 0.0, mvdenomitor = 0.0, result = 0.0;
            IAutoShape tempShape = null;
            int n = 0;
            for (int k = 1; k < 3; k++)
            {
                if (k == 2)
                    metricPecentgelist = (from r in tbl.AsEnumerable() select Convert.ToString(r["CompPercentage"])).Distinct().ToList();
                else
                    metricPecentgelist = (from r in tbl.AsEnumerable() select Convert.ToString(r["MetricPercentage"])).Distinct().ToList();

                tempGroup = (IGroupShape)cur_Slide.Shapes.Where(x => x.Name == "pymaridgrpgap_" + k).FirstOrDefault();
                for (int m = 0; m < (metricPecentgelist.Count() - 1); m++)
                {
                    if (!double.TryParse(Convert.ToString(metricPecentgelist[m]), out mvnumertor)) mvnumertor = 0.0;
                    if (!double.TryParse(Convert.ToString(metricPecentgelist[m + 1]), out mvdenomitor)) mvdenomitor = 0.0;

                    if (mvdenomitor == 0.0)
                    { }
                    else
                    {
                        mvnumertor = Convert.ToDouble((mvnumertor * 100).ToString("0.0"));
                        mvdenomitor = Convert.ToDouble((mvdenomitor * 100).ToString("0.0"));
                        result = Convert.ToDouble(((mvnumertor / mvdenomitor) * 100).ToString("#0.0"));
                    }
                    //mvnumertor = metricPecentgelist[m])
                    tempShape = ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "gap_" + m).FirstOrDefault());
                    tempShape.TextFrame.Text = Convert.ToString(result.ToString("#0.0")) + "%";

                }

                if (metricPecentgelist.Count() == 1)
                {
                    for (int j = 0; j < 3; j++)
                    {
                        //mvnumertor = metricPecentgelist[m])
                        tempShape = ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "gap_" + j).FirstOrDefault());
                        tempShape.TextFrame.Text = "0.0%";
                    }
                }
            }


        }
        public int setIsVisitsorGuestsId(int selectedcheckboxTopFiltersId, int isVisits)
        {
            int id = 0;
            if (selectedcheckboxTopFiltersId == 1 && isVisits == 1)
            {
                id = 1;
            }
            else
            {
                switch (selectedcheckboxTopFiltersId)
                {
                    case 0:
                    case 1:
                    case 5:
                    case 8:
                    case 9:
                        id = 0;
                        break;

                    case 2:
                    case 3:
                    case 4:
                    case 6:
                    case 7:
                        id = 1;
                        break;
                }
            }
            return id;
        }
        public FilterPanelInfo[] filtModifications(FilterPanelInfo[] filter, string spName, List<SituationAnalysisSelectList> selectionList, int spIncrmt)
        {
            foreach (FilterPanelInfo fil in filter)
            {
                //if (selectionList[0].SelectedmeasureId != selectionList[0].SubMeasureList[spIncrmt])//(selectionList[0].SubMeasureList)
                //{
                if (fil.Name == "FREQUENCY")
                    ((string[])fil.SelectedID)[0] = selectionList[0].DefaultFrequencyList[spIncrmt];//setFrequencyBYdefault();
                else if (fil.Name == "IsVisit")
                    ((string[])fil.SelectedID)[0] = selectionList[0].DefualtIsVisitGuestList[spIncrmt];
                //}
            }
            return filter;
        }
        public Color getSigcolor(double? cbsig)
        {
            if (cbsig == 0.0) return Color.Black;
            if (cbsig < -1.96) return Color.Green;
            if (cbsig > 1.96) return Color.Red;
            return Color.Black;
        }
        public Color getSigcolorNormal(double? cbsig)
        {
            if (cbsig == 0.0) return Color.Black;
            if (cbsig < -1.96) return Color.Red;
            if (cbsig > 1.96) return Color.Green;
            return Color.Black;
        }

        public double getNearestValue(double val, bool isVertical, bool isMaxVal)
        {

            double reslt = 0.0;
            double valcoeff = 0;

            if (val > 0 && isMaxVal)
            {
                if (isVertical)
                {
                    if (val % 10 == 0)

                    {
                        valcoeff = (Math.Floor(val / 10)) * 10;
                    }
                    else
                    {
                        valcoeff = ((Math.Floor(val / 10)) * 10) + 10;
                    }

                }
                else
                {
                    double Xaxisval=0;
                    if(val<deviationValue)
                    {
                        Xaxisval = deviationValue;
                    }
                    else
                        Xaxisval = val;
                    if (Xaxisval % 5 == 0)

                    {
                        valcoeff = (Math.Floor(Xaxisval / 5)) * 5;
                    }
                    else
                    {
                        valcoeff = ((Math.Floor(Xaxisval / 5)) * 5)+5;
                    }
                }


                reslt = valcoeff;
            }
            else
            {


                if (isVertical)
                {

                    if (val % 10 == 0)
                    {
                        valcoeff = (Math.Floor(Math.Abs(val) / 10)) * 10;
                    }
                    else
                    {
                        valcoeff = Math.Abs((Math.Floor(Math.Abs(val) / 10)) * 10);
                    }
                    reslt = valcoeff ;
                }
                else
                {


                    double XaxisMinval = 0;
                    if (val > (-deviationValue))
                    {
                        XaxisMinval = deviationValue;
                    }
                    else
                        XaxisMinval = val;
                    if (val % 5 == 0)
                    {
                        valcoeff = (Math.Floor(Math.Abs(XaxisMinval) / 5)) * 5;
                    }
                    else
                    {
                        valcoeff = ((Math.Floor(Math.Abs(XaxisMinval) / 5)) * 5) + 5;
                    }
                    reslt = -valcoeff;
                }
            }

            return reslt;
        }


        //public double getNearestValue(double val, bool isVertical, bool isMaxVal)
        //{

        //    double reslt = 0.0;
        //    double valcoeff = 0;

        //        if (val > 0 && isMaxVal)
        //        {

        //            if (val % 5 == 0)
        //            {
        //                valcoeff=(Math.Floor(val / 5)) * 5;
        //            }
        //            else
        //            {
        //                valcoeff =(( Math.Floor(val / 5)) * 5) + 5;
        //            }


        //            reslt = valcoeff + 10;
        //        }
        //        else
        //        {


        //        if (isVertical)
        //        {

        //            if (val % 5 == 0)
        //            {
        //                valcoeff = (Math.Floor(Math.Abs(val) / 5)) * 5;
        //            }
        //            else
        //            {
        //                valcoeff = Math.Abs((Math.Floor(Math.Abs(val) / 5)) * 5) - 5 + 5;
        //            }
        //            reslt = valcoeff - 10;
        //        }
        //        else
        //        {

        //            if (val % 5 == 0)
        //            {
        //                valcoeff = (Math.Floor(Math.Abs(val) / 5)) * 5;
        //            }
        //            else
        //            {
        //                valcoeff = ((Math.Floor(Math.Abs(val) / 5)) * 5) + 5;
        //            }
        //            reslt = -valcoeff - 10;
        //        }
        //    }

        //    return reslt;
        //}
        //public double getNearestValue(double val, bool isVertical, bool isMaxVal)
        //{
        //    double reslt = 0.0;
        //    double valcoeff = 0;
        //    if (isVertical && val > 0 && isMaxVal)
        //    {
        //        if (0 == (val % 5))
        //            valcoeff = val + 5;
        //        else
        //        {
        //            valcoeff = Math.Round(val / 5) * 5;
        //            if (valcoeff < val)
        //                valcoeff = valcoeff + 5;
        //        }
        //        reslt = valcoeff;
        //    }
        //    else
        //    {
        //        if (val > 0 && isMaxVal)
        //        {
        //            if (0 == (val % 10))
        //                valcoeff = val + 10;
        //            else
        //                valcoeff = Math.Round(val / 10) * 10;
        //            reslt = valcoeff;
        //        }
        //        else
        //        {
        //            if (0 == (val % 10))
        //                valcoeff = val + 10;
        //            else
        //                valcoeff = Math.Round(val / 10) * 10;
        //            reslt = valcoeff;
        //        }
        //    }
        //    return reslt;
        //}
        public void updateNotesSection(ISlide sld, string selectedEstName, string filters, string timePeriod, string sampleSizeText, string ReadasText)
        {
            int index = -1;
            string title = "Read As : ";
            
            if (sampleSizeText != null)
            {
                index = sampleSizeText.IndexOf("|");
                sampleSizeText = sampleSizeText.Replace("&amp;", "&");


            }
            if (ReadasText == "")
            {
                title = "";
            }

            if (index != -1)
            {
                if (sld.SlideNumber == 11)
                {
                    string[] sampleText = sampleSizeText.Split(new char[] { '|' });
                    string filts = filters == "NONE" ? "None" : filters;
                    //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
                    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = title + ReadasText + "\n\n" + timePeriod + "\n\n" + "Sample Size –" + sampleSizeText + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts + "\n" + "0% in the high level pie chart indicates the channel may not be applicable for the selection";
                }
                else if (sld.SlideNumber == 29)
                {
                    string filts = filters == "NONE" ? "None" : filters;
                    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = title + ReadasText + "\n\n" + timePeriod + "\n\n" + "Filters – " + filts;
                }
                else
                {
                    string[] sampleText = sampleSizeText.Split(new char[] { '|' });
                    string filts = filters == "NONE" ? "None" : filters;
                    //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
                    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = title + ReadasText + "\n\n" + timePeriod + "\n\n" + "Sample Size (Yearly+) –" + sampleText[0] + "\n\n" + "Sample Size (Visits) –" + sampleText[1] + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;
                }
            }
            else
            {
                if (sld.SlideNumber == 11)
                {
                    string[] sampleText = sampleSizeText.Split(new char[] { '|' });
                    string filts = filters == "NONE" ? "None" : filters;
                    //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
                    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = title + ReadasText + "\n\n" + timePeriod + "\n\n" + "Sample Size –" + sampleSizeText + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts + "\n" + "0% in the high-level pie chart indicates the channel may not be applicable for the selection";
                }
                else if (sld.SlideNumber == 29)
                {
                    string filts = filters == "NONE" ? "None" : filters;
                    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = title + ReadasText + "\n\n" + timePeriod + "\n\n" + "Filters – " + filts;
                }
                else
                {
                    string filts = filters == "NONE" ? "None" : filters;
                    //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
                    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = title + ReadasText + "\n\n" + timePeriod + "\n\n" + "Sample Size –" + sampleSizeText + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;
                }
            }
            //string filts = filters == "NONE" ? "None" : filters;
            ////sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
            //((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text ="TimePeriod: "+ timePeriod.ToUpper()+"\n\n"+ "Sample Size –"+sampleSizeText+"\n\n" +"Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;

        }

        //sabat
        //public void updateNotesSection(ISlide sld, string selectedEstName, string filters, string timePeriod, string sampleSizeText)
        //{
        //    int index = -1;

        //    index = sampleSizeText.IndexOf("|");
        //    if (sampleSizeText != null)
        //    {
        //        sampleSizeText = sampleSizeText.Replace("&amp;", "&");


        //    }


        //    if (index != -1)
        //    {
        //        string[] sampleText = sampleSizeText.Split(new char[] { '|' });
        //        string filts = filters == "NONE" ? "None" : filters;
        //        if (sld.SlideNumber == 29)
        //        {

        //            ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = timePeriod + "\n\n"  + "Filters – " + filts;
        //        }
        //        else
        //        {
        //            //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
        //            ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = timePeriod + "\n\n" + "Sample Size (Yearly+) –" + sampleText[0] + "\n\n" + "Sample Size (Visits) –" + sampleText[1] + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;
        //        }
        //    }
        //    else
        //    {
        //        string filts = filters == "NONE" ? "None" : filters;
        //        if (sld.SlideNumber == 29)
        //        {

        //            ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = timePeriod + "\n\n" + "Filters – " + filts;
        //        }
        //        else
        //        {
        //            //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
        //            ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = timePeriod + "\n\n" + "Sample Size –" + sampleSizeText + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;
        //        }
        //    }
        //    //string filts = filters == "NONE" ? "None" : filters;
        //    ////sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
        //    //((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text ="TimePeriod: "+ timePeriod.ToUpper()+"\n\n"+ "Sample Size –"+sampleSizeText+"\n\n" +"Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;

        //}
        //public void updateNotesSection(ISlide sld, string selectedEstName, string filters)
        //{



        //    string filts = filters == "NONE" ? "None" : filters;
        //    //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
        //    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;

        //}
        //sabat
        public void updateNotesSectionBIC(ISlide sld, string selectedEstName, string filters, string competitors, string timePeriod, string sampleSizeText, string ReadasText)
        {
            IAutoShape tempShape = (IAutoShape)cur_Slide.Shapes.Where(x => x.Name == "footer_timePeriod_freq_text").FirstOrDefault();
            string timeperiodText = tempShape.TextFrame.Text;
            string filts = filters == "NONE" ? "None" : filters;
            //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
            ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = "Read As: " + ReadasText + "\n\n" + timePeriod + "\n\n" + "Sample Size –" + sampleSizeText + "\n\n" + "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filts;
            //+ "\n" + "Competitors – " + competitors;

        }
        //public void updateNotesSectionBIC(ISlide sld, string selectedEstName, string filters, string competitors)
        //{
        //    string filts = filters == "NONE" ? "None" : filters;
        //    //sld.NotesSlideManager.NotesSlide.NotesTextFrame.Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters;
        //    ((Aspose.Slides.TextFrame)((Aspose.Slides.NotesSlide)((Aspose.Slides.NotesSlideManager)((Aspose.Slides.Slide)sld).NotesSlideManager).NotesSlide).NotesTextFrame).Text = "Stat tested at 95% CL against " + selectedEstName.ToUpper() + "\n" + "Filters – " + filters == "NONE" ? "None" : filters + "\n" + "Competitors – " + competitors;

        //}
        public Color getSigColorRating(string significanceColorFlag)
        {
            if (significanceColorFlag == "1")
                return Color.Green;
            else if (significanceColorFlag == "2")
                return Color.Blue;
            else if (significanceColorFlag == "3")
                return Color.Black;
            return Color.Black;
        }

        public Color getSigColor(string significanceColorFlag)
        {
            if (significanceColorFlag == "1")
                return Color.Green;
            else if (significanceColorFlag == "2")
                return Color.Red;
            else if (significanceColorFlag == "3")
                return Color.Blue;

            return Color.Black;
        }

    }
    public class Significance_Color
    {
        public List<Color> significance_color { get; set; }
        public string ElementID { get; set; }
    }

    public class LowSampleSizeEstList
    {
        public string EstName { get; set; }
        public string IsUseDirectional { get; set; }

        public string SelectionType { get; set; }
        public string TimePeriodType { get; set; }
        public string EstablishmentId { get; set; }
    }
    public class SampleSizeEstList
    {
        public string EstName { get; set; }
        public int SS { get; set; }
    }

    public class ListTempData
    {
        public DataTable Result { get; set; }
        public int SlideId { get; set; }
    }
}