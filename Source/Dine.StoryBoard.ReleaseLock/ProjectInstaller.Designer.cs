namespace Dine.StoryBoard.ReleaseLock
{
    partial class ProjectInstaller
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.serviceProcessInstaller1 = new System.ServiceProcess.ServiceProcessInstaller();
            this.Dine_StoryBoard_ReleaseLock = new System.ServiceProcess.ServiceInstaller();
            // 
            // serviceProcessInstaller1
            // 
            this.serviceProcessInstaller1.Account = System.ServiceProcess.ServiceAccount.LocalSystem;
            this.serviceProcessInstaller1.Password = null;
            this.serviceProcessInstaller1.Username = null;
            // 
            // Dine_StoryBoard_ReleaseLock
            // 
            this.Dine_StoryBoard_ReleaseLock.Description = "to release lock from reports every 10 mins";
            this.Dine_StoryBoard_ReleaseLock.DisplayName = "Dine_StoryBoard_ReleaseLock";
            this.Dine_StoryBoard_ReleaseLock.ServiceName = "Dine_StoryBoard_ReleaseLock";
            this.Dine_StoryBoard_ReleaseLock.StartType = System.ServiceProcess.ServiceStartMode.Automatic;
            this.Dine_StoryBoard_ReleaseLock.AfterInstall += new System.Configuration.Install.InstallEventHandler(this.serviceInstaller1_AfterInstall);
            // 
            // ProjectInstaller
            // 
            this.Installers.AddRange(new System.Configuration.Install.Installer[] {
            this.serviceProcessInstaller1,
            this.Dine_StoryBoard_ReleaseLock});

        }

        #endregion

        private System.ServiceProcess.ServiceProcessInstaller serviceProcessInstaller1;
        private System.ServiceProcess.ServiceInstaller Dine_StoryBoard_ReleaseLock;
    }
}