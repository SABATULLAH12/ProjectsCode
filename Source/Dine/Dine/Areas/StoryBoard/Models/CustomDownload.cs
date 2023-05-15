using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class CustomDownload
    {
        public int Id { get; set; }
       [Required]
        public int ReportId { get; set; }
        [Required]
        public string Slides { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        public string Name { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsDeleted { get; set; }
        
    }

    public class CustomSlideDetails
    {
        public string SlideIndex { get; set; }
        public string SlideName { get; set; }       
        public string SlideIds { get; set; }
        public string Name { get; set; }
    }
}