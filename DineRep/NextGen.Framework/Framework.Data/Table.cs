using NextGen.Core.Data;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Table;
using System.Configuration;

namespace Framework.Data
{
    public class Table : BaseTable, ITable
    {
        public Table() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }

        public Table(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public new virtual FilterPanelMenu GetMenu()
        {
            return base.GetMenu();
        }

        public new virtual TableInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            return base.GetOutputData(config, param);
        }
    }
}
