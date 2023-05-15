using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NextGen.Framework.Controllers
{
    public class HomeController : BaseController
    {
        public HomeController() : base("Home") { }

        public ActionResult Index()
        {
            return View();
        }

        #region overide methods
        public override JsonResult GetMenu()
        {
            throw new NotImplementedException();
        }
        #endregion
    }
}
