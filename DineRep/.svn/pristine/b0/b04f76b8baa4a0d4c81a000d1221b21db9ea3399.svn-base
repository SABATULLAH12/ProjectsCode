using NextGen.Core.Configuration.Interfaces;
using NextGen.Core.Models;
using Framework.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace NextGen.Core.Configuration
{
    public sealed class JsonConfig : IJsonConfig
    {
        public JsonConfig() { }

        #region Properties
        public Module[] Modules { get; private set; }

        public bool IsConfigured { get; private set; }
        #endregion

        #region Methods
        public IModuleConfig GetConfig(string module)
        {
            if (Modules == null)
                return null;
            else
                return Modules.FirstOrDefault(x => string.Compare(x.Name, module, true) == 0)?.Data;
        }

        public void Initialize()
        {
            HttpServerUtility server = HttpContext.Current.Server;
            IDictionary<string, string> _modulemapper = ModuleMapper.GetMapper();
            if (_modulemapper != null)
            {
                Modules = new Module[_modulemapper.Count];
                int i = 0;
                foreach (KeyValuePair<string, string> m in _modulemapper)
                {
                    Modules[i++] = new Configuration.Module()
                    {
                        Name = m.Key,
                        JsonPath = m.Value,
                        Data = File.Exists(server.MapPath(m.Value)) ? new ModuleConfig(m.Value) : null
                    };
                }
            }

            if (Modules != null)
            {
                foreach (var item in Modules)
                {
                    if (item.Data != null)
                        IsConfigured = true;
                }
            }
        }

        public void ReInitialize()
        {
            Dispose();
            Initialize();
        }

        public void Dispose()
        {
            Modules = null;
        }

        public void Update(string module, ViewFilter filter)
        {
            Modules.FirstOrDefault(x => x.Name == module)?.Data.Update(filter);
            ReInitialize();
        }

        public void Update(string module, ViewConfigProcedure filter)
        {
            Modules.FirstOrDefault(x => x.Name == module)?.Data.Update(filter);
            ReInitialize();
        }

        public void Update(SnapshotWidgets[] filter, string module = "snapshot")
        {
            Modules.FirstOrDefault(x => x.Name == module)?.Data.Update(filter);
            ReInitialize();
        }
        #endregion
    }
}
