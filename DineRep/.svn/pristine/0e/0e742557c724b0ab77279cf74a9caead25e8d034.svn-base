using NextGen.Core.Configuration;
using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Chart;
using Framework.Models.Snapshot;
using Framework.Models.Table;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace NextGen.Core.Data
{
    public abstract class BaseSnapshot : BaseDataLayer
    {
        protected IModuleConfig _config = null;

        public BaseSnapshot(string connString) : base(connString)
        {
            _config = ConfigContext.Current.GetConfig("Snapshot");
        }

        public BaseSnapshot(string connString, string module) : base(connString)
        {
            _config = ConfigContext.Current.GetConfig(module);
        }

        public FilterPanelMenu GetMenu()
        {
            return GetMenu(_config);
        }

        public object GetSingleWidgetDetails(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter)
        {
            var _configwidget = _config.GetInfo.Widgets.Where(x => x.WidgetName == widget.WidgetName).FirstOrDefault();
            if (_configwidget == null)
                return null;

            var param = _config.GetWidgetQuery(filter, customFilter, widget.WidgetName);
            switch (widget.WidgetType)
            {
                #region table
                case EWidgetType.Table:
                    TableInfo table = new TableInfo() { Table = new VTable() };

                    using (IDataReader dr = ExecuteReader(_configwidget.Name, param))
                    {
                        table.Table.Rows = new List<VRow>();
                        while (dr.Read())
                        {
                            VRow vrow = new VRow() { Cells = new List<VCell>() };
                            for (var col = 0; col < dr.FieldCount; col++)
                            {
                                if (_configwidget.IgnoreColumns == null || !_configwidget.IgnoreColumns.Contains(dr.GetName(col)))
                                    vrow.Cells.Add(new VCell() { ColumnName = dr.GetName(col), Text = Convert.ToString(dr[col]) });
                            }
                            table.Table.Rows.Add(vrow);
                        }
                    }
                    return table;

                #endregion

                #region chart
                case EWidgetType.BarChart:
                case EWidgetType.LineChart:
                case EWidgetType.ColumnChart:
                    ChartInfo info = new ChartInfo() { Series = new List<Framework.Models.Chart.ChartSeries>() };

                    using (IDataReader dr = ExecuteReader(_configwidget.Name, param))
                    {
                        if (string.IsNullOrEmpty(_configwidget.SeriesColumn))
                        {
                            info.Series.Add(new Framework.Models.Chart.ChartSeries() { name = string.Empty, data = new List<ChartData>() });
                        }

                        while (dr.Read())
                        {
                            if (!string.IsNullOrEmpty(_configwidget.SeriesColumn))
                            {
                                if (info.Series.Count(x => x.name == dr[_configwidget.SeriesColumn] as string) == 0)
                                    info.Series.Add(new Framework.Models.Chart.ChartSeries() { name = dr[_configwidget.SeriesColumn] as string, data = new List<ChartData>() });

                                var infoseries = info.Series.Where(x => x.name == dr[_configwidget.SeriesColumn] as string).FirstOrDefault();
                                if (infoseries != null)
                                {
                                    double? zvalue = null;
                                    if (!string.IsNullOrEmpty(_configwidget.ZAxisColumn))
                                        zvalue = dr[_configwidget.ZAxisColumn] as double?;
                                    infoseries.data.Add(new ChartData()
                                    {
                                        x = dr[_configwidget.XAxisColumn] as string,
                                        y = dr[_configwidget.YAxisColumn] as double?,
                                        z = zvalue
                                    });
                                }
                            }

                        }
                    }
                    return info;

                #endregion

                #region visualization
                case EWidgetType.Visualization:
                    var vislst = new List<VisualizationWidget>();
                    using (IDataReader dr = ExecuteReader(_configwidget.Name, param))
                    {
                        while (dr.Read())
                        {
                            var vis = new VisualizationWidget();
                            vis.Value1 = _configwidget.Value1 == null ? null : dr[_configwidget.Value1] as string;
                            vis.Value2 = _configwidget.Value2 == null ? null : dr[_configwidget.Value2] as string;
                            vis.Value3 = _configwidget.Value3 == null ? null : dr[_configwidget.Value3] as string;
                            vis.Value4 = _configwidget.Value4 == null ? null : dr[_configwidget.Value4] as string;
                            vis.Value5 = _configwidget.Value5 == null ? null : dr[_configwidget.Value5] as string;
                            vislst.Add(vis);
                        }
                    }
                    return vislst;

                #endregion

                #region default
                default:
                    break;
                    #endregion
            }
            return null;
        }

        public WidgetInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            throw new NotImplementedException();
        }

        public WidgetData GetAllWidgetDetails(WidgetInfo filter, params object[] param)
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

        public IEnumerable<Widgets> GetWidgets(params object[] param)
        {
            using (IDataReader dr = ExecuteReader("", param))
            {
                while (dr.Read())
                {
                    yield return new Widgets()
                    {
                        WidgetId = Convert.ToInt32(dr[""]),
                        WidgetName = dr[""] as string
                    };
                }
            }
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
