using AqUtility.Cached;
using NextGen.Core.Configuration;
using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Chart;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;

namespace Framework.Data
{
    public class Chart : BaseChart, IChart
    {
        public Chart() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }

        public Chart(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public new virtual FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new virtual ChartInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            return base.GetOutputData(config, param);
        }

        public new virtual DataSet GetOutputDataTable(params object[] param)
        {
            return base.GetOutputDataTable(param);
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
