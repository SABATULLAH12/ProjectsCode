using System.Collections.Generic;

namespace NextGen.Core.Models
{
    public class ViewConfigProcedure
    {
        #region Procedure
        public string Name { get; set; }
        public ViewConfigProcedureParam[] Parameters { get; set; }
        #endregion

        #region Chart
        public string SeriesColumn { get; set; }
        public string XAxisColumn { get; set; }
        public string YAxisColumn { get; set; }
        public string ZAxisColumn { get; set; }
        #endregion

        #region Table
        public ICollection<string> IgnoreColumns { get; set; }
        #endregion

        #region Custom Visualization
        public string Value1 { get; set; }
        public string Value2 { get; set; }
        public string Value3 { get; set; }
        public string Value4 { get; set; }
        public string Value5 { get; set; }
        #endregion
    }
}
