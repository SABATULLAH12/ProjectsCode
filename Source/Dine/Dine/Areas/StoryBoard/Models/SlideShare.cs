using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class SlideShare
    {
        public int Id { get; set; }
        public int REPORT_ID { get; set; }
        public string SharedTo { get; set; }
        public string SharedBy { get; set; }
        public DateTime? SharedOn { get; set; }
        public string SharedToMail { get; set; }
        public string SharedByMail { get; set; }
    }
}