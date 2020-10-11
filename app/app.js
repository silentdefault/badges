function Scanner() {
	if (
		!(
			'mediaDevices' in navigator &&
			'getUserMedia' in navigator.mediaDevices &&
			'Worker' in window
		)
	) {
		alert('Sorry, your browser is not compatible with this app.');
		return;
	}

	// html elements
	const snapshotCanvas = document.getElementById('snapshot');
	const snapshotContext = snapshotCanvas.getContext('2d');
	const video = document.getElementById('camera');
	const overlay = document.getElementById('snapshotLimitOverlay');

	// init QRCode Web Worker
	const qrcodeWorker = new Worker('app/qrcode_worker.js');
	qrcodeWorker.postMessage({ cmd: 'init' });
	qrcodeWorker.addEventListener('message', showResult);

	let snapshotSquare;
	function calculateSquare() {
		// get square of snapshot in the video
		let snapshotSize = overlay.offsetWidth;
		snapshotSquare = {
			x: ~~((video.videoWidth - snapshotSize) / 2),
			y: ~~((video.videoHeight - snapshotSize) / 2),
			size: ~~snapshotSize,
		};

		snapshotCanvas.width = snapshotSquare.size;
		snapshotCanvas.height = snapshotSquare.size;
	}

	function scanCode(wasSuccess) {
		setTimeout(
			function () {
				snapshotContext.drawImage(
					video,
					snapshotSquare.x,
					snapshotSquare.y,
					snapshotSquare.size,
					snapshotSquare.size,
					0,
					0,
					snapshotSquare.size,
					snapshotSquare.size
				);
				const imageData = snapshotContext.getImageData(
					0,
					0,
					snapshotSquare.size,
					snapshotSquare.size
				);

				// scan for QRCode
				qrcodeWorker.postMessage({
					cmd: 'process',
					width: snapshotSquare.size,
					height: snapshotSquare.size,
					imageData: imageData,
				});
			},
			wasSuccess ? 2000 : 120
		);
	}

	function showResult(e) {
		const resultData = e.data;
		if (resultData !== false) {
            /// // vibration is not supported on Edge, IE, Opera and Safari
            serialkey=resultData;
            console.log(resultData);
            redeemA();
			location.hash = '';
		} else {
			scanCode();
		}
	}
	let currentDeviceId;
	function initVideoStream() {
		let config = {
			audio: false,
			video: {},
		};
		config.video = { facingMode: { exact: 'environment' } };

		stopStream();

		navigator.mediaDevices
			.getUserMedia(config)
			.then(function (stream) {
				video.srcObject = stream;
				video.oncanplay = function () {
					calculateSquare();
					scanCode();
				};
			})
			.catch(function (error) {
				alert(error.name + ': ' + error.message);
			});
	}
	initVideoStream();

	function stopStream() {
		//disableUI();

		if (video.srcObject) {
			video.srcObject.getTracks()[0].stop();
		}
	}

	// listen for optimizedResize
	window.addEventListener('optimizedResize', calculateSquare);

	// add flip camera button if necessary
	navigator.mediaDevices.enumerateDevices().then(function (devices) {
		devices = devices.filter(function (device) {
			return device.kind === 'videoinput';
		});

		if (devices.length > 1) {
			currentDeviceId = devices[0].deviceId;
			// });
		}
	});

	document.addEventListener('visibilitychange', function () {
		if (document.hidden) {
			stopStream();
		} else {
			initVideoStream();
		}
	});
}

// listen for resize event
(function () {
	let throttle = function (type, name, obj) {
		obj = obj || window;
		let running = false;
		let func = function () {
			if (running) {
				return;
			}
			running = true;
			requestAnimationFrame(function () {
				obj.dispatchEvent(new CustomEvent(name));
				running = false;
			});
		};
		obj.addEventListener(type, func);
	};

	/* init - you can init any event */
	throttle('resize', 'optimizedResize');
})();
