using Framework.Models;
using NextGen.Framework.Utility;
using Aspose.Slides;
using Microsoft.Practices.EnterpriseLibrary.Logging;
using System;
using System.Drawing;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Framework.Models.Users;
using NextGen.Framework.Infrastructure;

namespace NextGen.Framework.Controllers
{
    [ValidateSession]
    public abstract class BaseController : Controller
    {
        #region fields
        protected string controller = string.Empty;
        protected License license = new License();
        #endregion

        #region constructor
        private BaseController() { }
        public BaseController(string controller)
        {
            this.controller = controller;
            license.SetLicense("Aspose.Slides.lic");
        }
        #endregion

        #region abstract methods
        public abstract JsonResult GetMenu();
        #endregion

        #region override
        //protected override void OnActionExecuting(ActionExecutingContext filterContext)
        //{
        //    if (filterContext.HttpContext.Session != null && (filterContext.HttpContext.Session[Constants.Session.ActiveUser] as UserDetail) != null)
        //        base.OnActionExecuting(filterContext);
        //    else
        //        filterContext.Result = Redirect(FormsAuthentication.LoginUrl);
        //}

        protected override void OnException(ExceptionContext filterContext)
        {
            //Logger.Write(filterContext.Exception.StackTrace);
            filterContext.ExceptionHandled = true;
            ViewData["Error"] = filterContext.Exception.StackTrace;
            //base.OnException(filterContext);
            Redirect("/Error");
        }
        #endregion

        protected string SaveScreenShotImage(HttpContext context, string base64)
        {
            if (base64 == null || base64 == string.Empty)
                throw new Exception("Image not captured");

            string filepath = context.Server.MapPath("~/Temp/") + context.Session.SessionID + ".jpg";
            try
            {
                var bytes = Convert.FromBase64String(base64.Replace("data:image/png;base64,", ""));
                using (var imageFile = new FileStream(filepath, FileMode.Create))
                {
                    imageFile.Write(bytes, 0, bytes.Length);
                    imageFile.Flush();
                }

            }
            catch (Exception ex)
            {
                throw new Exception("Unable to prepare image" + ex);
            }
            return filepath;
        }

        public Image LoadImage(string base64)
        {
            byte[] bytes = Convert.FromBase64String(base64.Replace("data:image/png;base64,", ""));

            Image image;
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                image = Image.FromStream(ms);
            }

            return image;
        }

    }
}