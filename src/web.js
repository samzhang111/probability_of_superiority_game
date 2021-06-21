export const submitToMturk = async (data) => {
	const response = await fetch(data.turkSubmitTo + '/mturk/externalSubmit', {
		method: "POST",
		body: JSON.stringify(data)
	})

	return response.json()
}

export const logToAzure = async (data) => {
	const response = await fetch("https://mturk-function-app-node.azurewebsites.net/api/mturk-insert-response", {
		method: "POST",
		body: JSON.stringify(data)
	})

	return response.json()
}