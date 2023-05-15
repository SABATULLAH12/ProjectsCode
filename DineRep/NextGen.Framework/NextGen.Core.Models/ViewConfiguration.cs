namespace NextGen.Core.Models
{
    public sealed class ViewConfiguration
    {
        public bool IsProcedure { get { return true; } }
        public ViewConfigProcedure Procedure { get; set; }
        //public string Query { get; set; }
        public ViewFilter Filter { get; set; }
        public SnapshotWidgets[] Widgets { get; set; }
    }
}
