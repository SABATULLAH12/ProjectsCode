using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.Storyboard.Data
{
    [Table("Storyboard_UserGroup")]
   public class SbUserGroup
    {
        [Column("ID"),DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [Column("GROUP_NAME")]

        public string GroupName { get; set; }

        [Column("EMAIL")]
        public string Email { get; set; }
        [Column("NAME")]
        public string Name { get; set; }
    }
}
