using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web;
using Aq.Plugin.AsposeExport;
using Aq.Plugin.AsposeExport.Domain;
using Aspose.Slides.Charts;
using Framework.Models;
using Framework.Models.Utility;
using NextGen.Core.Configuration;
using Framework.Models.Report;
using fd = Framework.Data;
using NextGen.Core.Configuration.Interfaces;
using System.Linq;

namespace Dine.BusinessLayer
{
    public class ReportBO : IDisposable
    {
        private readonly fd.IReport report = null;
        protected bool disposed = false;
        protected IModuleConfig config = null;
        public int? sectionId=null;
        public int? subsectionId = null;
        public ReportBO()
        {
            config = ConfigContext.Current.GetConfig("report");
            report = new fd.Report();
        }

        public ReportBO(string controllerName)
        {
            config = ConfigContext.Current.GetConfig(controllerName);
            report = new fd.Report(controllerName);
        }

        public FilterPanelMenu GetMenu() { return report.GetMenu(); }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;
            if (disposing)
                report.Dispose();
            disposed = true;
        }

        public List<SituationLeftPanelMetrics> GetSituationLeftPanelMetrics()
        {
          return report.GetSituationLeftPanelMetrics();
        }

        public List<SituationMainParentList> GetTableOutput(FilterPanelInfo[] filter,string spName)
        {                          
            var situationList = report.GetTableOutput(filter, spName);
            var parentlist = new List<SituationMainParentList>();
            var parentlist1 = new SituationMainParentList();
            if (spName == "USP_SituationAssesmentReport_FairShair_EstablishmentImegeries" || spName == "USP_SituationAssesmentReport_FairShair_Perceptions" || spName == "USP_SituationAssesmentReport_FairShair_StrengthOppurtunites"
            )
            {
                parentlist = (from li in situationList
                              select new SituationMainParentList()
                              {
                                  MetricName = li.MetricName
                              }).Distinct().ToList().GroupBy(li => li.MetricName).Select(g => g.FirstOrDefault()).ToList();
                foreach (var item in parentlist)
                {
                    item.situationAnalysisData = (from li in situationList
                                                  where item.MetricName == li.MetricName
                                                  select li).ToList();//.GroupBy(li => li.EstablishmentName).Select(g => g.FirstOrDefault()).ToList(); ;

                }

            }
            else if (spName == "USP_SituationAssesmentReport_FairShair_BestInClass")
            {
                parentlist = (from li in situationList
                              select new SituationMainParentList()
                              {
                                  MetricParentName = li.GroupName
                              }).Distinct().ToList().GroupBy(li => li.MetricParentName).Select(g => g.FirstOrDefault()).ToList();
                foreach (var item in parentlist)
                {
                    item.situationAnalysisData = (from li in situationList
                                                  where item.MetricParentName == li.GroupName
                                                  select li).ToList().GroupBy(li => li.MetricName).Select(g => g.FirstOrDefault()).ToList(); ;

                }
            }
            else
            {
                parentlist = (from li in situationList
                              select new SituationMainParentList()
                              {
                                  MetricParentName = li.MetricParentName
                              }).Distinct().ToList().GroupBy(li => li.MetricParentName).Select(g => g.FirstOrDefault()).ToList();

                foreach (var item in parentlist)
                {
                    item.situationAnalysisData = (from li in situationList
                                                  where item.MetricParentName == li.MetricParentName
                                                  select li).ToList().GroupBy(li => li.MetricName).Select(g => g.FirstOrDefault()).ToList(); ;
                }
            }     
            return parentlist;
        }

        public List<SituationLeftPanelMetrics> GetCompetitorsList(string selectedBenchMarkId)
        {
            var situationList = report.GetCompetitorsList(selectedBenchMarkId);
            return situationList;
        }

        public IEnumerable<AdvancedFilterData> GetAdvancedFilter()
        {
            return report.GetAdvanceFilterData();
        }

        //public string PrepareSARReport(string filepath,FilterPanelInfo[] filter, List<string> spNames)
        //{
        //    string path = string.Empty;

        //    foreach(var spName in spNames)
        //    {
        //        var situationList = report.PrepareSARReport(filter, spName);
        //    }
        //    return path;
        //}
        public void SaveChangedColorCodeForSAR(List<ColorCodeData> codelist, string UserId)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "UserId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "ColourCode" });
            dt.Columns.Add(new DataColumn() { ColumnName = "EstablishmentorBeverageId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "MeasureId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "GroupsId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "IsTrend" });

            if (codelist != null)
            {
                for (int i = 0; i < codelist.Count; i++)
                {
                    ColorCodeData cd = codelist[i];
                    dt.Rows.Add(UserId, cd.ColourCode, cd.Establishmentid, cd.MeasureId, cd.GroupsId, cd.IsTrend);
                }
            }
            report.SaveChangedColorCodeForSAR(dt);
        }
        public string CreateSection(List<MacroDetails> macroDetails, string userName)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "SectionName" });
            dt.Columns.Add(new DataColumn() { ColumnName = "SectionDescription" });
            dt.Columns.Add(new DataColumn() { ColumnName = "CreatedBy" });
            if (macroDetails != null)
            {
                for (int i = 0; i < macroDetails.Count; i++)
                {
                    MacroDetails  d = macroDetails[i];
                    if (d.SectionDesc == null)
                    {
                        d.SectionDesc = " ";
                    }
                    dt.Rows.Add(d.SectionName.ToString(),d.SectionDesc.ToString(),userName.ToString());
                }
            }

           string result= report.CreateSection(dt);
            return result;
        }
        public string OverwriteSection(List<MacroDetails> macroDetails, string userName)
        {

            if (macroDetails[0].SectionDesc==null)
            {
                macroDetails[0].SectionDesc = " ";
            }
            string result = report.OverwriteSection(macroDetails, userName);
            return result;
        }

        public string SubmitSectionOrder(List<MacroDetails> macroDetails)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "SectionId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "SubSectionId" });
           
            if (macroDetails != null)
            {
                for (int i = 0; i < macroDetails.Count; i++)
                {
                    MacroDetails d = macroDetails[i];
                    if (d.SubsectionId != 0)
                        subsectionId = d.SubsectionId;

                    dt.Rows.Add(Convert.ToInt16(d.SectionId),subsectionId);
                }
            }

            string result = report.SubmitSectionOrder(dt);
            return result;
        }
     
        public string DeleteSectionOrSubsection(List<MacroDetails> macroDetails)
        {
          
        System.Data.DataTable dt = new System.Data.DataTable();
            
            dt.Columns.Add(new DataColumn() { ColumnName = "SectionId" });
            dt.Columns.Add(new DataColumn() { ColumnName = "SubSectionId" });
            if (macroDetails != null)
            {
                for (int i = 0; i < macroDetails.Count; i++)
                {
                    MacroDetails d = macroDetails[i];
                    if(d.SectionId!=0)
                        sectionId = d.SectionId;
                    dt.Rows.Add(Convert.ToInt16(d.SectionId), Convert.ToInt16(d.SubsectionId));
                }
            }

            string result = report.DeleteSectionOrSubsection(dt);
            return result;
        }
        
        public string UploadFile(List<MacroDetails> macroDetails, string userName)
        {
            System.Data.DataTable dt = new System.Data.DataTable();
            dt.Columns.Add(new DataColumn() { ColumnName = "SubSectionName" });
            dt.Columns.Add(new DataColumn() { ColumnName = "SubSectionDescription"});
            dt.Columns.Add(new DataColumn() { ColumnName = "UploadedBy" });
            dt.Columns.Add(new DataColumn() { ColumnName = "SlideCount" });
            dt.Columns.Add(new DataColumn() { ColumnName = "SectionId" });
          
            if (macroDetails != null)
            {
                for (int i = 0; i < macroDetails.Count; i++)
                {
                    MacroDetails d = macroDetails[i];
                    if(d.SubSectionNamedesc==null)
                    {
                        d.SubSectionNamedesc = " ";
                    }
                    dt.Rows.Add(d.SubSectionName.ToString(), d.SubSectionNamedesc.ToString(), userName.ToString(),Convert.ToInt16(d.SlideCount),Convert.ToInt16(d.SectionId));
                }
            }

            string result = report.UploadFile(dt);
            return result;
        }
        public string UploadOverwriteFile(List<MacroDetails> macroDetails, string userName)
        {
            if(macroDetails[0].SubSectionNamedesc==null)
            {
                macroDetails[0].SubSectionNamedesc = " ";
            }

            string result = report.UploadOverwriteFile(macroDetails,userName);
            return result;
        }
        public List<MacroDetails> GetSectionNameDropDwnList()
        {
            var macrosectionNamesList = report.GetSectionNameDropDwnList();
            return macrosectionNamesList;
        }
        public string EditSection(List<MacroDetails> obj)
        {
            if (obj != null)
            {


                MacroDetails sec = obj[0];
                var result = report.EditSection(sec);
                return result;

            }
            return "";


        }
        public string LockSection(List<MacroDetails> obj)
        {
            if (obj != null)
            {
               
                
                    MacroDetails sec = obj[0];
                    var result = report.LockSection(sec);
                return result;
                
            }
            return "";
            
          
        }
        public string EditSubSection(List<MacroDetails> obj)
        {
            if (obj != null)
            {


                MacroDetails sec = obj[0];
                var result = report.EditSubSection(sec);
                return result;

            }
            return "";


        }
        public List<MacroDetails> GetSubSectionName()
        {
            var macrosectionNamesList = report.GetSubSectionName();
            return macrosectionNamesList;
        }

        public List<MacroDetails> GetModifySectnsData()
        {
            var macrosectionNamesList = report.GetModifySectnsData();
            return macrosectionNamesList;
        }
        public List<EstablishmentLogoDetails> GetEstablishmentLogoDetails()
        {
            var establishmentLogoList = report.GetEstablishmentLogoData();
            return establishmentLogoList;
        }
    }
}