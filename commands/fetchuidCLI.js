import { newDecLine, newNormalLine, newLoading } from '../midFunctions.js'
const terminalCT = document.querySelector(".terminalCT")
export function uidCLI(worker, state) {
    newUIDInputFunc(state)
    terminalCT.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const inputValue = state.terminalInput.value
            if (inputValue.length === 0) return
            if (inputValue.length < 10) {
                const normalLine = newNormalLine('Invalid UID')
                terminalCT.appendChild(normalLine)
                newUIDInputFunc(state)
            } else {
                state.terminalInput.disabled = true
                const normalLine = newNormalLine('Fetching UserData: ...')
                terminalCT.appendChild(normalLine)
                const stopLoading = newLoading(normalLine)
                worker.postMessage({type: 'fetch', data: inputValue})
                worker.onmessage = function(e) {
                    if (e.data.type === 'fetchResult' && !e.data.response.success) {
                        stopLoading().then(() => {
                            normalLine.textContent = `Fetching UserData: ${e.data.response.error}`
                            newUIDInputFunc(state)
                            state.terminalInput.disabled = false
                            state.terminalInput.focus()
                        })
                    } else if (e.data.type === 'fetchResult' && e.data.response.success) {
                        stopLoading().then(() => {
                            document.querySelector('.logInMessage').textContent = e.data.response.nick
                            state.terminalInput.disabled = true
                            normalLine.textContent = `Fetching UserData: done!`
                            const sessionNormalLine = newNormalLine('Initializing Session: ...')
                            const parseNormalLine = newNormalLine('Parsing UserData: ...')
                            const profileNormalLine = newNormalLine('Loading Profile: ...')
                            const agentsNormalLine = newNormalLine('Loading Agents: ...')
                            const mountingNormalLine = newNormalLine('Mounting Partitions: ...')
                            const externalNormalLine = newNormalLine('Fetching External Functions: ...')
                            const loginNormalLine = newNormalLine('Logging In: ...')
                            const displayNormalLine = newNormalLine('Starting Screens: ...')
                            const welcomeNormalLine = newNormalLine('Welcoming User: ...')
                            const finalNormalLine = newNormalLine('Finishing Details: ...')
                            let smoothAppendIdx = 0
                            const smoothAppend = setInterval(() => {
                                if (smoothAppendIdx === 0) {
                                    terminalCT.appendChild(sessionNormalLine)
                                    const stopSessionLoading = newLoading(sessionNormalLine)
                                    stopSessionLoading().then(() => sessionNormalLine.textContent = 'Initializing Session: done!')
                                }
                                if (smoothAppendIdx === 1) {
                                    terminalCT.appendChild(profileNormalLine)
                                    const stopProfileLoading = newLoading(profileNormalLine)
                                    stopProfileLoading().then(() => profileNormalLine.textContent = 'Loading Profile: done!')
                                }
                                if (smoothAppendIdx === 2) {
                                    terminalCT.appendChild(agentsNormalLine)
                                    const stopAgentsLoading = newLoading(agentsNormalLine)
                                    stopAgentsLoading().then(() => agentsNormalLine.textContent = 'Loading Agents: done!')
                                }
                                if (smoothAppendIdx === 3) {
                                    terminalCT.appendChild(parseNormalLine)
                                    const stopParseLoading = newLoading(parseNormalLine)
                                    stopParseLoading().then(() => parseNormalLine.textContent = 'Parsing UserData: done!')
                                } else if (smoothAppendIdx === 4) {
                                    terminalCT.appendChild(mountingNormalLine)
                                    const stopMountingLoading = newLoading(mountingNormalLine)
                                    stopMountingLoading().then(() => mountingNormalLine.textContent = 'Mounting Partitions: done!')
                                } else if (smoothAppendIdx === 5) {
                                    terminalCT.appendChild(externalNormalLine)
                                    const stopExternalLoading = newLoading(externalNormalLine)
                                    stopExternalLoading().then(() => externalNormalLine.textContent = 'Fetching External Functions: done!')
                                } else if (smoothAppendIdx === 6) {
                                    terminalCT.appendChild(displayNormalLine)
                                    worker.postMessage({type: 'displayStart', data: ''})
                                    const stopDisplayLoading = newLoading(displayNormalLine)
                                    document.querySelector(".terminalBottomScreen").addEventListener("animationend", () => {
                                    stopDisplayLoading().then(() => {
                                        displayNormalLine.textContent = 'Starting Screens: done!'
                                        const topScreenBars = document.querySelector(".terminalTopScreen").querySelectorAll('.decBar')
                                        const welcomeMessage = document.querySelector(".welcomeMessage")
                                        let k = 0
                                        const smoothRecoil = setInterval(() => {
                                            topScreenBars[k].style.marginLeft = '0'
                                            topScreenBars[k].style.animation = ''
                                            topScreenBars[k].style.animation = 'barsReveal 0.4s ease-out forwards'
                                            if (k === 3) welcomeMessage.style.display = 'flex'
                                            if (k === topScreenBars.length - 1) {
                                                clearInterval(smoothRecoil)
                                            } else k++
                                        }, 150)
                                    })
                                    document.querySelector(".welcomeMessage").addEventListener('animationend', warnWelcome)
                                    function warnWelcome(e) {
                                        if (e.animationName !== 'focus') return
                                        worker.postMessage({type: 'welcomeStart', data: ''})
                                        document.querySelector(".welcomeMessage").removeEventListener('animationend', warnWelcome)
                                    }
                                    })
                                } else if (smoothAppendIdx === 7) {
                                    terminalCT.appendChild(welcomeNormalLine)
                                    const stopWelcomeLoading = newLoading(welcomeNormalLine)
                                    document.querySelector('.welcomeMessage').addEventListener('animationend', welcomeSequence)
                                    function welcomeSequence(e) {
                                        if (e.animationName !== 'focus') return
                                        stopWelcomeLoading().then(() => welcomeNormalLine.textContent = 'Welcoming User: done!')
                                        document.querySelector('.welcomeMessage').removeEventListener('animationend', welcomeSequence)
                                    }
                                } else if (smoothAppendIdx === 8) {
                                    terminalCT.appendChild(loginNormalLine)
                                    const stopLoginLoading = newLoading(loginNormalLine)
                                    document.querySelector('.welcomeMessage').addEventListener('animationend', loginSequence)
                                    function loginSequence(e) {
                                        if (e.animationName !== 'focus') return
                                        const bottomScreenBars = document.querySelector(".terminalBottomScreen").querySelectorAll('.decBar')
                                        const logInMessage = document.querySelector(".logInMessage")
                                        let k = 0
                                        const smoothRecoil = setInterval(() => {
                                            bottomScreenBars[k].style.marginLeft = '0'
                                            bottomScreenBars[k].style.animation = ''
                                            bottomScreenBars[k].style.animation = 'barsReveal 0.4s ease-out forwards'
                                            if (k === 3) logInMessage.style.display = 'flex'
                                            if (k === bottomScreenBars.length - 1) {
                                                worker.postMessage({type: 'logInStart', data: ''})
                                                clearInterval(smoothRecoil)
                                            } else k++
                                        }, 150)
                                        document.querySelector('.welcomeMessage').removeEventListener('animationend', loginSequence)
                                    }
                                    document.querySelector('.logInMessage').addEventListener('animationend', logInEnd)
                                    function logInEnd(e) {
                                        if (e.animationName !== 'reverseFocus') return
                                        stopLoginLoading().then(() => {
                                            loginNormalLine.textContent = 'Logging In: done!'
                                        })
                                        document.querySelector('.logInMessage').removeEventListener('animationend', logInEnd)
                                    }
                                } else if (smoothAppendIdx === 9) {
                                    terminalCT.appendChild(finalNormalLine)
                                    const stopFinalLoading = newLoading(finalNormalLine)
                                    document.querySelector('.userInfoCT').addEventListener('animationend', detailsSequence)
                                    function detailsSequence(e) {
                                        if (e.animationName !== 'liteFocus') return
                                        stopFinalLoading().then(() => finalNormalLine.textContent = 'Finishing Details: done!')
                                        document.querySelector('.userInfoCT').removeEventListener('animationend', detailsSequence)
                                    }
                                    clearInterval(smoothAppend)
                                }
                                smoothAppendIdx++
                            }, 600)
                        })
                    }
                }
            }
        }
    })
}
function newUIDInputFunc(state) {
    const UIDinputPlaceHolder = document.createElement('span')
    UIDinputPlaceHolder.className = 'terminalInputPlaceHolder'
    UIDinputPlaceHolder.textContent = 'Please Input your UID:'
    const UIDinputLine = newDecLine(state).querySelector('.terminalInputCT')
    const newUIDinput = UIDinputLine.querySelector('.terminalInput')
    if (!UIDinputLine.querySelector('.terminalInputPlaceHolder')) UIDinputLine.insertBefore(UIDinputPlaceHolder, newUIDinput)
    newUIDinput.type = 'text'
    newUIDinput.className = 'terminalInput'
    newUIDinput.id = 'terminalInput'
    newUIDinput.maxLength = 10
    newUIDinput.inputMode = 'numeric'
    newUIDinput.pattern = '[0-9]*'
    newUIDinput.oninput= function () {
        this.value = this.value.replace(/[^0-9]/g, '')
    }
    state.terminalInput = newUIDinput
    newUIDinput.focus()
}