using AqUtility.Cached;
using NextGen.Core.Configuration;
using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Chart;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace NextGen.Core.Data
{
    public abstract class BaseChart: BaseDataLayer
    {
        protected IModuleConfig _config = null;

        public BaseChart(string connString) : base(connString)
        {
            _config = ConfigContext.Current.GetConfig("Chart");
        }

        public BaseChart(string connString, string module) : base(connString)
        {
            _config = ConfigContext.Current.GetConfig(module);
        }

        public FilterPanelMenu GetMenu()
        {
            return base.GetMenu(_config);
        }

        public ChartInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            ChartInfo info = null;
            info = CachedQuery<ChartInfo>.Cache.GetData(config.Procedure.Name + " " + string.Join(",", param));
            if (info != null)
                return info;
            info = new ChartInfo() { Series = new List<ChartSeries>() };

            using (IDataReader dr = ExecuteReader(config.Procedure.Name, param))
            {
                var fp = config.Procedure;
                if (string.IsNullOrEmpty(fp.SeriesColumn))
                {
                    info.Series.Add(new ChartSeries() { name = string.Empty, data = new List<ChartData>() });
                }

                while (dr.Read())
                {
                    if (!string.IsNullOrEmpty(fp.SeriesColumn))
                    {
                        if (info.Series.Count(x => x.name == dr[fp.SeriesColumn] as string) == 0)
                            info.Series.Add(new ChartSeries() { name = dr[fp.SeriesColumn] as string, data = new List<ChartData>() });

                        var infoseries = info.Series.Where(x => x.name == dr[fp.SeriesColumn] as string).FirstOrDefault();
                        if (infoseries != null)
                        {
                            double? zvalue = null;
                            if (!string.IsNullOrEmpty(fp.ZAxisColumn))
                                zvalue = dr[fp.ZAxisColumn] as double?;
                            infoseries.data.Add(new ChartData()
                            {
                                x = dr[fp.XAxisColumn] as string,
                                y = dr[fp.YAxisColumn] as double?,
                                z = zvalue
                            });
                        }
                    }

                }
            }
            CachedQuery<ChartInfo>.Cache.SetData(config.Procedure.Name + " " + string.Join(",", param), info);
            return info;
        }

        public DataSet GetOutputDataTable(params object[] param)
        {
            return ExecuteDataSet(_config.GetInfo.Procedure.Name, param);
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
