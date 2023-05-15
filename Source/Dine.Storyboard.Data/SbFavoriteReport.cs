using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_Favorite")]
    public class SbFavoriteReport
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID")]
        public int Id { get; set; }
        [Column("REPORT_ID")]
        public int ReportId { get; set; }
        [Column("Email")]
        public string Email { get; set; }
       
    }
}
