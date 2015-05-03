/**
 * @namespace chat.js
 * 
 */
'use strict';
var chatObj, emitUserList, signIn,
	socket = require('socket.io'),
	crud = require('./crud'),
	makeMongoId = crud,makeMongoId,
	chatterMap = {};

/**
 * 将在线人员列表广播出去
 * @param  {[type]} io [description]
 * @return {[type]}    [description]
 */
emitUserList = function(io) {
	crud.read(
		'user',
		{is_online: true},
		{},
		function(result_list) {
			io.of('/chat')
			  .emit('listchange', result_list);
		}
	);
};

signIn = function(io, user_map, socket) {
	crud.update(
		'user',
		{'_id': user_map._id},
		{is_online: true},
		function(result_map) {
			emitUserList(io);
			user_map.is_online = true,
			socket.emit('userupdate', user_map);
		}
	);
	chatterMap[user_map._id] = socket;
	socket.user_id = user_map._id;
};

chatObj = {
	connect: function(server) {
		var io = socket.listen(server);
		io.set('blacklist', [])
		  .of('/chat')
		  .on('connection', function(socket) {
		  		/** 新增用户 */
		  		socket.on('adduser', function(user_map) {
		  			crud.read(
		  				'user',
		  				{name: user_map.name},
		  				{},
		  				function(result_list) {
		  					var result_map,
		  						cid = user_map.cid;
		  					delete user_map.cid;
		  					if(result_list.length > 0) {
		  						result_map = result_list[0];
		  						result_map.cid = cid,
		  						signIn(io, result_map, socket);
		  					}
		  					else {
		  						user_map.is_online = true;
		  						crud.construct(
		  							'user',
		  							user_map,
		  							function(result_list) {
		  								result_map = result_list[0];
		  								result_map.cid = cid;
		  								chatterMap[result_map._id] = socket;
		  								socket.user_id = result_map._id;
		  								socket.emit('userupdate', result_map);
		  								emitUserList(io);
		  							}
		  						)
		  					}
		  				}
		  			);
		  		});

		  		/** 更新聊天记录 */
		  		socket.on('updatechat', function(chat_map) {
		  			if(chatterMap.hasOwnProperty(chat_map.dest_id)) {
		  				chatterMap[chat_map.dest_id]
		  					.emit('updatechat', chat_map);
		  			}
		  			else {
		  				socket.emit('updatechat', {
		  					sender_id: chat_map.sender_id,
		  					msg_text: chat_map.dest_name + 'has gone offline.'
		  				});
		  			}
		  		});
		  });
		return io;
	}
};

module.exports = chatObj;