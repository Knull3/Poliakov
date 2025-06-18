const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 8080;
const VERSION = "1.0.0";
const START_TIME = new Date();

// Créer un serveur HTTP simple
const server = http.createServer((req, res) => {
    if (req.url === '/status') {
        // Envoyer un rapport de statut
        const uptime = Math.floor((new Date() - START_TIME) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        const status = {
            status: 'online',
            version: VERSION,
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            memory: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            timestamp: new Date().toISOString()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
    } else {
        // Page d'accueil
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bot Discord - En ligne</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #2c2f33;
                        color: #ffffff;
                        text-align: center;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .container {
                        background-color: #23272a;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        width: 90%;
                    }
                    h1 {
                        color: #7289da;
                        margin-bottom: 20px;
                    }
                    .status {
                        color: #43b581;
                        font-weight: bold;
                        font-size: 1.2em;
                        margin-bottom: 20px;
                    }
                    .info {
                        color: #99aab5;
                        margin-bottom: 10px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 0.8em;
                        color: #99aab5;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Bot Discord</h1>
                    <div class="status">🟢 En ligne</div>
                    <div class="info">Version: ${VERSION}</div>
                    <div class="info">Démarré le: ${START_TIME.toLocaleString()}</div>
                    <div class="footer">Cette page est utilisée pour maintenir le bot en ligne.</div>
                </div>
            </body>
            </html>
        `);
    }
});

// Démarrer le serveur
server.listen(PORT, () => {
    console.log(`✅ Serveur Keep Alive démarré sur le port ${PORT}`);
    console.log(`ℹ️ Accédez à http://localhost:${PORT}/status pour voir l'état du bot`);
});
