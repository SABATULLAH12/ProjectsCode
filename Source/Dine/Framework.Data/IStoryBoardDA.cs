using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dine.Storyboard.Data;
using Framework.Models;

namespace Framework.Data
{
    public interface IStoryBoardDA
    {
        IEnumerable<UserInfo> GetUSersList(string currentUser);
        List<FilterPanelData> getLatestTimePeriod(string timePeriodType, string firstAndLastTP);
        string ShareReport(SlideShare slideShare);
    }
}
