const worker = new Worker(new URL("./workerCLI.js", import.meta.url),
  {
    type: "module",
  }
)
import { uidCLI } from './commands/fetchuidCLI'
import { newDecLine, newNormalLine } from './midFunctions';
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
const state = { 
     isRunningCommand: false,
     decLine: document.getElementById("decTerminalLineCT"),
     terminalInput: document.getElementById("terminalInput") 
    }
const terminalCT = document.querySelector(".terminalCT")
state.terminalInput.value = ''
terminalCT.addEventListener('mouseenter', () => state.terminalInput.focus());
terminalCT.addEventListener('click', () => state.terminalInput.focus());
terminalCT.replaceChildren()
state.isRunningCommand = true
uidCLI(worker, state)
terminalCT.addEventListener('keydown', (event) => {
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
        if (inputValue === 'uidfetch') {
            state.isRunningCommand = true
        }
        terminalCT.appendChild(newNormalLine(`fadash: command not found: ${inputValue}`))
        return newDecLine(state)
    }
})