using NextGen.Core.Configuration;
using System.Web.Mvc;
using System.Web.Routing;

namespace Dine
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Logon", action = "Index", id = UrlParameter.Optional }
            );
            routes.MapRoute(
                name: "Default_Config",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Tool", action = "Config", id = UrlParameter.Optional }
            );
        }
    }
}