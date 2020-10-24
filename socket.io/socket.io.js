// var Category = require("../models/category.model.js");
// var Booking = require('../models/booking.model.js');
module.exports = (http) => {
	var io = require('socket.io')(http);
	io.on('connection', (socket) => {
		console.log('co nguoi ket noi ' + socket.id);
		socket.on("login", (data) => {
			var user = data.username;
			var password = data.password;
			console.log(data);
			
		})
		socket.on("test", () => {
			Booking.find().then((booking) => {
				socket.emit("teston", booking)
			})
		})
		socket.on('check-room', async(data) => {
			var datein = data.datein;
			var dateout = data.dateout;
			var iddm = data.iddm;
			console.log(data);
			console.log(new Date(datein));
			Booking.find({
				id_category: iddm,
				$nor: [{
					datein: {
						$gt: new Date(dateout)
					}
				}, {
					dateout: {
						$lt: new Date(datein),
					}
				}]
			}, {
				room: 1,
				_id: 0
			}, (err, room) => {
				console.log(room);
				var phong = [];
				for (var i = 0; i < room.length; i++) {
					phong.push(room[i].room)
				};
				console.log(room);
				Category.findOne({
					_id: iddm
				}, {
					_id: 0,
					room: 1
				}, (err, rom) => {
					if (err) {
						console.log(err);
						return;
					};
					x = rom.room.filter(val => !phong.includes(val));
					console.log(x);
					socket.emit("send-room", x);
				})

			});
		})
		socket.on('send-id-room', (data) => {
			const room = Object.keys(io.sockets.adapter.rooms);
			console.log(data);
			if (room.indexOf(data) >= 0) {
				console.log(io.sockets.adapter.rooms[data].length);
				if (io.sockets.adapter.rooms[data].length < 5) {
					socket.join(data)
					socket.Phong = data;
				} else {
					io.to(socket.id).emit('error-in-room');
				}
			} else {
				socket.join(data);
				socket.Phong = data;
			}
		})
		socket.on('check', function(data) {
			console.log(data);
			var obj = {
				fullname: data.fullname,
				gender: data.gender,
				email: data.email,
				idcard: data.idcard,
				country: data.country,
				datein: new Date(data.datein),
				dateout: new Date(data.dateout),
				room: data.room,
				id_category: data.id_category,
			}
			new Booking(obj).save().then((person) => {
				if (person) {
					socket.emit('ans', true);
					socket.to(data.id_category).emit('notification')
					console.log(person);
				};
			}).catch((err) => {
				socket.emit('ans', false)
				console.log(err);
			})
		});
		socket.on('disconnect', () => {
			console.log(socket.id + 'da ngat ket noi');
		})
	});
}