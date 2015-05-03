/**
 * @namespace routes.js
 */
'use strict';
var configRoutes,
    crud = require('./crud'),
    chat = require('./chat'),
    makeMongoId = crud.makeMongoId;

/**
 * 路由配置
 */
configRoutes = function(app, server) {

    app.get('/', function(req, res) {
        res.redirect('/spa.html');
    });

    app.all('/:obj_type/*?', function(req, res, next) {
        res.contentType('json');
        next();
    });

    app.get('/:obj_type/list', function(req, res) {
        crud.read(
            req.params.obj_type,
            {}, {},
            function(map_list) {
                res.send(map_list);
            }
        );
    });

    app.post('/:obj_type/create', function(req, res) {
        var obj_type = req.params.obj_type,
            obj_map = req.body;
        crud.construct(
            obj_type,
            obj_map,
            function(result_map) {
                res.send(result_map);
            }
        );
        
    });

    app.get('/:obj_type/read/:id', function(req, res) {
        var find_map = {_id: makeMongoId(req.params.id)};
        crud.read(
            req.params.obj_type,
            find_map,
            {},
            function(map_list) {
                res.send(map_list);
            }
        );
    });

    app.post('/:obj_type/update/:id', function(req, res) {
        var find_map = {_id: makeMongoId(req.params.id)},
            obj_map = req.body,
            obj_type = req.params.obj_type;
        crud.update(
            obj_type,
            find_map,
            obj_map,
            function(result_map) {
                res.send(result_map);
            }
        );
    });

    app.get('/:obj_type/delete/:id', function(req, res) {
        var find_map = {_id: makeMongoId(req.params.id)};
        crud.destroy(
            req.obj_type,
            find_map,
            function(result_map) {
                res.send(result_map);
            }
        );
    });
    chat.connect(server);
};

module.exports = {
    configRoutes: configRoutes
};

