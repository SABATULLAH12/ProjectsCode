using NextGen.Core.Data;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using Dine;
using Dine.Storyboard.Data;
using System;
using System.Data.SqlClient;
using System.Data;
using Framework.Models;

namespace Framework.Data
{
    public class StoryBoardDA : BaseChart, IStoryBoardDA
    {
        public StoryBoardDA() : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString)
        {
        }
        public StoryBoardDA(string module) : base(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString, module)
        {
        }

        public IEnumerable<UserInfo> GetUSersList(string currentUser)
        {
            IList<UserInfo> sbuser = new List<UserInfo>();
            using (cmd = database.GetStoredProcCommand("USP_StoryBoard_UserGroupsNameList"))
            {
                database.AddInParameter(cmd, "@CurrentUserEmailId", SqlDbType.VarChar, currentUser ?? string.Empty);
                cmd.CommandTimeout = 300;
                DataSet ds = database.ExecuteDataSet(cmd);
                if (ds != null && ds.Tables != null && ds.Tables.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        sbuser.Add(new UserInfo()
                        {
                            Name = dr["Name"].ToString(),
                            UserName = dr["UserName"].ToString(),
                            email = dr["EmailID"].ToString(),
                            Id = Convert.ToInt32(dr["ID"]),
                            isGroup = Convert.ToInt32(dr["IsGroup"])
                        });
                    }
                }
            }
            //string query = string.Empty;
            ////query = "select * from dbo.DimtblUser where username in('alandrews', 'gbrannon', 'sumeet@aqinsights.com', 'Atreyi', 'madhuranand@aqinsights.com', 'sauvikdas', 'parivesh@aqinsights.com', 'ashish.p', 'aditya.s@aqinsights.com', 'aditi.d', 'swarnabha.s', 'bramhanath.pg@aqinsights.com', 'pratik.d@aqinsights.com', 'praveenkumar.r@aqinsights.com', 'raghavendra.r@aqinsights.com', 'shruti.g@aqinsights.com', 'thanuj@aqinsights.com', 'varun.j@aqinsights.com', 'nagaraju@aqinsights.com', 'revathy.h@aqinsights.com' ,'megha.r@aqinsights.com','partheeban@aqinsights.com','anoop.m@aqinsights.com','aditi.d','aditya.s@aqinsights.com','AnilKumar','jayaram','dhivakar.a@aqinsights.com','samrat.g@aqinsights.com') AND username NOT IN ('" + currentUser + "')";
            ////modified by Nagaraju
            ////Date: 26-07-2017
            //query = "select * from dbo.DimtblUser d inner join [dbo].[FacttblUserDetails] f on d.ID=f.UserID where f.DINE=1 and d.UserName not in ('" + currentUser + "')";

            //using (cmd = database.GetSqlStringCommand(query))
            //{
            //    using (var dr = database.ExecuteReader(cmd))
            //    {
            //        while (dr.Read())
            //        {
            //            sbuser.Add(new UserInfo()
            //            {
            //                Name = dr["Name"].ToString(),
            //                UserName = dr["UserName"].ToString(),
            //                email = dr["EmailID"].ToString(),
            //                Id = Convert.ToInt32(dr["ID"]),
            //                isGroup = Convert.ToInt32(dr["IsGroup"])
            //            });
            //        }
            //    }
            //}
            return sbuser;
        }

        public string ShareReport(SlideShare slideShare) {
            string status = "Success";
            IList<UserInfo> sbuser = new List<UserInfo>();
            using (cmd = database.GetStoredProcCommand("USP_Storyboard_SharedReport"))
            {
                database.AddInParameter(cmd, "@ReportID", SqlDbType.VarChar, slideShare.REPORT_ID);
                database.AddInParameter(cmd, "@Id", SqlDbType.VarChar, slideShare.Id);
                database.AddInParameter(cmd, "@SharedByName", SqlDbType.VarChar, slideShare.SharedBy ?? string.Empty);
                database.AddInParameter(cmd, "@SharedbyEmail", SqlDbType.VarChar, slideShare.SharedByMail ?? string.Empty);
                database.AddInParameter(cmd, "@IsGroup", SqlDbType.VarChar, slideShare.isGroup);
                database.AddInParameter(cmd, "@ReportDate", SqlDbType.DateTime, slideShare.SharedOn ?? DateTime.Now);
                cmd.CommandTimeout = 300;
                try { database.ExecuteDataSet(cmd); }
                catch (Exception ex)
                {
                    status = "Error";
                    throw ex;
                }
            }
            return status;
        }
        public List<FilterPanelData> getLatestTimePeriod(string timePeriodType,string firstAndLastTP) {
            List<FilterPanelData> tp = new List<FilterPanelData>();
            //Use DevQC connection string
            var query = "SELECT DisplayText,PeriodType FROM (SELECT ROW_NUMBER() OVER(ORDER BY rn DESC) AS R1, DisplayText, PeriodType FROM dbo.vw_Timeperiod where PeriodType = '" + timePeriodType + "') A INNER JOIN(SELECT ID, Value FROM SplitStringToTableString('" + firstAndLastTP + "')) B ON A.R1 = B.Value ORDER BY ID ASC ";
            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["ToolConn"]].ConnectionString);
            SqlCommand command = new SqlCommand(query, con);
            try {
                con.Open();
                using (var dr = command.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        tp.Add(new FilterPanelData() { Text = dr["DisplayText"].ToString() });
                    }
                }
            }
            catch (System.Exception)
            {

            }
            finally
            {
                if (con.State == ConnectionState.Open)
                {
                    con.Close();
                }
                con.Dispose();
            }
            return tp;
        }
    }
}