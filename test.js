const { ObjectID, ObjectId } = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';
const query = {
	serialKey: 'asd',
	date: 1641013200000,
	long: -98.0758816,
	lat: 26.0020881,
	userID: '5f84aafca002ed9b9c8b5daa',
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
MongoClient.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	async function (err, db) {
		if (err) throw err;
		var testStart = +new Date();
		allPipeLine.push;
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
			console.log('Activator found!!!');
			console.log(result[0]);
			/*await db.db("cat").collection("Redeems").insertOne({
				User: ObjectId(query.userID),
				Badge: ObjectId(result[0].Badge._id),
				ActivatedBy: ObjectId(result[0]._id)
			});*/
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
