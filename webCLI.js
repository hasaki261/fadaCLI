const worker = new Worker(new URL("./workerCLI.js", import.meta.url),
  {
    type: "module",
  }
)
import { uidCLI } from './commands/fetchuidCLI'
import { zzzFetch } from './commands/zenfetch'
import { newDecLine, newNormalLine, getScreensReady, getFilesTree, getLogInScreen, newLoading } from './midFunctions';
function toggleDarkMode() {
    const lightmodecheckbox = document.getElementById("darkmode");
    const body = document.body;
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("light");
        lightmodecheckbox.checked = true;
    }
    lightmodecheckbox.addEventListener("change", function () {
        if (this.checked) {
            body.classList.add("light");
            localStorage.setItem("darkMode", "enabled");
        } else {
            body.classList.remove("light");
            localStorage.setItem("darkMode", "disabled");
        }
    });
}
toggleDarkMode()
let userData
const mainFolder = document.querySelector('.mainFolderCT')
mainFolder.addEventListener('click', () => {
    mainFolder.querySelector('.expanderArrow').classList.toggle('expanderArrowRecoil')
    if (mainFolder.querySelector('.expanderArrow').classList.contains('expanderArrowRecoil')) {
        document.querySelector('.secLevelFolderCT').style.display = 'none'
    } else document.querySelector('.secLevelFolderCT').style.display = 'flex'
})
const state = { 
     isRunningCommand: false,
     decLine: document.getElementById("decTerminalLineCT"),
     terminalInput: document.getElementById("terminalInput"),
    //  nick: 'hasaski'
    }
const terminalCT = document.querySelector(".terminalCT")
state.terminalInput.value = ''
terminalCT.addEventListener('mouseenter', () => state.terminalInput.focus());
terminalCT.addEventListener('click', () => state.terminalInput.focus());
terminalCT.replaceChildren()
state.isRunningCommand = true
uidCLI(worker, state)
// newDecLine(state)
// zzzFetch(
// {
//     "agentInfo": {
//       "id": 1091,
//       "name": "Miyabi",
//       "level": 60,
//       "class": "Anomaly",
//       "stats": [
//         12101,
//         20101,
//         21101
//       ],
//       "element": "Ice",
//       "subelement": "FireFrost",
//       "skills": {
//         "Basic Attack": 12,
//         "Special Attack": 12,
//         "Dash": 12,
//         "Ultimate": 12,
//         "Core Skill": 7,
//         "Assist": 10
//       },
//       "weapon": {
//         "id": 14109,
//         "name": "Hailstorm Shrine",
//         "level": 60,
//         "sig": true
//       },
//       "disks": [
//         {
//           "Id": 31141,
//           "Level": 15,
//           "MainPropertyList": [
//             {
//               "PropertyId": 11103,
//               "PropertyLevel": 1,
//               "PropertyValue": 550
//             }
//           ],
//           "RandomPropertyList": [
//             {
//               "PropertyId": 13102,
//               "PropertyLevel": 1,
//               "PropertyValue": 480
//             },
//             {
//               "PropertyId": 20103,
//               "PropertyLevel": 2,
//               "PropertyValue": 240
//             },
//             {
//               "PropertyId": 21103,
//               "PropertyLevel": 1,
//               "PropertyValue": 480
//             },
//             {
//               "PropertyId": 12102,
//               "PropertyLevel": 4,
//               "PropertyValue": 300
//             }
//           ]
//         },
//         {
//           "Id": 31142,
//           "Level": 15,
//           "MainPropertyList": [
//             {
//               "PropertyId": 12103,
//               "PropertyLevel": 1,
//               "PropertyValue": 79
//             }
//           ],
//           "RandomPropertyList": [
//             {
//               "PropertyId": 20103,
//               "PropertyLevel": 3,
//               "PropertyValue": 240
//             },
//             {
//               "PropertyId": 21103,
//               "PropertyLevel": 2,
//               "PropertyValue": 480
//             },
//             {
//               "PropertyId": 31203,
//               "PropertyLevel": 3,
//               "PropertyValue": 9
//             },
//             {
//               "PropertyId": 12102,
//               "PropertyLevel": 1,
//               "PropertyValue": 300
//             }
//           ]
//         },
//         {
//           "Id": 32743,
//           "Level": 15,
//           "MainPropertyList": [
//             {
//               "PropertyId": 13103,
//               "PropertyLevel": 1,
//               "PropertyValue": 46
//             }
//           ],
//           "RandomPropertyList": [
//             {
//               "PropertyId": 20103,
//               "PropertyLevel": 3,
//               "PropertyValue": 240
//             },
//             {
//               "PropertyId": 31203,
//               "PropertyLevel": 2,
//               "PropertyValue": 9
//             },
//             {
//               "PropertyId": 13102,
//               "PropertyLevel": 1,
//               "PropertyValue": 480
//             },
//             {
//               "PropertyId": 21103,
//               "PropertyLevel": 2,
//               "PropertyValue": 480
//             }
//           ]
//         },
//         {
//           "Id": 32744,
//           "Level": 15,
//           "MainPropertyList": [
//             {
//               "PropertyId": 21103,
//               "PropertyLevel": 1,
//               "PropertyValue": 1200
//             }
//           ],
//           "RandomPropertyList": [
//             {
//               "PropertyId": 12102,
//               "PropertyLevel": 1,
//               "PropertyValue": 300
//             },
//             {
//               "PropertyId": 13103,
//               "PropertyLevel": 1,
//               "PropertyValue": 15
//             },
//             {
//               "PropertyId": 31203,
//               "PropertyLevel": 4,
//               "PropertyValue": 9
//             },
//             {
//               "PropertyId": 20103,
//               "PropertyLevel": 2,
//               "PropertyValue": 240
//             }
//           ]
//         },
//         {
//           "Id": 32745,
//           "Level": 15,
//           "MainPropertyList": [
//             {
//               "PropertyId": 12102,
//               "PropertyLevel": 1,
//               "PropertyValue": 750
//             }
//           ],
//           "RandomPropertyList": [
//             {
//               "PropertyId": 11103,
//               "PropertyLevel": 1,
//               "PropertyValue": 112
//             },
//             {
//               "PropertyId": 20103,
//               "PropertyLevel": 4,
//               "PropertyValue": 240
//             },
//             {
//               "PropertyId": 13102,
//               "PropertyLevel": 1,
//               "PropertyValue": 480
//             },
//             {
//               "PropertyId": 21103,
//               "PropertyLevel": 2,
//               "PropertyValue": 480
//             }
//           ]
//         },
//         {
//           "Id": 32746,
//           "Level": 15,
//           "MainPropertyList": [
//             {
//               "PropertyId": 31402,
//               "PropertyLevel": 1,
//               "PropertyValue": 750
//             }
//           ],
//           "RandomPropertyList": [
//             {
//               "PropertyId": 21103,
//               "PropertyLevel": 3,
//               "PropertyValue": 480
//             },
//             {
//               "PropertyId": 20103,
//               "PropertyLevel": 3,
//               "PropertyValue": 240
//             },
//             {
//               "PropertyId": 12103,
//               "PropertyLevel": 2,
//               "PropertyValue": 19
//             },
//             {
//               "PropertyId": 11102,
//               "PropertyLevel": 1,
//               "PropertyValue": 300
//             }
//           ]
//         }
//       ],
//       "pieces": {
//         "twoPieces": [
//           31100,
//           32700
//         ],
//         "quadPieces": 32700
//       },
//       "fav": true,
//       "skin": 0,
//       "since": 1736269571
//     },
//     "baseData": {
//       "11101": 7673.7042,
//       "12101": 1624.1952,
//       "12201": 86,
//       "13101": 606.5977,
//       "20101": 500,
//       "21101": 5000,
//       "30501": 120,
//       "31201": 238,
//       "31401": 116
//     },
//     "relativeData": {
//       "11102": 300,
//       "11103": 2312,
//       "12102": 4800,
//       "12103": 354,
//       "13102": 1440,
//       "13103": 199,
//       "20103": 6480,
//       "21103": 11200,
//       "23103": 800,
//       "31203": 81,
//       "31402": 3000
//     },
//     "totalData": {
//       "1110": 10215.915326,
//       "1210": 2757.808896,
//       "1310": 892.9477688,
//       "2010": 69.8,
//       "2110": 162,
//       "2310": 8,
//       "3120": 319,
//       "3140": 150.8
//     }
//   }, 'hasaki', 1, 1005418754
// )
let nick, uid
worker.addEventListener("message", async (e) => {
    if (e.data.type === 'fetchResult' && e.data.response.success) {
        nick = e.data.response.nick
        uid = e.data.response.uid
        console.log(uid, nick)
    }
    if (e.data.type === 'fetchData' && e.data.response.success) {
        userData = e.data.response.data
    }
    if (e.data.type === 'mainScreens') {
        await getScreensReady()
    }
    if (e.data.type === 'mainWelcome') {
        const agentsFoldersDOM = []
        e.data.response.forEach(agent => {
            const agentDiv = document.getElementById('mainAgentFolder').cloneNode(true)
            agentDiv.style.display = 'flex'
            agentDiv.querySelector('.mainFolderName').textContent = agent.name
            agentsFoldersDOM.push(agentDiv)
        })
        for (let r = agentsFoldersDOM.length - 1; r > -1; r--) {
            document.querySelector('.secLevelFolder').prepend(agentsFoldersDOM[r])
        }
        getFilesTree()
    }
    if (e.data.type === 'mainLogIn') {
        await getLogInScreen(e.data.response)
        document.querySelector('.userInfoCT').style.display = 'flex'
        const usernameElement = state.decLine.querySelector('.terminalUsername')
        usernameElement.textContent = e.data.response.nick
    }
})
terminalCT.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        if (state.isRunningCommand) return
        const inputValue = state.terminalInput.value
        if (inputValue.length === 0) return newDecLine(state)
        if (inputValue === 'clear') {
            state.isRunningCommand = true
            terminalCT.replaceChildren()
            newDecLine(state)
            return state.isRunningCommand = false
        }
        if (inputValue === 'commands') {
            state.isRunningCommand = true
            await showCommands()
            newDecLine(state)
            return state.isRunningCommand = false
        }
        if (inputValue === 'whoami') {
            state.isRunningCommand = true
            newNormalLine(state.nick, false, true)
            newDecLine(state)
            return state.isRunningCommand = false
        }
        if (inputValue === 'zenfetch' || inputValue === 'zenfetch --help' || inputValue === 'zenfetch help') {
            state.isRunningCommand = true
            newNormalLine('Available agents:', true, true)
            userData.forEach(agent => {
                newNormalLine(agent.agentInfo.name, true, true)
            })
            newNormalLine('try zenfetch <agent>', true, true)
            newDecLine(state)
            return state.isRunningCommand = false
        }
        if (inputValue.includes('zenfetch') && (inputValue.split(' ')[1] && inputValue.split(' ')[1] !== '')) {
            state.isRunningCommand = true
            const response = []
            userData.forEach((agent, idx) => {
                if (agent.agentInfo.name.toLowerCase() !== inputValue.split(' ').slice(1).join(' ').toLowerCase()) return
                response.push('fetching')
                state.terminalInput.disabled = true
                state.terminalInput.value = `${state.terminalInput.value} ...`
                zzzFetch(agent, nick, (idx + 1), uid).then(res => {
                    newDecLine(state)
                })
            })
            if (response.length === 0) {
                newNormalLine(`${inputValue} is not a valid agent, type zzzfetch to see available agents`, false, true)
                newDecLine(state)
            }
            return state.isRunningCommand = false
        }
        if (inputValue.trim().split(' ').filter(Boolean)[0] === 'themes') {
            state.isRunningCommand = true
            const theme = inputValue.trim().split(' ').filter(Boolean)[1] ? inputValue.trim().split(' ').filter(Boolean)[1] : undefined
            if (!theme) {
                const themes = await changeTheme(theme, true)
                themes.forEach(theme => {
                    const themeLine = newNormalLine('')
                    const themeName = newNormalLine(`${theme.name}:`, true)
                    const themeDesc = newNormalLine(theme.desc)
                    themeLine.appendChild(themeName)
                    themeLine.appendChild(themeDesc)
                    document.querySelector('.terminalCT').appendChild(themeLine)
                    themeLine.scrollIntoView({ behavior: 'smooth', block: 'end' })
                })
                newNormalLine('Use "themes <theme name>" to change your theme')
            } else await changeTheme(theme)
            newDecLine(state)
            return state.isRunningCommand = false
        }
        // if (inputValue === 'uidfetch') {
        //     state.isRunningCommand = true
        //     return uidCLI(worker, state)
        // }
        terminalCT.appendChild(newNormalLine(`fadash: command not found: ${inputValue}`))
        return newDecLine(state)
    }
})
async function showCommands() {
    const mainCT = document.querySelector('.terminalCT')
    const commands = await (await fetch(`./commands.json`)).json()
    commands.forEach(command => {
        const newCommandLineCT = newNormalLine('')
        const newCommandLineName = newNormalLine(`${command.name}:`, true, false, command.customColor || false)
        const newCommandLineDesc = newNormalLine(command.desc)
        newCommandLineCT.appendChild(newCommandLineName)
        newCommandLineCT.appendChild(newCommandLineDesc)
        mainCT.appendChild(newCommandLineCT)
        newCommandLineCT.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
}
async function changeTheme(theme, getThemes = false) {
    const themes = await (await fetch(`./themes/themes.json`)).json()
    if (getThemes) return themes
    let themeClass
    let isValidTheme = false
    themes.forEach(systemTheme => {
        const name = systemTheme.name
        if (name.toLowerCase() === theme.toLowerCase()) {
            isValidTheme = true
            themeClass = name
        }
    })
    if (!isValidTheme) {
        newNormalLine(`${theme} is not a valid theme, type themes to see available themes`, false, true)
        return
    } else {
        const allThemeClasses = themes.map(t => t.name.toLowerCase())
        document.body.classList.remove(...allThemeClasses)
        document.body.classList.add(themeClass.toLowerCase())
        if (themeClass.toLowerCase() === 'default') {
            document.body.classList.remove(...allThemeClasses)
            document.querySelector('.terminalCT').classList.remove('pixeledTerminalCT')
            document.querySelector('.terminalTopScreen').classList.remove('pixeledTerminalTopScreen')
            document.querySelector('.terminalBottomScreen').classList.remove('pixeledTerminalBottomScreen')
            document.querySelector('.userInfoThumb').src = './baboo-ascii.webm'
        }
        if (themeClass.toLowerCase() !== 'light') {
            document.getElementById("darkmode").disabled = true
            document.querySelector('.modest').style.cursor = 'not-allowed'
        }
        if (themeClass.toLowerCase() === 'yuzuha') {
            document.querySelector('.fb').classList.add('pixeledfb')
            document.querySelector('.terminalCT').classList.add('pixeledTerminalCT')
            document.querySelector('.terminalTopScreen').classList.add('pixeledTerminalTopScreen')
            document.querySelector('.terminalBottomScreen').classList.add('pixeledTerminalBottomScreen')
            document.querySelector('.userInfoThumb').src = './themes/yuzuha/yuzuha-ascii.webm'
        }
        document.getElementById('userInfoTextValueTHEME').textContent = themeClass
    }
}