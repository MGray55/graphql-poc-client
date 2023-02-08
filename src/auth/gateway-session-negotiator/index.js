let activeCallbacks = null;

export const STATUS = {
	LOGIN_REQUIRED: "login-required",
	SUCCESSFUL: "successful",
	FAILED: "failed",
};

export const establishSession = (callback, config) => {
	config = Object.assign(
		{
			gatewaySessionUrl: null,
		},
		config
	);

	// if we have a collection of callbacks already, this means a refresh process is in progress already
	if (activeCallbacks) {
		activeCallbacks.push(callback);
		return;
	} else {
		activeCallbacks = [callback];
	}

	const statusCallback = (status, loginUrl = null) => {
		const populatedCallbacks = [...activeCallbacks.filter((cb) => !!cb)];
		activeCallbacks = null; // clearing this first on the off chance one of these callbacks somehow synchronously tries to perform another refresh
		populatedCallbacks.forEach((cb) => cb({ status, loginUrl }));
	};

	const performBackgroundTokenRefresh = (authorizeUrl, loginUrl) => {
		const iframe = document.createElement("iframe");
		iframe.style.display = "none";

		let timeoutRef = null;
		const intervalRef = setInterval(() => {
			try {
				if (iframe.contentWindow.location.hostname) {
					clearInterval(intervalRef);

					timeoutRef = setTimeout(() => {
						redirectFailedHandler();
					}, 4000);
				}
			} catch (_) {
				clearInterval(intervalRef);

				// if the message is not sent by the iframe within 10 seconds, fail this refresh
				timeoutRef = setTimeout(() => {
					redirectFailedHandler();
				}, 4000);
			}
		}, 50);

		const redirectFailedHandler = () => {
			console.error("contentWindow location isn't on a Dimensional subdomain");
			clearInterval(intervalRef);
			window.removeEventListener("message", authEventListener);
			document.querySelector("body").removeChild(iframe);
			statusCallback(STATUS.FAILED);
		};

		const authEventListener = (event) => {
			if (event.source !== iframe.contentWindow) {
				console.error("source of auth event did not match what we wanted");
				return;
			}

			window.removeEventListener("message", authEventListener);
			clearInterval(intervalRef);
			clearTimeout(timeoutRef);

			if (!event.data.tokenStatus) {
				console.error("token refresh message did not take any recognized form");
				statusCallback(STATUS.FAILED);
			} else {
				statusCallback(event.data.tokenStatus, loginUrl);
			}

			document.querySelector("body").removeChild(iframe);
		};

		window.addEventListener("message", authEventListener, false);

		document.querySelector("body").appendChild(iframe);
		iframe.src = authorizeUrl;
	};

	fetch(config.gatewaySessionUrl, {
		credentials: "include",
	})
		.then((response) => {
			if (response.ok === true) {
				statusCallback(STATUS.SUCCESSFUL);
			} else if (response.status === 401) {
				return response.json();
			} else {
				console.error(
					`token refresh failed with unrecognized gateway status code ${response.status}`
				);
				statusCallback(STATUS.FAILED);
			}
		})
		.then((responseJson) => {
			if (responseJson) {
				const { authorizeURL, afterLoginURL } = responseJson.data;
				performBackgroundTokenRefresh(authorizeURL, afterLoginURL);
			}
		});
};


export default establishSession;
