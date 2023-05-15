using Framework.Models;
using Framework.Models.Report;
using NextGen.Core.Models;
using System.Collections.Generic;
using System.Data;
using System;

namespace Framework.Data
{
    public interface IReport : IDataAccess<FilterPanelMenu, ReportInfo>
    {
        DataSet GetOutputDataTable(params object[] param);
        DataSet GetDataTable(FilterPanelInfo[] filter, DataTable additionalFilter, string module, List<ColorCodeData> colorCodeList, string userId);
        DataTable GetValidEstablishmentList(FilterPanelInfo[] filter, DataTable additionalFilter, string module);
        DataTable GetValidEstablishmentListWithStat(FilterPanelInfo[] filter, DataTable additionalFilter, string module);
        DataSet GetDataTableWithFrequency(FilterPanelInfo[] filter, DataTable additionalFilter, string module, List<ColorCodeData> colorCodeList, string userId);

        ReportInfo GetOutputData(ViewConfiguration config, FilterPanelInfo[] filter, DataTable additionalFilter, string module,string timePeriodType);

        IEnumerable<AdvancedFilterData> GetAdvanceFilterData(int bitData);

        List<SituationLeftPanelMetrics> GetSituationLeftPanelMetrics();
        List<SituationAnalysisData> GetTableOutput(FilterPanelInfo[] filter, string spName);
        List<SituationLeftPanelMetrics> GetCompetitorsList(string selectedBenchMarkId);
        IEnumerable<AdvancedFilterData> GetAdvanceFilterData();
        Int32 SaveChangedColorCodeForSAR(System.Data.DataTable changedColorCodeList);
        //List<SituationAnalysisData> PrepareSARReport(FilterPanelInfo[] filter, List<string> spNames);
        string CreateSection(System.Data.DataTable sectionList);
        
        string DeleteSectionOrSubsection(System.Data.DataTable sectionList);
        string SubmitSectionOrder(System.Data.DataTable sectionList);
        string UploadFile(System.Data.DataTable sectionList);
        
        string UploadOverwriteFile(List<MacroDetails> sectionList,string username);
        string OverwriteSection(List<MacroDetails> sectionList, string username);
        string EditSection(MacroDetails obj);
        string LockSection(MacroDetails obj);
        string EditSubSection(MacroDetails obj);
        List<MacroDetails> GetSectionNameDropDwnList();
        List<MacroDetails> GetSubSectionName();
        List<MacroDetails> GetModifySectnsData();
        List<EstablishmentLogoDetails> GetEstablishmentLogoData();
    }
}
