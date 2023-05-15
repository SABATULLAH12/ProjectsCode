using NextGen.Core.Configuration;
using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Models;
using Dine.BusinessLayer;
using Framework.Models;
using System.Linq;
using System.Web.Mvc;

namespace Dine.Controllers
{
    [EnableToolConfig]
    public class ToolController : Controller
    {
        private readonly ToolConfigBO _tool = null;
        private IModuleConfig chartConfig = ConfigContext.Current.GetConfig("Chart");
        private IModuleConfig tableConfig = ConfigContext.Current.GetConfig("Table");
        private IModuleConfig snapshotConfig = ConfigContext.Current.GetConfig("Analyses");

        public ToolController()
        {
            this._tool = new ToolConfigBO();
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Config()
        {
            return View();
        }

        [HttpPost]
        public string UpdateLeftPanel(string module, ViewFilter info)
        {
            ConfigContext.Current.Update(module, info);
            return "Success";
        }

        [HttpPost]
        public string UpdateContent(string module, ViewConfigProcedure info)
        {
            ConfigContext.Current.Update(module, info);
            return "Success";
        }

        [HttpPost]
        public string UpdateWidgets(SnapshotWidgets[] widgets)
        {
            ConfigContext.Current.Update(widgets);
            return "Success";
        }

        public JsonResult GetProc()
        {
            return Json(_tool.GetProc(), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetTable()
        {
            return Json(_tool.GetTables(), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCol(string tableName)
        {
            return Json(_tool.GetColumn(tableName), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetFilterLabels(string module)
        {
            JsonResult result = Json(new object[] { }, JsonRequestBehavior.AllowGet);
            switch (GetEnum.GetEModule(module))
            {
                case EModule.CHART:
                    if (chartConfig != null && chartConfig.GetInfo.Filter != null)
                        result = Json(chartConfig.GetInfo.Filter.Filters.Select(x => x.Label), JsonRequestBehavior.AllowGet);
                    break;

                case EModule.TABLE:
                    if (tableConfig != null && tableConfig.GetInfo.Filter != null)
                        result = Json(tableConfig.GetInfo.Filter.Filters.Select(x => x.Label), JsonRequestBehavior.AllowGet);
                    break;

                case EModule.SNAPSHOT:
                    if (snapshotConfig != null && snapshotConfig.GetInfo.Filter != null)
                        result = Json(snapshotConfig.GetInfo.Filter.Filters.Select(x => x.Label), JsonRequestBehavior.AllowGet);
                    break;
            }
            return result;
        }

        public JsonResult GetFilterInfo(string module)
        {
            JsonResult result = Json(new object[] { }, JsonRequestBehavior.AllowGet);

            switch (GetEnum.GetEModule(module))
            {
                case EModule.CHART:
                    if (chartConfig != null && chartConfig.GetInfo != null)
                        result = Json(chartConfig.GetInfo, JsonRequestBehavior.AllowGet);
                    break;

                case EModule.TABLE:
                    if (tableConfig != null && tableConfig.GetInfo != null)
                        result = Json(tableConfig.GetInfo, JsonRequestBehavior.AllowGet);
                    break;

                case EModule.SNAPSHOT:
                    if (snapshotConfig != null && snapshotConfig.GetInfo.Filter != null)
                        result = Json(snapshotConfig.GetInfo, JsonRequestBehavior.AllowGet);
                    break;
            }
            return result;
        }
    }
}
