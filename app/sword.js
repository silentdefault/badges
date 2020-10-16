var serialkey = '';
function redeemA() {
	navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
	var { accuracy, latitude, longitude } = position.coords;
	if (accuracy <= 30) {
		socket.emit('reddem', {
			serialKey: serialkey,
			lat: latitude,
			long: longitude,
		});
	} else {
		navigator.geolocation.getCurrentPosition(showPosition);
	}
}

window.onhashchange = function (e) {
	if (location.hash) {
		if (location.hash == '#scanner') {
			document.querySelector('#scanner').hidden = false;
			document.querySelector('#index').hidden = true;
			Scanner();
		}
	} else {
		document.querySelector('video').srcObject.getTracks()[0].stop();
		document.querySelector('#scanner').hidden = true;
		document.querySelector('#index').hidden = false;
	}
};

document.querySelector('#redeemQR').addEventListener(
	'click',
	() => {
		location.hash = '#scanner';
	},
	false
);

document.querySelector('#redeemNow').addEventListener(
	'click',
	() => {
		console.log('TODO:search without qr');
		redeemA();
	},
	false
);

socket.on('reddem', function (msg) {
	console.log('result reddem: ' + msg);
});

var stripe = Stripe('pk_test_76s3qm5qS77ixe7Bbv77B1xc');
var elements = stripe.elements();

var elements = stripe.elements();
var style = {
	base: {
		color: '#32325d',
	},
};

var card = elements.create('card', { style: style });
card.mount('#card-element');

card.on('change', ({ error }) => {
	const displayError = document.getElementById('card-errors');
	if (error) {
		displayError.textContent = error.message;
	} else {
		displayError.textContent = '';
	}
});
var form = document.getElementById('payment-form');

form.addEventListener('submit', function (ev) {
	ev.preventDefault();
	fetch('/secret')
	.then(function (response) {
		return response.json();
	})
	.then(function (responseJson) {
		var clientSecret = responseJson.client_secret;
		stripe
		.confirmCardPayment(clientSecret, {
			payment_method: {
				card: card,
				billing_details: {
					name: 'Jenny Rosen',
				},
			},
		})
		.then(function (result) {
			if (result.error) {
				// Show error to your customer (e.g., insufficient funds)
				console.log(result.error.message);
			} else {
				// The payment has been processed!
				if (result.paymentIntent.status === 'succeeded') {
					console.log("sucess");
				}
			}
		});
	});
});
