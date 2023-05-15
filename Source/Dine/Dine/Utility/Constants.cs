
using Svg;
using System.Drawing.Imaging;
using System.IO;
using System.Web;

namespace Dine.Utility
{
    public class Constants
    {
        #region session
        public class Session
        {
            public const string ActiveUser = "ActiveUser";
            public const string ActiveUserId = "ActiveUserName";

            public bool B3;
            public bool Bev360Drinkers;
            public bool Bev360Drinks;
            public bool BGM;
            public bool CBL;
            public bool CBLV2;
            public bool CREST;
            public bool DINE;
            public bool iSHOP;
            public string UserID;
            public string EmailId { get; set; }
            public string Groups { get; set; }
            public string Login_Flag { get; set; }
            public string Name { get; set; }
            public string Password { get; set; }
            public string Role { get; set; }
            public string UserName { get; set; }
        }
        #endregion

        #region fields
        public const string ToolTitlePrefix = "Dine :: ";
        #endregion

        #region color for Channel Visit
        public class colorChannelVisit {
            public string Core_QSR { get; set; }
            public string Fast_Casual { get; set; }
            public string Casual_Dining { get; set; }
            public string Midscale { get; set; }
            public string Fine_Dining { get; set; }
            public string Retail { get; set; }
        }
        #endregion color for Channel Visit
        public static void ConvertImagesTo(string dirName, ImageFormat imgType, HttpContextBase context, string target)
        {
            foreach (string file in Directory.EnumerateFiles(dirName, "*.svg"))
            {
                changeImageTo(file, context, target, imgType);
            }
        }
        public static void changeImageTo(string loc, HttpContextBase context, string subPath, ImageFormat fmt)
        {
            string pathToSvg = loc;// context.Server.MapPath(loc);
            //Create a directory            
            bool exists = System.IO.Directory.Exists(subPath);//context.Server.MapPath(subPath)
            if (!exists)
                System.IO.Directory.CreateDirectory(subPath);
            var tempFName = loc.Split('\\');
            string t_file_name = tempFName[tempFName.Length - 1].Split('.')[0];
            string tempPath = subPath + "/" + t_file_name + "." + fmt.ToString();// context.Server.MapPath(subPath + "/" + loc + "." + fmt.ToString());
            if (System.IO.File.Exists(pathToSvg))
            {
                var xyz = SvgDocument.Open(pathToSvg);
                if (File.Exists(tempPath))
                {
                    File.Delete(tempPath);
                }
                xyz.Height = 4 * xyz.Bounds.Height;
                xyz.Width = 4 * xyz.Bounds.Width;
                xyz.Draw().Save(tempPath, fmt);
            }
        }
    }
}