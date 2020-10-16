const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = 8000;
var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb+srv://silent:kvrVp7u9mUL7N8y9@cluster0.kyigf.azure.mongodb.net/badges?retryWrites=true&w=majority';

// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_LsREEV7Vq9V8CEjY3izupX4J00cMM5KAcU');

var en = require('nanoid-good/locale/en');
var es = require('nanoid-good/locale/es');
var generate = require('nanoid-good/generate')(en, es);
const library = '2346789ABCDEFGHJKLMNPQRTUVWXYZabcdefghijkmnpqrtwxyz';

app.use('/app', express.static('app'));

app.get('/secret', async (req, res) => {
	const intent = await stripe.paymentIntents.create({
		amount: 100,
		currency: 'USD',
		// Verify your integration in this guide by including this parameter
		metadata: { integration_check: 'accept_a_payment' },
	});
	res.json({ client_secret: intent.client_secret });
});

const bodyParser = require('body-parser');

// Match the raw body to content type application/json
app.post(
	'/webhook',
	bodyParser.raw({ type: 'application/json' }),
	(request, response) => {
		let event;

		try {
			event = JSON.parse(request.body);
		} catch (err) {
			response.status(400).send(`Webhook Error: ${err.message}`);
		}

		// Handle the event
		switch (event.type) {
			case 'payment_intent.succeeded':
				const paymentIntent = event.data.object;
				console.log('PaymentIntent was successful!');
				break;
			case 'payment_method.attached':
				const paymentMethod = event.data.object;
				console.log('PaymentMethod was attached to a Customer!');
				break;
			// ... handle other event types
			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		// Return a 200 response to acknowledge receipt of the event
		response.json({ received: true });
	}
);

app.get('/sucess', (req, res) => {
	res.send('sucess xd');
});

app.get('/cancel', (req, res) => {
	res.send('canel xd');
});

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
