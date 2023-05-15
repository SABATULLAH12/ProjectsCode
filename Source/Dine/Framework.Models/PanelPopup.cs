using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Framework.Models
{
    public class PanelPopup
    {
        public IList<PanelList> Popup { get; private set; }

        public void AddData(PanelData data)
        {
            if (data != null && !string.IsNullOrEmpty(data.Text))
            {
                if (Popup == null)
                    Popup = new List<PanelList>();
                IList<PanelData> lst = null;
                PanelList panel = null;
                int keylevel = 1;

                if (string.IsNullOrEmpty(data.ParentText) && string.IsNullOrEmpty(Convert.ToString(data._ParentID)))
                {
                    #region first level
                    if (Popup.Count > 0)
                    {
                        panel = Popup.Where(x => x.Level == keylevel).FirstOrDefault();
                        if (panel != null)
                        {
                            if (panel.Data == null)
                                panel.Data = new List<PanelData>();
                            panel.Data.Add(data);
                        }
                    }
                    else
                    {
                        lst = new List<PanelData>();
                        lst.Add(data);
                        panel = new PanelList()
                        {
                            Level = keylevel,
                            Data = lst
                        };
                        Popup.Add(panel);
                    }
                    #endregion
                }
                else
                {
                    if (Popup.Count > 0)
                    {
                        #region other than first level

                        for (var y = 0; y < Popup.Count; y++)
                        {
                            var found = !string.IsNullOrEmpty(Convert.ToString(data._ParentID))
                                ? Popup[y].Data.Where(x => Convert.ToString(x._ID).Equals(Convert.ToString(data._ParentID))) : Popup[y].Data.Where(x => x.Text == data.ParentText);

                            if (found != null && found.Count() > 0)
                            {
                                //increment the child count
                                found.FirstOrDefault().ChildCount += 1;

                                data._ParentID = found.FirstOrDefault()._ID;
                                data.ParentText = found.FirstOrDefault().Text;

                                //edited by Nagaraju D for showing all the levels 
                                //Date: 17-08-2017
                                if (!string.IsNullOrEmpty(Convert.ToString(data.LevelId)))
                                    keylevel = Convert.ToInt16(data.LevelId) + 1;
                                else
                                    keylevel = Popup[y].Level + 1;

                                var tmplst = Popup.Where(x => x.Level == keylevel).Select(x => x.Data);
                                if (tmplst != null && tmplst.Count() > 0)
                                    tmplst.FirstOrDefault().Add(data);
                                else
                                {
                                    lst = new List<PanelData>();
                                    lst.Add(data);
                                    panel = new PanelList()
                                    {
                                        Level = keylevel,
                                        Data = lst
                                    };
                                    Popup.Add(panel);
                                }
                                break;
                            }
                        }
                        #endregion
                    }
                }
            }
        }
    }
}
