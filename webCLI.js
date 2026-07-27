const worker = new Worker('workerCLI.js')
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
const terminalCT = document.querySelector(".terminalCT")
let UIDinput = document.getElementById("terminalInput")
UIDinput.value = ''
let decLine = document.getElementById("decTerminalLineCT")
terminalCT.addEventListener('mouseenter', () => UIDinput.focus());
terminalCT.addEventListener('click', () => UIDinput.focus());
terminalCT.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const inputValue = UIDinput.value
        if (inputValue.length === 0) return
        if (inputValue.length < 10) {
            const normalLine = newNormalLine('Invalid UID')
            terminalCT.appendChild(normalLine)
            newDecLine()
        } else {
            UIDinput.disabled = true
            const normalLine = newNormalLine('Fetching UserData: ...')
            terminalCT.appendChild(normalLine)
            const stopLoading = newLoading(normalLine)
            worker.postMessage({type: 'fetch', data: inputValue})
            worker.onmessage = function(e) {
                if (e.data.type === 'fetchResult' && !e.data.response.success)
                stopLoading().then(() => normalLine.textContent = `Fetching UserData: ${e.data.response.error}`)
            }
        }
    }
})
function newDecLine() {
    const newDecLine = decLine.cloneNode(true)
    const newUIDInput = newDecLine.querySelector(".terminalInput")
    UIDinput.disabled = true
    UIDinput = newUIDInput
    decLine = newDecLine
    terminalCT.appendChild(decLine)
    UIDinput.value = ''
    UIDinput.focus()
}
function newNormalLine(content) {
    const normalLine = document.createElement("div")
    normalLine.className = "normalTerminalLineCT"
    normalLine.textContent = String(content)
    return normalLine
}
function newLoading(element) { 
    const originalContent = element.textContent.slice(0, -4)
    const frames = [' Z..', ' .Z.', ' ..Z', ' ...',]
    let i = 0
    let stop = false
    let resolveStop
    const stopPromise = new Promise((resolve) => {
        resolveStop = resolve
    })
    const loading = setInterval(() => {
        element.textContent = originalContent + ' ' + frames[i % frames.length]
        i++
        if (stop && i % frames.length === 0) {
            clearInterval(loading)
            resolveStop()
        }
    }, 250);
    return function stopLoading() {
        stop = true
        return stopPromise
    }
}