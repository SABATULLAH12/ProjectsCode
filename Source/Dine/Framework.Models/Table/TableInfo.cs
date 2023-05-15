using System.Collections.Generic;

namespace Framework.Models.Table
{
    public class TableInfo
    {
        public VTable Table { get; set; }

        public GetTableDataResponse GetTableDataResopnse { get; set; }

        public IList<string> Columns { get; set; }

        public TableInfo()
        {
            Columns = new List<string>();
        }
    }

    public class ExcelInfo
    {
        public GetTableDataResponse GetTableDataResopnse { get; set; }
    }
}