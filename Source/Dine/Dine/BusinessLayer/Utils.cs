using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dine.BusinessLayer
{
    public class Utils
    {
        public static string FileNamingConventn(string filename)
        {
            string fileNamingConventn = "";
            fileNamingConventn = "DINE " + filename + "_" + System.DateTime.Now.DayOfWeek.ToString().Substring(0, 3) + " " + System.DateTime.Now.ToString("MMMM").Substring(0, 3) + " " + System.DateTime.Today.Day + " " + System.DateTime.Today.Year + "" + "_" + DateTime.Now.Hour + "" + DateTime.Now.Minute + "" + DateTime.Now.Second;
            return fileNamingConventn;
        }
        public static string ReWriteHost(string _url)
        {
            return _url.ToLower().Replace("{host}", HttpContext.Current.Request.Url.Host);
        }
        public static bool isPPT_Installed() {
            Type officeType = Type.GetTypeFromProgID("Powerpoint.Application");

            if (officeType == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        public static string getUniqueConst()
        {
            return (DateTime.Now.Ticks.ToString());
        }

    }
}