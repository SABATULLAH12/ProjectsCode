using NextGen.Core.Configuration;
using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Snapshot;
using System;
using System.Configuration;
using System.Data;
using System.Linq;

namespace Framework.Data
{
    public class Snapshot : BaseSnapshot, ISnapshot
    {
        public Snapshot() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        { }

        public Snapshot(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        { }

        public new FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new WidgetData GetSingleWidgetDetails(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter)
        {
            WidgetData data = new WidgetData();
            var _configwidget = _config.GetInfo.Widgets.Where(x => x.WidgetName == widget.WidgetName).FirstOrDefault();
            if (_configwidget == null)
                return data;

            var param = _config.GetWidgetQuery(filter, customFilter, widget.WidgetName);
            switch (widget.WidgetType)
            {
                #region custom widgets

                #endregion

                #region default
                default:
                    data.Data = GetSingleWidgetDetails(filter, widget, customFilter);
                    break;
                #endregion
            }

            return data;
        }

        public new WidgetInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            throw new NotImplementedException();
        }

        public new WidgetData GetAllWidgetDetails(WidgetInfo filter, params object[] param)
        {
            WidgetData widgets = null;
            using (IDataReader dr = ExecuteReader("", param))
            {
                while (dr.Read())
                {
                    //based on switch case fill the data
                    //switch (filter.)
                    //{
                    //    case "":
                    //        break;

                    //    case "":
                    //        break;

                    //    case "":
                    //        break;

                    //    default:
                    //        widget = new WidgetsInfo()
                    //        {
                    //        };
                    //        break;
                    //}
                }
            }

            return widgets;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                cmd.Dispose();
            }
            disposed = true;
        }

    }
}
