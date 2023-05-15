using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dine.Areas.StoryBoard.Models
{
    public class SlideNotes
    {
        public int Id { get; set; }
        public int SlideId { get; set; }
        public string Text { get; set; }
    }
}