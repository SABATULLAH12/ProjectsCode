using Framework.Data;
using Framework.Models;
using Framework.Models.Snapshot;
using System;
using System.Collections.Generic;
using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Configuration;
using System.Data;
using System.Linq;
using System.IO;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using Aq.Plugin.AsposeExport;
using Aspose.Slides;
using Aq.Plugin.AsposeExport.Domain;
using Aq.Plugin.AsposeExport.Contracts;
using Aspose.Slides.Charts;
using System.Web;

namespace Dine.BusinessLayer
{
    public class SnapshotBO : IDisposable
    {
        private readonly ISnapshot snapshot = null;
        protected bool disposed = false;
        protected IModuleConfig config = null;
        private List<string> objList = new List<string>();
        private List<string> mtrList = new List<string>();

        public SnapshotBO() {
            config = ConfigContext.Current.GetConfig("snapshot");
            snapshot = new Snapshot();
        }

        public SnapshotBO(string controllerName)
        {
            config = ConfigContext.Current.GetConfig(controllerName);
            snapshot = new Snapshot(controllerName);
        }
    
        public FilterPanelMenu GetMenu() { return snapshot.GetMenu(); }
        public IEnumerable<AdvancedFilterData> GetAdvancedFilter()
        {
            return snapshot.GetAdvanceFilterData();
        }

        public WidgetData GetWidgetData(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter)
        {
            return snapshot.GetSingleWidgetDetails(filter, widget, customFilter);
        }

        public WidgetData GetWidgetsData(FilterPanelInfo filter)
        {
            return snapshot.GetAllWidgetDetails(new WidgetInfo() { }, new object[] { });
        }

        public IEnumerable<Widgets> GetWidgets(FilterPanelInfo filter)
        {
            return snapshot.GetWidgets(new object[] { });
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;
            if (disposing)
            {
                snapshot.Dispose();
            }
        }

        //internal object GetAnalysesData(FilterPanelInfo[] filter, CustomPropertyLabel customFilter)
        //{
        //    return snapshot.GetOutputData(config.GetInfo, config.GetFactQuery(filter, customFilter));
        //}
        public AnalysesInfo GetAnalysesData(FilterPanelInfo[] filter, CustomPropertyLabel customFilter, string module, string measureType)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterName" });
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterValue" });

            //prepare additional filter
            foreach (var add in FilterInfo.AdditionalFilter)
            {
                //var f = filter.FirstOrDefault(x => x.Name == add);
                var f = (add == "Establishment") ? ((module == "chartbeveragecompare" || module == "chartbeveragedeepdive") ? filter.FirstOrDefault(x => x.Name == add && (x.MetricType == "Restaurants" || x.MetricType == "Retailers")) : null) : filter.FirstOrDefault(x => x.Name == add);
                if (f != null && f.SelectedID != null)
                {
                    List<int> selectedIDsLst = f.SelectedID.ToString().Split('|')
                                               .Select(t => int.Parse(t))
                                               .ToList();
                    foreach (var Id in selectedIDsLst)
                    {
                        dt.Rows.Add(add, Id);
                    }
                    //dt.Rows.Add(add, f.SelectedID.ToString().Replace("|", ","));

                }
            }

            AnalysesInfo info = snapshot.GetOutputData(config.GetInfo, filter, dt, module);
            info = CSV_creator(info);
            return info;
        }

        #region Cross Diner Frequencies
        public AnalysesCrossDinerInfo GetCrossDinerFrequenciesData(FilterPanelInfo[] filter)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterName" });
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterValue" });
            AnalysesCrossDinerInfo info = snapshot.GetCrossDinerOutputData(config.GetInfo, filter);
            //var isRestorRetailer = filter.FirstOrDefault(x => x.Name == "IsRestaurantorRetailer")?.SelectedID;
            var isrestretailer = info.GetTableDataResopnse.GetTableDataRespDt.Select(x => x.IsRestRetailer).FirstOrDefault();

            HttpContext.Current.Session["RestaurantRetailers"] = info ;

            AnalysesCrossDinerInfo getIsRestOrRetInfo = new AnalysesCrossDinerInfo();
            getIsRestOrRetInfo.GetTableDataResopnse = new GetTableDataResponse();
            getIsRestOrRetInfo.GetTableDataResopnse.GetTableDataRespDt = (HttpContext.Current.Session["RestaurantRetailers"] as AnalysesCrossDinerInfo).GetTableDataResopnse.GetTableDataRespDt.Where(x => x.IsRestaurant == Convert.ToInt32(isrestretailer)).ToList();
            return getIsRestOrRetInfo;
        }

        public AnalysesCrossDinerInfo GetRestaurantOrRetailers(int isRestaurant)
        {         
            AnalysesCrossDinerInfo getIsRestOrRetInfo = new AnalysesCrossDinerInfo();
            getIsRestOrRetInfo.GetTableDataResopnse = new GetTableDataResponse();
            getIsRestOrRetInfo.GetTableDataResopnse.GetTableDataRespDt = (HttpContext.Current.Session["RestaurantRetailers"] as AnalysesCrossDinerInfo).GetTableDataResopnse.GetTableDataRespDt.Where(x => x.IsRestaurant == isRestaurant).ToList();
            return getIsRestOrRetInfo;
        }
        #endregion

        #region R server
        public AnalysesInfo CSV_creator(AnalysesInfo info)
        {
            info.establishmentWithNulls = new List<string>();
            int i = 0, j = 0, row_index = 0;
            System.Data.DataTable dt = new System.Data.DataTable();
            //List<string> establishmentWithNulls = new List<string>();
            //mtrList = new List<string>();
            dt.Columns.Add("name");
            DataRow drVal, dr;
            foreach (var item in info.Series)
            {
                if (item.SeriesSampleSize != null && item.SeriesSampleSize >= 30) {
                    j = 0;
                    dt.Columns.Add(item.name);
                    objList.Add(item.name);
                    //Add column heading
                    foreach (var data in item.data)
                    {
                        if (i == 0)
                        {
                            //add row heading
                            dr = dt.Rows.Add();
                            dr["name"] = data.x.Replace("'", "");
                            mtrList.Add(data.x);
                            drVal = dt.Rows[j];
                            drVal[i + 1] = (data.comparisonPercentage == null ? 1.0 : data.comparisonPercentage);
                        }
                        else
                        {
                            //add metric value to row(j+1) col(i+1)
                            var x = (data.x).Replace("'", "'+'");
                            row_index = dt.Rows.IndexOf(dt.Select("name = '" + (data.x).Replace("'", "") + "'").FirstOrDefault()); // dt.Rows.IndexOf(dt.Rows.Find(data.y));
                            drVal = dt.Rows[row_index];
                            drVal[i + 1] = (data.comparisonPercentage == null ? 1.0 : data.comparisonPercentage);
                        }
                        j++;
                    }
                    i++;
                    if (item.SeriesSampleSize < 30) { info.establishmentWithNulls.Add(item.name); }
                } else {
                    info.establishmentWithNulls.Add(item.name);
                }
            }
            mtrList.AddRange(objList);
            info.NoOfEstablishment = i;
            if (info.NoOfEstablishment >= 3) {
                List<RData> rOutput = new List<RData>();
                System.Data.DataTable res = Stats.CorrespondenceAnalysis(dt);
                i = 0;
                if (res != null)
                {
                    foreach (DataRow item in res.Rows)
                    {
                        RData temp = new RData();
                        temp.name = Convert.ToString(mtrList[i]);
                        temp.x = Convert.ToString(item[1]);
                        temp.y = Convert.ToString(item[2]);
                        rOutput.Add(temp); i++;
                    }
                }
                info.rData = rOutput;
            }
            return info;
        }
        #endregion

        public void PreparePowerPointSlides(string filepath, string destFile, StoryBoardFilterInfo filter, string measureType, string frequency, string tableTitle, string samplesizeLine, string measure_parent_text)
        {
            if (filter.FromTimePeriod.ToLower().Trim() == "total") { filter.FromTimePeriod = "Total"; }
            if (filter.ToTimePeriod.ToLower().Trim() == "total") { filter.ToTimePeriod = "Total"; }
            if (filter.TimePeriodType.ToLower().Trim() == "total") { filter.TimePeriodType = "Total"; }
            int i = 0, j = 0, CountOfSpliSlides = 0;
            string SampleSize = samplesizeLine == null?"": samplesizeLine;
            ISlideReplace _slideReplace = new SlideReplace();
            using (Presentation pres = new Presentation(filepath))
            {
                ISlide sld;
                IList<ChartDetail> charts = new List<ChartDetail>();
                string timePeriodText = filter.TimePeriodText == "pit" ? filter.FromTimePeriod : filter.FromTimePeriod + " to " + filter.ToTimePeriod;
                string commonBottomLine = "Source: Guest 360 - Time Period: "+ timePeriodText + "; Base: "+measure_parent_text+"; Filters: "+ ((filter.Comment == null || filter.Comment.Trim() == "")? "None" : filter.Comment);
                var data = filter.Filter;
                var OutputData = filter.OutputData;
                if (data != null)
                {
                    if (OutputData != null)
                    {
                        //call the procedure and update the data.OutputData.Data data
                        AnalysesInfo af = (new SnapshotBO()).GetAnalysesData(data, null, filter.Module, "");
                        af = CSV_creator(af);
                        double averageSS = (af.Series[0].data.ElementAt(0).StatSampleSize == null ? 0: (double)af.Series[0].data.ElementAt(0).StatSampleSize);
                        //foreach (var item in af.Series)
                        //{
                        //    averageSS = averageSS + (item.SeriesSampleSize == null? 0: item.SeriesSampleSize);
                        //}
                        //averageSS = averageSS / af.Series.Count();
                        #region slide 4
                        sld = pres.Slides[3];
                        //TableContingency
                        if (objList.Count > 3)
                        {
                            for (i = 0; i < objList.Count; i = i + 4)
                            {
                                int len_split_slide = (objList.Count - i) < 4 ? (objList.Count - i) : 4, splitSlideNo = 0;
                                splitSlideNo = 6 + len_split_slide + CountOfSpliSlides;
                                if (i == 0)
                                {
                                    splitIntoSlides(pres.Slides.InsertClone(4, pres.Slides[splitSlideNo]), af, SampleSize, objList.GetRange(0, 4), mtrList,commonBottomLine,measure_parent_text, Convert.ToDouble(averageSS).ToString("#######"));
                                    pres.Slides.RemoveAt(3);
                                }
                                else
                                {                 
                                    splitIntoSlides(pres.Slides.InsertClone(4 + CountOfSpliSlides, pres.Slides[splitSlideNo]), af, SampleSize, objList.GetRange(i, len_split_slide), mtrList,commonBottomLine,measure_parent_text, Convert.ToDouble(averageSS).ToString("#######"));
                                    CountOfSpliSlides++;
                                }
                            }
                        }
                        else {
                            splitIntoSlides(sld, af, SampleSize, objList, mtrList,commonBottomLine,measure_parent_text, Convert.ToDouble(averageSS).ToString("#######"));
                        }
                        pres.Slides.RemoveAt(pres.Slides.Count - 1); pres.Slides.RemoveAt(pres.Slides.Count - 1); pres.Slides.RemoveAt(pres.Slides.Count - 1);
                        pres.Slides.RemoveAt(pres.Slides.Count - 1); pres.Slides.RemoveAt(pres.Slides.Count - 1); pres.Slides.RemoveAt(pres.Slides.Count - 1);
                        #endregion slide 4
                        #region slide 1,5
                        for (i = 0; i < 6 + CountOfSpliSlides; i = i + 4 + CountOfSpliSlides)
                        {
                            sld = pres.Slides[i];
                            foreach (var item in sld.Shapes)
                            {
                                if (item.Name == "Filter_Timeperiod")
                                {
                                    ((IAutoShape)item).TextFrame.Text = "Base – "+frequency+", Filters – "+(filter.Comment == null?"None":filter.Comment)+"\n"+ timePeriodText;
                                }
                                else {
                                    if (item.Name == "Brands")
                                    {
                                        ((IAutoShape)item).TextFrame.Text = "Points of Comparison : " + tableTitle + "\nMetrics : "+ measure_parent_text;
                                    }
                                }
                            }
                        }
                        #endregion slide 1,5
                        #region slide 6,7
                        System.Data.DataTable RTable = new System.Data.DataTable(),RTable_Mtr = new System.Data.DataTable();
                        RTable.Columns.Add("Name");
                        RTable.Columns.Add("BlankSpace1");
                        RTable.Columns.Add("Dimension 1");
                        RTable.Columns.Add("BlankSpace2");
                        RTable.Columns.Add("Dimension 2");
                        RTable_Mtr.Columns.Add("Name");
                        RTable_Mtr.Columns.Add("BlankSpace1");
                        RTable_Mtr.Columns.Add("Dimension 1");
                        RTable_Mtr.Columns.Add("BlankSpace2");
                        RTable_Mtr.Columns.Add("Dimension 2");j = 0;
                        for (i = 0; i < af.rData.Count; i++)
                        {
                            if (i < (af.rData.Count-af.NoOfEstablishment)) {
                                RTable.Rows.Add(RTable.NewRow());
                                RTable.Rows[i]["Name"] = af.rData[i].name;
                                RTable.Rows[i]["Dimension 1"] = Convert.ToDouble(af.rData[i].x).ToString("#0.#");
                                RTable.Rows[i]["Dimension 2"] = Convert.ToDouble(af.rData[i].y).ToString("#0.#");
                                RTable.Rows[i]["BlankSpace1"] = "";
                                RTable.Rows[i]["BlankSpace2"] = "";
                            } else {
                                RTable_Mtr.Rows.Add(RTable_Mtr.NewRow());
                                RTable_Mtr.Rows[j]["Name"] = af.rData[i].name;
                                RTable_Mtr.Rows[j]["Dimension 1"] = Convert.ToDouble(af.rData[i].x).ToString("#0.#");
                                RTable_Mtr.Rows[j]["Dimension 2"] = Convert.ToDouble(af.rData[i].y).ToString("#0.#");
                                RTable_Mtr.Rows[j]["BlankSpace1"] = "";
                                RTable_Mtr.Rows[j]["BlankSpace2"] = ""; j++;
                            }
                        }
                        sld = pres.Slides[5+ CountOfSpliSlides];
                        var tblCP = (Aspose.Slides.ITable)sld.Shapes.FirstOrDefault(X=>X.Name == "TableCP");
                        ((IAutoShape)sld.Shapes.FirstOrDefault(X => X.Name == "BottomLineDetails")).TextFrame.Text = commonBottomLine;
                        if (tblCP != null) {
                            for (i = 0; i < RTable_Mtr.Rows.Count; i++)
                            {
                                if(i!=0){ tblCP.Rows.AddClone(tblCP.Rows[1], true); }
                                //Assigning values
                                tblCP.Rows[i + 1][0].TextFrame.Text = RTable_Mtr.Rows[i]["Name"].ToString();
                                tblCP.Rows[i + 1][2].TextFrame.Text = RTable_Mtr.Rows[i]["Dimension 1"].ToString();
                                tblCP.Rows[i + 1][4].TextFrame.Text = RTable_Mtr.Rows[i]["Dimension 2"].ToString();
                            }

                        }
                        /*Slide 7*/
                        sld = pres.Slides[6+ CountOfSpliSlides];
                        tblCP = (Aspose.Slides.ITable)sld.Shapes.FirstOrDefault(X => X.Name == "TableCP");
                        ((IAutoShape)sld.Shapes.FirstOrDefault(X => X.Name == "DT_Header")).TextFrame.Text = measure_parent_text;
                        ((IAutoShape)sld.Shapes.FirstOrDefault(X => X.Name == "BottomLineDetails")).TextFrame.Text = commonBottomLine;
                        if (tblCP != null)
                        {
                            for (i = 0; i < RTable.Rows.Count; i++)
                            {
                                if (i != 0) { tblCP.Rows.AddClone(tblCP.Rows[1], true); }
                                //Assigning values
                                tblCP.Rows[i + 1][0].TextFrame.Text = RTable.Rows[i]["Name"].ToString();
                                tblCP.Rows[i + 1][2].TextFrame.Text = RTable.Rows[i]["Dimension 1"].ToString();
                                tblCP.Rows[i + 1][4].TextFrame.Text = RTable.Rows[i]["Dimension 2"].ToString();
                            }

                        }
                        #endregion slide 6,7
                        #region slide 3
                        sld = pres.Slides[2];
                        Aspose.Slides.Charts.IChart chart = null;// = sld.Shapes.AddChart(ChartType.ScatterWithMarkers, 18, 95, 685, 355);
                        foreach (var item in pres.Slides[2].Shapes)
                        {
                            if (item.Name == "BottomLineDetails")
                            {
                                ((IAutoShape)item).TextFrame.Text = commonBottomLine;
                            }
                            if (item.Name == "ScatterChart") {
                                chart = (Aspose.Slides.Charts.IChart)item;
                            }
                            if (item.Name == "ScatterHeading") { ((IAutoShape)item).TextFrame.Text = " Bi-Variate Correspondence Plot : Comparison Points Vs "+measure_parent_text; }
                        }
                        chart.ChartData.Series.Clear();
                        int defaultWorksheetIndex = 0;
                        IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;
                        chart.ChartData.Series.Add(fact.GetCell(0, 1, 1, "Comparison Points"), chart.Type);
                        chart.ChartData.Series.Add(fact.GetCell(0, 1, 3, measure_parent_text), chart.Type);
                        //first chart series
                        IChartSeries series = chart.ChartData.Series[0];
                        series.Marker.Size = 5;
                        series.Marker.Format.Fill.SolidFillColor.Color = Color.Blue;
                        series.Marker.Symbol = MarkerStyleType.Circle;
                        //Adding data to series 1
                        i = 0; IChartDataPoint pointIndex;int tempCount = 0;
                        foreach (DataRow r in RTable_Mtr.Rows)
                        {
                                series.DataPoints.AddDataPointForScatterSeries(fact.GetCell(defaultWorksheetIndex, 2 + tempCount, 1, Convert.ToDouble(r[2])), fact.GetCell(defaultWorksheetIndex, 2 + tempCount, 2, Convert.ToDouble(r[4])));
                                pointIndex = series.DataPoints[tempCount]; pointIndex.Label.TextFrameForOverriding.Text = r[0].ToString();
                                series.DataPoints[tempCount].Label.TextFrameForOverriding.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 8;
                                tempCount++;
                            i++;
                        }
                        //second chart series
                        series = chart.ChartData.Series[1];
                        series.Marker.Size = 5;
                        series.Marker.Format.Fill.SolidFillColor.Color = Color.Red;
                        series.Marker.Symbol = MarkerStyleType.Circle;
                        //Adding data to series 1
                        i = 0; tempCount = 0;
                        foreach (DataRow r in RTable.Rows)
                        {
                                series.DataPoints.AddDataPointForScatterSeries(fact.GetCell(defaultWorksheetIndex, 2 + tempCount, 3, Convert.ToDouble(r[2])), fact.GetCell(defaultWorksheetIndex, 2 + tempCount, 4, Convert.ToDouble(r[4])));
                                pointIndex = series.DataPoints[tempCount]; pointIndex.Label.TextFrameForOverriding.Text = r[0].ToString();
                                series.DataPoints[tempCount].Label.TextFrameForOverriding.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 8;
                                tempCount++;
                            i++;
                        }
                        chart.HasLegend = false;
                        chart.HasTitle = false;
                        chart.Axes.HorizontalAxis.MajorTickMark = TickMarkType.None;
                        chart.Axes.HorizontalAxis.MinorTickMark = TickMarkType.None;
                        chart.Axes.VerticalAxis.MajorTickMark = TickMarkType.None;
                        chart.Axes.VerticalAxis.MinorTickMark = TickMarkType.None;
                        chart.Axes.HorizontalAxis.TickLabelPosition = TickLabelPositionType.None;
                        chart.Axes.VerticalAxis.TickLabelPosition = TickLabelPositionType.None;
                        #endregion slide 3
                        if (CountOfSpliSlides > 0) {
                            //Update the Table of Contents
                            ((IAutoShape)pres.Slides[1].Shapes.FirstOrDefault(x => x.Name == "ct_list")).TextFrame.Text = " - Contingency Table (Pg. 4-"+(4+CountOfSpliSlides)+")";
                            ((IAutoShape)pres.Slides[1].Shapes.FirstOrDefault(x => x.Name == "dt_list")).TextFrame.Text = " - Dimension Table (Pg. "+(6+CountOfSpliSlides)+"-"+(7+CountOfSpliSlides)+")";
                        }
                        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);
                    }
                }
            }
        }
        public void splitIntoSlides(ISlide sld, AnalysesInfo af, string SampleSize, List<string> objL, List<string> mtrL,string commonBottomLine,string measure_parent_text,string averageSS) {
            var tblCP = (Aspose.Slides.ITable)sld.Shapes.FirstOrDefault(X => X.Name == "TableContingency");
            ((IAutoShape)sld.Shapes.FirstOrDefault(X => X.Name == "BottomLineDetails")).TextFrame.Text = commonBottomLine;
            ((IAutoShape)sld.Shapes.FirstOrDefault(X => X.Name == "CT_Header")).TextFrame.Text = "Comparison Points Vs " + measure_parent_text;
            if (tblCP != null)
            {
                tblCP.Rows.AddClone(tblCP.Rows[1], true);
                tblCP.Rows[0][2].TextFrame.Text = "Average";
                tblCP.Rows[1][0].TextFrame.Text = "Sample Size";
                for (int i = 0; i < objL.Count; i++)
                {
                    if (i == 0)
                    {
                        SampleSize = String.Concat(SampleSize, objL[i] + " (" + (af.Series.FirstOrDefault(x => x.name == objL[i]).SeriesSampleSize) + ")");
                    }
                    else
                    {
                        SampleSize = String.Concat(SampleSize, ", " + objL[i] + " (" + (af.Series.FirstOrDefault(x => x.name == objL[i]).SeriesSampleSize) + ")");
                    }
                    tblCP.Rows[0][2 + 2*(i+1)].TextFrame.Text = objL[i];
                    tblCP.Rows[1][2 + 2*(i+1)].TextFrame.Text = af.Series.FirstOrDefault(x => x.name == objL[i]).SeriesSampleSize.ToString();
                    for (int j = 0; j < mtrL.Count - af.NoOfEstablishment; j++)
                    {
                        if (i == 0)
                        {
                            tblCP.Rows.AddClone(tblCP.Rows[1], true);
                            //AVG + MTR_LIST
                            tblCP.Rows[j + 2][0].TextFrame.Text = mtrL[j];
                            tblCP.Rows[j + 2][2].TextFrame.Text = Convert.ToDouble((af.Series.FirstOrDefault(x => x.name == objL[i]).data).FirstOrDefault(x => x.x == mtrL[j]).AVG).ToString("##0.#") + "%";
                        }
                        tblCP.Rows[j + 2][2*(i+1) + 2].TextFrame.Text = Convert.ToDouble((af.Series.FirstOrDefault(x => x.name == objL[i]).data).FirstOrDefault(x => x.x == mtrL[j]).y).ToString("##0.#") + "%";
                        tblCP.Rows[j + 2][2 * (i + 1) + 2].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                        tblCP.Rows[j + 2][2 * (i + 1) + 2].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorFromStatVal((af.Series.FirstOrDefault(x => x.name == objL[i]).data).FirstOrDefault(x => x.x == mtrL[j]).StatValue);
                    }
                }
                tblCP.Rows.RemoveAt(tblCP.Rows.Count - 1, true);
                tblCP.Rows[1][2].TextFrame.Text = averageSS;
            }
        }
        public ChartType getAsposeChartType(string chart)
        {
            ChartType asposeChartType = 0;
            switch (chart)
            {
                case "LineWithMarkers":
                    asposeChartType = ChartType.LineWithMarkers;
                    break;
                case "Column3D":
                    asposeChartType = ChartType.ClusteredColumn;
                    break;
                case "ClusteredBar":
                    asposeChartType = ChartType.ClusteredBar;
                    break;
                case "PercentsStackedColumn":
                    asposeChartType = ChartType.PercentsStackedColumn;
                    break;
                case "PercentsStackedBar":
                    asposeChartType = ChartType.PercentsStackedBar;
                    break;
                case "ClusteredColumn":
                    asposeChartType = ChartType.ClusteredColumn;
                    break;
                case "StackedColumn":
                    asposeChartType = ChartType.StackedColumn;
                    break;
                case "StackedBar":
                    asposeChartType = ChartType.StackedBar;
                    break;
            }
            return asposeChartType;
        }
        public Color getColorFromStatVal(double? statVal) {
            if (statVal < -1.96) { return Color.Red; }
            if (statVal > 1.96) { return Color.Green; }
            return Color.Black;
        }
        public void PrepareExcelForOtherTable(string filepath, string destFile, StoryBoardFilterInfo filter, string measureType, string frequency, string tableTitle)
        {
            if (filter.FromTimePeriod.ToLower().Trim() == "total") { filter.FromTimePeriod = "Total"; }
            if (filter.ToTimePeriod.ToLower().Trim() == "total") { filter.ToTimePeriod = "Total"; }
            if (filter.TimePeriodType.ToLower().Trim() == "total") { filter.TimePeriodType = "Total"; }

            var isVisits = 1;
            if (filter.Filter[0].IsVisit == "1")
                isVisits = 1;
            else
                isVisits = 0;

            var data = filter.Filter;
            AnalysesInfo af = new AnalysesInfo();
            var OutputData = filter.OutputData;
            if (data != null)
            {
                if (OutputData != null)
                {
                        //call the procedure and update the data.OutputData.Data data
                        af = (new SnapshotBO()).GetAnalysesData(data, null, filter.Module, "");
                        af = CSV_creator(af);
                        double averageSS = (af.Series[0].data.ElementAt(0).StatSampleSize == null ? 0 : (double)af.Series[0].data.ElementAt(0).StatSampleSize);
                    //Code to prepare excel
                    try
                    {
                        var file = new FileInfo(destFile);
                        System.IO.File.Copy(filepath, destFile, true);
                        using (ExcelPackage p = new ExcelPackage(file))
                        {
                            ExcelWorksheet ws1;
                            int i = 0, j = 0,len=af.rData.Count - af.NoOfEstablishment;
                            #region Correspondence_Maps
                            ws1 = p.Workbook.Worksheets[1];
                            ws1.View.ShowGridLines = false;
                            ws1.Cells[2, 2].Value = "Time Period : " + filter.FromTimePeriod;

                            if (isVisits == 1 && frequency == "")
                                ws1.Cells[3, 2].Value = "Frequency : " + "Total Visits";
                            else if (isVisits == 1)
                                ws1.Cells[3, 2].Value = "Frequency :" + frequency.ToLower().Trim() == "total visits" ? frequency : "Total Visits" + "(" + frequency + ")";
                            else
                                ws1.Cells[3, 2].Value = "Frequency : " + frequency;

                            ws1.Cells[2, 3].Value = measureType;
                            //ws1.Cells[3, 3].Value = filter.Comment == " undefined : " ? "" :filter.Comment;
                            for (i = 0; i < af.rData.Count; i++)
                            {
                                if (i<len) {
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 1].Value = af.rData[i].name;
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 2].Value = Convert.ToDouble(af.rData[i].x);
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 2].Style.Numberformat.Format = "######0.0";
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 3].Value = Convert.ToDouble(af.rData[i].y);
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 3].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 3].Style.Numberformat.Format = "######0.0";
                                    ws1.Cells[8 + i + af.NoOfEstablishment, 3].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                } else {
                                    ws1.Cells[7 + i - len, 1].Value = af.rData[i].name;
                                    ws1.Cells[7 + i - len, 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[7 + i - len, 2].Value = Convert.ToDouble(af.rData[i].x);
                                    ws1.Cells[7 + i - len, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[7 + i - len, 2].Style.Numberformat.Format = "######0.0";
                                    ws1.Cells[7 + i - len, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[7 + i - len, 3].Value = Convert.ToDouble(af.rData[i].y);
                                    ws1.Cells[7 + i - len, 3].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                    ws1.Cells[7 + i - len, 3].Style.Numberformat.Format = "######0.0";
                                    ws1.Cells[7 + i - len, 3].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                }
                            }
                            ws1.Cells[7 + af.NoOfEstablishment, 1].Style.Font.Color.SetColor(Color.White);
                            ws1.Cells[7 + af.NoOfEstablishment, 1].Value = "VARIABLES";
                            ws1.Cells[7 + af.NoOfEstablishment, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws1.Cells[7 + af.NoOfEstablishment, 1].Style.Fill.BackgroundColor.SetColor(Color.Black);
                            ws1.Cells[7 + af.NoOfEstablishment, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws1.Cells[7 + af.NoOfEstablishment, 2].Style.Fill.BackgroundColor.SetColor(Color.Black);
                            ws1.Cells[7 + af.NoOfEstablishment, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws1.Cells[7 + af.NoOfEstablishment, 3].Style.Fill.BackgroundColor.SetColor(Color.Black);
                            #endregion Correspondence_Maps
                            #region Contingency_Table
                            ws1 = p.Workbook.Worksheets[2];
                            ws1.View.ShowGridLines = false;
                            ws1.Cells[2, 2].Value = "Time Period : " + filter.FromTimePeriod;
                            if (isVisits == 1)
                                ws1.Cells[3, 2].Value = "Frequency :" + frequency.ToLower().Trim() == "total visits" ? frequency : "Total Visits" + "(" + frequency + ")";
                            else
                                ws1.Cells[3, 2].Value = "Frequency : " + frequency;

                            ws1.Cells[2, 3].Value = measureType;
                            string comment = string.Empty;
                            if (filter.Comment != null && filter.Comment != "")
                                comment = filter.Comment.Trim() == "undefined :" ? "" : filter.Comment;
                            else
                                comment = "";
                            ws1.Cells[3, 3].Value = comment;
                            //ws1.Cells[3, 4].Value = "*Stat Tested Against Average";
                            ws1.Cells[7, 1].Value = "Measure(s)";
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Merge = true;
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Value = tableTitle;
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Style.Font.Bold = true;
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(128, 128, 128));
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                            ws1.Cells[5, 3, 5, objList.Count() + 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[8, 2].Value = averageSS;
                            ws1.Cells[8, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws1.Cells[8, 2].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                            for (i = 0; i < objList.Count; i++)
                            {
                                ws1.Column(i + 3).Width = 30;
                                ws1.Cells[6, 3 + i].Value = objList[i];
                                ws1.Cells[6, 3 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                ws1.Cells[6,3+i].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                ws1.Cells[7, 3 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[7, 3 + i].Style.Fill.BackgroundColor.SetColor(Color.Black);
                                string usedirc = "";
                                var seriesSampleSize = af.Series.FirstOrDefault(x => x.name == objList[i]).SeriesSampleSize;
                                seriesSampleSize = seriesSampleSize == null ? 0 : seriesSampleSize;
                                if (seriesSampleSize >= 30 && seriesSampleSize <= 99)
                                    usedirc = seriesSampleSize + "(Use Directionally)";
                                else
                                    usedirc = Convert.ToString(seriesSampleSize);
                                int serSS = 0;
                                bool isNumb = int.TryParse(usedirc, out serSS);
                                if (isNumb)
                                {
                                    ws1.Cells[8, 3 + i].Value = serSS;
                                    ws1.Cells[8, 3 + i].Style.Numberformat.Format = "###,###,##0";
                                }
                                else {
                                    ws1.Cells[8, 3 + i].Value = usedirc;
                                }                               
                                ws1.Cells[8, 3 + i].Style.Font.Color.SetColor(Color.FromArgb(0, 0, 0));
                                ws1.Cells[8, 3 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                ws1.Cells[8, 3 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[8, 3 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                var count = mtrList.Count - af.NoOfEstablishment;
                                for (j = 0; j < mtrList.Count-af.NoOfEstablishment; j++)
                                {
                                    if (i==0) {
                                        ws1.Cells[9 + j, 1].Value = mtrList[j];
                                        ws1.Cells[9 + j, 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                        ws1.Cells[9 + j, 2].Value = (af.Series.FirstOrDefault(x => x.name == objList[i]).data).FirstOrDefault(x => x.x == mtrList[j]).AVG/100;
                                        ws1.Cells[9 + j, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                        ws1.Cells[9 + j, 2].Style.Numberformat.Format = "##0.0%";
                                    }
                                    var metricvalue = (af.Series.FirstOrDefault(x => x.name == objList[i]).data).FirstOrDefault(x => x.x == mtrList[j]).y / 100;
                                    var statVal = (af.Series.FirstOrDefault(x => x.name == objList[i]).data).FirstOrDefault(x => x.x == mtrList[j]).StatValue;
                                    if (metricvalue == null || Convert.ToString(metricvalue) == "")
                                    {
                                        ws1.Cells[9 + j, 3 + i].Value = "NA";
                                        ws1.Cells[9 + j, 3 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                        ws1.Cells[9 + j, 3 + i].Style.Numberformat.Format = "##0.0%";
                                        ws1.Cells[9 + j, 3 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[9 + j, 3 + i].Style.Font.Color.SetColor(Color.FromArgb(0, 0, 0));
                                        if (seriesSampleSize >= 30 && seriesSampleSize <= 99)
                                            ws1.Cells[9 + j, 3 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                        else
                                            ws1.Cells[9 + j, 3 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));
                                    }
                                    else
                                    {
                                        ws1.Cells[9 + j, 3 + i].Value = metricvalue;
                                        ws1.Cells[9 + j, 3 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                        ws1.Cells[9 + j, 3 + i].Style.Numberformat.Format = "##0.0%";
                                        ws1.Cells[9 + j, 3 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        if (seriesSampleSize >= 30 && seriesSampleSize <= 99)
                                        {
                                            ws1.Cells[9 + j, 3 + i].Style.Font.Color.SetColor(Color.FromArgb(0, 0, 0));
                                            ws1.Cells[9 + j, 3 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                        }
                                        else
                                        {
                                            ws1.Cells[9 + j, 3 + i].Style.Font.Color.SetColor(getColorFromStatVal(statVal));
                                            ws1.Cells[9 + j, 3 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));
                                        }
                                    }
                                }
                                ws1.Cells[8,2, 9+  count, (3+i)].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                
                            }
                            ws1.Cells[11 + j , 1, 11 + j, 1].Value = "* Total number of respondents who have responded to atleast one of the selected measure";
                            #endregion Contingency_Table
                            p.Save();
                        }
                    }
                    catch (Exception ex)
                    {
                    }
                }
            }
        }
        public AnalysesCrossDinerInfo PrepareExcelCrossDinerTable(FilterPanelInfo[] filter)
        {
            AnalysesCrossDinerInfo info = snapshot.GetCrossDinerOutputData(config.GetInfo, filter);
            return info;
        }
        public List<SampleSizeListCrossDiner> PrepareSampleSizeListCrossDiner(AnalysesCrossDinerInfo info)
        {
            var sampleList = new List<SampleSizeListCrossDiner>();
            bool isduplicatecheck = false;
            //sampleList.Add(new SampleSizeListCrossDiner()
            //{
            //    CompareName = "",
            //    MetricName = "",
            //    SampleSize = 0
            //});
            var xdata = info.GetTableDataResopnse.GetTableDataRespDt;
            int i = 0;
            foreach (var val in xdata)
            {
                isduplicatecheck = false;
                if (i == 0)
                {
                    sampleList.Add(new SampleSizeListCrossDiner()
                    {
                        CompareName = val.CompareName,
                        MetricName = val.MetricName,
                        SampleSize = val.SampleSize
                    });
                }
                else
                {
                    foreach (var samlist in sampleList)
                    {
                        if (!isDuplicate(sampleList, val.CompareName))
                        {
                            isduplicatecheck = true;
                        }
                    }
                    if (isduplicatecheck == true)
                    {
                        sampleList.Add(new SampleSizeListCrossDiner()
                        {
                            CompareName = val.CompareName,
                            MetricName = val.MetricName,
                            SampleSize = val.SampleSize
                        });
                    }
                }
                i++;
            }

            //sampleList.Add(new SampleSizeListCrossDiner()
            //{
            //    CompareName = "Weekly+",
            //    MetricName = "FSR",
            //    SampleSize = 250
            //});
            //sampleList.Add(new SampleSizeListCrossDiner()
            //{
            //    CompareName = "Monthly+",
            //    MetricName = "FSR",
            //    SampleSize = 150
            //});
            //sampleList.Add(new SampleSizeListCrossDiner()
            //{
            //    CompareName = "Quarterly+",
            //    MetricName = "FSR",
            //    SampleSize = 50
            //});
            return sampleList;

        }

        public bool isDuplicate(List<SampleSizeListCrossDiner> samlist,string comparename)
        {
            bool isduplicate = false;
            foreach (var sam in samlist)
            {
                if (sam.CompareName == comparename)
                    isduplicate = true;
            }
            return isduplicate;
        }

        public string PrepareExcelForCrossDiner(string filepath, string destFile, AnalysesCrossDinerInfo maindataoriginal, FilterPanelInfo[] filter, List<SampleSizeListCrossDiner> samplszelist,string selectedDemofiltersList,List<ExportToExcel> selectedChkBxIds)
        {
            var selectdTime = string.Join("|", filter.FirstOrDefault(x => x.Name == "Time Period").Data.Select(x => x.Text));//timeperiod
            var selectedEstmt = filter.FirstOrDefault(x => x.Name == "Establishment").Data.Select(x => x.Text).ToList()[0].ToString();
            var selectdfilters = filter.FirstOrDefault(x => x.MetricType == "Advance Filters" || x.Name == "Advance Filters" || x.MetricType == "Advanced Filters" || x.Name == "Advanced Filters" || x.MetricType == "Demographic Filters" || x.Name == "Demographic Filters" || x.MetricType == "Additional Filters" || x.Name == "Additional Filters")?.SelectedID;//demofilter
            List<SampleSizeListCrossDiner> columns = samplszelist;
            var sourceFile = filepath; //source file            
            var dirName = HttpContext.Current.Session.SessionID;
            var fileNmae = "CrossDinerExcelTemplate.xlsx"; //  download file
            destFile = HttpContext.Current.Server.MapPath("~/Temp/" + dirName + "/" + fileNmae);
            /*cselectedCheckboxTopFilterIdreate the directory with session name*/
            if (Directory.Exists(HttpContext.Current.Server.MapPath("~/Temp/" + dirName)))
                Directory.Delete(HttpContext.Current.Server.MapPath("~/Temp/" + dirName), true);

            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Temp/" + dirName));

            File.Copy(sourceFile, destFile, true);
            int metricSampleSize = 0;
            var toGetSheetName = "";
            try
            {
                AnalysesCrossDinerInfo maindata = new AnalysesCrossDinerInfo();
                maindata.GetTableDataResopnse = new GetTableDataResponse();
                for (int isRestorRetailer = 0; isRestorRetailer < selectedChkBxIds.Count; isRestorRetailer++)
                {
                    
                    var file = new FileInfo(destFile);
                    using (ExcelPackage p = new ExcelPackage(file))
                    {
                        ExcelWorksheet worksheet; ExcelWorksheet ws1;

                        var toDeleteAlrdyExistSheet = p.Workbook.Worksheets.SingleOrDefault(x => x.Name == "Test");
                        if (toDeleteAlrdyExistSheet != null)
                            p.Workbook.Worksheets.Delete(toDeleteAlrdyExistSheet);

                            if (isRestorRetailer == 0)
                        {
                            toGetSheetName = selectedChkBxIds[isRestorRetailer].Name;
                            maindata.GetTableDataResopnse.GetTableDataRespDt = (maindataoriginal as AnalysesCrossDinerInfo).GetTableDataResopnse.GetTableDataRespDt.Where(x => x.IsRestaurant == selectedChkBxIds[isRestorRetailer].Id).ToList();
                        }
                        else if (isRestorRetailer == 1)
                        {
                            toGetSheetName = selectedChkBxIds[isRestorRetailer].Name;
                            maindata.GetTableDataResopnse.GetTableDataRespDt = (maindataoriginal as AnalysesCrossDinerInfo).GetTableDataResopnse.GetTableDataRespDt.Where(x => x.IsRestaurant == selectedChkBxIds[isRestorRetailer].Id).ToList();
                        }
                     

                        worksheet = p.Workbook.Worksheets.Add(toGetSheetName);
                        ws1 = p.Workbook.Worksheets[worksheet.Name];

                        #region Add logo
                        var imagePath = HttpContext.Current.Server.MapPath("~/Images/DineLogo.png");
                        Bitmap image = new Bitmap(imagePath);
                        int a = 1;
                        var picture = ws1.Drawings.AddPicture(a.ToString(), image);
                        picture.SetPosition(1, 3, 0, 0);
                        picture.SetSize(250, 47);
                        #endregion

                        #region column  width
                        ws1.Column(1).Width = 43;

                        for (int i = 2; i < columns.Count() + 2; i++)
                        {
                            ws1.Column(i).Width = 30;
                        }
                        #endregion column  width
                        //hide grid lines
                        ws1.View.ShowGridLines = false;
                        int rowIndex = 1;
                        int colIndex = 1;
                        ws1.Cells[1, 2].Value = "Selection"; ws1.Cells[1, 2].Style.Font.UnderLine = true; ws1.Cells[1, 2].Style.Font.Bold = true;
                        ws1.Cells[1, 4].Value = "Filters"; ws1.Cells[1, 4].Style.Font.UnderLine = true; ws1.Cells[1, 4].Style.Font.Bold = true;

                        ws1.Cells[2, 2].Value = "Time Period:"; ws1.Cells[2, 3].Value = selectdTime == "TOTAL" ? "Total" : selectdTime;
                        ws1.Cells[2, 4].Value = "Demographic Filters:"; ws1.Cells[2, 5].Value = selectedDemofiltersList;
                        ws1.Cells[3, 2].Value = "Establishment/Channel:"; ws1.Cells[3, 3].Value = selectedEstmt;
                        
                        ws1.Cells[4, 4].Value = "*Stat Testing Not Applicable for This Module";
                        #region Top Header  border apply
                        ws1.Cells[1, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[2, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[3, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 1].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 4].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                        ws1.Cells[1, 3].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[2, 3].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[3, 3].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 3].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 3].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                        ////ws1.Cells[1, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        //ws1.Cells[2, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        //ws1.Cells[3, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        //ws1.Cells[4, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 5].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                        ws1.Cells[1, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[2, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[3, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        ws1.Cells[4, 6].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        #endregion Top Header  border apply

                        //ws1.Cells[5, 2, 5, columns.Count() + 1].Merge = true;
                        //ws1.Cells[5, 2, 5, columns.Count() + 1].Value = "";//selectedHeadrEstorMetricorTime;
                        //ws1.Cells[5, 2, 5, columns.Count() + 1].Style.Font.Bold = true;
                        //ws1.Cells[5, 2, 5, columns.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        rowIndex = 6;
                        colIndex = 2;

                        //Header Section
                        #region Header Section

                        foreach (var col in columns)
                        {
                            ws1.Cells[rowIndex, colIndex].Style.Font.Bold = true;
                            ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[rowIndex, colIndex].Value = col.CompareName;
                            ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.Black);
                            ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(255, 255, 255));
                            colIndex++;
                        }

                        var mainHeaderList = new List<string>();
                        var columnsandSampleSizeList = new List<SampleSizeListCrossDiner>();


                        #endregion

                        #region Sample Size Header
                        int k = 0;
                        rowIndex++; colIndex = 1;
                        foreach (var samp in samplszelist)
                        {
                            if (k == 0)
                            {
                                //ws1.Cells[rowIndex,colIndex].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#B7DEE8"));
                                ws1.Cells[rowIndex, colIndex].Value = "Sample Size";
                                ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                                colIndex++;
                                if (samp.SampleSize >= 100)
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = samp.SampleSize;
                                }
                                else if (samp.SampleSize == null)
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = "NA";
                                }
                                else
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = sampleSizeStatus(samp.SampleSize);
                                }

                                ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "#,##0";
                                ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                            }
                            else
                            {
                                if (samp.SampleSize >= 100)
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = samp.SampleSize;
                                }
                                else if (samp.SampleSize == null)
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = "NA";
                                }
                                else
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = sampleSizeStatus(samp.SampleSize);
                                }

                                ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "#,##0";
                                ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));

                            }
                            k++;
                            colIndex++;
                        }
                        #endregion Sample Size list Header
                        rowIndex++; colIndex = 1; var columnsCount = 0;int rowscheck = 0;
                        #region Body Part
                        foreach (var col in columns)
                        {
                            if (rowscheck == 0)
                            { }
                            else
                            {
                                rowIndex++;
                            }
                            for (int m = 0; m < columns.Count() + 1; m++)
                            {
                                if (m == 0)
                                    ws1.Cells[rowIndex, colIndex].Value = col.CompareName;
                                else
                                    ws1.Cells[rowIndex, colIndex].Value = "";

                                ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(1, 0, 0));
                                ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(255, 255, 255));
                                colIndex++;
                            }
                            double metricValue = -999;
                            colIndex = 1; 
                            foreach (var item in maindata.GetTableDataResopnse.GetTableDataRespDt)
                            {
                                if (col.CompareName == item.MetricParentName)
                                {
                                    Color cssForUseDirectinally = Color.FromArgb(255, 255, 255);
                                    if (item.SampleSize >= 30 && item.SampleSize <= 99)
                                    {
                                        metricValue = item.MetricValue == null ? -999 : Convert.ToDouble(item.MetricValue);
                                        cssForUseDirectinally = Color.FromArgb(231, 230, 230);
                                    }
                                    else if (item.SampleSize > 99)
                                    {
                                        metricValue = item.MetricValue == null ? -999 : Convert.ToDouble(item.MetricValue);
                                        cssForUseDirectinally = Color.FromArgb(255, 255, 255);
                                    }
                                    else
                                    {
                                        metricValue = -9999; cssForUseDirectinally = Color.FromArgb(255, 255, 255);
                                    }


                                    if (columnsCount == 0)
                                    {
                                        rowIndex++;
                                        ws1.Cells[rowIndex, colIndex].Value = item.MetricName;
                                        if (item.ChannelFlag == 1)
                                            ws1.Cells[rowIndex, colIndex].Style.Font.Bold = true;
                                        else
                                            ws1.Cells[rowIndex, colIndex].Style.Font.Bold = false;
                                        colIndex++;

                                        ws1.Cells[rowIndex, colIndex].Style.Font.Bold = false;
                                        ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(cssForUseDirectinally);
                                        if (metricValue == -9999)
                                        {
                                            ws1.Cells[rowIndex, colIndex].Value = "";
                                        }
                                        else if (metricValue == -999)
                                        {
                                            ws1.Cells[rowIndex, colIndex].Value = "NA";
                                        }
                                        else
                                        {
                                            if (item.ChannelFlag == 1)
                                                ws1.Cells[rowIndex, colIndex].Style.Font.Bold = true;
                                            else
                                                ws1.Cells[rowIndex, colIndex].Style.Font.Bold = false;
                                            ws1.Cells[rowIndex, colIndex].Value = metricValue;
                                            ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "######0.0%";
                                        }
                                    }
                                    else
                                    {
                                        if (item.ChannelFlag == 1)
                                            ws1.Cells[rowIndex, colIndex].Style.Font.Bold = true;
                                        else
                                            ws1.Cells[rowIndex, colIndex].Style.Font.Bold = false;

                                        if (metricValue == -9999)
                                        {
                                            ws1.Cells[rowIndex, colIndex].Value = "";
                                        }
                                        else if (metricValue == -999)
                                        {
                                            ws1.Cells[rowIndex, colIndex].Value = "NA";
                                        }
                                        else
                                        {
                                           
                                            ws1.Cells[rowIndex, colIndex].Value = metricValue;
                                            ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "######0.0%";
                                        }
                                        ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(cssForUseDirectinally);

                                    }
                                    colIndex++;
                                    columnsCount++;
                                    if (columnsCount == 3)
                                    {
                                        columnsCount = 0;
                                        colIndex = 1;

                                    }
                                }

                            }
                            #region set border color for all rows
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Top.Color.SetColor(Color.FromArgb(1, 0, 0));
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Bottom.Color.SetColor(Color.FromArgb(1, 0, 0));
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Left.Color.SetColor(Color.FromArgb(1, 0, 0));
                            ws1.Cells[5, 1, rowIndex, columns.Count() + 1].Style.Border.Right.Color.SetColor(Color.FromArgb(1, 0, 0));
                            #endregion
                            rowscheck++;
                        }
                        #endregion Body Part

                        //else {
                        //    ws1.Cells[6, 1].Style.Fill.PatternType = ExcelFillStyle.None;
                        //    ws1.Cells[6, 1].Style.Font.Color.SetColor(Color.FromArgb(0, 0, 0));
                        //    ws1.Cells[6, 1].Value = "NO DATA AVAILABLE FOR THE SELECTION YOU MADE";
                        //}
                        p.Save();
                    }
                }


            }
            catch (Exception ex)
            { }
            //outputpath = fileNmae;
            return destFile;
        }
        public string sampleSizeStatus(int? sampleSize)
        {
            string status = "";
            if (sampleSize < 30)
                status = sampleSize + " (Low Sample Size)";
            else if (sampleSize >= 30 && sampleSize <= 99)
                status = sampleSize + " (Use Directionally)";
            else
                status = Convert.ToString(sampleSize);
            return status;
        }
    }
   
}