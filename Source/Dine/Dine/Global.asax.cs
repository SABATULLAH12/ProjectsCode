using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Http;
using System.Web.Optimization;
using Dine.Infrastructure;
using NextGen.Core.Configuration;
using Dine.Storyboard.Data;
using Dine.Areas.StoryBoard.Models;
using Dine.Models.Report;
using sbarea = Dine.Areas.StoryBoard.Models;
using reportmodel = Dine.ReportContext;
using log4net.Config;

namespace Dine
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            //new UserDbInitialization().DefaultUser();
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            XmlConfigurator.Configure(new System.IO.FileInfo("~/log4net.config"));
            ModuleMapper.AddMapper("chartestablishmentcompare", "~/App_Data/chartestablishmentcompare.json");
            ModuleMapper.AddMapper("analysesestablishmentcompare", "~/App_Data/analysesestablishmentcompare.json");
            ModuleMapper.AddMapper("analysesestablishmentdeepdive", "~/App_Data/analysesestablishmentdeepdive.json");
            ModuleMapper.AddMapper("analysescrossdinerfrequencies", "~/App_Data/analysescrossdinerfrequencies.json");
            ModuleMapper.AddMapper("chartestablishmentdeepdive", "~/App_Data/chartestablishmentdeepdive.json");
            ModuleMapper.AddMapper("chartbeveragecompare", "~/App_Data/chartbeveragecomparison.json"); 
            ModuleMapper.AddMapper("chartbeveragedeepdive", "~/App_Data/chartbeveragedeepdive.json");
            ModuleMapper.AddMapper("tableestablishmentcompare", "~/App_Data/tableestablishmentcompare.json");
            ModuleMapper.AddMapper("tableestablishmentdeepdive", "~/App_Data/tableestablishmentdeepdive.json");
            ModuleMapper.AddMapper("tablebeveragecomparison", "~/App_Data/tablebeveragecomparison.json");
            ModuleMapper.AddMapper("tablebeveragedeepdive", "~/App_Data/tablebeveragedeepdive.json");
            ModuleMapper.AddMapper("chartadvancedfilter_visits", "~/App_Data/chart_advancefilter_visits.json");
            ModuleMapper.AddMapper("chartadvancedfilter_establishment_frequency", "~/App_Data/chart_advancedfilter_establishment_frequency.json");
            ModuleMapper.AddMapper("tableadvancedfilter_visits", "~/App_Data/table_advancefilter_visits.json");
            ModuleMapper.AddMapper("analysesadvancedfilter_visits", "~/App_Data/analyses_advancefilter_visits.json");
            ModuleMapper.AddMapper("chartadvancedfilter_guest", "~/App_Data/chart_advancefilter_guest.json");
            ModuleMapper.AddMapper("tableadvancedfilter_guest", "~/App_Data/table_advancefilter_guest.json");
            ModuleMapper.AddMapper("tableadvancedfilter_guest_beverage", "~/App_Data/table_advancedfilter_guest_beverage.json");
            ModuleMapper.AddMapper("tableadvancedfilter_visit_beverage", "~/App_Data/table_advancedfilter_visit_beverage.json");
            ModuleMapper.AddMapper("tableadvancedfilter_establishment_frequency", "~/App_Data/table_advancedfilter_establishment_frequency.json");

            ModuleMapper.AddMapper("analysesadvancedfilter_guest", "~/App_Data/analyses_advancefilter_guest.json");
            ModuleMapper.AddMapper("chartadvancedfilter_demographics", "~/App_Data/chart_advancefilter.json");
            ModuleMapper.AddMapper("tableadvancedfilter_demographics", "~/App_Data/table_advancefilter.json");
            ModuleMapper.AddMapper("analysesadvancedfilter_demographics", "~/App_Data/analyses_advancefilter.json");

            ModuleMapper.AddMapper("reportp2preport", "~/App_Data/reportp2preport.json");
            ModuleMapper.AddMapper("reportdinerreport", "~/App_Data/reportdinerreport.json");
            ModuleMapper.AddMapper("situationassessmentreport", "~/App_Data/reportsituationassessment.json");
            ModuleMapper.AddMapper("reportsituationassessment_frequency", "~/App_Data/reportsituationassessment_frequency.json");

            //start table beverage
            ModuleMapper.AddMapper("tableadvancedfilter_beveragetab_guest", "~/App_Data/table_beverage_advancefilter_guest.json");
            ModuleMapper.AddMapper("tableadvancedfilter_beveragetab_visits", "~/App_Data/table_beverage_advancefilter_visits.json");
            //end table beverage

            //Dashboard
            ModuleMapper.AddMapper("dashboardp2pdashboard", "~/App_Data/dashboardp2pdashboard.json");
            ModuleMapper.AddMapper("dashboard_demographics", "~/App_Data/dashboard_demographics.json");
            ModuleMapper.AddMapper("dashboardbrandhealth", "~/App_Data/dashboardbrandhealth.json");
            ModuleMapper.AddMapper("dashboardvisits", "~/App_Data/dashboardvisits.json");
            //Dashboard Custom Base
            ModuleMapper.AddMapper("dashboardp2pdashboardCustomBase", "~/App_Data/dashboardp2pdashboardCustomBase.json");
            ModuleMapper.AddMapper("dashboardp2pdashboardCustomBaseAdvancedFilters", "~/App_Data/dashboardp2pdashboardCustomBaseAdvancedFilters.json");
            //

            ConfigContext.Current.Initialize();
            AutoMappToStoryboard();
        }

        protected void Application_End()
        {
            ConfigContext.Current.Dispose();
        }

        private void AutoMappToStoryboard()
        {
            AutoMapper.Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<SbReport, sbarea.Report>();
                cfg.CreateMap<SbSlide, Slide>();
                cfg.CreateMap<SbCustomDownload, CustomDownload>();
                cfg.CreateMap<SbSlideShare, SlideShare>();
                cfg.CreateMap<SbUserGroup, UserGroup>();
                cfg.CreateMap<sbarea.Report, SbReport>();
                cfg.CreateMap<Slide, SbSlide>();
                cfg.CreateMap<CustomDownload, SbCustomDownload>();
                cfg.CreateMap<SlideShare, SbSlideShare>();
                cfg.CreateMap<UserGroup, SbUserGroup>();
                cfg.CreateMap<SbSlideNotes, SlideNotes>();
                cfg.CreateMap<SlideNotes, SbSlideNotes>();
                cfg.CreateMap<SbFavoriteReport, FavoriteReport>();
                cfg.CreateMap<FavoriteReport, SbFavoriteReport>();

                cfg.CreateMap<RSlide, reportmodel.Slide>();
                cfg.CreateMap<reportmodel.Slide, RSlide>();
            });
        }


    }
}