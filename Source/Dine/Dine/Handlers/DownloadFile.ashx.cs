using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace Dine.Handlers
{
    /// <summary>
    /// Summary description for DownloadFile
    /// </summary>
    public class DownloadFile : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string file = string.Empty;
            var module = context.Request.QueryString["module"];
            switch (Convert.ToString(module).ToLower())
            {
                case "table":
                    file = "~/Temp/" + context.Request.QueryString["file"] + ".xlsx";
                    DownloadExcel(file, context);
                    break;

                case "report":
                    file = "~/Templates/" + context.Request.QueryString["file"] + ".pptx";
                    DownloadPPT(context, file, module);
                    break;

                default:
                    file = "~/Temp/" + context.Request.QueryString["file"] + ".pptx";
                    DownloadPPT(context, file, module);
                    break;
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        private void DownloadPPT(HttpContext context, string file, string module)
        {
            try
            {
                HttpContext.Current.Response.Clear();
                HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename= " + module + " " + DateTime.Now.ToString("MMddyyHmmss") + ".pptx");
                HttpContext.Current.Response.ContentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                HttpContext.Current.Response.TransmitFile(context.Server.MapPath(file));
                HttpContext.Current.Response.Flush();
                HttpContext.Current.Response.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex.InnerException);
            }
            finally
            {
                if (Directory.Exists(context.Server.MapPath(file)))
                    Directory.Delete(context.Server.MapPath(file), true);
            }
        }

        private void DownloadExcel(string filename, HttpContext context)
        {
            var filepath = context.Server.MapPath(filename);
            if (!File.Exists(filepath))
                context.Response.End();

            try
            {
                HttpContext.Current.Response.Clear();
                HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=Table " + DateTime.Now.ToString("MMddyyHmmss") + ".xlsx");
                HttpContext.Current.Response.ContentType = "application/vnd.openxmlformats - officedocument.spreadsheetml.sheet";
                HttpContext.Current.Response.TransmitFile(filepath);
                HttpContext.Current.Response.Flush();
                HttpContext.Current.Response.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (Directory.Exists(filepath))
                    Directory.Delete(filepath, true);
            }
        }
    }
}