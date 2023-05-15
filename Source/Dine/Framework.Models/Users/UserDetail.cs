using System;
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
        public bool B3;
        public bool Bev360Drinkers;
        public bool Bev360Drinks;
        public bool BGM;
        public bool CBL;
        public bool CBLV2;
        public bool CREST;
        public bool DINE;
        public bool iSHOP;
        public string UserID;
        

        public string EmailId { get; set; }
        public string Groups { get; set; }
        public string Login_Flag { get; set; }
        public string UserName { get; set; }
    }
}