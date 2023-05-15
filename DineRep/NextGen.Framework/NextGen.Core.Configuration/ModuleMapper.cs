using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NextGen.Core.Configuration
{
    public class ModuleMapper
    {
        static IDictionary<string, string> _module;

        private ModuleMapper() { }

        static ModuleMapper()
        {
            _module = new Dictionary<string, string>();
            _module.Add("Chart", "~/App_Data/ProfilerConfig.json");
            _module.Add("Table", "~/App_Data/TableConfig.json");
            _module.Add("Snapshot", "~/App_Data/SnapshotConfig.json");
        }

        public static void AddMapper(string moduleName, string jsonFileVirtualPath)
        {
            if (!_module.ContainsKey(moduleName))
                _module.Add(moduleName, jsonFileVirtualPath);
            else
                _module[moduleName] = jsonFileVirtualPath;
        }

        internal static IDictionary<string, string> GetMapper()
        {
            return _module;
        }
    }
}
