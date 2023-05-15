using Dine.Storyboard.Data;
using System.Data;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.ServiceProcess;
using System.Timers;
using System.Collections.Generic;
using System;

namespace Dine.StoryBoard.ReleaseLock
{
    public partial class Dine_StoryBoard_ReleaseLock : ServiceBase
    {
        private Timer _timer;
        private StoryboardRepository sbr = null;
        public Dine_StoryBoard_ReleaseLock()
        {
            sbr = new StoryboardRepository();
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            ServiceLog.Log("Starting.." + DateTime.UtcNow.ToLongDateString());
            //TrackLogger.Logger.Log("status", "Starting");
            _timer = new Timer();
            _timer.Interval = 1000;
            _timer.Elapsed += new ElapsedEventHandler(OnTimerElapsed);
            _timer.Start();
            //TrackLogger.Logger.Log("status", "Started");
            ServiceLog.Log("Started.." + DateTime.UtcNow.ToLongDateString());
        }

        protected override void OnStop()
        {
            ServiceLog.Log("Stopped.." + DateTime.UtcNow.ToLongDateString());
            _timer.Stop();
        }

        private void OnTimerElapsed(object sender, ElapsedEventArgs e)
        {
            //TrackLogger.Logger.Log("release status", "Releasing");
            _timer.Interval = 60000;
            //ServiceLog.Log("Releasing.." + DateTime.UtcNow.ToLongDateString());
            sbr.ReleaseLock();
            //TrackLogger.Logger.Log("release status", "Released");
        }
    }
}