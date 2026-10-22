import { newDecLine, newNormalLine, getSVGASCII } from '../midFunctions.js'
import avatarInfo from '../public/mapping/raw/avatars.json'
import diskInfo from '../public/mapping/raw/equipments.json'
import propertys from '../public/mapping/raw/property.json'
import statusName from '../public/mapping/manualMap/statusName.json'
const rarityScale = {
    "4": 0.2,
    "3": 0.25,
    "2": 0.3
}

export async function zzzFetch(data, name, idx, uid) {
    try {
        const mainCT = document.querySelector('.terminalCT')
        const fetchBox = newNormalLine('', false)
        fetchBox.className = 'fetchBox'
        const infoCT = newNormalLine('', false)
        infoCT.className = 'infoCT'
        fetchBox.appendChild(infoCT)
        const userChar = `${name.replaceAll(' ', '_').toLowerCase()}@${data.agentInfo.name.replaceAll(' ', '_').toLowerCase()}`
        const lineName = newNormalLine(userChar,  true)
        const separator = newNormalLine('-'.repeat(userChar.length), true)
        infoCT.appendChild(lineName)
        infoCT.appendChild(separator)
        const charNameCT = newNormalLine('')
        const charNameIdx = newNormalLine('Agent:',  true)
        const avatarId = String(data.agentInfo.id).split('')
        const charName = newNormalLine(`${data.agentInfo.name} ${avatarId[0]}.${avatarId[1]}.${avatarId.slice(2).join('')} x0${(data.agentInfo.cinema) || 0}_${(data.agentInfo.level) || 0}`)
        charNameCT.appendChild(charNameIdx)
        charNameCT.appendChild(charName)
        infoCT.appendChild(charNameCT)
        const charWeaponCT = newNormalLine('')
        const charWeaponIdx = newNormalLine('Weapon:',  true)
        let weaponId, charWeapon;
        if (data?.agentInfo?.weapon?.id) {
            weaponId = String(data.agentInfo.weapon.id).split('')
            charWeapon = newNormalLine(`${data.agentInfo.weapon.name} ${weaponId[0]}.${weaponId[1]}.${weaponId.slice(2).join('')} x0${(data.agentInfo.weapon.refine) || 0}_${(data.agentInfo.weapon.level) || 0}${data.agentInfo.weapon.sig ? ' [Sig]' : ''}`)
        }
        charWeaponCT.appendChild(charWeaponIdx)
        charWeaponCT.appendChild(charWeapon || newNormalLine('None'))
        infoCT.appendChild(charWeaponCT)
        const charTypeCT = newNormalLine('')
        const charTypeIdx = newNormalLine('Type:',  true)
        let charType = newNormalLine('unknown')
        if (data?.agentInfo?.class || data?.agentInfo?.element || data?.agentInfo?.subelement) {
            charType = newNormalLine(`${(data.agentInfo.class) || 'unk'}@${(data.agentInfo.element || 'unk')}_${(data.agentInfo.subelement?.toLowerCase()) || 'unk'}`)
        }
        charTypeCT.appendChild(charTypeIdx)
        charTypeCT.appendChild(charType)
        infoCT.appendChild(charTypeCT)
        const charUpTimeCT = newNormalLine('')
        const charUpTimeIdx = newNormalLine('Uptime:',  true)
        const charUpTime = newNormalLine(secToDays((Date.now()/1000) - data.agentInfo.since))
        charUpTimeCT.appendChild(charUpTimeIdx)
        charUpTimeCT.appendChild(charUpTime)
        infoCT.appendChild(charUpTimeCT)
        const charDisksCT = newNormalLine('')
        const charDisksIdx = newNormalLine('Disks:',  true)
        let diskString = data.agentInfo.pieces.quadPieces ? 4 + ' ' + getDiskAbr(data.agentInfo.pieces.quadPieces) + '-' + String(data.agentInfo.pieces.quadPieces).slice(0, 3) : ''
        data.agentInfo.pieces.twoPieces.forEach(twoPieces => {
            if (twoPieces === data.agentInfo.pieces.quadPieces) return
            diskString = diskString + `, 2 ${getDiskAbr(twoPieces)}-${String(twoPieces).slice(0, 3)}`
        })
        if (!(data.agentInfo.pieces.quadPieces)) diskString = diskString.slice(2)
        const charDisks = newNormalLine(`${data.agentInfo.disks.length} (${diskString})`)
        charDisksCT.appendChild(charDisksIdx)
        charDisksCT.appendChild(charDisks)
        infoCT.appendChild(charDisksCT)
        const charStatsCT = newNormalLine('')
        const charStatsIdx = newNormalLine('Stats:',  true)
        let statsString
        data.agentInfo.stats.forEach(stat => {
            const family = String(stat).split('').slice(0, -1).join('')
            const format = statusName?.EN?.[family]?.short || propertys?.[stat]?.Name || String(stat)
            let total = data.totalData[family] !== undefined
                ? data.totalData[family]
                : (data.relativeData[stat] || 0) + (data.baseData[stat] || 0)
            if (data.agentInfo?.class && data.agentInfo?.class === 'Rupture') total = getRuptureStat(data.totalData)
            let prefix = ''
            if (statusName?.EN?.[family]?.type?.includes('percent')) prefix = '%'
            if (statusName?.EN?.[family]?.type === 'total/percent') total = total/100
            statsString = `${(statsString || '')} ${format}[${prefix === '%' ? total.toFixed(1) : Math.floor(total)}${prefix}]`
        })
        const charStats = newNormalLine(statsString)
        charStatsCT.appendChild(charStatsIdx)
        charStatsCT.appendChild(charStats)
        infoCT.appendChild(charStatsCT)
        const charRegenCT = newNormalLine('')
        const regenFamilies = ['3050', '3200', '3240']
        let regenTotal, regenBase
        regenFamilies.forEach(regenType => {
            const regenValues = []
            const base = data.baseData[Object.keys(data.baseData).filter(key => key.startsWith(regenType))[0]] || 0
            const relative = data.relativeData[Object.keys(data.relativeData).filter(key => key.startsWith(regenType))[0]] || 0
            let total = data.totalData[Object.keys(data.totalData).filter(key => key.startsWith(regenType))[0]] || 0
            if (!base && !relative && !total) return
            if (!total) total = base+(base*relative)
            regenBase = (base/100).toFixed(2)
            regenTotal = (total/100).toFixed(2)
        })
        const charRegenIdx = newNormalLine('Regen:',  true)
        let charRegen = newNormalLine(`x0`)
        if (regenTotal && regenBase) charRegen = newNormalLine(`x${regenTotal} (${regenBase})`)
        charRegenCT.appendChild(charRegenIdx)
        charRegenCT.appendChild(charRegen)
        infoCT.appendChild(charRegenCT)
        const charCritCT = newNormalLine('')
        const charCritIdx = newNormalLine('Crit:',  true)
        let critRelativeRate = 0, critRelativeDamage = 0
        Object.keys(data.relativeData).forEach(key => {
            if (key.startsWith(2010)) critRelativeRate = critRelativeRate + data.relativeData[key]
            else if(key.startsWith(2110)) critRelativeDamage = critRelativeDamage + data.relativeData[key]
            else return
        })
        const critRate = data.totalData[2010] ? data.totalData[2010].toFixed(1) : ((data.baseData[20101] || 0)/100 + (critRelativeRate || 0)/100).toFixed(1)
        const critDMG = data.totalData[2110] ? data.totalData[2110].toFixed(1) : ((data.baseData[21101] || 0)/100 + (critRelativeDamage || 0)/100).toFixed(1)
        const charCrit = newNormalLine(`Rate(${critRate}%)xDamage(${critDMG}%) 1x2`)
        charCritCT.appendChild(charCritIdx)
        charCritCT.appendChild(charCrit)
        infoCT.appendChild(charCritCT)
        const charDFiveCT = newNormalLine('')
        const charDFiveIdx = newNormalLine('Special (D5):',  true)
        const d5 = data.agentInfo.disks.find(d => String(d.Id).endsWith('5'))
        const d5Main = d5?.MainPropertyList?.[0]
        let nameD5, statIdD5, valueD5;
        if (d5Main) {
            statIdD5 = d5Main?.PropertyId
            nameD5 = `${statusName?.EN?.[statIdD5]?.long || propertys?.[statIdD5]?.Name || ''}`
            valueD5 = (d5?.MainPropertyList[0]?.PropertyValue || 0) + ((d5?.MainPropertyList[0]?.PropertyValue || 0) * (d5?.Level || 0) * (rarityScale?.[diskInfo?.Items?.[d5.Id]?.Rarity] || 0))
            if (statusName?.EN?.[statIdD5]?.type?.includes('percent') || propertys?.[statIdD5]?.Format?.includes('%')) valueD5 = String(Math.floor(valueD5/100)) + '%'
            else valueD5 = valueD5.toFixed(2)
        }
        let charDFive = newNormalLine(`None`)
        if (nameD5) charDFive = newNormalLine(`${nameD5} (+${valueD5})`)
        charDFiveCT.appendChild(charDFiveIdx)
        charDFiveCT.appendChild(charDFive)
        infoCT.appendChild(charDFiveCT)
        const charSkillsCT = newNormalLine('')
        const charSkillsIdx = newNormalLine('Skills:',  true)
        const charSkills = newNormalLine(calculeSkills(data.agentInfo.skills))
        charSkillsCT.appendChild(charSkillsIdx)
        charSkillsCT.appendChild(charSkills)
        infoCT.appendChild(charSkillsCT)
        const charSlotCT = newNormalLine('')
        const charSlotIdx = newNormalLine('Slot:',  true)
        const charSlot = newNormalLine(`${idx}:6${data.agentInfo.fav ? ' [Favorite]' : ''}`)
        charSlotCT.appendChild(charSlotIdx)
        charSlotCT.appendChild(charSlot)
        infoCT.appendChild(charSlotCT)
        const charOwnerCT = newNormalLine('')
        const charOwnerIdx = newNormalLine('Owner:',  true)
        const ipFormatedUid = `${String(uid).slice(0, 3)}.${String(uid).slice(3, 6)}.${String(uid).slice(6, 9)}/${String(uid).slice(9)}`
        const charOwner = newNormalLine(ipFormatedUid)
        charOwnerCT.appendChild(charOwnerIdx)
        charOwnerCT.appendChild(charOwner)
        infoCT.appendChild(charOwnerCT)
        const colorsBoxs = newNormalLine('')
        colorsBoxs.className = 'colorsGrid'
        infoCT.appendChild(colorsBoxs)
        const colorValues = Object.values((avatarInfo[data.agentInfo?.id]?.Colors) || {})
        const uniqueColors = [...new Set(colorValues)]
        const colors = uniqueColors.length >= 2
        ? uniqueColors.slice(0, 2)
        : [uniqueColors[0], uniqueColors[0]]
        const colorsRes = colors.length > 0 ? await fetchColors(colors) || [] : []
        colorsRes.forEach(colorsArray => colorsArray.forEach(newColor => {
            const colorBox = newNormalLine('')
            colorBox.className = 'colorBox'
            colorBox.style.backgroundColor = newColor
            colorsBoxs.appendChild(colorBox)
        }))
        const avatarUrl = data.agentInfo.skin ? avatarInfo[data.agentInfo.id]?.Skins?.[data.agentInfo.skin]?.Image : avatarInfo[data.agentInfo.id]?.Image
        const asciiRes = await getSVGASCII(`https://enka.network${avatarUrl}`, true)
        const avatarImgCT = asciiRes
        avatarImgCT.setAttribute('class', 'fetchAvatar')
        avatarImgCT.setAttribute('preserveAspectRatio', 'xMidYMin meet');
        fetchBox.prepend(avatarImgCT)
        mainCT.appendChild(fetchBox)
        fetchBox.style.maxHeight = infoCT.getBoundingClientRect().height + 'px'
        fetchBox.style.minHeight = infoCT.getBoundingClientRect().height + 'px'
        fetchBox.scrollIntoView({ behavior: 'smooth', block: 'end' })
        return 'sucess'
    } catch (e) {
        newNormalLine('agentError x_x', false, true)
        console.log('agentError x_x', (e))
        return 'err'
    }
}
function secToDays(secs) {
    const hours = secs/3600
    const days = Math.floor(hours/24)
    const leftHours = Math.floor(hours - days*24)
    return `${days} days, ${leftHours} hours`
}
async function fetchColors(colors) {
    const returnArray = []
    for (const color of colors) {
        const newColors = await (await fetch(`https://www.thecolorapi.com/scheme?hex=${color.split('#')[1]}&mode=monochrome&count=6`)).json()
        const newColorsHsl = newColors.colors.map(colorObj => colorObj.hsl.value)
        returnArray.push(newColorsHsl)
    }
    return returnArray
}
function calculeSkills(skills){
    const percents = []
    Object.keys(skills).forEach(key => {
        if (key === 'Core Skill') percents.push(Number(skills[key])/7)
        else percents.push(Number(skills[key])/12)
    })
    const total = ((percents.reduce((acc, value) => acc + value, 0)/6) * 100).toFixed(2) + '%'
    return `[${skills['Basic Attack'] ?? 0},
     ${skills['Special Attack'] ?? 0},
     ${skills['Dash'] ?? 0},
     ${skills['Ultimate'] ?? 0},
     ${skills['Assist'] ?? 0},
     ${skills['Core Skill'] ?? 0}] (${total})`
}
function getDiskAbr(diskId) {
    try {
        const suitsInfo = diskInfo.Suits[diskId]
        const diskName = suitsInfo.Icon.split('Suit')[1].replace('.png', '')
        let abr = diskName.split('').filter(letter => !diskName.toLowerCase().includes(letter))
        if (abr.length < 2) abr = diskName.split('').slice(0, 2)
        return abr.join('')
    } catch {
        return `???`
    }
}
function getRuptureStat(agentTotalData) {
    const hp = agentTotalData[1110] || 0
    const atk = agentTotalData[1210] || 0
    return (atk*0.3 + hp*0.1)
}