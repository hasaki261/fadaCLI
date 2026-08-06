self.onmessage = async function (e) {
  const { type, data } = e.data

  if (type === "fetch") {
    const uid = data
    let workerLog
    let userData
    let acessError
    const urls = [`/api/zzz/uid/${encodeURIComponent(uid)}`]
    for (const url of urls) {
        try {
            const response  = await fetch(url,  {
                headers: {
                    Accept: "application/json"
                },
            })
            console.log(response)
            if (response.ok) {
                userData = await response.json()
                break
            } else {
                acessError = response.status
                continue
            }
        } catch (error) {
            console.error('fetch error', url, error.message)
            continue
        }
    }
    if (!userData) {
        if (acessError === 400) workerLog = { success: false, error: "400 Invalid UID" };
        else if (acessError === 404) workerLog = { success: false, error: "404 Invalid User" }
        else if (acessError === 424) workerLog = { success: false, error: "424 System Off" }
        else if (acessError === 429) workerLog = { success: false, error: "429 Too much request" }
        else workerLog = { success: false, error: "Unknown Error/No Service" }
        self.postMessage( {type: 'fetchResult', response: workerLog} )
    } else {
        self.postMessage( {type: 'fetchResult', response: { success: true }} )
    }
  }
}
function processUserdata(userData) {
    
}