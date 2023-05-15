using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_SlideNotes")]
    public class SbSlideNotes
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID")]
        public int Id { get; set; }

        [Column("SLIDE_ID")]
        public int SlideId { get; set; }

        [Column("NOTE")]
        public string Text { get; set; }
    }
}
