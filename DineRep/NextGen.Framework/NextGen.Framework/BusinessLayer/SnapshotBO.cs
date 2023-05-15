using Framework.Data;
using Framework.Models;
using Framework.Models.Snapshot;
using System;
using System.Collections.Generic;

namespace NextGen.Framework.BusinessLayer
{
    public class SnapshotBO : IDisposable
    {
        private readonly ISnapshot snapshot = null;
        protected bool disposed = false;

        public SnapshotBO() { snapshot = new Snapshot(); }

        public FilterPanelMenu GetMenu() { return snapshot.GetMenu(); }

        public WidgetData GetWidgetData(FilterPanelInfo[] filter, WidgetInfo widget, CustomPropertyLabel customFilter)
        {
            return snapshot.GetSingleWidgetDetails(filter, widget, customFilter);
        }

        public WidgetData GetWidgetsData(FilterPanelInfo filter)
        {
            return snapshot.GetAllWidgetDetails(new WidgetInfo() { }, new object[] { });
        }

        public IEnumerable<Widgets> GetWidgets(FilterPanelInfo filter)
        {
            return snapshot.GetWidgets(new object[] { });
        }

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
            {
                snapshot.Dispose();
            }
        }
    }
}