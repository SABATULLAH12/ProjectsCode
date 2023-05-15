using Aspose.Slides;
using Newtonsoft.Json;
using Svg;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Web;

namespace Dine.Utility
{
    public static class Quick_Helpers<T>
    {
        /// <summary>
        /// Author: Praveen Kumar Rai (Junior Software Engineer - Tech FB)
        /// <para>LoadJson is to load a JSON file in generic form</para>
        /// </summary>
        public static T LoadJson(string filename)
        {
            T items;
            using (StreamReader r = new StreamReader(filename))
            {
                string json = r.ReadToEnd();
                items = JsonConvert.DeserializeObject<T>(json);
            }
            return items;
        }
        
    }
}