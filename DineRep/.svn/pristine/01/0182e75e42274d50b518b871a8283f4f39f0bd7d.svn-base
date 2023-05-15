using System.Collections.Generic;
using System.Configuration;
using System.Data;

namespace NextGen.Core.Data
{
    public class ToolConfig : BaseDataLayer
    {

        public ToolConfig() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {

        }

        public IEnumerable<string> GetProc()
        {
            using (IDataReader dr = ExecuteQueryReader("SELECT name FROM SYS.OBJECTS WHERE type_desc='SQL_STORED_PROCEDURE' ORDER BY name"))
            {
                while (dr.Read())
                    yield return dr["name"] as string;
            }
        }

        public IEnumerable<string> GetTables()
        {
            using (IDataReader dr = ExecuteQueryReader("SELECT name FROM SYS.OBJECTS where type_desc in ('USER_TABLE', 'VIEW') ORDER BY name"))
            {
                while (dr.Read())
                    yield return dr["name"] as string;
            }
        }

        public IEnumerable<string> GetColumn(string tableName)
        {

            using (IDataReader dr = ExecuteQueryReader("SELECT COLUMN_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS where table_name='" + tableName + "'"))
            {
                while (dr.Read())
                    yield return dr["COLUMN_NAME"] as string;
            }
        }
    }
}
