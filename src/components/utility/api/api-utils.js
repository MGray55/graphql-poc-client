export function gotoLoginPage(loginUrl) {
	if (process.env.NODE_ENV === 'development') {
		window.location = `${new URL(loginUrl).origin}/login?r=ToolsLocal`;
	} else {
		window.location = loginUrl;
	}
}
