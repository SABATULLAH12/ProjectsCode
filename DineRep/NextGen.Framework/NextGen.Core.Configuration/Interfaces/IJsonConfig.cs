using NextGen.Core.Models;
using Framework.Models;
using System.Collections.Generic;

namespace NextGen.Core.Configuration.Interfaces
{
    public interface IJsonConfig
    {
        Module[] Modules { get; }
        bool IsConfigured { get; }
        void Initialize();
        void ReInitialize();
        void Dispose();
        IModuleConfig GetConfig(string module);
        void Update(string module, ViewFilter filter);

        void Update(string module, ViewConfigProcedure filter);

        void Update(SnapshotWidgets[] filter, string module = "snapshot");
    }
}
