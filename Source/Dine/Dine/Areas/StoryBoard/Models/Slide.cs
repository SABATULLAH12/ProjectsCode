using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class Slide
    {
        public int Id { get; set; }
        [Required]
        public int ReportId { get; set; }
     
        public string Comment { get; set; }
        
        public string CreatedBy { get; set; }

        public string Module { get; set; }
        public DateTime? CreatedOn { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
       

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedOn { get; set; }
        [Required]

        public bool IsDeleted { get; set; }
       
        public string TimePeriodType { get; set; }
       
        public string FromTimeperiod { get; set; }
        
        public string ToTimeperiod { get; set; }
       
        public string Filter { get; set; }

        public string OutputData { get; set; }
    }
}