using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web;
using Aq.Plugin.AsposeExport;
using Aq.Plugin.AsposeExport.Domain;
using Aspose.Slides.Charts;
using Framework.Models;
using NextGen.Core.Configuration;
using Framework.Models.Chart;
using fd = Framework.Data;
using NextGen.Core.Configuration.Interfaces;

namespace NextGen.Framework.BusinessLayer
{
    public class ChartBO : IDisposable
    {
        private readonly fd.IChart chart = null;
        protected bool disposed = false;
        private IModuleConfig config = null;

        public ChartBO()
        {
            chart = new fd.Chart();
            config = ConfigContext.Current.GetConfig("chart");
        }

        public ChartBO(string controllerName)
        {
            config = ConfigContext.Current.GetConfig(controllerName);
            chart = new fd.Chart(controllerName);
        }

        public FilterPanelMenu GetMenu() { return chart.GetMenu(); }

        public ChartInfo GetChart(FilterPanelInfo[] filter, CustomPropertyLabel customFilter)
        {
            return chart.GetOutputData(config.GetInfo, config.GetFactQuery(filter, customFilter));
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;
            if (disposing)
                chart.Dispose();
            disposed = true;
        }

        public void PreparePowerPoint(string destinationPath, string sourcePath, string destinationVirtualPath, ExportDetails filter, CustomPropertyLabel customFilter)
        {
            if (File.Exists(sourcePath))
            {
                DataSet ds = chart.GetOutputDataTable(ConfigContext.Current.GetConfig("chart").GetFactQuery(filter.Filter, customFilter));
                if (ds != null && ds.Tables.Count > 0)
                {
                    File.Copy(sourcePath, destinationPath, true);
                    ChartType charttype;
                    switch (Convert.ToString(filter.ChartType).ToLower())
                    {
                        case "bar":
                            charttype = ChartType.ClusteredBar;
                            break;
                        case "column":
                            charttype = ChartType.ClusteredColumn;
                            break;
                        case "pie":
                            charttype = ChartType.Pie;
                            break;
                        case "trend":
                            charttype = ChartType.Line;
                            break;
                        default:
                            charttype = ChartType.StackedBar;
                            break;
                    }

                    var config = ConfigContext.Current.GetConfig("chart");
                    var chartData = new ChartDetail()
                    {
                        Data = ds.Tables[0],
                        XAxisColumnName = config.GetInfo.Procedure.XAxisColumn,
                        YAxisColumnName = config.GetInfo.Procedure.YAxisColumn,
                        SeriesColumnName = config.GetInfo.Procedure.SeriesColumn,
                        ElementID = "Chart 5",
                        Type = charttype
                    };

                    var slides = new List<SlideDetail>();
                    PowerpointReplace ppt = new PowerpointReplace();

                    slides.Add(new SlideDetail() { Charts = new List<ChartDetail>() { chartData }, SlideNo = 1 });
                    ppt.UpdateReport(destinationVirtualPath, slides, HttpContext.Current, null);
                }
            }
        }
    }
}