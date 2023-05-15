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
using Framework.Models.DashBoard;
using fd = Framework.Data;
using NextGen.Core.Configuration.Interfaces;
using System.Linq;
using Aspose.Slides;
using Dine.Models.Dashboard;
using System.Drawing;
using Svg;
using Aspose.Slides.Export;
using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;
using static Dine.Utility.Constants;
using Dine.Utility;
using System.Drawing.Imaging;

namespace Dine.BusinessLayer
{
    public class DashBoardBO : IDisposable
    {
        private readonly fd.IDashBoard dashboard = null;
        protected bool disposed = false;
        protected IModuleConfig config = null;

        public DashBoardBO()
        {
            config = ConfigContext.Current.GetConfig("dashboard");
            dashboard = new fd.DashBoard();
        }

        public DashBoardBO(string controllerName)
        {
            config = ConfigContext.Current.GetConfig(controllerName);
            dashboard = new fd.DashBoard(controllerName);
        }
        public string SaveorGetUserFilters(FilterPanelInfo[] filter, string filtermode, string userid,int dashboardType)
        {
            string result = dashboard.SaveorGetUserFilters(filter, filtermode, userid, dashboardType);
            return result;
        }
        public DashBoardInfo GetDashboard(FilterPanelInfo[] filter)
        {
            DashBoardInfo info = dashboard.GetOutputData(filter);
            return info;
        }

        public DashBoardInfo GetOutputDataForDemogpcs(FilterPanelInfo[] filter)
        {
            DashBoardInfo info = dashboard.GetOutputDataForDemogpcs(filter);
            return info;
        }
        public string ExportToFullDashboardPPT(string filepath, string destFile, P2PDashboardData filter, HttpContextBase context)
        {
            string subPath = "~/Images/temp/" + context.Session.SessionID + Utils.getUniqueConst();
            #region Variables
            int indx = 0;string pdfPath = context.Server.MapPath("~/Temp/P2P_PDF" + (DateTime.Now.Ticks));
            List<IndividualData> planningType = filter.OutputData.Where(x => x.DemofilterName == "Planning Type").ToList();
            #endregion Variables
            #region select slide
            int slideNo = 1;
            int isSpur = planningType == null ? -1 : (planningType.FirstOrDefault().MetricName.ToUpper() == "SPUR OF THE MOMENT" ? 1 : 0);
            if (filter.changedData.Where(x => x.name == "Planning Type").FirstOrDefault().value.ToUpper() != "NONE")
            {
                isSpur = filter.changedData.Where(x => x.name == "Planning Type").FirstOrDefault().value.ToUpper() == "SPUR OF THE MOMENT" ? 1 : 0;
            }
            switch (isSpur)
            {
                case -1: return "Error";
                case 0: slideNo = filter.NoOfRoads == 4 ? 1 : 2; break;
                case 1: slideNo = filter.NoOfRoads == 4 ? 3 : 4; break;
            }
            #endregion select slide
            using (Aspose.Slides.Presentation pres = new Aspose.Slides.Presentation(filepath))
            {
                #region variables
                List<IndividualData> tempList = new List<IndividualData>();
                IGroupShape tempGroup;
                #endregion variables
                ISlide SSSlide = pres.Slides[4];

                indx = pres.Slides.Count - 1;
                foreach (var item in pres.Slides.Reverse())
                {
                    if (indx == slideNo - 1 || item.SlideNumber==5)
                    {
                        indx--; continue;
                    }
                    else
                    {
                        item.Remove();
                    }
                    indx--;
                }
                PictureFrame tempImg; string loc; changedData tempStore;
                #region Master Slide
                //StatTestAgainst
                //((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "StatTestAgainst").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper();
                //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName.ToUpper() + " | " + filter.LeftpanelData.ToUpper();
                //((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = "Sample Size – " + filter.ss.ToString("#,##,##0");
                //updateBaseSortedBy(((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "Visit", filter.isSize, filter.freq);

                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() +", Filters: " + filter.AdvnceFltrCustomBase;
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName.ToUpper() + " | " + filter.LeftpanelData.ToUpper();

                string sortedBy = "Sorted by: Largest " + (filter.isSize == false ? "Skew" : "Size");
                string baseLine = "Base: " + "Total Visits " + (filter.freq == null || filter.freq == "" || filter.freq.ToLower() == "total visits" ? "" : "(" + filter.freq + ")");
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SoureTextFitrs").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod + "\n" + "Filters: " + filter.SelctedFiltersOnly;
                //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SoureTextFitrs").FirstOrDefault()).TextFrame.Text= "Sample Size – " + filter.ss.ToString("#,##,##0");
                //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "Visit", filter.isSize, filter.freq);

                #endregion Master Slide

                #region Restraunt name updation
                //Replace Establishment logo
                loc = "~/Images/P2PDashboardEsthmtImages/" + filter.OutputData[0].EstablishmentName.Replace("/", "") + ".svg";
                //imageReplace((PictureFrame)pres.Slides[0].Shapes.Where(x => x.Name == "estLogo").FirstOrDefault(), loc, context, 6, -2);
                imageReplace((PictureFrame)pres.Slides[0].Shapes.Where(x => x.Name == "estLogoCenter").FirstOrDefault(), loc, context, 8, -2, subPath);
                string estText = filter.OutputData[0].EstType;
                if (estText.ToUpper() != "TOTAL")
                {
                    estText = (estText.ToUpper() == "RESTAURANTS" ? "RESTAURANT VISIT" : "RETAILER VISIT");
                }
                else
                {
                    estText = "TOTAL VISIT";
                }
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "estText").FirstOrDefault()).TextFrame.Text = estText == null ? "" : estText;
                #endregion
                #region Time Of Day
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "tod").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Daypart").ToList();
                setValuesForMetrics(tempGroup, tempList, tempList.Count > 1 ? tempList.Count : -1, true, false);
                #endregion Time Of Day
                #region locationPrior
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "locationPrior").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Location Prior" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Location Prior").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Location Prior" && x.MetricName == tempStore.value).ToList();
                }

                setValuesForMetricsWithVM(tempGroup, tempList, -1, false, true);
                //Replace Image
                loc = "~/Images/P2PDashboardImages/P2P_Lctn_" + getVisitImageLocation(tempList[0].MetricName.Replace("'", "_").Replace(" ", "_")) + ".svg";
                imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img").FirstOrDefault(), loc, context, 1, 0, subPath);
                #endregion locationPrior
                #region planningType
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "planningType").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Planning Type" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Planning Type").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Planning Type" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForMetricsWithVM(tempGroup, tempList, -1, false, true);
                if (isSpur == 1)
                {
                    //Fill the time pie chart
                    plotBalloonPieChart(tempGroup, tempList[0]);
                }
                else if (tempList[0].MetricName.ToString().ToUpper() == "WELL AHEAD OF TIME")
                {
                    //Planning image replacement
                    tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img").FirstOrDefault();
                    int indexPlanning = (int)Math.Ceiling(tempList[0].MetricValue / 20);
                    imageReplace(tempImg, "~/Images/P2PDashboardImages/P2P_Planning_Well.svg", context, 2, 0, subPath);
                }
                else
                {
                    //Planning image replacement
                    tempImg = (PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img").FirstOrDefault();
                    int indexPlanning = (int)Math.Ceiling(tempList[0].MetricValue / 20);
                    imageReplace(tempImg, "~/Images/P2PDashboardImages/P2P_Planning_Somewhat.svg", context, 2, 0, subPath);

                }
                //
                #endregion planningType
                #region whoWith
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "whoWith").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Companion Detail" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Companion Detail").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Companion Detail" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForMetricsWithVM(tempGroup, tempList, -1, false, true);
                #endregion whoWith
                #region transportation
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "transportation").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Mode of Transport" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Mode of Transport").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Mode of Transport" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForMetricsWithVM(tempGroup, tempList, -1, false, true);
                //Replace image
                loc = "~/Images/P2PDashboardImages/P2P_Transportaion_" + getTransportationLoc(tempList[0].MetricName.Replace(" ", "_").Replace("'", "_")) + ".svg";
                imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img").FirstOrDefault(), loc, context, 7, 0, subPath);
                #endregion transportation
                #region otherActivities
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "otherActivities").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Trip Activity").ToList();
                setValuesForMetricsWithVM(tempGroup, tempList, -1, false, true);
                //Fill pie chart
                plotBalloonPieChart(tempGroup, tempList[0]);
                #endregion otherActivities
                #region postvisit
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "postvisit").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Destination after Visit" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Destination after Visit").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Destination after Visit" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForMetricsWithVM(tempGroup, tempList, -1, false, true);
                //Replace Image
                loc = "~/Images/P2PDashboardImages/P2P_Lctn_" + getVisitImageLocation(tempList[0].MetricName.Replace("'", "_").Replace(" ", "_")) + ".svg";
                imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img").FirstOrDefault(), loc, context, 3, 0, subPath);
                #endregion postvisit
                #region avgDistance
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "avgDistance").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Average Distance Travelled").ToList();
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "v").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].Text = tempList[0].MetricValue.ToString("#0");
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "v").FirstOrDefault()).TextFrame.Paragraphs[1].Portions[0].Text = (tempList[0].MetricValue.ToString("#0") == "1" || tempList[0].MetricValue.ToString("#0") == "0") ? "Mile" : "Miles";
                #endregion avgDistance
                #region trip
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "trip").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Distance Travelled Out Of Way").ToList();
                //double mValue = 0,cValue = 0;
                //foreach (var item in tempList)
                //{
                //    if (item.MetricName != "0 Miles") {
                //        mValue = mValue + item.MetricValue;
                //        cValue = cValue + item.MetricValue;
                //    }
                //}
                if (tempList != null)
                {
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "v").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].Text = tempList[0].MetricValue.ToString("#0") + "%";//tempList[0].MetricValue.ToString("#0");
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].Text = getChangeValue(tempList[0].Change);
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(tempList[0].Significancevalue);
                    //Fill pie chart
                    plotBalloonPieChart(tempGroup, tempList[0]);
                }

                #endregion trip
                #region overallSatisfaction
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "overallSatisfaction").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Overall Satisfaction (Top 2 Box)").ToList();
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "vm").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].Text = tempList[0].MetricValue.ToString("#0") + "%";
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].Text = getChangeValue(tempList[0].Change);
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(tempList[0].Significancevalue);
                //Fill pie chart
                plotBalloonPieChart(tempGroup, tempList[0]);
                #endregion overallSatisfaction
                #region satisfaction
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "satisfaction").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Satisfaction: Food").ToList();
                setValuesForindMetrics(tempGroup, tempList[0], 1, false, true);
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Satisfaction: Beverages").ToList();
                setValuesForindMetrics(tempGroup, tempList[0], 2, false, true);
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Satisfaction: Value (Top 2 Box)").ToList();
                setValuesForindMetrics(tempGroup, tempList[0], 3, false, true);
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Satisfaction: Cleanliness").ToList();
                setValuesForindMetrics(tempGroup, tempList[0], 4, false, true);
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Satisfaction: Atmosphere").ToList();
                setValuesForindMetrics(tempGroup, tempList[0], 5, false, true);
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Satisfaction: Service (Top 2 Box)").ToList();
                setValuesForindMetrics(tempGroup, tempList[0], 6, false, true);
                #endregion satisfaction
                #region motivationMood
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "motivationMood").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Primary Occasion Motvation" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Primary Occasion Motvation").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Primary Occasion Motvation" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForindMetricsWithVM(tempGroup, tempList[0], 1, false, true);
                tempStore = filter.changedData.Where(x => x.name == "Primary Outlet Motivation" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Primary Outlet Motivation").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Primary Outlet Motivation" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForindMetricsWithVM(tempGroup, tempList[0], 2, false, true);
                tempStore = filter.changedData.Where(x => x.name == "Primary Mood" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Primary Mood").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Primary Mood" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForindMetricsWithVM(tempGroup, tempList[0], 3, false, true);
                #endregion motivationMood
                #region beverageItems
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "beverageItems").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Beverage Item" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Beverage Item").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Beverage Item" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForindMetricsWithVC(tempGroup, tempList[0], 1, false);
                //Replace imageD:\Dine\Source\Dine\Dine\Images\P2PDashboardImages\Beverage_Items\Fountain Soda Machine Tea.svg
                loc = "~/Images/P2PDashboardImages/Beverage_Items/" + tempList[0].MetricName.Replace("%", "").Replace("+", "").Replace("/", "") + ".svg";
                imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img1").FirstOrDefault(), loc, context, 4, -1, subPath);
                tempStore = filter.changedData.Where(x => x.name == "Food Item" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Food Item").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Food Item" && x.MetricName == tempStore.value).ToList();
                }
                setValuesForindMetricsWithVC(tempGroup, tempList[0], 2, false);
                //Replace image
                loc = "~/Images/P2PDashboardImages/Food_Items/" + tempList[0].MetricName.Replace("/", "") + ".svg";
                imageReplace((PictureFrame)tempGroup.Shapes.Where(x => x.Name == "img2").FirstOrDefault(), loc, context, 5, -1, subPath);
                #endregion beverageItems
                #region meal
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "meal").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Meal Type").ToList();
                setValuesForMetrics(tempGroup, tempList, 5, true, true);
                #endregion meal
                #region orderSummary
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "orderSummary").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Visit Type - Detailed Nets").ToList();
                setValuesForMetrics(tempGroup, tempList, tempList.Count > 1 ? tempList.Count : -1, false, false);
                #endregion orderSummary
                #region timeSpent
                string metricName = "", subText = "";
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "timeSpent").FirstOrDefault();
                tempStore = filter.changedData.Where(x => x.name == "Time Spent In Outlet" && x.value != "none").FirstOrDefault();
                if (tempStore == null)
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Time Spent In Outlet").ToList();
                }
                else
                {
                    tempList = filter.OutputData.Where(x => x.DemofilterName == "Time Spent In Outlet" && x.MetricName == tempStore.value).ToList();
                }
                if (tempList[0].MetricName == "5 Min Or Less" || tempList[0].MetricName == "91 Min Or More")
                {
                    metricName = tempList[0].MetricName;
                }
                else
                {
                    metricName = tempList[0].MetricName.Split(new[] { "Min" }, StringSplitOptions.RemoveEmptyEntries)[0].Trim();
                    subText = "MIN";
                }
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Text = getChangeValue(tempList[0].Change); //tempList[0].Change > 0 ? "+" + (tempList[0].Change.ToString("##0.0") + "%") : (tempList[0].Change.ToString("##0.0") + "%");
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(tempList[0].Significancevalue);
                if (subText == "")
                {
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Text = metricName.ToUpper();
                }
                else
                {
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].Text = metricName.ToUpper();
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Paragraphs[1].Portions[0].Text = subText;
                    ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Paragraphs[1].Portions[0].PortionFormat.FontBold = NullableBool.True;
                }

                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "v").FirstOrDefault()).TextFrame.Text = tempList[0].MetricValue.ToString("##0") + "%";
                #endregion timeSpent
                #region dollar
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "dollar").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Average Per Diner").ToList();
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Text = getChangeValue(tempList[0].Change); //tempList[0].Change > 0 ? ("+" + tempList[0].Change.ToString("##0.0") + "%") : (tempList[0].Change.ToString("##0.0") + "%");
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(tempList[0].Significancevalue);
                ((IAutoShape)tempGroup.Shapes.Where(x => x.Name == "v").FirstOrDefault()).TextFrame.Text = "$" + tempList[0].MetricValue.ToString("##0");
                #endregion dollar
                #region balloon
                tempGroup = (IGroupShape)pres.Slides[0].Shapes.Where(x => x.Name == "balloon").FirstOrDefault();
                tempList = filter.OutputData.Where(x => x.DemofilterName == "Occasion Type").ToList();
                if (filter.NoOfRoads == 3) { tempList.RemoveAt(tempList.Count - 1); }
                setValuesForMetrics(tempGroup, tempList, tempList.Count > 1 ? tempList.Count : -1, true, false);
                //Plot balloon charts
                indx = 1;
                foreach (var item in tempList)
                {
                    plotBalloonPieChart((IGroupShape)tempGroup.Shapes.Where(x => x.Name == "balloon" + indx).FirstOrDefault(), item);
                    indx++;
                }
                #endregion balloon
                //    if (filter.pptOrPdf == "pdf")
                //    {
                //        /*Delete ppt logo*/
                //        pres.Masters[0].Shapes.Remove(pres.Masters[0].Shapes.Where(x => x.Name == "logo_for_ppt").FirstOrDefault());
                //        PdfOptions pdfop = new PdfOptions();
                //        //pdfop.JpegQuality = 100;
                //        pdfop.SufficientResolution = 10000;
                //        pdfop.EmbedFullFonts = true;
                //        pdfop.EmbedTrueTypeFontsForASCII = true;
                //        pdfop.TextCompression = PdfTextCompression.Flate;
                //        pdfop.JpegQuality = 100;
                //        pdfop.SaveMetafilesAsPng = true;
                //        pdfop.Compliance = PdfCompliance.Pdf15;
                //        //pdfOp.EmbedFullFonts = true;
                //        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pdf, pdfop);
                //    }
                //    else {
                //        /*Delete pdf logo*/
                //        pres.Masters[0].Shapes.Remove(pres.Masters[0].Shapes.Where(x => x.Name == "logo_for_pdf").FirstOrDefault());
                //        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);                    
                //    }                
                //}

                #region sample size popup slide
                ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "StatTestAgainst").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName.ToUpper() + " | " + filter.LeftpanelData.ToUpper();
                ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "SoureTextFitrs").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod + "\n" + "Filters: " + filter.SelctedFiltersOnly;
                //updateBaseSortedBy(((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "Visits", filter.isSize, filter.freq);
                tempList = filter.OutputData.Where(x => (x.DemofilterName == "Overall Satisfaction (Top 2 Box)" && x.MetricName == "Very Satisfied")
                || x.DemofilterName == "Satisfaction: Food" 
                || x.DemofilterName == "Satisfaction: Beverages" 
                || x.DemofilterName == "Satisfaction: Cleanliness" 
                || x.DemofilterName == "Satisfaction: Atmosphere").ToList();

                var timeSpent = filter.OutputData.Where(x => (x.DemofilterName == "Time Spent In Outlet" && x.MetricName == "5 Min Or Less")).ToList();
                tempList.Insert(1, timeSpent[0]);

                ITable table = (ITable)pres.Slides[1].Shapes.FirstOrDefault(x => x.Name == "table");
                int _row = 0, _col = 0;
                table[_row, _col].TextFrame.Text = tempList[0].Month_Year;
                table[_row+1, _col].TextFrame.Text = "Establishment -  "+tempList[0].EstablishmentName;
                table[_row + 2, _col].TextFrame.Text = (filter.statTest.ToString() == "PREVIOUS PERIOD") ? (System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(filter.statTest.ToLower())) : ("Custom Base -  " + System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(filter.statTest.ToLower()));

               _row = 1; _col=1;
                for(int i = 0; i < tempList.Count; i++)
                {
                    table[_col, _row].TextFrame.Text = String.Format("{0:n0}",tempList[i].TotalSamplesize); 
                    table[_col+1, _row].TextFrame.Text = String.Format("{0:n0}",tempList[i].StatSampleSize);
                     _row++;
                }

                #endregion
                if(filter.isSampleSize== "samplesizePDF" || filter.isSampleSize== "samplesizePPT")
                {
                    pres.Slides[0].Remove();
                }

                if (filter.pptOrPdf == "pdf")
                {
                    //Check if office is installed
                    if (Utils.isPPT_Installed())
                    {
                        /*Delete pdf logo*/
                        pres.Masters[0].Shapes.Remove(pres.Masters[0].Shapes.Where(x => x.Name == "logo_for_pdf").FirstOrDefault());
                        pres.Save(pdfPath, Aspose.Slides.Export.SaveFormat.Pptx);
                    }
                    else
                    {
                        /*Delete ppt logo*/
                        pres.Masters[0].Shapes.Remove(pres.Masters[0].Shapes.Where(x => x.Name == "logo_for_ppt").FirstOrDefault());
                        PdfOptions pdfop = new PdfOptions();
                        pdfop.SufficientResolution = 10000;
                        pdfop.EmbedFullFonts = true;
                        pdfop.EmbedTrueTypeFontsForASCII = true;
                        pdfop.TextCompression = PdfTextCompression.Flate;
                        pdfop.JpegQuality = 100;
                        pdfop.SaveMetafilesAsPng = true;
                        pdfop.Compliance = PdfCompliance.Pdf15;

                        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pdf, pdfop);
                    }
                }
                else
                {
                    /*Delete pdf logo*/
                    pres.Masters[0].Shapes.Remove(pres.Masters[0].Shapes.Where(x => x.Name == "logo_for_pdf").FirstOrDefault());
                    pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);
                }
            }
            if (filter.pptOrPdf == "pdf")
            {
                if (Utils.isPPT_Installed())
                {
                    //Download the interop way
                    var app = new Microsoft.Office.Interop.PowerPoint.Application();
                    var ppt = app.Presentations;
                    var file = ppt.Open(pdfPath, MsoTriState.msoTrue, MsoTriState.msoTrue, MsoTriState.msoFalse);
                    file.SaveCopyAs(destFile, Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType.ppSaveAsPDF, MsoTriState.msoTrue);
                }
            }

            //Remove the temp Image folder 
            Directory.Delete(context.Server.MapPath(subPath), true);
            ////Remove the temp Image
            //for (int i = 1; i < 7; i++)
            //{
            //    if (File.Exists(context.Server.MapPath("~/Images/temp/img" + i + ".emf")))
            //    {
            //        File.Delete(context.Server.MapPath("~/Images/temp/img" + i + ".emf"));
            //    }
            //}
            return "";
        }
        public string ExportToDemogDashboardPPT(string filepath, string destFile, P2PDashboardData filter, HttpContextBase context)
        {
            string subPath = "~/Images/temp/" + context.Session.SessionID + Utils.getUniqueConst();
            string pdfPath = context.Server.MapPath("~/Temp/DemogPDF" + (DateTime.Now.Ticks));
            using (Aspose.Slides.Presentation pres = new Aspose.Slides.Presentation(filepath))
            {
                //Master Slide : Stat test, Sample size
                //((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = "Sample Size – " + filter.ss.ToString("#,##,##0");
                //((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "StatTestAgainst").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper();
                //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName.ToUpper() + " | " + filter.LeftpanelData.ToUpper();
                ////((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()).TextFrame.Text = filter.guestOrVisit;
                //updateBaseSortedBy(((IAutoShape)pres.Masters[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), filter.guestOrVisit, filter.isSize, filter.freq);

                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper();
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName.ToUpper() + " | " + filter.LeftpanelData.ToUpper();
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = "Sample Size – " + filter.ss.ToString("#,##,##0");
                //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), filter.guestOrVisit, filter.isSize, filter.freq);
                //Source: CCNA DINE360 Tracker, Base: Total Visits, Sorted By: Largest Size, Time Period: 12MMT Sep 2018
                string sortedBy = "Sorted by: Largest " + (filter.isSize == false ? "Skew" : "Size");

                string baseLine = "Base: " + (filter.guestOrVisit.ToLower() == "guest" ? (filter.freq == null || filter.freq == "" ? "" : filter.freq + " ") + "Guests" : "Total Visits " + (filter.freq == null || filter.freq == "" || filter.freq.ToLower() == "total visits" ? "" : "(" + filter.freq + ")"));
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceText").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "TPandFilters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;

                //Replace Establishment logo
                string loc = "~/Images/P2PDashboardEsthmtImages/" + filter.OutputData[0].EstablishmentName.Replace("/", "") + ".svg";
                imageReplace((PictureFrame)pres.Slides[0].Shapes.Where(x => x.Name == "logo").FirstOrDefault(), loc, context, 8, -2,subPath, true);

                //Gender
                fillGender(pres.Slides[0], filter.OutputData.Skip(0).Take(2).ToArray());
                //Age
                fillAge(pres.Slides[0], filter.OutputData.Skip(2).Take(6).ToArray());
                //Ethnicity
                fillEthnicity(pres.Slides[0], filter.OutputData.Skip(8).Take(5).ToArray());
                //Occupation
                fillOcc(pres.Slides[0], filter.OutputData.Skip(13).Take(6).ToArray(), filter.pptOrPdf == "pdf");
                //DHS
                fillDHS(pres.Slides[0], filter.OutputData.Skip(19).Take(4).ToArray());
                //MS
                fillMS(pres.Slides[0], filter.OutputData.Skip(23).Take(2).ToArray());
                //PS
                fillPS(pres.Slides[0], filter.OutputData.Skip(25).Take(1).ToArray());
                //HH
                fillHH(pres.Slides[0], filter.OutputData.Skip(26).Take(3).ToArray());
                //SE
                fillSE(pres.Slides[0], filter.OutputData.Skip(29).Take(4).ToArray());
                //Diner Attitude
                fillDA(pres.Slides[0], filter.OutputData.Skip(33).Take(10).ToArray(), filter.pptOrPdf == "pdf");
                //Avg Monthly Channel Visit
                fillAMCV(pres.Slides[0], filter.OutputData.Skip(43).Take(6).ToArray(), context.Server.MapPath("~/Templates/colorForChannel.json"));
                if (filter.pptOrPdf == "pdf")
                {
                    //Check if office is installed
                    if (Utils.isPPT_Installed()) {
                        Log.LogMessage("Powerpoint is Installed in the system");
                        pres.Save(pdfPath, Aspose.Slides.Export.SaveFormat.Pptx);
                    } else {
                        PdfOptions pdfop = new PdfOptions();
                        pdfop.SufficientResolution = 10000;
                        pdfop.EmbedFullFonts = true;
                        pdfop.EmbedTrueTypeFontsForASCII = true;
                        pdfop.TextCompression = PdfTextCompression.Flate;
                        pdfop.JpegQuality = 100;
                        pdfop.SaveMetafilesAsPng = true;
                        pdfop.Compliance = PdfCompliance.Pdf15;
                        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pdf, pdfop);                        
                    }                    
                }
                else
                {
                    pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);
                }
            }
            if (filter.pptOrPdf == "pdf")
            {
                if (Utils.isPPT_Installed())
                {
                    //Download the interop way
                    Log.LogMessage("Trying to open Powerpoint.");
                    try
                    {
                        var app = new Microsoft.Office.Interop.PowerPoint.Application();
                        Log.LogMessage("New Powerpoint opened.");
                        var ppt = app.Presentations;
                        var file = ppt.Open(pdfPath, MsoTriState.msoFalse, MsoTriState.msoTrue, MsoTriState.msoFalse);
                        Log.LogMessage("Aspose Powerpoint is opened");
                        file.SaveCopyAs(destFile, Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType.ppSaveAsPDF, MsoTriState.msoTrue);
                        Log.LogMessage("PDF is generated.");
                    }
                    catch (Exception ex)
                    {
                        Log.LogMessage("Exception Occured");
                        Log.LogException(ex);
                    }                    
                }               
            }
            return "";
        }

        private void updateBaseSortedBy(IAutoShape shp, string guestOrVisit, bool isSize, string freq)
        {
            string baseLine = "Base: " + (guestOrVisit.ToLower() == "guest"? (freq == null || freq == "" ? "" : freq + " ") + "Guests" : "Total Visits " + (freq == null || freq == "" || freq.ToLower() == "total visits"? "":"("+ freq +")"));
            string sortedBy = "Sorted by: Largest " + (isSize == false? "Skew":"Size");
            shp.TextFrame.Text = baseLine + "\n" + sortedBy;
        }

        public string PopupExportDashboard(string filepath, string destFile, P2PPopupDashboardData filter, HttpContextBase context)
        {
            int i = 0, j = 0;
            string suffix = ((filter.DemofilterName == "Food Item" || filter.DemofilterName == "Beverage Item"  || filter.DemofilterName == "Dollars Spent") ? "" : "Bar");
            string chartTitle = (filter.DemoTitle == "" || filter.DemoTitle == null ? filter.DemofilterName : filter.DemoTitle);
            using (Aspose.Slides.Presentation pres = new Aspose.Slides.Presentation(filepath + suffix + ".pptx"))
            {
                //Master Slide data filling
                //StatTestAgainst1
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper()+ ", Filters: " + filter.AdvnceFltrCustomBase; 
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                string ssText= filter.OutputData[0].EstablishmentName+ ": "+String.Format("{0:n0}", filter.OutputData[0].TotalSamplesize) +'\r'+ System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(filter.statTest.ToLower()) + ": "+String.Format("{0:n0}",filter.OutputData[0].StatSampleSize);
                //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                string sortedBy = "Sorted by: Largest " + (filter.isSize == false ? "Skew" : "Size");
                string baseLine = "Base: " + "Total Visits " + (filter.freq == null || filter.freq == "" || filter.freq.ToLower() == "total visits" ? "" : "(" + filter.freq + ")");
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;
                //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                //Delete extra slides


                if (filter.DemofilterName == "Food Item")
                {

                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                    //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                    //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                 
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;

                    ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                    ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                    //((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                    //updateBaseSortedBy(((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                    ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                    ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;

                    ((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                    ((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                    //((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                    //updateBaseSortedBy(((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                    ((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                    ((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;


                    ((IAutoShape)pres.Slides[4].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                    ((IAutoShape)pres.Slides[4].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                    //((IAutoShape)pres.Slides[4].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                    //updateBaseSortedBy(((IAutoShape)pres.Slides[4].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                    ((IAutoShape)pres.Slides[4].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                    ((IAutoShape)pres.Slides[4].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;


                    //Replace values in the table
                    ITable tbl = (ITable)pres.Slides[0].Shapes.Where(x => x.Name == "table").FirstOrDefault();
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                    setValuePerSlide(filter, tbl, 1, 22);
                    tbl = (ITable)pres.Slides[1].Shapes.Where(x => x.Name == "table").FirstOrDefault();
                    ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                    setValuePerSlide(filter, tbl, 23, 44);
                    tbl = (ITable)pres.Slides[2].Shapes.Where(x => x.Name == "table").FirstOrDefault();
                    ((IAutoShape)pres.Slides[2].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                    setValuePerSlide(filter, tbl, 45, 66);
                }
                else if (filter.DemofilterName == "Dollars Spent")
                {
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                    //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                    //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;

                    //Replace values in the table
                    ITable tbl = (ITable)pres.Slides[0].Shapes.Where(x => x.Name == "table").FirstOrDefault();
                    ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                    setValuePerSlide(filter, tbl, 1, 16);
                    //Remove slide 2,3,4,5
                    pres.Slides.RemoveAt(4);
                    pres.Slides.RemoveAt(3);
                    pres.Slides.RemoveAt(2);
                    pres.Slides.RemoveAt(1);
                    //Remove table rows last 2
                    tbl.Rows.RemoveAt(tbl.Rows.Count - 1, true);
                    tbl.Rows.RemoveAt(tbl.Rows.Count - 1, true);
                    tbl.Rows.RemoveAt(tbl.Rows.Count - 1, true);
                    //tbl.Rows.RemoveAt(tbl.Rows.Count - 1, true);
                    //Clear second half of Last row
                    //tbl[4, tbl.Rows.Count - 1].TextFrame.Text = "";
                    //tbl[5, tbl.Rows.Count - 1].TextFrame.Text = "";
                    //tbl[6, tbl.Rows.Count - 1].TextFrame.Text = "";
                    //tbl[7, tbl.Rows.Count - 1].TextFrame.Text = "";
                }
                else
                {
                    if (filter.DemofilterName == "Beverage Item")
                    {

                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                        //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                        //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;

                        ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                        ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                        // ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                        //updateBaseSortedBy(((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                        ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                        ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;


                        //Replace values in the table
                        ITable tbl = (ITable)pres.Slides[0].Shapes.Where(x => x.Name == "table").FirstOrDefault();
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                        setValuePerSlide(filter, tbl, 1, 22);
                        tbl = (ITable)pres.Slides[1].Shapes.Where(x => x.Name == "table").FirstOrDefault();
                        ((IAutoShape)pres.Slides[1].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                        setValuePerSlide(filter, tbl, 23, filter.OutputData.Count);
                        //Remove slide 3,4,5
                        pres.Slides.RemoveAt(4);
                        pres.Slides.RemoveAt(3);
                        pres.Slides.RemoveAt(2);
                        //Remove table rows last 2
                        tbl.Rows.RemoveAt(tbl.Rows.Count - 1, true);
                        tbl.Rows.RemoveAt(tbl.Rows.Count - 1, true);
                        //Clear second half of Last row
                        tbl[4, tbl.Rows.Count - 1].TextFrame.Text = "";
                        tbl[5, tbl.Rows.Count - 1].TextFrame.Text = "";
                        tbl[6, tbl.Rows.Count - 1].TextFrame.Text = "";
                        tbl[7, tbl.Rows.Count - 1].TextFrame.Text = "";
                    }
                    else
                    {
                        //Remove NA from OverAll Satisfaction
                        if (filter.OutputData.Where(x => x.MetricName == "NA").Count() > 0)
                        {
                            filter.OutputData.Remove(filter.OutputData.Where(x => x.MetricName == "NA").FirstOrDefault());
                        }
                        for (i = pres.Slides.Count - 1; i >= 0; i--)
                        {
                            if (i != filter.OutputData.Count - 1)
                            {
                                pres.Slides.RemoveAt(i);
                            }
                        }
                        //Master Slide data filling
                        //StatTestAgainst1
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "leftPane").FirstOrDefault()).TextFrame.Text = filter.OutputData[0].EstablishmentName + " | " + filter.LeftpanelData;
                        //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "ss").FirstOrDefault()).TextFrame.Text = ssText;
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;
                        //Update the chart
                        IChart chrt = (IChart)pres.Slides[0].Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                        IChartDataWorkbook fact = chrt.ChartData.ChartDataWorkbook;
                        //Update categories
                        foreach (var x in filter.OutputData)
                        {
                            fact.GetCell(0, 2 + i, 0, x.MetricName);
                            i++;
                        }
                        i = 0;
                        //Fill the values
                        foreach (var ser in chrt.ChartData.Series)
                        {
                            j = 0;
                            foreach (var x in filter.OutputData)
                            {
                                fact.GetCell(0, j + 1, i + 1, Math.Round(x.MetricValue));
                                //Modify the Change value for dataLabels
                                var tempDP_Label = ser.DataPoints[j].Label.TextFrameForOverriding.Paragraphs[0].Portions;
                                //Clear All Portion except 1st
                                for (int idx = tempDP_Label.Count - 1; idx > 0; idx--)
                                {
                                    tempDP_Label.RemoveAt(idx);
                                }
                                //PDF special Case
                                if (filter.pptOrPdf == "pdf")
                                {
                                    tempDP_Label[0].Text = x.MetricValue.ToString("#0");
                                }
                                tempDP_Label.Add(new Portion() { Text = " %| " });
                                tempDP_Label.Add(new Portion() { Text = getChangeValue(x.Change) });
                                //tempDP_Label[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                                //tempDP_Label[1].PortionFormat.FillFormat.FillType = FillType.Solid;
                                tempDP_Label[2].PortionFormat.FillFormat.FillType = FillType.Solid;
                                //tempDP_Label[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(x.Significancevalue);
                                //tempDP_Label[1].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(x.Significancevalue);
                                tempDP_Label[2].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(x.Significancevalue);
                                ser.DataPoints[j].Label.X = (float)0.94;
                                ser.DataPoints[j].Label.Y = 0;
                                j++;
                            }
                            i++;
                        }
                        chrt.ChartData.Series[0].Labels.DefaultDataLabelFormat.ShowLeaderLines = true;
                        chrt.ChartData.Series[0].Labels.DefaultDataLabelFormat.IsNumberFormatLinkedToSource = false;
                        chrt.ChartData.Series[0].Labels.DefaultDataLabelFormat.NumberFormat = "##0";
                        //chrt.ChartData.Series[0].Labels.DefaultDataLabelFormat.ShowLeaderLines = true;
                        ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "chartTitle").FirstOrDefault()).TextFrame.Text = chartTitle;
                    }
                }
                //    if (filter.pptOrPdf == "pdf")
                //    {
                //        PdfOptions pdfop = new PdfOptions();
                //        //pdfop.JpegQuality = 100;
                //        pdfop.SufficientResolution = 10000;
                //        pdfop.EmbedFullFonts = true;
                //        pdfop.EmbedTrueTypeFontsForASCII = true;
                //        pdfop.TextCompression = PdfTextCompression.Flate;
                //        pdfop.JpegQuality = 100;
                //        pdfop.SaveMetafilesAsPng = true;
                //        pdfop.Compliance = PdfCompliance.Pdf15;
                //        //pdfOp.EmbedFullFonts = true;
                //        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pdf, pdfop);
                //    }
                //    else
                //    {
                //        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);
                //    }
                //}
                //Update the text of Footer based on Frequency
                //updateBaseSortedBy(((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "guest").FirstOrDefault()), "visit", filter.isSize, filter.freq);
                  //((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "StatTestAgainst1").FirstOrDefault()).TextFrame.Text = "* Stat tested at 95% CL against : " + filter.statTest.ToUpper() + ", Filters: " + filter.AdvnceFltrCustomBase;
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "SourceTxt").FirstOrDefault()).TextFrame.Text = "Source:  CCNA DINE\u2083\u2086\u2080," + baseLine + ", " + sortedBy + ", Time Period: " + filter.TimePeriod;
                ((IAutoShape)pres.Slides[0].Shapes.Where(x => x.Name == "Filters").FirstOrDefault()).TextFrame.Text = "Filters: " + filter.SelctedFiltersOnly;
                if (filter.pptOrPdf == "pdf")
                {
                    //Check if office is installed
                    if (Utils.isPPT_Installed())
                    {
                        pres.Save(context.Server.MapPath("~/Temp/P2P_PDF"), Aspose.Slides.Export.SaveFormat.Pptx);
                    }
                    else
                    {
                        PdfOptions pdfop = new PdfOptions();
                        pdfop.SufficientResolution = 10000;
                        pdfop.EmbedFullFonts = true;
                        pdfop.EmbedTrueTypeFontsForASCII = true;
                        pdfop.TextCompression = PdfTextCompression.Flate;
                        pdfop.JpegQuality = 100;
                        pdfop.SaveMetafilesAsPng = true;
                        pdfop.Compliance = PdfCompliance.Pdf15;

                        pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pdf, pdfop);
                    }
                }
                else
                {
                    pres.Save(destFile, Aspose.Slides.Export.SaveFormat.Pptx);
                }
            }
            if (filter.pptOrPdf == "pdf")
            {
                if (Utils.isPPT_Installed())
                {
                    //Download the interop way
                    var app = new Microsoft.Office.Interop.PowerPoint.Application();
                    var ppt = app.Presentations;
                    var file = ppt.Open(context.Server.MapPath("~/Temp/P2P_PDF"), MsoTriState.msoTrue, MsoTriState.msoTrue, MsoTriState.msoFalse);
                    file.SaveCopyAs(destFile, Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType.ppSaveAsPDF, MsoTriState.msoTrue);
                }
            }
            return "";
        }
        public void setValuePerSlide(P2PPopupDashboardData filter, ITable tbl,int startInd, int endInd) {
            int i = 1, j, k = (int)Math.Ceiling((double)(endInd - startInd + 1) / 2);
            for (i = startInd - 1, j = 0; j < k; i++, j++)
            {
                if (filter.OutputData.Count >= i + 1)
                {
                    //1st half
                    tbl[0, j].TextFrame.Text = filter.OutputData[i].MetricName;
                    tbl[1, j].TextFrame.Text = filter.OutputData[i].MetricValue.ToString("#0") + "%";
                    tbl[2, j].TextFrame.Text = "|";
                    tbl[3, j].TextFrame.Text = getChangeValue(filter.OutputData[i].Change); //(filter.OutputData[i].Change > 0 ? "+" + filter.OutputData[i].Change.ToString("#0.0") : filter.OutputData[i].Change.ToString("#0.0")) + "%";
                    tbl[3, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                    //tbl[1, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                    //tbl[2, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                    tbl[3, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(filter.OutputData[i].Significancevalue);
                    //tbl[1, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(filter.OutputData[i].Significancevalue);
                    //tbl[2, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(filter.OutputData[i].Significancevalue);
                    //i++;
                    if (filter.OutputData.Count >= k + i + 1)
                    {
                        //2nd half
                        tbl[4, j].TextFrame.Text = filter.OutputData[i + k].MetricName;
                        tbl[5, j].TextFrame.Text = filter.OutputData[i + k].MetricValue.ToString("#0") + "%";
                        tbl[6, j].TextFrame.Text = "|";
                        tbl[7, j].TextFrame.Text = getChangeValue(filter.OutputData[i + k].Change); //(filter.OutputData[i].Change > 0 ? "+" + filter.OutputData[i].Change.ToString("#0.0") : filter.OutputData[i].Change.ToString("#0.0")) + "%";
                        tbl[7, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                        //tbl[6, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                        //tbl[5, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                        tbl[7, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(filter.OutputData[i + k].Significancevalue);
                        //tbl[6, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(filter.OutputData[i].Significancevalue);
                        //tbl[5, j].TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificanceForPopup(filter.OutputData[i].Significancevalue);
                    }
                }
            }
        }
        public FilterPanelMenu GetMenu() { return dashboard.GetMenu(); }

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
                dashboard.Dispose();
            disposed = true;
        }
        #region setValuesForMetrics
        public void setValuesForMetrics(IGroupShape shp, List<IndividualData> data, int len, bool isUpper, bool updateMetrics) {
            if (len == -1)
            {
                setValuesForindMetrics(shp, data[0], 0, isUpper, updateMetrics);
            }
            else {
                for (int i = 0; i < len; i++)
                {
                    setValuesForindMetrics(shp, data[i], i + 1, isUpper, updateMetrics);
                }
            }
        }
        public void setValuesForindMetrics(IGroupShape shp, IndividualData data, int indx, bool isUpper, bool updateMetrics) {
            IAutoShape tmp = ((IAutoShape)shp.Shapes.Where(x => x.Name == "c" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault());
            tmp.TextFrame.Text = getChangeValue(data.Change); //data.Change > 0 ? ("+" + data.Change.ToString("##0.0") + "%") : (data.Change.ToString("##0.0") + "%");
            tmp.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
            tmp.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data.Significancevalue);
            if (updateMetrics == true) { ((IAutoShape)shp.Shapes.Where(x => x.Name == "m" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault()).TextFrame.Text = isUpper ? data.MetricName.ToUpper() : data.MetricName; }
            ((IAutoShape)shp.Shapes.Where(x => x.Name == "v" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault()).TextFrame.Text = data.MetricValue.ToString("##0") + "%";
        }
        public void setValuesForindMetricsWithVC(IGroupShape shp, IndividualData data, int indx, bool isUpper)
        {
            IAutoShape tmp = ((IAutoShape)shp.Shapes.Where(x => x.Name == "m" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault());
            tmp.TextFrame.Text = isUpper ? data.MetricName.ToUpper() : data.MetricName;
            tmp = ((IAutoShape)shp.Shapes.Where(x => x.Name == "vc" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault());
            tmp.TextFrame.Paragraphs[0].Portions[0].Text = data.MetricValue.ToString("##0") + "%";
            tmp = ((IAutoShape)shp.Shapes.Where(x => x.Name == "c" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault());
            tmp.TextFrame.Paragraphs[0].Portions[0].Text = getChangeValue(data.Change); //data.Change > 0 ? ("+" + data.Change.ToString("##0.0") + "%") : (data.Change.ToString("##0.0") + "%");
            tmp.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
            tmp.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data.Significancevalue);
        }
        public Color getColorBasedOnSignificance(double? i) {
            if (i == null) return Color.Black;
            if (i < -1.96) return Color.Red;
            if (i > 1.96) return Color.Green;
            return Color.Black;
        }
        public Color getColorBasedOnSignificanceForPopup(double? i)
        {
            if (i == null) return Color.FromArgb(89, 89, 89);
            if (i < -1.96) return Color.Red;
            if (i > 1.96) return Color.Green;
            return Color.FromArgb(89, 89, 89);
        }
        #endregion
        #region getTransportationLoc
        public string getTransportationLoc(string str) {
            switch (str) {
                case "Walked": return "Walked";
                case "Cab__Car_Service":
                case "Cab/_Car_Service":
                    return "Cab";
                case "Public_Transportation": return "Bus";
                case "Other": return "Other";
                case "Personal_Vehicle": return "Car";
                default: return "Walked";
            }
        }
        #endregion getTransportationLoc
        #region getVisitImageLocation
        public string getVisitImageLocation(string str) {
            switch (str) {
                case "Home": return "Home";
                case "The_gym_or_fitness_center": return "Gym";
                case "Restaurant": return "Restaurant";
                case "School": return "School";
                case "Work_or_job_site": return "Work";
                case "Store": return "Store";
                case "Somewhere_else": return "Work";
                case "Someone_else_s_home": return "Home";
                case "An_entertainment_venue": return "Entermnt";
                case "A_church_or_place_of_worship": return "Church";
                default: return "Home";
            }
        }
        #endregion
        #region ImageReplacement
        public void imageReplace(PictureFrame tempImg, string loc, HttpContextBase context, int indx, int fact, string subPath ,bool isDemog = false) {
            string pathToSvg = context.Server.MapPath(loc);
            double ratio = 1;
            double widthRatio = tempImg.Width / tempImg.Height;
            //Create a directory            
            bool exists = System.IO.Directory.Exists(context.Server.MapPath(subPath));
            if (!exists)
                System.IO.Directory.CreateDirectory(context.Server.MapPath(subPath));
            string tempPath = context.Server.MapPath(subPath + "/img"+indx+".emf");
            if (System.IO.File.Exists(pathToSvg))
            {
                var xyz = SvgDocument.Open(pathToSvg);
                if (File.Exists(tempPath))
                {
                    File.Delete(tempPath);
                }
                var svgBounds = true;
                try
                {
                  var  svgBounds1 = xyz.Bounds;
                }
                catch(Exception ex)
                {
                    svgBounds = false;
                }
                if (svgBounds)
                {
                    if (xyz.ViewBox.Width > xyz.ViewBox.Height)
                    {
                        ratio = xyz.ViewBox.Width / xyz.ViewBox.Height;
                        xyz.Height = (int)((4 * ratio) * xyz.Bounds.Height);
                        xyz.Width = (int)((4 * widthRatio) * xyz.Bounds.Width);
                    }
                    else
                    {
                        if (xyz.ViewBox.Width < xyz.ViewBox.Height)
                        {
                            ratio = xyz.ViewBox.Height / xyz.ViewBox.Width;
                            xyz.Width = (int)((4 * ratio * widthRatio) * xyz.Bounds.Width);
                            xyz.Height = 4 * xyz.Bounds.Height;
                        }
                        else
                        {
                            xyz.Height = 4 * xyz.Bounds.Height;
                            xyz.Width = (int)((4 * widthRatio) * xyz.Bounds.Width);
                        }

                    }
                }
                xyz.Draw().Save(tempPath, System.Drawing.Imaging.ImageFormat.Emf);
                using (Image img = Image.FromFile(tempPath, true))
                {
                    tempImg.PictureFormat.Picture.Image.ReplaceImage(img);
                }
            }
            else {
                //Remove the Image holder
                tempImg.Hidden = true;
            }            
        }
        #endregion
        #region setValuesForMetricsWithVM
        public void setValuesForMetricsWithVM(IGroupShape shp, List<IndividualData> data, int len, bool isUpper, bool updateMetrics)
        {
            if (len == -1)
            {
                setValuesForindMetricsWithVM(shp, data[0], 0, isUpper, updateMetrics);
            }
            else
            {
                for (int i = 0; i < len; i++)
                {
                    setValuesForindMetricsWithVM(shp, data[i], i + 1, isUpper, updateMetrics);
                }
            }
        }
        public void setValuesForindMetricsWithVM(IGroupShape shp, IndividualData data, int indx, bool isUpper, bool updateMetrics)
        {
            IAutoShape tmp = ((IAutoShape)shp.Shapes.Where(x => x.Name == "c" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault());
            tmp.TextFrame.Text = getChangeValue(data.Change); //data.Change > 0 ? ("+" + data.Change.ToString("##0.0") + "%") : (data.Change.ToString("##0.0") + "%");
            tmp.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
            tmp.TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data.Significancevalue);
            tmp = ((IAutoShape)shp.Shapes.Where(x => x.Name == "vm" + (indx == 0 ? "" : indx.ToString())).FirstOrDefault());
            tmp.TextFrame.Paragraphs[0].Portions[0].Text = data.MetricValue.ToString("##0") + "%";
            if (updateMetrics == true) { tmp.TextFrame.Paragraphs[1].Portions[0].Text = isUpper ? data.MetricName.ToUpper() : data.MetricName; }
        }
        #endregion
        #region plotBalloonPieChart
        public void plotBalloonPieChart(IGroupShape shp, IndividualData data)
        {
            IChart tmp = ((IChart)shp.Shapes.Where(x => x.Name == "chart").FirstOrDefault());
            tmp.ChartData.Series[0].DataPoints[0].Value.Data = Math.Round(data.MetricValue);
            tmp.ChartData.Series[0].DataPoints[1].Value.Data = 100 - Math.Round(data.MetricValue);
        }
        #endregion plotBalloonPieChart
        string getChangeValue(double ch) {
            double nCh = Math.Round(ch, 1);
            if (nCh > 0) { return "+" + nCh.ToString("##0.0"); }
            return nCh.ToString("##0.0");
        }
        /*Start Demog helpers*/
        public void setMCvalue(IAutoShape shp, IndividualData data, TextAlignment ta, FontAlignment fa)
        {
            shp.TextFrame.Paragraphs.Clear();
            shp.TextFrame.Paragraphs.Add(new Paragraph());
            shp.TextFrame.Paragraphs[0].Portions.Clear();
            IPortion prt = new Portion() { Text = data.MetricValue.ToString("##,##0") + "% | " };
            prt.PortionFormat.FillFormat.FillType = FillType.Solid;
            prt.PortionFormat.FontHeight = 12;
            prt.PortionFormat.FontBold = NullableBool.True;
            prt.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
            prt.PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
            shp.TextFrame.Paragraphs[0].Portions.Add(prt);
            prt = new Portion() { Text = getFormattedChangeVal(data.Change) };
            prt.PortionFormat.FillFormat.FillType = FillType.Solid;
            prt.PortionFormat.FontHeight = 10;
            prt.PortionFormat.FontBold = NullableBool.True;
            prt.PortionFormat.LatinFont = new FontData("Franklin Gothic Book");
            prt.PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data.Significancevalue);
            shp.TextFrame.Paragraphs[0].Portions.Add(prt);
            //Alignment
            shp.TextFrame.Paragraphs[0].ParagraphFormat.Alignment = ta;
            shp.TextFrame.Paragraphs[0].ParagraphFormat.FontAlignment = fa;
        }
        public string getFormattedChangeVal(double ch)
        {
            if (Math.Round(ch, 5) > 0) { return "+" + ch.ToString("##,##0.0"); }
            if (Math.Round(ch, 1) == 0)
            {
                if (ch < 0)
                {
                    return "-" + ch.ToString("##,##0.0");
                }
            }
            return ch.ToString("##,##0.0");
        }
        public void fillAMCV(ISlide sld, IndividualData[] data, string jsonPath)
        {
            //Get the color details
            colorChannelVisit clr = Quick_Helpers<colorChannelVisit>.LoadJson(jsonPath);
            int i = 0, kInd = 0;
            for (i = 0; i < data.Length; i++)
            {
                for (int j = 0; j < data.Length; j++)
                {
                    if (data[j].Flag == (i+1)) { kInd = j; break; }
                }
                IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "amc" + (i + 1)).FirstOrDefault();
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[kInd].MetricName;
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Text = data[kInd].MetricValue.ToString("##0.0");
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Text = getFormattedChangeVal(data[kInd].Change);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[kInd].Significancevalue);
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[kInd].Flag == 1);
                //Set color for the Header
                IAutoShape temp_col = ((IAutoShape)gp.Shapes.Where(x => x.Name == "cFill").FirstOrDefault());
                if (temp_col != null)
                {
                    temp_col.FillFormat.FillType = FillType.Solid;
                    try
                    {

                        temp_col.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(((System.Reflection.PropertyInfo)typeof(colorChannelVisit).GetMember(data[kInd].MetricName.Replace(" ", "_")).FirstOrDefault()).GetValue(clr).ToString());
                    }
                    catch (Exception e)
                    {
                        Log.LogException(e);
                    }
                }
            }
        }
        public void fillDA(ISlide sld, IndividualData[] data, bool isPdf)
        {
            IChart chrt = (IChart)sld.Shapes.Where(x => x.Name == "daChart").FirstOrDefault();
            IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "da").FirstOrDefault();
            IGroupShape gpTxt = (IGroupShape)sld.Shapes.Where(x => x.Name == "daTxt").FirstOrDefault();
            for (int i = 0; i < data.Length; i++)
            {
                //chrt.ChartData.Series[0].DataPoints[i].Value.Data = (data[data.Length - 1 - i].MetricValue).ToString("##0");
                //chrt.ChartData.Series[1].DataPoints[i].Value.Data = (100 - data[data.Length - 1 - i].MetricValue).ToString("##0");
                chrt.ChartData.ChartDataWorkbook.GetCell(0, 1 + i, 1, Math.Round(data[data.Length - 1 - i].MetricValue));
                chrt.ChartData.ChartDataWorkbook.GetCell(0, 1 + i, 2, Math.Round(100 - data[data.Length - 1 - i].MetricValue));
                //if (isPdf)
                //{
                //    chrt.ChartData.Series[0].DataPoints[i].Label.TextFrameForOverriding.Paragraphs[0].Portions[0].Text = data[data.Length - 1 - i].MetricValue.ToString("##,##0");
                //}
                chrt.ChartData.Series[0].DataPoints[i].Label.TextFrameForOverriding.Paragraphs[0].Portions[2].Text = getFormattedChangeVal(data[data.Length - 1 - i].Change) + "  ";
                var tempDP_Label = chrt.ChartData.Series[0].DataPoints[i].Label.TextFrameForOverriding.Paragraphs[0].Portions;
                //tempDP_Label[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                //tempDP_Label[1].PortionFormat.FillFormat.FillType = FillType.Solid;
                tempDP_Label[2].PortionFormat.FillFormat.FillType = FillType.Solid;
                //tempDP_Label[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[data.Length - 1 - i].Significancevalue);
                //tempDP_Label[1].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[data.Length - 1 - i].Significancevalue);
                tempDP_Label[2].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[data.Length - 1 - i].Significancevalue);
                //Set Label position
                chrt.ChartData.Series[0].DataPoints[i].Label.X = (float)0.99;
                //Update text
                ((IAutoShape)gpTxt.Shapes.Where(x => x.Name == "txt" + (i + 1)).FirstOrDefault()).TextFrame.Text = data[i].MetricName;
            }
        }
        public void fillOcc(ISlide sld, IndividualData[] data, bool isPdf) {            
            IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "occ").FirstOrDefault();
            IChart chrt = (IChart)gp.Shapes.Where(x => x.Name == "occChart").FirstOrDefault();
            for (int i = 0; i < data.Length; i++)
            {
                //chrt.ChartData.Series[0].DataPoints[i].Value.Data = (data[data.Length - 1 - i].MetricValue).ToString("##0");
                //chrt.ChartData.Series[1].DataPoints[i].Value.Data = (100 - data[data.Length - 1 - i].MetricValue).ToString("##0");
                chrt.ChartData.ChartDataWorkbook.GetCell(0, 1 + i, 1, Math.Round(data[data.Length - 1 - i].MetricValue));
                chrt.ChartData.ChartDataWorkbook.GetCell(0, 1 + i, 2, Math.Round(100 - data[data.Length - 1 - i].MetricValue));
                //if (isPdf)
                //{
                //    chrt.ChartData.Series[0].DataPoints[i].Label.TextFrameForOverriding.Paragraphs[0].Portions[0].Text = data[data.Length - 1 - i].MetricValue.ToString("##,##0");
                //}
                chrt.ChartData.Series[0].DataPoints[i].Label.TextFrameForOverriding.Paragraphs[0].Portions[2].Text = getFormattedChangeVal(data[data.Length - 1 - i].Change) + "  ";
                var tempDP_Label = chrt.ChartData.Series[0].DataPoints[i].Label.TextFrameForOverriding.Paragraphs[0].Portions;
                //tempDP_Label[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                //tempDP_Label[1].PortionFormat.FillFormat.FillType = FillType.Solid;
                tempDP_Label[2].PortionFormat.FillFormat.FillType = FillType.Solid;
                //tempDP_Label[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[data.Length - 1 - i].Significancevalue);
                //tempDP_Label[1].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[data.Length - 1 - i].Significancevalue);
                tempDP_Label[2].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[data.Length - 1 - i].Significancevalue);
                //Set Label position
                chrt.ChartData.Series[0].DataPoints[i].Label.X = (float)0.8;
                chrt.ChartData.Series[0].Labels.DefaultDataLabelFormat.TextFormat.ParagraphFormat.FontAlignment = FontAlignment.Center;
                chrt.ChartData.Series[0].Labels.DefaultDataLabelFormat.TextFormat.ParagraphFormat.Alignment = TextAlignment.Center;
                //Update the active widget
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r"+(i+1)).FirstOrDefault()), data[i].Flag == 1);
            }
        }
        public void fillSE(ISlide sld, IndividualData[] data)
        {
            int i = 0;
            for (i = 0; i < data.Length; i++)
            {
                IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "se" + (i + 1)).FirstOrDefault();
                setMCvalue(((IAutoShape)gp.Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[i], TextAlignment.Center, FontAlignment.Center);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[i].MetricName;
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[i].Flag == 1);
            }
        }
        public void fillHH(ISlide sld, IndividualData[] data)
        {
            int i = 0;
            //Fill first one
            IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "hi1").FirstOrDefault();
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Text = "$" + data[0].MetricValue.ToString("##,##0") + "K";
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Text = getFormattedChangeVal(data[0].Change) + "K";
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[0].Significancevalue);
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[0].MetricName;
            for (i = 1; i < data.Length; i++)
            {
                gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "hi" + (i + 1)).FirstOrDefault();
                setMCvalue(((IAutoShape)gp.Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[i], TextAlignment.Right, FontAlignment.Center);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[i].MetricName;
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[i].Flag == 1);
            }
        }
        public void fillMS(ISlide sld, IndividualData[] data)
        {
            int i = 0;
            for (i = 0; i < data.Length; i++)
            {
                IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "ms" + (i + 1)).FirstOrDefault();
                setMCvalue(((IAutoShape)gp.Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[i], TextAlignment.Center, FontAlignment.Center);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[i].MetricName;
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[i].Flag == 1);
                //Update the Chart/Metric Value
                IChart cht = (IChart)gp.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                cht.ChartData.Series[0].DataPoints[0].Value.Data = data[i].MetricValue;
                cht.ChartData.Series[1].DataPoints[0].Value.Data = 100 - data[i].MetricValue;
                //Update the picture frame color
                if (data[i].Flag == 1)
                {
                    PictureFrame pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgR").FirstOrDefault());
                    pf.Hidden = true;
                    pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgRA").FirstOrDefault());
                    pf.Hidden = false;
                }
                else
                {
                    PictureFrame pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgRA").FirstOrDefault());
                    pf.Hidden = true;
                    pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgR").FirstOrDefault());
                    pf.Hidden = false;
                }
            }
        }
        public void fillPS(ISlide sld, IndividualData[] data)
        {
            IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "ps").FirstOrDefault();
            setMCvalue(((IAutoShape)gp.Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[0], TextAlignment.Center, FontAlignment.Center);
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[0].MetricName;
            //Update the Chart/Metric Value
            IChart cht = (IChart)gp.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
            cht.ChartData.Series[0].DataPoints[0].Value.Data = data[0].MetricValue;
            cht.ChartData.Series[1].DataPoints[0].Value.Data = 100 - data[0].MetricValue;
        }
        public void fillEthnicity(ISlide sld, IndividualData[] data) {
            int i = 0;
            for (i = 0; i < data.Length; i++)
            {
                IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "eth" + (i + 1)).FirstOrDefault();
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Text = data[i].MetricValue.ToString("##,##0") + "%";
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Text = getFormattedChangeVal(data[i].Change);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[i].Significancevalue);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[i].MetricName;
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[i].Flag == 1);
            }
        }
        public void fillDHS(ISlide sld, IndividualData[] data)
        {
            int i = 0;
            //Fill first one
            IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "dhs1").FirstOrDefault();
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "m").FirstOrDefault()).TextFrame.Text = data[0].MetricValue.ToString("##,##0.0");
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Text = getFormattedChangeVal(data[0].Change);
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.FillType = FillType.Solid;
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "c").FirstOrDefault()).TextFrame.Paragraphs[0].Portions[0].PortionFormat.FillFormat.SolidFillColor.Color = getColorBasedOnSignificance(data[0].Significancevalue);
            ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[0].MetricName;
            for (i = 1; i < data.Length; i++)
            {
                gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "dhs" + (i + 1)).FirstOrDefault();
                setMCvalue(((IAutoShape)gp.Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[i], TextAlignment.Center, FontAlignment.Center);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[i].MetricName;
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[i].Flag == 1);
                //Update the Chart/Metric Value
                IChart cht = (IChart)gp.Shapes.Where(x => x.Name == "chart").FirstOrDefault();
                cht.ChartData.Series[0].DataPoints[0].Value.Data = data[i].MetricValue;
                cht.ChartData.Series[1].DataPoints[0].Value.Data = 100 - data[i].MetricValue;
                //Update the picture frame color
                if (data[i].Flag == 1)
                {
                    PictureFrame pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgR").FirstOrDefault());
                    pf.Hidden = true;
                    pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgRA").FirstOrDefault());
                    pf.Hidden = false;
                }
                else {
                    PictureFrame pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgRA").FirstOrDefault());
                    pf.Hidden = true;
                    pf = ((PictureFrame)gp.Shapes.Where(x => x.Name == "imgR").FirstOrDefault());
                    pf.Hidden = false;
                }
            }
        }
        public void fillAge(ISlide sld, IndividualData[] data) {
            int i = 0;
            //Fill Chart
            IChart chrt = ((IChart)((IGroupShape)sld.Shapes.Where(x => x.Name == "ageChart").FirstOrDefault()).Shapes.Where(x => x.Name == "chart").FirstOrDefault());
            for (i = 0; i < data.Length; i++)
            {
                IGroupShape gp = (IGroupShape)sld.Shapes.Where(x => x.Name == "age" + (i + 1)).FirstOrDefault();
                setMCvalue(((IAutoShape)gp.Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[i], TextAlignment.Center, FontAlignment.Center);
                ((IAutoShape)gp.Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[i].MetricName;
                setColorForElement(((IAutoShape)gp.Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[i].Flag == 1);
                chrt.ChartData.Series[0].DataPoints[i].Value.Data = data[ data.Length - 1 - i].MetricValue / 100;
            }
        }
        public void fillGender(ISlide sld, IndividualData[] data)
        {
            setMCvalue(((IAutoShape)((IGroupShape)sld.Shapes.Where(x => x.Name == "gender1").FirstOrDefault()).Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[0], TextAlignment.Center, FontAlignment.Center);//Male
            ((IAutoShape)((IGroupShape)sld.Shapes.Where(x => x.Name == "gender1").FirstOrDefault()).Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[0].MetricName;
            setColorForElement(((IAutoShape)((IGroupShape)sld.Shapes.Where(x => x.Name == "gender1").FirstOrDefault()).Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[0].Flag == 1);
            setMCvalue(((IAutoShape)((IGroupShape)sld.Shapes.Where(x => x.Name == "gender2").FirstOrDefault()).Shapes.Where(x => x.Name == "mc").FirstOrDefault()), data[1], TextAlignment.Center, FontAlignment.Center);//Male
            ((IAutoShape)((IGroupShape)sld.Shapes.Where(x => x.Name == "gender2").FirstOrDefault()).Shapes.Where(x => x.Name == "t").FirstOrDefault()).TextFrame.Text = data[1].MetricName;
            setColorForElement(((IAutoShape)((IGroupShape)sld.Shapes.Where(x => x.Name == "gender2").FirstOrDefault()).Shapes.Where(x => x.Name == "r").FirstOrDefault()), data[1].Flag == 1);
            //Fill Chart
            IChart chrt = ((IChart)((IGroupShape)sld.Shapes.Where(x => x.Name == "genderChart").FirstOrDefault()).Shapes.Where(x => x.Name == "chart").FirstOrDefault());
            chrt.ChartData.Series[0].DataPoints[0].Value.Data = data[1].MetricValue / 100;
            chrt.ChartData.Series[0].DataPoints[1].Value.Data = 1 - data[1].MetricValue / 100;
        }
        public void setColorForElement(IAutoShape shp, bool flag)
        {
            shp.FillFormat.FillType = FillType.Solid;
            shp.FillFormat.SolidFillColor.Color = (flag == true ? Color.FromArgb(221, 221, 221) : Color.FromArgb(247, 247, 247));
        }
    }
}