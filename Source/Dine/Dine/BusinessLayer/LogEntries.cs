using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Framework.Models;
using Dine.Utility;
using System.Web.Mvc;
using System.Web.Security;
using System.Text;
using Framework.Models.Users;

namespace Dine.BusinessLayer
{
    public class LogEntries
    {

        public static bool LogSelection(string Module)
        {
            bool status = false;
            try
            {
                com.aqinsights.coke.User_Management usermanagement = new com.aqinsights.coke.User_Management();
                com.aqinsights.coke.UserParams uparams = new com.aqinsights.coke.UserParams();
                //var currentuser = HttpContext.Current.Session[Constants.Session.ActiveUser] as UserParams;
                var currentuser = HttpContext.Current.Session[Utility.Constants.Session.ActiveUser] as UserDetail;
                uparams.UserID = Convert.ToString(currentuser.Id);
                uparams.UserName = currentuser.Email;
                uparams.Tool = "Dine";
                uparams.Module = Module;
                usermanagement.LogUserData(uparams);
                status = true;
            }
            catch (Exception ex)
            {
            }

            return status;
        }
    }
}