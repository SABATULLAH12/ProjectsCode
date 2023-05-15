using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Framework.Models
{
    public class AdvancedFilterData
    {
        public string Name { get; set; }

        public string CssName { get; set; }

        public int IsBeverage { get; set; }

        public IList<AdvancedFilter> Options { get; set; }

        public ICollection<PanelInfo> Filters { get; set; }
    }

    public class AdvancedFilter
    {
        public string  Text { get; set; }

        public int Id { get; set; }

        public ICollection<PanelInfo> Filters { get; set; }
    }
}
