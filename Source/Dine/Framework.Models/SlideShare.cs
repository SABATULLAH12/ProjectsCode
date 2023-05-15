using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Framework.Models
{
    public class SlideShare
    {
        public int Id { get; set; }
        public int REPORT_ID { get; set; }
        public string SharedTo { get; set; }
        public string SharedBy { get; set; }
        public DateTime? SharedOn { get; set; }
        public long? timeStamp { get; set; }
        public string SharedToMail { get; set; }
        public string SharedByMail { get; set; }
        public int isGroup { get; set; }
    }
}