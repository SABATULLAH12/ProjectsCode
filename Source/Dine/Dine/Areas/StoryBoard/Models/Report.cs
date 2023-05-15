using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class Report
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        
        [DataType(DataType.EmailAddress), MaxLength(250), MinLength(3)]
        public string Email { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public bool IsDeleted { get; set; }
       
        public bool IsLocked { get; set; }
         
        public string LockedBy { get; set; }
       
        public string LockedByEmail { get; set; }
        
        public DateTime? LockedOn { get; set; }
        public IList<Slide> Slides { get; set; }
       
    }
}