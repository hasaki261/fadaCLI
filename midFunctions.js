const terminalCT = document.querySelector(".terminalCT")
export function newDecLine(state) {
    const newDecLine = state.decLine.cloneNode(true)
    const newTerminalInput = newDecLine.querySelector(".terminalInput")
    state.terminalInput.disabled = true
    state.terminalInput = newTerminalInput
    state.decLine = newDecLine
    terminalCT.appendChild(state.decLine)
    state.terminalInput.value = ''
    state.terminalInput.focus()
    return state.decLine
}
export function newNormalLine(content) {
    const normalLine = document.createElement("div")
    normalLine.className = "normalTerminalLineCT"
    normalLine.textContent = String(content)
    return normalLine
}
export function newLoading(element) { 
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