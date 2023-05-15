using Dine.Storyboard.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.StoryBoard.ReleaseLock
{
    class StoryboardRepository : IDisposable
    {
        StoryboardContext _context = null;
        protected bool disposed;

        public StoryboardRepository()
        {
            _context = new StoryboardContext();
        }

        public void ReleaseLock()
        {

            var reports = (from r in _context.Reports
                           where r.IsLocked == true
                           select r).AsEnumerable();
            if (reports != null)
            {
                foreach (var report in reports)
                {
                    DateTime StartDate = Convert.ToDateTime(report.LockedOn);
                    DateTime EndDate = DateTime.UtcNow;
                    TimeSpan t = EndDate - StartDate;
                    int x = int.Parse(t.Minutes.ToString());
                    if (x > 9)
                    {
                        report.IsLocked = false;
                        report.LockedBy = string.Empty;
                        report.LockedOn = null;
                        report.LockedByEmail = null;

                    }
                }
            }

            try
            {
                _context.SaveChanges();
            }
            catch(Exception ex)
            {
                ServiceLog.Log(ex);
                //TrackLogger.Logger.ErrLog(ex);
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
