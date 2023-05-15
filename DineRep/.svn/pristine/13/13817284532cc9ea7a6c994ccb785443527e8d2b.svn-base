using Newtonsoft.Json;
using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Models;
using Framework.Models;
using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Text;

namespace NextGen.Core.Configuration
{
    public sealed class ModuleConfig : IModuleConfig
    {
        #region Fields
        private ViewConfiguration _view = null;
        private string _configPath = null;
        HttpContext context = HttpContext.Current;
        #endregion
        #region Properties

        public string ActiveUserName { get { return Convert.ToString(HttpContext.Current.Session["ActiveUserName"]); } }

        #endregion 
        #region Methods
        private ModuleConfig() { }

        public ModuleConfig(string configPath)
        {
            var json = File.ReadAllLines(HttpContext.Current.Server.MapPath(configPath));
            if (json != null && json.Length > 0)
                _view = JsonConvert.DeserializeObject<ViewConfiguration>(string.Join(" ", json)) ?? new ViewConfiguration();
            else
                _view = new ViewConfiguration();
            _configPath = configPath;
        }

        public string ConfigPath { get { return _configPath; } }

        public ViewConfiguration GetInfo { get { return _view; } }

        public string BuildQuery(ViewConfigDatabase db)
        {
            if (db == null)
                return null;

            StringBuilder query = new StringBuilder();
            query.Append("SELECT ");
            query.Append("[" + db.PrimaryKey + "], [" + db.DisplayTextColumnName + "]");
            if (!string.IsNullOrEmpty(db.ParentPrimaryKey))
                query.Append(", [" + db.ParentPrimaryKey + "]");
            if (!string.IsNullOrEmpty(db.ParentText))
                query.Append(", [" + db.ParentText + "]");
            if (!string.IsNullOrEmpty(db.SelectableColumnName))
                query.Append(", [" + db.SelectableColumnName + "]");
            if (!string.IsNullOrEmpty(db.IsSubHeading))
                query.Append(", [" + db.IsSubHeading + "]");
            if (!string.IsNullOrEmpty(db.InlineLevel))
                query.Append(", [" + db.InlineLevel + "]");
            if (!string.IsNullOrEmpty(db.IsSubHeadingID))
                query.Append(", [" + db.IsSubHeadingID + "]");
            if (!string.IsNullOrEmpty(db.SearchName))
                query.Append(", [" + db.SearchName + "]");
            if (!string.IsNullOrEmpty(db.LevelId))
                query.Append(", [" + db.LevelId + "]");
            if (!string.IsNullOrEmpty(db.ShowAll))
                query.Append(", [" + db.ShowAll + "]");
            if (!string.IsNullOrEmpty(db.ParentOfParent))
                query.Append(", [" + db.ParentOfParent + "]");
            if (!string.IsNullOrEmpty(db.Colorcode))
                query.Append(", [" + db.Colorcode + "]");
            if (!string.IsNullOrEmpty(db.GuestOrVisitFilter))
                query.Append(", [" + db.GuestOrVisitFilter + "]");
            if (!string.IsNullOrEmpty(db.IsChannelFlag))
                query.Append(", [" + db.IsChannelFlag + "]");
            if (!string.IsNullOrEmpty(db.WhereCondition))
            {
                if (db.WhereCondition.Contains("{0}"))
                {
                    query.Append(" FROM " + db.Table + " " + string.Format(db.WhereCondition, Convert.ToString(HttpContext.Current.Session["ActiveUserName"])));
                }
                else
                {
                    query.Append(" FROM " + db.Table + " " + db.WhereCondition);
                }
            }
            else
            {
                query.Append(" FROM " + db.Table);
            }
            return query.ToString();
        }

        public string GetMenuFilterQuery()
        {
            string query = string.Empty;
            if (_view != null && _view.Filter.Filters != null && _view.Filter.Filters.Count > 0)
            {
                foreach (var info in _view.Filter.Filters)
                    query += BuildQuery(info.Database) + "; ";
            }
            return query;
        }

        public object[] GetFactQuery(FilterPanelInfo[] filter, CustomPropertyLabel customFilter)
        {
            object[] param = null;
            if (_view.IsProcedure)
            {
                param = new object[_view.Procedure.Parameters == null ? 0 : _view.Procedure.Parameters.Length];
                var index = 0;
                if (param.Length > 0)
                {
                    foreach (var p in _view.Procedure.Parameters)
                    {
                        if (!string.IsNullOrEmpty(p.CustomPropertyLabel) && customFilter != null)
                        {
                            param[index] = customFilter.GetType().GetProperty(p.CustomPropertyLabel).GetValue(customFilter);
                        }
                        else if (string.IsNullOrEmpty(p.FilterLabel))
                            param[index] = p.DefaultValue;
                        else
                        {
                            var i = _view.Filter.Filters.IndexOf(_view.Filter.Filters.Where(y => string.Compare(y.Label, p.FilterLabel, true) == 0).FirstOrDefault());
                            var f = filter.Length > i ? filter[i] : null;
                            var data = string.Empty;
                            if (f != null)
                                for (var x = 0; x < f.Data.Length; x++)
                                    data += data.Length > 0 ? p.Format + Convert.ToString(f.Data[x].ID) : Convert.ToString(f.Data[x].ID);
                            param[index] = p.Prefix + data + p.Postfix;
                        }
                        index++;
                    }
                }
            }
            return param;
        }

        public object[] GetWidgetQuery(FilterPanelInfo[] filter, CustomPropertyLabel customFilter, string WidgetName)
        {
            object[] param = null;
            var proc = _view.Widgets.Where(x => Convert.ToString(x.WidgetName).ToLower() == (WidgetName.ToLower())).FirstOrDefault();
            if (proc == null)
                return param;

            param = new object[proc.Parameters == null ? 0 : proc.Parameters.Length];
            var index = 0;
            if (param.Length > 0)
            {
                foreach (var p in proc.Parameters)
                {
                    if (!string.IsNullOrEmpty(p.CustomPropertyLabel) && customFilter != null)
                    {
                        param[index] = customFilter.GetType().GetProperty(p.CustomPropertyLabel).GetValue(customFilter);
                    }
                    else if (string.IsNullOrEmpty(p.FilterLabel))
                        param[index] = p.DefaultValue;
                    else
                    {
                        var i = _view.Filter.Filters.IndexOf(_view.Filter.Filters.Where(y => string.Compare(y.Label, p.FilterLabel, true) == 0).FirstOrDefault());
                        var f = filter.Length > i ? filter[i] : null;
                        var data = string.Empty;
                        if (f != null)
                            for (var x = 0; x < f.Data.Length; x++)
                                data += data.Length > 0 ? p.Format + Convert.ToString(f.Data[x].ID) : Convert.ToString(f.Data[x].ID);
                        param[index] = p.Prefix + data + p.Postfix;
                    }
                    index++;
                }
            }
            return param;
        }

        public void Update(ViewFilter filter)
        {
            _view.Filter = filter;
            UpdateJson();
        }

        public void Update(ViewConfigProcedure filter)
        {
            _view.Procedure = filter;
            UpdateJson();
        }

        public void Update(SnapshotWidgets[] widgets)
        {
            _view.Widgets = widgets;
            UpdateJson();
        }

        private void UpdateJson()
        {
            if (_view != null && File.Exists(context.Server.MapPath(_configPath)))
            {
                File.WriteAllText(context.Server.MapPath(_configPath), JsonConvert.SerializeObject(_view));
            }
        }
        #endregion
    }
}
