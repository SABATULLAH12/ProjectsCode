using NextGen.Framework.BusinessLayer;
using Framework.Models;
using Framework.Models.Snapshot;
using Aspose.Slides;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NextGen.Framework.Controllers
{
    public class SnapshotController : BaseController
    {
        private readonly SnapshotBO snapshot = null;
        public SnapshotController() : base("Snapshot") { snapshot = new SnapshotBO(); }

        #region views
        public ActionResult Index()
        {
            return View();
        }
        #endregion

        #region httppost
        /// <summary>
        /// Get single Widget
        /// </summary>
        /// <param name="filter"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetWidgetInfo(FilterPanelInfo[] filter, WidgetInfo widget)
        {
            var custom = new CustomPropertyLabel() { UserType = "Admin", WidgetName = widget.WidgetName };
            return Json(snapshot.GetWidgetData(filter, widget, custom), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get All Widgets together
        /// </summary>
        /// <param name="filter"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetWidgetsInfo(FilterPanelInfo filter)
        {
            return Json(snapshot.GetWidgetsData(filter), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get Widgets
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetWidgets(FilterPanelInfo filter)
        {
            return Json(snapshot.GetWidgets(filter), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public string PreparePowerPoint(ExportDetails details)
        {
            var img = SaveScreenShotImage(System.Web.HttpContext.Current, details.Base64);
            Presentation pres = new Aspose.Slides.Presentation(Server.MapPath("~/Templates/Snapshot_PowerPoint.pptx"));
            ChangeImage(pres, pres.Slides[0], "New picture", img);
            pres.Save(Server.MapPath("~/Temp/" + Session.SessionID + ".pptx"), Aspose.Slides.Export.SaveFormat.Pptx);
            return Session.SessionID;
        }
        #endregion

        #region overide methods
        public override JsonResult GetMenu()
        {
            return Json(snapshot.GetMenu().Filter, JsonRequestBehavior.AllowGet);
        }
        #endregion

        public static void ChangeImage(Aspose.Slides.Presentation pres, Aspose.Slides.ISlide sld, string CurrentImageName, string ReplaceImagePath)
        {
            for (int i = 0; i < sld.Shapes.Count; i++)
            {
                if (sld.Shapes[i] is Shape)
                {
                    Shape shp = (Shape)sld.Shapes[i];
                    string strname = (string)shp.Name;
                    if (strname == CurrentImageName)
                    {
                        Aspose.Slides.IPictureFrame pf = (Aspose.Slides.IPictureFrame)shp;
                        using (System.Drawing.Image img = (System.Drawing.Image)new Bitmap(ReplaceImagePath))
                        {
                            IPPImage imgx = pres.Images.AddImage(img);
                            pf = sld.Shapes.AddPictureFrame(Aspose.Slides.ShapeType.Rectangle, shp.X, shp.Y, shp.Width, shp.Height, imgx);
                            shp.FillFormat.FillType = FillType.NoFill;
                            shp.X = 0;
                            shp.Y = 0;
                            shp.Width = 0;
                            shp.Height = 0;
                            break;
                        }
                    }
                }
            }
        }
    }
}
