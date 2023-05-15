using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace Dine
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            //login
            bundles.Add(new StyleBundle("~/bundle/slogin").Include("~/Content/login.css"));
            bundles.Add(new ScriptBundle("~/bundle/jlogin").Include("~/Scripts/login.js"));

           

            //master theme
            bundles.Add(new StyleBundle("~/bundle/theme").Include("~/Content/master-theme.css", "~/Scripts/jquery-ui.css","~/Scripts/jquery-ui-slider-pips.css"));
            bundles.Add(new ScriptBundle("~/bundle/jlib").Include("~/Scripts/jquery-{version}.js", "~/Scripts/angular.js", "~/Scripts/jquery-ui.js"
                , "~/Scripts/html2canvas.js", "~/Scripts/tableHeadFixer.js","~/Scripts/jquery-ui-slider-pips.js"
                , "~/Scripts/table-scroll/tablescroller.jquery.js", "~/Scripts/table-scroll/tablescroller.js", "~/Scripts/jquery.nicescroll.js", "~/Scripts/lodash.min.js"));
            bundles.Add(new ScriptBundle("~/bundle/jmaster").Include("~/Scripts/master-theme.js"));
            //home/landing page
            bundles.Add(new StyleBundle("~/bundle/shome").Include("~/Content/home.css"));
            bundles.Add(new ScriptBundle("~/bundle/jhome").Include("~/Scripts/home.js"));
            

            //chart
            bundles.Add(new StyleBundle("~/bundle/schart").Include("~/Content/chart.css"));
            bundles.Add(new ScriptBundle("~/bundle/jchart").Include("~/Scripts/chart.js"));
            bundles.Add(new ScriptBundle("~/bundle/jchartestcomp").Include("~/Scripts/chart_establishment_compare.js"));
            bundles.Add(new ScriptBundle("~/bundle/jchartestdeepdive").Include("~/Scripts/chart_establishment_deepdive.js"));
            bundles.Add(new ScriptBundle("~/bundle/jchartbevcomp").Include("~/Scripts/chart_beverage_comparison.js"));
            bundles.Add(new ScriptBundle("~/bundle/jchartbevdeepdive").Include("~/Scripts/chart_beverage_deepdive.js"));

            //table
            bundles.Add(new StyleBundle("~/bundle/stable").Include("~/Content/table.css"));
            bundles.Add(new ScriptBundle("~/bundle/jtable").Include("~/Scripts/table.js"));
            bundles.Add(new ScriptBundle("~/bundle/jtableestcomp").Include("~/Scripts/table_establishment_compare.js"));
            bundles.Add(new ScriptBundle("~/bundle/jtableestdeepdive").Include("~/Scripts/table_establishment_deepdive.js"));
            bundles.Add(new ScriptBundle("~/bundle/jtablebevrgecomp").Include("~/Scripts/table_beverage_comparison.js"));
            bundles.Add(new ScriptBundle("~/bundle/jtablebevrgedeep").Include("~/Scripts/table_beverage_deepdive.js"));

            //snapshot
            bundles.Add(new StyleBundle("~/bundle/sanalyses").Include("~/Content/analyses.css"));
            bundles.Add(new ScriptBundle("~/bundle/janalyses").Include("~/Scripts/analyses.js"));
            bundles.Add(new ScriptBundle("~/bundle/janalysesestcomp").Include("~/Scripts/analyses_establishment_compare.js"));
            bundles.Add(new ScriptBundle("~/bundle/janalysesestdeepdive").Include("~/Scripts/analyses_establishment_deepdive.js"));
            bundles.Add(new ScriptBundle("~/bundle/janalysescrssfrqcncy").Include("~/Scripts/analyses_crossdinerfreqcy.js"));
            
            //report
            bundles.Add(new StyleBundle("~/bundle/sreport").Include("~/Content/report.css"));
            bundles.Add(new StyleBundle("~/bundle/sreportsituation").Include("~/Content/reportsituation.css"));
            bundles.Add(new ScriptBundle("~/bundle/jreport").Include("~/Scripts/report.js"));
            bundles.Add(new ScriptBundle("~/bundle/jreportdiner").Include("~/Scripts/report_Diner.js"));
            bundles.Add(new ScriptBundle("~/bundle/jreportp2p").Include("~/Scripts/reportp2preport.js"));
            bundles.Add(new ScriptBundle("~/bundle/jreportdinerrprt").Include("~/Scripts/reportdinerreport.js"));
            bundles.Add(new ScriptBundle("~/bundle/jreportsituation").Include("~/Scripts/report_situationassessmnt.js"));

            
            //report
            bundles.Add(new StyleBundle("~/bundle/sdashboard").Include("~/Content/dashboard.css"));
            bundles.Add(new ScriptBundle("~/bundle/jdashboard").Include("~/Scripts/dashboard.js"));
            bundles.Add(new ScriptBundle("~/bundle/jdashboardp2p").Include("~/Scripts/dashboard_p2p.js"));
            bundles.Add(new ScriptBundle("~/bundle/jdashboarddemographics").Include("~/Scripts/dashboard_demographic.js"));

            

            bundles.Add(new ScriptBundle("~/bundle/d3chart").Include("~/Scripts/d3/d3.js", "~/Scripts/aq-d3/aq-chart.js", "~/Scripts/aq-d3/column.js",
                "~/Scripts/aq-d3/trendChart.js", "~/Scripts/aq-d3/columntrendchart.js", "~/Scripts/aq-d3/global.js", "~/Scripts/draw-chart.js"));

            //code removed for clarity
            BundleTable.EnableOptimizations = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableBundling"]);
        }
    }
}