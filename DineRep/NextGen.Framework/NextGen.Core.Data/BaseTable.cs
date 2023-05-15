using NextGen.Core.Configuration;
using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Models;
using Framework.Models;
using Framework.Models.Table;
using System;
using System.Collections.Generic;
using System.Data;

namespace NextGen.Core.Data
{
    public abstract class BaseTable : BaseDataLayer
    {
        protected IModuleConfig _config = null;
        
        public BaseTable(string connString) : base(connString)
        {
            _config = ConfigContext.Current.GetConfig("Table");
        }

        public BaseTable(string connString, string module) : base(connString)
        {
            _config = ConfigContext.Current.GetConfig(module);
        }

        public virtual FilterPanelMenu GetMenu()
        {
            return GetMenu(_config);
        }

        public virtual TableInfo GetOutputData(ViewConfiguration config, params object[] param)
        {
            TableInfo table = new TableInfo() { Table = new VTable() };

            using (IDataReader dr = ExecuteReader(_config.GetInfo.Procedure.Name, param))
            {
                table.Table.Rows = new List<VRow>();
                while (dr.Read())
                {
                    VRow vrow = new VRow() { Cells = new List<VCell>() };
                    for (var col = 0; col < dr.FieldCount; col++)
                    {
                        if (config.Procedure.IgnoreColumns == null || !config.Procedure.IgnoreColumns.Contains(dr.GetName(col)))
                            vrow.Cells.Add(new VCell() { ColumnName = dr.GetName(col), Text = Convert.ToString(dr[col]) });
                    }
                    table.Table.Rows.Add(vrow);
                }
            }
            return table;
        }

    }
}