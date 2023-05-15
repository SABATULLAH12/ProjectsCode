using NextGen.Framework.BusinessLayer;
using Framework.Models;
using Framework.Models.Users;
using NextGen.Framework.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace NextGen.Framework.Controllers
{
    [AllowAnonymous]
    public class LogonController : Controller
    {
        private UserBO logon = null;

        public LogonController()
        {
            logon = new UserBO();
        }

        #region views
        public ActionResult Index()
        {
            Session.Clear();
            FormsAuthentication.SignOut();
            return View();
        }

        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            FormsAuthentication.SignOut();
            return RedirectToAction("Index");
        }

        #endregion

        #region httpppost
        [HttpPost]
        public ActionResult Index(LogonUser user)
        {
            if (ModelState.IsValid)
            {
                UserDetail userinfo = logon.GetUserInfo(user);
                if (userinfo != null)
                {
                    //store in session
                    Session[Constants.Session.ActiveUser] = userinfo;
                    FormsAuthentication.SetAuthCookie(userinfo.Name, true);
                    return Redirect(FormsAuthentication.DefaultUrl);
                }
            }
            if (user != null)
                user.Password = null;
            return View(user);
        }
        #endregion

    }
}
