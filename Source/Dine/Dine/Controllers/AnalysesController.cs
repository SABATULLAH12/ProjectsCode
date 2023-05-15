using Dine.BusinessLayer;
using Framework.Models;
using Framework.Models.Snapshot;
using Aspose.Slides;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Dine.Areas.StoryBoard.Controllers;
using System.IO;

namespace Dine.Controllers
{
    public class AnalysesController : BaseController
    {
        private SnapshotBO snapshot = null;
        public AnalysesController() : base("Analyses") { snapshot = new SnapshotBO(); }

        #region views
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult EstablishmentCompare()
        {
            return View();
        }
        public ActionResult EstablishmentDeepDive()
        {
            return View();
        }
        public ActionResult StoryBoard()
        {
            return View();
        }

        public ActionResult CrossDinerFrequencies()
        {
            return View();
        }
        #endregion

        #region httppost
        /// <summary>
        /// Get single Widget
        /// </summary>
        /// <param name="filter"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetWidgetInfo(FilterPanelInfo[] filter, WidgetInfo widget)
        {
            var custom = new CustomPropertyLabel() { UserType = "Admin", WidgetName = widget.WidgetName };
            return Json(snapshot.GetWidgetData(filter, widget, custom), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get All Widgets together
        /// </summary>
        /// <param name="filter"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetWidgetsInfo(FilterPanelInfo filter)
        {
            return Json(snapshot.GetWidgetsData(filter), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get Widgets
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetWidgets(FilterPanelInfo filter)
        {
            return Json(snapshot.GetWidgets(filter), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public string PreparePowerPoint(ExportDetails details)
        {
            var img = SaveScreenShotImage(System.Web.HttpContext.Current, details.Base64);
            Presentation pres = new Aspose.Slides.Presentation(Server.MapPath("~/Templates/Snapshot_PowerPoint.pptx"));
            ChangeImage(pres, pres.Slides[0], "New picture", img);
            pres.Save(Server.MapPath("~/Temp/" + Session.SessionID + ".pptx"), Aspose.Slides.Export.SaveFormat.Pptx);
            return Session.SessionID;
        }

        [HttpPost]
        public JsonResult GetAnalysesData(FilterPanelInfo[] filter,string module, string measureType)
        {
            LogEntries.LogSelection("CORRESPONDENCE MAPS");//Added By Bramhanath for User Tracking(16-05-2017)
            return Json(snapshot.GetAnalysesData(filter, null,module,measureType), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetCrossDinerFrequenciesData(FilterPanelInfo[] filter,string module, string measureType)
        {
            LogEntries.LogSelection("CROSS-DINING FREQUENCIES");//Added By Bramhanath for User Tracking(16-05-2017)
            return Json(snapshot.GetCrossDinerFrequenciesData(filter), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetRestaurantOrRetailers(int IsRestaurantorRetailer)
        {            
            return Json(snapshot.GetRestaurantOrRetailers(IsRestaurantorRetailer),JsonRequestBehavior.AllowGet);
        }

        public string ExportToPPTOther(StoryBoardFilterInfo filter, string measureType, string frequency, string tableTitle, string samplesizeLine, string measure_parent_text)
        {
            string colName = string.Empty, colName2 = string.Empty;

            if (filter.Module == "analysesestablishmentdeepdive")
            {
                    colName = "Col4";
                    colName2 = "Col1";
            }
            else
            {
                    colName = "Col2";
                    colName2 = "Col1";
            }
            filter.OutputData = new StoryBoardSlideData()
            {
                XColumn = colName,
                YColumn = "MetricValue",
                SerisColumn = colName2,
                ChartType = filter.ChartType,
                StatText = filter.StatText
            };
            var filepath = Server.MapPath("~/Templates/ExportToPPTOther.pptx");
            var destFile = Server.MapPath("~/Temp/ExportedPPT" + Session.SessionID + ".pptx");
            snapshot.PreparePowerPointSlides(filepath, destFile, filter,measureType, frequency, tableTitle, samplesizeLine, measure_parent_text);
            LogEntries.LogSelection("CORRESPONDENCE MAPS");//Added By Bramhanath for User Tracking(16-05-2017)
            Session["AnlyUserFilepptx"] = destFile;
            return Server.MapPath("~/Temp/ExportedPPT" + Session.SessionID + ".pptx");
        }
        [HttpPost]
        public string ExportToExcelOtherTable(StoryBoardFilterInfo filter, string measureType, string frequency, string tableTitle)
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
            var filepath = Server.MapPath("~/Templates/ExportToExcelOther.xlsm");
            var destFile = Server.MapPath("~/Temp/ExportedExcel" + Session.SessionID + ".xlsm");
            snapshot.PrepareExcelForOtherTable(filepath, destFile, filter, measureType, frequency, tableTitle);
            Session["AnlyUserFile"] = destFile;
            return Server.MapPath("~/Temp/ExportedExcel" + Session.SessionID + ".xlsm");
        }
        #endregion
        public string CrossDinerFrequncyExlDwnld(FilterPanelInfo[] filter, string module,string selectedDemofiltersList,List<ExportToExcel> selectedChkBxIds)
        {
           
            LogEntries.LogSelection("CROSS-DINING FREQUENCIES");//Added By Bramhanath for User Tracking(16-05-2017)
            var filepath = Server.MapPath("~/Templates/CrossDinerExcelTemplate.xlsx");
            var destFile = Server.MapPath("~/Temp/CrossDinerExcelTemplate" + Session.SessionID + ".xlsx");
            var mainList = snapshot.PrepareExcelCrossDinerTable(filter);
            var sampleSizeList = snapshot.PrepareSampleSizeListCrossDiner(mainList);
            destFile = snapshot.PrepareExcelForCrossDiner(filepath, destFile, mainList, filter, sampleSizeList, selectedDemofiltersList, selectedChkBxIds);
            Session["CrossDinerFrequency"] = destFile;
            return Server.MapPath("~/Temp/CrossDinerExcelTemplate" + Session.SessionID + ".xlsx");
        }
        
        public void DownloadFile(string fileName)
        {
            string filename = Convert.ToString(Session["AnlyUserFile"]);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["AnlyUserFile"]), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();
            System.Web.HttpContext.Current.Response.ClearHeaders();
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn(fileName) + ".xlsm");
            System.Web.HttpContext.Current.Response.ContentType = "application/octet-stream";
            System.Web.HttpContext.Current.Response.AddHeader("Content-Length", new FileInfo(filename).Length.ToString());
            System.Web.HttpContext.Current.Response.AddHeader("Cache-Control", "no-store");
            System.Web.HttpContext.Current.Response.BinaryWrite(btFile);
            System.Web.HttpContext.Current.ApplicationInstance.CompleteRequest();
            //System.Web.HttpContext.Current.Response.Clear();
            System.Web.HttpContext.Current.Response.Flush();
            System.Web.HttpContext.Current.Response.End();
        }

        public void DownloadCrossDinerFile(string fileName)
        {
            string filename = Convert.ToString(Session["CrossDinerFrequency"]);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["CrossDinerFrequency"]), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();
            System.Web.HttpContext.Current.Response.ClearHeaders();
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn("Cross-Dining Frequencies") + ".xlsx");
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
            string filename = Convert.ToString(Session["AnlyUserFilepptx"]);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["AnlyUserFilepptx"]), System.IO.FileMode.Open);

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
            return Json(snapshot.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }

        [ActionName("GetFilter")]
        public JsonResult GetMenu(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                snapshot = new SnapshotBO(controller);
                return GetMenu();
            }
            return Json("");
        }
        public override JsonResult GetAdvancedFilters(string id)
        {
            IList<AdvancedFilterData> filter = snapshot.GetAdvancedFilter() as IList<AdvancedFilterData>;
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                snapshot = new SnapshotBO(id + "_demographics");
                filter[0].Filters = snapshot.GetMenu().Filter;
                snapshot = new SnapshotBO(id + "_visits");
                filter[1].Filters = snapshot.GetMenu().Filter;
                snapshot = new SnapshotBO(id + "_guest");
                filter[2].Filters = snapshot.GetMenu().Filter;

                return Json(filter, JsonRequestBehavior.AllowGet);
            }
            return Json(filter, JsonRequestBehavior.AllowGet);
        }
        #endregion

        public JsonResult GetCsvData(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                var filepath = Server.MapPath("~/Temp/" + id);
                if (System.IO.File.Exists(filepath))
                {
                    return Json(System.IO.File.ReadAllLines(filepath), JsonRequestBehavior.AllowGet);
                }
            }
            return Json(string.Empty, JsonRequestBehavior.AllowGet);
        }
        public static void ChangeImage(Aspose.Slides.Presentation pres, Aspose.Slides.ISlide sld, string CurrentImageName, string ReplaceImagePath)
        {
            for (int i = 0; i < sld.Shapes.Count; i++)
            {
                if (sld.Shapes[i] is Shape)
                {
                    Shape shp = (Shape)sld.Shapes[i];
                    string strname = (string)shp.Name;
                    if (strname == CurrentImageName)
                    {
                        Aspose.Slides.IPictureFrame pf = (Aspose.Slides.IPictureFrame)shp;
                        using (System.Drawing.Image img = (System.Drawing.Image)new Bitmap(ReplaceImagePath))
                        {
                            IPPImage imgx = pres.Images.AddImage(img);
                            pf = sld.Shapes.AddPictureFrame(Aspose.Slides.ShapeType.Rectangle, shp.X, shp.Y, shp.Width, shp.Height, imgx);
                            shp.FillFormat.FillType = FillType.NoFill;
                            shp.X = 0;
                            shp.Y = 0;
                            shp.Width = 0;
                            shp.Height = 0;
                            break;
                        }
                    }
                }
            }
        }

        public FileResult DownloadExportToPPTOther(string fileName)
        {
            return File(fileName, "application/vnd.openxmlformats-officedocument.presentationml.presentation", "Slide.pptx");
        }
        public FileResult DownloadExportToExcelOtherTable(string fileName)
        {
            return File(fileName, "application/vnd.ms-excel", "Dine" + DateTime.Now.Date.ToShortDateString() + ".xlsm");
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
                case "barchart":
                    asposeChartType = "ClusteredBar";
                    break;
                case "columnchartstacked":
                    asposeChartType = "StackedColumn";
                    break;
                case "barchartstacked":
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
            }
            return asposeChartType;
        }
    }
}
