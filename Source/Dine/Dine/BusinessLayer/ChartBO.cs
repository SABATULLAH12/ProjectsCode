using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web;
using System.Web.Mvc;
using Aq.Plugin.AsposeExport;
using Aq.Plugin.AsposeExport.Domain;
using Aspose.Slides.Charts;
using Framework.Models;
using Framework.Models.Utility;
using NextGen.Core.Configuration;
using Framework.Models.Chart;
using fd = Framework.Data;
using NextGen.Core.Configuration.Interfaces;
using System.Linq;
using OfficeOpenXml;
using OfficeOpenXml.Drawing;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Web.Script.Serialization;
using Aspose.Slides;
using Aq.Plugin.AsposeExport.Contracts;
using System.Globalization;
using System.Threading;

namespace Dine.BusinessLayer
{
    public class ChartBO : IDisposable
    {
        private readonly fd.IChart chart = null;
        protected bool disposed = false;
        private IModuleConfig config = null;
        internal string[] _CurrentColors = new string[] { };

        public ChartBO()
        {
            _CurrentColors = new string[] { };
            chart = new fd.Chart();
            config = ConfigContext.Current.GetConfig("chart");
        }

        public ChartBO(string controllerName)
        {
            _CurrentColors = new string[] { };
            config = ConfigContext.Current.GetConfig(controllerName);
            chart = new fd.Chart(controllerName);
        }

        public ChartBO(string[] colors)
        {
            _CurrentColors = colors;
        }

        public FilterPanelMenu GetMenu() { return chart.GetMenu(); }

        public System.Data.DataTable GetDataTable(FilterPanelInfo[] filter, string module, string measureType, string timePeriodType, CustomPropertyLabel customFilter, string customBaseText, string toTimePeriod, string fromTimePeriod, string UserId)
        {
            // customBaseText = "Burger King";                
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

            System.Data.DataTable modifiedTable = chart.GetDataTable(config.GetInfo, filter, dt, module, timePeriodType, toTimePeriod, fromTimePeriod, UserId);
            string customBase = "";
            if ((customBaseText != string.Empty && customBaseText != null))
                customBase = customBaseText;
            else
            {
                if ((filter.FirstOrDefault().customBase != null && filter.FirstOrDefault().customBase != string.Empty))
                    customBase = filter.FirstOrDefault().customBase;
            }
            if (customBase != "")
            {
                string colName = string.Empty, colName2 = string.Empty;

                if (module == "chartestablishmentdeepdive" || module == "chartbeveragedeepdive")
                {

                    if (filter.FirstOrDefault().isTrendTable == "false")
                    {
                        colName = "Col4";
                        colName2 = "Col1";
                    }
                    else
                    {
                        colName = "Col4";
                        colName2 = "TimePeriod";

                    }
                }
                else
                {
                    if (filter.FirstOrDefault().isTrendTable == "false")
                    {
                        colName = "Col2";
                        colName2 = "Col1";
                    }
                    else
                    {
                        colName = "Col2";
                        colName2 = "TimePeriod";
                    }
                }

            }
            return modifiedTable;

        }

        public ChartInfo GetChart(FilterPanelInfo[] filter, string module, string measureType, string timePeriodType, CustomPropertyLabel customFilter, string customBaseText, string UserId)
        {
            // customBaseText = "Burger King";                
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterName" });
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterValue" });

            //prepare additional filter
            foreach (var add in FilterInfo.AdditionalFilter)
            {
                //var f = filter.FirstOrDefault(x => x.Name == add);
                var f = (add == "Establishment") ? ((module == "chartbeveragecompare" || module == "chartbeveragedeepdive") ? filter.FirstOrDefault(x => x.Name == add) : null) : filter.FirstOrDefault(x => x.Name == add);
                //var f = (add == "Establishment") ? ((module == "chartbeveragecompare" || module == "chartbeveragedeepdive") ? filter.FirstOrDefault(x => x.Name == add && (x.MetricType == "Restaurants" || x.MetricType == "Retailers")) : null) : filter.FirstOrDefault(x => x.Name == add);
                if (f != null && f.SelectedID != null)
                {
                    List<int> selectedIDsLst = f.SelectedID.ToString().Split('|')
                                               .Select(t => int.Parse(t))
                                               .ToList();
                    foreach (var Id in selectedIDsLst)
                    {
                        dt.Rows.Add(add, Id);
                    }
                }
            }

            ChartInfo info = chart.GetOutputData(config.GetInfo, filter, dt, module, timePeriodType, UserId);

            return info;
        }

        public void SaveChangedColorCodes(List<ColorCodeData> codelist, bool IsBeverageModule, string UserId)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "UserId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "ColourCode" });
            dt.Columns.Add(new DataColumn() { ColumnName = "EstablishmentorBeverageId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "MeasureId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "GroupsId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "IsTrend" });

            if (codelist != null)
            {
                for (int i = 0; i < codelist.Count; i++)
                {
                    ColorCodeData cd = codelist[i];
                    dt.Rows.Add(UserId, cd.ColourCode, cd.Establishmentid, cd.MeasureId, cd.GroupsId, cd.IsTrend);
                }
            }
            chart.SaveChangedColorCodes(dt, IsBeverageModule);
        }

        public string ValidatePalletteColor(List<ColorCodeData> codelist, bool IsBeverageModule, string UserId)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "UserId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "ColourCode" });
            dt.Columns.Add(new DataColumn() { ColumnName = "EstablishmentorBeverageId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "MeasureId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "GroupsId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "IsTrend" });

            if (codelist != null)
            {
                for (int i = 0; i < codelist.Count; i++)
                {
                    ColorCodeData cd = codelist[i];
                    dt.Rows.Add(UserId, cd.ColourCode, cd.Establishmentid, cd.MeasureId, cd.GroupsId, cd.IsTrend);
                }
            }
            string retstr = chart.ValidatePalletteColor(dt, IsBeverageModule);
            return retstr;
        }
        public IEnumerable<AdvancedFilterData> GetAdvancedFilter(int bitData)
        {
            return chart.GetAdvanceFilterData(bitData);
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
                chart.Dispose();
            disposed = true;
        }

        public void PreparePowerPoint(string destinationPath, string sourcePath, string destinationVirtualPath, ExportDetails filter, CustomPropertyLabel customFilter)
        {
            if (File.Exists(sourcePath))
            {
                DataSet ds = chart.GetOutputDataTable(ConfigContext.Current.GetConfig("chart").GetFactQuery(filter.Filter, customFilter));
                if (ds != null && ds.Tables.Count > 0)
                {
                    File.Copy(sourcePath, destinationPath, true);
                    ChartType charttype;
                    switch (Convert.ToString(filter.ChartType).ToLower())
                    {
                        case "bar":
                            charttype = ChartType.ClusteredBar;
                            break;
                        case "column":
                            charttype = ChartType.ClusteredColumn;
                            break;
                        case "pie":
                            charttype = ChartType.Pie;
                            break;
                        case "trend":
                            charttype = ChartType.Line;
                            break;
                        default:
                            charttype = ChartType.StackedBar;
                            break;
                    }

                    var config = ConfigContext.Current.GetConfig("chart");
                    var chartData = new ChartDetail()
                    {
                        Data = ds.Tables[0],
                        XAxisColumnName = config.GetInfo.Procedure.XAxisColumn,
                        YAxisColumnName = config.GetInfo.Procedure.YAxisColumn,
                        SeriesColumnName = config.GetInfo.Procedure.SeriesColumn,
                        ElementID = "Chart 5",
                        Type = charttype
                    };

                    var slides = new List<SlideDetail>();
                    PowerpointReplace ppt = new PowerpointReplace();

                    slides.Add(new SlideDetail() { Charts = new List<ChartDetail>() { chartData }, SlideNo = 1 });
                    ppt.UpdateReport(destinationVirtualPath, slides, HttpContext.Current, null);
                }
            }
        }
        public void PreparePowerPointSlide(string filepath, string destFile, StoryBoardFilterInfo filter, string UserId)
        {
            
                if (filter.FromTimePeriod.ToLower().Trim() == "total") { filter.FromTimePeriod = "Total"; }
                //if (filter.ToTimePeriod.ToLower().Trim() == "total" && ) { filter.ToTimePeriod = "Total"; }
                if (filter.TimePeriodType.ToLower().Trim() == "total") { filter.TimePeriodType = "Total"; }
                ISlideReplace _slideReplace = new SlideReplace();
                string chartBarOrCol = "ChartDataCol", statTest = (filter.Filter[0].statOption.ToUpper() == "CUSTOM BASE") ? (filter.Filter[0].customBase == null ? "" : filter.Filter[0].customBase) : (filter.Filter[0].statOption);
                int slideNo = 0;
                using (Presentation pres = new Presentation(filepath))
                {
                    IList<ElementDetail> elements = new List<ElementDetail>();
                    IList<ChartDetail> charts = new List<ChartDetail>();
                    ICollection<TableDetail> tables = new List<TableDetail>();
                //if (filter.ChartType != "pyramidwithchange" && filter.ChartType != "barchange" && filter.ChartType != "pyramid")
                //{
                    if (filter.ChartType == "table")
                        pres.Slides[0].Remove();
                    else
                        pres.Slides[1].Remove();
                //}
                    int series_ind = 0, dp_index = 0;
                    var data = filter.Filter;
                    var OutputData = filter.OutputData;

                    if (data != null)
                    {
                        if (OutputData != null)
                        {
                            if (OutputData.Data == null)
                            {
                                //call the procedure and update the data.OutputData.Data data
                                OutputData.Data = (new ChartBO()).GetDataTable(data, filter.Module, "", filter.TimePeriodType, null, (filter.Filter[0].statOption.ToLower() == "custom base" ? filter.Filter[0].statOption : filter.Filter[0].customBase), filter.ToTimePeriod, filter.FromTimePeriod, UserId);
                            }
                            var shapes = pres.Slides[slideNo].Shapes;
                            var chrt_contextBar = shapes[slideNo];
                            var chrt_contextCol = shapes[slideNo];
                            System.Data.DataTable tb = OutputData.Data;
                            foreach (var item in shapes)
                            {
                                if (item.Name == "ChartDataBar")
                                {
                                    chrt_contextBar = item;
                                }
                                if (item.Name == "ChartDataCol")
                                {
                                    chrt_contextCol = item;
                                }
                                switch (item.Name)
                                {
                                    case "time_period":
                                        ((IAutoShape)item).TextFrame.Text = "Time Period : " + (filter.Filter[0].isTrendTable == "true" ? filter.FromTimePeriod + " to " + filter.ToTimePeriod : filter.FromTimePeriod);
                                        break;
                                    case "stat": ((IAutoShape)item).TextFrame.Text = "Stat tested at 95% CL against - " + statTest.ToUpper(); break;
                                    case "chart_title":
                                        ((IAutoShape)item).TextFrame.Paragraphs.Clear();
                                        ((IAutoShape)item).TextFrame.Paragraphs.Add(new Paragraph());
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Clear();
                                        if (filter.Module == "chartbeveragedeepdive" || filter.Module == "chartestablishmentdeepdive")
                                        {
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = tb.Rows[0]["Col2"].ToString() + "\n" });
                                        }
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = tb.Rows[0]["Col3"].ToString() });
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = "\n" + filter.infoPanel });
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontBold = NullableBool.True;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FontBold = NullableBool.True;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;


                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 12;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FontHeight = 9;

                                        ((IAutoShape)item).TextFrame.Paragraphs[0].ParagraphFormat.Alignment = TextAlignment.Center;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        if (filter.Module == "chartbeveragedeepdive" || filter.Module == "chartestablishmentdeepdive")
                                        {
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FontBold = NullableBool.True;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FontHeight = 9;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                                        }
                                        //((IAutoShape)item).TextFrame.Text = tb.Rows[0]["Col3"].ToString() + "\n" + filter.infoPanel;
                                        break;
                                    case "Comment": ((IAutoShape)item).TextFrame.Text = filter.Comment; break;
                                }
                        }

                        if (filter.ChartType == "table")
                        {
                            //pres.Slides[0].Remove();
                            
                            //table data

                            ITable table = (ITable)pres.Slides[0].Shapes.Where(x => x.Name == "TableData").FirstOrDefault();
                            var MetricList=OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Col1" });
                            var EstbList= OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Col2" });
                            var timeperiodList= OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Timeperiod" });
                            var MetricList1 = OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Col4" });
                            //header section
                            //((IAutoShape)pres.Slides[0].Shapes.FirstOrDefault(x => x.Name.Trim() == "chart_title")).TextFrame.Paragraphs[0].Text = " Traffic";
                            //((IAutoShape)pres.Slides[0].Shapes.FirstOrDefault(x => x.Name.Trim() == "chart_title")).TextFrame.Paragraphs[0].Text = " Traffic";
                            //((IAutoShape)pres.Slides[0].Shapes.FirstOrDefault(x => x.Name.Trim() == "chart_title")).TextFrame.Paragraphs[0].Text = " Traffic";
                            var IscustomBase = false;
                            var isPITtrend = filter.TimePeriodText;
                            var rowList = timeperiodList;
                            var colList = EstbList;
                            if (isPITtrend == "trend") {
                                if(filter.Module== "chartestablishmentdeepdive" || filter.Module == "chartbeveragedeepdive")
                                {
                                    rowList = timeperiodList;
                                    colList = MetricList1;
                                }
                                else { 
                                rowList = timeperiodList;
                                colList = EstbList;
                                }
                            }
                            else if (isPITtrend == "pit") {
                                if (filter.Module== "chartestablishmentdeepdive" || filter.Module=="chartbeveragedeepdive")
                                {
                                    rowList = MetricList1;
                                    colList = MetricList;
                                }
                                else { 
                                    rowList = EstbList;
                                    colList = MetricList;
                                }
                            }
                            resizeTable(rowList.Rows.Count, colList.Rows.Count, table);
                            for (var row = 0; row < rowList.Rows.Count; row++)//establishments in rows
                            {
                                table[row + 1, 0].TextFrame.Text = String.Format("{0:0}", rowList.Rows[row].ItemArray[0]);
                            }
                            for (var col = 0; col < colList.Rows.Count; col++)//metrics in columns
                            {
                                table[0, col + 1].TextFrame.Text = String.Format("{0:0}", colList.Rows[col].ItemArray[0]);
                            }
                            int index=-1;

                            if (isPITtrend == "pit") {
                            for(var _rowIndex = 1; _rowIndex < table.Rows.Count; _rowIndex++)
                            {
                                for(var _colIndex = 1; _colIndex < table.Columns.Count; _colIndex++)
                                {
                                    
                                    index += 1;
                                    table[_colIndex, _rowIndex].TextFrame.Text = OutputData.Data.DataSet.Tables[0].Rows[index]["MetricValue"] == DBNull.Value ? "" : String.Format("{0:P1}", OutputData.Data.DataSet.Tables[0].Rows[index]["MetricValue"]);
                                    table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                    IscustomBase=((OutputData.Data.DataSet.Tables[0].Rows[index][1]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim()== statTest.ToLower().Trim()) ? true : false;
                                    table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChangeObject(OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"]==DBNull.Value?null: OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"], OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"]==DBNull.Value?null: OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"], IscustomBase);
                                }
                                }
                            }
                            else if (isPITtrend == "trend")
                            {
                                for (var _colIndex = 1; _colIndex < table.Columns.Count; _colIndex++)
                                {
                                    for (var _rowIndex = 1; _rowIndex < table.Rows.Count; _rowIndex++)
                                    {

                                        index += 1;
                                        table[_colIndex, _rowIndex].TextFrame.Text = OutputData.Data.DataSet.Tables[0].Rows[index]["MetricValue"] == DBNull.Value ? "" : String.Format("{0:P1}", OutputData.Data.DataSet.Tables[0].Rows[index]["MetricValue"]);
                                        table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        IscustomBase = ((OutputData.Data.DataSet.Tables[0].Rows[index][4]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim() == statTest.ToLower().Trim()) ? true : false;
                                        table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChangeObject(OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"]==DBNull.Value?null: OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"], OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"]==DBNull.Value?null: OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"], IscustomBase);
                                    }
                                }

                            }
                            //insert sample size rows
                            if(OutputData.Data.DataSet.Tables[0].Rows[0][2].ToString()== "Satisfaction Drivers - Top 2 box" && isPITtrend=="pit")//sample size row for each metrics
                            {
                                index = -1;
                                for (var i = 1; i < (colList.Rows.Count)*2+1; i+=2)
                                {
                                    table.Rows.InsertClone(i,table.Rows[0], false);
                                    table[0, i].TextFrame.Text = "Sample Size";
                                    
                                    for (int _col = 0; _col < rowList.Rows.Count; _col++)
                                    {
                                        index += 1;
                                        if(index< OutputData.Data.DataSet.Tables[0].Rows.Count) { 
                                        table[_col + 1, i].TextFrame.Text = sampleSizeTextValue(OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]);//String.Format("{0:0}", OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]);
                                        //IscustomBase = ((OutputData.Data.DataSet.Tables[0].Rows[index][1]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim() == statTest.ToLower().Trim()) ? true : false;
                                        //table[_col + 1, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        //table[_col + 1, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = IscustomBase ? Color.Blue : Color.Black;
                                        }
                                    }
                                }
                            }
                            else if (isPITtrend == "trend")
                            {
                                index = -1;
                                for (var i = 1; i < (colList.Rows.Count) * 2 + 1; i += 2)
                                {
                                    table.Rows.InsertClone(i, table.Rows[0], false);
                                    table[0, i].TextFrame.Text = "Sample Size";

                                    //for (int _col = 0; _col < rowList.Rows.Count; _col++)
                                    //{
                                    //    index += 2;
                                    //    if (index < OutputData.Data.DataSet.Tables[0].Rows.Count)
                                    //        table[_col + 1, i].TextFrame.Text = sampleSizeTextValue(Convert.ToInt32(OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]));//String.Format("{0:0}", OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]);
                                    //}
                                }

                                for (var _colIndex = 1; _colIndex < table.Columns.Count; _colIndex++)
                                {
                                    for (var _rowIndex = 1; _rowIndex < table.Rows.Count; _rowIndex+=2)
                                    {
                                        index += 1;
                                        table[_colIndex, _rowIndex].TextFrame.Text = sampleSizeTextValue(OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]);
                                        //IscustomBase = ((OutputData.Data.DataSet.Tables[0].Rows[index][4]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim() == statTest.ToLower().Trim()) ? true : false;
                                        //table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        //table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = IscustomBase ? Color.Blue : Color.Black;
                                    }
                                }
                            }
                            else//sample size row in the beginning
                            {
                                table.Rows.InsertClone(0,table.Rows[0], false);
                                table[0, 1].TextFrame.Text = "Sample Size";
                                for(int _col = 0; _col < rowList.Rows.Count; _col++)
                                {
                                    table[_col+1,1].TextFrame.Text= sampleSizeTextValue(OutputData.Data.DataSet.Tables[0].Rows[_col]["TotalSampleSize"]);
                                    //IscustomBase = ((OutputData.Data.DataSet.Tables[0].Rows[_col][1]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim() == statTest.ToLower().Trim()) ? true : false;
                                    //table[_col + 1, 1].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                    //table[_col + 1, 1].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = IscustomBase ? Color.Blue : Color.Black;
                                }
                            }
                        }
                        #region pyramid
                        else if(filter.ChartType == "pyramid" || filter.ChartType == "pyramidwithchange")
                            {
                            
                            //Update the datatable
                            int ss = 0;
                                bool isChange = filter.ChartType == "pyramidwithchange";
                                IEnumerable<DataRow> distinct_samplesize_list = OutputData.Data.AsEnumerable().Where(x => Convert.ToString(x["TotalSamplesize"]) != "").GroupBy(x => x[OutputData.XColumn]).Select(x => x.FirstOrDefault());
                                OutputData.Data.Columns.Add("ColorForLabels");
                                foreach (DataRow item in OutputData.Data.Rows)
                                {
                                    item["ColorForLabels"] = "Black";
                                    int.TryParse(Convert.ToString(item["TotalSamplesize"]), out ss);
                                    if (ss == 0 || ss < 30)
                                    {
                                        //find the value 
                                        var tempSampleSizeVal = Convert.ToInt64(distinct_samplesize_list.Where(x => x.ItemArray.Contains(Convert.ToString(item[OutputData.XColumn]))).Select(x => x["TotalSamplesize"]).FirstOrDefault());
                                        item["TotalSamplesize"] = tempSampleSizeVal;
                                        item["MetricValue"] = 0.0;
                                        item["ColorForLabels"] = "Black";
                                    }
                                    else
                                    {
                                        if (ss >= 30 && ss <= 99)
                                        {
                                            item["ColorForLabels"] = (getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                            item["ColorForLabels"] = item["ColorForLabels"].ToString() == "Black" ? "Gray" : item["ColorForLabels"];
                                        }
                                        else
                                        {
                                            item["ColorForLabels"] = (getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                        }
                                        if (item[OutputData.XColumn].ToString() == filter.Filter[0].customBase) { item["ColorForLabels"] = "Blue"; }
                                    }
                                }
                                OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'");
                                List<string> allSeries = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                int slideno = 0, indx = 1;
                                //Delete chart if less than 4
                                if (4 > allSeries.Count)
                                {
                                    for (int j = 0; j < 4 - allSeries.Count; j++)
                                    {
                                        pres.Slides[slideno].Shapes.Remove(pres.Slides[slideno].Shapes.Where(x => x.Name == "chart" + (4 - j)).FirstOrDefault());
                                        if (isChange)
                                        {
                                            pres.Slides[slideno].Shapes.Remove(pres.Slides[slideno].Shapes.Where(x => x.Name == "ch" + (4 - j)).FirstOrDefault());
                                            pres.Slides[slideno].Shapes.Remove(pres.Slides[slideno].Shapes.Where(x => x.Name == "table" + (4 - j)).FirstOrDefault());
                                        }
                                    }
                                }
                                for (int i = 1; i <= allSeries.Count; i++)
                                {
                                    //Plot charts
                                    plotIndividualPyramid(allSeries[i - 1], OutputData, pres.Slides[slideno], indx, i - 1, isChange);
                                    if (i % 4 == 0)
                                    {
                                        indx = 1;
                                        if (i + 1 <= allSeries.Count)
                                        {
                                            //Add slides if required
                                            pres.Slides.AddClone(pres.Slides[0]); slideno++;
                                            //Delete the charts if not required
                                            if (i + 4 > allSeries.Count)
                                            {
                                                for (int j = 0; j < ((i + 4) - allSeries.Count); j++)
                                                {
                                                    pres.Slides[slideno].Shapes.Remove(pres.Slides[slideno].Shapes.Where(x => x.Name == "chart" + (4 - j)).FirstOrDefault());
                                                    if (isChange)
                                                    {
                                                        pres.Slides[slideno].Shapes.Remove(pres.Slides[slideno].Shapes.Where(x => x.Name == "ch" + (4 - j)).FirstOrDefault());
                                                        pres.Slides[slideno].Shapes.Remove(pres.Slides[slideno].Shapes.Where(x => x.Name == "table" + (4 - j)).FirstOrDefault());
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else { indx++; }
                                }
                            }
                            #endregion pyramid
                           
                            else
                            {
                            
                            #region ChartPlot
                            if (OutputData.ChartType.Contains("bar") || OutputData.ChartType.Contains("Bar"))
                                {
                                    chartBarOrCol = "ChartDataBar";
                                    pres.Slides[0].Shapes.Remove(chrt_contextCol);
                                }
                                else
                                {
                                    pres.Slides[0].Shapes.Remove(chrt_contextBar);
                                }
                                if (OutputData.ChartType == "table")
                                {
                                    //create table here
                                    double[] cols = new double[OutputData.Data.Columns.Count];
                                    double[] rows = new double[OutputData.Data.Rows.Count];
                                    for (int i = 0; i < cols.Length; i++)
                                    {
                                        cols[i] = 50.0;
                                    }
                                    for (int i = 0; i < rows.Length; i++)
                                    {
                                        rows[i] = 10.0;
                                    }
                                    var table = pres.Slides[slideNo].Shapes.AddTable(5, 5, cols, rows);
                                    table.Name = "TableData";
                                    foreach (IRow row in table.Rows)
                                    {
                                        foreach (ICell cell in row)
                                        {

                                            //Get text frame of each cell
                                            ITextFrame tf = cell.TextFrame;
                                            //Set font size of 10
                                            tf.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 10;
                                            tf.Paragraphs[0].ParagraphFormat.Bullet.Type = BulletType.None;
                                        }
                                    }
                                    tables.Add(new TableDetail()
                                    {
                                        ElementID = "TableData",
                                        Data = OutputData.Data,
                                        IsReplace = true,
                                        ConvertNullToZero = true,
                                        SkipDataTableHeaders = false
                                    });
                                    _slideReplace.ReplaceShape(pres.Slides[slideNo++], new SlideDetail() { Elements = elements, Tables = tables });
                                    pres.Slides[0].Shapes.Remove(chrt_contextBar);
                                    pres.Slides[0].Shapes.Remove(chrt_contextCol);
                                }
                                else
                                {
                                    var dl = new Aq.Plugin.AsposeExport.Domain.DataLabel();
                                    if (OutputData.ChartType.Contains("Stack"))
                                    {
                                        //dl.LabelBackGroundColor = Color.White;
                                        dl.LabelBackGroundColor = Color.FromArgb(179, Color.White);
                                    }
                                    if (filter.ChartType == "trend")
                                    {
                                        string temp = OutputData.XColumn;
                                        OutputData.XColumn = OutputData.SerisColumn;
                                        OutputData.SerisColumn = temp;
                                    }
                                    //if any row contains empty value for sample size replace it
                                    int ss = 0;
                                    IEnumerable<DataRow> distinct_samplesize_list = OutputData.Data.AsEnumerable().Where(x => Convert.ToString(x["TotalSamplesize"]) != "").GroupBy(x => x[OutputData.XColumn]).Select(x => x.FirstOrDefault());
                                    OutputData.Data.Columns.Add("ColorForLabels");
                                    foreach (DataRow item in OutputData.Data.Rows)
                                    {
                                        item["ColorForLabels"] = "Black";
                                        int.TryParse(Convert.ToString(item["TotalSamplesize"]), out ss);
                                        if (ss == 0 || ss < 30)
                                        {
                                            //find the value 
                                            var tempSampleSizeVal = Convert.ToInt64(distinct_samplesize_list.Where(x => x.ItemArray.Contains(Convert.ToString(item[OutputData.XColumn]))).Select(x => x["TotalSamplesize"]).FirstOrDefault());
                                            item["TotalSamplesize"] = tempSampleSizeVal;
                                            item["MetricValue"] = 0.0;
                                            item["ColorForLabels"] = "Transparent";
                                        }
                                        else
                                        {
                                            if (ss >= 30 && ss <= 99)
                                            {
                                                item["ColorForLabels"] = (getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                                item["ColorForLabels"] = item["ColorForLabels"].ToString() == "Black" ? "Gray" : item["ColorForLabels"];
                                            }
                                            else
                                            {
                                                item["ColorForLabels"] = (getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                            }
                                            if (item[OutputData.XColumn].ToString() == filter.Filter[0].customBase) { item["ColorForLabels"] = "Blue"; }
                                        }
                                    }
                                    /*For custom base and stat value //START*/
                                    List<string> seriesPointList = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct().ToList();
                                    List<string> dataPointList = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                    Color[,] labelColors = new Color[seriesPointList.Count, dataPointList.Count];
                                    var isServiceDrive = OutputData.Data.AsEnumerable().Where(x => Convert.ToString(x["Col3"]) == "Satisfaction Drivers - Top 2 box").Distinct().ToList();
                                    foreach (var sp in seriesPointList)
                                    {
                                        dp_index = 0;
                                        foreach (var dp in dataPointList)
                                        {
                                            //Check color and store in labelcolors
                                            var obj = OutputData.Data.AsEnumerable().Where(x => Convert.ToString(x[OutputData.SerisColumn]) == sp && Convert.ToString(x[OutputData.XColumn]) == dp).FirstOrDefault();
                                            labelColors[series_ind, dp_index] = obj == null ? Color.Black : Color.FromName((string)obj["ColorForLabels"]);
                                            dp_index++;
                                        }
                                        series_ind++;
                                    }
                                    /*For custom base and stat value //END*/
                                    if (filter.ChartType == "trend")
                                    {
                                        //var tempData = (from DataRow dr in OutputData.Data.Rows
                                        // select dr["TotalSamplesize"]).FirstOrDefault();
                                        //int tempSS = tempData == null?0:Convert.ToInt32(tempData);
                                        //If module is compare and establishemnts or beverages are multiple then Sample size sholud be NA
                                        int flag_SS = 1;
                                        if (filter.Module == "chartbeveragecompare") { flag_SS = filter.Filter.FirstOrDefault(x => x.Name == "Beverage").Data.Count(); }
                                        if (filter.Module == "chartestablishmentcompare") { flag_SS = filter.Filter.FirstOrDefault(x => x.Name == "Establishment").Data.Count(); }
                                        if (filter.Module == "chartbeveragedeepdive" || filter.Module == "chartestablishmentdeepdive")
                                        {
                                            flag_SS = filter.Filter.FirstOrDefault(x => x.Name == "Measures").Data.Count();
                                            if (flag_SS <= 1)
                                            {
                                                flag_SS = filter.Filter.FirstOrDefault(x => x.Name == "Metric Comparisons").Data.Count();
                                            }
                                        }
                                        if (flag_SS > 1)
                                        {
                                            OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'(' +'NA' + ')'");
                                        }
                                        else { OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'"); }
                                    }
                                    else
                                    {
                                        //If Satisfaction Drivers is there : Make SS NA
                                        if (isServiceDrive != null && isServiceDrive.Count > 0)
                                        {
                                            OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+'NA'+')'");
                                        }
                                        else
                                        {
                                            OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'");
                                        }
                                    }
                                    charts.Add(new ChartDetail()
                                    {
                                        //ChartTitle = tb.Rows[0]["Col3"].ToString() + "\n" + filter.infoPanel,
                                        ElementID = chartBarOrCol,
                                        Data = OutputData.Data,
                                        XAxisColumnName = "XColumnWithSampleSize",//OutputData.XColumn,
                                        YAxisColumnName = OutputData.YColumn,
                                        SeriesColumnName = OutputData.SerisColumn,
                                        Type = getAsposeChartType(OutputData.ChartType),
                                        ShowLabel = true,
                                        LabelFormat = dl,
                                        DataFormat = "#######0.0%",
                                        DataLabelFontHeight = 8,
                                        Font = new FontData("Franklin Gothic Book"),
                                        FontHeight = 8
                                    });
                                    _slideReplace.ReplaceShape(pres.Slides[slideNo++], new SlideDetail() { Elements = elements, Charts = charts });
                                    #region If Bar with Change then Plot table
                                    if (filter.ChartType == "barchange")
                                    {
                                        ITable tbl = ((ITable)pres.Slides[0].Shapes.Where(x => x.Name == "table").FirstOrDefault());
                                        List<string> ser = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct().ToList();
                                        List<string> xCol = OutputData.Data.AsEnumerable().Select(x => x.Field<string>("XColumnWithSampleSize")).Distinct().ToList();
                                        List<string> xValues = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                        foreach (var item in ser)
                                        {
                                            tbl.Rows.AddClone(tbl.Rows[0], true);
                                        }

                                        //Add columns
                                        foreach (var item in xCol)
                                        {
                                            tbl.Columns.AddClone(tbl.Columns[0], true);
                                        }
                                        for (int i = 0; i < ser.Count; i++)
                                        {
                                            //Fill the first column
                                            tbl[0, 1 + i].TextFrame.Text = ser[i];
                                            for (int j = 0; j < xCol.Count; j++)
                                            {
                                                if (i == 0) { tbl[1 + j, 0].TextFrame.Text = xCol[j]; }
                                                //Fill the Change values
                                                var tmp = OutputData.Data.AsEnumerable().Where(x => x.Field<string>(OutputData.SerisColumn) == ser[i] && x.Field<string>("XColumnWithSampleSize") == xCol[j]).FirstOrDefault();
                                                tbl[1 + j, 1 + i].TextFrame.Text = (tmp["Change"] == DBNull.Value || tmp["Change"].ToString() == "" || Convert.ToInt32(tmp["TotalSamplesize"]) < 30) ? "NA" : (100 * Convert.ToDouble(tmp["Change"])).ToString("##0.0");
                                                tbl[1 + j, 1 + i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                if (tbl[1 + j, 1 + i].TextFrame.Text == "NA")
                                                    tbl[1 + j, 1 + i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                                                else
                                                    tbl[1 + j, 1 + i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChange(tmp["SignificanceValue"] == DBNull.Value ? 0 : Convert.ToDouble(tmp["SignificanceValue"]), tmp["TotalSamplesize"] == DBNull.Value ? 0 : Convert.ToInt32(tmp["TotalSamplesize"]), (xValues[j] == (filter.Filter[0].customBase == null ? "" : filter.Filter[0].customBase)));
                                            }
                                        }
                                        foreach (var item in tbl.Columns)
                                        {
                                            item.Width = 933.2 / (xCol.Count + 1);
                                        }
                                        //Set First cell value
                                        tbl[0, 0].TextFrame.Text = "Change vs " + (filter.Filter[0].statOption.ToLower() == "custom base" ? filter.Filter[0].customBase.ToUpper() : filter.Filter[0].statOption.ToUpper());
                                        tbl[0, 0].FillFormat.FillType = FillType.Solid;
                                        tbl[0, 0].FillFormat.SolidFillColor.Color = Color.FromArgb(128, 128, 128);
                                        tbl[0, 0].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        tbl[0, 0].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.White;
                                    }
                                    #endregion If Bar with Change then Plot table
                                    #region Adding Custom base and Stat Value
                                    IChart chart_to_change_dataLabelColors = (IChart)pres.Slides[slideNo - 1].Shapes.Where(x => x.Name == chartBarOrCol).FirstOrDefault();
                                    if (chartBarOrCol.Contains("Bar"))
                                    {
                                        chart_to_change_dataLabelColors.Axes.VerticalAxis.IsPlotOrderReversed = true;
                                    }
                                    IChartDataWorkbook workbook = chart_to_change_dataLabelColors.ChartData.ChartDataWorkbook;
                                    series_ind = 0; dp_index = 0;
                                    foreach (var temp_series in chart_to_change_dataLabelColors.ChartData.Series)
                                    {
                                        temp_series.Format.Fill.FillType = FillType.Solid;
                                        temp_series.Format.Fill.SolidFillColor.Color = (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);
                                        if (temp_series.Type == ChartType.LineWithMarkers)
                                        {
                                            temp_series.Format.Line.FillFormat.FillType = FillType.Solid;
                                            temp_series.Format.Line.FillFormat.SolidFillColor.Color = (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);
                                            temp_series.Format.Line.DashStyle = LineDashStyle.SystemDot;
                                            temp_series.Format.Line.Width = 3;
                                            temp_series.Marker.Format.Fill.FillType = FillType.Solid;
                                            temp_series.Marker.Format.Fill.SolidFillColor.Color = (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]);
                                            //Added marker outer border for line chart-starts here
                                            temp_series.Marker.Size = 9;
                                            temp_series.Marker.Symbol = MarkerStyleType.Circle;//Triangle
                                            temp_series.Marker.Format.Line.FillFormat.FillType = FillType.Gradient;
                                            temp_series.Marker.Format.Line.Width = 3.5;
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientShape = GradientShape.Path;
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Clear();
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.5, Color.White);
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.5, Color.White);
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.6, (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]));
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)1.0, (series_ind >= _CurrentColors.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(_CurrentColors[series_ind]));
                                        }
                                        dp_index = 0;
                                        foreach (var datapoints in temp_series.DataPoints)
                                        {
                                            datapoints.Label.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                                            datapoints.Label.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = labelColors[series_ind, dp_index];
                                            if (temp_series.Type == ChartType.LineWithMarkers)
                                            {
                                                datapoints.Label.DataLabelFormat.Position = LegendDataLabelPosition.Top;
                                            }
                                            if (labelColors[series_ind, dp_index] == Color.Transparent && temp_series.Type == ChartType.LineWithMarkers)
                                            {
                                                datapoints.Format.Line.FillFormat.FillType = FillType.Solid;
                                                datapoints.Format.Line.FillFormat.SolidFillColor.Color = Color.Transparent;
                                                datapoints.Format.Line.DashStyle = LineDashStyle.SystemDot;
                                                datapoints.Format.Line.Width = 3;
                                                datapoints.Marker.Format.Fill.FillType = FillType.Solid;
                                                datapoints.Marker.Format.Fill.SolidFillColor.Color = Color.Transparent;
                                                //Added marker outer border for line chart-starts here
                                                datapoints.Marker.Size = 9;
                                                datapoints.Marker.Symbol = MarkerStyleType.Circle;//Triangle
                                                datapoints.Marker.Format.Line.FillFormat.FillType = FillType.Gradient;
                                                datapoints.Marker.Format.Line.Width = 3.5;
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientShape = GradientShape.Path;
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientDirection = GradientDirection.FromCenter;
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Clear();
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.5, Color.Transparent);
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.5, Color.Transparent);
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.6, Color.Transparent);
                                                datapoints.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)1.0, Color.Transparent);
                                                //break the line
                                                if (temp_series.DataPoints.Count > (dp_index + 1)) { temp_series.DataPoints[dp_index + 1].Format.Line.FillFormat.FillType = FillType.NoFill; }
                                            }
                                            dp_index++;


                                        }
                                        series_ind++;
                                    }
                                    /*Start If trend Chart then make the Y axis dynamic according to the max value */
                                    if (filter.Filter[0].isTrendTable == "true" || filter.ChartType == "barchange")
                                    {
                                        double maxTrendVal = Convert.ToDouble(OutputData.Data.Compute("max([" + OutputData.YColumn + "])", string.Empty));
                                        maxTrendVal = maxTrendVal * 100;
                                        if (filter.ChartType == "barchange")
                                            maxTrendVal = ((Math.Ceiling(maxTrendVal + 5) + (5 - Math.Ceiling(maxTrendVal % 10))) / 100);
                                        else
                                            maxTrendVal = ((Math.Ceiling(maxTrendVal + 10) + (10 - Math.Ceiling(maxTrendVal % 10))) / 100);

                                        if (maxTrendVal > 1)
                                        {
                                            maxTrendVal = 1;
                                        }
                                        if (filter.ChartType == "barchange")
                                        {
                                            chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
                                            chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMinValue = false;
                                            chart_to_change_dataLabelColors.Axes.HorizontalAxis.MaxValue = maxTrendVal;
                                            chart_to_change_dataLabelColors.Axes.HorizontalAxis.MinValue = 0;
                                        }
                                        else
                                        {
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsAutomaticMaxValue = false;
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsAutomaticMinValue = false;
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.MaxValue = maxTrendVal;
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.MinValue = 0;
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsVisible = true;
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsNumberFormatLinkedToSource = false;
                                            chart_to_change_dataLabelColors.Axes.VerticalAxis.NumberFormat = "##0%";
                                        }
                                    }
                                    /*End If trend Chart then make the Y axis dynamic according to the max value */
                                    #endregion Adding Custom base and Stat Value
                                }
                                #endregion ChartPlot
                            }
                        }
                    }
                    pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);
                
            }
        }
        private Color getColorForChangeObject(object sig, object ss, bool v3)
        {
            if (ss == null)
                return Color.Transparent;
            else if (Convert.ToInt32(ss) < 30)
                return Color.Transparent;
            else if (v3)
                return Color.Blue;
            else if (sig != null && ss != null)
                return getColorForChange(Convert.ToDouble(sig), Convert.ToInt32(ss), v3);
            else
                return Color.Black;
        }

        private string sampleSizeTextValue(object sampleSize)
        {
            if (Convert.ToString(sampleSize)=="")
                return "NA";
            else
            if (Convert.ToInt32(sampleSize) < 30)
                return sampleSize + "(low sample size)";
            else if (Convert.ToInt32(sampleSize) >= 30 && Convert.ToInt32(sampleSize) < 99)
                return sampleSize + "(use directionally)";
            else
                return string.Format("{0:n0}", sampleSize);
        }
        
        private void resizeTable(int _row, int _col, ITable table)
        {
            int j = 0; int k = 0;
            for (j = 0; j < _row + 1; j++)
            {
                if (_row + 1 > table.Columns.Count)//insert new columns
                {
                    table.Columns.AddClone(table.Columns[0], false);
                }
                for (k = 0; k < _col + 1; k++)//add new rows
                {
                    if (_col + 1 > table.Rows.Count)
                    {
                        table.Rows.AddClone(table.Rows[0], false);
                    }
                }
            }
            for (int m = table.Columns.Count - 1; m >= j; m--)
            {
                table.Columns.RemoveAt(m, false);
            }
            for (int n = table.Rows.Count - 1; n >= k; n--)
            {
                table.Rows.RemoveAt(n, false);
            }
            for(var col = 0; col < table.Columns.Count; col++)
            {
                if (col == 0)
                    table.Columns[col].Width = 250;
                else
                    table.Columns[col].Width = (900 - 250 )/ _row;
            }
        }
        public void plotIndividualPyramid(string series, StoryBoardSlideData dt, ISlide sld, int indx, int serInd, bool isChange)
        {
            int i = 0, defaultIndex = 0; bool isCustom = false;
            //Grab the chart
            IChart chrt = (IChart)sld.Shapes.Where(x => x.Name == "chart" + indx).FirstOrDefault();
            IChartDataWorkbook fact = chrt.ChartData.ChartDataWorkbook;
            //Get all the categories
            System.Data.DataTable mt = dt.Data.AsEnumerable().Reverse().CopyToDataTable();
            List<string> category = mt.AsEnumerable().Where(x => x.Field<string>(dt.XColumn) == series).Select(x => x.Field<string>(dt.SerisColumn)).Distinct().ToList();
            //Clear series
            chrt.ChartData.Series.Clear();
            //Add series
            chrt.ChartData.Series.Add(fact.GetCell(defaultIndex, 0, 1, "Series1"), chrt.Type);
            chrt.ChartData.Series.Add(fact.GetCell(defaultIndex, 0, 2, series), chrt.Type);
            chrt.ChartData.Series.Add(fact.GetCell(defaultIndex, 0, 3, "Series3"), chrt.Type);
            //Clear categories
            chrt.ChartData.Categories.Clear(); i = 0;
            //Add all categories
            foreach (var item in category)
            {
                chrt.ChartData.Categories.Add(fact.GetCell(defaultIndex, i + 1, 0, item)); i++;
            }
            i = 0;
            //Add the DataPoints
            foreach (var item in category)
            {
                DataRow dr = dt.Data.AsEnumerable().Where(x => x.Field<string>(dt.XColumn) == series && x.Field<string>(dt.SerisColumn) == item).FirstOrDefault();
                double mv = 0.0;//dr["MetricValue"] == DBNull.Value ? 0 : Convert.ToDouble(dr["MetricValue"]);
                if (!double.TryParse(Convert.ToString(dr["MetricValue"]), out mv)) mv = 0.0;
                //1st & 3rd series
                chrt.ChartData.Series[0].DataPoints.AddDataPointForBarSeries(fact.GetCell(defaultIndex, i + 1, 1, (1 - mv) / 2));
                chrt.ChartData.Series[2].DataPoints.AddDataPointForBarSeries(fact.GetCell(defaultIndex, i + 1, 3, (1 - mv) / 2));
                chrt.ChartData.Series[0].DataPoints[i].Label.Hide();
                chrt.ChartData.Series[2].DataPoints[i].Label.Hide();
                //2nd series
                chrt.ChartData.Series[1].DataPoints.AddDataPointForBarSeries(fact.GetCell(defaultIndex, i + 1, 2, mv));
                //Assign significance color & stat value
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.ShowValue = true;
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.NumberFormat = "#0.0%";
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.Format.Fill.FillType = FillType.Solid;
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.Format.Fill.SolidFillColor.Color = (new ReportDine()).returnStatTestColor(dr, isCustom) == Color.Transparent ? Color.Transparent : Color.White;
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.TextFormat.PortionFormat.FontHeight = 10;
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                chrt.ChartData.Series[1].DataPoints[i].Label.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = dr["ColorForLabels"].ToString() == "Blue" ? Color.Blue : (new ReportDine()).returnStatTestColor(dr, isCustom);
                i++;
            }
            //Set color of Series
            chrt.ChartData.Series[0].Format.Fill.FillType = FillType.Solid;
            chrt.ChartData.Series[1].Format.Fill.FillType = FillType.Solid;
            chrt.ChartData.Series[2].Format.Fill.FillType = FillType.Solid;
            chrt.ChartData.Series[0].Format.Fill.SolidFillColor.Color = Color.Transparent;
            chrt.ChartData.Series[2].Format.Fill.SolidFillColor.Color = Color.Transparent;
            chrt.ChartData.Series[1].Format.Fill.SolidFillColor.Color = (serInd >= _CurrentColors.Length) ? GlobalConstants.LegendColors[serInd] : ColorTranslator.FromHtml(_CurrentColors[serInd]); ;
            //Set Overlap and Gapwidth
            chrt.ChartData.Series[0].ParentSeriesGroup.Overlap = 100; chrt.ChartData.Series[0].ParentSeriesGroup.GapWidth = 0;
            //Set chartTitle
            chrt.Axes.HorizontalAxis.Title.AddTextFrameForOverriding(dt.Data.AsEnumerable().Where(x => x.Field<string>(dt.XColumn) == series).FirstOrDefault()["XColumnWithSamplesize"].ToString());
            //If change is there then Modify the table
            if (isChange)
            {
                //Grab the table
                ITable tbl1 = (ITable)sld.Shapes.Where(x => x.Name == "table" + indx).FirstOrDefault();
                //Create a new table of same dimmension
                int len = (category.Count + 1);
                double[] rows = new double[len];
                for (i = 0; i < category.Count; i++) { rows[i] = (tbl1.Height - 10) / category.Count; }
                rows[category.Count] = 10;
                double[] cols = new double[] { tbl1.Columns[0].Width };
                ITable tbl = sld.Shapes.AddTable(tbl1.X, tbl1.Y, cols, rows);
                tbl.FillFormat.FillType = FillType.Solid;
                tbl.FillFormat.SolidFillColor.Color = Color.FromArgb(250, 250, 250);
                category.Reverse();
                for (i = 0; i < category.Count; i++)
                {
                    tbl[0, i].BorderTop.FillFormat.FillType = FillType.NoFill;
                    tbl[0, i].BorderBottom.FillFormat.FillType = FillType.NoFill;
                    tbl[0, i].BorderLeft.FillFormat.FillType = FillType.NoFill;
                    tbl[0, i].BorderRight.FillFormat.FillType = FillType.NoFill;
                    DataRow dr = dt.Data.AsEnumerable().Where(x => x.Field<string>(dt.XColumn) == series && x.Field<string>(dt.SerisColumn) == category[i]).FirstOrDefault();
                    double mv = dr["Change"] == DBNull.Value ? 0 : Convert.ToDouble(dr["Change"]);
                    if (dr["Change"] == DBNull.Value)
                    {
                        tbl[0, i].TextFrame.Text = "NA";
                    }
                    else { tbl[0, i].TextFrame.Text = (100 * mv).ToString("#0.0"); }
                    tbl[0, i].TextFrame.TextFrameFormat.CenterText = NullableBool.True;
                    tbl[0, i].TextFrame.TextFrameFormat.TextStyle.DefaultParagraphFormat.Alignment = TextAlignment.Center;
                    tbl[0, i].FillFormat.FillType = FillType.Solid;
                    tbl[0, i].FillFormat.SolidFillColor.Color = Color.FromArgb(250, 250, 250);
                    //Set font to Franklin Gothic Book
                    tbl[0, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                    tbl[0, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 10;
                    tbl[0, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontBold = NullableBool.False;
                    tbl[0, i].TextFrame.Paragraphs[0].ParagraphFormat.Alignment = TextAlignment.Center;
                    tbl[0, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                    tbl[0, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = dr["ColorForLabels"].ToString() == "Blue" ? Color.Blue : (new ReportDine()).returnStatTestColor(dr, isCustom);
                }
                tbl[0, i].FillFormat.FillType = FillType.Solid;
                tbl[0, i].FillFormat.SolidFillColor.Color = Color.FromArgb(250, 250, 250);
                tbl[0, i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 2;
                sld.Shapes.Remove(tbl1);
                tbl.Name = "table" + indx;
            }
        }
        public Color getColorForChange(double sig, int ss, bool isCustom)
        {
            if (isCustom) return Color.Blue;
            if (ss == null || ss < 30) return Color.Transparent;
            if (sig != null && sig < -1.96) return Color.Red;
            if (sig != null && sig > 1.96) return Color.Green;
            if (ss < 100) return Color.Gray;
            return Color.Black;
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
        public void PrepareExcelForChartTable(string filepath, string destFile, StoryBoardFilterInfo filter, string measureType, string frequency, string tableTitle, string customBaseText, string selectedDemofiltersList, string selectedAdvanceFitlersList, string measureParentName, string UserId)
        {
            if (filter.FromTimePeriod.ToLower().Trim() == "total") { filter.FromTimePeriod = "Total"; }
            if (filter.TimePeriodType.ToLower().Trim() == "total") { filter.TimePeriodType = "Total"; }
            //if(filter.Filter.FirstOrDefault(x => x.Name == "Name")
            var isVisits = 1;
            if (filter.Filter[0].IsVisit == "1")
                isVisits = 1;
            else
                isVisits = 0;

            var data = filter.Filter;
            var OutputData = filter.OutputData;
            if (data != null)
            {
                if (OutputData != null)
                {
                    if (OutputData.Data == null)
                    {
                        //call the procedure and update the data.OutputData.Data datatimer
                        OutputData.Data = (new ChartBO()).GetDataTable(data, filter.Module, "", filter.TimePeriodType, null, (filter.Filter[0].statOption.ToLower() == "custom base" ? filter.Filter[0].statOption : filter.Filter[0].customBase), filter.ToTimePeriod, filter.FromTimePeriod, UserId);
                    }
                    //Code to prepare excel
                    try
                    {
                        var distinctCol1Col2 = OutputData.Data.Rows
                             .Cast<DataRow>()
                             .Where(x => x[OutputData.XColumn].ToString() == customBaseText)
                             .Select(x => new Framework.Models.Chart.CalStatTestForExcel
                             {
                                 Col1 = Convert.ToString(x[OutputData.SerisColumn]),
                                 Col2 = Convert.ToString(x[OutputData.XColumn]),
                                 BenchMarkPercentage = x["Metricvalue"] == DBNull.Value ? 0.0 : Convert.ToDouble(x["Metricvalue"]),
                                 BenchMarkSampleSize = x["TotalSamplesize"] == DBNull.Value ? 0 : Convert.ToInt32(x["TotalSamplesize"])
                             })
                             .ToList().Distinct().ToList();
                        #region custombase calculation


                        //System.Data.DataTable dt = OutputData.Data.Clone();
                        //dt.Columns["Statvalue"].DataType = typeof(double);
                        //foreach (DataRow rows in OutputData.Data.Rows)
                        //{
                        //    dt.ImportRow(rows);
                        //}

                        //foreach (var objective in distinctCol1Col2)
                        //{
                        //    foreach (DataRow rows in dt.Rows)
                        //    {
                        //        int sampleSize = 0; double metricvalue = 0.0;
                        //        if (!int.TryParse(Convert.ToString(rows["Samplesize"]), out sampleSize)) sampleSize = 0;
                        //        if (!double.TryParse(Convert.ToString(rows["Metricvalue"]), out metricvalue)) metricvalue = 0.0;

                        //        if (objective.Col1.ToString() == rows[OutputData.SerisColumn].ToString() && objective.Col2.ToString() != rows[OutputData.XColumn].ToString())
                        //        {
                        //            double? statValue = Calculation.GetStatValue(rows["Samplesize"] == DBNull.Value ? null : (int?)sampleSize, rows["Metricvalue"] == DBNull.Value ? null : (double?)metricvalue, objective.BenchMarkSampleSize, objective.BenchMarkPercentage);

                        //            if (statValue != null)
                        //                rows["Statvalue"] = Convert.ToDouble(statValue);
                        //        }
                        //    }
                        //}
                        //OutputData.Data = dt;
                        #endregion custombase

                        var file = new FileInfo(destFile);
                        System.IO.File.Copy(filepath, destFile, true);
                        //If new trend table structure?
                        bool isTrendNewStruct = false; int mult = 1, addFact = 0;
                        if (filter.Filter[0].isTrendTable == "true")
                        {
                            switch (filter.Module)
                            {
                                case "chartestablishmentcompare": if (data.Where(x => x.Name == "Establishment").FirstOrDefault().Data.Count() > 1) { isTrendNewStruct = true; addFact = 1; mult = 2; } break;
                                case "chartbeveragecompare": if (data.Where(x => x.Name == "Beverage").FirstOrDefault().Data.Count() > 1) { isTrendNewStruct = true; addFact = 1; mult = 2; } break;
                                case "chartestablishmentdeepdive":
                                case "chartbeveragedeepdive":
                                    //If measures are multiple or Metric Comparison
                                    if (filter.Filter.Where(x => x.Name == "Measures").FirstOrDefault().Data.Count() > 1)
                                    {
                                        isTrendNewStruct = true; mult = 2; addFact = 1;
                                        OutputData.SerisColumn = "Col4";
                                    }
                                    if (filter.Filter.Where(x => x.Name == "Metric Comparisons").FirstOrDefault().Data.Count() > 1)
                                    { isTrendNewStruct = true; mult = 2; addFact = 1;
                                        OutputData.SerisColumn = "Col4";
                                    }
                                    break;
                            }
                        }
                        using (ExcelPackage p = new ExcelPackage(file))
                        {
                            ExcelWorksheet ws1;
                            ws1 = p.Workbook.Worksheets[1];
                            List<string> ObjectiveList = new List<string>();
                            List<string> MetricList = new List<string>();
                            bool SatisDriTop2Box = false;
                            if (measureParentName == "Satisfaction Drivers - Top 2 box")
                                SatisDriTop2Box = true;
                            System.Data.DataTable t = OutputData.Data;
                            
                            ObjectiveList = t.AsEnumerable().Select(x => x[OutputData.XColumn].ToString()).ToList().Distinct().ToList();
                            MetricList = t.AsEnumerable().Select(x => x[OutputData.SerisColumn].ToString()).ToList().Distinct().ToList();
                            int i = 0, j = 0;
                            ws1.Name = "Dine Chart Table";
                            //hide grid lines
                            ws1.View.ShowGridLines = false;
                            ws1.Cells[2, 3].Value = filter.Filter[0].isTrendTable == "true" ? filter.FromTimePeriod + " to " + filter.ToTimePeriod : filter.FromTimePeriod;//filter.i; //OutputData.Data.Rows[0]["Timeperiod"].ToString().ToLower() =="total" ? "Total" : OutputData.Data.Rows[0]["Timeperiod"];
                            if (measureParentName == "Establishment Frequency (Base: Total US Population)")
                                ws1.Cells[3, 3].Value = "NA";
                            else if (isVisits == 1 && frequency == "")
                                ws1.Cells[3, 3].Value = "Total Visits";
                            else if (isVisits == 1)
                                ws1.Cells[3, 3].Value = frequency.ToLower().Trim() == "total visits" ? frequency : "Total Visits" + "(" + frequency + ")";
                            else
                                ws1.Cells[3, 3].Value = frequency;

                            if (isVisits == 1)
                                ws1.Cells[3, 4].Value = "Visits: ";
                            else
                                ws1.Cells[3, 4].Value = "Guests: ";
                            ws1.Cells[3, 5].Value = selectedAdvanceFitlersList;
                            ws1.Cells[4, 4].Value = "Demographic Filters: ";
                            ws1.Cells[4, 5].Value = selectedDemofiltersList;
                            string statTest = customBaseText != "" ? customBaseText : ToTitleCase(filter.Filter.FirstOrDefault(x => x.Name == "StatTest").SelectedText.ToString());
                            ws1.Cells[4, 6].Value = "*Stat Tested At 95% CL Against - " + statTest;
                            ws1.Column(6).Width = 40;

                            ws1.Cells[2, 4].Value = "Measure :" + measureParentName;
                            

                            if (filter.Comment != null && filter.Comment != "" && filter.Comment != " ")
                                ws1.Cells[2, 5].Value = "Comment :" + filter.Comment;

                            if (filter.Module == "chartestablishmentdeepdive")
                            {
                                ws1.Cells[4, 2].Value = "Establishment:";

                                ws1.Cells[4, 3].Value = filter.Filter.FirstOrDefault(x => x.Name == "Establishment").Data.Select(x => x.Text).ToList()[0].ToString();
                            }
                            else if (filter.Module == "chartbeveragedeepdive")
                            {
                                ws1.Cells[4, 2].Value = "Beverage:";
                                ws1.Cells[4, 3].Value = filter.Filter.FirstOrDefault(x => x.Name == "Beverage").Data.Select(x => x.Text).ToList()[0].ToString();
                            }
                            ws1.Cells[5, 2, 5, ObjectiveList.Count() + 1].Merge = true;
                            ws1.Cells[5, 2, 5, ObjectiveList.Count() + 1].Value = filter.Filter[0].isTrendTable == "true" ? "Time Period(s)" : tableTitle;
                            ws1.Cells[5, 2, 5, ObjectiveList.Count() + 1].Style.Font.Bold = true;
                            ws1.Cells[5, 2, 5, ObjectiveList.Count() + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                            ws1.Cells[5, 2, 5, ObjectiveList.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[8, 1].Value = isTrendNewStruct ? filter.Filter[1].DemoAndTopFilters : (OutputData.Data.Rows[0]["Col3"]);
                            if (isTrendNewStruct) { ws1.Cells[7, 1].Value = " "; }
                            //Replace ' from Objective list and MetricList
                            for (i = 0; i < ObjectiveList.Count; i++)
                            {
                                ObjectiveList[i] = ObjectiveList[i];//.Replace("'", "");
                            }
                            for (i = 0; i < MetricList.Count; i++)
                            {
                                MetricList[i] = MetricList[i];//.Replace("'", "");
                            }
                            for (i = 0; i < t.Rows.Count; i++)
                            {
                                t.Rows[i][OutputData.XColumn] = t.Rows[i][OutputData.XColumn].ToString();//.Replace("'", "");
                                t.Rows[i][OutputData.SerisColumn] = t.Rows[i][OutputData.SerisColumn].ToString();//.Replace("'", "");
                            }
                            for (i = 0; i < ObjectiveList.Count; i++)
                            {
                                ws1.Cells[6, 2 + i].Value = ObjectiveList[i];
                                ws1.Cells[6, 2 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                int metricSampleSize = 0; object TotalSampleSize;
                                if (!isTrendNewStruct)
                                {
                                    #region TotalSampleSize
                                    //TotalSampleSize = t.Rows[t.Rows.IndexOf(t.Select(OutputData.XColumn + "='" + ObjectiveList[i].Replace("'", "") + "'").FirstOrDefault())]["TotalSamplesize"];
                                    var tempSS = t.AsEnumerable().Where(x=>x.Field<string>(OutputData.XColumn) == ObjectiveList[i]).FirstOrDefault();
                                    TotalSampleSize = tempSS == null ? 0 : tempSS["TotalSamplesize"] == DBNull.Value ? "NA" : tempSS["TotalSamplesize"];
                                    #region to check TotalSample size not equal to null
                                    var totalSamplesizeLst = OutputData.Data.Rows
                                                          .Cast<DataRow>()
                                                          .Where(x => x[OutputData.XColumn].ToString() == ObjectiveList[i])
                                                          .Select(x => x["TotalSamplesize"]).ToList();
                                    foreach (var samplesize in totalSamplesizeLst)
                                    {
                                        if (samplesize != null && Convert.ToString(samplesize) != "")
                                        {
                                            TotalSampleSize = samplesize;
                                            break;
                                        }
                                    }
                                    #endregion
                                    //TotalSampleSize = 0;
                                    if (int.TryParse(Convert.ToString(TotalSampleSize), out metricSampleSize))
                                    {
                                        if (metricSampleSize >= 30 && metricSampleSize <= 99)
                                            ws1.Cells[7, 2 + i].Value = metricSampleSize + " (USE DIRECTIONALLY)";
                                        else if (metricSampleSize < 30)
                                            ws1.Cells[7, 2 + i].Value = metricSampleSize + " (LOW SAMPLE SIZE)";
                                        else
                                            ws1.Cells[7, 2 + i].Value = metricSampleSize;
                                    }
                                    else
                                    {
                                        ws1.Cells[7, 2 + i].Value = "NA";
                                        metricSampleSize = -999;
                                    }
                                    #endregion
                                }
                                else
                                {
                                    ws1.Cells[7, 2 + i].Value = " ";
                                }

                                ws1.Cells[7, 2 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                ws1.Cells[7, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[7, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                ws1.Cells[8, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[8, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.Black);

                                for (j = 0; j < MetricList.Count; j++)
                                {
                                    #region If new table structure then : Update new total sample size
                                    if (isTrendNewStruct)
                                    {
                                        var out_put = Convert.ToString((from DataRow dr in OutputData.Data.Rows
                                                                        where (dr[OutputData.XColumn].ToString() == ObjectiveList[i] && dr[OutputData.SerisColumn].ToString() == MetricList[j] && Convert.ToString(dr["TotalSamplesize"]) != "")
                                                                        select dr["TotalSamplesize"]).FirstOrDefault());
                                        int? rowSampleSize = out_put == "" ? null : (int?)(Convert.ToUInt32(out_put));
                                        //Add sample size row for each Metric Value
                                        ws1.Cells[9 + j * mult, 2 + i].Value = rowSampleSize == null || rowSampleSize < 30 ? (rowSampleSize == null ? "NA" : rowSampleSize.ToString() + "(LOW SAMPLE SIZE)") : rowSampleSize.ToString();
                                        if (rowSampleSize != null && rowSampleSize <= 99 && rowSampleSize >= 30)
                                        {
                                            ws1.Cells[9 + j * mult, 2 + i].Value = rowSampleSize + "(USE DIRECTIONALLY)";
                                        }
                                        //Fill the entries for each row sample size
                                        ws1.Cells[9 + j * mult, 2 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                        ws1.Cells[9 + j * mult, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[9 + j * mult, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                        ws1.Cells[9 + j * mult, 2 + i].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                                        metricSampleSize = (rowSampleSize == null) ? 0 : (int)rowSampleSize;
                                    }
                                    #endregion If new table structure then : Update new total sample size

                                    //double? statvalue = (t.Select(OutputData.SerisColumn + "='" + MetricList[j].Replace("'", "") + "'").Where(x => x.Field<string>(OutputData.XColumn) == ObjectiveList[i].Replace("'", "")).Select(x => x["significancevalue"])).FirstOrDefault() == DBNull.Value ? 0.0 : Convert.ToDouble((t.Select(OutputData.SerisColumn + "='" + MetricList[j].Replace("'", "") + "'").Where(x => x.Field<string>(OutputData.XColumn) == ObjectiveList[i].Replace("'", "")).Select(x => x["significancevalue"])).FirstOrDefault());
                                    var tempSV = t.AsEnumerable().Where(x=>x.Field<string>(OutputData.SerisColumn) == MetricList[j] && x.Field<string>(OutputData.XColumn) == ObjectiveList[i]).FirstOrDefault();
                                    double? statvalue = tempSV == null ? 0.0 : tempSV["significancevalue"] == DBNull.Value ? 0.0: (double?)tempSV["significancevalue"];
                                    Color statValueCustomColor = Color.FromArgb(0, 0, 0);
                                    #region custombase blue color
                                    if (customBaseText.ToString().ToUpper() == ObjectiveList[i].ToString().ToUpper())
                                        statValueCustomColor = Color.FromArgb(68, 114, 196);
                                    else
                                        statValueCustomColor = getFontColorBasedOnStatValue(statvalue);
                                    #endregion

                                    if (i == 0)
                                    {
                                        if (isTrendNewStruct)
                                        {
                                            ws1.Cells[9 + j * mult, 1].Value = "Sample Size";
                                            ws1.Cells[9 + j * mult, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                            ws1.Cells[9 + j * mult, 1].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                            ws1.Cells[9 + j * mult, 2, 9 + j * mult, ObjectiveList.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        }
                                        ws1.Cells[9 + j * mult + addFact, 1].Value = MetricList[j];
                                        ws1.Cells[9 + j * mult + addFact, 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                                        ws1.Cells[9 + j * mult + addFact, 2, 9 + j * mult + addFact, ObjectiveList.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    }

                                    //var metricValue = (t.Select(OutputData.SerisColumn + "='" + MetricList[j].Replace("'", "") + "'").Where(x => x.Field<string>(OutputData.XColumn) == ObjectiveList[i].Replace("'", "")).Select(x => x["Metricvalue"])).FirstOrDefault();
                                    var tempMV = t.AsEnumerable().Where(x => x.Field<string>(OutputData.SerisColumn) == MetricList[j] && x.Field<string>(OutputData.XColumn) == ObjectiveList[i]).FirstOrDefault();
                                    var metricValue = tempMV == null?   0.0:  tempMV["Metricvalue"] == DBNull.Value ? 0.0: tempMV["Metricvalue"];
                                    if (metricValue == null || Convert.ToString(metricValue) == "")
                                    {
                                        ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        if (metricSampleSize >= 30 && metricSampleSize <= 99)
                                        {
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Value = "NA";
                                        }
                                        else if (metricSampleSize > 99)
                                        {
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Value = "NA";
                                        }
                                        else
                                        {
                                            if (metricSampleSize == -999) ws1.Cells[9 + j * mult + addFact, 2 + i].Value = "NA"; else ws1.Cells[9 + j * mult + addFact, 2 + i].Value = "";
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));

                                        }
                                        ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Font.Color.SetColor(statValueCustomColor);
                                    }
                                    else
                                    {
                                        if (metricSampleSize >= 30 && metricSampleSize <= 99)
                                        {
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Value = metricValue;
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Font.Color.SetColor(statValueCustomColor);
                                        }
                                        else if (metricSampleSize > 99)
                                        {
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Value = metricValue;
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Font.Color.SetColor(statValueCustomColor);
                                        }
                                        else
                                        {
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));
                                            if (metricSampleSize == -999) ws1.Cells[9 + j * mult + addFact, 2 + i].Value = "NA"; else ws1.Cells[9 + j * mult + addFact, 2 + i].Value = "";
                                            ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Font.Color.SetColor(statValueCustomColor);
                                        }

                                        ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Numberformat.Format = "######0.0%";
                                    }
                                    ws1.Cells[9 + j * mult + addFact, 2 + i].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);

                                }
                                ws1.Column(i + 2).Width = 30;
                            }
                            ws1.Cells[6, 2, 7, ObjectiveList.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[7, 2, 7, ObjectiveList.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                            #region sample size for satisfaction drivers top 2 box
                            int tableIndex = -1;
                            if (SatisDriTop2Box)
                            {
                                if (filter.TimePeriodText == "trend" && (filter.Module == "chartestablishmentdeepdive" || filter.Module== "chartestablishmentcompare" || filter.Module== "chartbeveragecompare" || filter.Module== "chartbeveragedeepdive")) { }
                                else {
                                    {
                                        ws1.DeleteRow(7);
                                        for (int rowIndex = 0; rowIndex < (MetricList.Count) * 2; rowIndex += 2)
                                        {
                                            ws1.InsertRow(8 + rowIndex, 1);
                                            ws1.Cells[8 + rowIndex, 1].Value = "Sample Size";
                                            ws1.Cells[8 + rowIndex, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                                            for (int colIndex = 0; colIndex < ObjectiveList.Count; colIndex++)
                                            {
                                                string value1 = "";
                                                string value = t.Rows[tableIndex += 1][7].ToString();
                                                if(value=="" || Convert.ToInt16(value)<30)
                                                {
                                                    value1 = value + "(LOW SAMPLE SIZE)";
                                                    ws1.Cells[8 + rowIndex, 2 + colIndex].Value = value1;
                                                    ws1.Cells[8 + rowIndex+1, 2 + colIndex].Value = "";
                                                    ws1.Cells[8 + rowIndex + 1, 2 + colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                                    ws1.Cells[8 + rowIndex + 1, 2 + colIndex].Style.Fill.BackgroundColor.SetColor(Color.White);
                                                }
                                                else if (Convert.ToInt16(value) < 99)
                                                {
                                                    value1 = value + "(USE DIRECTIONALLY)";
                                                    ws1.Cells[8 + rowIndex, 2 + colIndex].Value = value1;
                                                    ws1.Cells[8 + rowIndex+1, 2 + colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                                    ws1.Cells[8 + rowIndex+1, 2 + colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                                }
                                                else
                                                {
                                                    ws1.Cells[8 + rowIndex, 2 + colIndex].Value = value;
                                                    ws1.Cells[8 + rowIndex, 2 + colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                                    ws1.Cells[8 + rowIndex, 2 + colIndex].Style.Fill.BackgroundColor.SetColor(Color.White);
                                                }
                                               // string value1 = (value != "") ? ((Convert.ToInt32(value) < 99) ? ((Convert.ToInt32(value) < 30) ? (value + "(LOW SAMPLE SIZE)") : (value + "(USE DIRECTIONALLY)")) : (value)) : ("NA");
                                                //ws1.Cells[8 + rowIndex, 2 + colIndex].Value = value1;
                                                ws1.Cells[8 + rowIndex, 2 + colIndex].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                                                ws1.Cells[8 + rowIndex, 2 + colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                                ws1.Cells[8 + rowIndex, 2 + colIndex].Style.Numberformat.Format = "#,##0";
                                            }
                                        }
                                    }
                                }
                            }
                            #endregion
                            p.Save();
                        }
                    }
                    catch (Exception ex)
                    {
                    }
                }
            }
        }

        public Color getFontColorBasedOnStatValue(double? statValue)
        {

            Color statcolor = Color.Black;
            if (statValue == 0)
                statcolor = Color.Black;
            else if (statValue > 1.96)
                statcolor = Color.Green;
            else if (statValue < -1.96)
                statcolor = Color.Red;
            else
                statcolor = Color.Black;
            return statcolor;
        }
        public string ToTitleCase(string str)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(str.ToLower());
        }
    }
}