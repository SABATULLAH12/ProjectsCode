using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Drawing;

namespace Dine.BusinessLayer
{
    public static class GlobalConstants
    {
        public static Color[] LegendColors = { ColorTranslator.FromHtml("#E41E2B"),  ColorTranslator.FromHtml("#31859C"),  ColorTranslator.FromHtml("#FFC000"),  ColorTranslator.FromHtml("#00B050"),  ColorTranslator.FromHtml("#7030A0"),  ColorTranslator.FromHtml("#7F7F7F"),  ColorTranslator.FromHtml("#C00000"),  ColorTranslator.FromHtml("#0070C0"),  ColorTranslator.FromHtml("#FF9900"),  ColorTranslator.FromHtml("#D2D9DF"),  ColorTranslator.FromHtml("#000000"),  ColorTranslator.FromHtml("#838C87"),  ColorTranslator.FromHtml("#83E5BB"),
                                 ColorTranslator.FromHtml("#cccccc"),  ColorTranslator.FromHtml("#b42c14"),  ColorTranslator.FromHtml("#643160"),  ColorTranslator.FromHtml("#be6e14"),  ColorTranslator.FromHtml("#406462"),  ColorTranslator.FromHtml("#605f4f"),  ColorTranslator.FromHtml("#a3978b"),  ColorTranslator.FromHtml("#c08617"),  ColorTranslator.FromHtml("#9d270e"),  ColorTranslator.FromHtml("#170909"),  ColorTranslator.FromHtml("#368130"),  ColorTranslator.FromHtml("#378574")};
        public static String[] StartColors = { "#E41E2B",  "#31859C",  "#FFC000",  "#00B050",  "#7030A0",  "#7F7F7F",  "#C00000",  "#0070C0",  "#FF9900",  "#D2D9DF",  "#000000",  "#838C87",  "#83E5BB",
                                 "#cccccc",  "#b42c14",  "#643160",  "#be6e14",  "#406462",  "#605f4f",  "#a3978b",  "#c08617",  "#9d270e",  "#170909",  "#368130",  "#378574"};

        public static Color[] Stop1Col = { Color.FromArgb(232, 66, 77), Color.FromArgb(63, 163, 192), Color.FromArgb(255, 192, 0), Color.FromArgb(0, 218, 99), Color.FromArgb(138, 60, 196) };
        public static Color[] Stop2Col = { Color.FromArgb(228, 30, 43), Color.FromArgb(51, 132, 155), Color.FromArgb(255, 192, 0), Color.FromArgb(0, 179, 81), Color.FromArgb(112, 48, 160) };

        /// <summary>
        /// Creates color with corrected brightness. (Added by Abhay Singh on 27-10-2017)
        /// </summary>
        /// <param name="color">Color to correct</param>
        /// <param name="factor">The brightness correction factor. Must be between -1 and 1(Negative values produce darker colors)</param>
        /// <returns>corrected color</returns>
        public static Color Colorluminance(Color color, float factor)
        {
            float red = (float)color.R;
            float green = (float)color.G;
            float blue = (float)color.B;

            if (factor < 0)
            {
                factor = 1 + factor;
                red *= factor;
                green *= factor;
                blue *= factor;
            }
            else
            {
                red = (255 - red) * factor + red;
                green = (255 - green) * factor + green;
                blue = (255 - blue) * factor + blue;
            }

            return Color.FromArgb(color.A, (int)red, (int)green, (int)blue);
        }
    }
}