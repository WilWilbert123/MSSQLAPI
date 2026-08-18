# Hidden API Runner

This project provides a hidden, background API runner that utilizes PM2 to keep your Node.js application running persistently and silently. It is fully portable, meaning you can place the folder anywhere on a Windows PC and it will automatically adjust the paths.

## 1. Initial Setup (First time only)
Make sure you have [Node.js](https://nodejs.org/) installed on your PC. Then, open your terminal (Command Prompt or PowerShell) inside this folder and run:

```bash
# Install local project dependencies
npm install

# Install PM2 globally (required for background execution)
npm install -g pm2
```
*(Note: Running `npm install` automatically installs express, mssql, and localtunnel as defined in `package.json`)*

**Configure Environment Variables:**
Create a `.env` file in the root of this folder (if it doesn't already exist) and configure your database and API credentials. Here is an example of what it should look like:
```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_DATABASE=your_database
API_KEY=your_secret_api_key
PORT=3000
```

##  2. How to Run

### Start it immediately
Double-click **`Run_API_Hidden.vbs`**
- This will instantly start the API in the background. It stays completely hidden with no command prompt window remaining open. You can start using your API right away.

### Enable Auto-Run on Boot
Double-click **`Setup_AutoRun.vbs`**
- This automatically configures your PC so that it triggers `Run_API_Hidden.vbs` every time the computer is turned on or restarted.
- You never have to manually click the run script again!

##  3. How to Stop or Remove

### Stop the current API
Double-click **`Stop_API.bat`**
- This stops the currently running background process.

### Disable Auto-Run on Boot
Double-click **`Remove_AutoRun.vbs`**
- If you no longer want the API to start automatically when the PC boots, this will remove the shortcut from the Windows Startup folder.
# MSSQLAPI
