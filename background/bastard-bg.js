/**
 * Times New Bastard Addon - Background Script
 * @author Kevin Kandlbinder (https://kevink.dev)
 */


// This stores which tabs (should) currently have bastard.css loaded (used for toggling)
// Key: tabId / Value: true/false
const activatedTabs = {} 

// This function takes a tabId and loads bastard.css for it
const activateBastard = async (tabId) => {
    // Insert our CSS into the tab
    await browser.scripting.insertCSS({
        target: {
          tabId: tabId,
        },
        files: ["assets/bastard.css"],
    });

    // Note the activation
    activatedTabs[tabId] = true;

    // Add listener for this tab, so we can know if the user navigates away
    browser.tabs.onUpdated.addListener(activeUpdateHandler, {
        tabId: tabId
    })

    // Update pageAction icon to active state (blue)
    browser.pageAction.setIcon({
        tabId: tabId,
        path: {
            19: "assets/icons/bastard_active_19.png",
            38: "assets/icons/bastard_active_38.png",
            120: "assets/icons/bastard_active_120.png",
        }
    })
}

// This function takes a tabId and removes bastard.css from it
const deactivateBastard = async (tabId) => {
    // Remove our CSS
    await browser.scripting.removeCSS({
        target: {
          tabId: tabId,
        },
        files: ["assets/bastard.css"],
    });

    // Note the deactivation
    activatedTabs[tabId] = false;

    // Reset the pageAction icon to the grey default
    browser.pageAction.setIcon({
        tabId: tabId,
        path: "assets/icons/bastard_inactive.svg"
    })
}

// This is an event listener to handle users navigating away from the page (which will kick out bastard.css)
const activeUpdateHandler = async (tabId, changeInfo) => {
    if(changeInfo.status == "loading") {
        activatedTabs[tabId] = false;

        browser.pageAction.setIcon({
            tabId: tabId,
            path: "assets/icons/bastard_inactive.svg"
        })
    }
}

// Toggles bastard.css for the current tab
const toggleBastard = async () => {
    // Find current tab
    const tab = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true
    })

    // If we can't find it, cancel
    if(tab.length == 0) {
        return
    }

    // Check if we are already loaded in that tab
    if(!activatedTabs[tab[0].id]) {
        activateBastard(tab[0].id)
    } else {
        deactivateBastard(tab[0].id)
    }
}

// Binds the button in the address-bar to toggle bastard.css
browser.pageAction.onClicked.addListener(toggleBastard);

// Binds the Ctrl-Alt-B-keybind
browser.commands.onCommand.addListener(async (ev) => {
    if(ev == "toggle-bastard") {
        toggleBastard()
    }
})
