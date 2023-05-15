using NextGen.Core.Configuration.Interfaces;

namespace NextGen.Core.Configuration
{
    public class ConfigContext
    {
        #region Fields
        private static IJsonConfig _config = null;
        #endregion

        #region constructors
        private ConfigContext() { }

        static ConfigContext()
        {
            if (_config == null)
                _config = new JsonConfig();
        }

        #endregion

        #region Properties
        public static IJsonConfig Current { get { return _config; } }
        #endregion
    }
}
