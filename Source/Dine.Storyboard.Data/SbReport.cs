using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_Report")]
    public class SbReport
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("REPORT_ID")]
        public int Id { get; set; }
        [Column("REPORT_NAME"), MaxLength(250)]
        public string Name { get; set; }
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
        [Column("ISDELETED")]
        public bool IsDeleted { get; set; }
        [Column("ISLOCKED")]
        public bool IsLocked { get; set; }
        [Column("LOCKED_BY")]
        public string LockedBy { get; set; }
        [Column("LOCKED_BY_EMAIL")]
        public string LockedByEmail { get; set; }
        [Column("LOCKED_ON")]
        public DateTime? LockedOn { get; set; }

        [NotMapped]
        public virtual IEnumerable<SbSlide> Slides { get; set; }
        [NotMapped]
        public IEnumerable<SbCustomDownload> CustomDownload { get; set; }

        [NotMapped]
        public IEnumerable<SbSlideShare> SlideShare { get; set; }
        [NotMapped]
        public IEnumerable<SbUserGroup> UserGroup { get; set; }

    }
}
