using AutoMapper;
using Dine.Areas.StoryBoard.Models;
using Dine.Storyboard.Data;
using System;
using Framework.Data;
using System.Collections.Generic;
using System.Linq;
using Framework.Models;
using fm = Framework.Models;
using System.Web.Script.Serialization;
using System.Drawing;
using System.IO;


using sbmodels = Dine.Areas.StoryBoard.Models;

namespace Dine.BusinessLayer
{
    public class StoryboardRepository : IDisposable
    {
        private StoryboardContext _context = null;
        bool disposed = false;

        public StoryboardRepository()
        {
            _context = new StoryboardContext();
        }

        enum Months
        {
            Janaury=1,
            February=2,
            March=3,
            April=4,
            May=5,
            June=6,
            July=7,
            August=8,
            September=9,
            October=10,
            November=11,
            December=12
        }


        public IEnumerable<sbmodels.Report> GetReports(string email) {
           return Mapper.Map<IEnumerable<SbReport>, IEnumerable<sbmodels.Report>>(
                _context.Reports.Where(x => x.Email == email && !x.IsDeleted).AsEnumerable());
        }

        public string LockReport(int ReportID,object currentUser)
        {
            var lockedBy = string.Empty;
            var rp = (from r in _context.Reports
                      where r.Id == ReportID && r.IsLocked == false
                      select r).FirstOrDefault();
            if (rp == null)
            {
                lockedBy = (from r in _context.Reports
                            where r.Id == ReportID
                            select r.LockedBy).FirstOrDefault();

                if (lockedBy != ((Framework.Models.Users.UserDetail)currentUser).Name)
                {
                    return "Report is Locked by " + lockedBy;
                }
                else
                {
                    return "Successful";
                }
            }
            else
            {
                rp.IsLocked = true;
                rp.LockedBy = ((Framework.Models.Users.UserDetail)currentUser).Name;
                rp.LockedByEmail = ((Framework.Models.Users.UserDetail)currentUser).Email;
                rp.LockedOn = DateTime.UtcNow;
                _context.SaveChanges();
                return "Successful";
            }
        }

        public void ReleaseLock(int ReportID,object currentUser)
        {
            var rp = (from r in _context.Reports
                      where r.Id == ReportID && r.IsLocked == true
                      select r).FirstOrDefault();
            if (rp != null)
            {
                rp.IsLocked = false;
                rp.LockedBy = null;
                rp.LockedOn = null;
                rp.LockedByEmail = null;
            }
        }

        public IEnumerable<sbmodels.Report> GetSharedByMeReports(string email)
        {
            //Shared by me
            var data = Mapper.Map<IEnumerable<SbReport>, IEnumerable<sbmodels.Report>>(
                 from r in _context.SlideShare
                 join s in _context.Reports on r.REPORT_ID equals s.Id
                 where r.SharedByMail == email && !s.IsDeleted
                 select s
                 ).AsEnumerable().GroupBy(s => s.Name).Select(x => x.First());
            return data;
        }
        public IEnumerable<object> GetSharedWithMeReports(string email)
        {
            var data = from r in _context.SlideShare
                       join s in _context.Reports on r.REPORT_ID equals s.Id
                       where r.SharedToMail == email && !s.IsDeleted
                       select new { s.Id, s.Name, s.Email, s.CreatedBy, s.CreatedOn, s.UpdatedBy, s.UpdatedOn, s.IsDeleted, s.IsLocked, s.LockedBy, s.LockedByEmail, s.LockedOn, r.SharedByMail,r.SharedBy };
            return data.AsEnumerable().GroupBy(s=>s.Name).Select(x=>x.First());
        }
       
        public List<String> GetGroupsToShare(string email)
        {
            var GroupData = _context.UserGroup.GroupBy(x => x.GroupName).Select(x => x.Key);
            return GroupData.ToList();
        }
        public void ShareReportToUser(fm.SlideShare slideShare)
        {
            if (_context.SlideShare.Where(x => x.SharedByMail == slideShare.SharedByMail && x.SharedToMail == slideShare.SharedToMail && x.REPORT_ID == slideShare.REPORT_ID).ToList().Count > 0)
            {
                return;
            }
            var share = Mapper.Map<Framework.Models.SlideShare, SbSlideShare>(slideShare);
            _context.SlideShare.Add(share);
            _context.SaveChanges();
        }
        public void ShareReportToGroup(string GroupName, int reportId, string email, string name)
        {
            var groupMembers = Mapper.Map<IEnumerable<SbUserGroup>, IEnumerable<UserGroup>>(
                _context.UserGroup.Where(x => x.GroupName == GroupName && x.Email != email)
                .AsEnumerable());
            foreach (var item in groupMembers)
            {
                if (_context.SlideShare.Where(x=>x.SharedByMail==email && x.SharedToMail==item.Email && x.REPORT_ID==reportId).ToList().Count >0)
                {
                    continue;
                }
                fm.SlideShare slideShare = new fm.SlideShare { REPORT_ID = reportId, SharedBy = name, SharedByMail = email, SharedOn = DateTime.UtcNow, SharedTo = item.Name, SharedToMail = item.Email };
                var share = Mapper.Map<fm.SlideShare, SbSlideShare>(slideShare);
                _context.SlideShare.Add(share);
            }
            _context.SaveChanges();
        }

        public int AddSlideToReport(int ID, StoryBoardFilterInfo filter, object currentUser)
        {
            //var slide = Mapper.Map<SbSlide, Slide>(
            //    (from r in _context.Reports
            //     join s in _context.Slides on r.Id equals s.ReportId
            //     where r.Id == ID && !s.IsDeleted && !r.IsDeleted
            //     select s).FirstOrDefault());

            var rp = Mapper.Map<SbReport, sbmodels.Report>(
                (from r in _context.Reports
                 where r.Id == ID && !r.IsDeleted
                 select r).FirstOrDefault());

            //rp.Name = filter.ReportName;
            var original_rep = _context.Reports.Where(x => x.Id == rp.Id).FirstOrDefault();
            rp.UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name;
            rp.UpdatedOn = DateTime.UtcNow;
            if (original_rep != null) {
                original_rep.UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name;
                original_rep.UpdatedOn = DateTime.UtcNow;
            }
            var sbslide = new SbSlide()
            {
                Email = ((Framework.Models.Users.UserDetail)currentUser).Email,
                UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name,
                CreatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
                Filter = new JavaScriptSerializer().Serialize(filter.Filter),
                ReportId = rp.Id,
                Module = filter.Module,
                OutputData=new JavaScriptSerializer().Serialize(filter.OutputData),
                TimePeriodType=filter.TimePeriodType,
                FromTimeperiod=filter.FromTimePeriod,
                ToTimeperiod=filter.ToTimePeriod
            };
            _context.Slides.Add(sbslide);
            _context.SaveChanges();
            return sbslide.Id;
        }

        public void LastUpdated(SlideNotes note,object currentUser)
        {
            var slide = (from r in _context.Slides
                         where r.Id == note.SlideId 
                         select r).FirstOrDefault();
            var rptId = slide.ReportId;
            slide.UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name;
            slide.UpdatedOn = DateTime.UtcNow;
            _context.SaveChanges();
            var rpt  = (from r in _context.Slides
                        where r.Id == rptId
                        select r).FirstOrDefault();
            rpt.UpdatedBy= ((Framework.Models.Users.UserDetail)currentUser).Name;
            rpt.UpdatedOn = DateTime.UtcNow;
            _context.SaveChanges();
        }

        public string EditSlideAndReport(StoryBoardFilterInfo filter, object currentUser)
        {
            var rp= (from r in _context.Reports
                          where r.Id == filter.ReportID  && r.IsLocked==true
                          select r).FirstOrDefault();
            if (rp == null)
            {
                return "Report cannot be edited";
            }
            else
            {
                rp.UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name;
                rp.UpdatedOn = DateTime.UtcNow;
                _context.SaveChanges();

                var slide = (from r in _context.Slides
                             where r.Id == filter.SlideID && !r.IsDeleted
                             select r).FirstOrDefault();
                slide.UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name;
                slide.UpdatedOn = DateTime.UtcNow;
                slide.TimePeriodType = filter.TimePeriodType;
                slide.ToTimeperiod = filter.ToTimePeriod;
                slide.FromTimeperiod = filter.FromTimePeriod;
                slide.Filter = new JavaScriptSerializer().Serialize(filter.Filter);
                slide.Comment = filter.Comment;
                slide.OutputData = new JavaScriptSerializer().Serialize(filter.OutputData);                
                _context.SaveChanges();
                rp = (from r in _context.Reports
                      where r.Id == filter.ReportID && r.IsLocked
                      select r).FirstOrDefault();
                rp.LockedOn = null;
                rp.LockedBy = null;
                rp.LockedByEmail = null;
                rp.IsLocked = false;
                _context.SaveChanges();
                return "Slide Edited Successfully";
            }
        }

        public void AddNotesToSlide(SlideNotes Note)
        {
            var note = Mapper.Map<SlideNotes, SbSlideNotes>(Note);
            _context.SlideNotes.Add(note);
            _context.SaveChanges();
        }

        public IEnumerable<SlideNotes> GetSlideNotes(int SlideID)
        {
            return Mapper.Map<IEnumerable<SbSlideNotes>, IEnumerable<SlideNotes>>(
              _context.SlideNotes.Where(x => x.SlideId == SlideID).AsEnumerable());
        }



        public IEnumerable<Slide> GetReportSlides(int reportId)
        {
            return Mapper.Map<IEnumerable<SbSlide>, IEnumerable<Slide>>(
                  _context.Slides.Where(x => x.ReportId == reportId && !x.IsDeleted).AsEnumerable());
        }

        public IEnumerable<sbmodels.Report> GetFavoriteReports(string Email)
        {
            return Mapper.Map<IEnumerable<SbReport>, IEnumerable<sbmodels.Report>>(
            from f in _context.Favorites
            join r in _context.Reports on f.ReportId equals r.Id
            where r.Email == Email
            select r
            ).AsEnumerable();
        }

        public IEnumerable<Slide> GetSlides(int[] slides)
        {
            return Mapper.Map<IEnumerable<SbSlide>, IEnumerable<Slide>>(
                from r in _context.Slides
                join s in slides on r.Id equals s
                select r
                ).AsEnumerable();
        }


        public int AddReport(sbmodels.Report report)
        {
            var rpt = Mapper.Map<sbmodels.Report, SbReport>(report);
            _context.Reports.Add(rpt);
            _context.SaveChanges();
            rpt.Slides.FirstOrDefault().ReportId = rpt.Id;
            _context.Slides.Add(rpt.Slides.FirstOrDefault());
            _context.SaveChanges();
            var slideID = rpt.Slides.FirstOrDefault().Id;
            return slideID;
        }

        public void SaveAsReport(sbmodels.Report report,object currentUser)
        {
            var ID = report.Id;           
            report.Id = 0;
            var rpt = Mapper.Map<sbmodels.Report, SbReport>(report);
            _context.Reports.Add(rpt);
            _context.SaveChanges();
            var rept = rpt.Id;
            var slides = GetReportSlides(ID);
            foreach (var slide in slides)
            { 
                var sbslide = new SbSlide()
                {
                    Email = ((Framework.Models.Users.UserDetail)currentUser).Email,
                    UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name,
                    CreatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name,
                    CreatedOn = DateTime.UtcNow,
                    UpdatedOn = DateTime.UtcNow,
                    Filter = slide.Filter,
                    ReportId = rept,
                    Module = slide.Module,
                    OutputData = slide.OutputData,
                    TimePeriodType = slide.TimePeriodType,
                    FromTimeperiod = slide.FromTimeperiod,
                    ToTimeperiod = slide.ToTimeperiod
                };
                _context.Slides.Add(sbslide);
            }
            _context.SaveChanges();
           var  Reptslides = GetReportSlides(rept).ToArray();
            int i = 0;
            foreach(var slide in slides)
            {
                string fileName = slide.Id + ".png";
                string dstFileName = Reptslides[i].Id + ".png";
                string sourcePath = System.Web.HttpContext.Current.Server.MapPath("~/StoryBoard Images/");
                string sourceFile = System.IO.Path.Combine(sourcePath, fileName);
                string destFile = System.IO.Path.Combine(sourcePath, dstFileName);
                System.IO.File.Copy(sourceFile, destFile, true);
                i++;
            }
        }

        public string SaveCustomDownload(CustomDownload custom)
        {
            var cust = Mapper.Map<CustomDownload, SbCustomDownload>(custom);
            _context.CustomDownload.Add(cust);
            _context.SaveChanges();
            return "Saved Successfully";
        }

        public IEnumerable<CustomDownload> GetCustomDownloadList(int ReportID,object currentUser)
        {
            var Email = ((Framework.Models.Users.UserDetail)currentUser).Email;
            return Mapper.Map< IEnumerable<SbCustomDownload>,IEnumerable<CustomDownload>>(
              _context.CustomDownload.Where(x => x.ReportId == ReportID && !x.IsDeleted && x.Email==Email).AsEnumerable());
        }

       public string DeleteSavedCustomDownload(int ReportId,string Name, object currentUser)
        {
            var Email = ((Framework.Models.Users.UserDetail)currentUser).Email;
            var cd = _context.CustomDownload.Where(x => x.ReportId == ReportId && x.Email == Email && x.Name==Name && x.IsDeleted==false);
            if (cd != null)
            {
                cd.FirstOrDefault().IsDeleted = true;
                _context.SaveChanges();
                return "Deleted Successfully";
            }
            return "Cannot be deleted";
        }

         public void UpdateReport(sbmodels.Report report,object currentUser)
        {
            var ID = report.Id;
            report.Id = 0;
            var rpt = Mapper.Map<sbmodels.Report, SbReport>(report);
            _context.Reports.Add(rpt);
            _context.SaveChanges();
            var rept = rpt.Id;
            var slides = GetReportSlides(ID);
            foreach (var slide in slides)
            {
                var fltr = (new JavaScriptSerializer().Deserialize<List<FilterPanelInfo>>(slide.Filter));
                List<FilterPanelData> TimePd = getLatestTimePeriod(slide.FromTimeperiod, slide.TimePeriodType, slide.ToTimeperiod, fltr[0].isTrendTable, fltr[0].trendGap);
                TimePd.Reverse();
                if (fltr[0].isTrendTable == "true")
                {
                    fltr.Where(x => x.Name == "Time Period").FirstOrDefault().Data = TimePd.ToArray();
                }
                else {
                    fltr.Where(x => x.Name == "Time Period").FirstOrDefault().Data = new FilterPanelData[]{ TimePd[0]};
                }                
                slide.Filter = (new JavaScriptSerializer()).Serialize(fltr);
                var sbslide = new SbSlide()
                {
                    Email = ((Framework.Models.Users.UserDetail)currentUser).Email,
                    UpdatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name,
                    CreatedBy = ((Framework.Models.Users.UserDetail)currentUser).Name,
                    CreatedOn = DateTime.UtcNow,
                    UpdatedOn = DateTime.UtcNow,
                    Filter = slide.Filter,
                    ReportId = rept,
                    Module = slide.Module,
                    OutputData = slide.OutputData,
                    FromTimeperiod = TimePd[0].Text,
                    ToTimeperiod = TimePd[TimePd.Count - 1].Text,
                    TimePeriodType = slide.TimePeriodType
                };
                _context.Slides.Add(sbslide);
            }
            _context.SaveChanges();
            var Reptslides = GetReportSlides(rept).ToArray();
            int i = 0;
            foreach (var slide in slides)
            {
                string fileName = slide.Id + ".png";
                string dstFileName = Reptslides[i].Id + ".png";
                string sourcePath = System.Web.HttpContext.Current.Server.MapPath("~/StoryBoard Images/");
                string sourceFile = System.IO.Path.Combine(sourcePath, fileName);
                string destFile = System.IO.Path.Combine(sourcePath, dstFileName);
                //In case image does not exits
                if (File.Exists(sourceFile)) {
                    System.IO.File.Copy(sourceFile, destFile, true);
                }                
                i++;
            }
        }

        private List<FilterPanelData> getLatestTimePeriod(string FromTimeperiod, string timePeriodType,string ToTimePeriod,string istrend,int gap)
        {
            /*Get latest time period from backend*/
            string firstAndLastTP = "1";
            if (istrend != null && istrend == "true")
            {
                if (gap != null || gap != 0)
                {
                    for (int i = 1; i <= gap; i++)
                    {
                        firstAndLastTP = String.Concat(firstAndLastTP, "|" + (gap == null || gap == 0 ? 1 : 1 + i));
                    }
                }
                else {
                    firstAndLastTP = String.Concat(firstAndLastTP,"|"+(gap==null||gap==0?1:1+gap));
                }
            }
            else {
                firstAndLastTP = String.Concat(firstAndLastTP, "|1");
            }
            return (new StoryBoardDA()).getLatestTimePeriod(timePeriodType, firstAndLastTP);
            //if (FromTimeperiod.Trim().ToLower() == "total") {
            //    return new string[] { "Total", "Total" };
            //}
            //Chart chart = new Chart();
            //string[] FTP = FromTimeperiod.Split(' ');
            //string[] TTP = ToTimePeriod == null ? new string[]{ "",""} : ToTimePeriod.Split(' ');
            //Months FMonth = (Months)Enum.Parse(typeof(Months), FTP[0]);
            //Months TMonth = (Months)Enum.Parse(typeof(Months), TTP[0]);          
            //int FMonthNumber = Convert.ToInt32(FMonth);
            //int TMonthNumber = Convert.ToInt32(TMonth);
            //int FYear = Convert.ToInt32(FTP[1]);
            //int TYear= Convert.ToInt32(TTP[1]);
            //int MonthDiff = TMonth - FMonth;
            //IList<TimeperiodYear> Tp = chart.GetTimePeriod();
            //int LatestFromMonthNumber = FMonthNumber;
            //int LatestToMonthNumber = TMonthNumber;
            //int LatestFromYear=FYear;
            //int LatestToYear=TYear;
            //string LatestToMonth=string.Empty;
            //string LatestFromMonth=string.Empty;
            //var TimePd = Tp.Where(x => Convert.ToInt32(x.Year) >= TYear);
            ////Same Month
            //if (MonthDiff == 0)
            //{
            //    //Same Year
            //    if (FYear == TYear)
            //    {                   
            //        for (var i = 0; i < TimePd.Count(); i++)
            //        {
            //            Months FinalFMonth = (Months)Enum.Parse(typeof(Months), Tp[i].Text.Split(' ')[0]);
            //            int FinalFMonthNumber = Convert.ToInt32(FinalFMonth);
            //            int FinalFYear = Convert.ToInt32(Tp[i].Year);
            //            if(FinalFMonthNumber >= LatestFromMonthNumber && FinalFYear >= LatestFromYear)
            //            {
            //                LatestFromMonthNumber = FinalFMonthNumber;
            //                LatestToMonthNumber = FinalFMonthNumber;
            //                LatestFromYear = FinalFYear;
            //                LatestToYear = FinalFYear;
            //                LatestToMonth = FinalFMonth.ToString();
            //                LatestFromMonth = FinalFMonth.ToString();
            //            }
            //        }
            //    }
            //    //Different Year
            //    else
            //    {
            //        int YearDiff = TYear - FYear;
            //        for (var i = 0; i < TimePd.Count(); i++)
            //        {
            //            Months FinalTMonth = (Months)Enum.Parse(typeof(Months), Tp[i].Text.Split(' ')[0]);
            //            int FinalTMonthNumber = Convert.ToInt32(FinalTMonth);
            //            int FinalTYear = Convert.ToInt32(Tp[i].Year);
            //            if (FinalTMonthNumber >= LatestToMonthNumber && FinalTYear >= LatestToYear)
            //            {
            //                LatestFromMonthNumber = FinalTMonthNumber;
            //                LatestToMonthNumber = FinalTMonthNumber;
            //                LatestToYear = FinalTYear;
            //                LatestFromYear = FinalTYear - YearDiff;
            //                LatestToMonth = FinalTMonth.ToString();
            //                LatestFromMonth = FinalTMonth.ToString();
            //            }
            //        }

            //    }              
            //}
            ////Different Month and toMonth is greater than FromMonth
            //else if (MonthDiff>0)
            //{
            //    //Same year
            //    if(FYear == TYear) {
            //        for (var i = 0; i < TimePd.Count(); i++)
            //        {
            //            Months FinalTMonth = (Months)Enum.Parse(typeof(Months), Tp[i].Text.Split(' ')[0]);
            //            int FinalTMonthNumber = Convert.ToInt32(FinalTMonth);
            //            int FinalTYear = Convert.ToInt32(Tp[i].Year);
            //            if (FinalTMonthNumber >= LatestToMonthNumber && FinalTYear >= LatestToYear)
            //            {
            //                LatestFromMonthNumber = FinalTMonthNumber-MonthDiff;
            //                LatestToMonthNumber = FinalTMonthNumber;
            //                LatestToYear = FinalTYear;
            //                LatestFromYear = FinalTYear;
            //                LatestToMonth = Enum.GetName(typeof(Months), LatestFromMonthNumber); ;
            //                LatestFromMonth = FinalTMonth.ToString();
            //            }
            //        }
            //    }
            //}
            ////Different Month and toMonth is smaller than FromMonth
            //else if (MonthDiff < 0)
            //{
            //    int YearDiff = TYear - FYear;
            //    int AbsMonthDiff = Math.Abs(MonthDiff);
            //    if (AbsMonthDiff > 12)
            //    {

            //    }
            //}
            //string[] time = { LatestFromMonth + " " + LatestFromYear,LatestToMonth+" "+LatestToYear  };
            //return time; 
        }

        public sbmodels.Report GetReportDetails(int ReportId)
        {
            return Mapper.Map<SbReport,sbmodels.Report>(
               _context.Reports.Where(x => x.Id == ReportId && !x.IsDeleted).FirstOrDefault());
        }
        public Slide GetSlideDetails(int SlideId)
        {
            return Mapper.Map<SbSlide, Slide>(
               _context.Slides.Where(x => x.Id == SlideId && !x.IsDeleted).FirstOrDefault());
        }

        public void DeleteReport(int reportId, string email)
        {
            var rpt = _context.Reports.Where(x => x.Id == reportId && x.Email== email);
            if (rpt != null)
            {
                if (rpt.ToList().Count > 0)
                {
                    rpt.FirstOrDefault().IsDeleted = true;
                    _context.SaveChanges();
                }
            }
        }

        public bool AddReportToFavorite(FavoriteReport frpt)
        {
            var rpt = Mapper.Map<FavoriteReport, SbFavoriteReport>(frpt);
            var isThere = _context.Favorites.Where(x=>x.ReportId == rpt.ReportId && x.Email == rpt.Email).FirstOrDefault();
            if (isThere == null)
            {
                _context.Favorites.Add(rpt);
                _context.SaveChanges();
                return true;
            }
            else { return false; }
        }

        public void RemoveMyFavorite(FavoriteReport frpt)
        {
            var rpt = Mapper.Map<FavoriteReport, SbFavoriteReport>(frpt);
            var rpt1 = _context.Favorites.Where(x => x.ReportId == rpt.ReportId && x.Email == rpt.Email).FirstOrDefault();
            if (rpt1 != null)
            {
                _context.Favorites.Remove(rpt1);
                _context.SaveChanges();
            }
        }

        public string DeleteSlide(int[] SlideID, string Email)
        {
            var ID = SlideID[0];
            var slide = _context.Slides.Where(x => x.Id == ID).FirstOrDefault();
                var reportId = slide.ReportId;
            var Report = GetReportDetails(reportId);
                var slides = _context.Slides.Where(x => x.ReportId == reportId && !x.IsDeleted).AsEnumerable();
                var sharedSlides = _context.SlideShare.Where(x => x.SharedByMail == Email || x.SharedToMail == Email).AsEnumerable();
                var selSlides = (from s in slides
                                 join r in sharedSlides on s.ReportId equals r.REPORT_ID into gj
                                 from x in gj.DefaultIfEmpty()
                                 select s).AsEnumerable();
                var msg = string.Empty;
            if (selSlides.Count() == 1)
            {
                if (selSlides.FirstOrDefault().Email == Email)
                {
                    selSlides.FirstOrDefault().IsDeleted = true;
                    _context.SaveChanges();
                    DeleteReport(reportId, Email);
                    msg = "Report Deleted Successfully";
                }
                else
                    msg = "Slide can only be deleted by owner";
            }
            else
            {
                 var deletedCount = 0;
                for (int i = 0; i < SlideID.Length; i++)
                {                
                    for (int j = 0; j < selSlides.Count(); j++)
                    {
                        if (SlideID.Length == selSlides.Count())
                        {
                            if (SlideID[i] == selSlides.ElementAt(j).Id)
                            {
                                if (deletedCount < selSlides.Count()-1)
                                {
                                    selSlides.ElementAt(j).IsDeleted = true;
                                    deletedCount++;
                                }
                                else if (deletedCount == selSlides.Count()-1)
                                {
                                    if (selSlides.ElementAt(j).Email == Report.Email)
                                    {
                                        selSlides.ElementAt(j).IsDeleted = true;
                                        deletedCount++;
                                        _context.SaveChanges();
                                        DeleteReport(reportId, Email);
                                        msg = "Report Deleted Successfully";
                                    }
                                    else
                                    {
                                        _context.SaveChanges();
                                        msg = "Last Slide can only be deleted by owner";
                                    }
                                }
                            }
                        }
                        else
                        {
                            if (SlideID[i] == selSlides.ElementAt(j).Id)
                            {
                                selSlides.ElementAt(j).IsDeleted = true;
                                    deletedCount++;
                                if (deletedCount == SlideID.Length)
                                {
                                    _context.SaveChanges();
                                    msg = "Slide deleted Successfully";
                                }                    
                            }
                        }

                    }
                }
            }
                
            
            return msg;
        }

        public void SaveByteArrayAsImage(string base64String, int Id)
        {
            string fullOutputPath = System.Web.HttpContext.Current.Server.MapPath("~/StoryBoard Images/" + Id + ".png");
            string convert = base64String.Replace("data:image/png;base64,", String.Empty);
            byte[] bytes = Convert.FromBase64String(convert);
            Image image;
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                FileInfo file = new FileInfo(fullOutputPath);
                if (file.Exists)
                {
                    file.Delete();
                }
                    image = Image.FromStream(ms);
                    image.Save(fullOutputPath, System.Drawing.Imaging.ImageFormat.Png);
            }
        }

        public void Dispose()
        {
            Dispose(true);
        }

        public void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                if (_context != null)
                    _context.Dispose();
                this.Dispose();
                disposed = true;
            }
        }

    }
}