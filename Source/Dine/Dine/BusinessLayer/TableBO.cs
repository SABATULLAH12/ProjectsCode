using ClosedXML.Excel;
using NextGen.Core.Configuration;
using NextGen.Core.Configuration.Interfaces;
using Framework.Models;
using Framework.Models.Table;
using System;
using System.Linq;
using Framework.Data;
using fd = Framework.Data;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web;

/* To work with EPPlus library */
using OfficeOpenXml;
using OfficeOpenXml.Drawing;
using OfficeOpenXml.Style;

using System.Drawing;
using System.Globalization;
using System.Web.Script.Serialization;

namespace Dine.BusinessLayer
{
    public class TableBO : IDisposable
    {
        private readonly fd.ITable table = null;
        protected bool disposed = false;
        protected IModuleConfig config = null;
        private static readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public TableBO()
        {
            config = ConfigContext.Current.GetConfig("table");
            table = new fd.Table();
        }

        public TableBO(string controllerName)
        {
            config = ConfigContext.Current.GetConfig(controllerName);
            table = new fd.Table(controllerName);
        }

        public FilterPanelMenu GetMenu() { return table.GetMenu(); }

        public TableInfo GetTable(FilterPanelInfo[] filter, string module, string measureType, CustomPropertyLabel customFilter, string customBaseText,string timePeriodType)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterName" });
            dt.Columns.Add(new DataColumn() { ColumnName = "FilterValue" });

            //prepare additional filter
            foreach (var add in FilterInfo.AdditionalFilter)
            {
                //var  festblishmt = filter.FirstOrDefault(x => x.Name == add);
                //if (add == "Establishment")
                //     festblishmt = filter.FirstOrDefault(x => x.Name == add && (x.MetricType == "Restaurants" || x.MetricType == "Retailers"));
                //else
                // var f = filter.FirstOrDefault(x => x.Name == add);
                
                var f = (add == "Establishment") ? ((module == "tablebeveragecomparison" || module == "tablebeveragedeepdive") ? filter.FirstOrDefault(x => x.Name == add) : null) : filter.FirstOrDefault(x => x.Name == add);
                
                if ((module == "tablebeveragecomparison" || module == "tablebeveragedeepdive") && add == "CONSUMED FREQUENCY")
                {
                    f = (from row in filter
                         where row.Name == add && !string.IsNullOrEmpty(Convert.ToString(row.SelectedID))
                         select row).ToList().FirstOrDefault();
                }
                
                if (f != null && f.SelectedID != null)
                {
                    if (Convert.ToString(f.SelectedID) != "")
                    {
                        List<int> selectedIDsLst = f.SelectedID.ToString().Split('|')
                                                   .Select(t => int.Parse(t))
                                                   .ToList();
                        foreach (var Id in selectedIDsLst)
                        {
                            dt.Rows.Add(add, Id);
                        }

                    }
                    //var list = f.SelectedID.ToString().ToList();
                    //dt.Rows.Add(add,"" );
                }
            }

            var tbldata = table.GetOutputData(config.GetInfo, filter, dt, module,timePeriodType);

            //calculating custom base
            //if (!string.IsNullOrEmpty(customBaseText))
            //{
            //    if (tbldata != null && tbldata.GetTableDataResopnse != null && tbldata.GetTableDataResopnse.GetTableDataRespDt.Count > 0)
            //    {
            //        foreach (var item in tbldata.GetTableDataResopnse.GetTableDataRespDt)
            //        {
            //            var selectedText = tbldata.GetTableDataResopnse.GetTableDataRespDt.FirstOrDefault(x => x.EstablishmentName == customBaseText
            //            && x.DemoFilterName == item.DemoFilterName && x.MetricName == item.MetricName);
            //            if (selectedText != null && selectedText.MetricName != null)
            //            {
            //                //if the metric sample is <=30, we should not calculate custom base
            //                if (selectedText.MetricSampleSize > 30)
            //                {
            //                    item.BenchMarkSampleSize = selectedText.SampleSize;
            //                    item.BenchMarkPercentage = selectedText.MetricValue;
            //                }
            //            }
            //        }
            //    }
            //}

            #region Sample size calculation
            foreach (var row in tbldata.GetTableDataResopnse.GetTableDataRespDt.Where(x => x.MetricSampleSize == null))
            {
                row.MetricSampleSize = tbldata.GetTableDataResopnse.GetTableDataRespDt.FirstOrDefault(x => x.MetricSampleSize != null && x.DemoFilterName == row.DemoFilterName && x.MetricName == row.MetricName && x.EstablishmentName == row.EstablishmentName)?.MetricSampleSize;
            }
            #endregion
            return tbldata;

            //return table.GetOutputData(config.GetInfo, filter,dt,sb,module);
        }

        public void PreparePowerPoint(string destinationPath, string sourcePath, string destinationVirtualPath, ExportDetails filter, CustomPropertyLabel customFilter)
        {
            if (File.Exists(sourcePath))
            {
                //DataSet ds = table.GetOutputData(ConfigContext.Current.GetConfig("table").GetFactQuery(filter, customFilter));

            }
        }
        public string PrepareExcel(List<MainData> mainlist, List<SampleSizeList> samplelist, IList<string> columns, string destinationFile, 
            int selectedCheckboxTopFilterId, int toAddDestinationFile, string destFile,string selctdTimePeriod,string selctedFrequency, ref string outputpath,string moduleType,string selectedAdvanceFitlersList,string custombaseText,int selectedTopFilterId,string selectedStatTest,int isVisits,string selectedDemofiltersList,string selectedConsumedFrqyTxt,string module,string timePeriodType,string deepdiveEstbmt)
        {
            var sourceFile = HttpContext.Current.Server.MapPath("~/Templates/ExcelTemplate.xlsx"); //source file            
            var dirName = HttpContext.Current.Session.SessionID;
            var fileNmae =  "ExportExcel.xlsx"; //  download file
            try
            {
                if (toAddDestinationFile == 0)
                {
                    destFile = HttpContext.Current.Server.MapPath("~/Temp/" + dirName + "/" + fileNmae);
                    /*cselectedCheckboxTopFilterIdreate the directory with session name*/
                    if (Directory.Exists(HttpContext.Current.Server.MapPath("~/Temp/" + dirName)))
                        Directory.Delete(HttpContext.Current.Server.MapPath("~/Temp/" + dirName), true);

                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Temp/" + dirName));

                    File.Copy(sourceFile, destFile, true);
                }

                var file = new FileInfo(destFile);
                using (ExcelPackage p = new ExcelPackage(file))
                {
                    ExcelWorksheet worksheet; ExcelWorksheet ws1;

                    bool SatisDriTop2Box = false;
                    if (selectedCheckboxTopFilterId == 4)
                        SatisDriTop2Box = true;

                    var toGetSheetName = sheetName(selectedCheckboxTopFilterId);
                    var toDeleteAlrdyExistSheet = p.Workbook.Worksheets.SingleOrDefault(x => x.Name == toGetSheetName);
                    if (toDeleteAlrdyExistSheet != null)
                        p.Workbook.Worksheets.Delete(toDeleteAlrdyExistSheet);

                    if (toAddDestinationFile > 0)
                    {
                        worksheet = p.Workbook.Worksheets.Add(sheetName(selectedCheckboxTopFilterId));
                        ws1 = p.Workbook.Worksheets[worksheet.Name];

                    }
                    else
                    {
                        ws1 = p.Workbook.Worksheets[1]; ws1.Name = sheetName(selectedCheckboxTopFilterId);
                    }

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
                    ws1.Column(6).Width = 40;
                    for (int i = 2; i < columns.Count() + 2; i++)
                    {
                        ws1.Column(i).Width = 30;
                    }
                    #endregion
                    //hide grid lines
                    ws1.View.ShowGridLines = false;

                    #region selected Filters
                    int rowIndex = 1;
                    int colIndex = 1;

                    ws1.Cells[1, 2].Value = "Selection";ws1.Cells[1, 2].Style.Font.UnderLine = true;ws1.Cells[1, 2].Style.Font.Bold = true;
                    ws1.Cells[1, 4].Value = "Filters";ws1.Cells[1, 4].Style.Font.UnderLine = true;ws1.Cells[1, 4].Style.Font.Bold = true;
                    ws1.Cells[1, 6].Value = "Stat Test";ws1.Cells[1, 6].Style.Font.UnderLine = true;ws1.Cells[1, 6].Style.Font.Bold = true;

                    ws1.Cells[2, 2].Value = "Time Period:"; ws1.Cells[2, 3].Value = selctdTimePeriod == "TOTAL" ? "Total" : selctdTimePeriod;
                    ws1.Cells[2, 6].Value = ">95%"; ws1.Cells[2, 6].Style.Font.Color.SetColor(Color.Green); ws1.Cells[2, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    ws1.Cells[3, 2].Value = "Frequency:";
                    ws1.Cells[3, 4].Value = "Demographic Filters:";
                    string statTest = custombaseText != "" ? custombaseText : ToTitleCase(selectedStatTest.ToString());
                    ws1.Cells[4, 6].Value = "*Stat Tested At 95 % CL Against - " + statTest;
                    ws1.Cells[4, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    ws1.Cells[3, 5].Value = selectedDemofiltersList;
                    if (module == "tableestablishmentdeepdive")
                    {
                        ws1.Cells[4, 2].Value = "Establishment:";
                        ws1.Cells[4, 3].Value = deepdiveEstbmt;
                    }
                    else if (module == "tablebeveragedeepdive")
                    {
                        ws1.Cells[4, 2].Value = "Beverage:";
                        ws1.Cells[4, 3].Value = deepdiveEstbmt;
                    }

                    #region selected Frequency 
                    if (selectedCheckboxTopFilterId == selectedTopFilterId){
                        if (isVisits == 1 && selctedFrequency.ToLower() != "total visits")
                            ws1.Cells[3, 3].Value = "Total Visits" + "(" + selctedFrequency + ")";
                        else
                            ws1.Cells[3, 3].Value = selctedFrequency;

                    }
                    else
                    {
                        if (moduleType == "Establishment(s)")
                            ws1.Cells[3, 3].Value = setDefaultFrequency(selectedCheckboxTopFilterId,isVisits,selctedFrequency);
                        else
                            ws1.Cells[3, 3].Value = setDefaultFrequencyForBeverage(selectedCheckboxTopFilterId,isVisits,selctedFrequency);
                    }
                    #endregion selected Frequency 

                    #region Guests or Visits Text Change

                    if (selectedCheckboxTopFilterId == selectedTopFilterId)
                    {
                        if (selectedTopFilterId == 1)
                        {
                            if (isVisits == 1)
                                ws1.Cells[2, 4].Value = "Visits: ";
                            else
                                ws1.Cells[2, 4].Value = "Guests: ";
                        }
                        else
                            ws1.Cells[2, 4].Value = visitsORGuestsTxt(selectedCheckboxTopFilterId,isVisits);

                    }
                    else
                        ws1.Cells[2, 4].Value = visitsORGuestsTxt(selectedCheckboxTopFilterId,isVisits);
                    #endregion Guests or Visits Text Change

                    #region Selected Advance filters and Consumend Frequency
                    ws1.Cells[3, 6].Value = "<95%"; ws1.Cells[3, 6].Style.Font.Color.SetColor(Color.Red); ws1.Cells[3, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    if (selectedCheckboxTopFilterId != selectedTopFilterId)
                    {
                        if (selectedCheckboxTopFilterId == 5 || selectedCheckboxTopFilterId == 9)
                        {
                            //ws1.Cells[2, 5].Value = selectedAdvanceFitlersList == null || selectedAdvanceFitlersList == "" ? " "  + " Monthly+"  : selectedAdvanceFitlersList + ", "  + " Monthly+";
                            ws1.Cells[2, 5].Value = selectedAdvanceFitlersList == null || selectedAdvanceFitlersList == "" ? " " : selectedAdvanceFitlersList;
                            ws1.Cells[4, 4].Value = "Consumed Frequency : ";
                            ws1.Cells[4, 5].Value = "Monthly+";
                        }
                        else
                            ws1.Cells[2, 5].Value = selectedAdvanceFitlersList;
                    }
                    else
                    {
                        if (selectedCheckboxTopFilterId == 5 || selectedCheckboxTopFilterId == 9)
                        {
                            //ws1.Cells[2, 5].Value = selectedAdvanceFitlersList == null || selectedAdvanceFitlersList == "" ? " " + selectedConsumedFrqyTxt : selectedAdvanceFitlersList + ", " + selectedConsumedFrqyTxt;
                            ws1.Cells[2, 5].Value = selectedAdvanceFitlersList == null || selectedAdvanceFitlersList == "" ? " " : selectedAdvanceFitlersList;
                            ws1.Cells[4, 4].Value = "Consumed Frequency : ";
                            ws1.Cells[4, 5].Value = selectedConsumedFrqyTxt.Replace("Consumed Frequency : ", "");
                        }
                        else
                            ws1.Cells[2, 5].Value = selectedAdvanceFitlersList;
                    }
                    #endregion Selected Advance filters and Consumend Frequency

                    #endregion

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

                    ws1.Cells[1, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[2, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[3, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[4, 5].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[4, 5].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                    ws1.Cells[1, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[2, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[3, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[4, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    ws1.Cells[4, 6].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                    #endregion Top Header  border apply
                    string selectedHeadrEstorMetricorTime = "";
                    if (mainlist.Count() > 0)
                    {
                        if (module == "tablebeveragecomparison")
                        { selectedHeadrEstorMetricorTime = "Beverage(s)"; }
                        else if (module == "tableestablishmentcompare")
                        { selectedHeadrEstorMetricorTime = "Establishment(s)"; }
                        else if (module == "tableestablishmentdeepdive" || module == "tablebeveragedeepdive")
                        {
                            if (timePeriodType == "pit")
                                selectedHeadrEstorMetricorTime = "Metric Comparison(s)";
                            else
                                selectedHeadrEstorMetricorTime = "Time Period(s)";
                        }
                    ws1.Cells[5, 2, 5, columns.Count() + 1].Merge = true;
                    ws1.Cells[5, 2, 5, columns.Count() + 1].Value = selectedHeadrEstorMetricorTime;
                    ws1.Cells[5, 2, 5, columns.Count() + 1].Style.Font.Bold=true;
                    ws1.Cells[5, 2, 5, columns.Count() + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    rowIndex = 6;
                    colIndex = 2;
                   
                        //Header Section
                        #region Header Section

                        foreach (var col in columns)
                        {
                            ws1.Cells[rowIndex, colIndex].Style.Font.Bold = true;
                            ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[rowIndex, colIndex].Value = col;
                            colIndex++;
                        }
                        #endregion

                        var mainHeaderList = new List<string>();
                        var columnsandSampleSizeList = new List<SampleSizeList>();

                        #region  Sample Size only When Demographics selected 

                        //if (selectedCheckboxTopFilterId != 5 || selectedCheckboxTopFilterId != 8 || (moduleType != "Beverage(s)" && selectedCheckboxTopFilterId !=7))
                            if (selectedCheckboxTopFilterId != 8 || (selectedCheckboxTopFilterId != 5 && (selectedConsumedFrqyTxt != "Favorite Brand In Category" || selectedConsumedFrqyTxt != "Favorite Brand Across NAB")) || (moduleType != "Beverage(s)" && selectedCheckboxTopFilterId != 7))
                            {
                            foreach (var main in mainlist)
                            {
                                rowIndex++; colIndex = 1;
                                for (int j = 0; j < columns.Count(); j++)
                                {
                                    if (j == 0)
                                    {
                                        //ws1.Cells[rowIndex,colIndex].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#B7DEE8"));
                                        ws1.Cells[rowIndex, colIndex].Value = "Sample Size";
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                        ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                                        colIndex++;
                                    }
                                    bool strSampleStatus = true;
                                    int? sampleSize = -999;
                                    int metricSampleSize = 0; 
                                    foreach (var sampleValue in samplelist)
                                    {
                                        
                                        var columnsampleLst = new SampleSizeList(); metricSampleSize = 0;
                                        if (columns[j].ToString().ToUpper().Trim() == sampleValue.EstablishmentName.ToString().ToUpper().Trim())
                                        {
                                           
                                            strSampleStatus = false;
                                            if (sampleValue.MetricSampleSize != null)
                                            {
                                                columnsandSampleSizeList.Add(new SampleSizeList()
                                                {
                                                    EstablishmentName = sampleValue.EstablishmentName,
                                                    MetricSampleSize = sampleValue.MetricSampleSize
                                                });
                                                sampleSize = sampleValue.MetricSampleSize;
                                                if (j != 0)
                                                    colIndex++;
                                                break;
                                                
                                            }
                                           
                                        }
                                    }
                                    if (sampleSize == -999)
                                    {
                                        if (j != 0)
                                            colIndex++;
                                        columnsandSampleSizeList.Add(new SampleSizeList()
                                        {
                                            EstablishmentName = columns[j].ToString(),
                                            MetricSampleSize = null
                                        });
                                        sampleSize = 0;
                                        ws1.Cells[rowIndex, colIndex].Value = "NA";
                                    }
                                    else
                                    {
                                        if (int.TryParse(Convert.ToString(sampleSize), out metricSampleSize))
                                        {
                                            if (metricSampleSize >= 100)
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = metricSampleSize;
                                                ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "#,##0";
                                            }
                                            else { ws1.Cells[rowIndex, colIndex].Value = sampleSizeStatus(metricSampleSize); }
                                        }
                                        else
                                            ws1.Cells[rowIndex, colIndex].Value = "NA";
                                    }
                                    ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                    ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                                    if (strSampleStatus)
                                    {
                                        ws1.Cells[rowIndex, colIndex].Value = ""; colIndex++;
                                    }
                                }
                                break;
                            }
                        }
                        #endregion

                        #region Body Part
                        var samplesizeListIndividual = new List<SampleSizeList>();
                        foreach (var v in mainlist)
                        {
                            if (mainHeaderList.IndexOf(v.mainList[0].subList.DemoFilterName) == -1)
                            {
                                #region demo filter header part
                                mainHeaderList.Add(v.mainList[0].subList.DemoFilterName);
                                samplesizeListIndividual = new List<SampleSizeList>();
                                rowIndex++; colIndex = 1;
                                for (int k = 0; k < columns.Count() + 1; k++)
                                {
                                    if (k == 0)
                                        ws1.Cells[rowIndex, colIndex].Value = v.mainList[0].subList.DemoFilterName;
                                    else
                                        ws1.Cells[rowIndex, colIndex].Value = "";

                                    ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    if (v.mainList[0].subList.DemoFilterName == "Establishment Frequency (Base: Total US Population)")
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(169, 169, 169));
                                    else
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(1, 0, 0));
                                    ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(255, 255, 255));
                                    colIndex++;
                                }
                                #endregion demo filter header part
                                if (selectedCheckboxTopFilterId == 8|| selectedCheckboxTopFilterId == 2 || (selectedCheckboxTopFilterId == 5 && (selectedConsumedFrqyTxt == "Favorite Brand In Category" || selectedConsumedFrqyTxt == "Favorite Brand Across NAB")) || (moduleType == "Beverage(s)" && selectedCheckboxTopFilterId == 7))
                                    {
                                    rowIndex++; colIndex = 1;
                                    #region Sample size
                                    for (int j = 0; j < columns.Count(); j++)
                                    {
                                        if (j == 0)
                                        {
                                            ws1.Cells[rowIndex, colIndex].Value = "Sample Size";
                                            ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                            ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                            ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                                            colIndex++;
                                        }
                                        bool strSampleStatus = true;
                                        foreach (var sampleValue in samplelist)
                                        {
                                            var columnsampleLst = new SampleSizeList(); int metricSampleSize = 0;
                                            if (columns[j].ToString().ToUpper().Trim() == sampleValue.EstablishmentName.ToString().ToUpper().Trim() && sampleValue.DemoFilterName == v.mainList[0].subList.DemoFilterName)
                                            {
                                                ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                                if (int.TryParse(Convert.ToString(sampleValue.MetricSampleSize), out metricSampleSize))
                                                {
                                                    if (metricSampleSize >= 100)
                                                    {
                                                        ws1.Cells[rowIndex, colIndex].Value = metricSampleSize;
                                                        ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "#,##0";
                                                    }
                                                    else { ws1.Cells[rowIndex, colIndex].Value = sampleSizeStatus(metricSampleSize); }
                                                }
                                                else
                                                    ws1.Cells[rowIndex, colIndex].Value = "NA";
                                                ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                                ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                                ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(Color.FromArgb(135, 135, 135));
                                                colIndex++;
                                                strSampleStatus = false;
                                                samplesizeListIndividual.Add(new SampleSizeList()
                                                {
                                                    EstablishmentName = sampleValue.EstablishmentName,
                                                    MetricSampleSize = sampleValue.MetricSampleSize
                                                });
                                                break;
                                            }
                                        }
                                        if (strSampleStatus)
                                        {
                                            ws1.Cells[rowIndex, colIndex].Value = "";
                                            colIndex++;
                                        }
                                    }
                                    #endregion Sample Size
                                }
                            }

                            rowIndex++; colIndex = 1;

                            #region Lower Body Part
                            var binddataDependingTopFilter = new List<SampleSizeList>();
                            if (selectedCheckboxTopFilterId == 8 ||  selectedCheckboxTopFilterId == 2  || (selectedCheckboxTopFilterId == 5 && (selectedConsumedFrqyTxt == "Favorite Brand In Category" || selectedConsumedFrqyTxt == "Favorite Brand Across NAB")) || (moduleType == "Beverage(s)" && selectedCheckboxTopFilterId == 7)) 
                                binddataDependingTopFilter = samplesizeListIndividual;//Non Demographics
                            else
                                binddataDependingTopFilter = columnsandSampleSizeList;//For Demographics

                            foreach (var col in columns)
                            {
                                bool colStatus = false;
                                foreach (var binddata in binddataDependingTopFilter)
                                {
                                    if (binddata.EstablishmentName == col)
                                    {
                                        colStatus = true;
                                        break;
                                    }
                                }
                                if (colStatus == false)
                                {
                                    //binddataDependingTopFilter.Remove(col, 0,{ EstablishmentName: colValues, MetricSampleSize: 0 })
                                }
                            }

                            int columnIndx = 0;
                            foreach (var columnValue in binddataDependingTopFilter)
                            {
                                bool isexists = false; double metricValue = -999;
                                Color cssForUseDirectinally = Color.FromArgb(255, 255, 255);
                                Color statValueCustomColor = Color.FromArgb(0, 0, 0);
                                double statval = 0.0;
                                foreach (var vValue in v.mainList)
                                {
                                    if (vValue.subList.EstablishmentName == columnValue.EstablishmentName)
                                    {

                                        isexists = true;
                                        if (columnValue.MetricSampleSize == null)
                                        {
                                            metricValue = -999;
                                            if (vValue.subList.EstablishmentName == custombaseText || Convert.ToString(vValue.subList.EstablishmentName).ToUpper() == Convert.ToString(selectedStatTest).ToUpper())
                                                statValueCustomColor = Color.FromArgb(68, 114, 196);
                                            else
                                                statValueCustomColor = Color.FromArgb(0, 0, 0);
                                        }
                                        else
                                        {

                                            if (columnValue.MetricSampleSize >= 30 && columnValue.MetricSampleSize <= 99)
                                            {
                                                metricValue = vValue.subList.MetricValue == null ? -999 : Convert.ToDouble(vValue.subList.MetricValue);
                                                cssForUseDirectinally = Color.FromArgb(231, 230, 230);
                                            }
                                            else if (columnValue.MetricSampleSize > 99)
                                            {
                                                metricValue = vValue.subList.MetricValue == null ? -999 : Convert.ToDouble(vValue.subList.MetricValue);
                                                cssForUseDirectinally = Color.FromArgb(255, 255, 255);
                                            }
                                            else
                                            {
                                                metricValue = -9999; cssForUseDirectinally = Color.FromArgb(255, 255, 255);
                                            }
                                            #region Statvalue and Custombase Color
                                            if (vValue.subList.EstablishmentName == custombaseText || Convert.ToString(vValue.subList.EstablishmentName).ToUpper() == Convert.ToString(selectedStatTest).ToUpper())
                                                statValueCustomColor = Color.FromArgb(68, 114, 196);
                                            else
                                            {
                                                if (double.TryParse(Convert.ToString(vValue.subList.StatValue), out statval))
                                                    statValueCustomColor = getFontColorBasedOnStatValue(statval);
                                                //statValueCustomColor = getFontColorBasedOnStatValue(vValue.subList.StatValue);
                                            }
                                            #endregion Statvalue and Custombase Color
                                        }
                                        break;
                                    }
                                }

                                if (columnIndx == 0)
                                {
                                    ws1.Cells[rowIndex, colIndex].Value = v.mainList[0].subList.MetricName;
                                    colIndex++;
                                    if (isexists)
                                    {
                                       
                                        ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(cssForUseDirectinally);
                                        ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(statValueCustomColor);
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
                                            if (v.mainList[0].subList.MetricName == "Approximate Average Amount Spent" || v.mainList[0].subList.MetricName == "Average Amount Spent Per Diner")
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = "$" + (metricValue * 100).ToString("0.0");
                                            }
                                            else if (v.mainList[0].subList.MetricName == "Approximate Average Distance Travelled")
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = (metricValue * 100).ToString("0.0") + " MILE(S)";
                                            }
                                            else if (v.mainList[0].subList.MetricName == "Approximate Average Time In Establishment")
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = (metricValue * 100).ToString("0.0") + " MINUTE(S)";
                                            }
                                            else
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = metricValue;
                                                ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "######0.0%";
                                            }
                                        }
                                        colIndex++;
                                    }
                                    else
                                    {
                                        ws1.Cells[rowIndex, colIndex].Value = "";
                                        ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(cssForUseDirectinally);
                                        ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(statValueCustomColor);
                                        colIndex++;
                                    }

                                }
                                else
                                {
                                    if (isexists)
                                    {
                                        ws1.Cells[rowIndex, colIndex].Value = metricValue;
                                        ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(cssForUseDirectinally);
                                        ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(statValueCustomColor);
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
                                            if (v.mainList[0].subList.MetricName == "Approximate Average Amount Spent" || v.mainList[0].subList.MetricName == "Average Amount Spent Per Diner")
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = "$" + (metricValue * 100).ToString("0.0");
                                            }
                                            else if (v.mainList[0].subList.MetricName == "Approximate Average Distance Travelled")
                                            {
                                                ws1.Cells[rowIndex, colIndex].Value = (metricValue * 100).ToString("0.0") + " MILE(S)";
                                            }
                                            else if (v.mainList[0].subList.MetricName == "Approximate Average Time In Establishment")
                                            {

                                                ws1.Cells[rowIndex, colIndex].Value = (metricValue * 100).ToString("0.0") + " MINUTE(S)";
                                            }
                                            else
                                            {

                                                ws1.Cells[rowIndex, colIndex].Value = metricValue;
                                                ws1.Cells[rowIndex, colIndex].Style.Numberformat.Format = "######0.0%";
                                            }
                                        }
                                        colIndex++;
                                    }
                                    else
                                    {
                                        ws1.Cells[rowIndex, colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[rowIndex, colIndex].Style.Fill.BackgroundColor.SetColor(cssForUseDirectinally);
                                        ws1.Cells[rowIndex, colIndex].Style.Font.Color.SetColor(statValueCustomColor);
                                        ws1.Cells[rowIndex, colIndex].Value = "NA";
                                        colIndex++;
                                    }

                                }
                                columnIndx++;
                            }
                            #endregion Lower Body Part

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
                        }
                        #endregion
                    }
                    else {
                        ws1.Cells[6, 1].Style.Fill.PatternType = ExcelFillStyle.None;
                        ws1.Cells[6, 1].Style.Font.Color.SetColor(Color.FromArgb(0, 0, 0));
                        ws1.Cells[6,1].Value = "NO DATA AVAILABLE FOR THE SELECTION YOU MADE";
                    }

                    #region sample size for satisfaction drivers top 2 box

                    if (SatisDriTop2Box)
                    {                       
                        var timespentData = mainlist[33];
                        List<MainData> satisfactionDrivers=new List<MainData>();
                        for (int x = 0; x < 6; x++)
                        {
                            satisfactionDrivers.Add(mainlist[57 + x]);
                        }
                   
                        ws1.InsertRow(46,1);
                        ws1.Cells[46, 1].Value = "Sample Size";
                        ws1.Cells[46, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        for (var indx=0;indx< timespentData.mainList.Count; indx++)
                        {
                            string value1 = "";
                            string value = (timespentData.mainList[indx].subList.MetricSampleSize).ToString();
                            if (value == "")
                            {
                                value1 = "NA";
                                ws1.Cells[46, indx + 2].Value = value1;
                               // ws1.Cells[47, 55,indx + 2, indx + 2].Value = "NA";
                                ws1.Cells[47, indx + 2, 55, indx + 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[47,  indx + 2, 55, indx + 2].Style.Fill.BackgroundColor.SetColor(Color.White);
                            }
                            else if (Convert.ToInt32(value) < 30)
                            {
                                value1 = value + "(LOW SAMPLE SIZE)";
                                ws1.Cells[46, indx + 2].Value = value1;
                                ws1.Cells[47,indx + 2, 55, indx + 2].Value = "";
                                ws1.Cells[47, indx + 2,55, indx + 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[47, indx + 2, 55, indx + 2].Style.Fill.BackgroundColor.SetColor(Color.White);
                                //ws1.Cells[47, indx + 2, 55, indx + 2].Value = "";
                            }
                            else if (Convert.ToInt32(value) < 99)
                            {
                                value1 = value + "(USE DIRECTIONALLY)";
                                ws1.Cells[46, indx + 2].Value = value1;
                                ws1.Cells[47, indx + 2, 55, indx + 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[47, indx + 2, 55, indx + 2].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                            }
                            else
                            {
                                ws1.Cells[46, indx + 2].Value = value;
                                ws1.Cells[47, indx + 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                ws1.Cells[47, indx + 2].Style.Fill.BackgroundColor.SetColor(Color.White);
                            }
                            //string value1 = (value != "") ? ((Convert.ToInt32(value)<99)?((Convert.ToInt32(value)<30)?(value+"(LOW SAMPLE SIZE)"):(value+"(USE DIRECTIONALLY)")):(value)) : ("NA");
                            //ws1.Cells[46, indx+2].Value = value1;
                            ws1.Cells[46, indx+2].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                            ws1.Cells[46, indx+2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[46, indx + 2].Style.Numberformat.Format = "#,##0";
                        }
                        for (int _rowIndex = 0; _rowIndex < 12; _rowIndex += 2)
                        {
                            ws1.InsertRow(74 + _rowIndex, 1);
                            ws1.Cells[74 + _rowIndex, 1].Value = "Sample Size";
                            ws1.Cells[74 + _rowIndex, 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                            for (int _colIndex = 0; _colIndex < columns.Count; _colIndex++)
                            {
                                string value1 = "";
                                string value = ((satisfactionDrivers[(_rowIndex / 2)].mainList[_colIndex]).subList.MetricSampleSize).ToString();
                               try
                                {
                                    if (value == "")
                                    {
                                        value1 = "NA";
                                        ws1.Cells[74 + _rowIndex, 2 + _colIndex].Value = value1;
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Value = "";
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Style.Fill.BackgroundColor.SetColor(Color.White);
                                    }
                                    else if (Convert.ToInt32(value) < 30)
                                    {
                                        value1 = value + "(LOW SAMPLE SIZE)";
                                        ws1.Cells[74 + _rowIndex, 2 + _colIndex].Value = value1;
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Value = "";
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Style.Fill.BackgroundColor.SetColor(Color.White);
                                    }
                                    else if (Convert.ToInt32(value) < 99)
                                    {
                                        value1 = value + "(USE DIRECTIONALLY)";
                                        ws1.Cells[74 + _rowIndex, 2 + _colIndex].Value = value1;
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        ws1.Cells[74 + _rowIndex + 1, 2 + _colIndex].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(231, 230, 230));
                                    }
                                    else
                                    {
                                        ws1.Cells[74 + _rowIndex, 2 + _colIndex].Value = value;
                                    }
                                }
                                catch(Exception ex)
                                {
                                    Log.LogMessage("Value causing issue=" + value);
                                }
                                //string value1 = (value != "") ? ((Convert.ToInt32(value) < 99) ? ((Convert.ToInt32(value) < 30) ? (value + "(LOW SAMPLE SIZE)") : (value + "(USE DIRECTIONALLY)")) : (value)) : ("NA");
                                //ws1.Cells[74 + _rowIndex, 2 + _colIndex].Value = value1;
                                ws1.Cells[74 + _rowIndex, 2 + _colIndex].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                                ws1.Cells[74 + _rowIndex, 2 + _colIndex].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                ws1.Cells[74 + _rowIndex, 2 + _colIndex].Style.Numberformat.Format = "#,##0";
                            }
                        }
                    }
                    #endregion

                    p.Save();
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            outputpath =  fileNmae;
            return destFile;
        }
        public IEnumerable<AdvancedFilterData> GetAdvancedFilter(int bitData)
        {
            return table.GetAdvanceFilterData(bitData);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #region Export Excel methods
        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;
            if (disposing)
            {
                table.Dispose();
            }
        }

        public List<MainData> PrepareListForExcel(TableInfo tblInfo)
        {
            var demoExtbFilterList = new List<DemoExtbFilterList>();
            var mainData = new List<MainData>();

            var xdata = tblInfo.GetTableDataResopnse.GetTableDataRespDt;
            foreach (var val in xdata)
            {
                bool isExist = false;
                foreach (var demoVal in demoExtbFilterList)
                {
                    if (demoVal.MetricName == val.MetricName && demoVal.DemoFilterName == val.DemoFilterName)
                    {
                        isExist = true;
                        break;
                    }
                }
                if (isExist == false)
                {
                    demoExtbFilterList.Add(new DemoExtbFilterList()
                    {
                        MetricName = val.MetricName,
                        DemoFilterName = val.DemoFilterName
                    });
                }
            }
            foreach (var demoval in demoExtbFilterList)
            {
                var bList = new List<SubList>();
                foreach (var v in xdata)
                    if (v.MetricName == demoval.MetricName && v.DemoFilterName == demoval.DemoFilterName)
                    {
                        var l = new GetTableDataRespList();
                        l = v;
                        bList.Add(new SubList()
                        {
                            subList = l
                        });
                    }
                mainData.Add(new MainData()
                {
                    mainList = bList
                });
            }
            
            var json = new JavaScriptSerializer().Serialize(mainData);
            return mainData;
        }

        public List<SampleSizeList> PrepareSampleSizeListForExcel(TableInfo tblInfo,int selectedTopFilterId,string moduleType)
        {
            var sampleSizeList = new List<SampleSizeList>();
            var sampleSizeBevCatList = new List<SampleSizeList>();// Sample Size List of Next Levels only for  Beverage Guest Tab as we are getting null Sample Size from Backend 
            var xdata = tblInfo.GetTableDataResopnse.GetTableDataRespDt;
            foreach (var val in xdata)
            {
                bool mstStatus = true;
                foreach (var sampleval in sampleSizeList)
                {
                    if (sampleval.DemoFilterName == val.DemoFilterName && sampleval.EstablishmentName == val.EstablishmentName)
                    {
                        if (val.MetricSampleSize == null)
                        {
                            mstStatus = false;
                            break;
                        }

                    }
                }
                if (mstStatus)
                {
                    bool sampleNullCheck = false;
                    foreach (var sample in sampleSizeList)
                    {
                        if (sample.DemoFilterName == val.DemoFilterName && sample.EstablishmentName == val.EstablishmentName)
                        {
                            if (val.MetricSampleSize != null)
                            {
                                sample.MetricSampleSize = val.MetricSampleSize;
                                sampleNullCheck = true;
                            }
                        }
                    }
                    if (sampleNullCheck == false)
                    {

                        sampleSizeList.Add(new SampleSizeList()
                        {
                            DemoFilterName = val.DemoFilterName,
                            EstablishmentName = val.EstablishmentName,
                            MetricSampleSize = val.MetricSampleSize
                        });
                        if ((selectedTopFilterId == 5 || selectedTopFilterId == 7) && val.DemoFilterName.ToString().ToUpper() == "SSD REGULAR BRANDS")
                        {
                            sampleSizeBevCatList.Add(new SampleSizeList()
                            {
                                DemoFilterName = val.DemoFilterName,
                                EstablishmentName = val.EstablishmentName,
                                MetricSampleSize = val.MetricSampleSize
                            });
                        }

                        if (selectedTopFilterId == 9 && val.DemoFilterName.ToString().ToUpper() == "RESTAURANT FREQUENCY")
                        {
                            sampleSizeBevCatList.Add(new SampleSizeList()
                            {
                                DemoFilterName = val.DemoFilterName,
                                EstablishmentName = val.EstablishmentName,
                                MetricSampleSize = val.MetricSampleSize
                            });
                        }

                        if (selectedTopFilterId == 3 && val.DemoFilterName.ToString().ToUpper() == "ESTABLISHMENT CHOICE ATTRIBUTES")
                        {
                            sampleSizeBevCatList.Add(new SampleSizeList()
                            {
                                DemoFilterName = val.DemoFilterName,
                                EstablishmentName = val.EstablishmentName,
                                MetricSampleSize = val.MetricSampleSize
                            });
                        }
                        if (moduleType == "tablebeveragecomparison" || moduleType== "tablebeveragedeepdive")
                        {
                            if (selectedTopFilterId == 4 && val.DemoFilterName.ToString().ToUpper() == "TIME SPENT AT THE OUTLET")
                            {
                                sampleSizeBevCatList.Add(new SampleSizeList()
                                {
                                    DemoFilterName = val.DemoFilterName,
                                    EstablishmentName = val.EstablishmentName,
                                    MetricSampleSize = val.MetricSampleSize
                                });
                            }
                        }
                    }

                }

            }

            #region Only For Beverage Guest as Sample Size is getting null from backend and In Establishment Tab
            if (selectedTopFilterId == 5 )
            {
                foreach (var bevguestSampleSize in sampleSizeBevCatList)
                {
                    foreach (var sampleSize in sampleSizeList)
                    {
                        if (bevguestSampleSize.EstablishmentName == sampleSize.EstablishmentName && sampleSize.DemoFilterName.ToString().ToUpper() == "BEVERAGE CATEGORIES SUMMARY")
                        {
                            sampleSize.MetricSampleSize = bevguestSampleSize.MetricSampleSize;
                        }
                    }
                }
            }

            if (selectedTopFilterId == 7)
            {
                foreach (var bevguestSampleSize in sampleSizeBevCatList)
                {
                    foreach (var sampleSize in sampleSizeList)
                    {
                        if (bevguestSampleSize.EstablishmentName == sampleSize.EstablishmentName && sampleSize.DemoFilterName.ToString().ToUpper() == "BEVERAGE PURCHASED SUMMARY")
                        {
                            sampleSize.MetricSampleSize = bevguestSampleSize.MetricSampleSize;
                        }
                    }
                }
            }

            if (selectedTopFilterId == 9)
            {
                foreach (var bevguestSampleSize in sampleSizeBevCatList)
                {
                    foreach (var sampleSize in sampleSizeList)
                    {
                        if (bevguestSampleSize.EstablishmentName == sampleSize.EstablishmentName && sampleSize.DemoFilterName.ToString().ToUpper() == "RESTAURANT CHANNELS")
                        {
                            sampleSize.MetricSampleSize = bevguestSampleSize.MetricSampleSize;
                        }
                    }
                }
            }
            if (selectedTopFilterId == 3)
            {
                foreach (var bevguestSampleSize in sampleSizeBevCatList)
                {
                    foreach (var sampleSize in sampleSizeList)
                    {
                        if (bevguestSampleSize.EstablishmentName == sampleSize.EstablishmentName && sampleSize.DemoFilterName.ToString().ToUpper() == "LOCATION OF OUTLET")
                        {
                            sampleSize.MetricSampleSize = bevguestSampleSize.MetricSampleSize;
                        }
                    }
                }
            }

            if (moduleType == "tablebeveragecomparison" || moduleType == "tablebeveragedeepdive")
            {
                if (selectedTopFilterId == 4)
                {
                    foreach (var bevguestSampleSize in sampleSizeBevCatList)
                    {
                        foreach (var sampleSize in sampleSizeList)
                        {
                            if (bevguestSampleSize.EstablishmentName == sampleSize.EstablishmentName && sampleSize.DemoFilterName.ToString().ToUpper() == "AVG. TIME SPENT AT THE OUTLET")
                            {
                                sampleSize.MetricSampleSize = bevguestSampleSize.MetricSampleSize;
                            }
                        }
                    }

                }
            }
            #endregion
            return sampleSizeList;

        }


        public Color getFontColorBasedOnStatValue(double statValue)
        {

            Color statcolor = Color.Black;

            //if (int.TryParse(Convert.ToString(StatValue), out statval))

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

        public string sampleSizeStatus(int sampleSize)
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

        public string sheetName(int id)
        {
            string sheetName = "";
            switch (id)
            {
                case 0:
                    sheetName = "Guests - Demographics";
                    break;

                case 1:
                    sheetName = "Visits - Demographics";
                    break;

                case 2:
                    sheetName = "Pre-Visit";
                    break;
                case 3:
                    sheetName = "In-Establishment";
                    break;
                case 4:
                    sheetName = "Post-Visit";
                    break;
                case 5:
                    sheetName = "Beverage Guest";
                    break;
                case 6:
                    sheetName = "Digital Behaviour";
                    break;
                case 7:
                    sheetName = "In-Establishment Bev Details";
                    break;
                case 8:
                    sheetName = "Brand Health Metrics";
                    break;
                case 9:
                    sheetName = "Establishment Frequency";
                    break;
            }
            return sheetName;
        }

        public int setFrequencyBYdefault(int selectedcheckboxTopFiltersId,int isVisits,string selctedFrequencyId)
        {
            int id = 0;
            if (selectedcheckboxTopFiltersId == 1 && isVisits == 1)
            {
                if (selctedFrequencyId != "6")
                    id = Convert.ToInt32(selctedFrequencyId);
                else
                    id = 6;
            }
            else
            {
                switch (selectedcheckboxTopFiltersId)
                {
                    case 0:
                    case 1:
                    case 5:
                    case 8:
                        if (isVisits == 1)
                            id = 3;
                        else
                            id = Convert.ToInt32(selctedFrequencyId);
                        break;

                    case 2:
                    case 3:
                    case 4:
                    case 6:
                    case 7:
                        if (isVisits == 0)
                        {
                            id = 6;
                        }
                        else {
                            id = Convert.ToInt32(selctedFrequencyId);
                        }
                        break;
                    case 9:
                        id = 2;
                        break;
                }
            }
            return id;
        }
        public int setFrequencyBYdefaultForBeverage(int selectedcheckboxTopFiltersId,int isVisits,string selctedFrequencyId)
        {
            int id = 0;

            if (selectedcheckboxTopFiltersId == 1 && isVisits == 1)
            {
                if (selctedFrequencyId != "6")
                    id = Convert.ToInt32(selctedFrequencyId);
                else
                    id = 6;
            }
            else
            {
                switch (selectedcheckboxTopFiltersId)
                {
                    case 0:
                    case 1:
                    case 9:
                        if (isVisits == 1)
                            id = 1;
                        else
                            id = Convert.ToInt32(selctedFrequencyId);
                        break;

                    case 2:
                    case 3:
                    case 4:
                    case 7:
                        if (isVisits == 0)
                            id = 6;
                        else
                            id = Convert.ToInt32(selctedFrequencyId);
                        break;

                }
            }
            return id;
        }

        public string visitsORGuestsTxt(int id,int isVisits)
        {
            string txt = "";
            if (id == 1 && isVisits == 1)
            {
                txt = "Visits: ";
            }
            else
            {
                switch (id)
                {
                    case 0:
                    case 1:
                    case 5:
                    case 8:
                    case 9:
                        txt = "Guests: ";
                        break;

                    case 2:
                    case 3:
                    case 4:
                    case 6:
                    case 7:
                        txt = "Visits: ";
                        break;
                }
            }
            return txt;

        }

        public string setDefaultFrequency(int id,int isVisits,string selctedFrequency)
        {
            string txt = "";
            if (id == 1 && isVisits == 1)
            {
                if (selctedFrequency.ToLower() == "total visits")
                    txt = "Total Visits ";
                else
                    txt = "Total Visits" + "(" + selctedFrequency + ")";
            }
            else
            {
                switch (id)
                {
                    case 0:
                    case 5:
                        if (selctedFrequency.ToLower() == "quarterly+")
                            txt = "Quarterly+ ";
                        else
                            txt = selctedFrequency;
                        break;
                    case 8:
                        if (selctedFrequency.ToLower() == "quarterly+")
                            txt = "Establishment In Trade Area ";
                        else
                            txt = selctedFrequency;
                        break;
                    case 9:
                        if (selctedFrequency.ToLower() == "monthly+")
                            txt = "Monthly+ ";
                        else
                            txt = selctedFrequency;
                        break;
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 6:
                    case 7:
                        if (selctedFrequency.ToLower() == "total visits")
                            txt = "Total Visits ";
                        else
                            txt = "Total Visits" + "(" + selctedFrequency + ")";
                        break;
                }
            }
            return txt;

        }

        public string setDefaultFrequencyForBeverage(int id, int isVisits,string selctedFrequency)
        {
            string txt = "";

            if (id == 1 && isVisits == 1)
            {
                if (selctedFrequency.ToLower() == "total visits")
                    txt = "Total Visits ";
                else
                    txt = "Total Visits" + "(" + selctedFrequency +")";

            }
            else
            {
                switch (id)
                {
                    case 0:
                    case 1:
                    case 5:
                    case 8:
                    case 9:
                        if (isVisits == 1)
                            txt = "Monthly+";
                        else
                            txt = selctedFrequency;
                        break;

                    case 2:
                    case 3:
                    case 4:
                    case 6:
                    case 7:
                        if (selctedFrequency.ToLower() == "total visits")
                            txt = "Total Visits ";
                        else
                            txt = "Total Visits" + "(" + selctedFrequency + ")";
                        break;
                }
            }
            return txt;
        }

        public int setIsVisitsorGuestsId(int selectedcheckboxTopFiltersId,int isVisits)
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

        public FilterPanelInfo[] filtModification(FilterPanelInfo[] filter, int selectedcheckboxTopFilters, int selectedTopFilterId, string moduleType,string selctedFrequency,string selctedFrequencyId, string selectedConsumedFrqyid,int isVisits)
        {

            if (selectedcheckboxTopFilters != selectedTopFilterId)
            {
                var ConsumedFrequencyItem = (from fil in filter
                                            where !string.IsNullOrEmpty(fil.Name) && Convert.ToString(fil.Name).Equals("CONSUMED FREQUENCY", StringComparison.OrdinalIgnoreCase)
                                            select fil).ToList();
                if(ConsumedFrequencyItem.Count == 0)
                {
                    filter = filter.Concat(new FilterPanelInfo[] {
                        new FilterPanelInfo()
                    {
                        Name = "CONSUMED FREQUENCY",
                        SelectedID = 1
                    }
                    }).ToArray();                   
                }

                foreach (FilterPanelInfo fil in filter)
                {
                    if (moduleType == "Establishment(s)")
                    {
                        if (fil.Name == "Top Filter")
                            fil.SelectedID = selectedcheckboxTopFilters == 0 ? 1 : selectedcheckboxTopFilters;
                        if (fil.Name == "FREQUENCY")
                            fil.SelectedID = setFrequencyBYdefault(selectedcheckboxTopFilters,isVisits, selctedFrequencyId);
                        if (selectedcheckboxTopFilters == 5 && fil.Name == "CONSUMED FREQUENCY")
                        {
                            fil.SelectedID = 1;
                        }
                        else if (fil.Name == "CONSUMED FREQUENCY")
                            fil.SelectedID = "";
                        if (fil.Name == "IsVisit")
                            fil.SelectedID = setIsVisitsorGuestsId(selectedcheckboxTopFilters,isVisits);
                    }
                    else
                    {
                        if (fil.Name == "Top Filter")
                            fil.SelectedID = selectedcheckboxTopFilters == 0 ? 1 : selectedcheckboxTopFilters;
                        if (fil.Name == "FREQUENCY")
                            fil.SelectedID = setFrequencyBYdefaultForBeverage(selectedcheckboxTopFilters, isVisits, selctedFrequencyId);
                        if (moduleType == "Beverage(s)" && selectedcheckboxTopFilters == 9 && fil.Name == "CONSUMED FREQUENCY")
                        {
                            fil.SelectedID = 2;
                        }
                        else if (fil.Name == "CONSUMED FREQUENCY")
                        { 
                            fil.SelectedID = "";
                        }
                        if (fil.Name == "IsVisit")
                            fil.SelectedID = setIsVisitsorGuestsId(selectedcheckboxTopFilters, isVisits);
                    }
                   
                }
                //if (selectedcheckboxTopFilters == 5)
                //{
                //    filter[7].Name = "CONSUMED FREQUENCY";
                //    filter[7].SelectedID = 1;
                //}
                //else if (selectedcheckboxTopFilters == 9)
                //{
                //    filter[7].Name = "CONSUMED FREQUENCY";
                //    filter[7].SelectedID = 2;
                //}


            }
            else
            {
                foreach (FilterPanelInfo fil in filter)
                {
                    if (fil.Name == "Top Filter")
                        fil.SelectedID = selectedTopFilterId;
                        if (fil.Name == "FREQUENCY")
                            fil.SelectedID = selctedFrequencyId;
                    if (selectedTopFilterId == 5 || selectedTopFilterId == 9)
                    {
                        if (fil.Name == "CONSUMED FREQUENCY")
                            fil.SelectedID = selectedConsumedFrqyid;
                    }
                    if (selectedcheckboxTopFilters == 8)
                    {
                        if (fil.Name == "CONSUMED FREQUENCY")
                            fil.SelectedID = "";
                    }
                    if (selectedTopFilterId != 1)
                    {
                        if (fil.Name == "IsVisit")
                            fil.SelectedID = setIsVisitsorGuestsId(selectedcheckboxTopFilters,isVisits);
                    }
                    if (selectedTopFilterId == 1 && isVisits == 1)
                    {
                        if (fil.Name == "IsVisit")
                            fil.SelectedID = 1;
                    }

                }


            }
            return filter;

        }
        public string ToTitleCase(string str)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(str.ToLower());
        }
        #endregion
    }
}