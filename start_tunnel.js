const localtunnel = require('localtunnel');

(async () => {
    try {
        const tunnel = await localtunnel({ port: 5000, subdomain: 'bismac-api' });

        console.log(`your url is: ${tunnel.url}`);

        // If the server gave us a random URL because bismac-api is locked, we reject it!
        if (tunnel.url !== 'https://bismac-api.loca.lt') {
            console.error("\n[!] WARNING: Received a random URL because 'bismac-api' is temporarily locked by loca.lt's cache from a recent shutdown.");
            console.error("[!] Closing this random tunnel and crashing purposely so PM2 can retry...");
            tunnel.close();

            // Wait 5 seconds before exiting so we don't spam the loca.lt servers too rapidly
            setTimeout(() => {
                process.exit(1);
            }, 5000);
            return;
        }

        // Start a Watchdog Heartbeat to check if loca.lt silently dropped the connection
        const https = require('https');
        setInterval(() => {
            https.get(tunnel.url, (res) => {
                // If it returns 401 Unauthorized, that is GOOD! It means it successfully hit our Node.js API.
                // If the tunnel is dead, loca.lt will return 503 Service Unavailable or 504.
                if (res.statusCode === 503 || res.statusCode === 504) {
                    console.error(`\n[!] WATCHDOG: Tunnel is dead (Status ${res.statusCode}). Crashing to restart...`);
                    tunnel.close();
                    process.exit(1);
                }
            }).on('error', (e) => {
                console.error(`\n[!] WATCHDOG: Failed to ping tunnel (${e.message}). Crashing to restart...`);
                tunnel.close();
                process.exit(1);
            });
        }, 60000); // Ping every 60 seconds

        // Catch graceful shutdowns (like PM2 stop/delete) and close the tunnel cleanly
        process.on('SIGINT', () => {
            console.log("Gracefully closing localtunnel...");
            tunnel.close();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log("Gracefully closing localtunnel...");
            tunnel.close();
            process.exit(0);
        });

        tunnel.on('close', () => {
            console.log("Tunnel closed.");
        });

        tunnel.on('error', (err) => {
            console.error("Tunnel error:", err);
            process.exit(1);
        });

    } catch (err) {
        console.error("Failed to start localtunnel:", err);
        process.exit(1);
    }
})();
