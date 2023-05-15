using NextGen.Framework.BusinessLayer;
using Framework.Models;
using Framework.Models.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NextGen.Framework.Controllers
{
    public class TableController : BaseController
    {
        private readonly TableBO table = null;
        public TableController() : base("Table") { table = new TableBO(); }

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult GetTable(FilterPanelInfo[] filter)
        {
            return Json(table.GetTable(filter, null), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public string PrepareExcel(TableInfo filter)
        {
            table.PrepareExcel(filter, Server.MapPath("~/Temp/" + Session.SessionID + ".xlsx"));
            return Session.SessionID;
        }

        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(table.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}
