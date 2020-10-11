const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = 8000;
var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';

app.use('/app', express.static('app'));

app.get('/reddem/:serialKey', (req, res) => {
	console.log(req.params.serialKey);
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		function (err, db) {
			if (err) throw err;
			db.db('cat')
				.collection('activators')
				.find({ serialkey: req.params.serialKey })
				.toArray(function (err, result) {
					if (err) {
						console.log(err);
					}
					if (result) {
						console.log(result);
						res.send(result);
					}
					db.close();
				});
		}
	);
});

http.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

// MongoClient.connect(
// 	url,
// 	{ useNewUrlParser: true, useUnifiedTopology: true },
// 	function (err, db) {
// 		if (err) throw err;
// 		var dbo = db.db('cat');
// 		// var myobj = {
// 		// 	loc: { type: 'Point', coordinates: [26.002089, -98.075912] },
// 		// 	name: 'Silent',
// 		// };
// 		// dbo.collection('customers').insertOne(myobj, function (err, res) {
// 		// 	if (err) throw err;
// 		// 	console.log('1 document inserted');
// 		// 	db.close();
// 		// });
// 		// dbo.collection('customers').createIndex( { loc : "2dsphere" }, function (err, res) {
// 		// 	if (err) throw err;
// 		// 	console.log('1 document inserted');
// 		// 	db.close();
// 		// });
// 		dbo.collection('activators').find({serialkey:"zxc"}).toArray(
// 			function (err, result) {
// 				if (err){
// 					console.warn(err);
// 				};
// 				if (result) {
//                     console.log(result);
//                 }
// 				db.close();
// 			}
// 		);
// 	}
// );
io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('reddem', (msg) => {
		MongoClient.connect(
			url,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			function (err, db) {
				if (err) throw err;
				db.db('cat')
					.collection('BadgeActivators')
					.find({
						SerialKey: msg.serialKey,
						Geoposition: {
							$near: {
								type: 'Point',
								coordinates: [msg.long, msg.lat],
							},
						},
						StartDate: { $gte: +new Date() },
						EndDate: { $lte: +new Date() },
					})
					.toArray(function (err, result) {
						if (err) {
							console.log(err);
						}
						if (result) {
							io.emit('reddem', result);
						}
						db.close();
					});
			}
		);
	});
	socket.on('reddem test insert', (msg) => {
		MongoClient.connect(
			url,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			function (err, db) {
				if (err) throw err;
				db.db('cat')
				.collection('BadgeActivators')
				.createIndex({ Geoposition: '2dsphere' }, function (err, res) {
					if (err) throw err;
					console.log('1 document inserted');
					db.close();
				});
			}
		);
	});
});
