using ClosedXML.Excel;
using NextGen.Core.Configuration;
using NextGen.Core.Configuration.Interfaces;
using Framework.Models;
using Framework.Models.Table;
using System;
using System.Linq;
using Framework.Data;
using fd = Framework.Data;

namespace NextGen.Framework.BusinessLayer
{
    public class TableBO : IDisposable
    {
        private readonly fd.ITable table = null;
        protected bool disposed = false;
        protected IModuleConfig config = ConfigContext.Current.GetConfig("table");

        public TableBO() { table = new fd.Table(); }

        public FilterPanelMenu GetMenu() { return table.GetMenu(); }

        public TableInfo GetTable(FilterPanelInfo[] filter, CustomPropertyLabel customFilter)
        {
            return table.GetOutputData(config.GetInfo, config.GetFactQuery(filter, customFilter));
        }

        public void PrepareExcel(TableInfo table, string destinationFile)
        {
            if (table != null && table.Table != null && table.Table.Columns != null && destinationFile != null)
            {
                using (var wb = new XLWorkbook())
                {
                    using (var ws = wb.AddWorksheet("Sheet1"))
                    {
                        int row = 1, col = 0;
                        //header
                        foreach (var dc in table.Table.Columns)
                        {
                            ws.Cell(row, ++col).Value = dc;
                        }

                        //data
                        foreach (var dr in table.Table.Rows)
                        {
                            row++;
                            if (dr != null && dr.Cells != null)
                            {
                                col = 0;
                                foreach (var dc in table.Table.Columns)
                                {
                                    col++;
                                    var data = dr.Cells.Where(x => x.ColumnName == dc).FirstOrDefault();
                                    if (data != null)
                                    {
                                        ws.Cell(row, col).Value = data.Text;
                                    }
                                }
                            }
                        }
                    }
                    wb.SaveAs(destinationFile);
                }
            }
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
            {
                table.Dispose();
            }
        }
    }
}