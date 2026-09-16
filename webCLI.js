const worker = new Worker(new URL("./workerCLI.js", import.meta.url),
  {
    type: "module",
  }
)
import { uidCLI } from './commands/fetchuidCLI'
import { newDecLine, newNormalLine, getScreensReady, getFilesTree, getLogInScreen } from './midFunctions';
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
worker.onmessage = function(e) {
    if (e.data.type === 'fetchData' && e.data.response.success) {
        userData = e.data.result
        console.log(userData)
    }
}
const terminalCT = document.querySelector(".terminalCT")
state.terminalInput.value = ''
terminalCT.addEventListener('mouseenter', () => state.terminalInput.focus());
terminalCT.addEventListener('click', () => state.terminalInput.focus());
terminalCT.replaceChildren()
state.isRunningCommand = true
uidCLI(worker, state)
// newDecLine(state)
worker.addEventListener("message", async (e) => {
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
async function showCards() {

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
            document.body.classList.remove(...allThemeClasses)
            document.querySelector('.terminalCT').classList.remove('pixeledTerminalCT')
            document.querySelector('.terminalTopScreen').classList.remove('pixeledTerminalTopScreen')
            document.querySelector('.terminalBottomScreen').classList.remove('pixeledTerminalBottomScreen')
            document.querySelector('.userInfoThumb').src = './baboo-ascii.webm'
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