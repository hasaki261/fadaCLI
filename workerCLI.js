const language = 'EN'
let triggerWelcome = false
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
        self.postMessage( {type: 'fetchResult', response: { success: true, nick: userData.PlayerInfo.SocialDetail.ProfileDetail.Nickname, uid: userData.PlayerInfo.SocialDetail.ProfileDetail.Uid }} )
        fullData = userData
        const realData = await mapData(fullData)
        if (realData.sucess) self.postMessage( {type: 'fetchData', response = {success: true, data: realData} } )
        else self.postMessage( {type: 'fetchData', response = {success: false, data: realData.error} } )
    }
  }
  if (type === "displayStart") {
        self.postMessage( { type: 'mainScreens', response: { success: true } } )
  }
  if (type === "welcomeStart" && !triggerWelcome) {
        triggerWelcome = true
        const agentsInfo = await processAgentdata(fullData)
        self.postMessage( { type: 'mainWelcome', response: agentsInfo } )
  }
  if (type === "logInStart") {
        const userInfo = await processSocialData(fullData)
        self.postMessage( { type: 'mainLogIn', response: userInfo } )
  }
}
async function processAgentdata(userData) {
    const avatarsData = await (await fetch(`./mapping/raw/avatars.json`)).json()
    const showCaseData = userData.PlayerInfo.ShowcaseDetail
    const rawUserAvatars = showCaseData.AvatarList
    const userAvatarsIds = rawUserAvatars.map(idx => idx.Id)
    const userAgents = []
    for (const avatarId of userAvatarsIds) {
        const agentData = await (await fetch(`./mapping/tools/${language}/Avatars/${avatarId}.json`)).json() // Missing Fallback for non-existing avatars
        const agentObject = {
            name: agentData.Name,
            class: agentData.Specialty,
            element: avatarsData[avatarId].ElementTypes[0],
            elementDMG: agentData.ElementTypes[0],
        }
        userAgents.push(agentObject)
    }
    return userAgents
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
async function mapData(data) {
    const rawAvatarsMap = await (await fetch('./mapping/raw/avatars.json')).json() 
    const rawWeaponMap = await (await fetch('./mapping/raw/weapons.json')).json()
    const avatars = data.PlayerInfo.ShowcaseDetail.AvatarList
    for (const avatar of avatars) {
        const avatarInfo = await (await fetch(`./mapping/tools/EN/Avatars/${avatar.Id}.json`)).json()
        const weaponInfo = await (await fetch(`./mapping/tools/EN/Weapons/${avatar.Weapon.Id}.json`)).json()
        const name = avatarInfo.name
        const avatarClass = avatarInfo.Specialty.Name
        const highLightProps =  rawAvatarsMap[avatar.Id].HighlightProps
        const agentBaseStats = {}
        // For each baseprop agent have, they will be add in agentBaseStats array
        Object.entries(rawAvatarsMap[avatar.Id].BaseProps).forEach(([key, value]) => {
            agentBaseStats[key] = { baseValue: value }
        })
        // To complete baseprops, weapon mainstat can grow your base stats too, so, weapon maistat is calculated here
        const weaponMain = rawWeaponMap[avatar.Weapon.Id].MainStat
        const weaponMainValue = weaponMain.PropertyValue * (1 + 0.1568166666666667 * avatar.Weapon.Level + 0.8922 * avatar.Weapon.BreakLevel)
        agentBaseStats[weaponMain.PropertyId] = {
            baseValue: (agentBaseStats[weaponMain.PropertyId]?.baseValue ||  0) + weaponMainValue
        }
        // Now, we need to calculate the real baseValue, using agent level and core values
        // Some values from core can be some value outside baseprops, like rina, she gain Pen Ratio from core, but doesnt have pen ratio as base value
        // Because base total is calculated as BaseTotalValue = BaseProps[PropertyId] + GrowthValue + PromotionValue + CoreEnhancementValue, any stat thats have any of this fields will have a base value
        // Every field will be verified, and if dont have a object in agentBaseStats for the respective stat, they will be add 
        Object.entries(rawAvatarsMap[avatar.Id].GrowthProps).forEach(([key, preValue]) => {
            const value = (preValue * (avatar.Level - 1)) / 10000
            if (agentBaseStats[key]) agentBaseStats[key].growthValue = value
            else agentBaseStats[key] = { growthValue: value }
        })
        // PromotionValue now
        Object.entries(rawAvatarsMap[avatar.Id].PromotionProps[avatar.PromotionLevel - 1]).forEach(([key, value]) => {
            if (agentBaseStats[key]) agentBaseStats[key].promotionValue = value
            else agentBaseStats[key] = { promotionValue: value }
        })
        // Core now
        Object.entries(rawAvatarsMap[avatar.Id].CoreEnhancementProps[avatar.CoreSkillEnhancement]).forEach(([key, value]) => {
            if (agentBaseStats[key]) agentBaseStats[key].coreValue = value
            else agentBaseStats[key] = { coreValue: value }
        })
        // Now we sum everything
        const totalBaseStats = {}
        Object.entries(agentBaseStats).forEach(([stat, values]) => {
            const total = (values.baseValue || 0) + (values.growthValue || 0) + (values.promotionValue || 0) + (values.coreValue || 0)
            if (total !== 0) totalBaseStats[stat] = total
        })
        // With every base stats in hands, we will calculate the total, base + base*percent
        const agentRelativeStats = {}
        // First with the weapon secundary stat
        const weaponSec = rawWeaponMap[avatar.Weapon.Id].SecondaryStat
        const weaponSecValue = weaponSec.PropertyValue* (1 + 0.3 * avatar.Weapon.BreakLevel)
        agentRelativeStats[weaponSec.PropertyId] = weaponSecValue
        // Now with two pieces disks bonus
        const disksInfo = await (await fetch('./mapping/raw/equipments.json')).json()
        const disks = avatar.EquippedList
        const diskBonuses = findBonus(disks, disksInfo)
        Object.entries(diskBonuses).forEach(([key, value]) => { 
            agentRelativeStats[key] = (agentRelativeStats[key] || 0) + value
        })
        // We have to calculate disks Mainstats too
        const rarityScale = {
            "4": 0.2,
            "3": 0.25,
            "2": 0.3
        }
        disks.forEach(disk => {
            const diskMain = disk.Equipment.MainPropertyList[0]
            const diskRarity = rarityScale[disksInfo[disk.Equipment.Id].Rarity]
            const diskMainValue = diskMain.PropertyValue + (diskMain.PropertyValue * disk.Equipment.Level * diskRarity)
            agentRelativeStats[diskMain.PropertyId] = (agentRelativeStats[diskMain.PropertyId] || 0) + diskMainValue
            // In the same looping, we can calculate substats too
            disk.Equipment.RandomPropertyList.forEach(subStat => {
                agentRelativeStats[subStat.PropertyId] = (agentRelativeStats[subStat.PropertyId] || 0) 
                 + (subStat.PropertyValue * subStat.PropertyLevel)
            })
        })
        // We have to sum base stats with relative stats with the same name
        const statsInfo = await (await fetch('./mapping/raw/property.json'))
        agentStats = {}
        Object.entries(totalBaseStats).forEach(([stat, value]) => {
            agentStats[statsInfo[stat].Name] = (agentStats[statsInfo[stat].Name] || 0) + value
        })
        Object.entries(agentRelativeStats).forEach(([stat, value]) => {
            agentStats[statsInfo[stat].Name] = (agentStats[statsInfo[stat].Name] || 0) + value
        })
        // Some stats represents the same stat but with different names, we will join everything in a total
        Object.entries(agentStats).forEach(([stat, value]) => {
            if (stat.split('_')[1] === 'base' || stat.split('_')[1] === 'Base') {
                const total = agentStats[stat]
                 + (agentStats[`${stat.split('_')[0]}_ratio`]/10000 || agentStats[`${stat.split('_')[0]}_Ratio`]/10000 || 0) * agentStats[stat]
                 + (agentStats[stat.split('_')[0]] || 0);
                agentStats[`${stat.split('_')[0]}_Total`] = total.toFixed(2)
            }
            // Also, we have to verify if a value is a percentual or integer and floor this
            const format = findStatFormat(stat, statsInfo)
            const decimal = format.includes('.')
             ? format.split('.')[1].replace(/[^0#]/g, '').length
             : 1
            let realValue = value.toFixed(decimal)
            if (format.includes('%')) realValue = `${realValue/100}%`
            agentStats[stat] = String(Number(realValue))
        })
    }
}
function findBonus(disks, disksInfo) {
    const bonuses = {}
    const suits = disks.map(disk => diskInfo.Items[disk.Equipment.Id].SuitId)
    const dups = []
    suits.forEach(suitId => {
        if (dups.includes(suitId)) return
        const firstIdx = suits.indexOf(suitId)
        const lastIdx = suits.lastIndexOf(suitId)
        if (firstIdx !== lastIdx) {
            dups.push(suitId)
            const suitBonus = diskInfo.Suits[suitId].SetBonusProps
            const [stat, bonus] = Object.entries(suitBonus)[0]
            bonuses[stat] = (bonuses[stat] || 0) + bonus
        }
    })
    return bonuses
}
function findStatFormat(statName, statsInfo) {
    return Object.entries(statsInfo).filter(([id, info]) => info.Name === statName)[0].Format
}