self.onmessage = async function (e) {
  const { type, data } = e.data

  if (type === "fetch") {
    const uid = data
    let workerLog
    let userData
    let acessError
    const urls = [
      `https://enka.network/api/zzz/uid/${uid}`,
      `https://fadazzzproxy.lucascampelo2040.workers.dev/${uid}`,
    ]
    for (const url of urls) {
        try {
            const response  = await fetch(url,  {
                headers: {
                    "User-Agent": "discotecafadacfworker/discord:hasak116",
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                    Referer: "https://discotecafada.vercel.app/",
                    Origin: "https://discotecafada.vercel.app",
                },
            })
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
