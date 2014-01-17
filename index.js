(function app() {
	'use strict';

	var eventName = document.ontouchdown ? 'touchdown' : 'mousedown';

	function setupCamera(next) {
		if (!navigator.mozCameras) {
			return next('No camera');
		}

		function found(camera) {
			count--;
			if (camera) {
				var flashModes = camera.capabilities.flashModes;
				console.log('flashModes: ' + flashModes);
				if (flashModes && flashModes.indexOf('torch') >= 0) {
					console.log('Found my torch!');
					count = -1;
					next(null, camera);
				}
			}
			if (!count) {
				next('No flash');
			}
		}

		var cameras = navigator.mozCameras.getListOfCameras();
		var count = cameras.length;
		console.log('cameras: ' + count);
		for (var i = 0; i < cameras.length; i++) {
			navigator.mozCameras.getCamera({
				camera: cameras[i]
			}, found);
		}
		if (!count) {
			next('No camera');
		}
	}

	var torched = false;
	var currentCamera = null;

	function trigger(to, release) {
		torched = (to != null) ? to : (!torched);

		if (torched) {
			document.body.classList.add('torching');
		} else {
			document.body.classList.remove('torching');
		}

		if (currentCamera) {
			currentCamera.flashMode = (torched) ? 'torch' : 'auto';
			return;
		}

		console.log('Calling setupCamera');
		setupCamera(function(err, camera) {
			if (!camera) {
				console.warn(err);
				document.body.classList.add('unsupported');
				return;
			}
			document.body.classList.add('supported');
			currentCamera = camera;
			console.log('Setting flashMode');
			camera.flashMode = (torched) ? 'torch' : 'auto';
		});
	}

	document.body.addEventListener(eventName, function(evt) {
		evt.preventDefault();
		trigger();
	});

	document.addEventListener('visibilitychange', function() {
		if (document.hidden) {
			trigger(false);
			if (currentCamera) {
				currentCamera.release(function() {
					console.log('Camera released');
				});
				currentCamera = null;
			}
		}
	}, false);

})();