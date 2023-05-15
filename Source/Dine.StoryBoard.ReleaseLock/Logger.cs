using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dine.StoryBoard.ReleaseLock
{
    class TrackLogger
    {
        internal struct Mapper
        {
            internal static String LogFile { get { return AppDomain.CurrentDomain.BaseDirectory + "/Log/" + "LogFile" + DateTime.Now.ToString("yyyy-MM") + ".txt"; } }
            internal static String ErrFile { get { return AppDomain.CurrentDomain.BaseDirectory + "/Log/" + "ErrFile" + DateTime.Now.ToString("yyyy-MM") + ".txt"; } }
        }


        /// <summary>
        /// A class that handles user log and error log
        /// </summary>
        public abstract class Logger
        {
            private static readonly Object _logWriterLock = new Object();
            private static readonly Object _errWriterLock = new Object();
            private static DateTime _timeStamp = DateTime.Now;
            private static StreamWriter _logwriter = new StreamWriter(Mapper.LogFile, true, new System.Text.UTF8Encoding(true), 4096) { AutoFlush = true };
            private static StreamWriter _errwriter = new StreamWriter(Mapper.ErrFile, true, new System.Text.UTF8Encoding(true), 4096) { AutoFlush = true };

            /// <summary>
            /// Logs the log into the dataset
            /// </summary>
            /// <param name="tag">The tag for the error, can be the class name</param>
            /// <param name="message">The message to save</param>
            /// <param name="user">The principle user for the current session</param>
            public static void Log(String tag, String message)
            {
                if (!_timeStamp.Month.Equals(DateTime.Now.Month))
                {
                    _logwriter.Close();
                    _logwriter.Dispose();
                    _errwriter.Close();
                    _errwriter.Dispose();
                    _logwriter = new StreamWriter(Mapper.LogFile, true, new System.Text.UTF8Encoding(true), 4096) { AutoFlush = true };
                    _errwriter = new StreamWriter(Mapper.ErrFile, true, new System.Text.UTF8Encoding(true), 4096) { AutoFlush = true };
                    _timeStamp = DateTime.Now;
                }
                lock (_logWriterLock)
                {
                    try
                    {
                        _logwriter.WriteLine(DateTime.Now.ToString("dd-MMM,yyyy HH:mm:ss.ffff >> "));
                        _logwriter.WriteLine(message);
                        _logwriter.WriteLine();
                    }
                    catch { }
                }
            }

            /// <summary>
            /// Logs the error into the dataset
            /// </summary>
            /// <param name="exception">Exception to be stored in the data set</param>
            /// <param name="user">The principle user for the current session</param>
            public static void ErrLog(Exception exception)
            {
                if (!_timeStamp.Month.Equals(DateTime.Now.Month))
                {
                    _logwriter.Close();
                    _logwriter.Dispose();
                    _errwriter.Close();
                    _errwriter.Dispose();
                    _logwriter = new StreamWriter(Mapper.LogFile, true, new System.Text.UTF8Encoding(true), 4096) { AutoFlush = true };
                    _errwriter = new StreamWriter(Mapper.ErrFile, true, new System.Text.UTF8Encoding(true), 4096) { AutoFlush = true };
                    _timeStamp = DateTime.Now;
                }
                lock (_errWriterLock)
                {
                    try
                    {
                        _errwriter.WriteLine(DateTime.Now.ToString("dd-MMM,yyyy HH:mm:ss.ffff >> "));
                        _errwriter.WriteLine("Error: " + exception.Message);
                        if (exception.InnerException != null)
                            _errwriter.WriteLine("InnerException: " + exception.InnerException.Message);
                        _errwriter.WriteLine("StackTrace: " + exception.StackTrace);
                        _errwriter.WriteLine();
                    }
                    catch { }
                }
            }
        }
    }
}