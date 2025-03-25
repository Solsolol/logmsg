const routes = require('express').Router();
const fs = require('fs');

// Charger la configuration depuis config.json
var configObj = JSON.parse(fs.readFileSync('./public/config.json', 'utf8'));

// GET request pour charger l'index.html
routes.get('/', function(req, res, next) {
    res.writeHead(200);
    res.sendFile(__dirname + '/index.html');
});

// GET request pour charger la configuration de Journey Builder
routes.get('/config.json', function(req, res, next) {
    res.status(200).json(configObj);
});

// GET request pour récupérer une image
routes.get('/images/icon.png', function(req, res, next) {
    fs.readFile('./public/images/icon.png', function(err, data) {
        if (err) {
            res.status(400).send("Image not found");
        } else {
            res.status(200).send(data);
        }
    });
});

// Fonction pour valider les configurations reçues
var validateConfigurations = function(requestPayload, pathEndpoint) {
    console.log(`🔍 Validation des données reçues pour ${pathEndpoint}`);
    
    if (!requestPayload || Object.keys(requestPayload).length === 0) {
        console.error("❌ Erreur : Données vides !");
        return { success: false, message: "Données invalides ou absentes." };
    }

    if (!requestPayload.inArguments || !Array.isArray(requestPayload.inArguments)) {
        console.error("❌ Erreur : inArguments est manquant ou incorrect.");
        return { success: false, message: "Champ 'inArguments' invalide." };
    }

    for (const arg of requestPayload.inArguments) {
        if (!arg || typeof arg !== "object") {
            console.error("❌ Erreur : Un élément de 'inArguments' n'est pas un objet valide.");
            return { success: false, message: "Format incorrect dans 'inArguments'." };
        }
    }

    console.log("✅ Validation réussie !");
    return { success: true, message: "Données valides." };
};

// POST request pour `/execute`
routes.post('/execute', function(req, res, next) {
    console.log("➡️ Requête reçue sur /execute:", JSON.stringify(req.body, null, 2));

    if (!req.body || !req.body.inArguments) {
        console.error("❌ Erreur : 'inArguments' est manquant");
        return res.status(400).json({ error: "Requête invalide, 'inArguments' est requis." });
    }

    var inArgsReqPayload = req.body.inArguments;
    var args = {};

    try {
        for (var i = 0; i < inArgsReqPayload.length; i++) {
            var mc_val = inArgsReqPayload[i];
            var mc_val_keys = Object.keys(mc_val);

            if (mc_val_keys.length !== 1) {
                return res.status(400).json({ "error": "Format invalide dans inArguments" });
            } else {
                args[mc_val_keys[0]] = mc_val[mc_val_keys[0]];
            }
        }

        console.log("✅ Données reçues et traitées avec succès:", args);
        var id = Math.floor(Math.random() * 1000);
        res.status(201).json({ "someExtraId": id });

    } catch (error) {
        console.error("❌ Erreur lors du traitement de la requête:", error);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

// POST request pour `/save`
routes.post('/save', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/save");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Save' });
});

// POST request pour `/validate`
routes.post('/validate', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/validate");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Validate' });
});

// POST request pour `/stop`
routes.post('/stop', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/stop");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Stop' });
});

// POST request pour `/publish`
routes.post('/publish', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/publish");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Publish' });
});

// POST request pour `/sendJson`
routes.post('/sendJson', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/sendJson");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'isSuccess': true });
});

// POST request pour `/processData`
routes.post('/processData', function(req, res, next) {
    var id = Math.floor(Math.random() * 1000);
    res.status(200).json({ "idVal": id });
});

// Export des routes
module.exports = routes;
