using System.Collections.Generic;
using System.Collections.Specialized;

namespace Framework.Models.Table
{
    public class VTable
    {
        public IList<VRow> Rows { get; set; }
        private StringCollection _columns = new StringCollection();

        public StringCollection Columns
        {
            get
            {
                if (Rows != null && Rows.Count > 0)
                {
                    for (int i = 0; (i < 20 && i < Rows.Count); i++)
                    {
                        if (Rows[i].Cells != null)
                        {
                            foreach (VCell cell in Rows[i].Cells)
                            {
                                if (!_columns.Contains(cell.ColumnName))
                                    _columns.Add(cell.ColumnName);
                            }
                        }
                    }
                }
                return _columns;
            }
        }
    }

    public class VRow
    {
        public bool IsHeaderRow { get; set; }
        public ICollection<VCell> Cells { get; set; }
    }

    public class VCell
    {
        public string ColumnName { get; set; }
        public string Text { get; set; }
    }
}