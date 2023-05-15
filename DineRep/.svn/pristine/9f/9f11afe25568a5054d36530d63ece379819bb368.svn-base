using NextGen.Core.Data;
using System.Collections.Generic;

namespace NextGen.Framework.BusinessLayer
{
    public class ToolConfigBO
    {
        private readonly ToolConfig _datalayer = null;

        public ToolConfigBO()
        {
            _datalayer = new ToolConfig();
        }

        public IEnumerable<string> GetProc()
        {
            return _datalayer.GetProc();
        }

        public IEnumerable<string> GetTables()
        {
            return _datalayer.GetTables();
        }

        public IEnumerable<string> GetColumn(string tableName)
        {
            return _datalayer.GetColumn(tableName);
        }
    }
}