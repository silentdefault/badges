var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';
const query = {
	serialKey: '',
	date: 1641013200000,
	long: -98.0758816,
	lat: 26.0020881,
};
var conter=0;
do {
    MongoClient.connect(
        url,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
            if (err) throw err;
            var testStartDate = new Date();
            db.db('cat')
                .collection('Activators')
                .findOne(
                    {
                        $and: [
                            { SerialKey: query.serialKey },
                            {
                                $or: [
                                    {
                                        'RangeDate.Start': { $lt: query.date },
                                        'RangeDate.End': { $gte: query.date },
                                    },
                                    { 'RangeDate.Start': -1, 'RangeDate.End': -1 },
                                ],
                            },
                            {
                                Geoposition: {
                                    $near: { type: 'Point', coordinates: [query.long, query.lat] },
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
                                                    'RangeDate.Start': { $lt: query.date },
                                                    'RangeDate.End': { $gte: query.date },
                                                },
                                                { 'RangeDate.Start': -1, 'RangeDate.End': -1 },
                                            ],
                                        },
                                        { Geoposition: null },
                                    ],
                                });
                        }
                        //console.log(result);
                        var testEndDate= +new Date()
                        console.log(testEndDate-testStartDate);
                        db.close();
                    }
                );
        }
    );
    conter++;
} while (conter<100);