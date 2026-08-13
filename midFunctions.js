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
    state.decLine.scrollIntoView({ behavior: 'smooth', block: 'end' })
    return state.decLine
}
export function newNormalLine(content, isColored = false, autoAppend = false) {
    const normalLine = document.createElement("div")
    normalLine.className = isColored ? "coloredTerminalLineCT" : "normalTerminalLineCT"
    normalLine.textContent = String(content)
    if (autoAppend) {
        document.querySelector('.terminalCT').appendChild(normalLine)
        normalLine.scrollIntoView({ behavior: 'smooth', block: 'end' })
        return
    }
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
export async function getSVGASCII(imageUrl) {
    let newUrl = imageUrl
    newUrl = newUrl
     .replace('https://', '')
     .replace('http://', '')
    const res = await fetch('https://yourascii.vercel.app/api/convert', {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            url: `https://${newUrl}`,
            resolution: 120,
            colorMode: 'mono',
            format: 'svg',
        })
    })
    if (!res.ok) {
        throw new Error(`Failed to fetch SVG ASCII: ${res.status} ${res.statusText}`)
    }
    let svgText = await res.text()
    svgText = svgText
     .replace(/<svg /, '<svg class="iconsASCII" ')
     .replace('fill="#000"', 'fill="transparent"')
     .replaceAll('fill="#fff"', 'fill="currentColor"')
    const parser = new DOMParser()
    const svg = parser.parseFromString(svgText, "image/svg+xml").documentElement
    return (svg)
}
export async function getScreensReady(worker) {
    function onZoom() {
        const bars = document.querySelectorAll('.decBar')
        if (bars) {
            bars.forEach((bar, index) => {
                const barsFromScreen = index <= 9 ? document.querySelector('.terminalTopScreen') : document.querySelector('.terminalBottomScreen')
                bar.style.height = `${Number(barsFromScreen.clientHeight) - 9*3 - 9*3/15}px`
            })
        }
    }
    const decScreens = document.querySelectorAll('.decBarCT')
    for (const decScreen of decScreens) {
        let screen
        if (decScreen === decScreens[0]) screen = document.querySelector('.terminalTopScreen')
        if (decScreen === decScreens[1]) screen = document.querySelector('.terminalBottomScreen')
        const screenHeight = Number(decScreen.clientHeight) - 9*3
        window.visualViewport.addEventListener("resize", onZoom)
        await new Promise((resolve) => {
            let i = 0
            const smoothAppear = setInterval(() => {
                const bar = document.createElement('div')
                bar.className = "decBar"
                decScreen.appendChild(bar)
                bar.style.height = `${screenHeight/10}px`
                if (i === 9) {
                    clearInterval(smoothAppear)
                    screen.style.animation = 'opAppear 3s linear forwards'
                    setTimeout(() => {
                        resolve()
                    }, 1000);
                }
                else i++
            }, 80);
        })
    }
}
export function getFilesTree(filesData) {
    const welcomeMessage = document.querySelector('.welcomeMessage')
    welcomeMessage.style.opacity = 1
    welcomeMessage.style.filter = 'blur(0px)'
    welcomeMessage.style.animation = ''
    welcomeMessage.style.animation = 'reverseFocus 1s linear forwards 2s, reverseAppearAll 1s linear forwards 1s'
    const secFolder = document.querySelector('.secLevelFolderCT')
    document.querySelector('.mainFolderCT').style.animation = 'appearAll 2s linear forwards 1s, focus 1s linear forwards 2s'
    secFolder.style.animation = 'appearAll 2s linear forwards 1s, focus 1s linear forwards 2s'
    secFolder.addEventListener('animationend', removeanimation)
}
function removeanimation() {
    const secFolder = document.querySelector('.secLevelFolderCT')
    secFolder.style.opacity = 1
    secFolder.style.filter = 'blur(0px)'
    secFolder.style.animation = ''
    secFolder.removeEventListener('animationend', removeanimation)
}
export async function getLogInScreen(userInfo) {
    const terminalTheme = 'Default'
    const userIcon = await getSVGASCII(userInfo.iconURL)
    document.querySelector('.userInfoHeader').prepend(userIcon)
    document.querySelector('.userInfoNickname').textContent = userInfo.nick
    document.querySelector('.userInfoLevel').textContent = 'Lv.' + userInfo.level
    document.getElementById('userInfoTextValueUID').textContent = userInfo.uid
    document.getElementById('userInfoTextValueUPTD').textContent = updateChecker()
    document.getElementById('userInfoTextValueSERVER').textContent = userInfo.server
    document.getElementById('userInfoTextValueTHEME').textContent = terminalTheme
    document.getElementById('userInfoTextValueICONID').textContent = userInfo.iconId
    document.getElementById('userInfoTextValueBANNERID').textContent = userInfo.bannerId
    const logInMessage = document.querySelector('.logInMessage')
    logInMessage.style.opacity = 1
    logInMessage.style.filter = 'blur(0px)'
    logInMessage.style.animation = ''
    logInMessage.style.animation = 'reverseFocus 1s linear forwards 2s, reverseAppearAll 1s linear forwards 1s'
    document.querySelector('.userInfoCT').display = 'flex'
    const decBars = document.querySelectorAll('.decBarCT')
    decBars.forEach(decBar => {
        decBar.style.display = 'none'
    })
}
function updateChecker() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0') 
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const fullString = hour + ':' + minutes + ' ' +  month + '/' + day
    return fullString
}