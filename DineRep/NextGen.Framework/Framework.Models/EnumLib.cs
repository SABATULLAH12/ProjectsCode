using System;

namespace Framework.Models
{
    public enum EModule { NONE = 0, CHART = 1, TABLE = 2, SNAPSHOT = 3 }

    public static class GetEnum
    {
        public static EModule GetEModule(string module)
        {
            EModule emodule = EModule.NONE;
            switch (Convert.ToString(module).ToLower())
            {
                case "chart":
                    emodule = EModule.CHART;
                    break;
                case "snapshot":
                    emodule = EModule.SNAPSHOT;
                    break;
                case "table":
                    emodule = EModule.TABLE;
                    break;
            }

            return emodule;
        }
    }
}
