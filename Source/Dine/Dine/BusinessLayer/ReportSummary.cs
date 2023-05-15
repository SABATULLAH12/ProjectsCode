using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using Framework.Models;
using System.Threading.Tasks;
using Framework.Models.Report;

namespace Dine.BusinessLayer
{
    public class ReportSummary : Interface.IReport
    {
        public IEnumerable<LowSampleSizeEstList> GetValidEstablishmentList(FilterPanelInfo[] filter, string module)
        {
            throw new NotImplementedException();
        }

        public string PrepareReport(string sourceTemplatePath, FilterPanelInfo[] filter, string module,string selectedDemofiltersList, HttpContextBase context,List<ColorCodeData> colorCodeList, string userId)
        {
            var destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            //prepare report summary ppt
            return destinationtemplate;
        }

        public async Task<string> PrepareSARReport(string filepath, FilterPanelInfo[] filter, List<string> spNames, HttpContextBase context, string userId, List<SituationAnalysisSelectList> selectionList)
        {
            string destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            //destinationtemplate;
            //prepare report summary ppt
            return destinationtemplate;
        }
        public string PrepareInsightsReport(List<MacroDetails> pptList ,string filepath,HttpContextBase context)
        {
            string destinationtemplate = "~/Temp/ExportedReportPPT" + context.Session.SessionID + ".pptx";
            //destinationtemplate;
            //prepare report summary ppt
            return destinationtemplate;
        }
    }
}