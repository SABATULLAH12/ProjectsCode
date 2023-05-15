using Dine.BusinessLayer;
using Framework.Models;
using Framework.Models.Users;
using Dine.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.Text;
using iSHOP.BLL;

namespace Dine.Controllers
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
       
        public ActionResult Index(FormCollection form)
        {
            Session.Clear();
            FormsAuthentication.SignOut();

            int userid = -1;
            if (form != null && form.Count != 0)
            {
                int.TryParse(Decryptdata(Convert.ToString(form["+CmaFa4aGgddF0vyK2Ke2g=="])), out userid);
                var name = Decryptdata(Convert.ToString(form["5PhYxCnUO4LsMOQJUHA8Rw=="]));
                var username = Decryptdata(Convert.ToString(form["9LmgmAfJY+DEr9wxJ+OTZzDfZIBqTBxOm0OP4PikI0o="]));
                var role = Decryptdata(Convert.ToString(form["Wcnup6sin10Io3eDAYsIIg=="]));
                var emailid = Decryptdata(Convert.ToString(form["JWFvSOya6/sSK3oPY+qVug=="]));

                var B3 = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["mQtWjUtawhO8K+L9D9aPeg=="])));
                var BGM = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["3pLGUhuMy2YfifTBqZdgtg=="])));
                var Bev360Drinks = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["acCQL/tGgywKn6nYVwccpuymQJw6Akbfb9fukTIBHwo="])));
                var Bev360Drinkers = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["acCQL/tGgywKn6nYVwccppbeL0zwlM0Xai5hK72tlCw="])));
                var CBL = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["og1O5t72VJmcTagSmraTzw=="])));
                var CBLV2 = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["/UyziSdF+klY6LYqky6UTg=="])));
                var CREST = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["e/KxbK1pXy9wg1IOerZu1w=="])));
                var DINE = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["lUtCRCcRYf7n0sOWnoxWJQ=="])));
                //var EmailId = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["JWFvSOya6/sSK3oPY+qVug=="]));
                var Groups = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["L9bl70+z8Z66JbssVmkYTw=="]));
                var Login_Flag = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["B4BEOFhH5DF8B+ckC3cV7jjEIC2pxDLzNyB8Of2P5Jc="]));
                //var Name = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["5PhYxCnUO4LsMOQJUHA8Rw=="]));
                //var Role = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["Wcnup6sin10Io3eDAYsIIg=="]));
                //var UserID = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["+CmaFa4aGgddF0vyK2Ke2g=="]));
                //var UserName = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["9LmgmAfJY+DEr9wxJ+OTZzDfZIBqTBxOm0OP4PikI0o="]));
                var Password = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["8MW0Q1QpA8T+89X1efluUhuBaEHH8AL0aKXJu2f0Lyg="]));
                var iSHOP = Convert.ToBoolean(AQ.Security.Cryptography.EncryptionHelper.Decryptdata(Convert.ToString(form["79omsApz674+jfVC7vSFjw=="])));
                      


                UserDetail userinfo = new UserDetail() { Email = emailid, Id = userid, Name = name, Role = role, B3 = B3 , BGM =BGM, Bev360Drinks= Bev360Drinks,
                    CBL = CBL, CBLV2= CBLV2,CREST= CREST, DINE= DINE,Groups= Groups, Login_Flag= Login_Flag, Password= Password,iSHOP= iSHOP
                };
                if (userinfo != null && !string.IsNullOrEmpty(emailid) && userid > 0)
                {
                    //store in session
                    Session[Constants.Session.ActiveUser] = userinfo;
                    Session[Constants.Session.ActiveUserId] = userinfo.Id;
                    Session["Role"] = role;
                    FormsAuthentication.SetAuthCookie(userinfo.Name, true);
                    return Redirect(FormsAuthentication.DefaultUrl);
                }
                else
                {
                    if (System.Configuration.ConfigurationManager.AppSettings["SSOUrl"].ToString() == "true")
                    {
                        HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["SSOLoginPageUrl"].ToString());
                    }
                    else
                    {
                        HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"].ToString() + "Views/Home.aspx");
                    }


                    //if (FormsAuthentication.LoginUrl.Contains("kiexplorer"))
                    //    return Redirect(FormsAuthentication.DefaultUrl);
                    // HttpContext.Response.Redirect(Dine.BusinessLayer.Utils.ReWriteHost(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"]) + "Login.aspx");
                }
            }
            else if (System.Configuration.ConfigurationManager.AppSettings["newQueryString"] == "false")
            {
                int.TryParse(Decryptdata(Convert.ToString(Request.QueryString["VXNlcklE"])), out userid);
                var name = Decryptdata(Convert.ToString(Request.QueryString["TmFtZQ=="]));
                var username = Decryptdata(Convert.ToString(Request.QueryString["VXNlck5hbWU="]));
                var role = Decryptdata(Convert.ToString(Request.QueryString["Um9sZQ=="]));
                var emailid = Decryptdata(Convert.ToString(Request.QueryString["RW1haWxJZA=="]));

                UserDetail userinfo = new UserDetail() { Email = emailid, Id = userid, Name = name, Role = role };
                if (userinfo != null && !string.IsNullOrEmpty(emailid) && userid > 0)
                {
                    //store in session
                    Session[Constants.Session.ActiveUser] = userinfo;
                    Session[Constants.Session.ActiveUserId] = userinfo.Id;
                    Session["Role"] = role;
                    FormsAuthentication.SetAuthCookie(userinfo.Name, true);
                    return Redirect(FormsAuthentication.DefaultUrl);
                }
                else
                {
                    if (System.Configuration.ConfigurationManager.AppSettings["SSOUrl"].ToString() == "true")
                    {
                        HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["SSOLoginPageUrl"].ToString());
                    }
                    else
                    {
                        HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"].ToString() + "Views/Home.aspx");
                    }

                    //if (FormsAuthentication.LoginUrl.Contains("kiexplorer"))
                    //    return Redirect(FormsAuthentication.DefaultUrl);
                    //HttpContext.Response.Redirect(Dine.BusinessLayer.Utils.ReWriteHost(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"]) + "Login.aspx");
                }
            }
            else
            {
                int.TryParse(Decryptdata(Convert.ToString(Request.QueryString[" CmaFa4aGgddF0vyK2Ke2g=="])), out userid);
                var name = Decryptdata(Convert.ToString(Request.QueryString["5PhYxCnUO4LsMOQJUHA8Rw=="]));
                var username = Decryptdata(Convert.ToString(Request.QueryString["9LmgmAfJY DEr9wxJ OTZzDfZIBqTBxOm0OP4PikI0o="]));
                var role = Decryptdata(Convert.ToString(Request.QueryString["Wcnup6sin10Io3eDAYsIIg=="]));
                var emailid = Decryptdata(Convert.ToString(Request.QueryString["JWFvSOya6/sSK3oPY qVug=="]));

                UserDetail userinfo = new UserDetail() { Email = emailid, Id = userid, Name = name, Role = role };
                if (userinfo != null && !string.IsNullOrEmpty(emailid) && userid > 0)
                {
                    //store in session
                    Session[Constants.Session.ActiveUser] = userinfo;
                    Session[Constants.Session.ActiveUserId] = userinfo.Id;
                    Session["Role"] = role;
                    FormsAuthentication.SetAuthCookie(userinfo.Name, true);
                    return Redirect(FormsAuthentication.DefaultUrl);
                }
                else
                {
                    if (System.Configuration.ConfigurationManager.AppSettings["SSOUrl"].ToString() == "true")
                    {
                        HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["SSOLoginPageUrl"].ToString());
                    }
                    else
                    {
                        HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"].ToString() + "Views/Home.aspx");
                    }

                    //if (FormsAuthentication.LoginUrl.Contains("kiexplorer"))
                    //    return Redirect(FormsAuthentication.DefaultUrl);
                    //HttpContext.Response.Redirect(Dine.BusinessLayer.Utils.ReWriteHost(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"]) + "Login.aspx");
                }
            }
            //if (userinfo != null && !string.IsNullOrEmpty(emailid) && userid > 0)
            //{
            //    //store in session
            //    Session[Constants.Session.ActiveUser] = userinfo;
            //    FormsAuthentication.SetAuthCookie(userinfo.Name, true);
            //    return Redirect(FormsAuthentication.DefaultUrl);
            //}
            //else
            //{
            //    //if (FormsAuthentication.LoginUrl.Contains("kiexplorer"))
            //    //    return Redirect(FormsAuthentication.DefaultUrl);
            //    HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"] + "Login.aspx");
            //}

            return View();
        }

        //modified by Nagaraju for redirecting KI Login page
        //Date: 19-07-2017
        public void Logout()
        {
            Session.Clear();
            Session.Abandon();
            FormsAuthentication.SignOut();
            //return RedirectToAction("Index");
            //HttpContext.Response.Redirect(Dine.BusinessLayer.Utils.ReWriteHost(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"]) + "Login.aspx");
            if (System.Configuration.ConfigurationManager.AppSettings["SSOUrl"].ToString() == "true")
            {
                HttpContext.Response.Redirect(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"].ToString() + "Views/Home.aspx?signout=true");
            }
            else
            {
                HttpContext.Response.Redirect(Dine.BusinessLayer.Utils.ReWriteHost(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"]) + "Login.aspx");
            }

        }
        //added by Nagaraju for KI Home page
        //Date: 19-07-2017
        public void Home()
        {
            HttpContext.Response.Redirect(Dine.BusinessLayer.Utils.ReWriteHost(System.Configuration.ConfigurationManager.AppSettings["KIMainlink"]) + "Views/Home.aspx");
        }
        #endregion
        #region httpppost
        [HttpPost]
        public ActionResult Index(LogonUser user,FormCollection form)
        {
            if (ModelState.IsValid)
            {
                //UserDetail userinfo = logon.GetUserInfo(user);
                UserDetail userinfo = new UserDetail() { Email = user.UserName, Id = 1, Name = "User", Role = "user" };
                if (userinfo != null)
                {
                    //store in session
                    Session[Constants.Session.ActiveUser] = userinfo;
                    Session[Constants.Session.ActiveUserId] = userinfo.Id;
                    Session["Role"] = userinfo.Role;
                    FormsAuthentication.SetAuthCookie(userinfo.Name, true);
                    return Redirect(FormsAuthentication.DefaultUrl);
                }
            }
            //if (user != null)
            //    user.Password = null;

            else if (form != null && form.Count > 0)
            {
                return Index(form);
            }
            return View(user);
        }
        #endregion


        private string Decryptdata(string encryptpwd)
        {
            if (System.Configuration.ConfigurationManager.AppSettings["newQueryString"] == "false")
            {
                string decryptpwd = string.Empty;
                if (!string.IsNullOrEmpty(encryptpwd))
                {
                    UTF8Encoding encodepwd = new UTF8Encoding();
                    Decoder Decode = encodepwd.GetDecoder();
                    byte[] todecode_byte = Convert.FromBase64String(encryptpwd.Replace(" ", "+"));
                    int charCount = Decode.GetCharCount(todecode_byte, 0, todecode_byte.Length);
                    char[] decoded_char = new char[charCount];
                    Decode.GetChars(todecode_byte, 0, todecode_byte.Length, decoded_char, 0);
                    decryptpwd = new String(decoded_char);
                }
                return decryptpwd;
            }
            else
            {
                return AQ.Security.Cryptography.EncryptionHelper.Decryptdata(encryptpwd);
            }
        }
     
        [HttpPost]
        public ActionResult ValidateSessionObj()
        {
            var userInfo = HttpContext.Session[Constants.Session.ActiveUser] as UserDetail;
            if (userInfo != null)
                return null;
            else
                return Json(FormsAuthentication.LoginUrl, JsonRequestBehavior.AllowGet);

        }

    }
}
