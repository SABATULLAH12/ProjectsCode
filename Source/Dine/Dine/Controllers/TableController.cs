using AqUtility.Cached;
using Dine.BusinessLayer;
using Framework.Models;
using Framework.Models.Table;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dine.Controllers
{
    public class TableController : BaseController
    {
        private TableBO table = null;
        private static readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public TableController() : base("Table") { table = new TableBO(); }

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

        [HttpPost]
        public JsonResult GetTable(FilterPanelInfo[] filter, string module, string measureType, string customBaseText,string timePeriodType)
        {
            // return Json(table.GetTable(filter, null), JsonRequestBehavior.AllowGet);
            LogEntries.LogSelection("TABLES");//Added By Bramhanath for User Tracking(16-05-2017)
            //return Json(table.GetTable(filter, module, measureType, null, customBaseText,timePeriodType), JsonRequestBehavior.AllowGet);

            var jsonString = Json(table.GetTable(filter, module, measureType, null, customBaseText, timePeriodType), JsonRequestBehavior.AllowGet);
            jsonString.MaxJsonLength = int.MaxValue;
            return jsonString;
        }

        #region PrepareExcelData & Download
        [HttpPost]
        public string PrepareExcel(FilterPanelInfo[] filter, string module, string measureType, string customBaseText, List<int> selectedcheckboxTopFilters, string selctdTimePeriod, string selctedFrequency,string selctedFrequencyId, int selectedTopFilterId,string moduleType,string selectedAdvanceFitlersList,string selectedStatTest,int isVisits,string selectedDemofiltersList,string selectedConsumedFrqyTxt,string selectedConsumedFrqyid, string timePeriodType,bool isFrqncyInBrandHlthMtricChanged)
        {
            string outPutPath = "";
            string destiFile = "";
            #region advance filter modifications based on selected visits and guests 

            var VisitadvanceFiltersList = new List<string> { "DAYPART", "DAY PART", "DAY OF WEEK", "BEVERAGE ITEMS", "FOOD ITEMS", "Planning Type", "Service Mode", "Meal Type", "Visit Type", "Outlet Segments", "Beverage Consumed", "MEAL MISSION TRIP SEGMENT" };
            var GuestadvanceFiltersList = new List<string> { "DEVICE USED" };
            FilterPanelInfo[] Demofilter = filter, Visitfilter = filter, Guestfilter = filter;
            int visitsorGuests = isVisits;
            string frequency = selctedFrequency, frequencyId = selctedFrequencyId;
            var GuestFilterModified = Guestfilter.ToList();
            var VisitFilterModified =Visitfilter.ToList();
            string selectedAdvanceFitlersListModified = selectedAdvanceFitlersList;
            string deepdiveEstbmt = "";
            if(module == "tableestablishmentdeepdive")
                deepdiveEstbmt = filter.FirstOrDefault(x => x.Name == "Establishment").Data.Select(x => x.Text).ToList()[0].ToString();
            else if(module == "tablebeveragedeepdive")
                deepdiveEstbmt = filter.FirstOrDefault(x => x.Name == "Beverage").Data.Select(x => x.Text).ToList()[0].ToString();
            //Check for Clearing Advance filters

            #region Guests
            foreach (var item in Guestfilter)
            {
                var listIndex = GuestFilterModified.ToList().IndexOf(item);
                if (VisitadvanceFiltersList.IndexOf(item.Name) > -1)
                {
                    GuestFilterModified.RemoveAt(listIndex);
                }
            }
            #endregion

            #region Visits
            foreach (var item in Visitfilter)
            {
                var listIndex = VisitFilterModified.ToList().IndexOf(item);
                if (GuestadvanceFiltersList.IndexOf(item.Name) > -1)
                {
                    VisitFilterModified.RemoveAt(listIndex);
                }
            }
            #endregion

            #region FileName
            var moduleNameforFile = "";
            switch (module)
            {
                case "tableestablishmentcompare":
                    moduleNameforFile = "Compare Establishment";
                    break;
                case "tableestablishmentdeepdive":
                    moduleNameforFile = "Establishment Deep Dive";
                    break;
                case "tablebeveragecomparison":
                    moduleNameforFile = "Compare Beverage";
                    break;
                case "tablebeveragedeepdive":
                    moduleNameforFile = "Beverage Deep Dive";
                    break;
            }
            #endregion

            #endregion
            for (int i = 0; i < selectedcheckboxTopFilters.Count(); i++)
            {
                //if (selectedTopFilterId != selectedcheckboxTopFilters[i])
                //{
                    if (((selectedcheckboxTopFilters[i] >= 1 && selectedcheckboxTopFilters[i] <= 4) || selectedcheckboxTopFilters[i] == 7))
                    {
                        filter = VisitFilterModified.ToArray();
                    selectedAdvanceFitlersList = visitsorGuests == 1 ? selectedAdvanceFitlersListModified : "";
                    }
                    else if (selectedcheckboxTopFilters[i] == 5 || selectedcheckboxTopFilters[i] == 8  || selectedcheckboxTopFilters[i] == 0 || selectedcheckboxTopFilters[i] == 9)
                    {
                        filter = GuestFilterModified.ToArray();
                    selectedAdvanceFitlersList = visitsorGuests == 0 ? selectedAdvanceFitlersListModified : "";
                    }
                //}
                if ((selectedcheckboxTopFilters[i] == 0 && visitsorGuests == 1) || ((selectedcheckboxTopFilters[i] == 5 || selectedcheckboxTopFilters[i] == 0 || selectedcheckboxTopFilters[i] == 9) && visitsorGuests == 1))
                {
                    if (moduleType == "Beverage(s)")
                    {
                        selctedFrequency = "Monthly+";
                        selctedFrequencyId = "1";
                        isVisits = 0;
                    }
                    else
                    {
                        selctedFrequency = "Quarterly+";
                        selctedFrequencyId = "3";
                        isVisits = 0;
                    }
                }
                else if (selectedcheckboxTopFilters[i] == 8 && visitsorGuests == 0 && selctedFrequency == "Quarterly+" && isFrqncyInBrandHlthMtricChanged == false)
                {
                    selctedFrequency = "Establishment In Trade Area";
                    selctedFrequencyId = "5";
                    isVisits = 0;
                }
                else if (selectedcheckboxTopFilters[i] == 8 && visitsorGuests == 1 && isFrqncyInBrandHlthMtricChanged == false)
                {
                    selctedFrequency = "Establishment In Trade Area";
                    selctedFrequencyId = "5";
                    isVisits = 0;
                }
                else if ((selectedcheckboxTopFilters[i] == 1 && visitsorGuests == 0) || ((((selectedcheckboxTopFilters[i] >= 1 && selectedcheckboxTopFilters[i] <= 4) || selectedcheckboxTopFilters[i] == 7) && visitsorGuests == 0)))
                {
                    selctedFrequency = "Total Visits";
                    selctedFrequencyId = "6";
                    isVisits = 1;
                }
                else if (selectedcheckboxTopFilters[i] != 8 && isFrqncyInBrandHlthMtricChanged == false && selectedTopFilterId == 8 && visitsorGuests == 0)
                {
                    selctedFrequency = "Quarterly+";
                    selctedFrequencyId = "3";
                    isVisits = 0;
                }
                else
                {
                    selctedFrequency = frequency;
                    selctedFrequencyId = frequencyId;
                    isVisits = visitsorGuests;
                }
                
              filter = table.filtModification(filter,selectedcheckboxTopFilters[i], selectedTopFilterId, moduleType, selctedFrequency, selctedFrequencyId, selectedConsumedFrqyid,isVisits);
                var tableData = table.GetTable(filter, module, measureType, null, customBaseText,timePeriodType);
                var mainList = table.PrepareListForExcel(tableData);
                var sampleSizeList = table.PrepareSampleSizeListForExcel(tableData, selectedcheckboxTopFilters[i],module);
                destiFile = table.PrepareExcel(mainList, sampleSizeList, tableData.Columns,
                    Server.MapPath(@"~/Temp/" + Session.SessionID + ".xlsx"), selectedcheckboxTopFilters[i], i, destiFile, selctdTimePeriod, selctedFrequency, ref outPutPath,moduleType, selectedAdvanceFitlersList,customBaseText, selectedTopFilterId, selectedStatTest,isVisits, selectedDemofiltersList, selectedConsumedFrqyTxt,module, timePeriodType, deepdiveEstbmt);
               
            }
            Session["FileName"] = moduleNameforFile;
            Session["FilePath"] = Server.MapPath(@"~/Temp/" + Session.SessionID + "/" + outPutPath);
            LogEntries.LogSelection("TABLES");//Added By Bramhanath for User Tracking(16-05-2017)
            return Server.MapPath(@"~/Temp/" + Session.SessionID + "/"+  outPutPath);
        }

        public void  DownloadExcel(string path)
        {
            //String[] list = path.Split('/');
            //string fileName = list[list.Count() - 1];
            //string fullPath = Path.Combine(Server.MapPath("~/Temp"), path);
            //return File(fullPath, "application/octet-stream", fileName);

            string filename = Session["FileName"].ToString();
            FileStream fs1 = null;
            fs1 = System.IO.File.Open(Convert.ToString(Session["FilePath"]), System.IO.FileMode.Open);

            byte[] btFile = new byte[fs1.Length];
            fs1.Read(btFile, 0, Convert.ToInt32(fs1.Length));
            fs1.Close();
            System.Web.HttpContext.Current.Response.ClearHeaders();
            System.Web.HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=" + Dine.BusinessLayer.Utils.FileNamingConventn(filename) + ".xlsx");
            System.Web.HttpContext.Current.Response.ContentType = "application/octet-stream";
            System.Web.HttpContext.Current.Response.AddHeader("Content-Length", new FileInfo(Convert.ToString(Session["FilePath"])).Length.ToString());
            System.Web.HttpContext.Current.Response.AddHeader("Cache-Control", "no-store");
            System.Web.HttpContext.Current.Response.BinaryWrite(btFile);
            System.Web.HttpContext.Current.ApplicationInstance.CompleteRequest();
            //System.Web.HttpContext.Current.Response.Clear();
            System.Web.HttpContext.Current.Response.Flush();
            System.Web.HttpContext.Current.Response.End();
        }

        [HttpGet]
        public virtual ActionResult Download(string path)
        {
            String[] list = path.Split('/');
            string fileName = list[list.Count() - 1];
            string fullPath = Path.Combine(Server.MapPath("~/Temp"), path);
            return File(fullPath, "application/vnd.ms-excel", fileName);
        }

        //#region delete downloaded excel files
        //[HttpPost]
        //public ActionResult Delete(Export_Excel request)
        //{
        //    string status = "";
        //    try
        //    {
        //        var folderName = Path.GetDirectoryName(request.DeletePath);
        //        string fullPath = Server.MapPath("~/Temp/" + folderName);
        //        if (Directory.Exists(fullPath))
        //            Directory.Delete(fullPath, true);

        //    }
        //    catch (Exception ex)
        //    {
        //        Log.LogException(ex);
        //    }
        //    return Json(status, JsonRequestBehavior.AllowGet);
        //}
        //#endregion delete downloaded excel files 


        #endregion

        [ActionName("GetFilter")]
        public JsonResult GetMenu(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                table = new TableBO(controller);
                return GetMenu();
            }
            return Json("");
        }

        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(table.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetAdvancedFilters(string id, int bitData)
        {
            IList<AdvancedFilterData> filter = table.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;
            string cachedname = string.Empty;

            if (!string.IsNullOrEmpty(id))
            {
                base.controller = id;
                

                if (bitData == 1)
                {
                    cachedname = "add_table_1";
                    filter = CachedQuery<IList<AdvancedFilterData>>.Cache.GetData(cachedname);
                    if (filter == null)
                    {
                        filter = table.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;

                        table = new TableBO(id + "_demographics");
                        filter[0].Filters = table.GetMenu().Filter;

                        table = new TableBO(id + "_beveragetab_visits");
                        filter[1].Filters = table.GetMenu().Filter;

                        table = new TableBO(id + "_beveragetab_guest");
                        filter[2].Filters = table.GetMenu().Filter;

                        CachedQuery<IList<AdvancedFilterData>>.Cache.SetData(cachedname, filter);
                    }
                }
                else
                {
                    cachedname = "add_table_1_else";
                    filter = CachedQuery<IList<AdvancedFilterData>>.Cache.GetData(cachedname);
                    if (filter == null)
                    {
                        filter = table.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;

                        table = new TableBO(id + "_demographics");
                        filter[0].Filters = table.GetMenu().Filter;

                        table = new TableBO(id + "_visits");
                        filter[1].Filters = table.GetMenu().Filter;

                        table = new TableBO(id + "_guest");
                        filter[2].Filters = table.GetMenu().Filter;

                        table = new TableBO(id + "_guest_beverage");
                        filter[3].Filters = table.GetMenu().Filter;

                        CachedQuery<IList<AdvancedFilterData>>.Cache.SetData(cachedname, filter);
                    }
                }

                //if (bitData == 0)
                //{
                //    cachedname = "add_table_0";
                //    filter = CachedQuery<IList<AdvancedFilterData>>.Cache.GetData(cachedname);
                //    if (filter == null)
                //    {
                //        filter = table.GetAdvancedFilter(bitData) as IList<AdvancedFilterData>;

                //        table = new TableBO(id + "_demographics");
                //        filter[0].Filters = table.GetMenu().Filter;

                //        table = new TableBO(id + "_visits");
                //        filter[1].Filters = table.GetMenu().Filter;

                //        table = new TableBO(id + "_guest");
                //        filter[2].Filters = table.GetMenu().Filter;

                //        table = new TableBO(id + "_guest_beverage");
                //        filter[3].Filters = table.GetMenu().Filter;

                //        CachedQuery<IList<AdvancedFilterData>>.Cache.SetData(cachedname, filter);
                //    }
                //}

                return Json(filter, JsonRequestBehavior.AllowGet);
            }
            return Json(filter, JsonRequestBehavior.AllowGet);
        }
        #endregion

        [ActionName("Dummy")]
        public override JsonResult GetAdvancedFilters(string id)
        {
            return Json(null, JsonRequestBehavior.AllowGet);
        }
    }
}
