var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/routes.js');

var app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

// Routes
app.use('/', routes);
app.use('/icon.png', express.static('public/images/icon.png'));

// GET request to web application
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// Error handling middleware
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).json({
		error: 'Something broke!',
		message: err.message
	});
});

// Start server
app.listen(port, () => {
	console.log(`[SERVER] Application started on port ${port}`);
});
