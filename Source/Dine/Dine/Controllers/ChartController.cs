using Dine.Areas.StoryBoard.Models;
using Dine.BusinessLayer;
using Framework.Models;
using Framework.Models.Chart;
using Framework.Models.Users;
using System;
using System.Data;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Web;
using System.Web.Mvc;
using Aspose.Slides.Charts;
using AqUtility.Cached;
using System.Net.Http;
using Dine.Utility;

namespace Dine.Controllers
{
    public class ChartController : BaseController
    {
        private ChartBO chart = null;
        private StoryboardRepository storyboard = null;
        public ChartController() : base("Chart")
        {
            chart = new ChartBO();
            storyboard = new StoryboardRepository();
        }

        #region views
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult EstablishmentDeepDive()
        {
            return View();
        }

        public ActionResult EstablishmentCompare()
        {
            return View();
        }

        public ActionResult BeverageCompare()
        {
            return View();
        }

        public ActionResult BeverageDeepDive()
        {
            return View();
        }
        #endregion

        #region httppost
        [HttpPost]
        public JsonResult GetChart(FilterPanelInfo[] filter, string module, string measureType, string timePeriodType, string customBaseText)
        {
            LogEntries.LogSelection("CHARTS");//Added By Bramhanath for User Tracking(16-05-2017)
            string UserId = Session[Constants.Session.ActiveUserId].ToString();
            return Json(chart.GetChart(filter, module, measureType, timePeriodType, null, customBaseText, UserId), JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public string SaveChangedColorCode(List<ColorCodeData> ChangedColorCodeList, bool IsBeverageModule)
        {
            try
            {
                string UserId = Session[Constants.Session.ActiveUserId].ToString();
                chart.SaveChangedColorCodes(ChangedColorCodeList, IsBeverageModule, UserId);
                return "ok";
            }
            catch (Exception ex)
            {
                LogEntries.LogSelection("Error: SaveChangedColorCode Action - " + ex.Message);
                return "error";
            }
        }

        [HttpPost]
        public string ValidatePalletteColor(List<ColorCodeData> ChangedColorCodeList, bool IsBeverageModule)
        {
            try
            {
                string UserId = Session[Constants.Session.ActiveUserId].ToString();
                string retstr = chart.ValidatePalletteColor(ChangedColorCodeList, IsBeverageModule, UserId);
                return retstr;
            }
            catch (Exception ex)
            {
                LogEntries.LogSelection("Error: ValidatePalletteColor Action - " + ex.Message);
                return "error";
            }
        }

        [HttpPost]
        public string PreparePowerPoint(ExportDetails details)
        {
            string file = Session.SessionID;
            string template = "~/Templates/Chart_PowerPoint.pptx";
            chart.PreparePowerPoint(Server.MapPath("~/Temp/" + file + ".pptx"), Server.MapPath(template), "~/Temp/" + file + ".pptx", details, null);

            return file;
        }
        [HttpPost]
        public string ExportToPPTCharts(StoryBoardFilterInfo filter, string[] changedColors)
        {
            string colName = string.Empty, colName2 = string.Empty;

            if (filter.Module == "chartestablishmentdeepdive" || filter.Module == "chartbeveragedeepdive")
            {

                if (filter.TimePeriodText == "pit")
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
                if (filter.TimePeriodText == "pit")
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
            var chartType = getChartType(filter.ChartType);
            filter.OutputData = new StoryBoardSlideData()
            {
                XColumn = colName,
                YColumn = "MetricValue",
                SerisColumn = colName2,
                ChartType = chartType,
                StatText = filter.StatText
            };
            var filepath = Server.MapPath("~/Templates/ExportToPPTTemplate.pptx");
            if (filter.ChartType == "barchange") { filepath = Server.MapPath("~/Templates/barWithChange.pptx"); }
            if (filter.ChartType == "pyramid") { filepath = Server.MapPath("~/Templates/pyramid.pptx"); }
            if (filter.ChartType == "pyramidwithchange") { filepath = Server.MapPath("~/Templates/pyramidWithChange.pptx"); }
            var destFile = Server.MapPath("~/Temp/ExportedPPT" + Session.SessionID + ".pptx");

            //string[] changedColors = new string[] { "#E8456F", "#E7645F" };
            ChartBO chart = new ChartBO(changedColors);
            string UserId = Session[Constants.Session.ActiveUserId].ToString();
            chart.PreparePowerPointSlide(filepath, destFile, filter, UserId);
            LogEntries.LogSelection("CHARTS");//Added By Bramhanath for User Tracking(16-05-2017)
            Session["UserFilepptx"] = destFile;
            return Server.MapPath("~/Temp/ExportedPPT" + Session.SessionID + ".pptx");

        }
        [HttpPost]
        public string ExportToExcelChartTable(StoryBoardFilterInfo filter, string measureType, string frequency, string tableTitle, string customBaseText, string selectedDemofiltersList, string selectedAdvanceFitlersList, string measureParentName)
        {
            string colName = string.Empty, colName2 = string.Empty;

            if (filter.Module == "chartestablishmentdeepdive" || filter.Module == "chartbeveragedeepdive")
            {

                if (filter.TimePeriodText == "pit")
                {
                    colName = "Col4";
                    colName2 = "Col1";
                }
                else
                {
                    colName2 = "Col4";
                    colName = "TimePeriod";

                }
            }
            else
            {
                if (filter.TimePeriodText == "pit")
                {
                    colName = "Col2";
                    colName2 = "Col1";
                }
                else
                {
                    colName2 = "Col2";
                    colName = "TimePeriod";
                }
            }
            var chartType = getChartType(filter.ChartType);
            filter.OutputData = new StoryBoardSlideData()
            {
                XColumn = colName,
                YColumn = "MetricValue",
                SerisColumn = colName2,
                ChartType = chartType,
                StatText = filter.StatText
            };
            var filepath = Server.MapPath(@"~/Templates/ChartExportToExcelTemplate.xlsx");
            var destFile = Server.MapPath(@"~/Temp/ExportedExcel" + Session.SessionID + ".xlsx");
            string UserId = Session[Constants.Session.ActiveUserId].ToString();
            chart.PrepareExcelForChartTable(filepath, destFile, filter, measureType, frequency, tableTitle, customBaseText, selectedDemofiltersList, selectedAdvanceFitlersList, measureParentName, UserId);
            LogEntries.LogSelection("CHARTS");//Added By Bramhanath for User Tracking(16-05-2017)
            Session["UserFile"] = destFile;
            return Server.MapPath(@"~/Temp/ExportedExcel" + Session.SessionID + ".xlsx");
        }
        #endregion
        public void DownloadFile(string fileName)
        {
            string filename = Convert.ToString(Session["UserFile"]);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["UserFile"]), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();
            System.Web.HttpContext.Current.Response.ClearHeaders();
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn(fileName) + ".xlsx");
            System.Web.HttpContext.Current.Response.ContentType = "application/octet-stream";
            System.Web.HttpContext.Current.Response.AddHeader("Content-Length", new FileInfo(filename).Length.ToString());
            System.Web.HttpContext.Current.Response.AddHeader("Cache-Control", "no-store");
            System.Web.HttpContext.Current.Response.BinaryWrite(btFile);
            System.Web.HttpContext.Current.ApplicationInstance.CompleteRequest();
            //System.Web.HttpContext.Current.Response.Clear();
            System.Web.HttpContext.Current.Response.Flush();
            System.Web.HttpContext.Current.Response.End();
        }
        public void DownloadFilePPT(string fileName)
        {
            string filename = Convert.ToString(Session["UserFilepptx"]);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["UserFilepptx"]), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();

            System.Web.HttpContext.Current.Response.Clear();
            System.Web.HttpContext.Current.Response.Buffer = true;
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn(fileName) + ".pptx");

            System.Web.HttpContext.Current.Response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            System.Web.HttpContext.Current.Response.AddHeader("Content-Length", btFile.Length.ToString());
            System.Web.HttpContext.Current.Response.BinaryWrite(btFile);
            System.Web.HttpContext.Current.Response.Flush();
            System.Web.HttpContext.Current.Response.Close();
        }
        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(chart.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region methods
        [ActionName("GetFilter")]
        public JsonResult GetMenu(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                chart = new ChartBO(id);
                var jsonresult = Json(GetMenu(), JsonRequestBehavior.AllowGet);
                jsonresult.MaxJsonLength = Int32.MaxValue;
                //return GetMenu();
                return jsonresult;
            }
            return Json("");
        }

        public JsonResult GetAdvancedFilters(string id, int bitData)
        {
            IList<AdvancedFilterData> filter = chart.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;
            string cachedname = string.Empty;

            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                if (bitData == 0 || bitData == 1)
                {
                    cachedname = "add_chart_0_1";
                    filter = CachedQuery<IList<AdvancedFilterData>>.Cache.GetData(cachedname);
                    if (filter == null)
                    {
                        filter = chart.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;
                        chart = new ChartBO(id + "_demographics");
                        filter[0].Filters = chart.GetMenu().Filter;
                        chart = new ChartBO(id + "_visits");
                        filter[1].Filters = chart.GetMenu().Filter;
                        chart = new ChartBO(id + "_guest");
                        filter[2].Filters = chart.GetMenu().Filter;
                        CachedQuery<IList<AdvancedFilterData>>.Cache.SetData(cachedname, filter);
                    }
                }

                else if (bitData == 2 || bitData == 3)
                {
                    cachedname = "add_chart_2_3";
                    filter = CachedQuery<IList<AdvancedFilterData>>.Cache.GetData(cachedname);
                    if (filter == null)
                    {
                        filter = chart.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;
                        chart = new ChartBO(id + "_demographics");
                        filter[0].Filters = chart.GetMenu().Filter;
                        chart = new ChartBO(id + "_visits");
                        filter[1].Filters = chart.GetMenu().Filter;
                        chart = new ChartBO(id + "_establishment_frequency");
                        filter[2].Filters = chart.GetMenu().Filter;
                        CachedQuery<IList<AdvancedFilterData>>.Cache.SetData(cachedname, filter);
                    }
                }
                return Json(filter, JsonRequestBehavior.AllowGet);
            }
            return Json(filter, JsonRequestBehavior.AllowGet);
        }

        [ActionName("Dummy")]
        public override JsonResult GetAdvancedFilters(string id)
        {
            return Json(null, JsonRequestBehavior.AllowGet);
        }

        public FileResult DownloadExportToPPTCharts(string fileName)
        {
            return File(fileName, "application/vnd.openxmlformats-officedocument.presentationml.presentation", "Slide.pptx");
        }
        public FileResult DownloadExportToExcelChartTable(string fileName)
        {
            return File(fileName, "application/vnd.ms-excel", "Dine" + DateTime.Now.Date.ToShortDateString() + ".xlsx");
        }

        public string getChartType(string Charttype)
        {
            string asposeChartType = string.Empty;
            switch (Charttype.ToLower())
            {
                case "table":
                    asposeChartType = "table";
                    break;
                case "trend":
                    asposeChartType = "LineWithMarkers";
                    break;
                case "columnchart":
                    asposeChartType = "Column3D";
                    break;
                case "column":
                    asposeChartType = "Column3D";
                    break;
                case "barchart":
                    asposeChartType = "ClusteredBar";
                    break;
                case "bar":
                    asposeChartType = "ClusteredBar";
                    break;
                case "columnchartstacked":
                    asposeChartType = "StackedColumn";
                    break;
                case "stackedcolumn":
                    asposeChartType = "StackedColumn";
                    break;
                case "barchartstacked":
                    asposeChartType = "StackedBar";
                    break;
                case "stackedbar":
                    asposeChartType = "StackedBar";
                    break;
                case "groupedcolumnchart":
                    asposeChartType = "ClusteredColumn";
                    break;
                case "groupedbarchart":
                    asposeChartType = "ClusteredBar";
                    break;
                case "fullcolumnchartstacked":
                    asposeChartType = "PercentsStackedColumn";
                    break;
                case "fullbarchartstacked":
                    asposeChartType = "PercentsStackedBar";
                    break;
                case "barchange":
                    asposeChartType = "ClusteredBar";
                    break;
                case "pyramid":
                    asposeChartType = "PercentsStackedBar";
                    break;
                case "pyramidwithchange":
                    asposeChartType = "PercentsStackedBar";
                    break;
            }
            return asposeChartType;
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
        #endregion
    }
}

