using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class UserGroup
    {
        public string GroupName { get; set; }
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
      
        public string Name { get; set; }
    }
}