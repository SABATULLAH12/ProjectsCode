using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class FavoriteReport
    {
        public int Id { get; set; }
        [Required]
        public int ReportID { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
    }
}