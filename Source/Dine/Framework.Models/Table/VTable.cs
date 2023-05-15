using System.Collections.Generic;
using System.Collections.Specialized;
using Framework.Models.Utility;
using System;
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
                                if (!_columns.Contains(cell.ColName))
                                    _columns.Add(cell.ColName);
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
        public string ColName { get; set; }
        public string Text { get; set; }
        public string ColumnName { get; set; }
        
    }

    #region For Excel Download
    public class DemoExtbFilterList
    {
        public string MetricName { get; set; }
        public string DemoFilterName { get; set; }
    }

    public class SampleSizeList
    {
        public string DemoFilterName { get; set; }
        public string EstablishmentName { get; set; }
        public int? MetricSampleSize { get; set; }
    }
    public class MainData
    {
        public List<SubList> mainList { get; set; }
    }
    public class SubList
    {
        public GetTableDataRespList subList { get; set; }
    }

    #endregion 
    public class GetTableDataResponse
    {
        public List<GetTableDataRespList> GetTableDataRespDt { get; set; }
    }
    public class GetTableDataRespList
    {
        public string MetricName { get; set; }
        public string EstablishmentName { get; set; }
        public string DemoFilterName { get; set; }
        public double? MetricValue { get; set; }
        public int? SampleSize { get; set; }
        //public string StatValue { get; set; }
        public double? StatSamplesize { get; set; }
        //Sum of all the child sample size
        public int? MetricSampleSize { get; set; }
        //public double? StatValue
        //{
        //    get
        //    {
        //        return Calculation.GetStatValue(SampleSize, MetricValue, BenchMarkSampleSize, BenchMarkPercentage);
        //    }
        //}

            public double? StatValue
        {
            get; set;
        }

        public int? BenchMarkSampleSize { get; set; }
        public double? BenchMarkPercentage { get; set; }

        public string name { get; set; }
    }




}