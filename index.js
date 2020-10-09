const express = require('express');
var cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(cookieParser());
app.use('/app', express.static('app'));

app.get('/reddem/', (req, res) => {
    console.log(req.cookies);
	res.send('Hello World!:');
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';

// MongoClient.connect(
// 	url,
// 	{ useNewUrlParser: true, useUnifiedTopology: true },
// 	function (err, db) {
// 		if (err) throw err;
// 		var dbo = db.db('badges');
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
// 		dbo.collection('customers').findOne(
// 			{
// 				loc: {
// 					$near: {
// 						$geometry: {
// 							type: 'Point',
// 							coordinates: [-99.075912, 26.002089],
// 						},
// 						$maxDistance: 100,
// 					},
// 				},
// 			},
// 			function (err, result) {
// 				if (err) throw err;
// 				if (result) {
//                     console.log(result);
//                 }
// 				db.close();
// 			}
// 		);
// 	}
// );
