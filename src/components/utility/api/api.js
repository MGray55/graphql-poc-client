// imports from outside node_modules need to be relative in this file for server side use as node does not yet support absolute paths with ES modules
// import { countryCode, toolsMode } from '../cms/cms';
import { fireEvent, EVENT_TYPES } from '../events';
import establishSession, { STATUS } from '../../../auth/gateway-session-negotiator';
// import { APP_MODE } from '../constants/app';
import endpoints from './constants/endpoints';
import ky from 'ky';
// import { ACTIVE_DEMO, getDemoVal, isDemo, verboseLog } from '../util-functions/Util';
import { gotoLoginPage } from './api-utils';

/**
 * @typedef {Object} AuthRequestError
 * @property {string} message 
 * @property {{status:number}|undefined} response 
 * @property {true | undefined} error 
 * @property {string | undefined} errorText 
 * @property {number | -1 | undefined} statusCode
 * @property {null | undefined} data
 */

/**
 * @typedef {Object} AuthRequestOptions
 * @property {string} url endpoint to call
 * @property {'POST'|'GET'|'PUT'|'DELETE'|undefined} method default is 'GET'. either method or type is used
 * @property {boolean | undefined} isText when true, return response as text not parsing as json
 * @property {(err:Error)=>any | undefined} error when this is defined, throw is not created. you should manually handle thowing exception if you want to force failure. if error is not defined, it will throw error unless throwError arg is false
 * @property {(resp:any)=>any | undefined} success when succeed, success is called.
 * @property {(resp:any, error:string|undefined)=>any | undefined} complete 
 * @property {Object<string,string> | undefined} additionalHeaders add additional headers to the request headers. override if there is the same header already.
 * @property {string} contentType add content-type in the request headers. 
 * @property {BodyInit} data data to send to the server. 
 */

/**
 * this function throws error when 
 * @param {AuthRequestOptions} ajaxOptions 
 * @param {boolean} throwError optional when ajaxOptions does not have error. when it is false, it returns error object instead of throwing error. if error() is defined in ajaxOptions, it is handled by error() instead of throwing Error.
 * @returns {any | AuthRequestError}
 * @throws {AuthRequestError}
 */
export async function authenticatedRequest(ajaxOptions, throwError=true, limit=5) {
	if(limit<=0) {
		throw new Error('Too many tries');
	}
	if(!ajaxOptions.url) {
		throw new Error('Missing or malformed URL');
	}
		
	const isSimFail = false; // isDemo(ACTIVE_DEMO.SIMULATE_FAIL) && ajaxOptions.url.includes(getDemoVal(ACTIVE_DEMO.SIMULATE_FAIL));
	const errorCode = 400; // getDemoVal(ACTIVE_DEMO.SIMULATE_FAIL_STATUS) ? parseInt(getDemoVal(ACTIVE_DEMO.SIMULATE_FAIL_STATUS)): 400;
	const additionalHeaders = ajaxOptions.additionalHeaders || {};

	try{
		const option = {
			method: (ajaxOptions.type || ajaxOptions.method || 'GET').toLowerCase(), 
			credentials: 'include',
			// 			credentials: toolsMode === APP_MODE.public || toolsMode === APP_MODE.deNav ? 'omit' : 'include',
			headers: {
				'x-selected-country': 'US', //countryCode,
				...(ajaxOptions.contentType && {'content-type': ajaxOptions.contentType}),
				...additionalHeaders,
			},
			timeout: false,
			...(ajaxOptions.data && {body: ajaxOptions.data})
		};
		if(option.headers['content-type'] === 'application/json' && option.body && typeof option.body !== 'string') {
			throw new Error('body must be string when content-type is application/json');
		}
		const resp1 = isSimFail ? new Response(null, {
			headers: new Headers(),
			status: errorCode,
			statusText: 'simulated error"'
		}): await ky(ajaxOptions.url, option);

		let resp2;
		const status = isSimFail ? errorCode : resp1?.status || -1;
		if(status.toString().match(/20[\d]/gm)) {
			const isContentTypeJson = (resp1.headers.get('content-type') || '').includes('json'); // if content-type is application/json, it is json
			const shouldParseAsText = ajaxOptions?.isText || !isContentTypeJson || status === 204;
			resp2 = shouldParseAsText ? await resp1.text() : await resp1.json();
		}
		else{
			let err;
			if (status === 401 || status === 403) {
				resp1.text().then(errTxt=>{
					console.error("error while calling: "+ajaxOptions.url, errTxt)
				});
			}
			err = new Error(`There was an issue retrieving data from ${ajaxOptions.url}: ${status}`);
			err.response = resp1;
			throw err;
		} 
		const resp3 = ajaxOptions.success ? await ajaxOptions.success(resp2) : resp2;
		const retFromComplete = ajaxOptions.complete && await ajaxOptions.complete(resp2);
		return retFromComplete || resp3 || resp2;
	}catch(error){
		if (error.response?.status === 401) {
			// 401: unauthorized. 
			return await new Promise((resolve, reject) => {
				establishSession(({ status, loginUrl }) => {
					switch (status) {
						case STATUS.LOGIN_REQUIRED:
							gotoLoginPage(loginUrl);
							break;
						case STATUS.FAILED:
							fireEvent(EVENT_TYPES.API_UNAVAILABLE);
							ajaxOptions.complete && ajaxOptions.complete(null, "error");
							break;
						default:
							if(status !== STATUS.SUCCESSFUL){
								console.warn("unknown status: ", status);
								console.warn("retrying... " + limit + "/5");
							}
							authenticatedRequest(ajaxOptions, throwError, limit-1)
								.then(ret=>resolve(ret))
								.catch(err=>reject(err));
							return; // in this case, don't resolve it until the next call is done.
					}
					resolve(null);
				}, { gatewaySessionUrl: endpoints().session });
				const errMsg = `unauthorized for ${ajaxOptions.url}:`;
				console.error(errMsg, error);
			});
		}
		else if (error.response?.status === 403) {
			// 403: forbidden
			const errMsg = `client is forbidden for ${ajaxOptions.url}: `;
			console.error(errMsg, error);

			return {
				errors: error.message
			}
		}
		else {
			// all errors other than 401 and 403
			let errorToRet = ajaxOptions?.error ? ajaxOptions.error(error) : null;
			if(!errorToRet){
				errorToRet = new Error(error?.message || '');
			}
			if(errorToRet.response === undefined){
				errorToRet.response = error.response;
			}
			if(errorToRet.errorText === undefined){
				errorToRet.errorText = error.message;
			}
			if(errorToRet.error === undefined){
				errorToRet.error = true;
			}
			if(errorToRet.statusCode === undefined){
				errorToRet.statusCode = error.response?.status || -1;
			}
			if(errorToRet.data === undefined){
				errorToRet.data = null;
			}
			const errMsg = `There was an issue retrieving data from ${ajaxOptions.url}: `;
			console.error(errMsg, errorToRet);
			if(!ajaxOptions?.error && throwError){
				throw errorToRet;
			}
			return errorToRet;
		}
	}
}

export {
	endpoints
};