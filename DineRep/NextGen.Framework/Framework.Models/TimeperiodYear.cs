using System;

namespace Framework.Models
{
    public class TimeperiodYear
    {
        public object _ID { get; set; }
        public string ID
        {
            get { return _ID != null ? Convert.ToString(_ID) : null; }
            set { _ID = value; }
        }
        public string Text { get; set; }

        public string Year { get; set; }
    }
}
