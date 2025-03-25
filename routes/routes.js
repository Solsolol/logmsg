/****************************************************************************************************************
 * File: routes.js
 * 
 * Desc: JS file that contains all of the necessary GET and POST calls.
 * 
 *************************************************************************************************************/

const routes = require('express').Router();
const fs = require('fs');

// Charger la configuration depuis config.json
var configObj = JSON.parse(fs.readFileSync('./public/config.json', 'utf8'));

// GET request to index.html
routes.get('/', function(req, res, next) {
    res.writeHead(200);
    res.sendFile(__dirname + '/index.html');
});

// GET request to config.json - used for Journey Builder to load configurations
routes.get('/config.json', function(req, res, next) {
    res.status(200).json(configObj);
});

// GET request for an image
routes.get('/images/icon.png', function(req, res, next) {
    fs.readFile('./public/images/icon.png', function(err, data) {
        if (err) {
            res.status(400).send("Image not found");
        } else {
            res.status(200).send(data);
        }
    });
});

// Validation locale des configurations 
var validateConfigurations = function(requestPayload, pathEndpoint) {
    console.log(`Validation des données reçues pour ${pathEndpoint}`);
    
    if (!requestPayload || Object.keys(requestPayload).length === 0) {
        console.error("Erreur : Données vides !");
        return { success: false, message: "Données invalides ou absentes." };
    }

    if (!requestPayload.inArguments || !Array.isArray(requestPayload.inArguments)) {
        console.error("Erreur : inArguments est manquant ou incorrect.");
        return { success: false, message: "Champ 'inArguments' invalide." };
    }

    for (const arg of requestPayload.inArguments) {
        if (!arg || typeof arg !== "object") {
            console.error("Erreur : Un élément de 'inArguments' n'est pas un objet valide.");
            return { success: false, message: "Format incorrect dans 'inArguments'." };
        }
    }

    console.log("Validation réussie !");
    return { success: true, message: "Données valides." };
};

// POST request for execution
routes.post('/execute', function(req, res, next) {
    var reqPayload = req.body;
    var inArgsReqPayload = reqPayload.inArguments;
    var args = {};

    // Extraire les données reçues
    for (var i = 0; i < inArgsReqPayload.length; i++) {
        var mc_val = inArgsReqPayload[i];
        var mc_val_keys = Object.keys(mc_val);
        
        if (mc_val_keys.length > 1 || mc_val_keys.length === 0) {
            return res.status(400).json({"error": "Bad Request. (Malformed data)"});
        } else {
            if (mc_val_keys[0] === "keyvalstatic" || mc_val_keys[0] === "keyvaldynamic") {
                args["keyvalpair"] = (args["keyvalpair"] || "") + mc_val[mc_val_keys[0]];
            } else {
                args[mc_val_keys[0]] = mc_val[mc_val_keys[0]];
            }
        }
    }

    // Validation des données
    const validationResult = validateConfigurations(args, "/execute");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }

    var id = Math.floor(Math.random() * 1000);
    res.status(201).json({ "someExtraId": id });
});

// POST request for save
routes.post('/save', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/save");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Save' });
});

// POST request for validate
routes.post('/validate', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/validate");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Validate' });
});

// POST request for stop
routes.post('/stop', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/stop");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Stop' });
});

// POST request for publish
routes.post('/publish', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/publish");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'activity': 'Publish' });
});

// POST request for sendJson
routes.post('/sendJson', function(req, res, next) {
    const validationResult = validateConfigurations(req.body, "/sendJson");
    if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.message });
    }
    res.status(200).json({ 'isSuccess': true });
});

// POST request for processData (génération d’un ID)
routes.post('/processData', function(req, res, next) {
    var id = Math.floor(Math.random() * 1000);
    res.status(200).json({ "idVal": id });
});

// Export des routes
module.exports = routes;
