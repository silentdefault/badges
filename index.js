const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = 8000;
var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';

var en = require('nanoid-good/locale/en');
var es = require('nanoid-good/locale/es');
var generate = require('nanoid-good/generate')(en, es);
const library = '2346789ABCDEFGHJKLMNPQRTUVWXYZabcdefghijkmnpqrtwxyz';

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

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('reddem', (query) => {
		MongoClient.connect(
			url,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			function (err, db) {
				if (err) throw err;
				var date = +new Date();
				db.db('cat')
					.collection('Activators')
					.findOne(
						{
							$and: [
								{ SerialKey: query.serialKey },
								{
									$or: [
										{
											'RangeDate.Start': { $lt: date },
											'RangeDate.End': { $gte: date },
										},
										{ 'RangeDate.Start': -1, 'RangeDate.End': -1 },
									],
								},
								{
									Geoposition: {
										$near: {
											type: 'Point',
											coordinates: [query.long, query.lat],
										},
										$maxDistance: 20,
									},
								},
							],
						},
						async function (err, result) {
							if (err) throw err;
							if (!result) {
								result = await db
									.db('cat')
									.collection('Activators')
									.findOne({
										$and: [
											{ SerialKey: query.serialKey },
											{
												$or: [
													{
														'RangeDate.Start': { $lt: date },
														'RangeDate.End': { $gte: date },
													},
													{ 'RangeDate.Start': -1, 'RangeDate.End': -1 },
												],
											},
											{ Geoposition: null },
										],
									});
							}
							console.log(result);
							io.emit('reddem', result);
							db.close();
						}
					);
			}
		);
	});
	socket.on('reddem test insert', (msg) => {});
});
