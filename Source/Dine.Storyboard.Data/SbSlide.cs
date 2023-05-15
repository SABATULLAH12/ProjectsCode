using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_Slide")]
    public class SbSlide
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("Slide_ID")]
        public int Id { get; set; }
        [Column("REPORT_ID")]
        public int ReportId { get; set; }
        [Column("COMMENT")]
        public string Comment { get; set; }
        [Column("CREATED_BY"), MaxLength(250)]
        public string CreatedBy { get; set; }
        [Column("CREATED_ON")]
        public DateTime? CreatedOn { get; set; }
        [Column("EMAIL"), MaxLength(250)]
        public string Email { get; set; }
        [Column("UPDATED_BY")]
        public string UpdatedBy { get; set; }
        [Column("UPDATED_ON")]    
        public DateTime? UpdatedOn { get; set; }
        [Column("MODULE")]
        public string Module { get; set; }
        [Column("ISDELETED")]
        public bool IsDeleted { get; set; }
        [Column("TIMEPERIOD_TYPE")]
        public string TimePeriodType { get; set; }
        [Column("FROM_TIMEPERIOD")]
        public string FromTimeperiod { get; set; }
        [Column("TO_TIMEPERIOD")]
        public string ToTimeperiod { get; set; }
        [Column("FILTER")]
        public string Filter { get; set; }
        [Column("OUTPUTDATA")]
        public string OutputData { get; set; }

        [NotMapped]
        public virtual SbReport Report { get; set; }
    }
}
