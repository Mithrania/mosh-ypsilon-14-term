
import { navGuard, navGuardAdmin } from './navlock.js';
import context from './ctx.js';
import {
    delay,
    getEmptyMenu,
    createImageElement,
    playSfx,
    getConfirmationStr,
    getAirlockStatus,
    getOnOffStatus,
    showError,
    isSelfDestructActivated,
    isLifeSupportOff,
    requestFullscreen
} from './utils.js'
import { createTypeWriterMenu, createTypeWriterText } from './typewriter.js';
import { scheduleData, rosterData } from './data.js';

window.onload = function () {
    const elswitch = document.getElementById('switch');
    elswitch.checked = false

    elswitch.addEventListener('change', async function (ev) {
        if (elswitch.checked) {
            playSfx('switchsfx')
            // requestFullscreen()
            await delay(1000)
            await menuHome()
        }
    }, false);

    const eladmin = document.getElementById('admin')
    eladmin.addEventListener('click', function (ev) {
        toggleAdmin()
        console.log(`is admin: ${context.is_admin}`)
    })
}

window.addEventListener('keydown', function (ev) {
    if (ev.key == 'F6') {
        toggleAdmin()
        console.log(`is admin: ${context.is_admin}`)
    }
})

window.addEventListener('click', function (ev) {
    if (!this.document.fullscreenElement)
        requestFullscreen()
})

// HOME
const menuHome = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterMenu(menu, "- DIAGNOSTICS", menuDiagnostics)
        await createTypeWriterMenu(menu, "- SCHEDULE", menuSchedule)
        await createTypeWriterMenu(menu, "- CONTROLS", menuControls)
        await createTypeWriterMenu(menu, "- ROSTER", menuRoster)
        await createTypeWriterMenu(menu, "- COMMUNICATIONS", menuComms)
    })
}

// HOME -> DIAGNOSTICS
const menuDiagnostics = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterMenu(menu, "- MAP", menuMap)
        await createTypeWriterMenu(menu, "- STATUS", menuStatus)
        await createTypeWriterMenu(menu, "< BACK", menuHome)
    })
}

// HOME -> DIAGNOSTICS -> MAP
const menuMap = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        const img = createImageElement('img/map.png', 'stationmap')
        menu.appendChild(img)
        await createTypeWriterMenu(menu, "< BACK", menuDiagnostics)
    })
}

// HOME -> DIAGNOSTICS -> STATUS
const menuStatus = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterText(menu, "SYSTEM CHECK...", { style: `font-size: 90%` })
        await createTypeWriterText(menu, "WARNING: AIR FILTERS REPLACED 455 DAYS AGO", { style: `color: yellow; font-size: 90%` })
        await createTypeWriterText(menu, "WARNING: SHOWER #5 OUT OF SERVICE FOR 1 DAY", { style: `color: red; font-size: 90%` })
        await createTypeWriterText(menu, "WARNING: MINING ELEVATOR LAST MAINTENANCE 455 DAYS AGO", { style: `color: yellow; font-size: 90%` })
        await createTypeWriterText(menu, "WARNING: AIRFLOW AT 82% (NOT OPTIMAL: REPLACE FILTERS AND CHECK DUCT BLOCKAGES)", { style: `color: red; font-size: 90%` })
        if (!isLifeSupportOff() && !isSelfDestructActivated()) {
            await createTypeWriterText(menu, "[ALL SYSTEMS OPERATING UNDER ACCEPTABLE CONDITIONS]", { style: `font-size: 90%` })
        } else {
            if (isLifeSupportOff())
                await createTypeWriterText(menu, "WARNING: LIFE SUPPORT DISABLED!", { style: `color: red; font-size: 90%` })
            if (isSelfDestructActivated())
                await createTypeWriterText(menu, "WARNING: SELF-DESTRUCT SEQUENCE ACTIVATED!", { style: `color: red; font-size: 90%` })
        }
        await createTypeWriterMenu(menu, "< BACK", menuDiagnostics)
    })
}

// HOME -> SCHEDULE
const menuSchedule = async function () {
    await navGuard(async () => {
        let menu = getEmptyMenu()
        menu.innerHTML = scheduleData
        await createTypeWriterMenu(menu, "< BACK", menuHome)
    })
}

// HOME -> CONTROLS
const menuControls = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterMenu(menu, "- AIRLOCKS", menuAirlocks)
        await createTypeWriterMenu(menu, "- SHOWERS", menuShowers)
        await createTypeWriterMenu(menu, "- SYSTEM [A]", menuSystem)
        await createTypeWriterMenu(menu, "< BACK", menuHome)
    })
}

// HOME -> CONTROLS -> AIRLOCKS
const menuAirlocks = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterMenu(menu, `- BAY 1 [${getAirlockStatus(context.lock_docking_bay_1)}]`, toggleAirlock1)
        await createTypeWriterMenu(menu, `- BAY 2 [${getAirlockStatus(context.lock_docking_bay_2)}]`, toggleAirlock2)
        await createTypeWriterMenu(menu, `- MINING ELEVATOR [${getAirlockStatus(context.lock_mineshaft)}]`, toggleMineshaft)
        await createTypeWriterMenu(menu, "< BACK", menuControls)
    })
}

// HOME -> CONTROLS -> SHOWERS
const menuShowers = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        for (let i = 0; i < context.showers.length; i++) {
            const s = context.showers[i]
            await createTypeWriterMenu(menu, `- SHOWER ${i + 1} [${getOnOffStatus(s)}]`, () => toggleShower(i))
        }
        await createTypeWriterMenu(menu, "< BACK", menuControls)
    })
}

// HOME -> CONTROLS -> SYSTEM [A]
// This menu requires admin permissions
const menuSystem = async function () {
    await navGuardAdmin(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterText(menu, `[ACCESS GRANTED, WELCOME BACK, SONYA]`, { style: `color: green` })
        await createTypeWriterMenu(menu, `- LIFE SUPPORT`, menuLifeSupport)
        await createTypeWriterMenu(menu, `- SELF DESTRUCT`, menuSelfDestruct)
        await createTypeWriterMenu(menu, "< BACK", menuControls)
    })
}

// HOME -> CONTROLS -> SYSTEM [A] -> LIFE SUPPORT
const menuLifeSupport = async function () {
    await navGuardAdmin(async () => {
        const menu = getEmptyMenu()
        if (isLifeSupportOff())
            await createTypeWriterText(menu, `[WARNING: LIFE SUPPORT DISABLED]`, { style: `color: red` })

        await createTypeWriterMenu(menu, `- LIFE SUPPORT [${getOnOffStatus(context.life_support)}]`, menuDisableLifeSupport)
        await createTypeWriterMenu(menu, "< BACK", menuControls)
    })
}

const menuDisableLifeSupport = async function () {
    await navGuardAdmin(async () => {
        if (context.life_support === true) {
            const menu = getEmptyMenu()
            await createTypeWriterText(
                menu,
                `[WARNING, DISABLING LIFE SUPPORT WITHOUT AUTHORIZATION VIOLATES SAFETY POLICIES. ENSURE FORM 077-X24 IS COMPLETED AND SUBMITTED TO THE SUPERVISOR.]`,
                { style: `color: red` })
            await createTypeWriterMenu(menu, "- CONFIRM", () => { context.life_support = false; menuLifeSupport() })
            await createTypeWriterMenu(menu, "< BACK", menuControls)
        } else {
            context.life_support = true
            menuLifeSupport()
        }
    })
}

// HOME -> CONTROLS -> SYSTEM [A] -> SELF DESTRUCT
const menuSelfDestruct = async function () {
    await navGuardAdmin(async () => {
        const menu = getEmptyMenu()
        if (isSelfDestructActivated()) {
            await createTypeWriterText(menu,
                `[SELF-DESTRUCT SEQUENCE ACTIVATED. THE STATION WILL DETONATE IN 10 MINUTES. EVACUATE IMMEDIATELY.]`,
                { style: `color: red` })
            await createTypeWriterMenu(menu, `CONFIRM  [${getConfirmationStr(context.self_destruct_confirm[0])}]`, () => toggleSelfDestructConfirm(0))
            await createTypeWriterMenu(menu, `CONFIRM  [${getConfirmationStr(context.self_destruct_confirm[1])}]`, () => toggleSelfDestructConfirm(1))
            await createTypeWriterMenu(menu, `CONFIRM  [${getConfirmationStr(context.self_destruct_confirm[2])}]`, () => toggleSelfDestructConfirm(2))
            await createTypeWriterMenu(menu, "< BACK", menuControls)
        } else {
            await createTypeWriterText(menu,
                `[WARNING, THE SELF-DESTRUCT PROCESS WILL DETONATE THE STATION 10 MINUTES AFTER ACTIVATION. ONCE CONFIRMED, IT WILL BECOME IRREVERSIBLE AFTER 5 MINUTES.]`,
                { style: `color: red` })
            await createTypeWriterMenu(menu, `CONFIRM  [${getConfirmationStr(context.self_destruct_confirm[0])}]`, () => toggleSelfDestructConfirm(0))
            await createTypeWriterMenu(menu, `CONFIRM  [${getConfirmationStr(context.self_destruct_confirm[1])}]`, () => toggleSelfDestructConfirm(1))
            await createTypeWriterMenu(menu, `CONFIRM  [${getConfirmationStr(context.self_destruct_confirm[2])}]`, () => toggleSelfDestructConfirm(2))
            await createTypeWriterMenu(menu, "< BACK", menuControls)
        }
    })
}

// HOME -> ROSTER
const menuRoster = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        menu.innerHTML = rosterData
        await createTypeWriterMenu(menu, "< BACK", menuHome)
    })
}

// HOME -> COMMUNICATIONS
const menuComms = async function () {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterText(menu, `SCANNING NEARBY SHIPS...`)
        await createTypeWriterMenu(menu, `- CONTACT RSV THE HERACLES`, () => menuContact('RSV THE HERACLES', false))
        await createTypeWriterMenu(menu, `- CONTACT IMV THE TEMPEST`, () => menuContact('IMV THE TEMPEST', true))
        await createTypeWriterMenu(menu, "< BACK", menuHome)
    })
}

// HOME -> COMMUNICATIONS -> <SHIP>
const menuContact = async function (ship, success) {
    await navGuard(async () => {
        const menu = getEmptyMenu()
        await createTypeWriterText(menu, `SENDING CONTACT SIGNAL TO ${ship}...`)
        await createTypeWriterText(menu, `...`, { speed: 500 })
        await createTypeWriterText(menu, `...`, { speed: 500 })
        if (success) {
            await createTypeWriterText(menu, `CHANNEL OPEN`, { style: `color: green` })
        } else {
            playSfx("errorsfx")
            await createTypeWriterText(menu, `CONTACT FAILED`, { style: `color: red` })
        }
        await createTypeWriterMenu(menu, "< BACK", menuHome)
    })
}

// HELPERS
const toggleAirlock1 = function (flag) {
    showError("MANUAL LOCK ENGAGED. DISENGAGE MANUAL LOCK.")
}

const toggleAirlock2 = function (flag) {
    context.lock_docking_bay_2 = !context.lock_docking_bay_2
    playSfx('airlocksfx')
    menuAirlocks()
}

const toggleMineshaft = function (flag) {
    context.lock_mineshaft = !context.lock_mineshaft
    playSfx('airlocksfx')
    menuAirlocks()
}

const toggleShower = function (index) {
    if (index === 4) {
        // this shower doesn't work
        showError("[SHOWER 5 OUT OF SERVICE.]")
    } else {
        context.showers[index] = !context.showers[index]
        menuShowers()
    }
}

const toggleAdmin = function () {
    const admin_el = document.getElementById('admin')
    context.is_admin = !context.is_admin
    if (context.is_admin) {
        admin_el.style.color = '#0f0'
        admin_el.innerHTML = 'ADMIN'
    } else {
        admin_el.style.color = '#000'
        admin_el.innerHTML = 'GUEST'
    }

    navigator.vibrate(200); // vibrate for 200ms
}

const toggleSelfDestructConfirm = function (index) {
    context.self_destruct_confirm[index] = !context.self_destruct_confirm[index]

    if (isSelfDestructActivated()) {
        navigator.vibrate([
            100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100,
        ]); // Vibrate 'SOS' in Morse.        
    } else {
        navigator.vibrate(200); // vibrate for 200ms
    }

    menuSelfDestruct()
}
//
