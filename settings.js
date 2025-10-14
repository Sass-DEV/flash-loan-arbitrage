// Settings Management JavaScript
// Configuration and preferences handling

// Settings state
let currentSettings = {};
let isDirty = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    showSection('general');
});

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('flashLoanSettings');
    if (savedSettings) {
        currentSettings = JSON.parse(savedSettings);
        applySettings();
    } else {
        currentSettings = getDefaultSettings();
    }
}

// Get default settings
function getDefaultSettings() {
    return {
        general: {
            theme: 'dark',
            language: 'en',
            timezone: 'utc',
            currency: 'usd',
            autoRefresh: true,
            darkMode: true,
            refreshInterval: 5000
        },
        trading: {
            defaultStrategy: 'all',
            minProfit: 100,
            maxGas: 150,
            slippage: 0.5,
            autoExecuteThreshold: 1000,
            autoExecute: false,
            mevProtection: true,
            positionSize: 0.5
        },
        notifications: {
            soundAlerts: true,
            browserNotifications: false,
            emailAlerts: false,
            emailAddress: '',
            alertThreshold: 500,
            telegramNotifications: false,
            telegramBotToken: '',
            volumeLevel: 0.5
        },
        api: {
            rpcEndpoint: 'https://mainnet.infura.io/v3/YOUR_KEY',
            backupRpc: '',
            dexAggregatorKey: '',
            priceFeedProvider: 'coingecko',
            websocketUrl: '',
            enableWebsocket: true,
            requestTimeout: 30000
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            whitelistEnabled: true,
            whitelistedAddresses: [],
            manualSigning: true,
            maxDailyTrades: 100,
            maxTradeValue: 100000
        },
        advanced: {
            scanInterval: 3000,
            maxOpportunitiesCache: 100,
            confidenceAlgorithm: 'standard',
            debugMode: false,
            experimentalFeatures: false,
            logLevel: 'info',
            performanceMode: 'balanced'
        }
    };
}

// Apply settings to UI
function applySettings() {
    // General settings
    document.querySelector('select[value="' + currentSettings.general.theme + '"]')?.setAttribute('selected', 'selected');
    document.querySelector('select[value="' + currentSettings.general.language + '"]')?.setAttribute('selected', 'selected');
    
    // Trading settings
    const minProfitInput = document.querySelector('#trading-section input[type="number"]');
    if (minProfitInput) minProfitInput.value = currentSettings.trading.minProfit;
    
    // Apply other settings...
    // This would be expanded to cover all settings
}

// Setup event listeners
function setupEventListeners() {
    // Add change listeners to all inputs
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('change', () => {
            isDirty = true;
            markUnsavedChanges();
        });
    });
    
    // Prevent navigation if there are unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Show specific settings section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.setting-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section')?.classList.remove('hidden');
    
    // Update navigation
    document.querySelectorAll('.setting-nav').forEach(nav => {
        nav.classList.remove('bg-purple-500/20');
    });
    event.target?.classList.add('bg-purple-500/20');
}

// Save settings
function saveSettings() {
    // Gather all settings from UI
    gatherSettings();
    
    // Validate settings
    if (!validateSettings()) {
        showNotification('Please fix the errors before saving', 'error');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('flashLoanSettings', JSON.stringify(currentSettings));
    
    // Save to backend (simulated)
    saveToBackend();
    
    // Reset dirty flag
    isDirty = false;
    removeUnsavedChanges();
    
    showNotification('Settings saved successfully!', 'success');
}

// Gather settings from UI
function gatherSettings() {
    // General settings
    const generalSection = document.getElementById('general-section');
    if (generalSection) {
        currentSettings.general.theme = generalSection.querySelector('select')?.value || 'dark';
        // ... gather other general settings
    }
    
    // Trading settings
    const tradingSection = document.getElementById('trading-section');
    if (tradingSection) {
        const inputs = tradingSection.querySelectorAll('input[type="number"]');
        currentSettings.trading.minProfit = parseFloat(inputs[0]?.value) || 100;
        currentSettings.trading.maxGas = parseFloat(inputs[1]?.value) || 150;
        currentSettings.trading.slippage = parseFloat(inputs[2]?.value) || 0.5;
        currentSettings.trading.autoExecuteThreshold = parseFloat(inputs[3]?.value) || 1000;
        
        const toggles = tradingSection.querySelectorAll('input[type="checkbox"]');
        currentSettings.trading.autoExecute = toggles[0]?.checked || false;
        currentSettings.trading.mevProtection = toggles[1]?.checked || false;
    }
    
    // Notifications settings
    const notificationsSection = document.getElementById('notifications-section');
    if (notificationsSection) {
        const toggles = notificationsSection.querySelectorAll('input[type="checkbox"]');
        currentSettings.notifications.soundAlerts = toggles[0]?.checked || false;
        currentSettings.notifications.browserNotifications = toggles[1]?.checked || false;
        currentSettings.notifications.emailAlerts = toggles[2]?.checked || false;
        currentSettings.notifications.telegramNotifications = toggles[3]?.checked || false;
        
        currentSettings.notifications.emailAddress = notificationsSection.querySelector('input[type="email"]')?.value || '';
        currentSettings.notifications.alertThreshold = parseFloat(notificationsSection.querySelector('input[type="number"]')?.value) || 500;
    }
    
    // API settings
    const apiSection = document.getElementById('api-section');
    if (apiSection) {
        const inputs = apiSection.querySelectorAll('input[type="text"]');
        currentSettings.api.rpcEndpoint = inputs[0]?.value || '';
        currentSettings.api.backupRpc = inputs[1]?.value || '';
        currentSettings.api.dexAggregatorKey = inputs[2]?.value || '';
        currentSettings.api.websocketUrl = inputs[3]?.value || '';
        
        currentSettings.api.priceFeedProvider = apiSection.querySelector('select')?.value || 'coingecko';
        currentSettings.api.enableWebsocket = apiSection.querySelector('input[type="checkbox"]')?.checked || false;
    }
    
    // Security settings
    const securitySection = document.getElementById('security-section');
    if (securitySection) {
        const toggles = securitySection.querySelectorAll('input[type="checkbox"]');
        currentSettings.security.twoFactorAuth = toggles[0]?.checked || false;
        currentSettings.security.whitelistEnabled = toggles[1]?.checked || false;
        currentSettings.security.manualSigning = toggles[2]?.checked || false;
        
        currentSettings.security.sessionTimeout = parseInt(securitySection.querySelector('input[type="number"]')?.value) || 30;
        
        const whitelistTextarea = securitySection.querySelector('textarea');
        if (whitelistTextarea) {
            currentSettings.security.whitelistedAddresses = whitelistTextarea.value.split('\n').filter(addr => addr.trim());
        }
    }
    
    // Advanced settings
    const advancedSection = document.getElementById('advanced-section');
    if (advancedSection) {
        const inputs = advancedSection.querySelectorAll('input[type="number"]');
        currentSettings.advanced.scanInterval = parseInt(inputs[0]?.value) || 3000;
        currentSettings.advanced.maxOpportunitiesCache = parseInt(inputs[1]?.value) || 100;
        
        currentSettings.advanced.confidenceAlgorithm = advancedSection.querySelector('select')?.value || 'standard';
        
        const toggles = advancedSection.querySelectorAll('input[type="checkbox"]');
        currentSettings.advanced.debugMode = toggles[0]?.checked || false;
        currentSettings.advanced.experimentalFeatures = toggles[1]?.checked || false;
    }
}

// Validate settings
function validateSettings() {
    let isValid = true;
    const errors = [];
    
    // Validate trading settings
    if (currentSettings.trading.minProfit < 0) {
        errors.push('Minimum profit must be positive');
        isValid = false;
    }
    
    if (currentSettings.trading.maxGas < 1 || currentSettings.trading.maxGas > 1000) {
        errors.push('Max gas must be between 1 and 1000 Gwei');
        isValid = false;
    }
    
    if (currentSettings.trading.slippage < 0 || currentSettings.trading.slippage > 10) {
        errors.push('Slippage must be between 0% and 10%');
        isValid = false;
    }
    
    // Validate email if email alerts are enabled
    if (currentSettings.notifications.emailAlerts && !validateEmail(currentSettings.notifications.emailAddress)) {
        errors.push('Please enter a valid email address');
        isValid = false;
    }
    
    // Validate RPC endpoints
    if (!validateUrl(currentSettings.api.rpcEndpoint)) {
        errors.push('Please enter a valid RPC endpoint URL');
        isValid = false;
    }
    
    // Validate whitelisted addresses
    if (currentSettings.security.whitelistEnabled) {
        for (let addr of currentSettings.security.whitelistedAddresses) {
            if (!validateEthereumAddress(addr)) {
                errors.push(`Invalid Ethereum address: ${addr}`);
                isValid = false;
                break;
            }
        }
    }
    
    // Show errors if any
    if (!isValid) {
        showErrors(errors);
    }
    
    return isValid;
}

// Validation helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Show validation errors
function showErrors(errors) {
    const errorHtml = errors.map(err => `<li class="text-red-400">• ${err}</li>`).join('');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-20 right-4 bg-red-900/90 backdrop-blur-md rounded-lg p-4 border border-red-500/30 max-w-md';
    errorDiv.innerHTML = `
        <h3 class="font-bold text-red-400 mb-2">Validation Errors</h3>
        <ul class="text-sm space-y-1">${errorHtml}</ul>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Save to backend (simulated)
async function saveToBackend() {
    // Simulate API call
    console.log('Saving settings to backend:', currentSettings);
    
    // In a real application, this would be:
    // await fetch('/api/settings', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(currentSettings)
    // });
}

// Mark unsaved changes
function markUnsavedChanges() {
    const saveButton = document.querySelector('button[onclick="saveSettings()"]');
    if (saveButton && !saveButton.textContent.includes('*')) {
        saveButton.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes*';
        saveButton.classList.add('animate-pulse');
    }
}

// Remove unsaved changes mark
function removeUnsavedChanges() {
    const saveButton = document.querySelector('button[onclick="saveSettings()"]');
    if (saveButton) {
        saveButton.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
        saveButton.classList.remove('animate-pulse');
    }
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        currentSettings = getDefaultSettings();
        applySettings();
        saveSettings();
        showNotification('Settings reset to defaults', 'info');
    }
}

// Export settings
function exportSettings() {
    const blob = new Blob([JSON.stringify(currentSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flash_loan_settings_${new Date().toISOString()}.json`;
    a.click();
    showNotification('Settings exported successfully', 'success');
}

// Import settings
function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                
                // Validate imported settings structure
                if (imported.general && imported.trading && imported.notifications) {
                    currentSettings = imported;
                    applySettings();
                    saveSettings();
                    showNotification('Settings imported successfully', 'success');
                } else {
                    showNotification('Invalid settings file format', 'error');
                }
            } catch (error) {
                showNotification('Failed to import settings: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Clear cache
function clearCache() {
    if (confirm('Clear all cached data? This will remove all temporary data but keep your settings.')) {
        // Clear specific cache items
        const keysToKeep = ['flashLoanSettings', 'walletAddress'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        showNotification('Cache cleared successfully', 'success');
    }
}

// Test API connection
async function testConnection() {
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Testing...';
    button.disabled = true;
    
    try {
        // Simulate API test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real application, this would test the actual RPC endpoint
        const success = Math.random() > 0.3; // 70% success rate for demo
        
        if (success) {
            showNotification('Connection successful!', 'success');
        } else {
            showNotification('Connection failed. Please check your settings.', 'error');
        }
    } catch (error) {
        showNotification('Connection test failed: ' + error.message, 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Reset API keys
function resetApiKeys() {
    if (confirm('Reset all API keys? You will need to re-enter them.')) {
        currentSettings.api.rpcEndpoint = '';
        currentSettings.api.backupRpc = '';
        currentSettings.api.dexAggregatorKey = '';
        currentSettings.api.websocketUrl = '';
        currentSettings.notifications.telegramBotToken = '';
        
        // Clear from UI
        document.querySelectorAll('#api-section input[type="text"]').forEach(input => {
            input.value = '';
        });
        
        saveSettings();
        showNotification('API keys reset', 'info');
    }
}

// Enable browser notifications
async function enableBrowserNotifications() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            currentSettings.notifications.browserNotifications = true;
            showNotification('Browser notifications enabled', 'success');
            
            // Test notification
            new Notification('Flash Loan Arbitrage', {
                body: 'Notifications are now enabled!',
                icon: '/favicon.ico'
            });
        } else {
            showNotification('Browser notifications permission denied', 'error');
        }
    } else {
        showNotification('Browser notifications not supported', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 bg-purple-900/90 backdrop-blur-md rounded-lg p-4 border border-purple-500/30 transform transition-all duration-300 z-50`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    const color = type === 'success' ? 'green' : 
                  type === 'error' ? 'red' : 
                  'blue';
    
    notification.innerHTML = `
        <div class="flex items-start space-x-3">
            <i class="fas fa-${icon} text-${color}-400 text-xl"></i>
            <div>
                <p class="font-semibold">Settings</p>
                <p class="text-sm text-gray-400">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Apply settings to the main application
function applySettingsToApp() {
    // This would communicate with the main app
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'SETTINGS_UPDATE',
            settings: currentSettings
        }, '*');
    }
    
    // Update global config if available
    if (window.CONFIG) {
        window.CONFIG = { ...window.CONFIG, ...currentSettings };
    }
}

// Auto-save draft
setInterval(() => {
    if (isDirty) {
        const draftSettings = {};
        gatherSettings();
        localStorage.setItem('flashLoanSettingsDraft', JSON.stringify(currentSettings));
    }
}, 30000); // Auto-save every 30 seconds
