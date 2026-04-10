import context from "./ctx.js";

function delay(t, val) {
    return new Promise(resolve => setTimeout(resolve, t, val));
}

const getEmptyMenu = function () {
    let menu = document.getElementById('menu');
    menu.innerHTML = ""
    return menu;
}

const createImageElement = function (src, cls) {
    let img = document.createElement('img')
    img.src = src
    img.classList.add(cls)
    return img
}

const playSfx = function (name) {
    document.getElementById(name).play()
}

const stopSfx = function (name) {
    document.getElementById(name).pause()
    document.getElementById(name).currentTime = 0
}

const getAirlockStatus = function (flag) {
    return flag ? "LOCKED" : "UNLOCKED"
}

const getOnOffStatus = function (flag) {
    return flag ? "ON" : "OFF"
}

const showError = function (text) {
    playSfx('errorsfx')

    document.getElementById('error').innerHTML = text
    document.getElementById('error').style.visibility = "visible"
    
    setTimeout(() => {
        document.getElementById('error').style.visibility = "hidden"
    }, 4000)
}

const clearError = function() {
    document.getElementById('error').style.visibility = "hidden"
}

const getConfirmationStr = function (flag) {
    return flag ? "x" : " "
}

const isSelfDestructActivated = function() {
    return context.self_destruct_confirm.every((x) => x === true)
}

const isLifeSupportOff = function() {
    return context.life_support === false
}

const requestFullscreen = function() {
    const theApp = document.getElementById("theApp")
    if (theApp && theApp.requestFullscreen) {
        theApp.requestFullscreen()
    }
}

export {
    delay,
    getEmptyMenu,
    createImageElement,
    playSfx,
    stopSfx,
    getAirlockStatus,
    getOnOffStatus,
    showError,
    clearError,
    getConfirmationStr,
    isSelfDestructActivated,
    isLifeSupportOff,
    requestFullscreen
}
