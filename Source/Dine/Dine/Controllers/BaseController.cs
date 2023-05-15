using Framework.Models;
using Aspose.Slides;
using System;
using System.Drawing;
using System.IO;
using System.Web;
using System.Web.SessionState;
using System.Web.Mvc;
using Dine.Infrastructure;
using System.Collections.Generic;

namespace Dine.Controllers
{
    [ValidateSession] [SessionState(SessionStateBehavior.ReadOnly)]
    public abstract class BaseController : Controller
    {
        #region fields
        protected string controller = string.Empty;
        protected License license = null;
        #endregion

        #region constructor
        private BaseController() { license = new License(); }
        public BaseController(string controller)
        {
            if (license == null)
                license = new License();
            this.controller = controller;
            license.SetLicense(System.Web.HttpContext.Current.Server.MapPath("~/Aspose.Slides.lic"));
        }
        #endregion

        #region abstract methods
        public abstract JsonResult GetMenu();
        public abstract JsonResult GetAdvancedFilters(string id);
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
            Log.LogException(filterContext.Exception);
            //base.OnException(filterContext);
            //Redirect("/Error");
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