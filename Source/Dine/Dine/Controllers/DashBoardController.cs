using Dine.BusinessLayer;
using Framework.Models;
using Framework.Models.DashBoard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Framework.Models.Users;
using Dine.Models.Dashboard;
using Framework.Data;
using System.Data;

namespace Dine.Controllers
{
    public class DashBoardController : BaseController
    {
        private DashBoardBO dashboard = null;
        public DashBoardController() : base("DashBoard") { dashboard = new DashBoardBO(); }

        #region override methods
        public override JsonResult GetAdvancedFilters(string id)
        {
            throw new NotImplementedException();
        }
        
        #endregion
        [ActionName("GetFilter")]
        public JsonResult GetMenu(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                dashboard = new DashBoardBO(controller);
                return GetMenu();
            }
            return Json("");
        }

        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(dashboard.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }
        #endregion


        // GET: DashBoard
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult BrandHealth()
        {
            return View();
        }
        public ActionResult P2PDashboard()
        {
            return View();
        }
        public ActionResult Demographics()
        {
            return View();
        }
        public ActionResult Visits()
        {
            return View();
        }
        //To Export Popup
        [HttpPost]
        public void PopupExportDashboard(P2PPopupDashboardData data) {
            string filepath = Server.MapPath("~/Templates/P2PDashboard_Popup");
            string destFile = Server.MapPath("~/Temp/ExportedDashboardPPT" + Session.SessionID + (DateTime.Now.Ticks) + ".pdf");
            dashboard.PopupExportDashboard(filepath, destFile, data, this.HttpContext);
            Session["FullP2P"] = destFile;
            //return Json(destFile, JsonRequestBehavior.AllowGet);
        }
        //To export full dashboard ppt
        [HttpPost]
        public void ExportToFullDashboardPPT(P2PDashboardData data) {
            string filepath = Server.MapPath("~/Templates/P2PDashboard.pptx");
            string destFile = Server.MapPath("~/Temp/ExportedDashboardPPT" + Session.SessionID + (DateTime.Now.Ticks) + ".pdf");
            dashboard.ExportToFullDashboardPPT(filepath,destFile,data, this.HttpContext);
            Session["FullP2P"] = destFile;
            Session["sampleSizeOnly"] = "";
            if (data.isSampleSize == "samplesizePPT" || data.isSampleSize == "samplesizePDF")
            {
                Session["sampleSizeOnly"] = "sampleSizeOnly";
            }
                //return Json(destFile, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public void ExportToDemogDashboardPPT(P2PDashboardData data) {
            string filepath = Server.MapPath("~/Templates/DemogDashboard.pptx");
            string destFile = Server.MapPath("~/Temp/ExportedDemogDashboardPPT" + Session.SessionID + (DateTime.Now.Ticks) + ".pdf");
            dashboard.ExportToDemogDashboardPPT(filepath, destFile, data, this.HttpContext);
            Session["FullDemog"] = destFile;
            //return Json(destFile, JsonRequestBehavior.AllowGet);
        }
        //To download ppt
        public FileResult DownloadFullDemogDashboardPDF()
        {
            string path = Session["FullDemog"].ToString();
            LogEntries.LogSelection("DEMOGRAPHICS DASHBOARD");//Added By Bramhanath for User Tracking(16-05-2017)
            return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("Demographics Dashboard") + ".pdf");
        }
        public FileResult DownloadFullDashboardPDF() {
            string path = Session["FullP2P"].ToString();
            LogEntries.LogSelection("PATH TO PURCHASE DASHBOARD");//Added By Bramhanath for User Tracking(16-05-2017)
            if (Session["sampleSizeOnly"] != null)
            {
                if (Session["sampleSizeOnly"].ToString() == "sampleSizeOnly")
                    return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Dashboard_Sample Sizes") + ".pdf");
                else
                    return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Dashboard") + ".pdf");
            }
            else
                return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Dashboard") + ".pdf");
        }
        public FileResult DownloadFullDemogDashboardPPT()
        {
            string path = Session["FullDemog"].ToString();
            LogEntries.LogSelection("DEMOGRAPHICS DASHBOARD");//Added By Bramhanath for User Tracking(16-05-2017)
            return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("Demographics Dashboard") + ".pptx");
        }
        public FileResult DownloadFullDashboardPPT()
        {
            string path = Session["FullP2P"].ToString();
            LogEntries.LogSelection("PATH TO PURCHASE DASHBOARD");//Added By Bramhanath for User Tracking(16-05-2017)
            if (Session["sampleSizeOnly"] != null) { 
                if (Session["sampleSizeOnly"].ToString() == "sampleSizeOnly")
                    return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Dashboard_Sample Sizes") + ".pptx");
                else
                    return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Dashboard") + ".pptx");
            }
            else
                return File(path, "application/vnd.openxmlformats-officedocument.presentationml.presentation", Dine.BusinessLayer.Utils.FileNamingConventn("P2P Dashboard") + ".pptx");
        }
        //To Save or Get User Filters
        [HttpPost]
        public string SaveorGetUserFilters(FilterPanelInfo[] filter, string filterMode,int dashboardType)
        {
            var currentUser = (Session[Utility.Constants.Session.ActiveUser] as UserDetail);
            string result = dashboard.SaveorGetUserFilters(filter, filterMode, Convert.ToString(currentUser.Id), dashboardType);
            return result;
        }

        //To Get Dashboard Data
        [HttpPost]
        public JsonResult GetDashboardData(FilterPanelInfo[] filter)
        {
            LogEntries.LogSelection("PATH TO PURCHASE DASHBOARD");//Added By Bramhanath for User Tracking(16-05-2017)
            return Json(dashboard.GetDashboard(filter),JsonRequestBehavior.AllowGet);
        }

        //To Get Dashboard Data
        [HttpPost]
        public JsonResult GetOutputDataForDemogpcs(FilterPanelInfo[] filter)
        {
            
            LogEntries.LogSelection("DEMOGRAPHICS DASHBOARD");//Added By Bramhanath for User Tracking(16-05-2017)
            return Json(dashboard.GetOutputDataForDemogpcs(filter), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult sampleSizeValidator(FilterPanelInfo[] filter, string module)
        {
            System.Data.DataTable dt = (new Report()).GetValidEstablishmentListWithStat(filter, null, module);
            List<SampleSizeEstList> lst = new List<SampleSizeEstList>();
            foreach (DataRow item in dt.Rows)
            {
                int ss = 0;
                int.TryParse(item["SampleSize"].ToString(), out ss);
                lst.Add(new SampleSizeEstList() { EstName = item["EstName"].ToString(), SS = ss });
            }
            return Json(lst, JsonRequestBehavior.AllowGet);
        }
    }
}