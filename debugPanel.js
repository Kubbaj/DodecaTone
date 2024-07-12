// debugPanel.js

class DebugTracker {
    constructor() {
        this.trackedVars = {};
    }

    track(name, getter) {
        Object.defineProperty(this.trackedVars, name, {
            get: getter,
            enumerable: true
        });
    }

    getAll() {
        const result = {};
        for (const [key, value] of Object.entries(this.trackedVars)) {
            result[key] = value;
        }
        return result;
    }
}

const debugTracker = new DebugTracker();

let debugMode = false;
let updateInterval = null;

function toggleDebugDashboard() {
    debugMode = !debugMode;
    const dashboard = document.getElementById('debug-dashboard') || createDebugDashboard();
    
    if (debugMode) {
        dashboard.style.display = 'block';
        updateInterval = setInterval(updateDebugDashboard, 250); // Update 4 times per second
    } else {
        dashboard.style.display = 'none';
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }
    
    if (debugMode) {
        updateDebugDashboard();
    }
}

function createDebugDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'debug-dashboard';
    dashboard.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        z-index: 9999;
        display: none;
        pointer-events: none;
        user-select: none;
        max-width: 300px;
        overflow-y: auto;
        max-height: 90vh;
    `;
    document.body.appendChild(dashboard);
    return dashboard;
}

function updateDebugDashboard() {
    const dashboard = document.getElementById('debug-dashboard');
    if (!dashboard) return;
    
    const state = debugTracker.getAll();
    
    dashboard.innerHTML = `
        <h3>Debug Dashboard</h3>
        <pre>
${Object.entries(state).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}

        </pre>
    `;
}

export { debugTracker, toggleDebugDashboard };