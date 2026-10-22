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
        if (realData) self.postMessage( {type: 'fetchData', response: {success: true, data: realData} } )
        else self.postMessage( {type: 'fetchData', response: {success: false} } )
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
    const bannerData = await (await fetch(`./mapping/raw/namecards.json`)).json()
    const socialData = userData.PlayerInfo.SocialDetail
    const userNickName = socialData.ProfileDetail.Nickname
    const userIconId = socialData.ProfileDetail.ProfileId
    const userBannerId = socialData.ProfileDetail.CallingCardId
    const userBannerPath = bannerData[userBannerId].Icon
    const userBannerURL = 'https://enka.network' + userBannerPath
    const userIconPath = pfpData[userIconId].Icon
    const userIconURL = 'https://enka.network' + userIconPath
    const userDesc = socialData.Desc
    const userLevel = socialData.ProfileDetail.Level
    let userServer = userData.region
    if (userServer === 'NA') userServer = 'America/NA'
    else if (userServer === 'EU') userServer = 'Europe/EU'
    else if (userServer === 'CN') userServer = 'China/CN'
    else if (userServer === 'JP') userServer = 'Japan/JP'
    const userUid = socialData.ProfileDetail.Uid
    return {
        iconURL: userIconURL,
        nick: userNickName,
        level: userLevel,
        uid: userUid,
        server: userServer,
        iconId: userIconId,
        bannerId: userBannerId,
        bannerURL: userBannerURL,
        desc: userDesc
    }
}
async function fetchJson(url) {
    const res = await fetch(url)
    if (!res.ok) {
        console.error(`Fetch failed: ${url} — status ${res.status}`)
        throw new Error(`Failed to fetch ${url}: ${res.status}`)
    }
    return res.json()
}
async function mapData(data) {
    const rawAvatarsMap = await fetchJson('./mapping/raw/avatars.json')
    const rawWeaponMap = await fetchJson('./mapping/raw/weapons.json')
    const statsInfo = await fetchJson('./mapping/raw/property.json')
    const disksInfo = await fetchJson('./mapping/raw/equipments.json')
    const rarityScale = {
        "4": 0.2,
        "3": 0.25,
        "2": 0.3
    }
    const avatars = data?.PlayerInfo?.ShowcaseDetail?.AvatarList || []
    const agentsData = []
    for (const avatar of avatars) {
        try
        {
            const avatarInfo = await fetchJson(`./mapping/tools/EN/Avatars/${avatar.Id}.json`)
            const weaponInfo = avatar?.Weapon?.Id ? await fetchJson(`./mapping/tools/EN/Weapons/${avatar?.Weapon?.Id}.json`).catch(() => ({})) || {} : {}
            const name = avatarInfo.Name
            const avatarClass = avatarInfo?.Specialty?.Name
            const highLightProps = rawAvatarsMap?.[avatar.Id]?.HighlightProps
            const agentBaseStats = {}
            // For each baseprop agent have, they will be add in agentBaseStats array
            Object.entries((rawAvatarsMap?.[avatar?.Id]?.BaseProps) || {}).forEach(([key, value]) => {
                agentBaseStats[key] = { baseValue: value }
            })
            // To complete baseprops, weapon mainstat can grow your base stats too, so, weapon maistat is calculated here
            const weaponMain = rawWeaponMap?.[avatar?.Weapon?.Id]?.MainStat || {}
            const weaponMainValue = (weaponMain?.PropertyValue || 0) * (1 + 0.1568166666666667 * (avatar?.Weapon?.Level || 0) + 0.8922 * (avatar?.Weapon?.BreakLevel || 0))
            if (weaponMain.PropertyId) agentBaseStats[weaponMain.PropertyId] = {
                baseValue: (agentBaseStats[weaponMain.PropertyId]?.baseValue ||  0) + weaponMainValue
            }
            // Now, we need to calculate the real baseValue, using agent level and core values
            // Some values from core can be some value outside baseprops, like rina, she gain Pen Ratio from core, but doesnt have pen ratio as base value
            // Because base total is calculated as BaseTotalValue = BaseProps[PropertyId] + GrowthValue + PromotionValue + CoreEnhancementValue, any stat thats have any of this fields will have a base value
            // Every field will be verified, and if dont have a object in agentBaseStats for the respective stat, they will be add 
            Object.entries((rawAvatarsMap?.[avatar?.Id]?.GrowthProps) || {}).forEach(([key, preValue]) => {
                const value = (preValue * (avatar.Level - 1)) / 10000
                if (agentBaseStats[key]) agentBaseStats[key].growthValue = value
                else agentBaseStats[key] = { growthValue: value }
            })
            // PromotionValue now
            if (avatar.PromotionLevel > 0) {
                Object.entries(rawAvatarsMap?.[avatar.Id]?.PromotionProps?.[avatar.PromotionLevel - 1] || {}).forEach(([key, value]) => {
                    if (agentBaseStats[key]) agentBaseStats[key].promotionValue = value
                    else agentBaseStats[key] = { promotionValue: value }
                })
            }
            // Core now
            Object.entries((rawAvatarsMap?.[avatar?.Id]?.CoreEnhancementProps?.[avatar.CoreSkillEnhancement]) || {}).forEach(([key, value]) => {
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
            const weaponSec = rawWeaponMap?.[avatar?.Weapon?.Id]?.SecondaryStat || {}
            const weaponSecValue = (weaponSec?.PropertyValue || 0) * (1 + 0.3 * (avatar?.Weapon?.BreakLevel || 0))
            if (weaponSec.PropertyId) agentRelativeStats[weaponSec.PropertyId] = weaponSecValue
            // Now with two pieces disks bonus
            const disks = avatar?.EquippedList || []
            const diskBonuses = findBonus(disks, disksInfo)
            Object.entries(diskBonuses.bonuses).forEach(([key, value]) => { 
                agentRelativeStats[key] = (agentRelativeStats[key] || 0) + value
            })
            // We have to calculate disks Mainstats too
            disks.forEach(disk => {
                if (!(disk?.Equipment?.MainPropertyList?.[0]) || !(disksInfo?.Items?.[disk?.Equipment?.Id])) return
                const diskMain = disk?.Equipment?.MainPropertyList?.[0]
                const diskRarity = rarityScale[disksInfo.Items?.[disk.Equipment?.Id]?.Rarity] ?? 0
                const diskMainValue = diskMain.PropertyValue + (diskMain.PropertyValue * disk.Equipment.Level * diskRarity)
                agentRelativeStats[diskMain.PropertyId] = (agentRelativeStats[diskMain.PropertyId] || 0) + diskMainValue;
                // In the same looping, we can calculate substats too
                (disk.Equipment.RandomPropertyList || []).forEach(subStat => {
                    agentRelativeStats[subStat.PropertyId] = (agentRelativeStats[subStat.PropertyId] || 0) 
                    + (subStat.PropertyValue * subStat.PropertyLevel)
                })
            })
            // We have to sum base stats with relative stats with the same name
            const agentStats = sumStats(statsInfo, totalBaseStats, agentRelativeStats)
            // Now we have three objs, one for base stats, other for relative stats and one for the sum of these two
            // We can return some info from the agent too
            const skillsArray = { '0': 'Basic Attack', '1': 'Special Attack', '2': 'Dash', '3': 'Ultimate', '5': 'Core Skill', '6': 'Assist' } 
            const agentInfo = {
                id: avatar.Id,
                name: name,
                level: avatar.Level,
                cinema: avatar.TalentLevel,
                class: avatarClass,
                stats: highLightProps || [],
                element: avatarInfo?.ElementTypes[0] || 'unknown',
                subelement: (rawAvatarsMap[avatar.Id]?.ElementTypes?.[0] || avatarInfo?.ElementTypes[0] || 'unknown'),
                skills: (avatar.SkillLevelList || []).reduce((acc, skill) => {
                    if (!skillsArray[skill.Index]) return acc;
                    acc[skillsArray[skill.Index]] = skill.Level;
                    return acc;
                }, {}),
                weapon: {
                    id: avatar?.Weapon?.Id || undefined,
                    name: weaponInfo?.ItemName || undefined,
                    level: avatar?.Weapon?.Level || undefined,
                    refine: avatar?.Weapon?.UpgradeLevel || undefined,
                    sig: rawAvatarsMap[avatar.Id]?.WeaponId === avatar?.Weapon?.Id || undefined
                },
                disks: disks.filter(d => d?.Equipment).map(disk => {
                    const equipmentInfo = disk.Equipment
                    delete equipmentInfo.IsAvailable
                    delete equipmentInfo.IsLocked
                    delete equipmentInfo.IsTrash
                    delete equipmentInfo.BreakLevel
                    delete equipmentInfo.Exp
                    delete equipmentInfo.Uid
                    return equipmentInfo
                }),
                pieces: {
                    'twoPieces': diskBonuses.dups,
                    'quadPieces': diskBonuses.quad
                },
                fav: avatar.IsFavorite,
                skin: avatar.SkinId,
                since: avatar.ObtainmentTimestamp
            }
            agentsData.push({
                agentInfo: agentInfo,
                baseData: totalBaseStats,
                relativeData: agentRelativeStats,
                totalData: agentStats
            })
        } catch (e) {
            console.warn('WrongFormated CharData', avatar?.Id, e)
        }
    }
    return agentsData
}
function findBonus(disks, disksInfo) {
    const bonuses = {}
    const suits = disks
     .map(d => disksInfo.Items?.[d?.Equipment?.Id]?.SuitId)
     .filter(Boolean)
    const dups = []
    let quad
    suits.forEach(suitId => {
        const count = suits.filter(x => x === suitId)
        if (count.length === 4) quad = suitId
        if (dups.includes(suitId)) return
        const firstIdx = suits.indexOf(suitId)
        const lastIdx = suits.lastIndexOf(suitId)
        if (firstIdx !== lastIdx) {
            dups.push(suitId)
            const suitBonus = disksInfo.Suits?.[suitId]?.SetBonusProps || []
            if (Object.keys(suitBonus).length === 0) return 
            const [stat, bonus] = Object.entries(suitBonus)[0]
            bonuses[stat] = (bonuses[stat] || 0) + bonus
        }
    })
    return { bonuses: bonuses, dups: dups, quad: (quad || undefined) }
}
function sumStats(statsInfo, baseStats, relativeStats) {
    const familyTotal = {}
    Object.keys(relativeStats).forEach(stat => {
        const family = stat.split('').slice(0, -1).join('')
        if (Object.keys(familyTotal).includes(family)) return
        const variants = Object.keys(statsInfo).filter(key => key.startsWith(family))
        let percent, base, flat
        variants.forEach(subKey => {
            if ((subKey.endsWith('1') && !statsInfo[subKey]?.Format?.includes('%')) || statsInfo[subKey]?.Name?.toLowerCase().split('_')[1] === 'base') {
                base = (base || 0) + (baseStats[subKey] || 0) + (relativeStats[subKey] || 0)
            }
            else if (subKey.endsWith('2')
             || statsInfo[subKey]?.Name?.toLowerCase().split('_')[1] === 'ratio'
             || statsInfo[subKey]?.Format?.includes('%')
            ) percent = (percent || 0) + (relativeStats[subKey] || 0) + (baseStats[subKey] || 0)
            else flat = (flat || 0) + (relativeStats[subKey] || 0) + (baseStats[subKey] || 0)
        })
        if (base) familyTotal[family] = (base || 0)*(1+((percent || 0)/10000)) + (flat || 0)
        else familyTotal[family] = percent ? (percent/100 || 0) : (flat || 0)  
    })
    return familyTotal
}
function findStatFormat(statName, statsInfo) {
    return Object.entries(statsInfo).filter(([id, info]) => info.Name === statName)[0]?.Format
}