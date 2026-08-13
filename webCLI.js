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
        const newCommandLineName = newNormalLine(`${command.name}:`, true)
        const newCommandLineDesc = newNormalLine(command.desc)
        newCommandLineCT.appendChild(newCommandLineName)
        newCommandLineCT.appendChild(newCommandLineDesc)
        mainCT.appendChild(newCommandLineCT)
        newCommandLineCT.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
}