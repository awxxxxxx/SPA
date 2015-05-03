/**
 * @namespace app.js
 */

var connectHello, server,
    http = require('http'),
    routes = require('./lib/routes.js'),
    express = require('express'),
    app = express(),
    server = http.createServer(app);

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

routes.configRoutes(app, server);
server.listen(3000);
console.log('server start on http://localhost:'+ server.address().port);
console.log('Listening on port %d', server.address().port);
