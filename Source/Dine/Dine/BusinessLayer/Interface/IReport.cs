using Framework.Models;
using System.Web;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using Framework.Models.Report;

namespace Dine.BusinessLayer.Interface
{
    interface IReport
    {
        string PrepareReport(string sourceTemplatePath, FilterPanelInfo[] filter, string module,string selectedDemofiltersList, HttpContextBase context,List<ColorCodeData> colorCodeList,string userId);
         IEnumerable<LowSampleSizeEstList> GetValidEstablishmentList(FilterPanelInfo[] filter, string module);

        //string  PrepareSARReport(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId,List<SituationAnalysisSelectList> selectionList);
        Task<string> PrepareSARReport(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId,List<SituationAnalysisSelectList> selectionList);
        string PrepareInsightsReport(List<MacroDetails> pptList, string filepath, HttpContextBase context);

    }
}
