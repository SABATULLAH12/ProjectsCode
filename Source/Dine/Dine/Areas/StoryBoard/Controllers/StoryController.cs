using Dine.BusinessLayer;
using Framework.Models.Users;
using System.Collections.Generic;
using System.Web.Mvc;
using Dine.Areas.StoryBoard.Models;
using Aq.Plugin.AsposeExport;
using Aspose.Slides;
using Aq.Plugin.AsposeExport.Domain;
using Aq.Plugin.AsposeExport.Contracts;
using Aspose.Slides.Charts;
using System.Web.Script.Serialization;
using Framework.Models;
using fm = Framework.Models;
using System;
using System.IO;
using Framework.Data;
using System.Drawing;
using System.Web;
using System.Linq;
using sbmodels = Dine.Areas.StoryBoard.Models;
using System.Data;
using Dine.Utility;

namespace Dine.Areas.StoryBoard.Controllers
{
    public class StoryController : Dine.Controllers.BaseController
    {
        StoryboardRepository storyboard = null;
        private readonly IStoryBoardDA sb = null;
        public StoryController() : base("storyboard")
        {
            storyboard = new StoryboardRepository();
            sb = new StoryBoardDA();

            license.SetLicense(System.Web.HttpContext.Current.Server.MapPath("~/Aspose.Slides.lic"));
        }

        #region Views

        public ActionResult Index()
        {
            return View();
        }

        #endregion

        #region JSON
        [HttpGet]
        public JsonResult GetReports()
        {
            return Json(storyboard.GetReports((Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email), JsonRequestBehavior.AllowGet);
        }
        public JsonResult LockReport(int ReportID)
        {
            return Json(storyboard.LockReport(ReportID, (Session[Utility.Constants.Session.ActiveUser] as UserDetail)), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetSharedByMeReports()
        {
            return Json(storyboard.GetSharedByMeReports((Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email), JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetSharedWithMeReports()
        {
            return Json(storyboard.GetSharedWithMeReports((Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email), JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetUsersToShare()
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail); 
            return Json(sb.GetUSersList(currentUser.Email), JsonRequestBehavior.AllowGet);            
        }
        [HttpGet]
        public JsonResult GetGroupsToShare()
        {
            return Json(storyboard.GetGroupsToShare((Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public string ShareReportToUser(fm.SlideShare slideShare)
        {
            slideShare.SharedByMail = (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email;
            slideShare.SharedBy = (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Name;
            ////Update the TimeStamp
            //if (slideShare.timeStamp != null)
            //{
            //    slideShare.SharedOn = new DateTime(1970, 1, 1).AddTicks((long)slideShare.timeStamp * 10000);
            //}
            //else
            //{
                slideShare.SharedOn = DateTime.UtcNow;
            //}
            if (slideShare.SharedBy != slideShare.SharedTo)
            {
                return (sb.ShareReport(slideShare));
                //storyboard.ShareReportToUser(slideShare);
            }
            return "Error";
        }
        [HttpPost]
        public void ShareReportToGroup(string GroupName, int REPORT_ID)
        {
            string email = (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email;
            string name = (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Name;
            storyboard.ShareReportToGroup(GroupName, REPORT_ID, email, name);
        }

        [HttpGet]
        public JsonResult GetReportSlides(int reportId)
        {
            return Json(storyboard.GetReportSlides(reportId), JsonRequestBehavior.AllowGet);
        }
        #endregion
        [HttpPost]
        public void SaveAsReport(int ReportId, string ReportName)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            sbmodels.Report rpt = storyboard.GetReportDetails(ReportId);
            rpt.CreatedBy = currentUser.Name;
            rpt.Name = ReportName;
            rpt.UpdatedBy = currentUser.Name;
            rpt.UpdatedOn = DateTime.UtcNow;
            rpt.CreatedOn = DateTime.UtcNow;
            rpt.Email = currentUser.Email;
            storyboard.SaveAsReport(rpt, currentUser);
        }

        [HttpGet]
        public JsonResult GetReportDetails(int ReportId)
        {
            return Json(storyboard.GetReportDetails(ReportId), JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetSlideDetails(int SlideID)
        {
            return Json(storyboard.GetSlideDetails(SlideID), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetFavoriteReports()
        {
            return Json(storyboard.GetFavoriteReports((Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public void ReleaseLock(int ReportID)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            storyboard.ReleaseLock(ReportID, currentUser);
        }

        [HttpPost]
        public void DeleteReport(int ReportId)
        {
            RemoveMyFavorite(ReportId);
            storyboard.DeleteReport(ReportId, (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email);

        }

        [HttpPost]
        public string DeleteSlide(int[] slides)
        {
            return storyboard.DeleteSlide(slides, (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email);
        }

        [HttpPost]
        public void AddNotes(SlideNotes note)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            storyboard.AddNotesToSlide(note);
            storyboard.LastUpdated(note, currentUser);
        }
        [HttpPost]
        public bool AddReportToFavorite(int ReportId)
        {
            FavoriteReport frpt = new FavoriteReport() { ReportID = ReportId, Email = (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email };
            return storyboard.AddReportToFavorite(frpt);
        }
        public void RemoveMyFavorite(int ReportId)
        {
            FavoriteReport frpt = new FavoriteReport() { ReportID = ReportId, Email = (Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email };
            storyboard.RemoveMyFavorite(frpt);
        }

        [HttpGet]
        public JsonResult GetSlideNotes(int SlideID)
        {
            return Json(storyboard.GetSlideNotes(SlideID), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public void CreateReport(StoryBoardFilterInfo filter)
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

            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            //  filter.OutputData.XColumn = "";

            sbmodels.Report rp = new sbmodels.Report()
            {
                Name = filter.ReportName,
                Email = currentUser?.Email,
                UpdatedBy = currentUser?.Name,
                CreatedBy = currentUser?.Name,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
                Slides = new List<Models.Slide>()
                {
                    new Models.Slide() {
                        Email =(Session[Utility.Constants.Session.ActiveUser] as UserDetail)?.Email,
                        UpdatedBy = currentUser?.Name,
                        CreatedBy = currentUser?.Name,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        TimePeriodType=filter.TimePeriodType,
                        FromTimeperiod = filter.FromTimePeriod,
                        ToTimeperiod=filter.ToTimePeriod,
                        Module=filter.Module,
                        Filter= new JavaScriptSerializer().Serialize(filter.Filter),
                        OutputData=new JavaScriptSerializer().Serialize(filter.OutputData)
                    }
                }
            };
            int SlideID = storyboard.AddReport(rp);
            storyboard.SaveByteArrayAsImage(filter.Image, SlideID);
        }

        [HttpPost]
        public void AddSlideToReport(int Id, StoryBoardFilterInfo filter)
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
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            int SlideID = storyboard.AddSlideToReport(Id, filter, currentUser);
            storyboard.SaveByteArrayAsImage(filter.Image, SlideID);
        }


        [HttpPost]
        public string EditReport(StoryBoardFilterInfo filter)
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

            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            var str = storyboard.EditSlideAndReport(filter, currentUser);
            if (str == "Slide Edited Successfully")
            {
                storyboard.SaveByteArrayAsImage(filter.Image, filter.SlideID);
            }
            return str;
        }

        [HttpPost]
        public void updateReport(int ReportId, string ReportName)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            sbmodels.Report rpt = storyboard.GetReportDetails(ReportId);
            rpt.CreatedBy = currentUser.Name;
            rpt.Name = ReportName;
            rpt.UpdatedBy = currentUser.Name;
            rpt.UpdatedOn = DateTime.UtcNow;
            rpt.CreatedOn = DateTime.UtcNow;
            rpt.Email = currentUser.Email;
            storyboard.UpdateReport(rpt, currentUser);
        }

        [HttpPost]
        public string SaveCustomDownload(CustomSlideDetails[] custom, int ReportId, string Name)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            CustomDownload cd = new CustomDownload();
            cd.CreatedBy = currentUser.Name;
            cd.Name = Name;
            cd.Slides = new JavaScriptSerializer().Serialize(custom);
            cd.ReportId = ReportId;
            cd.CreatedOn = DateTime.UtcNow;
            cd.Email = currentUser.Email;
            return storyboard.SaveCustomDownload(cd);
        }

        [HttpPost]
        public JsonResult GetCustomDownloadList(int ReportId)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            return Json(storyboard.GetCustomDownloadList(ReportId, currentUser), JsonRequestBehavior.AllowGet);

        }
        [HttpPost]
        public string CustomDownloadSlides(CustomSlideDetails[] custom, int ReportId, int[] SlideIds)
        {
            PreparePowerPointCustomDownloadSlides(storyboard.GetSlides(SlideIds), custom, ReportId);
            string repName = storyboard.GetReportDetails(ReportId).Name;
            return repName;//Server.MapPath("~/Temp/Report" + Session.SessionID + ".pptx");
        }
        [HttpPost]
        public JsonResult DeleteSavedCustomDownload(int ReportId, string Name)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            return Json(storyboard.DeleteSavedCustomDownload(ReportId, Name, currentUser), JsonRequestBehavior.AllowGet);
        }
        public void PreparePowerPointCustomDownloadSlides(IEnumerable<Models.Slide> slides, CustomSlideDetails[] custom, int ReportId)
        {
            string UserId = Session[Constants.Session.ActiveUserId].ToString();
            var filepath = Server.MapPath("~/Templates/CustomDownloadTemplate.pptx");
            ISlideReplace _slideReplace = new SlideReplace();
            int slideNo = 1;
            int series_ind = 0, dp_index = 0;
            double[] cols;
            double[] rows;
            int pyramidflag = 0;
            using (Presentation pres = new Presentation(filepath))
            {
                Presentation prnt = new Presentation();
                prnt.SlideSize.Type = SlideSizeType.Custom;
                prnt.SlideSize.Size = new SizeF(new PointF(pres.SlideSize.Size.Width, pres.SlideSize.Size.Height));
                for (int i = 0; i < custom.Length; i++)
                {
                    int[] slideIDS = Array.ConvertAll(custom[i].SlideIds.Split(','), int.Parse);
                    int slideIndex = GetSlideIndex(slideIDS);
                    IList<ElementDetail> elements = new List<ElementDetail>();
                    IList<ChartDetail> charts = new List<ChartDetail>();
                    IList<TableDetail> tables = new List<TableDetail>();
                    string[] InsertedShapes = new string[(slideIDS.Length * 6)];
                    int k = 0;
                    //Check If pyramid is there
                    if (slideIndex == 0)
                    {
                        var sD = getSlide(slideIDS[0], slides);
                        var pData = new JavaScriptSerializer().Deserialize<FilterPanelInfo[]>(sD.Filter);
                        if (pData[0].active_chart_type == "pyramid")
                        {
                            slideIndex = 4;
                        }
                        if (pData[0].active_chart_type == "pyramidwithchange") { slideIndex = 5; }
                    }
                    prnt.Slides.AddClone(pres.Slides[slideIndex]);
                    pyramidflag = 0;
                    var shp = prnt.Slides[slideNo].Shapes;
                    List<string>[] seriesPointList = new List<string>[slideIDS.Length];
                    List<string>[] dataPointList = new List<string>[slideIDS.Length];
                    Color2DArray[] color2dArray = new Color2DArray[slideIDS.Length];
                    List<string> chartNames = new List<string>(); bool ToSkip = false;
                    for (int j = 0; j < slideIDS.Length; j++)
                    {
                        var slid = getSlide(slideIDS[j], slides);
                        var data = new JavaScriptSerializer().Deserialize<FilterPanelInfo[]>(slid.Filter);
                        string statTest = (data[0].statOption.ToUpper() == "CUSTOM BASE") ? (data[0].customBase == null ? "" : data[0].customBase) : (data[0].statOption);
                        var OutputData = new JavaScriptSerializer().Deserialize<StoryBoardSlideData>(slid.OutputData);
                        if (slid.FromTimeperiod.ToLower().Trim() == "total") { slid.FromTimeperiod = "Total"; }
                        if (slid.ToTimeperiod != null && slid.ToTimeperiod.ToLower().Trim() == "total") { slid.ToTimeperiod = "Total"; }
                        if (slid.TimePeriodType.ToLower().Trim() == "total") { slid.TimePeriodType = "Total"; }
                        if (data != null)
                        {
                            if (OutputData != null)
                            {
                                if (OutputData.Data == null)
                                {
                                    //call the procedure and update the data.OutputData.Data data
                                    OutputData.Data = (new ChartBO()).GetDataTable(data, slid.Module, "", slid.TimePeriodType, null, (data[0].statOption.ToLower() == "custom base" ? data[0].statOption : data[0].customBase), slid.ToTimeperiod, slid.FromTimeperiod, UserId);
                                }
                                if (j == 0)
                                    InsertedShapes[k++] = "Comment";
                                InsertedShapes[k++] = "ChartTitle" + (j + 1);
                                InsertedShapes[k++] = "Stat" + (j + 1);
                                InsertedShapes[k++] = "TimePeriod" + (j + 1);
                                foreach (var item in shp)
                                {
                                    if (item.Name == "Comment")
                                    {
                                        ((IAutoShape)item).TextFrame.Text = slid.Comment == null ? "" : slid.Comment;
                                    }
                                    if (item.Name == "ChartTitle" + (j + 1))
                                    {
                                        ((IAutoShape)item).TextFrame.Paragraphs.Clear();
                                        ((IAutoShape)item).TextFrame.Paragraphs.Add(new Paragraph());
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Clear();
                                        if (slid.Module == "chartbeveragedeepdive" || slid.Module == "chartestablishmentdeepdive")
                                        {
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = OutputData.Data.Rows[0]["Col2"].ToString() + "\n" });
                                        }
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = OutputData.Data.Rows[0]["Col3"].ToString() });
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = "\n" + (data[0].DemoAndTopFilters == null ? "" : data[0].DemoAndTopFilters) });
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontBold = NullableBool.True;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FontBold = NullableBool.True;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 12;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FontHeight = 9;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].ParagraphFormat.Alignment = TextAlignment.Center;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        if (slid.Module == "chartbeveragedeepdive" || slid.Module == "chartestablishmentdeepdive")
                                        {
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FontBold = NullableBool.True;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FontHeight = 9;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        }
                                        //((IAutoShape)item).TextFrame.Text = OutputData.Data.Rows[0]["Col3"].ToString() + "\n" + (data[0].DemoAndTopFilters == null ? "" : data[0].DemoAndTopFilters);
                                    }
                                    if (item.Name == "Stat" + (j + 1))
                                    {
                                        ((IAutoShape)item).TextFrame.Text = "Stat tested at 95% CL against - " + statTest.ToUpper();
                                    }
                                    if (item.Name == "TimePeriod" + (j + 1))
                                    {
                                        ((IAutoShape)item).TextFrame.Text = "Time period : " + (data[0].isTrendTable == "true" ? slid.FromTimeperiod + "to" + slid.ToTimeperiod : slid.FromTimeperiod);
                                    }
                                }
                                if (data[0].active_chart_type == "pyramid" || data[0].active_chart_type == "pyramidwithchange")
                                {
                                    #region pyramid
                                    pyramidflag = 1;
                                    //Update the datatable
                                    int ss = 0;
                                    bool isChange = data[0].active_chart_type == "pyramidwithchange";
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
                                                item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                                item["ColorForLabels"] = item["ColorForLabels"].ToString() == "Black" ? "Gray" : item["ColorForLabels"];
                                            }
                                            else
                                            {
                                                item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                            }
                                            if (item[OutputData.XColumn].ToString() == data[0].customBase) { item["ColorForLabels"] = "Blue"; }
                                        }
                                    }
                                    OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'");
                                    List<string> allSeries = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                    int slideno = slideNo, indx = 1;
                                    //Delete chart if less than 4
                                    if (4 > allSeries.Count)
                                    {
                                        for (int jInd = 0; jInd < 4 - allSeries.Count; jInd++)
                                        {
                                            prnt.Slides[slideno].Shapes.Remove(prnt.Slides[slideno].Shapes.Where(x => x.Name == "chart" + (4 - jInd)).FirstOrDefault());
                                            if (isChange)
                                            {
                                                prnt.Slides[slideno].Shapes.Remove(prnt.Slides[slideno].Shapes.Where(x => x.Name == "ch" + (4 - jInd)).FirstOrDefault());
                                                prnt.Slides[slideno].Shapes.Remove(prnt.Slides[slideno].Shapes.Where(x => x.Name == "table" + (4 - jInd)).FirstOrDefault());
                                            }
                                        }
                                    }
                                    for (int iInd = 1; iInd <= allSeries.Count; iInd++)
                                    {
                                        //Plot charts
                                        (new ChartBO()).plotIndividualPyramid(allSeries[iInd - 1], OutputData, prnt.Slides[slideno], indx, iInd - 1, isChange);
                                        if (iInd % 4 == 0)
                                        {
                                            indx = 1;
                                            if (iInd + 1 <= allSeries.Count)
                                            {
                                                //Add slides if required
                                                prnt.Slides.AddClone(prnt.Slides[slideNo]); slideno++; slideNo++;
                                                //Delete the charts if not required
                                                if (iInd + 4 > allSeries.Count)
                                                {
                                                    for (int jInd = 0; jInd < ((iInd + 4) - allSeries.Count); jInd++)
                                                    {
                                                        prnt.Slides[slideno].Shapes.Remove(prnt.Slides[slideno].Shapes.Where(x => x.Name == "chart" + (4 - jInd)).FirstOrDefault());
                                                        if (isChange)
                                                        {
                                                            prnt.Slides[slideno].Shapes.Remove(prnt.Slides[slideno].Shapes.Where(x => x.Name == "ch" + (4 - jInd)).FirstOrDefault());
                                                            prnt.Slides[slideno].Shapes.Remove(prnt.Slides[slideno].Shapes.Where(x => x.Name == "table" + (4 - jInd)).FirstOrDefault());
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else { indx++; }
                                    }
                                    #endregion pyramid
                                }
                                else
                                {
                                    #region Table
                                    if (OutputData.ChartType.ToLower().Trim() == "table")
                                    {
                                        //Remove barTable
                                        prnt.Slides[slideNo].Shapes.Remove(prnt.Slides[slideNo].Shapes.Where(x => x.Name == "table" + (j + 1)).FirstOrDefault());
                                        if (j == 0 && color2dArray.Count() == 2) { ToSkip = true; }
                                        //plot table
                                        //Modifying table data
                                        System.Data.DataTable chartTable = new System.Data.DataTable();
                                        String col3Name = OutputData.Data.Rows[0][2].ToString();
                                        bool isNewTableStructure = false;
                                        IEnumerable<string> xAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct();
                                        IEnumerable<string> yAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct();
                                        if (OutputData.SerisColumn == "TimePeriod")
                                        {
                                            col3Name = "";
                                            switch (slid.Module)
                                            {
                                                case "chartestablishmentcompare": col3Name = "Establishment"; if (data.Where(x => x.Name == "Establishment").FirstOrDefault().Data.Count() > 1) { isNewTableStructure = true; } break;
                                                case "chartbeveragecompare": col3Name = "Beverage"; if (data.Where(x => x.Name == "Beverage").FirstOrDefault().Data.Count() > 1) { isNewTableStructure = true; } break;
                                                case "chartestablishmentdeepdive":
                                                case "chartbeveragedeepdive":
                                                    col3Name = data[1].DemoAndTopFilters;
                                                    //If measures are multiple or Metric Comparison then yAxis should contain those
                                                    if (data.Where(x => x.Name == "Measures").FirstOrDefault().Data.Count() > 1)
                                                    {
                                                        isNewTableStructure = true;
                                                        OutputData.XColumn = "Col1";
                                                    }
                                                    if (data.Where(x => x.Name == "Metric Comparisons").FirstOrDefault().Data.Count() > 1)
                                                    { isNewTableStructure = true; }
                                                    break;
                                            }
                                            xAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct();
                                            yAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct();
                                        }

                                        //preparing columns
                                        chartTable.Columns.Add(OutputData.Data.Rows[0][2].ToString());
                                        foreach (var item in xAxis)
                                        {
                                            chartTable.Columns.Add(item);
                                        }
                                        //Adding first row
                                        chartTable.Rows.Add();
                                        chartTable.Rows.Add();
                                        var freq = data.Where(x => x.Name == "FREQUENCY").FirstOrDefault();
                                        chartTable.Rows[0][0] = freq == null ? "" : freq.Data[0].Text;
                                        Color[,] labelColorArray = isNewTableStructure == true ? new Color[chartTable.Rows.Count + 2 * yAxis.Count() + 1, chartTable.Columns.Count + 1] : new Color[chartTable.Rows.Count + yAxis.Count() + 1, chartTable.Columns.Count + 1];
                                        int tbl_fact = 1, tbl_mul_fact = 0;
                                        if (isNewTableStructure) { tbl_fact = 2; tbl_mul_fact = 2; chartTable.Rows.Add(); chartTable.Rows[2][0] = col3Name; };

                                        //preparing data
                                        for (int xCol = 0; xCol < xAxis.Count(); xCol++)
                                        {
                                            chartTable.Rows[0][xCol + 1] = xAxis.ElementAt(xCol);
                                            double CalculatedStatVal = 0; int? rowSampleSize = 0; string out_put = "";
                                            if (!isNewTableStructure)
                                            {
                                                out_put = Convert.ToString((from DataRow dr in OutputData.Data.Rows
                                                                            where (string)dr[OutputData.SerisColumn == "TimePeriod" ? "Timeperiod" : OutputData.XColumn] == xAxis.ElementAt(xCol) && Convert.ToString(dr["TotalSamplesize"]) != ""
                                                                            select dr["TotalSamplesize"]).FirstOrDefault());

                                                rowSampleSize = out_put == "" ? null : (int?)(Convert.ToUInt32(out_put));
                                                chartTable.Rows[1][xCol + 1] = rowSampleSize == null || rowSampleSize < 30 ? (rowSampleSize == null ? "NA" : rowSampleSize.ToString() + "(Low sample size)") : rowSampleSize.ToString();
                                                if (rowSampleSize != null && rowSampleSize <= 99 && rowSampleSize >= 30)
                                                {
                                                    chartTable.Rows[1][xCol + 1] = rowSampleSize + "(Use Directionally)";
                                                }
                                            }
                                            else
                                            {
                                                chartTable.Rows[1][xCol + 1] = "";
                                                chartTable.Rows[2][xCol + 1] = "";
                                            }
                                            for (int yCol = 0; yCol < yAxis.Count(); yCol++)
                                            {
                                                if (xCol == 0)
                                                {
                                                    chartTable.Rows.Add();
                                                    //If new table structure then Add one samplesize row
                                                    if (isNewTableStructure == true)
                                                    {
                                                        chartTable.Rows.Add();
                                                        chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 1][0] = "Sample Size";
                                                        chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][0] = yAxis.ElementAt(yCol);
                                                    }
                                                    else
                                                        chartTable.Rows[yCol + tbl_mul_fact + 2][0] = yAxis.ElementAt(yCol);
                                                }
                                                //If New structure then Update the rowSamplesize
                                                if (isNewTableStructure)
                                                {
                                                    out_put = Convert.ToString((from DataRow dr in OutputData.Data.Rows
                                                                                where (string)dr[OutputData.SerisColumn == "TimePeriod" ? "Timeperiod" : OutputData.XColumn] == xAxis.ElementAt(xCol) && Convert.ToString(dr[OutputData.XColumn]) == yAxis.ElementAt(yCol) && Convert.ToString(dr["SampleSize"]) != ""
                                                                                select dr["SampleSize"]).FirstOrDefault());
                                                    rowSampleSize = out_put == "" ? null : (int?)(Convert.ToUInt32(out_put));
                                                    //Add sample size row for each Metric Value
                                                    chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 1][xCol + 1] = rowSampleSize == null || rowSampleSize < 30 ? (rowSampleSize == null ? "NA" : rowSampleSize.ToString() + "(Low sample size)") : rowSampleSize.ToString();
                                                    if (rowSampleSize != null && rowSampleSize <= 99 && rowSampleSize >= 30)
                                                    {
                                                        chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 1][xCol + 1] = rowSampleSize + "(Use Directionally)";
                                                    }
                                                    //Add color to these rows as gray
                                                    labelColorArray[yCol * tbl_fact + tbl_mul_fact + 1, xCol + 1] = Color.Gray; labelColorArray[yCol * tbl_fact + tbl_mul_fact + 1, 0] = Color.Gray;
                                                }
                                                if (rowSampleSize == null)
                                                {
                                                    chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = "NA";
                                                }
                                                else
                                                {
                                                    if (rowSampleSize < 30)
                                                    {
                                                        chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = "";
                                                    }
                                                    else
                                                    {
                                                        if (OutputData.SerisColumn == "TimePeriod")
                                                        {
                                                            chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = (from DataRow dr in OutputData.Data.Rows
                                                                                                                             where (string)dr[OutputData.SerisColumn] == xAxis.ElementAt(xCol) && (string)dr[OutputData.XColumn] == yAxis.ElementAt(yCol)
                                                                                                                             select dr["MetricValue"]).FirstOrDefault();
                                                            double.TryParse((from DataRow dr in OutputData.Data.Rows
                                                                             where (string)dr[OutputData.SerisColumn] == xAxis.ElementAt(xCol) && (string)dr[OutputData.XColumn] == yAxis.ElementAt(yCol)
                                                                             select dr["SignificanceValue"]).FirstOrDefault().ToString(), out CalculatedStatVal);
                                                        }
                                                        else
                                                        {
                                                            chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = (from DataRow dr in OutputData.Data.Rows
                                                                                                                             where (string)dr[OutputData.SerisColumn] == yAxis.ElementAt(yCol) && (string)dr[OutputData.XColumn] == xAxis.ElementAt(xCol)
                                                                                                                             select dr["MetricValue"]).FirstOrDefault();
                                                            double.TryParse((from DataRow dr in OutputData.Data.Rows
                                                                             where (string)dr[OutputData.SerisColumn] == yAxis.ElementAt(yCol) && (string)dr[OutputData.XColumn] == xAxis.ElementAt(xCol)
                                                                             select dr["SignificanceValue"]).FirstOrDefault().ToString(), out CalculatedStatVal);
                                                        }
                                                        chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = (chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] == DBNull.Value) ? "0.0%" : Convert.ToDouble(chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1]).ToString("##0.0%");
                                                    }
                                                    //Assign color for Stat Val
                                                    if (rowSampleSize <= 99 && rowSampleSize >= 30) { labelColorArray[yCol * tbl_fact + tbl_mul_fact + 2, xCol + 1] = Color.Gray; }
                                                    labelColorArray[yCol * tbl_fact + tbl_mul_fact + 2, xCol + 1] = (new ChartBO()).getFontColorBasedOnStatValue(CalculatedStatVal);
                                                    if (xAxis.ElementAt(xCol) == data[0].customBase) { labelColorArray[yCol * tbl_fact + tbl_mul_fact + 2, xCol + 1] = Color.Blue; }
                                                }
                                            }
                                        }
                                        chartTable.Rows[1][0] = isNewTableStructure ? "" : "Sample Size";
                                        //table position and dimmension variables
                                        int restCol_Width = 802, x_pos = 5, y_pos = 65;
                                        switch (j)
                                        {
                                            case 1: if (slideIDS.Length == 3) { restCol_Width = 231; x_pos = 5; y_pos = 290; } else { restCol_Width = 802; x_pos = 5; y_pos = 290; } break;
                                            case 2: restCol_Width = 231; x_pos = 365; y_pos = 290; break;
                                        }
                                        //create table here
                                        cols = new double[chartTable.Columns.Count];
                                        rows = new double[chartTable.Rows.Count];
                                        for (int ind = 0; ind < cols.Length; ind++)
                                        {
                                            cols[ind] = ind == 0 ? 150 : restCol_Width / (cols.Length - 1);
                                        }
                                        for (int ind = 0; ind < rows.Length; ind++)
                                        {
                                            rows[ind] = 10.0;
                                        }
                                        var table = prnt.Slides[slideNo].Shapes.AddTable(x_pos, y_pos, cols, rows);
                                        table.Name = "table" + (j + 1);
                                        int row_counter = 0, col_counter = 0;
                                        foreach (IRow row in table.Rows)
                                        {
                                            col_counter = 0;
                                            foreach (ICell cell in row)
                                            {
                                                //Get text frame of each cell
                                                ITextFrame tf = cell.TextFrame;
                                                //Set font size of 10
                                                tf.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 10;
                                                tf.Paragraphs[0].ParagraphFormat.Bullet.Type = BulletType.None;
                                                tf.Text = Convert.ToString(chartTable.Rows[row_counter][col_counter]);
                                                tf.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                tf.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = (labelColorArray[row_counter, col_counter].IsEmpty == true ? Color.Black : labelColorArray[row_counter, col_counter]);
                                                col_counter++;
                                            }
                                            row_counter++;
                                        }
                                        //
                                        InsertedShapes[k++] = "table" + (j + 1);
                                    }
                                    #endregion Table
                                    else
                                    {
                                        #region If barChange remove/rename
                                        if (data[0].active_chart_type == "barchange")
                                        {
                                            //Remove and rename
                                            prnt.Slides[slideNo].Shapes.Remove(prnt.Slides[slideNo].Shapes.Where(x => x.Name == "ClusteredBar" + (j + 1)).FirstOrDefault());
                                            ((Aspose.Slides.Charts.IChart)prnt.Slides[slideNo].Shapes.Where(x => x.Name == "barchange" + (j + 1)).FirstOrDefault()).Name = "ClusteredBar" + (j + 1);
                                            //Update the InsertShapes
                                            InsertedShapes[k++] = "table" + (j + 1);
                                        }
                                        #endregion If barChange remove/rename
                                        #region other charts
                                        var dl = new Aq.Plugin.AsposeExport.Domain.DataLabel();
                                        if (OutputData.ChartType.Contains("Stack"))
                                        {
                                            //dl.LabelBackGroundColor = Color.White;
                                            dl.LabelBackGroundColor = Color.FromArgb(179, Color.White);
                                        }
                                        if (OutputData.ChartType == "trend" || OutputData.ChartType == "LineWithMarkers")
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
                                                //Assigning color for stat Val
                                                if (ss >= 30 && ss <= 99)
                                                {
                                                    item["ColorForLabels"] = "Gray";
                                                    item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                                    item["ColorForLabels"] = (item["ColorForLabels"].ToString() == "Black" ? "Gray" : item["ColorForLabels"]);
                                                }
                                                else
                                                {
                                                    item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                                }
                                                if (item[OutputData.XColumn].ToString() == data[0].customBase) { item["ColorForLabels"] = "Blue"; }
                                            }
                                        }
                                        /*For custom base and stat value //START*/
                                        seriesPointList[j] = new List<string>();
                                        seriesPointList[j] = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct().ToList();
                                        dataPointList[j] = new List<string>();
                                        dataPointList[j] = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                        color2dArray[j] = new Color2DArray();
                                        color2dArray[j].labelColors = new Color[seriesPointList[j].Count, dataPointList[j].Count];
                                        series_ind = 0;
                                        foreach (var sp in seriesPointList[j])
                                        {
                                            dp_index = 0;
                                            foreach (var dp in dataPointList[j])
                                            {
                                                //Check color and store in labelcolors
                                                var obj = OutputData.Data.AsEnumerable().Where(x => Convert.ToString(x[OutputData.SerisColumn]) == sp && Convert.ToString(x[OutputData.XColumn]) == dp).FirstOrDefault();
                                                color2dArray[j].labelColors[series_ind, dp_index] = obj == null ? Color.Black : Color.FromName((string)obj["ColorForLabels"]);
                                                dp_index++;
                                            }
                                            series_ind++;
                                        }
                                        /*For custom base and stat value //END*/
                                        if (OutputData.ChartType == "trend" || OutputData.ChartType == "LineWithMarkers")
                                        {
                                            int flag_SS = 1;
                                            if (slid.Module == "chartbeveragecompare") { flag_SS = data.FirstOrDefault(x => x.Name == "Beverage").Data.Count(); }
                                            if (slid.Module == "chartestablishmentcompare") { flag_SS = data.FirstOrDefault(x => x.Name == "Establishment").Data.Count(); }
                                            if (slid.Module == "chartbeveragedeepdive" || slid.Module == "chartestablishmentdeepdive")
                                            {
                                                flag_SS = data.FirstOrDefault(x => x.Name == "Measures").Data.Count();
                                                if (flag_SS <= 1)
                                                {
                                                    flag_SS = data.FirstOrDefault(x => x.Name == "Metric Comparisons").Data.Count();
                                                }
                                            }

                                            if (flag_SS > 1)
                                            {
                                                OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'(' +'NA' + ')'");
                                            }
                                            else { OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'"); }
                                        }
                                        else { OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'"); }
                                        chartNames.Add(getAsposeChartType(OutputData.ChartType).ToString() + (j + 1));
                                        charts.Add(new ChartDetail()
                                        {
                                            ElementID = getAsposeChartType(OutputData.ChartType).ToString() + (j + 1),//"Chart" + (k[j]),
                                            Data = OutputData.Data,
                                            XAxisColumnName = "XColumnWithSamplesize",
                                            YAxisColumnName = OutputData.YColumn,
                                            SeriesColumnName = OutputData.SerisColumn,
                                            Type = getAsposeChartType(OutputData.ChartType),
                                            ShowLabel = true,
                                            DataFormat = "#0.0%",
                                            DataLabelFontHeight = 8,
                                            LabelFormat = dl
                                        });
                                        InsertedShapes[k++] = getAsposeChartType(OutputData.ChartType).ToString() + (j + 1);
                                        #endregion other charts
                                        #region If Bar with Change then Plot table
                                        if (data[0].active_chart_type == "barchange")
                                        {
                                            Aspose.Slides.ITable tbl = ((Aspose.Slides.ITable)prnt.Slides[slideNo].Shapes.Where(x => x.Name == "table" + (j + 1)).FirstOrDefault());
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
                                            for (int iInd = 0; iInd < ser.Count; iInd++)
                                            {
                                                //Fill the first column
                                                tbl[0, 1 + iInd].TextFrame.Text = ser[iInd];
                                                for (int jInd = 0; jInd < xCol.Count; jInd++)
                                                {
                                                    if (iInd == 0) { tbl[1 + jInd, 0].TextFrame.Text = xCol[jInd]; }
                                                    //Fill the Change values
                                                    var tmp = OutputData.Data.AsEnumerable().Where(x => x.Field<string>(OutputData.SerisColumn) == ser[iInd] && x.Field<string>("XColumnWithSampleSize") == xCol[jInd]).FirstOrDefault();
                                                    tbl[1 + jInd, 1 + iInd].TextFrame.Text = (tmp["Change"] == DBNull.Value || tmp["Change"].ToString() == "") ? "NA" : (100 * Convert.ToDouble(tmp["Change"])).ToString("##0.0");
                                                    tbl[1 + jInd, 1 + iInd].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                    tbl[1 + jInd, 1 + iInd].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChange(tmp["SignificanceValue"] == DBNull.Value ? 0 : Convert.ToDouble(tmp["SignificanceValue"]), tmp["TotalSamplesize"] == DBNull.Value ? 0 : Convert.ToInt32(tmp["TotalSamplesize"]), (xValues[jInd] == (data[0].customBase == null ? "" : data[0].customBase)));
                                                }
                                            }
                                            double totalW = slideIDS.Length == 1 ? 933.2 : 453.75;
                                            foreach (var item in tbl.Columns)
                                            {
                                                item.Width = totalW / (xCol.Count + 1);
                                            }
                                            //Set First cell value
                                            tbl[0, 0].TextFrame.Text = "Change vs " + (data[0].statOption.ToLower() == "custom base" ? data[0].customBase.ToUpper() : data[0].statOption.ToUpper());
                                            tbl[0, 0].FillFormat.FillType = FillType.Solid;
                                            tbl[0, 0].FillFormat.SolidFillColor.Color = Color.FromArgb(128, 128, 128);
                                            tbl[0, 0].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            tbl[0, 0].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.White;
                                        }
                                        #endregion If Bar with Change then Plot table
                                    }
                                }
                            }
                        }
                    }
                    #region remove other shapes
                    if (pyramidflag != 1)
                    {
                        for (int m = shp.Count - 1; m >= 0; m--)
                        {
                            var flag = 0;
                            for (int n = 0; n < InsertedShapes.Length; n++)
                            {
                                if (shp[m].Name == InsertedShapes[n])
                                {
                                    flag = 1;
                                }
                            }
                            if (flag == 0)
                                prnt.Slides[slideNo].Shapes.Remove(shp[m]);
                        }
                    }
                    #endregion remove other shapes
                    _slideReplace.ReplaceShape(prnt.Slides[slideNo], new SlideDetail() { Elements = elements, Charts = charts, Tables = tables });
                    #region Adding Custom base and Stat Value
                    for (int j = 0; j < chartNames.Count; j++)
                    {
                        Aspose.Slides.Charts.IChart chart_to_change_dataLabelColors = (Aspose.Slides.Charts.IChart)prnt.Slides[slideNo].Shapes.Where(x => x.Name == chartNames.ElementAt(j)).FirstOrDefault();
                        if (chartNames.ElementAt(j).Contains("Bar"))
                        {
                            chart_to_change_dataLabelColors.Axes.VerticalAxis.IsPlotOrderReversed = true;
                        }
                        IChartDataWorkbook workbook = chart_to_change_dataLabelColors.ChartData.ChartDataWorkbook;
                        series_ind = 0; dp_index = 0;
                        if (ToSkip) { j = 1; }
                        foreach (var temp_series in chart_to_change_dataLabelColors.ChartData.Series)
                        {
                            dp_index = 0;
                            temp_series.Format.Fill.FillType = FillType.Solid;
                            temp_series.Format.Fill.SolidFillColor.Color = GlobalConstants.LegendColors[series_ind];
                            if (temp_series.Type == ChartType.LineWithMarkers)
                            {
                                temp_series.Format.Line.FillFormat.FillType = FillType.Solid;
                                temp_series.Format.Line.FillFormat.SolidFillColor.Color = GlobalConstants.LegendColors[series_ind];
                                temp_series.Format.Line.DashStyle = LineDashStyle.SystemDot;
                                temp_series.Format.Line.Width = 3;
                                temp_series.Marker.Format.Fill.FillType = FillType.Solid;
                                temp_series.Marker.Format.Fill.SolidFillColor.Color = GlobalConstants.LegendColors[series_ind];
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
                                temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.6, GlobalConstants.LegendColors[series_ind]);
                                temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)1.0, GlobalConstants.LegendColors[series_ind]);
                            }
                            foreach (var datapoints in temp_series.DataPoints)
                            {
                                datapoints.Label.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                                datapoints.Label.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = color2dArray[j] == null ? Color.Black : color2dArray[j].labelColors[series_ind, dp_index];
                                if (temp_series.Type == ChartType.LineWithMarkers)
                                {
                                    datapoints.Label.DataLabelFormat.Position = LegendDataLabelPosition.Top;
                                }
                                if (color2dArray[j] != null && color2dArray[j].labelColors[series_ind, dp_index] == Color.Transparent && temp_series.Type == ChartType.LineWithMarkers)
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
                        if (chart_to_change_dataLabelColors.Type == ChartType.LineWithMarkers || chart_to_change_dataLabelColors.Type == ChartType.ClusteredBar || chart_to_change_dataLabelColors.Type == ChartType.ClusteredColumn)
                        {
                            double maxTrendVal = (double)chart_to_change_dataLabelColors.ChartData.Series.Max(x => x.DataPoints.Max(y => y.Value.Data));
                            maxTrendVal = maxTrendVal * 100;
                            if (chart_to_change_dataLabelColors.Type == ChartType.ClusteredBar)
                                maxTrendVal = ((Math.Ceiling(maxTrendVal + 5) + (5 - Math.Ceiling(maxTrendVal % 10))) / 100);
                            else if( chart_to_change_dataLabelColors.Type == ChartType.ClusteredColumn)
                                maxTrendVal = ((Math.Ceiling(maxTrendVal + 7) + (7 - Math.Ceiling(maxTrendVal % 10))) / 100);
                            else
                                maxTrendVal = ((Math.Ceiling(maxTrendVal + 10) + (10 - Math.Ceiling(maxTrendVal % 10))) / 100);
                            if (maxTrendVal > 1)
                            {
                                maxTrendVal = 1;
                            }
                            if (chart_to_change_dataLabelColors.Type == ChartType.ClusteredBar)
                            {
                                chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMaxValue = false;
                                chart_to_change_dataLabelColors.Axes.HorizontalAxis.IsAutomaticMinValue = false;
                                chart_to_change_dataLabelColors.Axes.HorizontalAxis.MaxValue = maxTrendVal;
                                chart_to_change_dataLabelColors.Axes.HorizontalAxis.MinValue = 0;
                            }
                            else if (chart_to_change_dataLabelColors.Type == ChartType.ClusteredColumn)
                            {
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.IsAutomaticMaxValue = false;
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.IsAutomaticMinValue = false;
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.MaxValue = maxTrendVal;
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.MinValue = 0;
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.IsVisible = false;
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.IsNumberFormatLinkedToSource = false;
                                chart_to_change_dataLabelColors.Axes.VerticalAxis.NumberFormat = "##0%";
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
                    }
                    #endregion Adding Custom base and Stat Value
                    slideNo++;
                }
                prnt.Slides.RemoveAt(0);
                var destFile = Server.MapPath(("~/Temp/Report" + Session.SessionID + ".pptx"));
                Session["ChartSessionID"] = destFile;
                prnt.Save(Server.MapPath("~/Temp/Report" + Session.SessionID + ".pptx"), Aspose.Slides.Export.SaveFormat.Pptx);
            }
        }

        public int GetSlideIndex(int[] Type)
        {
            int k = 0;
            switch (Type.Length)
            {
                case 1:
                    k = 0;
                    break;
                case 2:
                    k = 1;
                    break;
                case 3:
                    k = 2;
                    break;
                case 4:
                    k = 3;
                    break;
            }
            return k;
        }

        public Models.Slide getSlide(int slideId, IEnumerable<Models.Slide> slides)
        {
            Models.Slide sl = null;
            foreach (var slide in slides)
            {
                if (slide.Id == slideId)
                    return slide;
            }
            return sl;
        }

        #region Download PowerPoint
        public FileResult DownloadReport(int ReportId)
        {
            PreparePowerPointReport(storyboard.GetReportSlides(ReportId));
            string repName = ((sbmodels.Report)storyboard.GetReportDetails(ReportId)).Name;
            return File(Server.MapPath("~/Temp/Report" + Session.SessionID + ".pptx"), "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn(repName) + ".pptx");
        }

        public FileResult DownloadSlides(string slides)
        {
            int[] slideIDS = Array.ConvertAll(slides.Split(','), int.Parse);
            Models.Slide slide = storyboard.GetSlides(slideIDS).FirstOrDefault();
            string repName = (storyboard.GetReportDetails(slide.ReportId)).Name;
            PreparePowerPointReport(storyboard.GetSlides(slideIDS));
            return File(Server.MapPath("~/Temp/Report" + Session.SessionID + ".pptx"), "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn(repName) + ".pptx");
        }
        public void HelpDocDownload(string path)
        {
            string filename = Server.MapPath(path);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(filename), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();
            System.Web.HttpContext.Current.Response.ClearHeaders();
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn("CustomDownload_HelpDocument") + ".pdf");
            System.Web.HttpContext.Current.Response.ContentType = "application/octet-stream";
            System.Web.HttpContext.Current.Response.AddHeader("Content-Length", new FileInfo(Convert.ToString(filename)).Length.ToString());
            System.Web.HttpContext.Current.Response.AddHeader("Cache-Control", "no-store");
            System.Web.HttpContext.Current.Response.BinaryWrite(btFile);
            System.Web.HttpContext.Current.ApplicationInstance.CompleteRequest();
            //System.Web.HttpContext.Current.Response.Clear();
            System.Web.HttpContext.Current.Response.Flush();
            System.Web.HttpContext.Current.Response.End();
        }
        private void PreparePowerPointReport(IEnumerable<Models.Slide> slides)
        {
            string UserId = Session[Constants.Session.ActiveUserId].ToString();
            string BaseColumn = string.Empty;
            string ColorCodeCol = string.Empty;
            string chartType = string.Empty;
            string isPIT = string.Empty;
            string[] BaseColorArray = new string[] { };
            int colorindex = 0;
            int defaultcolorindex = 0;
            bool UseGlobalColor = true;

            var filepath = Server.MapPath("~/Templates/ExportToPPTTemplateSavedReports.pptx");
            ISlideReplace _slideReplace = new SlideReplace();
            string chartBarOrCol = "ChartDataCol";
            int slideNo = 1, last_slide = slides.Count();
            int series_ind = 0, dp_index = 0;
            using (Presentation pres = new Presentation(filepath))
            {
                foreach (var slid in slides)
                {
                    if (slideNo >= 1)
                        pres.Slides.AddClone(pres.Slides[0]);
                    IList<ElementDetail> elements = new List<ElementDetail>();
                    IList<ChartDetail> charts = new List<ChartDetail>();
                    ICollection<TableDetail> tables = new List<TableDetail>();
                    var data = new JavaScriptSerializer().Deserialize<FilterPanelInfo[]>(slid.Filter);
                    string statTest = (data[0].statOption.ToUpper() == "CUSTOM BASE") ? (data[0].customBase == null ? "" : data[0].customBase) : (data[0].statOption);
                    var OutputData = new JavaScriptSerializer().Deserialize<StoryBoardSlideData>(slid.OutputData);
                    if (slid.FromTimeperiod.ToLower().Trim() == "total") { slid.FromTimeperiod = "Total"; }
                    if (slid.ToTimeperiod != null && slid.ToTimeperiod.ToLower().Trim() == "total") { slid.ToTimeperiod = "Total"; }
                    if (slid.TimePeriodType.ToLower().Trim() == "total") { slid.TimePeriodType = "Total"; }
                    var module = slid.Module;
                    var isTrend = data[0].isTrendTable;
                    if (data != null)
                    {
                        if (OutputData != null)
                        {
                            if (OutputData.Data == null)
                            {
                                //call the procedure and update the data.OutputData.Data data
                                OutputData.Data = (new ChartBO()).GetDataTable(data, slid.Module, "", slid.TimePeriodType, null, (data[0].statOption.ToLower() == "custom base" ? data[0].statOption : data[0].customBase), slid.ToTimeperiod, slid.FromTimeperiod, UserId);
                            }
                            var shapes = pres.Slides[slideNo].Shapes;
                            var chrt_contextBar = shapes[0];
                            var chrt_contextCol = shapes[0];
                            System.Data.DataTable tb = OutputData.Data;

                            /*------------------------------------------ Checking chart type condition -----------------------------------*/
                            BaseColumn = string.Empty;
                            ColorCodeCol = string.Empty;
                            chartType = data[0].active_chart_type;
                            isPIT = (data[0].isTrendTable == "false") ? "pit" : "trend";
                            BaseColorArray = new string[] { };
                            colorindex = 0;
                            defaultcolorindex = 0;
                            UseGlobalColor = true;

                            #region Set Column Type, Color Code
                            if (slid.Module == "chartestablishmentdeepdive" || slid.Module == "chartbeveragedeepdive")
                            {

                                if (isPIT == "pit") //PIT
                                {
                                    BaseColumn = "Col1";
                                    ColorCodeCol = "ColorCode1";
                                    if (chartType == "pyramidwithchange" || chartType == "pyramid")
                                    {
                                        BaseColumn = "Col4";
                                        ColorCodeCol = "ColorCode4";
                                    }
                                }
                                else
                                {
                                    BaseColumn = "Col4";
                                    ColorCodeCol = "ColorCode4";
                                }
                            }
                            else
                            {
                                if (isPIT == "pit") //PIT
                                {
                                    BaseColumn = "Col1";
                                    ColorCodeCol = "ColorCode1";
                                    if (chartType == "pyramidwithchange" || chartType == "pyramid")
                                    {
                                        BaseColumn = "Col2";
                                        ColorCodeCol = "ColorCode2";
                                    }
                                }
                                else
                                {
                                    BaseColumn = "Col2";
                                    ColorCodeCol = "ColorCode2";
                                }
                            }
                            #endregion
                            /*--------------------------------------------------------------------------------------------------------------*/

                            /*------------------------------- Getting changed color list from table ----------------------------------------*/
                            BaseColorArray = tb.AsEnumerable().Select((x, i) => new { colorcode = x.Field<string>(ColorCodeCol), col = x.Field<string>(BaseColumn) }).Distinct().Select(x => x.colorcode).ToArray();
                            int m = 0, n = 0;
                            while (m < BaseColorArray.Length)
                            {
                                if (BaseColorArray[m] == null || BaseColorArray[m] == "null" || BaseColorArray[m] == "")
                                {
                                    BaseColorArray[m] = GlobalConstants.StartColors[n++].ToString();
                                }
                                m++;
                            }
                            /*--------------------------------------------------------------------------------------------------------------*/

                            #region  Remove unnecessary shapes
                            if (data[0].active_chart_type == "barchange")
                            {
                                //Reset Height and Width of chart
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ChartDataBar").FirstOrDefault());
                                ((Aspose.Slides.Charts.IChart)pres.Slides[slideNo].Shapes.Where(x => x.Name == "ChartDataBar_change").FirstOrDefault()).Name = "ChartDataBar";
                            }
                            else
                            {
                                //Remove table
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "table").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ChartDataBar_change").FirstOrDefault());
                            }
                            #endregion

                            #region remove other charts
                            if (data[0].active_chart_type != "pyramid")
                            {
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart1").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart2").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart3").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart4").FirstOrDefault());
                            }
                            if (data[0].active_chart_type != "pyramidwithchange")
                            {
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart1_change").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart2_change").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart3_change").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart4_change").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "table1").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "table2").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "table3").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "table4").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ch1").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ch2").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ch3").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ch4").FirstOrDefault());
                            }
                            else
                            {
                                if (pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart1_change").FirstOrDefault() != null)
                                {
                                    ((Aspose.Slides.Charts.IChart)pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart1_change").FirstOrDefault()).Name = "chart1";
                                    ((Aspose.Slides.Charts.IChart)pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart2_change").FirstOrDefault()).Name = "chart2";
                                    ((Aspose.Slides.Charts.IChart)pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart3_change").FirstOrDefault()).Name = "chart3";
                                    ((Aspose.Slides.Charts.IChart)pres.Slides[slideNo].Shapes.Where(x => x.Name == "chart4_change").FirstOrDefault()).Name = "chart4";
                                }
                            }
                            #endregion remove other charts

                            #region adding time_period,stat,Comment,Chart_Title
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
                                    case "time_period": ((IAutoShape)item).TextFrame.Text = "Time Period : " + (data[0].isTrendTable == "true" ? slid.FromTimeperiod + "to" + slid.ToTimeperiod : slid.FromTimeperiod); break;
                                    case "stat": ((IAutoShape)item).TextFrame.Text = "Stat tested at 95% CL against - " + statTest.ToUpper(); break;
                                    case "Comment": ((IAutoShape)item).TextFrame.Text = slid.Comment == null ? "" : slid.Comment; break;
                                    case "chart_title":
                                        ((IAutoShape)item).TextFrame.Paragraphs.Clear();
                                        ((IAutoShape)item).TextFrame.Paragraphs.Add(new Paragraph());
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Clear();
                                        if (slid.Module == "chartbeveragedeepdive" || slid.Module == "chartestablishmentdeepdive")
                                        {
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = tb.Rows[0]["Col2"].ToString() + "\n" });
                                        }
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = tb.Rows[0]["Col3"].ToString() });
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions.Add(new Portion() { Text = "\n" + (data[0].DemoAndTopFilters == null ? "" : data[0].DemoAndTopFilters) });
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontBold = NullableBool.True;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FontBold = NullableBool.True;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 12;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.FontHeight = 9;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].ParagraphFormat.Alignment = TextAlignment.Center;
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[0].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[1].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        if (slid.Module == "chartbeveragedeepdive" || slid.Module == "chartestablishmentdeepdive")
                                        {
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FontBold = NullableBool.True;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.FontHeight = 9;
                                            ((IAutoShape)item).TextFrame.Paragraphs[0].Portions[2].PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
                                        }
                                        //((IAutoShape)item).TextFrame.Text = tb.Rows[0]["Col3"].ToString() + "\n" + (data[0].DemoAndTopFilters == null ? "" : data[0].DemoAndTopFilters); 
                                        break;
                                }
                            }
                            #endregion


                            if (data[0].active_chart_type == "pyramid" || data[0].active_chart_type == "pyramidwithchange")
                            {
                                #region pyramid

                                //Remove the other charts
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ChartDataCol").FirstOrDefault());
                                pres.Slides[slideNo].Shapes.Remove(pres.Slides[slideNo].Shapes.Where(x => x.Name == "ChartDataBar").FirstOrDefault());
                                //Update the datatable
                                int ss = 0;
                                bool isChange = data[0].active_chart_type == "pyramidwithchange";
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
                                            item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                            item["ColorForLabels"] = item["ColorForLabels"].ToString() == "Black" ? "Gray" : item["ColorForLabels"];
                                        }
                                        else
                                        {
                                            item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                        }
                                        if (item[OutputData.XColumn].ToString() == data[0].customBase) { item["ColorForLabels"] = "Blue"; }
                                    }
                                }
                                OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'");
                                List<string> allSeries = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                int slideno = slideNo, indx = 1;
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
                                    (new ChartBO(BaseColorArray)).plotIndividualPyramid(allSeries[i - 1], OutputData, pres.Slides[slideno], indx, i - 1, isChange);
                                    if (i % 4 == 0)
                                    {
                                        indx = 1;
                                        if (i + 1 <= allSeries.Count)
                                        {
                                            //Add slides if required
                                            pres.Slides.AddClone(pres.Slides[slideNo]); slideno++; slideNo++;
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
                                #endregion pyramid
                            }
                            else
                            {
                                #region other charts
                                if (OutputData.ChartType.Contains("bar") || OutputData.ChartType.Contains("Bar"))
                                {
                                    chartBarOrCol = "ChartDataBar";
                                    pres.Slides[slideNo].Shapes.Remove(chrt_contextCol);
                                }
                                else
                                {
                                    chartBarOrCol = "ChartDataCol";
                                    pres.Slides[slideNo].Shapes.Remove(chrt_contextBar);
                                }
                                elements.Add(new ElementDetail()
                                {
                                    ElementID = "Filter",
                                    Paragraphs = new List<ParagraphDetail>() { new ParagraphDetail(){
                                ParagraphID =0,
                                Text = ""//Convert.ToString(slid.Comment)
                                }
                              }
                                });
                                if (OutputData.ChartType == "table")
                                {
                                    //Aspose.Slides.ITable table = (Aspose.Slides.ITable)pres.Slides[0].Shapes.Where(x => x.Name == "TableData").FirstOrDefault();
                                    double[] cols = { 3,3};
                                    double[] rows = { 5,5};
                                    
                                    var table = pres.Slides[slideNo].Shapes.AddTable(15, 90, cols, rows);
                                    var MetricList = OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Col1" });
                                    var EstbList = OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Col2" });
                                    var timeperiodList = OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Timeperiod" });
                                    var MetricList1 = OutputData.Data.DataSet.Tables[0].DefaultView.ToTable(true, new String[] { "Col4" });
                                    //header section
                                    //((IAutoShape)pres.Slides[0].Shapes.FirstOrDefault(x => x.Name.Trim() == "chart_title")).TextFrame.Paragraphs[0].Text = " Traffic";
                                    //((IAutoShape)pres.Slides[0].Shapes.FirstOrDefault(x => x.Name.Trim() == "chart_title")).TextFrame.Paragraphs[0].Text = " Traffic";
                                    //((IAutoShape)pres.Slides[0].Shapes.FirstOrDefault(x => x.Name.Trim() == "chart_title")).TextFrame.Paragraphs[0].Text = " Traffic";
                                    var IscustomBase = false;
                                    var isPITtrend = isTrend=="true" ? "trend" : "pit"; ;
                                    var rowList = timeperiodList;
                                    var colList = EstbList;
                                    var isSaisfactionTo2Box = false;
                                    if (OutputData.Data.DataSet.Tables[0].Rows[0][2].ToString() == "Satisfaction Drivers - Top 2 box")
                                        isSaisfactionTo2Box = true;
                                    if (isPITtrend == "trend")
                                    {
                                        if (module == "chartestablishmentdeepdive" || module == "chartbeveragedeepdive")
                                        {
                                            rowList = timeperiodList;
                                            colList = MetricList1;
                                        }
                                        else
                                        {
                                            rowList = timeperiodList;
                                            colList = EstbList;
                                        }
                                    }
                                    else if (isPITtrend == "pit")
                                    {
                                        if (module == "chartestablishmentdeepdive" || module == "chartbeveragedeepdive")
                                        {
                                            rowList = MetricList1;
                                            colList = MetricList;
                                        }
                                        else
                                        {
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
                                    int index = -1;

                                    if (isPITtrend == "pit")
                                    {
                                        for (var _rowIndex = 1; _rowIndex < table.Rows.Count; _rowIndex++)
                                        {
                                            for (var _colIndex = 1; _colIndex < table.Columns.Count; _colIndex++)
                                            {

                                                index += 1;
                                                table[_colIndex, _rowIndex].TextFrame.Text = OutputData.Data.DataSet.Tables[0].Rows[index]["MetricValue"] == DBNull.Value ? "" : String.Format("{0:P1}", OutputData.Data.DataSet.Tables[0].Rows[index]["MetricValue"]);
                                                table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                IscustomBase = ((OutputData.Data.DataSet.Tables[0].Rows[index][1]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim() == statTest.ToLower().Trim()) ? true : false;
                                                table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChangeObject(OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"] == DBNull.Value ? null : OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"], OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"] == DBNull.Value ? null : OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"], IscustomBase);
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
                                                table[_colIndex, _rowIndex].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChangeObject(OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"] == DBNull.Value ? null : OutputData.Data.DataSet.Tables[0].Rows[index]["SignificanceValue"], OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"] == DBNull.Value ? null : OutputData.Data.DataSet.Tables[0].Rows[index]["totalsamplesize"], IscustomBase);
                                            }
                                        }

                                    }
                                    //insert sample size rows
                                    if (OutputData.Data.DataSet.Tables[0].Rows[0][2].ToString() == "Satisfaction Drivers - Top 2 box" && isPITtrend == "pit")//sample size row for each metrics
                                    {
                                        index = -1;
                                        for (var i = 1; i < (colList.Rows.Count) * 2 + 1; i += 2)
                                        {
                                            table.Rows.InsertClone(i, table.Rows[0], false);
                                            table[0, i].TextFrame.Text = "Sample Size";

                                            for (int _col = 0; _col < rowList.Rows.Count; _col++)
                                            {
                                                index += 1;
                                                if (index < OutputData.Data.DataSet.Tables[0].Rows.Count)
                                                {
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
                                        }

                                        for (var _colIndex = 1; _colIndex < table.Columns.Count; _colIndex++)
                                        {
                                            for (var _rowIndex = 1; _rowIndex < table.Rows.Count; _rowIndex += 2)
                                            {
                                                index += 1;
                                                table[_colIndex, _rowIndex].TextFrame.Text = sampleSizeTextValue(OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]);
                                            }
                                        }
                                    }
                                    else//sample size row in the beginning
                                    {
                                        table.Rows.InsertClone(0, table.Rows[0], false);
                                        table[0, 1].TextFrame.Text = "Sample Size";
                                        for (int _col = 0; _col < rowList.Rows.Count; _col++)
                                        {
                                            table[_col + 1, 1].TextFrame.Text = sampleSizeTextValue(OutputData.Data.DataSet.Tables[0].Rows[_col]["TotalSampleSize"]);
                                            //IscustomBase = ((OutputData.Data.DataSet.Tables[0].Rows[_col][1]).ToString().ToLower().Trim() == statTest.ToLower().Trim() || OutputData.Data.DataSet.Tables[0].Rows[index][3].ToString().ToLower().Trim() == statTest.ToLower().Trim()) ? true : false;
                                            //table[_col + 1, 1].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            //table[_col + 1, 1].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = IscustomBase ? Color.Blue : Color.Black;
                                        }
                                    }

                                    #region color for table
                                    int k = 0;
                                    for (var tblrow = 0; tblrow < table.Rows.Count; tblrow++)
                                    {
                                        for (var tblcol = 0; tblcol < table.Columns.Count; tblcol++)
                                        {
                                            table[tblcol, tblrow].FillFormat.FillType = FillType.Solid;
                                            if (tblrow == 0)
                                            {
                                                table[tblcol, tblrow].FillFormat.SolidFillColor.Color = Color.Black;
                                                table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.White;
                                            }
                                            else
                                            {
                                                table[tblcol, tblrow].FillFormat.SolidFillColor.Color = Color.White;
                                            }
                                            //if (isSaisfactionTo2Box && tblrow % 2 == 1)
                                            //{
                                            //    table[tblcol, tblrow].FillFormat.SolidFillColor.Color = Color.FromArgb(203, 203, 203);
                                            //    table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                            //    table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                                            //}
                                            //else
                                            //    table[tblcol, 1].FillFormat.SolidFillColor.Color = Color.FromArgb(203, 203, 203);
                                            if (table[0, tblrow].TextFrame.Text=="Sample Size"){
                                                table[tblcol, tblrow].FillFormat.SolidFillColor.Color = Color.FromArgb(203, 203, 203);
                                                table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                                            }

                                            table[tblcol, tblrow].BorderBottom.Style = LineStyle.ThinThin;
                                            table[tblcol, tblrow].BorderBottom.FillFormat.FillType = FillType.Solid;
                                            table[tblcol, tblrow].BorderBottom.FillFormat.SolidFillColor.Color = Color.FromArgb(50, 50, 50);
                                            table[tblcol, tblrow].BorderTop.Style = LineStyle.ThinThin;
                                            table[tblcol, tblrow].BorderTop.FillFormat.FillType = FillType.Solid;
                                            table[tblcol, tblrow].BorderTop.FillFormat.SolidFillColor.Color = Color.FromArgb(50, 50, 50);
                                            table[tblcol, tblrow].BorderLeft.Style = LineStyle.ThinThin;
                                            table[tblcol, tblrow].BorderLeft.FillFormat.FillType = FillType.Solid;
                                            table[tblcol, tblrow].BorderLeft.FillFormat.SolidFillColor.Color = Color.FromArgb(50, 50, 50);
                                            table[tblcol, tblrow].BorderRight.Style = LineStyle.ThinThin;
                                            table[tblcol, tblrow].BorderRight.FillFormat.FillType = FillType.Solid;
                                            table[tblcol, tblrow].BorderRight.FillFormat.SolidFillColor.Color = Color.FromArgb(50, 50, 50);

                                            table[tblcol, tblrow].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 11;

                                        }
                                    }
                                    pres.Slides[slideNo].Shapes.Remove(chrt_contextBar);
                                    pres.Slides[slideNo].Shapes.Remove(chrt_contextCol);
                                    #endregion

                                    ////Modifying table data
                                    //System.Data.DataTable chartTable = new System.Data.DataTable();
                                    //String col3Name = OutputData.Data.Rows[0][2].ToString();
                                    //bool isNewTableStructure = false;
                                    //bool isSaisfactionTo2Box = false;
                                    //IEnumerable<string> xAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct();
                                    //IEnumerable<string> yAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct();
                                    //if (OutputData.SerisColumn == "TimePeriod")
                                    //{
                                    //    col3Name = "";
                                    //    switch (slid.Module)
                                    //    {
                                    //        case "chartestablishmentcompare": col3Name = "Establishment"; if (data.Where(x => x.Name == "Establishment").FirstOrDefault().Data.Count() > 1) { isNewTableStructure = true; } break;
                                    //        case "chartbeveragecompare": col3Name = "Beverage"; if (data.Where(x => x.Name == "Beverage").FirstOrDefault().Data.Count() > 1) { isNewTableStructure = true; } break;
                                    //        case "chartestablishmentdeepdive":
                                    //        case "chartbeveragedeepdive":
                                    //            col3Name = data[1].DemoAndTopFilters;
                                    //            //If measures are multiple or Metric Comparison then yAxis should contain those
                                    //            if (data.Where(x => x.Name == "Measures").FirstOrDefault().Data.Count() > 1)
                                    //            {
                                    //                isNewTableStructure = true;
                                    //                OutputData.XColumn = "Col1";
                                    //            }
                                    //            if (data.Where(x => x.Name == "Metric Comparisons").FirstOrDefault().Data.Count() > 1)
                                    //            { isNewTableStructure = true; }
                                    //            break;
                                    //    }
                                    //    xAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct();
                                    //    yAxis = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct();
                                    //}
                                    //if (OutputData.Data.DataSet.Tables[0].Rows[0][2].ToString() == "Satisfaction Drivers - Top 2 box")
                                    //    isSaisfactionTo2Box = true;
                                    ////preparing columns
                                    //chartTable.Columns.Add(OutputData.Data.Rows[0][2].ToString());
                                    //foreach (var item in xAxis)
                                    //{
                                    //    chartTable.Columns.Add(item);
                                    //}
                                    ////Adding first row
                                    //chartTable.Rows.Add();
                                    //chartTable.Rows.Add();
                                    //var freq = data.Where(x => x.Name == "FREQUENCY").FirstOrDefault();
                                    //chartTable.Rows[0][0] = freq == null ? "" : freq.Data[0].Text;
                                    //Color[,] labelColorArray = isNewTableStructure == true ? new Color[chartTable.Rows.Count + 2 * yAxis.Count() + 1, chartTable.Columns.Count + 1] : new Color[chartTable.Rows.Count + yAxis.Count() + 1, chartTable.Columns.Count + 1];
                                    //int tbl_fact = 1, tbl_mul_fact = 0;
                                    //if (isNewTableStructure) { tbl_fact = 2; tbl_mul_fact = 2; chartTable.Rows.Add(); chartTable.Rows[2][0] = col3Name; };

                                    ////preparing data
                                    //for (int xCol = 0; xCol < xAxis.Count(); xCol++)
                                    //{
                                    //    chartTable.Rows[0][xCol + 1] = xAxis.ElementAt(xCol);
                                    //    double CalculatedStatVal = 0; int? rowSampleSize = 0; string out_put = "";
                                    //    if (!isNewTableStructure)
                                    //    {
                                    //        out_put = Convert.ToString((from DataRow dr in OutputData.Data.Rows
                                    //                                    where (string)dr[OutputData.SerisColumn == "TimePeriod" ? "Timeperiod" : OutputData.XColumn] == xAxis.ElementAt(xCol) && Convert.ToString(dr["TotalSamplesize"]) != ""
                                    //                                    select dr["TotalSamplesize"]).FirstOrDefault());

                                    //        rowSampleSize = out_put == "" ? null : (int?)(Convert.ToUInt32(out_put));
                                    //        chartTable.Rows[1][xCol + 1] = rowSampleSize == null || rowSampleSize < 30 ? (rowSampleSize == null ? "NA" : rowSampleSize.ToString() + "(Low sample size)") : String.Format("{0:n0}", rowSampleSize);
                                    //        if (rowSampleSize != null && rowSampleSize <= 99 && rowSampleSize >= 30)
                                    //        {
                                    //            chartTable.Rows[1][xCol + 1] = rowSampleSize + "(Use Directionally)";
                                    //            //labelColorArray[xCol + 1, 1] = Color.Gray;
                                    //        }
                                    //    }
                                    //    else
                                    //    {
                                    //        chartTable.Rows[1][xCol + 1] = "";
                                    //        chartTable.Rows[2][xCol + 1] = "";
                                    //    }
                                    //    for (int yCol = 0; yCol < yAxis.Count(); yCol++)
                                    //    {
                                    //        if (xCol == 0)
                                    //        {
                                    //            chartTable.Rows.Add();
                                    //            //If new table structure then Add one samplesize row
                                    //            if (isNewTableStructure == true)
                                    //            {
                                    //                chartTable.Rows.Add();
                                    //                chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 1][0] = "Sample Size";
                                    //                chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][0] = yAxis.ElementAt(yCol);
                                    //            }
                                    //            else
                                    //                chartTable.Rows[yCol + tbl_mul_fact + 2][0] = yAxis.ElementAt(yCol);
                                    //        }
                                    //        //If New structure then Update the rowSamplesize
                                    //        if (isNewTableStructure)
                                    //        {
                                    //            out_put = Convert.ToString((from DataRow dr in OutputData.Data.Rows
                                    //                                        where (string)dr[OutputData.SerisColumn == "TimePeriod" ? "Timeperiod" : OutputData.XColumn] == xAxis.ElementAt(xCol) && Convert.ToString(dr[OutputData.XColumn]) == yAxis.ElementAt(yCol) && Convert.ToString(dr["TotalSamplesize"]) != ""
                                    //                                        select dr["TotalSamplesize"]).FirstOrDefault());
                                    //            rowSampleSize = out_put == "" ? null : (int?)(Convert.ToUInt32(out_put));
                                    //            //Add sample size row for each Metric Value
                                    //            chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 1][xCol + 1] = rowSampleSize == null || rowSampleSize < 30 ? (rowSampleSize == null ? "NA" : rowSampleSize.ToString() + "(Low sample size)") : rowSampleSize.ToString();
                                    //            if (rowSampleSize != null && rowSampleSize <= 99 && rowSampleSize >= 30)
                                    //            {
                                    //                chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 1][xCol + 1] = rowSampleSize + "(Use Directionally)";
                                    //            }
                                    //            //Add color to these rows as gray
                                    //            labelColorArray[yCol * tbl_fact + tbl_mul_fact + 1, xCol + 1] = Color.Gray; labelColorArray[yCol * tbl_fact + tbl_mul_fact + 1, 0] = Color.Gray;
                                    //        }

                                    //        if (rowSampleSize == null)
                                    //        {
                                    //            chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = "NA";
                                    //        }
                                    //        else
                                    //        {
                                    //            if (rowSampleSize < 30)
                                    //            {
                                    //                chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = "";
                                    //            }
                                    //            else
                                    //            {
                                    //                if (OutputData.SerisColumn == "TimePeriod")
                                    //                {
                                    //                    chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = (from DataRow dr in OutputData.Data.Rows
                                    //                                                                                     where (string)dr[OutputData.SerisColumn] == xAxis.ElementAt(xCol) && (string)dr[OutputData.XColumn] == yAxis.ElementAt(yCol)
                                    //                                                                                     select dr["MetricValue"]).FirstOrDefault();
                                    //                    double.TryParse((from DataRow dr in OutputData.Data.Rows
                                    //                                     where (string)dr[OutputData.SerisColumn] == xAxis.ElementAt(xCol) && (string)dr[OutputData.XColumn] == yAxis.ElementAt(yCol)
                                    //                                     select dr["SignificanceValue"]).FirstOrDefault().ToString(), out CalculatedStatVal);
                                    //                }
                                    //                else
                                    //                {
                                    //                    chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = (from DataRow dr in OutputData.Data.Rows
                                    //                                                                                     where (string)dr[OutputData.SerisColumn] == yAxis.ElementAt(yCol) && (string)dr[OutputData.XColumn] == xAxis.ElementAt(xCol)
                                    //                                                                                     select dr["MetricValue"]).FirstOrDefault();
                                    //                    double.TryParse((from DataRow dr in OutputData.Data.Rows
                                    //                                     where (string)dr[OutputData.SerisColumn] == yAxis.ElementAt(yCol) && (string)dr[OutputData.XColumn] == xAxis.ElementAt(xCol)
                                    //                                     select dr["SignificanceValue"]).FirstOrDefault().ToString(), out CalculatedStatVal);
                                    //                }
                                    //                chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] = (chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1] == DBNull.Value) ? "0.0%" : Convert.ToDouble(chartTable.Rows[yCol * tbl_fact + tbl_mul_fact + 2][xCol + 1]).ToString("##0.0%");
                                    //            }
                                    //            //Assign color for Stat Val
                                    //            if (rowSampleSize <= 99 && rowSampleSize >= 30) { labelColorArray[yCol * tbl_fact + tbl_mul_fact + 2, xCol + 1] = Color.Gray; }
                                    //            labelColorArray[yCol * tbl_fact + tbl_mul_fact + 2, xCol + 1] = (new ChartBO()).getFontColorBasedOnStatValue(CalculatedStatVal);
                                    //            if (xAxis.ElementAt(xCol) == data[0].customBase) { labelColorArray[yCol * tbl_fact + tbl_mul_fact + 2, xCol + 1] = Color.Blue; }
                                    //        }
                                    //    }
                                    //}
                                    //chartTable.Rows[1][0] = isNewTableStructure ? "" : "Sample Size";

                                    //#region satisfaction drivers top 2 box
                                    //if (!isNewTableStructure && isSaisfactionTo2Box)
                                    //{
                                    //    chartTable.Rows[1].Delete();
                                    //    var rowCount = chartTable.Rows.Count * 2;
                                    //    int index = -1;
                                    //    for (int row = 1; row < rowCount - 1; row += 2)
                                    //    {
                                    //        chartTable.Rows.InsertAt(chartTable.NewRow(), row);
                                    //        chartTable.Rows[row][0] = "Sample Size";
                                    //        for (int col = 1; col < chartTable.Columns.Count; col++)
                                    //        {
                                    //            index += 1;
                                    //            if (index < OutputData.Data.DataSet.Tables[0].Rows.Count)
                                    //                chartTable.Rows[row][col] = sampleSizeTextValue(OutputData.Data.DataSet.Tables[0].Rows[index]["TotalSampleSize"]);
                                    //        }
                                    //    }
                                    //}
                                    //#endregion
                                    ////add extra column to outputdata table
                                    //OutputData.Data.Columns.Add("SignificanceColor");
                                    //for (var row = 0; row < OutputData.Data.Rows.Count; row++)
                                    //{
                                    //    OutputData.Data.Rows[row]["SignificanceColor"] = Convert.ToString(getColorForChangeObj(OutputData.Data.Rows[row]["TotalSampleSize"], OutputData.Data.Rows[row]["SignificanceValue"], false));
                                    //}

                                    ////create table here
                                    //double[] cols = new double[chartTable.Columns.Count];
                                    //double[] rows = new double[chartTable.Rows.Count];
                                    //for (int i = 0; i < cols.Length; i++)
                                    //{
                                    //    cols[i] = i == 0 ? 200 : 750 / (cols.Length - 1);
                                    //}
                                    //for (int i = 0; i < rows.Length; i++)
                                    //{
                                    //    rows[i] = 10.0;
                                    //}
                                    //var table = pres.Slides[slideNo].Shapes.AddTable(5, 90, cols, rows);
                                    //table.Name = "TableData";
                                    //int xInd = 0, yInd = 0;
                                    //foreach (IRow row in table.Rows)
                                    //{
                                    //    yInd = 0;
                                    //    foreach (ICell cell in row)
                                    //    {
                                    //        //Get text frame of each cell
                                    //        ITextFrame tf = cell.TextFrame;
                                    //        //Set font size of 10
                                    //        tf.Paragraphs[0].Portions[0].PortionFormat.FontHeight = 10;
                                    //        tf.Paragraphs[0].ParagraphFormat.Bullet.Type = BulletType.None;
                                    //        tf.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                    //        var _xInd = isSaisfactionTo2Box ? (xInd / 2) : xInd;
                                    //        tf.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = (labelColorArray[_xInd, yInd].IsEmpty == true ? Color.Black : labelColorArray[_xInd, yInd]);
                                    //        yInd++;
                                    //    }
                                    //    xInd++;
                                    //}
                                    //tables.Add(new TableDetail()
                                    //{
                                    //    ElementID = "TableData",
                                    //    Data = chartTable,
                                    //    IsReplace = true,
                                    //    ConvertNullToZero = true,
                                    //    SkipDataTableHeaders = true
                                    //});

                                    //pres.Slides[slideNo].Shapes.Remove(chrt_contextBar);
                                    //pres.Slides[slideNo].Shapes.Remove(chrt_contextCol);
                                    //_slideReplace.ReplaceShape(pres.Slides[slideNo], new SlideDetail() { Elements = elements, Tables = tables });
                                }//end table
                                else
                                {
                                    var labelformat = new Aq.Plugin.AsposeExport.Domain.DataLabel();
                                    if (OutputData.ChartType.Contains("Stack"))
                                    {
                                        //labelformat.LabelBackGroundColor = Color.White;
                                        labelformat.LabelBackGroundColor = Color.FromArgb(179, Color.White);
                                    }
                                    if (OutputData.ChartType == "trend" || OutputData.ChartType == "LineWithMarkers")
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
                                        /*Code to calculate stat value*/
                                        //start

                                        //end
                                        /*Code to calculate stat value*/
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
                                                item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                                item["ColorForLabels"] = item["ColorForLabels"].ToString() == "Black" ? "Gray" : item["ColorForLabels"];
                                            }
                                            else
                                            {
                                                item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value ? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                            }
                                            if (item[OutputData.XColumn].ToString() == data[0].customBase) { item["ColorForLabels"] = "Blue"; }
                                        }
                                        ////Asign color for stat val
                                        //if (ss >= 30 && ss <= 99) { item["ColorForLabels"] = "Gray"; }
                                        //item["ColorForLabels"] = ((new ChartBO()).getFontColorBasedOnStatValue(item["SignificanceValue"] == DBNull.Value? 0.0 : Convert.ToDouble(item["SignificanceValue"]))).Name;
                                    }
                                    /*For custom base and stat value //START*/
                                    List<string> seriesPointList = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.SerisColumn)).Distinct().ToList();
                                    List<string> dataPointList = OutputData.Data.AsEnumerable().Select(x => x.Field<string>(OutputData.XColumn)).Distinct().ToList();
                                    Color[,] labelColors = new Color[seriesPointList.Count, dataPointList.Count];
                                    series_ind = 0;
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
                                    if (OutputData.ChartType == "trend" || OutputData.ChartType == "LineWithMarkers")
                                    {
                                        int flag_SS = 1;
                                        if (slid.Module == "chartbeveragecompare") { flag_SS = data.FirstOrDefault(x => x.Name == "Beverage").Data.Count(); }
                                        if (slid.Module == "chartestablishmentcompare") { flag_SS = data.FirstOrDefault(x => x.Name == "Establishment").Data.Count(); }
                                        if (slid.Module == "chartbeveragedeepdive" || slid.Module == "chartestablishmentdeepdive")
                                        {
                                            flag_SS = data.FirstOrDefault(x => x.Name == "Measures").Data.Count();
                                            if (flag_SS <= 1)
                                            {
                                                flag_SS = data.FirstOrDefault(x => x.Name == "Metric Comparisons").Data.Count();
                                            }
                                        }
                                        if (flag_SS > 1)
                                        {
                                            OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'(' +'NA' + ')'");
                                        }
                                        else { OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'"); }
                                    }
                                    else { OutputData.Data.Columns.Add("XColumnWithSamplesize", typeof(string), OutputData.XColumn + "+' '+'('+TotalSamplesize+')'"); }

                                    charts.Add(new ChartDetail()
                                    {
                                        //ChartTitle = chartTitle,
                                        ElementID = chartBarOrCol,
                                        Data = OutputData.Data,
                                        XAxisColumnName = "XColumnWithSamplesize",//OutputData.XColumn,
                                        YAxisColumnName = OutputData.YColumn,
                                        SeriesColumnName = OutputData.SerisColumn,
                                        Type = getAsposeChartType(OutputData.ChartType),
                                        DataFormat = "###,###.0%",
                                        LabelFormat = labelformat,
                                        ShowLabel = true,
                                        DataLabelFontHeight = 8
                                    });
                                    _slideReplace.ReplaceShape(pres.Slides[slideNo], new SlideDetail() { Elements = elements, Charts = charts });
                                    #region If Bar with Change then Plot table
                                    if (data[0].active_chart_type == "barchange")
                                    {
                                        Aspose.Slides.ITable tbl = ((Aspose.Slides.ITable)pres.Slides[slideNo].Shapes.Where(x => x.Name == "table").FirstOrDefault());
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
                                                tbl[1 + j, 1 + i].TextFrame.Text = (tmp["Change"] == DBNull.Value || tmp["Change"].ToString() == "") ? "NA" : (100 * Convert.ToDouble(tmp["Change"])).ToString("##0.0");
                                                tbl[1 + j, 1 + i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                                tbl[1 + j, 1 + i].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorForChange(tmp["SignificanceValue"] == DBNull.Value ? 0 : Convert.ToDouble(tmp["SignificanceValue"]), tmp["TotalSamplesize"] == DBNull.Value ? 0 : Convert.ToInt32(tmp["TotalSamplesize"]), (xValues[j] == (data[0].customBase == null ? "" : data[0].customBase)));
                                            }
                                        }
                                        foreach (var item in tbl.Columns)
                                        {
                                            item.Width = 933.2 / (xCol.Count + 1);
                                        }
                                        //Set First cell value
                                        tbl[0, 0].TextFrame.Text = "Change vs " + (data[0].statOption.ToLower() == "custom base" ? data[0].customBase.ToUpper() : data[0].statOption.ToUpper());
                                        tbl[0, 0].FillFormat.FillType = FillType.Solid;
                                        tbl[0, 0].FillFormat.SolidFillColor.Color = Color.FromArgb(128, 128, 128);
                                        tbl[0, 0].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                        tbl[0, 0].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = Color.White;
                                    }
                                    #endregion If Bar with Change then Plot table
                                    #region Adding Custom base and Stat Value
                                    Aspose.Slides.Charts.IChart chart_to_change_dataLabelColors = (Aspose.Slides.Charts.IChart)pres.Slides[slideNo].Shapes.Where(x => x.Name == chartBarOrCol).FirstOrDefault();
                                    if (chartBarOrCol.Contains("Bar"))
                                    {
                                        chart_to_change_dataLabelColors.Axes.VerticalAxis.IsPlotOrderReversed = true;
                                    }
                                    IChartDataWorkbook workbook = chart_to_change_dataLabelColors.ChartData.ChartDataWorkbook;
                                    series_ind = 0; dp_index = 0;
                                    foreach (var temp_series in chart_to_change_dataLabelColors.ChartData.Series)
                                    {
                                        //UseGlobalColor = (series_ind >= BaseColorArray.Length || (BaseColorArray[colorindex] == null || BaseColorArray[colorindex] == "null" || BaseColorArray[colorindex] == ""));
                                        dp_index = 0;
                                        temp_series.Format.Fill.FillType = FillType.Solid;
                                        temp_series.Format.Fill.SolidFillColor.Color = (series_ind >= BaseColorArray.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(BaseColorArray[series_ind]);
                                        if (temp_series.Type == ChartType.LineWithMarkers)
                                        {
                                            temp_series.Format.Line.FillFormat.FillType = FillType.Solid;
                                            temp_series.Format.Line.FillFormat.SolidFillColor.Color = (series_ind >= BaseColorArray.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(BaseColorArray[series_ind]);
                                            temp_series.Format.Line.DashStyle = LineDashStyle.SystemDot;
                                            temp_series.Format.Line.Width = 3;
                                            temp_series.Marker.Format.Fill.FillType = FillType.Solid;
                                            temp_series.Marker.Format.Fill.SolidFillColor.Color = (series_ind >= BaseColorArray.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(BaseColorArray[series_ind]);
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
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)0.6, (series_ind >= BaseColorArray.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(BaseColorArray[series_ind]));
                                            temp_series.Marker.Format.Line.FillFormat.GradientFormat.GradientStops.Add((float)1.0, (series_ind >= BaseColorArray.Length) ? GlobalConstants.LegendColors[series_ind] : ColorTranslator.FromHtml(BaseColorArray[series_ind]));
                                        }
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

                                        //if (UseGlobalColor)
                                        //    defaultcolorindex++;

                                        //colorindex++;
                                    }
                                    /*Start If trend Chart then make the Y axis dynamic according to the max value */
                                    if (data[0].isTrendTable == "true"  || data[0].active_chart_type == "barchange")
                                    {
                                        double maxTrendVal = Convert.ToDouble(OutputData.Data.Compute("max([" + OutputData.YColumn + "])", string.Empty));
                                        maxTrendVal = maxTrendVal * 100;

                                        if (data[0].active_chart_type == "barchange")
                                            maxTrendVal = ((Math.Ceiling(maxTrendVal + 5) + (5 - Math.Ceiling(maxTrendVal % 10))) / 100);
                                        else
                                            maxTrendVal = ((Math.Ceiling(maxTrendVal + 10) + (10 - Math.Ceiling(maxTrendVal % 10))) / 100);

                                        if (maxTrendVal > 1)
                                        {
                                            maxTrendVal = 1;
                                        }
                                        if (data[0].active_chart_type == "barchange")
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
                                #endregion other charts
                            }

                            slideNo++;
                        }
                    }
                }
                pres.Slides[0].Remove();
                pres.Save(Server.MapPath("~/Temp/Report" + Session.SessionID + ".pptx"), Aspose.Slides.Export.SaveFormat.Pptx);
            }
        }

        private Color getColorForChangeObj(object ss, object sig, bool isCustom)
        {
            if (ss == null)
                return Color.Transparent;
            else if (Convert.ToInt32(ss) < 30)
                return Color.Transparent;
            else if (isCustom)
                return Color.Blue;
            else if (sig != null && ss != null)
                return getColorForChange(Convert.ToDouble(sig), Convert.ToInt32(ss), isCustom);
            else
                return Color.Black;
        }
        #endregion
        private void resizeTable(int _row, int _col, Aspose.Slides.ITable table)
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
            for (var col = 0; col < table.Columns.Count; col++)
            {
                if (col == 0)
                    table.Columns[col].Width = 250;
                else
                    table.Columns[col].Width = (900 - 250) / _row;
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
            if (Convert.ToString(sampleSize) == "")
                return "NA";
            else
            if (Convert.ToInt32(sampleSize) < 30)
                return sampleSize + "(low sample size)";
            else if (Convert.ToInt32(sampleSize) >= 30 && Convert.ToInt32(sampleSize) < 99)
                return sampleSize + "(use directionally)";
            else
                return string.Format("{0:n0}", sampleSize);
        }
        public void DownloadPPT(string fileName)
        {
            fileName = (fileName == null) ? "Report" : fileName;
            string filename = Convert.ToString(Session["ChartSessionID"]);
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["ChartSessionID"]), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();
            System.Web.HttpContext.Current.Response.ClearHeaders();
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn(fileName) + ".pptx");
            System.Web.HttpContext.Current.Response.ContentType = "application/octet-stream";
            System.Web.HttpContext.Current.Response.AddHeader("Content-Length", new FileInfo(filename).Length.ToString());
            System.Web.HttpContext.Current.Response.AddHeader("Cache-Control", "no-store");
            System.Web.HttpContext.Current.Response.BinaryWrite(btFile);
            System.Web.HttpContext.Current.ApplicationInstance.CompleteRequest();
            //System.Web.HttpContext.Current.Response.Clear();
            System.Web.HttpContext.Current.Response.Flush();
            System.Web.HttpContext.Current.Response.End();

            //return File(fileName, "application/vnd.openxmlformats-officedocument.presentationml.presentation", "Chart.pptx");
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
                case "ClusteredColumn":
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
                case "StackedColumn":
                    asposeChartType = ChartType.StackedColumn;
                    break;
                case "StackedBar":
                    asposeChartType = ChartType.StackedBar;
                    break;

            }
            return asposeChartType;
        }

        public override JsonResult GetMenu()
        {
            throw new NotImplementedException();
        }

        public override JsonResult GetAdvancedFilters(string id)
        {
            throw new NotImplementedException();
        }
    }

    public class Color2DArray
    {
        public Color[,] labelColors { get; set; }
    }
}