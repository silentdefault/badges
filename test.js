const fetch = require('node-fetch');
const { ObjectID, ObjectId } = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';
const query = {
	serialKey: 'nieve',
	date: 1641013200000,
	long: -98.0758816,
	lat: 26.0020881,
	userID: '5f84aafca002ed9b9c8b5daf',
};

const allPipeLine = [
	{
		$lookup: {
			from: 'Badges',
			localField: 'Badge',
			foreignField: '_id',
			as: 'Badge',
		},
	},
	{
		$project: {
			_id: 1,
			Serialkey: 1,
			RedeemLimit: 1,
			Geoposition: 1,
			Weather: 1,
			Distance: 1,
			Badge: {
				$arrayElemAt: ['$Badge', 0],
			},
		},
	},
	{
		$lookup: {
			from: 'Redeems',
			localField: 'Badge._id',
			foreignField: 'Badge',
			as: 'Badge.Redeems',
		},
	},
	{
		$lookup: {
			from: 'BadgeTypes',
			localField: 'Badge.Type',
			foreignField: '_id',
			as: 'Badge.Type',
		},
	},
	{
		$lookup: {
			from: 'Redeems',
			localField: '_id',
			foreignField: 'ActivatedBy',
			as: 'Redeems',
		},
	},
	{
		$match: {
			Redeems: {
				$not: {
					$elemMatch: {
						User: ObjectId(query.userID),
					},
				},
			},
			'Badge.Creator': {
				$not: {
					$eq: ObjectId(query.userID),
				},
			},
		},
	},
	{
		$project: {
			_id: 1,
			Serialkey: 1,
			RedeemLimit: 1,
			Redeems: {
				$size: '$Redeems',
			},
			Distance: 1,
			Geoposition: 1,
			Weather: 1,
			Badge: {
				_id: 1,
				Name: 1,
				Redeems: {
					$size: '$Badge.Redeems',
				},
				Type: {
					$arrayElemAt: ['$Badge.Type', 0],
				},
			},
		},
	},
	{
		$match: {
			$expr: {
				$or: [
					{
						$and: [
							{
								$eq: ['$RedeemLimit', -1],
							},
							{
								$or: [
									{
										$eq: ['$Badge.Type.RedeemLimit', -1],
									},
									{
										$gt: ['$Badge.Type.RedeemLimit', '$Badge.Redeems'],
									},
								],
							},
						],
					},
					{
						$gt: ['$RedeemLimit', '$Redeems'],
					},
				],
			},
		},
	},
];

///retorna
function Redeem() {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		async function (err, db) {
			if (err) throw err;
			var testStart = +new Date();
			var result = await db
				.db('cat')
				.collection('Activators')
				.aggregate(
					[
						{
							$geoNear: {
								near: {
									type: 'Point',
									coordinates: [query.long, query.lat],
								},
								distanceField: 'Distance',
								maxDistance: 20,
								query: {
									$and: [
										{
											SerialKey: query.serialKey,
										},
										{
											$or: [
												{
													'RangeDate.Start': {
														$lte: query.date,
													},
													'RangeDate.End': {
														$gte: query.date,
													},
												},
												{
													'RangeDate.Start': -1,
													'RangeDate.End': -1,
												},
											],
										},
									],
								},
							},
						},
					].concat(allPipeLine)
				)
				.toArray();
			if (result) {
				console.log('se busco sin gps');
				result = await db
					.db('cat')
					.collection('Activators')
					.aggregate(
						[
							{
								$match: {
									$and: [
										{ SerialKey: query.serialKey },
										{
											$or: [
												{
													'RangeDate.Start': { $lte: query.date },
													'RangeDate.End': { $gte: query.date },
												},
												{
													'RangeDate.Start': -1,
													'RangeDate.End': -1,
												},
											],
										},
									],
								},
							},
						].concat(allPipeLine)
					)
					.toArray();
			}
			if (result[0]) {
				console.log(result[0]);
				// if (result[0].Weather) {
				// 	await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon${query.long}&appid=082b7ddc98e8ec88c2d1fac4811d9e40&units=metric`)
				// 		.then(res => res.json())
				// 		.then(x => {
				// 			console.log(x);
				// 		});
				// }
				if (result[0].Geoposition) {
					console.log(result[0].Geoposition);
				} else {
				}
				console.log('Activator found!!!');
				// await db.db("cat").collection("Redeems").insertOne({
				// 	User: ObjectId(query.userID),
				// 	Badge: ObjectId(result[0].Badge._id),
				// 	ActivatedBy: ObjectId(result[0]._id)
				// });
				console.log('Redeemed!!!');
			} else {
				console.log(
					'No se encontro Activador, activador llego a su limite, ya has canjeado esa medalla o esa medalla la creaste tú y no puedes canjearla, sorry'
				);
			}
			db.close();
			var testEnd = +new Date();
			console.log(testEnd - testStart);
		}
	);
}

///retorna array de medallas que el usuario a redimido
function getBadgesByUser(userID) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		async function (err, db) {
			if (err) throw err;
			var result = await db
				.db('cat')
				.collection('Users')
				.aggregate([
					{
						$match: {
							_id: ObjectId(userID),
						},
					},
					{
						$lookup: {
							from: 'Redeems',
							localField: '_id',
							foreignField: 'User',
							as: 'Redeem',
						},
					},
					{
						$unwind: {
							path: '$Redeem',
						},
					},
					{
						$lookup: {
							from: 'Badges',
							localField: 'Redeem.Badge',
							foreignField: '_id',
							as: 'Badge',
						},
					},
					{
						$project: {
							_id: 0,
							Badge: {
								$arrayElemAt: ['$Badge', 0],
							},
						},
					},
				])
				.toArray();
			if (result) {
				console.log(result);
			} else {
				console.log('Usuario no existe o no tiene Medallas');
			}
			db.close();
		}
	);
}

///retorna array de tipo de medallas que usuario ha comprado y la cantidad de ellas que puede crear
function getShoppinByUser(userID) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		async function (err, db) {
			if (err) throw err;
			var shop = await db
				.db('cat')
				.collection('Shopping')
				.aggregate([
					{
						$match: {
							User: ObjectId(userID),
						},
					},
					{
						$lookup: {
							from: 'BadgeTypes',
							localField: 'BadgeType',
							foreignField: '_id',
							as: 'BadgeType',
						},
					},
					{
						$project: {
							_id: 1,
							User: 1,
							BadgeType: {
								$arrayElemAt: ['$BadgeType', 0],
							},
						},
					},
					{
						$group: {
							_id: '$BadgeType.Nombre',
							count: {
								$sum: 1,
							},
						},
					},
				])
				.toArray();
			if (shop) {
				var bad = await db
					.db('cat')
					.collection('Badges')
					.aggregate([
						{
							$match: {
								Creator: ObjectId(userID),
							},
						},
						{
							$lookup: {
								from: 'BadgeTypes',
								localField: 'Type',
								foreignField: '_id',
								as: 'BadgeType',
							},
						},
						{
							$project: {
								_id: 1,
								User: 1,
								BadgeType: {
									$arrayElemAt: ['$BadgeType', 0],
								},
							},
						},
						{
							$group: {
								_id: '$BadgeType.Nombre',
								count: {
									$sum: 1,
								},
							},
						},
					])
					.toArray();
				shop.map((x) => {
					let y = bad.filter((y) => y._id == x._id);
					if (y[0]) {
						x.count = x.count - y[0].count;
					}
					return x;
				});
				console.log(shop);
			} else {
				console.log('Usuario no ha comprado medallas');
			}
			db.close();
		}
	);
}

///todo
function createBadge(userID,Name,IMG,Type) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		async function (err, db) {
			if (err) throw err;
			var shop = await db.db('cat').collection('Badge').insertOne({

			});
			if (shop) {
			} else {
				console.log('Usuario no ha comprado medallas');
			}
			db.close();
		}
	);
}

///todo
function createActivator(userID,Badge) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		async function (err, db) {
			if (err) throw err;
			var shop = await db.db('cat').collection('Badge').insertOne({
				
			});
			if (shop) {
			} else {
				console.log('Usuario no ha comprado medallas');
			}
			db.close();
		}
	);
}

getShoppinByUser('5f84aafca002ed9b9c8b5daa');
