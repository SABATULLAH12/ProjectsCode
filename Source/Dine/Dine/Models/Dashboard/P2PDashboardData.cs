using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dine.Models.Dashboard
{
    public class P2PDashboardData
    {
        public List<IndividualData> OutputData { get; set; }
        public int NoOfRoads { get; set; }
        public List<changedData> changedData { get; set; }
        public string LeftpanelData { get; set; }
        public string statTest { get; set; }
        public string pptOrPdf { get; set; }
        public int ss { get; set; }
        public string guestOrVisit { get; set; }
        public string freq { get; set; }
        public bool isSize { get; set; }
        public string isSampleSize { get; set; }
        public string CustomBaseData { get; set; }
        public string SelctedFiltersOnly { get; set; }
        public string TimePeriod { get; set;}
        public string AdvnceFltrCustomBase { get; set; }

    }
    public class changedData {
        public string name { get; set; }
        public string value { get; set; }
    }
    public class IndividualData {
        public double Change { get; set; }
        public string DemofilterName { get; set; }
        public string EstType { get; set; }
        public string EstablishmentName { get; set; }
        public string MetricName { get; set; }
        public double MetricValue { get; set; }
        public string Month_Year { get; set; }
        public double Significancevalue { get; set; }
        public int TotalSamplesize { get; set; }
        public double Skew { get; set; }
        public int Flag { get; set; }
        public int StatSampleSize { get; set; }
    }
    public class P2PPopupDashboardData
    {
        public List<IndividualData> OutputData { get; set; }
        public string LeftpanelData { get; set; }
        public string statTest { get; set; }
        public string pptOrPdf { get; set; }
        public string DemofilterName { get; set; }
        public string DemoTitle { get; set; }
        public int ss { get; set; }
        public  bool isSize { get; set; }
        public string freq { get; set; }
        public string CustomBaseData { get; set; }
        public string SelctedFiltersOnly { get; set; }
        public string TimePeriod { get; set; }

        public string AdvnceFltrCustomBase { get; set; }

    }
}