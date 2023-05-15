using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Framework.Models
{
    public class PanelList
    {
        public int Level { get; set; }
        public ICollection<PanelData> Data { get; set; }
    }
}
