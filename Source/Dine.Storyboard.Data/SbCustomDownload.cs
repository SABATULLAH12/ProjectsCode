using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_CustomDownload")]
    public class SbCustomDownload
    {
        [Column("ID"), DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Column("REPORT_ID")]
        public int ReportId { get; set; }
        [Column("SLIDES")]
        public string Slides { get; set; }
        [Column("EMAIL")]
        public string Email { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
        [Column("CREATED_BY"), MaxLength(250)]
        public string CreatedBy { get; set; }
        [Column("CREATED_ON")]
        public DateTime? CreatedOn { get; set; }
        [Column("ISDELETED")]
        public bool IsDeleted { get; set; }
        //[NotMapped]
        //public virtual SbReport Report { get; set; }
    }
}
