using Dine.BusinessLayer;
using Framework.Models;
using System;
using System.Data;
using System.Collections.Generic;
using System.Web.Mvc;
using Dine.BusinessLayer.Interface;
using System.Linq;
using Dine.Models.Report;
using AutoMapper;
using Dine.ReportContext;
using Dine.Utility;
using Framework.Models.Report;
using Aspose.Slides;
//using Dine.Areas.StoryBoard.Models;
using System.Threading.Tasks;
using Framework.Models.Users;
using System.IO;
using System.Web.UI.WebControls;
using System.Drawing;

namespace Dine.Controllers
{
    public class ReportController : BaseController
    {
        private ReportBO report = null;
        private TableBO table = null;
        public ReportController() : base("Report") { report = new ReportBO(); }

        #region views
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult P2PReport()
        {
            return View();
        }
        public JsonResult DineReports()
        {
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            var slides = Mapper.Map<IEnumerable<ReportContext.Slide>, IEnumerable<RSlide>>(new ReportDbContext().Slides.Where(x => x.ReportName == "Dine Report").OrderBy(x => x.SlideNo));
            var resul = Json(slides, JsonRequestBehavior.AllowGet);
            return resul;
        }

        #region DinerReports Custom Tiles Added By Bramhanath
        public JsonResult DinerReports()
        {
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            var slides = Mapper.Map<IEnumerable<ReportContext.Slide>, IEnumerable<RSlide>>(new ReportDbContext().Slides.Where(x => x.ReportName == "Diner Report"));
            var resul = Json(slides, JsonRequestBehavior.AllowGet);
            return resul;
        }
        #endregion
        public ActionResult DinerReport()
        {
            return View();
        }

        public ActionResult SituationAssessmentReport()
        {
            return View();
        }
        public ActionResult InsightsMeetingPlanner()
        {
            ViewBag.Role = Session["Role"];
            return View();
        }
        #endregion

        [HttpPost]
        public string DineSummaryReport(FilterPanelInfo[] filter, string module, string selectedDemofiltersList, List<ColorCodeData> selectedEstablsmntColorLsit, string selectedColorStr)
        {
            string filepath = string.Empty;

            //string colorlist = string.Join("|", selectedEstablsmntColorLsit.Select(x => x.ColourCode).ToList());
            string userId = Session[Constants.Session.ActiveUserId].ToString();
            //IReport _report = new ReportDine();
            IReport _report = new ReportDine(selectedColorStr);
            switch (module)
            {
                case "Dine":
                    filepath = Server.MapPath("~/Templates/P2P_Report.pptx");
                    break;

                case "Summary":
                    filepath = Server.MapPath("~/Templates/DINER_Report.pptx");
                    break;

            }

            _report.PrepareReport(filepath, filter, module, selectedDemofiltersList, this.HttpContext, selectedEstablsmntColorLsit, userId);
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            return "~/Temp/ExportedReportPPT" + Session.SessionID + ".pptx";
        }

        [HttpGet]
        public string PrepareSummaryReport()
        {
            return "~/Templates/Summary_Reports.pptx";
        }

        public FileResult DownloadDineReport(string path)
        {
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            return File(Server.MapPath(path), "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Report") + ".pptx");
        }

        public FileResult DownloadSummaryReport(string path)
        {
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            return File(Server.MapPath(path), "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("Diner Report") + ".pptx");
        }

        public FileResult DownloadSARReport(string path)
        {
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            return File(Server.MapPath(path), "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("Briefing Book") + ".pptx");
        }
        [ActionName("GetFilter")]
        public JsonResult GetMenu(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                report = new ReportBO(controller);
                return GetMenu();
            }
            return Json("");
        }
        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(report.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }

        //public override JsonResult GetAdvancedFilters(string viewName)
        //{
        //    throw new NotImplementedException();
        //}
        public override JsonResult GetAdvancedFilters(string id)
        {
            IList<AdvancedFilterData> filter = report.GetAdvancedFilter() as IList<AdvancedFilterData>;
            filter = new List<Framework.Models.AdvancedFilterData>(filter).Take(1).ToList();
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                table = new TableBO(id);
                filter[0].Filters = table.GetMenu().Filter;

                return Json(filter, JsonRequestBehavior.AllowGet);
            }
            return Json(filter, JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetCustomTile()
        {
            var response = new Framework.Models.Report.ReportTileInfo();
            //response= Framework.Models.Report
            // IReport _report = null;
            //_report = new ReportDine();
            //_report.prepareCustomTileList();
            var result = Json(response, JsonRequestBehavior.AllowGet);
            return result;
        }
        #endregion
        [HttpPost]
        public JsonResult sampleSizeValidator(FilterPanelInfo[] filter, string module)
        {
            IReport _report = new ReportDine();
            //return(_report.GetValidEstablishmentList(filter,module));
            return Json(_report.GetValidEstablishmentList(filter, module), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetSituationLeftPanelMetrics()
        {
            return Json(report.GetSituationLeftPanelMetrics(), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult GetTableOutput(FilterPanelInfo[] filter, string spName)
        {
            return Json(report.GetTableOutput(filter, spName), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetCompetitorsList(string selectedBenchMarkId)
        {
            return Json(report.GetCompetitorsList(selectedBenchMarkId), JsonRequestBehavior.AllowGet);
        }

        //public string DownloadSARReport(FilterPanelInfo[] filter, List<string> spNames, List<SituationAnalysisSelectList> selectionList)
        //{
        //    string filepath = string.Empty;
        //    filepath = Server.MapPath("~/Templates/SARReport.pptx");
        //    string userId = Session[Constants.Session.ActiveUserId].ToString();

        //    IReport _report = new ReportDine();

        //    _report.PrepareSARReport(filepath, filter, spNames, this.HttpContext, userId, selectionList);
        //    LogEntries.LogSelection("REPORTS - SAR");//Added By Bramhanath for User Tracking(16-05-2017)
        //    return "~/Temp/ExportedReportPPT" + Session.SessionID + ".pptx";
        //}
        [HttpPost]
        public async Task<string> DownloadSARReport(FilterPanelInfo[] filter, List<string> spNames, List<SituationAnalysisSelectList> selectionList)
        {
            string filepath = string.Empty;
            filepath = Server.MapPath("~/Templates/SARReport.pptx");
            string userId = Session[Constants.Session.ActiveUserId].ToString();

            IReport _report = new ReportDine();

            await _report.PrepareSARReport(filepath, filter, spNames, this.HttpContext, userId, selectionList);
            LogEntries.LogSelection("REPORTS - SAR");//Added By Bramhanath for User Tracking(16-05-2017)
            return "~/Temp/ExportedReportPPT" + Session.SessionID + ".pptx";
        }


        [HttpPost]
        public string SaveChangedColorCodeForSAR(List<ColorCodeData> ChangedColorCodeList)
        {
            try
            {
                IReport _report = new ReportDine();
                string UserId = Session[Constants.Session.ActiveUserId].ToString();
                report.SaveChangedColorCodeForSAR(ChangedColorCodeList, UserId);
                return "ok";
            }
            catch (Exception ex)
            {
                LogEntries.LogSelection("Error: SaveChangedColorCodeForSAR Action - " + ex.Message);
                return "error";
            }
        }

        [HttpPost]
        public string GetTemplates()
        {
            string filepath1 = string.Empty; string filepath2 = string.Empty;
            filepath1 = Server.MapPath("~/Templates/PPT1.pptx");
            filepath2 = Server.MapPath("~/Templates/PPT2.pptx");

            Presentation ppt = new Presentation();
            Presentation ppt1 = new Presentation(filepath1);
            Presentation ppt2 = new Presentation(filepath2);

            for (int i = 0; i < ppt2.Slides.Count; i++)
            {
                ppt1.Slides.AddClone(ppt2.Slides[i]);

                //ppt.Slides.AddClone()
            }
            ppt1.Save(Server.MapPath("~/Temp/Report" + Session.SessionID + ".pptx"), Aspose.Slides.Export.SaveFormat.Pptx);

            return "~/Temp/Report" + Session.SessionID + ".pptx";
        }

        public FileResult DownloadMacroReport(string path)
        {
            LogEntries.LogSelection("REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            return File(Server.MapPath(path), "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("Macros Report Repository") + ".pptx");
        }


        #region PPTBuilder
        [HttpPost]
        public string CreateSection(List<MacroDetails> selectionsObj)
        {
            try
            {
                var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
                return report.CreateSection(selectionsObj, currentUser.Name);

            }
            catch (Exception e)
            {
                return "failed";
            }


        }
        [HttpPost]
        public string OverwriteSection(List<MacroDetails> selectionsObj)
        {
            try
            {
                var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
                return report.OverwriteSection(selectionsObj, currentUser.Name);

            }
            catch (Exception e)
            {
                return "failed";
            }


        }
        [HttpPost]
        public string SubmitSectionOrder(List<MacroDetails> reorderDetail)
        {
            try
            {

                return report.SubmitSectionOrder(reorderDetail);
            }
            catch (Exception e)
            {
                return "failed";
            }


        }
        public string DeleteSectionOrSubsection(List<MacroDetails> finalObj)
        {
            try
            {
                ReportDine _report = new ReportDine();
                string dir = "~/PPTBuilder/";
                for (int i = 0; i < finalObj.Count; i++)
                {
                    string subFolder = Path.Combine(Server.MapPath(dir), _report.cleanText(finalObj[i].SectionName));
                    if (Directory.Exists(subFolder))
                    {
                        string path = subFolder + "\\" + _report.cleanText(finalObj[i].Filename) + ".pptx";
                        System.IO.File.Delete(path);

                        //delete folder if it contains no files
                        if (finalObj[i].SubsectionId == 0)
                        {
                            System.IO.Directory.Delete(subFolder, recursive: true);
                        }
                    }

                }
                return report.DeleteSectionOrSubsection(finalObj);
            }
            catch (Exception e)
            {
                return "failed";
            }


        }
        [HttpPost]
        public string LockSection(List<MacroDetails> LockList)
        {
            try
            {

                return report.LockSection(LockList);
            }
            catch (Exception e)
            {
                return "failed";
            }


        }

        [HttpPost]
        public string EditSection(List<MacroDetails> EditDetails)
        {
            try
            {
                ReportDine _report = new ReportDine();
                string dir = "~/PPTBuilder/";
                for (int i = 0; i < EditDetails.Count; i++)
                {
                    string subFolder = Path.Combine(Server.MapPath(dir), _report.cleanText(EditDetails[i].ParentSectName));
                  
                    if (EditDetails[i].SectionName != null && EditDetails[i].SectionName!= EditDetails[i].ParentSectName)
                    {
                        string newfolder = Path.Combine(Server.MapPath(dir), _report.cleanText(EditDetails[i].SectionName));
                        if (Directory.Exists(subFolder))
                        {

                            Directory.Move(Path.Combine(subFolder), Path.Combine(newfolder));
                        }
                    }
                   

                }

                return report.EditSection(EditDetails);
            }
            catch (Exception e)
            {
                return "failed";
            }


        }
        public string EditSubSection(List<MacroDetails> SubsectionDetails)
        {
            try
            {
                ReportDine _report = new ReportDine();
                string dir = "~/PPTBuilder/";
                for (int i = 0; i < SubsectionDetails.Count; i++)
                {

                    string subFolder = dir+"/"+ _report.cleanText(SubsectionDetails[i].ParentSectName);
                    if (SubsectionDetails[0].ParentorSubSectName != SubsectionDetails[0].SubSectionName)
                    {
                        string path1 = Server.MapPath(subFolder + "/" + _report.cleanText(SubsectionDetails[0].ParentorSubSectName)) + ".pptx";
                        string path2 = Server.MapPath(subFolder + "/" + _report.cleanText(SubsectionDetails[0].SubSectionName));

                        if (Directory.Exists(Server.MapPath(subFolder)))
                        {
                            using (Presentation pres = new Presentation(path1))
                            {

                                pres.Save(path2 + ".pptx", Aspose.Slides.Export.SaveFormat.Pptx);
                            }
                            System.IO.File.Delete(path1);
                        }
                    }

                }

                return report.EditSubSection(SubsectionDetails);
            }
            catch (Exception e)
            {
                return "failed";
            }


        }

        [HttpPost]
        public string UploadFile(List<MacroDetails> subsec)
        {
            try
            {
                ReportDine _report = new ReportDine();

                string dir = "~/PPTBuilder/";
                for (int i = 0; i < subsec.Count; i++)
                {
                    var path = Path.Combine(Server.MapPath(dir), subsec[i].Filename);

                    using (Presentation pres = new Presentation(path))
                    {
                        subsec[i].SlideCount = pres.Slides.Count;
                        string subFolder = Path.Combine(Server.MapPath(dir), _report.cleanText(subsec[i].SectionName));
                        if (!Directory.Exists(subFolder))
                            Directory.CreateDirectory(Path.Combine(subFolder));
                        pres.Save(subFolder + "/" + _report.cleanText(subsec[i].SubSectionName) + ".pptx", Aspose.Slides.Export.SaveFormat.Pptx);
                    }
                    System.IO.File.Delete(path);

                }
                var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
                return report.UploadFile(subsec, currentUser.Name);
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        [HttpPost]
        public string UploadOverwriteFile(List<MacroDetails> overwritesection)
        {
            try
            {
                ReportDine _report = new ReportDine();

                string dir = "~/PPTBuilder/";
                for (int i = 0; i < overwritesection.Count; i++)
                {
                    var path = Path.Combine(Server.MapPath(dir), overwritesection[i].Filename);

                    using (Presentation pres = new Presentation(path))
                    {
                        overwritesection[i].SlideCount = pres.Slides.Count;

                        string subFolder = Path.Combine(Server.MapPath(dir), _report.cleanText(overwritesection[i].SectionName));
                        if (!Directory.Exists(subFolder))
                            Directory.CreateDirectory(Path.Combine(subFolder));
                        pres.Save(subFolder + "/" + _report.cleanText(overwritesection[i].SubSectionName) + ".pptx", Aspose.Slides.Export.SaveFormat.Pptx);
                    }
                    System.IO.File.Delete(path);

                }
                var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
                return report.UploadOverwriteFile(overwritesection, currentUser.Name);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        [HttpPost]
        public string GenerateReport(List<MacroDetails> pptList)
        {
            List<string> sec = new List<string>();
            List<string> subsec = new List<string>();
            sec.Clear();
            int delimiterSlide = 3;
            string dir;
            string fileName = Server.MapPath("~/Templates/Insights Meeting Planning_TemplateSlide.pptx");
            using (Presentation masterPres = new Presentation(fileName))
            {
                var c = 0;
                var subname = "";
                int h = 100;
                sec.Clear();
                int l = 150;
                var secname = "";
                int grpId = 1;
                string dataDir = Server.MapPath("~/Images/P2PDashboardEsthmtImages");
                Presentation prnt = new Presentation();
                ISlide slide1 = masterPres.Slides[2];

                //To insert Customername and logo 
                ISlide slide0 = masterPres.Slides[0];
                ((IAutoShape)slide0.Shapes.FirstOrDefault(x => x.Name == "CustomerName")).TextFrame.Text = pptList[0].customerName;
                string dataDir2 = Server.MapPath("~/Images/P2PDashboardEsthmtImages" + pptList[0].logoName + ".svg");
                IAutoShape sp = ((IAutoShape)slide0.Shapes.FirstOrDefault(x => x.Name == "Customerlogo"));


                // Set the fill type to Picture
                sp.FillFormat.FillType = FillType.Picture;

                // Set the picture fill mode
                sp.FillFormat.PictureFillFormat.PictureFillMode = PictureFillMode.Tile;

                // Set the picture
                System.Drawing.Image img = (System.Drawing.Image)new Bitmap(dataDir2);
                IPPImage imgx = masterPres.Images.AddImage(img);
                sp.FillFormat.PictureFillFormat.Picture.Image = imgx;

                IGroupShape tempGroup;
                int slideInex = 2;
                var parntSectionNameList = pptList.Select(o => o.SectionName).Distinct().ToList();
                var parntSubSectionNameList = pptList.Select(o => o.SubSectionName).Distinct().ToList();

                double totalsectionsHeightCount = (parntSectionNameList.Count * 16) + (parntSubSectionNameList.Count * 16) + ((parntSectionNameList.Count - 1) * 21);

                if (totalsectionsHeightCount > 800 && totalsectionsHeightCount < 1600)
                {
                    masterPres.Slides.InsertClone(slideInex + 1, masterPres.Slides[2]);
                    masterPres.Slides.InsertClone(slideInex + 2, masterPres.Slides[2]);
                }
                else if (totalsectionsHeightCount > 400 && totalsectionsHeightCount < 800)
                {
                    masterPres.Slides.InsertClone(slideInex++, masterPres.Slides[2]);
                }

                int subSectnCount = 0;
                //float verticalPositionGrp = 0;
                List<double> verticalPositionGrp = new List<double>();
                double postn = 0.0;
                for (int k = 0; k < parntSectionNameList.Count; k++)
                {
                    if (postn > 400)
                    {
                        postn = 0.0;
                        grpId = 1;
                        slide1 = masterPres.Slides[3];
                    }
                    tempGroup = (IGroupShape)slide1.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault();
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "parentnme_" + grpId).FirstOrDefault()).TextFrame.Text = parntSectionNameList[k];
                    string subSectnNamesappend = "";
                    subSectnCount = 0;
                    for (int m = 0; m < pptList.Count; m++)
                    {
                        if (parntSectionNameList[k] == pptList[m].SectionName)
                        {
                            if (subSectnCount == 0)
                                subSectnNamesappend += pptList[m].SubSectionName;
                            else
                                subSectnNamesappend += "\n" + pptList[m].SubSectionName;
                            subSectnCount++;
                        }
                    }
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "subsectn_" + grpId).FirstOrDefault()).TextFrame.Text = subSectnNamesappend;
                    IConnector textShape = (IConnector)tempGroup.Shapes.Where(x => x.Name == "leftbar_" + grpId).FirstOrDefault();
                    textShape.Height = (float)(16 * (subSectnCount + 1));
                    verticalPositionGrp.Add(16 * (subSectnCount + 1));


                    for (int v = 0; v < (verticalPositionGrp.Count - 1); v++)
                    {
                        postn = postn + verticalPositionGrp[v];
                    }

                    if (grpId == 1)
                        slide1.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault().Y = (float)70;
                    else
                        slide1.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault().Y = (float)postn + (21 * k) + 70;


                    grpId++;

                }
                for (int del = 5; grpId <= del; grpId++)
                {
                    slide1.Shapes.Remove(slide1.Shapes.Where(x => x.Name == "selection_" + grpId).FirstOrDefault());
                }

                #region previous code
                for (int j = 0; j < pptList.Count; j++)
                {
                    dir = "~/PPTBuilder/" + pptList[j].SectionName + "/" + pptList[j].Filename;
                    Presentation srcPres = new Presentation(Server.MapPath(dir));

                    ISlide slide = masterPres.Slides[delimiterSlide];
                    ((IAutoShape)slide.Shapes.FirstOrDefault(x => x.Name == "sub-section-name")).TextFrame.Text = pptList[j].SubSectionName;
                    ((IAutoShape)slide.Shapes.FirstOrDefault(x => x.Name == "sub-section-desc")).TextFrame.Text = pptList[j].SubSectionNamedesc;

                    ISlideCollection slds = masterPres.Slides;
                    for (int i = 0; i < Convert.ToInt16(pptList[j].SlideCount); i++)
                    {
                        slds.AddClone(srcPres.Slides[i]);
                    }
                    delimiterSlide += pptList[j].SlideCount + 1;
                    if (j < pptList.Count - 1)
                        slds.AddClone(masterPres.Slides[3]);
                }

                #endregion

                HttpContext.Session["Aspose"] = masterPres;


            }
            return "true";

        }
        [HttpPost]
        public string GenerateReportNew(List<MacroDetails> pptList)
        {
            List<string> sec = new List<string>();
            List<string> subsec = new List<string>();
            sec.Clear();
            int delimiterSlide = 3;
            string dir;
            string filePath = Server.MapPath("~/Templates/Insights Meeting Planning_TemplateSlide.pptx");

            IReport _report = new ReportDine();
            _report.PrepareInsightsReport(pptList, filePath, this.HttpContext);
            LogEntries.LogSelection("Insigths REPORTS");//Added By Bramhanath for User Tracking(16-05-2017)
            return "~/Temp/ExportedReportPPT" + Session.SessionID + ".pptx";
        }
        public void DownloadPPT(string fileName)
        {
            try
            {
                if (HttpContext.Session["Aspose"] as Presentation != null)
                {
                    string dateTime = DateTime.Now.ToString();
                    byte[] buffer;
                    using (MemoryStream objMemoryStream = new MemoryStream())
                    {
                        using (Presentation pres = HttpContext.Session["Aspose"] as Presentation)
                        {
                            pres.Save(objMemoryStream, Aspose.Slides.Export.SaveFormat.Pptx);
                        }

                        buffer = objMemoryStream.ToArray();
                    }

                    HttpContext.Response.Clear();
                    HttpContext.Response.Buffer = true;

                    HttpContext.Response.AddHeader("Content-disposition", "attachment; filename=" + fileName + dateTime + ".pptx");

                    //HttpContext.Response.AddHeader("Content-disposition", "attachment; filename=Insights Meeting Planner_"  + dateTime + ".pptx");
                    HttpContext.Response.ContentType = "application/vnd.ms-powerpoint";
                    HttpContext.Response.AddHeader("Content-Length", buffer.Length.ToString());
                    HttpContext.Response.BinaryWrite(buffer);
                    HttpContext.Response.Flush();
                    HttpContext.Response.Close();
                }
            }
            catch (Exception ex)
            {
            }
        }
        public FileResult DownloadPPTNew(string path, string customerName)
        {
            LogEntries.LogSelection("Insights Report");//Added By Bramhanath for User Tracking(16-05-2017)
            string fileName = "";
            if (customerName != "")
            {
                fileName += customerName;
            }
            else
            {
                fileName += "Insights Meeting Planner";
            }

            fileName += "_" + System.DateTime.Now.DayOfWeek.ToString().Substring(0, 3) + " " + System.DateTime.Now.ToString("MMMM").Substring(0, 3) + " " + System.DateTime.Today.Day + " " + System.DateTime.Today.Year + "" + "_" + DateTime.Now.Hour + "" + DateTime.Now.Minute + "" + DateTime.Now.Second;

            return File(Server.MapPath(path), "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileName + ".pptx");
        }

        [HttpGet]
        public JsonResult GetSectionNameDropDwnList()
        {
            return Json(report.GetSectionNameDropDwnList(), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetSubSectionName()
        {
            return Json(report.GetSubSectionName(), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetModifySectnsData()
        {
            return Json(report.GetModifySectnsData(), JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetEstablishmentData()
        {
            return Json(report.GetEstablishmentLogoDetails(), JsonRequestBehavior.AllowGet);
        }
        #endregion
    }



}
