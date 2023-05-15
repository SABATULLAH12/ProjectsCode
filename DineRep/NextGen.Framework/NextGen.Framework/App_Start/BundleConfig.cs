using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace NextGen.Framework
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            //login
            bundles.Add(new StyleBundle("~/bundle/slogin").Include("~/Content/login.css"));
            bundles.Add(new ScriptBundle("~/bundle/jlogin").Include("~/Scripts/login.js"));

            //master theme
            bundles.Add(new StyleBundle("~/bundle/theme").Include("~/Content/master-theme.css", "~/Scripts/jquery-ui.css"));
            bundles.Add(new ScriptBundle("~/bundle/jlib").Include("~/Scripts/jquery-{version}.js", "~/Scripts/angular.js", "~/Scripts/jquery-ui-{version}.js"
                , "~/Scripts/master-theme.js", "~/Scripts/html2canvas.js", "~/Scripts/tableHeadFixer.js"));

            //home/landing page
            bundles.Add(new StyleBundle("~/bundle/shome").Include("~/Content/home.css"));
            bundles.Add(new ScriptBundle("~/bundle/jhome").Include("~/Scripts/home.js"));

            //chart
            bundles.Add(new StyleBundle("~/bundle/schart").Include("~/Content/chart.css"));
            bundles.Add(new ScriptBundle("~/bundle/jchart").Include("~/Scripts/chart.js"));

            //table
            bundles.Add(new StyleBundle("~/bundle/stable").Include("~/Content/table.css"));
            bundles.Add(new ScriptBundle("~/bundle/jtable").Include("~/Scripts/table.js"));

            //snapshot
            bundles.Add(new StyleBundle("~/bundle/ssnapshot").Include("~/Content/snapshot.css"));
            bundles.Add(new ScriptBundle("~/bundle/jsnapshot").Include("~/Scripts/snapshot.js"));

            //report
            bundles.Add(new StyleBundle("~/bundle/sreport").Include("~/Content/report.css"));
            bundles.Add(new ScriptBundle("~/bundle/jreport").Include("~/Scripts/report.js"));

            bundles.Add(new ScriptBundle("~/bundle/d3chart").Include("~/Scripts/d3/d3.js", "~/Scripts/aq-d3/aq-chart.js", "~/Scripts/aq-d3/column.js",
                "~/Scripts/aq-d3/trendChart.js", "~/Scripts/aq-d3/columntrendchart.js", "~/Scripts/aq-d3/global.js", "~/Scripts/draw-chart.js"));

            //code removed for clarity
            BundleTable.EnableOptimizations = true;
        }
    }
}