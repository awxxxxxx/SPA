/**
 * @namespace crud.js
 */
'use strict';

var loadSchema, checkSchema, clearIsOnline,
    checkType, constructorObj, readObj,
    updateObj, destroyObj,

    mongodb = require('mongodb'),
    fsHandle = require('fs'),

    /** 引入 JSV 模块 */
    JSV = require('JSV').JSV,
    crud = require('./crud'),
    mongoServer = new mongodb.Server(
        'localhost',
        mongodb.Connection.DEFAULT_PORT
    ),
    dbHandle = new mongodb.Db(
        'spa',mongoServer,{safe: true}
    ),

    /** 创建 JSV 验证环境 */
    validator = JSV.createEnvironment(),
    makeMongoId = mongodb.ObjectID,
    objTypeMap = {'user':{}};

/**
 * 加载本地的验证文件
 */
loadSchema = function(schema_name, schema_path) {
    fsHandle.readFile(schema_path, 'utf-8', function(err, data) {
        objTypeMap[schema_name] = JSON.parse(data);
    });
};

/**
 * 验证器
 */
checkSchema = function(obj_type, obj_map, callback) {
    var schema_map = objTypeMap[obj_type],
        report_map = validator.validate(obj_map, schema_map);
    callback(report_map.errors);
};

clearIsOnline = function() {
    updateObj(
        'user',
        {is_online: true},
        {is_online: false},
        function(response_map) {
            console.log('All users set to offline');
        }
    );
};

checkType = function(obj_type) {
    if(!objTypeMap[obj_type]) {
        return ({
            error_msg: 'Object type ' + obj_type
            + ' is not supported'
        });
    }
    return null;
};

constructorObj = function(obj_type, obj_map, callback) {
    var type_check_map = checkType(obj_type);
    if(type_check_map) {
        callback(type_check_map);
        return;
    }
    checkSchema(
        obj_type, obj_map,
        function(error_list) {
            if(error_list.length === 0) {
                dbHandle.collection(
                    obj_type,
                    function(outer_error, collection) {
                        var options_map = {safe: true};
                        collection.insert(
                            obj_map,
                            options_map,
                            function(inner_error, result_map) {
                                callback(result_map);
                            }
                        );
                    }
                );
            }
            else {
                callback({
                    error_msg: '输入错误',
                    error_list: error_list
                });
            }
        }
    );
};

readObj = function(obj_type, find_map, fields_map, callback) {
    var type_check_map = checkType(obj_type);
    if(type_check_map) {
        callback(type_check_map);
        return;
    }
    dbHandle.collection(
        obj_type,
        function(outer_error, collection) {
            collection.find(find_map, fields_map).toArray(
                function(inner_error, result_map) {
                    callback(result_map);
                }
            );
        }
    );
};

updateObj = function(obj_type, find_map, set_map, callback) {
    var type_check_map = checkType(obj_type);
    if(type_check_map) {
        callback(type_check_map);
        return;
    }
    checkSchema(
        obj_type, set_map,
        function(error_list) {
            if(error_list.length === 0) {
                dbHandle.collection(
                    obj_type,
                    function(outer_error, collection) {
                        collection.update(
                            find_map,
                            {$set: set_map},
                            {safe:true, multi: true, upsert:false},
                            function(inner_error, updated_map) {
                                callback(updated_map);
                            }
                        );
                    }
                );
            }
            else {
                callback({
                    error_msg: '输入错误',
                    error_list: error_list
                });
            }
        }
    );
};

destroyObj = function(obj_type, find_map, callback) {
    var type_check_map = checkType(obj_type);
    if(type_check_map) {
        callback(type_check_map);
        return;
    }
    dbHandle.collection(
        obj_type,
        function(outer_error, collection) {
            var options_map = {safe:true, single: true};
            collection.remove(
                find_map,
                options_map,
                function(inner_error, delete_count) {
                    callback({delete_count: delete_count});
                }
            );
        }
    );
};

/**
 * 顺序加载本地验证文件
 */
(function(){
    var schema_name, schema_path;
    for(schema_name in objTypeMap) {
        if(objTypeMap.hasOwnProperty(schema_name)) {
            schema_path = __dirname + '/' + schema_name + '.json';
            loadSchema(schema_name, schema_path);
        }
    }
}());

/**
 * 打开数据库
 */
dbHandle.open(function() {
    console.log('** Connected to MongoDB **');
    clearIsOnline();
});

module.exports = {
    makeMongoId: mongodb.ObjectID,
    checkType: checkType,
    construct: constructorObj,
    read: readObj,
    update: updateObj,
    destroy: destroyObj
};
