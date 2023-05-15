using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_Report_Share")]
  public class SbSlideShare
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID")]
        public int Id { get; set; }

        [Column("REPORT_ID")]
        public int REPORT_ID { get; set; }

        [Column("SHARED_TO")]
        public string SharedTo { get; set; }

        [Column("SHARED_BY")]
        public string SharedBy { get; set; }
        [Column("SHARED_ON")]
        public DateTime? SharedOn { get; set; }

        [Column("SHARED_TO_EMAIL")]
        public string SharedToMail { get; set; }
        [Column("SHARED_BY_EMAIL")]
        public string SharedByMail { get; set; }

    }
}
