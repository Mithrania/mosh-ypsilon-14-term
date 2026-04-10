import { showError, playSfx, stopSfx, clearError } from "./utils.js";
import context from "./ctx.js";

let nav_enabled = true;

async function doNav(func) {
    try {
        nav_enabled = false;
        clearError()
        playSfx('readsfx')
        await func()
    } finally {
        nav_enabled = true;
        stopSfx('readsfx')
    }
}

async function navGuard(func) {
    if (nav_enabled === false)
        return
    await doNav(func)
}

async function navGuardAdmin(func) {
    if (nav_enabled === false)
        return
    if (context.is_admin === false) {
        showError("[ACCESS PROHIBITED, ADMINISTRATOR'S KEYCARD REQUIRED]")
        return
    }
    await doNav(func)
}

export {
    navGuard,
    navGuardAdmin
}
