using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dine.PPTBuilder
{
    /// <summary>
    /// Summary description for UploadHandler
    /// </summary>
    public class UploadHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
           
            if (context.Request.Files.Count > 0)
            {
                HttpFileCollection UploadedFilesCollection = context.Request.Files;
            
                for (int i = 0; i < UploadedFilesCollection.Count; i++)
                {
                    System.Threading.Thread.Sleep(2000);
                    HttpPostedFile PostedFiles = UploadedFilesCollection[i];
                    string FilePath = context.Server.MapPath("~/PPTBuilder/" + System.IO.Path.GetFileName(PostedFiles.FileName));
                    PostedFiles.SaveAs(FilePath);
                }
            }
        
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}