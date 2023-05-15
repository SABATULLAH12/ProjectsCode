using AqUtility.Cached;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using NextGen.Core.Configuration.Interfaces;
using Framework.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;

namespace NextGen.Core.Data
{
    public abstract class BaseDataLayer : IDisposable
    {
        #region Fields
        protected SqlDatabase database = null;
        protected DbCommand cmd = null;
        protected bool disposed = false;
        #endregion

        private BaseDataLayer() { }

        public BaseDataLayer(string connString)
        {
            if (string.IsNullOrEmpty(connString))
                throw new ArgumentNullException("connString should never be null or empty. It should be provided with the configuration.");

            database = new SqlDatabase(connString);
        }

        #region virtual methods
        protected virtual DataSet ExecuteDataSet(string storedProcedure, params object[] param)
        {
            cmd = GetStoredProcCommand(storedProcedure, param);
            return database.ExecuteDataSet(cmd);
        }

        protected virtual int ExecuteNonQuery(string storedProcedure, params object[] param)
        {
            cmd = GetStoredProcCommand(storedProcedure, param);
            return database.ExecuteNonQuery(cmd);
        }
        protected virtual IDataReader ExecuteReaderForLeftPanel(string storedProcedure, string userId)
        {
            cmd = GetStoredProcCommand(storedProcedure, null);

            database.AddInParameter(cmd, "@UserId", SqlDbType.VarChar, userId);

            return database.ExecuteReader(cmd);
        }

        protected virtual IDataReader ExecuteReader(string storedProcedure, params object[] param)
        {
            cmd = GetStoredProcCommand(storedProcedure, param);
            return database.ExecuteReader(cmd);
        }

        protected virtual DbCommand GetStoredProcCommand(string storedProcedureName, params object[] param)
        {
            DbCommand _cmd = null;
            if (param == null)
                _cmd = database.GetStoredProcCommand(storedProcedureName);
            else
                _cmd = database.GetStoredProcCommand(storedProcedureName, param);
            _cmd.CommandTimeout = 300;
            return _cmd;
        }

        protected virtual IDataReader ExecuteQueryReader(string query)
        {
            cmd = database.GetSqlStringCommand(query);
            return database.ExecuteReader(cmd);
        }

        public virtual FilterPanelMenu GetMenu(IModuleConfig module)
        {
            FilterPanelMenu filterinfo = null;
            var index = 0;

            //  filterinfo = CachedQuery<FilterPanelMenu>.Cache.GetData(module.GetInfo.Filter.IsFilterProcedure ? module.GetInfo.Filter.ProcedureName : module.GetMenuFilterQuery());
            //filterinfo = CachedQuery<FilterPanelMenu>.Cache.GetData(module.GetInfo.Filter.IsFilterProcedure ? module.GetInfo.Filter.ProcedureName + module.ActiveUserName : module.GetMenuFilterQuery());

            if (filterinfo == null)
                filterinfo = new FilterPanelMenu() { Filter = new List<PanelInfo>() };
            else
                return filterinfo;

            //using (IDataReader dr = module.GetInfo.Filter.IsFilterProcedure ? ExecuteReader(module.GetInfo.Filter.ProcedureName) : ExecuteQueryReader(module.GetMenuFilterQuery()))
            //{
            using (IDataReader dr = module.GetInfo.Filter.IsFilterProcedure ? ExecuteReaderForLeftPanel(module.GetInfo.Filter.ProcedureName, module.ActiveUserName) : ExecuteQueryReader(module.GetMenuFilterQuery()))
            {
                do
                {
                    PanelPopup paneld = new PanelPopup();
                    IList<TimePeriod> tp = new List<TimePeriod>();
                    var fd = module.GetInfo.Filter.Filters[index];

                    if (fd.IsTimePeriod)
                    {
                        #region Timeperiod
                        while (dr.Read())
                        {
                            var tpinterval = fd.Database.ParentText == null ? null : dr[fd.Database.ParentText] as string;
                            var tpdesc = dr[fd.Database.DisplayTextColumnName] as string;
                            int? tpdescid = (dr[fd.Database.PrimaryKey]) as int?;
                            var tpyear = fd.Database.TimeperiodYearBreakUp == null ? null : dr[fd.Database.TimeperiodYearBreakUp] as string;

                            if (!string.IsNullOrEmpty(tpinterval))
                            {
                                var tpnew = tp.Where(x => x.Interval == tpinterval).FirstOrDefault();

                                if (tpnew == null)
                                {
                                    tp.Add(new TimePeriod() { Interval = tpinterval, Years = new List<TimeperiodYear>() });
                                    tpnew = tp.Where(x => x.Interval == tpinterval).FirstOrDefault();
                                }

                                if (tpnew != null)
                                {
                                    tpnew.Interval = tpinterval;
                                    if (tpnew.Years == null)
                                        tpnew.Years = new List<TimeperiodYear>();

                                    tpnew.Years.Add(new TimeperiodYear() { _ID = tpdescid, Text = tpdesc, Year = tpyear });
                                }
                            }
                        }
                        #endregion
                    }
                    else
                    {
                        #region Other than timeperiod
                        while (dr.Read())
                        {
                            object _pid = string.IsNullOrEmpty(fd.Database.ParentPrimaryKey) ? null : dr[fd.Database.ParentPrimaryKey];
                            string _ptext = string.IsNullOrEmpty(fd.Database.ParentText) ? null : dr[fd.Database.ParentText] as string;
                            bool isselectable = true;
                            if (!string.IsNullOrEmpty(fd.Database.SelectableColumnName) && dr[fd.Database.SelectableColumnName] != DBNull.Value)
                                isselectable = Convert.ToBoolean(dr[fd.Database.SelectableColumnName]);
                            bool guestorvisits = false;
                            if (!string.IsNullOrEmpty(fd.Database.GuestOrVisitFilter) && dr[fd.Database.GuestOrVisitFilter] != DBNull.Value)
                                guestorvisits = (bool)dr[fd.Database.GuestOrVisitFilter];


                            paneld.AddData(new PanelData()
                            {
                                _ID = dr[fd.Database.PrimaryKey],
                                Text = dr[fd.Database.DisplayTextColumnName] as string,
                                ParentText = _ptext,
                                _ParentID = _pid,
                                IsSelectable = isselectable,
                                InlineLevel = string.IsNullOrEmpty(fd.Database.InlineLevel) ? null : Convert.ToString(dr[fd.Database.InlineLevel]),
                                IsSubHeading = string.IsNullOrEmpty(fd.Database.IsSubHeading) ? null : Convert.ToString(dr[fd.Database.IsSubHeading]),
                                IsSubHeadingID = string.IsNullOrEmpty(fd.Database.IsSubHeadingID) ? null : Convert.ToString(dr[fd.Database.IsSubHeadingID]),
                                SearchName = string.IsNullOrEmpty(fd.Database.SearchName) ? null : Convert.ToString(dr[fd.Database.SearchName]),
                                LevelId = string.IsNullOrEmpty(fd.Database.LevelId) ? null : Convert.ToString(dr[fd.Database.LevelId]),
                                ShowAll = string.IsNullOrEmpty(fd.Database.ShowAll) ? null : Convert.ToString(dr[fd.Database.ShowAll]),
                                ParentOfParent = string.IsNullOrEmpty(fd.Database.ParentOfParent) ? null : Convert.ToString(dr[fd.Database.ParentOfParent]),
                                Colorcode = string.IsNullOrEmpty(fd.Database.Colorcode) ? null : Convert.ToString(dr[fd.Database.Colorcode]),
                                GuestOrVisitFilter = guestorvisits,
                                IsChannelFlag = string.IsNullOrEmpty(fd.Database.IsChannelFlag) ? null : Convert.ToString(dr[fd.Database.IsChannelFlag]),
                                IsImageriesFlag = string.IsNullOrEmpty(fd.Database.IsImageriesFlag) ? null : Convert.ToString(dr[fd.Database.IsImageriesFlag]),
                            });
                        }
                        #endregion
                    }

                    filterinfo.Filter.Add(new PanelInfo()
                    {
                        Label = fd.Label,
                        IsMultiSelect = fd.IsMultiSelect,
                        IsRequired = fd.IsRequired,
                        Image = fd.Image,
                        PanelPopup = paneld.Popup,
                        IsTimeperiod = fd.IsTimePeriod,
                        Time = tp,
                        IsFilterBasedOnOtherFilter = fd.IsFilterBasedOnOtherFilter
                    });
                    index++;
                } while (dr.NextResult());
            }

            //CachedQuery<FilterPanelMenu>.Cache.SetData(module.GetInfo.Filter.IsFilterProcedure ? module.GetInfo.Filter.ProcedureName : module.GetMenuFilterQuery(), filterinfo);
            //CachedQuery<FilterPanelMenu>.Cache.SetData(module.GetInfo.Filter.IsFilterProcedure ? module.GetInfo.Filter.ProcedureName + module.ActiveUserName : module.GetMenuFilterQuery(), filterinfo);
            return filterinfo;

        }
        #endregion

        #region interface implementation
        public void Dispose()
        {
            if (!disposed)
            {
                Dispose(true);
                GC.SuppressFinalize(this);
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
                cmd.Dispose();
            disposed = true;
        }
        #endregion
    }
}
