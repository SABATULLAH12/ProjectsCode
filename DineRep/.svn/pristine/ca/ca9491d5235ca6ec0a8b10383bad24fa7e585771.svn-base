using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Framework.Models.Users
{
    [Table("dbo.UserDetail")]
    public class UserDetail
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [DataType(DataType.Text), MaxLength(250), MinLength(3)]
        public string Name { get; set; }

        [Required]
        [DataType(DataType.EmailAddress), MaxLength(250), MinLength(3)]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password), MaxLength(250), MinLength(3)]
        public string Password { get; set; }

        [Required]
        [MaxLength(30), MinLength(3)]
        public string Role { get; set; }
    }
}