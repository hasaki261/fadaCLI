const language = 'EN'
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
  if (type === "displayStart") {
        self.postMessage( { type: 'mainScreens', response: { success: true } } )
  }
}
async function processAgentdata(userData) {
    // const avatarsData = (await fetch(`./mapping/raw/avatars.json`)).json()
    // const showCaseData = userData.PlayerInfo.ShowcaseDetail
    // const rawUserAvatars = showCaseData.avatarsList
    // const userAvatarsIds = rawUserAvatars.map(idx => idx.id)
    // const userAgents = []
    // for (const avatarId of userAvatarsIds) {
    //     const agentData = await fetch(`./mapping/tools/${language}/Avatars/${avatarId}.json`)?.json() // Missing Fallback for non-existing avatars
    //     const agentObject = {
    //         name: agentData.Name,
    //         class: agentData.Specialty,
    //         element: avatarsData[avatarId].ElementTypes[0],
    //         elementDMG: agentData.ElementTypes[0],
    //     }
    // }
}
async function processSocialData(userData) {
    const pfpData = (await fetch(`./mapping/raw/pfps.json`)).json()
    const socialData = userData.PlayerInfo.SocialDetail
    const userNickName = socialData.ProfileDetail.Nickname
    const userIconPath = pfpData[socialData.ProfileDetail.ProfileId].icon
    const userIconURl = 'https://enka.network' + userIconPath
    const userTitle = socialData.Desc
    const userLevel = socialData.ProfileDetail.Level
}