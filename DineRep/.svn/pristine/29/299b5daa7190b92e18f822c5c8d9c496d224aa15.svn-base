using NextGen.Framework.BusinessLayer;
using Framework.Models;
using Framework.Models.Chart;
using System.Web.Mvc;

namespace NextGen.Framework.Controllers
{
    public class ChartController : BaseController
    {
        private readonly ChartBO chart = null;
        public ChartController() : base("Chart") { chart = new ChartBO(); }

        #region views
        public ActionResult Index()
        {
            return View();
        }
        #endregion

        #region httppost
        [HttpPost]
        public JsonResult GetChart(FilterPanelInfo[] filter)
        {
            return Json(chart.GetChart(filter, null), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public string PreparePowerPoint(ExportDetails details)
        {
            string file = Session.SessionID;
            string template = "~/Templates/Chart_PowerPoint.pptx";
            chart.PreparePowerPoint(Server.MapPath("~/Temp/" + file + ".pptx"), Server.MapPath(template), "~/Temp/" + file + ".pptx", details, null);

            return file;
        }
        #endregion

        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(chart.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}
