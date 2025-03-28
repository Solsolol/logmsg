const express = require('express');
const cors = require('cors');
const routes = express.Router();
const fs = require('fs');

console.log("[SERVER] Chargement du fichier de configuration...");
var configObj = JSON.parse(fs.readFileSync('./public/config.json', 'utf8'));
console.log("[SERVER] Configuration chargée avec succès.");

// Middleware pour parser le JSON
routes.use(express.json());
console.log("[SERVER] Middleware JSON activé.");

// GET request to index.html
routes.get('/', function(req, res, next) {
    console.log("[GET] / - Envoi du fichier index.html");
    res.status(200).sendFile(__dirname + '/index.html');
});

// GET request to config.json
routes.get('/config.json', function(req, res, next) {
    console.log("[GET] /config.json - Envoi de la configuration");
    res.status(200).json(configObj);
});

// GET request for an image
routes.get('/images/icon.png', function(req, res, next) {
    console.log("[GET] /images/icon.png - Tentative de lecture de l'image");
    fs.readFile('./public/images/icon.png', function(err, data) {
        if (err) {
            console.error("[ERROR] Image non trouvée");
            res.status(400).send("Image not found");
        } else {
            console.log("[SUCCESS] Image trouvée et envoyée.");
            res.status(200).send(data);
        }
    });
});

// Validation locale des configurations 
var validateConfigurations = function(requestPayload, pathEndpoint) {
    console.log(`[VALIDATION] Validation des données reçues pour ${pathEndpoint}`);
    
    if (!requestPayload || Object.keys(requestPayload).length === 0) {
        console.error("[ERROR] Données vides!");
        return { success: false, message: "Données invalides ou absentes." };
    }

    if (!requestPayload.inArguments || !Array.isArray(requestPayload.inArguments)) {
        console.error("[ERROR] inArguments est manquant ou incorrect.");
        return { success: false, message: "Champ 'inArguments' invalide." };
    }

    for (const arg of requestPayload.inArguments) {
        if (!arg || typeof arg !== "object") {
            console.error("[ERROR] Un élément de 'inArguments' n'est pas un objet valide.");
            return { success: false, message: "Format incorrect dans 'inArguments'." };
        }
    }

    console.log("[SUCCESS] Validation réussie !");
    return { success: true, message: "Données valides." };
};

// POST request for execution
routes.post('/execute', function(req, res, next) {
    console.log("[POST] /execute - Requête reçue", req.body);
    
    var reqPayload = req.body;
    if (!reqPayload || !reqPayload.inArguments || !Array.isArray(reqPayload.inArguments)) {
        console.error("[ERROR] Bad Request. inArguments est manquant ou incorrect.");
        return res.status(400).json({ "error": "Bad Request. inArguments est manquant ou incorrect." });
    }

    var args = {};
    for (const mc_val of reqPayload.inArguments) {
        var mc_val_keys = Object.keys(mc_val);
        
        if (mc_val_keys.length !== 1) {
            console.error("[ERROR] Bad Request. Malformed data in inArguments", mc_val);
            return res.status(400).json({ "error": "Bad Request. (Malformed data in inArguments)" });
        } else {
            args[mc_val_keys[0]] = mc_val[mc_val_keys[0]];
        }
    }

    console.log("[INFO] Arguments extraits:", args);

    // Validation des données
    const validationResult = validateConfigurations(reqPayload, "/execute");
    if (!validationResult.success) {
        console.error("[ERROR] Validation échouée.", validationResult.message);
        return res.status(400).json({ error: validationResult.message });
    }

    var id = Math.floor(Math.random() * 1000);
    console.log("[SUCCESS] ID généré:", id);
    res.status(201).json({ "someExtraId": id });
});

// Routes POST pour save, validate, stop, publish, processData
const postEndpoints = ["save", "validate", "stop", "publish"];
postEndpoints.forEach(endpoint => {
    routes.post(`/${endpoint}`, function(req, res, next) {
        console.log(`[POST] /${endpoint} - Requête reçue`, req.body);
        const validationResult = validateConfigurations(req.body, `/${endpoint}`);
        if (!validationResult.success) {
            console.error(`[ERROR] Validation échouée pour /${endpoint}`);
            return res.status(400).json({ error: validationResult.message });
        }
        console.log(`[SUCCESS] Requête /${endpoint} validée.`);
        res.status(200).json({ 'activity': endpoint.charAt(0).toUpperCase() + endpoint.slice(1) });
    });
});

// Route spécifique pour sendJson
routes.post('/sendJson', function(req, res, next) {
    console.log("[POST] /sendJson - Requête reçue", req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error("[ERROR] Données vides!");
        return res.status(400).json({ error: "Données invalides ou absentes." });
    }
    console.log("[SUCCESS] Données reçues et validées.");
    res.status(200).json({ 
        success: true, 
        message: "Données reçues avec succès",
        data: req.body 
    });
});

// POST request for processData (génération d'un ID)
routes.post('/processData', function(req, res, next) {
    console.log("[POST] /processData - Génération d'un ID");
    var id = Math.floor(Math.random() * 1000);
    console.log("[SUCCESS] ID généré:", id);
    res.status(200).json({ "idVal": id });
});

// Export des routes
module.exports = routes;
console.log("[SERVER] Routes chargées avec succès.");
