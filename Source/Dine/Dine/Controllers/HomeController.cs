using Dine.Utility;
using Framework.Models.Users;
using iSHOP.BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace Dine.Controllers
{
    public class HomeController : BaseController
    {
        public HomeController() : base("Home") { }

        public ActionResult Index(FormCollection form)
        {
            if (form != null && form.Count != 0)
            {
                GetUserForm(form);
            }
            //AuthenticateUser(form);
            return View();
        }
        public void GetUserForm(FormCollection form)
        {
            Session["Form"] = form;
        }
        
        public JsonResult GetKIUserDetails()
        {
            //UserManager usermanager = new UserManager();
            UserDetail user = Session[Utility.Constants.Session.ActiveUser] as UserDetail;
            if (user == null)
                return Json("", JsonRequestBehavior.AllowGet);

            var userDetails = new
            {
                UserID = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Id)),
                UserID_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("UserID")),
                Name = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Name)),
                Name_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Name")),
                UserName = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.UserName)),
                UserName_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("UserName")),
                Role = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Role)),
                Role_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Role")),
                B3 = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.B3)),
                B3_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("B3")),
                CBL = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.CBL)),
                CBL_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("CBL")),
                CBLV2 = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.CBLV2)),
                CBLV2_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("CBLV2")),
                iSHOP = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.iSHOP)),
                iSHOP_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("iSHOP")),
                Bev360Drinks = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Bev360Drinks)),
                Bev360Drinks_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Bev360Drinks")),
                Bev360Drinkers = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Bev360Drinkers)),
                Bev360Drinkers_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Bev360Drinkers")),
                CREST = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.CREST)),
                CREST_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("CREST")),
                DINE = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.DINE)),
                DINE_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("DINE")),
                BGM = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.BGM)),
                BGM_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("BGM")),
                Groups = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Groups)),
                Groups_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Groups")),
                EmailId = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Email)),
                EmailId_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("EmailId")),
                Login_Flag = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Login_Flag)),
                Login_Flag_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Login_Flag")),
                Password = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString(user.Password)),
                Password_Str = AQ.Security.Cryptography.EncryptionHelper.Encryptdata(Convert.ToString("Password"))
            };

            //return userDetails;
            var jsonResult = Json(userDetails, JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = Int32.MaxValue;
            return jsonResult;
        }

        #region overide methods
        public override JsonResult GetMenu()
        {
            throw new NotImplementedException();
        }

        public override JsonResult GetAdvancedFilters(string viewName)
        {
            throw new NotImplementedException();
        }
        #endregion
    }
}
