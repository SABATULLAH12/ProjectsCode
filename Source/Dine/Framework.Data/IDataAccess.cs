using NextGen.Core.Models;
using System;

namespace Framework.Data
{
    public interface IDataAccess<Menu, Output> : IDisposable
    {
        Menu GetMenu();
        Output GetOutputData(ViewConfiguration config, params object[] param);
    }
}
