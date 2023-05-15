using System;

namespace Framework.Models
{
    public class PanelData
    {
        public string Text { get; set; }
        public object _ID { get; set; }
        public string ID
        {
            get
            {
                if (_ID != null) return Convert.ToString(_ID);
                else return null;
            }
            set { _ID = value; }
        }
        public object _ParentID { get; set; }
        public string ParentID
        {
            get
            {
                if (_ParentID == null)
                    return null;
                else
                    return Convert.ToString(_ParentID);
            }
            set { _ParentID = value; }
        }
        public string ParentText { get; set; }
        public int ChildCount { get; set; }

        public bool IsSelectable { get; set; }
        public string InlineLevel { get; set; }
        public string IsSubHeading { get; set; }
        public string IsSubHeadingID { get; set; }
        public string SearchName { get; set; }
        public string LevelId { get; set; }
        public string ShowAll { get; set; }
        public string ParentOfParent { get; set; }
        public string Colorcode { get; set; }
        public string MyProperty { get; set; }
        public bool GuestOrVisitFilter { get; set; }
        public string IsChannelFlag { get; set; }
        public string IsImageriesFlag { get; set; }

    }
}
