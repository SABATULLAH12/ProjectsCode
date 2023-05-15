using System.Collections.Generic;

namespace Framework.Models.Report
{
    public class ReportInfo
    {

        public string OutFileName { get; set; }
        public int NoOfEstablishment { get; set; }
    }
    public class ReportTileInfo
    {
        public int SlideNo { get; set; }
        public string SlideName { get; set; }
        public bool IsFixed { get; set; }
        public string ReportName { get; set; }
        public int OrderBy { get; set; }

        public int HeaderCategory { get; set; }
    }

    public class SituationLeftPanelMetrics
    {
        public int MeasureId { get; set; }
        public string MeasureName { get; set; }
        public string MeasureParentName { get; set; }
        public string ParentId { get; set; }
        public int ToolOrderby { get; set; }
    }

    public class SituationList
    {
       public List<SituationAnalysisData> situationAnalysisData { get; set; }
        public List<SituationMainParentList> situationMainParentList { get; set; }
        public List<SituationSubList> situationSubList { get; set; }
    }

    public class SituationMainParentList
    {
        public string MetricParentName { get; set; }
        public string MetricName { get; set; }
        public List<SituationAnalysisData> situationAnalysisData { get; set; }
    }

    public class SituationSubList
    {
        public string MetricName { get; set; }
    }

    public class SituationAnalysisData
    {       
        public string MetricName { get; set; }
        public string MetricParentName { get; set; }
        public string EstablishmentName { get; set; }
        public double? MetricPercentage { get; set; }
        public int? MetricSampleSize { get; set; }
        public string CustomBaseName1 { get; set; }
        public string CustomBaseName2 { get; set; }
        public int? CustomBaseIndex1 { get; set; }
        public int? CustomBaseIndex2 { get; set; }
        public double? Significance1 { get; set; }
        public double? Significance2 { get; set; }
        public double? CB1Percentage { get; set; }
        public double? CB2Percentage { get; set; }
        public bool DefaultMetric { get; set; }
        public double? CompPercentage { get; set; }
        public double? CompSig { get; set; }
        public double? DeviationValue { get; set; }
        public string BICEstablishmentName { get; set; }
        public double? BICGap { get; set; }
        public double? BICRating { get; set; }
        public string GroupName { get; set; }
        public bool IsChannelFlag { get; set; }
        public string SignificanceColorFlag { get; set; }

    }
    public class SituationAnalysisSelectList {
        public bool IsVisits { get; set; }
        public string EstablishmentName { get; set; }
        public string CompareEstablishment { get; set; }
        public string Competitors { get; set; }
        public string Filters { get; set; }
        public string SelectedColorCode { get; set; }
        public string SelectedmeasureId { get; set; }
        public bool IsFrequencyChangedFor_CoreGuest { get; set; }
        public bool IsFrequencyChangedFor_MyTrips { get; set; }
        public bool IsFrequencyChangedFor_LoyltyPyrmd { get; set; }
        public bool IsFrequencyChangedFor_FairShareAnalysis { get; set; }
        public string StickySelectedFreqcyFor_CoreGuest { get; set; }
        public string StickySelectedFreqcyFor_MyTrips { get; set; }
        public string StickySelectedFreqcyFor_LoyltyPyrmd { get; set; }
        public string StickySelectedFreqcyFor_FairShareAnalysis { get; set; }
        public List<string> DemogFixedList { get; set; }
        public List<string> DemogActiveList { get; set; }
        public List<string> TripsFixedList { get; set; }
        public List<string> TripsActiveList { get; set; }
        public List<string> DefaultColorsList { get; set; }
        public List<string> SubMeasureList { get; set; }
        public List<string> DefualtIsVisitGuestList { get; set; }
        public List<string> DefaultFrequencyList { get; set; }
        public List<string> DefaultFrequencyNameList { get; set; }
        public bool IsChannelSelected { get; set; }
        public bool DeleteTripsandGuestsSlide { get; set; }
        public bool IsFromMSS { get; set; }
        public bool IsImageries { get; set; }


    }

    public class MacroDetails
    {
        public string customerName { get; set; }
        public string logoName { get; set; }
        public string SectionName { get; set; }
        public string SectionDesc { get; set; }
        public int SectionId { get; set; }
        public int IsLock { get; set; }
        public bool IsSectionorSubsection { get; set; }
        public int SubsectionId { get; set; }
        public string SubSectionName { get; set; }
        public string SubSectionNamedesc { get; set; }
        public int SectionOrder { get; set; }
        public int SlideCount { get; set; }
        public string Filename { get; set; }
        public int ParentorSubSectId { get; set; }
        public string  ParentorSubSectName { get; set; }
        public string  ParentorSubSectDesc { get; set; }
        public string UploadedBy { get; set; }
        public string UploadedDate { get; set; }
        public bool IsSectLoced { get; set; }
        public string ParentSectName { get; set; }

    }
    public class EstablishmentLogoDetails
    {
        public int EstablishmentId { get; set; }
        public string EstablishmentName { get; set; }
        public string LogoName { get; set; }
    }
  
}
