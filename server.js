var express = require('express');
var bodyParser = require('body-parser');
const routes = require('./routes/routes.js');

var app = express();
app.use(express.static('public'));

const port = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Ajout pour POST

app.use('/', routes);
app.use('/icon.png', express.static('public/images/icon.png'));

// GET request pour tester si le serveur tourne bien
app.get('/', function(req, res) {
    res.send("Server is running on port " + port);
});

// Lancement du serveur avec gestion des erreurs
app.listen(port, (err) => {
    if (err) {
        console.error("❌ Erreur lors du démarrage du serveur:", err);
    } else {
        console.log(`✅ Serveur démarré sur http://localhost:${port}`);
    }
});
