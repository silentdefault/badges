var serialkey = '';
function redeemA() {
	navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
	var { accuracy, latitude, longitude } = position.coords;
	if (accuracy <= 30) {
		socket.emit('reddem', {
            serialkey:serialkey,
			lat: latitude,
			long: longitude
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