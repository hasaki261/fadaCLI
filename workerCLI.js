const language = 'EN'
let fullData
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
        self.postMessage( {type: 'fetchResult', response: { success: true, nick: userData.PlayerInfo.SocialDetail.ProfileDetail.Nickname }} )
        fullData = userData 
    }
  }
  if (type === "displayStart") {
        self.postMessage( { type: 'mainScreens', response: { success: true } } )
  }
  if (type === "welcomeStart") {
        self.postMessage( { type: 'mainWelcome', response: { success: true } } )
  }
  if (type === "logInStart") {
        const userInfo = await processSocialData(fullData)
        self.postMessage( { type: 'mainLogIn', response: userInfo } )
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
    const pfpData = await (await fetch(`./mapping/raw/pfps.json`)).json()
    const socialData = userData.PlayerInfo.SocialDetail
    const userNickName = socialData.ProfileDetail.Nickname
    const userIconId = socialData.ProfileDetail.ProfileId
    const userBannerId = socialData.ProfileDetail.CallingCardId
    const userIconPath = pfpData[userIconId].Icon
    const userIconURl = 'https://enka.network' + userIconPath
    const userDesc = socialData.Desc
    const userLevel = socialData.ProfileDetail.Level
    let userServer = userData.region
    if (userServer === 'NA') userServer = 'America/NA'
    else if (userServer === 'EU') userServer = 'Europe/EU'
    else if (userServer === 'CN') userServer = 'China/CN'
    else if (userServer === 'JP') userServer = 'Japan/JP'
    const userUid = socialData.ProfileDetail.Uid
    return {
        iconURL: userIconURl,
        nick: userNickName,
        level: userLevel,
        uid: userUid,
        server: userServer,
        iconId: userIconId,
        bannerId: userBannerId,
        desc: userDesc
    }
}