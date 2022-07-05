const url_api = window.location.protocol+'//'+window.location.hostname + process.env.REACT_APP_URI_API
export const fetchAPI = async (
	uri: string,
	abortSignal?: AbortSignal,
	needStatus: number = 200
): Promise<any> => {
	let result = new Response();
	try {
	result = await fetch(url_api + uri, {
		headers: {
			'Content-Type': 'application/json'
		},
		signal: abortSignal
	});
	} catch(e: unknown) {
		const err = e instanceof Error ? ': ' + e.message : '' 
		throw new Error(`URL ${url_api} not available${err}`)
	}
	if (result.status !== needStatus) {
		const message ='bad request to API, response code: '  	+ result.status
		try {
		const err = await result.json()
		const details = err.detail
		throw new Error(message + ", details: " + details);
		} catch {
			throw new Error(message)
		}
	}
	return result.json();
}
