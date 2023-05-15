using System.ComponentModel.DataAnnotations;

namespace Framework.Models.Users
{
    //Model for logon
    public class LogonUser
    {
        [Required(ErrorMessage = "User Name is required.")]
        [DataType(DataType.EmailAddress)]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password required.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}