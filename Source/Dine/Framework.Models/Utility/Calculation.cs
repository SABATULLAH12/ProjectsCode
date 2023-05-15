using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Framework.Models.Utility
{
    public static class Calculation
    {
        public static double? GetStatValue(int? compareSampleSize, double? comparisonPercentage, int? benMarkSampleSize, double? benchMarkPercentage)
        {
            double? benchMarkSampleSize = ConvertToNullableDouble(benMarkSampleSize);
            double? comparisonSampleSize = ConvertToNullableDouble(compareSampleSize);
            double? benchMarkData = benchMarkPercentage * benchMarkSampleSize;
            double? comparisonData = comparisonPercentage * comparisonSampleSize;
            double? sumOfSampleSize = benchMarkSampleSize + comparisonSampleSize;
            double? K1 = (benchMarkData + comparisonData) / sumOfSampleSize;
            if (K1 != null && comparisonSampleSize != null)
            {
                double intermediateK2 = Convert.ToDouble(K1 * (1 - K1) * ((1 / benchMarkSampleSize) + (1 / comparisonSampleSize)));
                double? k2 = Math.Sqrt(intermediateK2);
                double? statValue = (comparisonPercentage - benchMarkPercentage) / k2;
                return double.IsNaN(Convert.ToDouble(statValue)) ? null : statValue;
            }
            return null;
        }

        public static double? ConvertToNullableDouble(object value)
        {
            double _value = 0;
            if (double.TryParse(Convert.ToString(value), out _value))
                return _value;
            return null;
        }
    }
}
