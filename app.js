// Flash Loan Arbitrage Dashboard - Advanced DeFi Tool
// Real-time arbitrage opportunity detection and execution

// State Management
let isScanning = false;
let opportunities = [];
let executedTrades = [];
let profitHistory = [];
let currentGasPrice = 35;
let currentBlock = 18234567;
let scanInterval;
let soundEnabled = true;
let selectedStrategy = 'all';
let walletConnected = false;
let userAddress = null;

// Advanced Configuration
const CONFIG = {
    updateInterval: 3000,
    maxOpportunities: 100,
    soundThreshold: 500,
    autoExecuteThreshold: 1000,
    strategies: {
        triangular: true,
        crossDex: true,
        stablecoin: true,
        flashMint: true
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    startBlockUpdates();
    updateStats();
    generateMockOpportunities();
});

// Connect Wallet Function
async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert('Please install MetaMask or another Web3 wallet!');
            return;
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        if (accounts.length > 0) {
            userAddress = accounts[0];
            const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
            
            // Update UI
            const walletBtn = document.querySelector('#connectWallet span');
            if (walletBtn) {
                walletBtn.textContent = shortAddress;
            }
            
            walletConnected = true;
            showNotification('Wallet connected successfully!', 'success');
            console.log('Connected:', userAddress);
            
            // Load user-specific data
            loadUserHistory();
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

// Start Scanning for Arbitrage Opportunities
function startScanning() {
    if (isScanning) return;
    
    isScanning = true;
    showNotification('Arbitrage scanner started', 'success');
    
    // Start real-time scanning simulation
    scanInterval = setInterval(() => {
        findArbitrageOpportunities();
        updateOpportunitiesList();
    }, 3000); // Check every 3 seconds
}

// Stop Scanning
function stopScanning() {
    isScanning = false;
    if (scanInterval) {
        clearInterval(scanInterval);
    }
    showNotification('Scanner stopped', 'info');
}

// Find Arbitrage Opportunities (Enhanced)
function findArbitrageOpportunities() {
    const minProfit = parseFloat(document.getElementById('min-profit').value) || 100;
    const maxGas = parseFloat(document.getElementById('max-gas').value) || 150;
    
    // Enhanced token pairs with more realistic combinations
    const pairs = [
        { from: 'WETH', to: 'USDC', via: 'WETH', type: 'triangular' },
        { from: 'DAI', to: 'USDT', via: 'DAI', type: 'stablecoin' },
        { from: 'WBTC', to: 'WETH', via: 'WBTC', type: 'crossDex' },
        { from: 'USDC', to: 'DAI', via: 'USDC', type: 'stablecoin' },
        { from: 'MATIC', to: 'USDC', via: 'MATIC', type: 'triangular' },
        { from: 'UNI', to: 'WETH', via: 'UNI', type: 'crossDex' },
        { from: 'LINK', to: 'USDC', via: 'LINK', type: 'triangular' },
        { from: 'AAVE', to: 'WETH', via: 'AAVE', type: 'crossDex' }
    ];
    
    const dexRoutes = [
        ['Uniswap V3', 'SushiSwap', 'Uniswap V3'],
        ['Curve', 'Balancer', 'Curve'],
        ['Balancer', 'Uniswap V2', 'SushiSwap'],
        ['1inch', 'Curve', 'Balancer'],
        ['Uniswap V3', 'Curve', 'SushiSwap'],
        ['PancakeSwap', '1inch', 'Uniswap V3']
    ];
    
    // More sophisticated opportunity generation
    if (Math.random() > 0.5) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const route = dexRoutes[Math.floor(Math.random() * dexRoutes.length)];
        const baseProfit = Math.random() * 3000 + 50;
        const volatilityBonus = Math.random() * 500;
        const profit = baseProfit + volatilityBonus;
        
        // Filter by strategy if selected
        if (selectedStrategy !== 'all' && pair.type !== selectedStrategy) {
            return;
        }
        
        if (profit >= minProfit && currentGasPrice <= maxGas) {
            const opportunity = {
                id: Date.now() + Math.random(),
                pair: `${pair.from} → ${pair.to} → ${pair.via}`,
                route: route.join(' → '),
                profit: profit.toFixed(2),
                flashLoanAmount: (Math.random() * 100 + 10).toFixed(2),
                gasCost: (currentGasPrice * 0.45).toFixed(2),
                priceImpact: (Math.random() * 0.8).toFixed(2),
                successRate: Math.floor(Math.random() * 30 + 70),
                timestamp: new Date(),
                isProfitable: profit > 500,
                strategy: pair.type,
                confidence: calculateConfidence(profit, currentGasPrice),
                estimatedTime: Math.floor(Math.random() * 30 + 10) // seconds
            };
            
            opportunities.unshift(opportunity);
            
            // Play sound for highly profitable opportunities
            if (soundEnabled && profit > CONFIG.soundThreshold) {
                playAlertSound();
            }
            
            // Check for auto-execute
            if (walletConnected && profit > CONFIG.autoExecuteThreshold) {
                autoExecuteOpportunity(opportunity);
            }
            
            // Keep only last opportunities based on config
            if (opportunities.length > CONFIG.maxOpportunities) {
                opportunities.pop();
            }
            
            // Update counter and analytics
            updateOpportunityCount();
            updateAnalytics(opportunity);
        }
    }
}

// Calculate confidence score
function calculateConfidence(profit, gasPrice) {
    let confidence = 50;
    if (profit > 1000) confidence += 20;
    if (profit > 2000) confidence += 10;
    if (gasPrice < 30) confidence += 10;
    if (gasPrice < 20) confidence += 10;
    return Math.min(confidence, 95);
}

// Auto-execute high-value opportunities
function autoExecuteOpportunity(opportunity) {
    if (opportunity.confidence > 85) {
        showNotification(`Auto-executing high-value opportunity: $${opportunity.profit}`, 'success');
        executeTrade(opportunity.id);
    }
}

// Play alert sound
function playAlertSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRoQFAABXQVZFZm10IBAAAAABAAEAIlYAAIhYAQACABAAZGF0YWAFY=');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Update Opportunities List in UI
function updateOpportunitiesList() {
    const listElement = document.getElementById('opportunities-list');
    
    if (opportunities.length === 0) {
        listElement.innerHTML = `
            <div class="text-center py-8">
                <div class="loading-spinner w-8 h-8 rounded-full mx-auto mb-3"></div>
                <p class="text-sm text-gray-400">Scanning for arbitrage opportunities...</p>
            </div>
        `;
        return;
    }
    
    listElement.innerHTML = opportunities.slice(0, 5).map(opp => `
        <div class="opportunity-card ${opp.isProfitable ? 'profitable' : ''} bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="bg-${opp.isProfitable ? 'green' : 'yellow'}-500/20 text-${opp.isProfitable ? 'green' : 'yellow'}-400 px-2 py-0.5 rounded text-xs font-semibold">
                            ${opp.isProfitable ? 'PROFITABLE' : 'MODERATE'}
                        </span>
                        <span class="text-xs text-gray-400">${getTimeAgo(opp.timestamp)}</span>
                    </div>
                    <h3 class="font-bold">${opp.pair}</h3>
                    <p class="text-sm text-gray-400">${opp.route}</p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold text-${opp.isProfitable ? 'green' : 'yellow'}-400">+$${opp.profit}</p>
                    <p class="text-xs text-gray-400">Net Profit</p>
                </div>
            </div>
            
            <div class="grid grid-cols-4 gap-2 mb-3 text-xs">
                <div>
                    <span class="text-gray-400">Flash Loan:</span>
                    <p class="font-semibold">${opp.flashLoanAmount} ${opp.pair.split(' ')[0]}</p>
                </div>
                <div>
                    <span class="text-gray-400">Gas Cost:</span>
                    <p class="font-semibold">$${opp.gasCost}</p>
                </div>
                <div>
                    <span class="text-gray-400">Price Impact:</span>
                    <p class="font-semibold text-${opp.priceImpact < 0.2 ? 'green' : 'yellow'}-400">${opp.priceImpact}%</p>
                </div>
                <div>
                    <span class="text-gray-400">Success Rate:</span>
                    <p class="font-semibold text-${opp.successRate > 85 ? 'green' : 'yellow'}-400">${opp.successRate}%</p>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="simulateTrade('${opp.id}')" class="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 px-3 py-1 rounded text-sm transition">
                    <i class="fas fa-flask mr-1"></i>Simulate
                </button>
                <button onclick="executeTrade('${opp.id}')" class="flex-1 ${opp.isProfitable ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 'bg-gray-500/20 border border-gray-500 cursor-not-allowed'} px-3 py-1 rounded text-sm font-semibold transition" ${!opp.isProfitable ? 'disabled' : ''}>
                    <i class="fas fa-bolt mr-1"></i>${opp.isProfitable ? 'Execute' : 'Below Threshold'}
                </button>
            </div>
        </div>
    `).join('');
}

// Simulate Trade
function simulateTrade(opportunityId) {
    const opportunity = opportunities.find(o => o.id == opportunityId);
    if (!opportunity) return;
    
    showNotification('Simulating trade...', 'info');
    
    // Simulate processing
    setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
            showNotification(`Simulation successful! Expected profit: $${opportunity.profit}`, 'success');
            showTransactionBuilder(opportunity);
        } else {
            showNotification('Simulation failed: Price moved unfavorably', 'error');
        }
    }, 2000);
}

// Execute Trade
function executeTrade(opportunityId) {
    const opportunity = opportunities.find(o => o.id == opportunityId);
    if (!opportunity) return;
    
    showTransactionBuilder(opportunity);
}

// Show Transaction Builder Modal
function showTransactionBuilder(opportunity) {
    const modal = document.getElementById('tx-builder-modal');
    modal.classList.remove('hidden');
    
    // Update modal content with opportunity details
    // This would be populated with actual transaction data
}

// Close Transaction Builder
function closeTxBuilder() {
    document.getElementById('tx-builder-modal').classList.add('hidden');
}

// Send Transaction
async function sendTransaction() {
    showNotification('Building transaction...', 'info');
    
    // Simulate transaction sending
    setTimeout(() => {
        const txHash = '0x' + Math.random().toString(36).substring(2, 15);
        showNotification(`Transaction sent! Hash: ${txHash}`, 'success');
        closeTxBuilder();
        
        // Add to executed trades
        executedTrades.unshift({
            hash: txHash,
            profit: Math.random() * 1000 + 100,
            timestamp: new Date()
        });
        
        updateRecentExecutions();
        updateProfitHistory();
    }, 3000);
}

// Calculate Flash Loan Profit
function calculateProfit() {
    const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const expectedProfit = parseFloat(document.getElementById('expected-profit').value) || 0;
    
    // Mock prices for demo
    const tokenPrices = {
        'WETH': 2000,
        'USDC': 1,
        'DAI': 1,
        'WBTC': 40000
    };
    
    const loanValue = loanAmount * 2000; // Assuming WETH
    const flashFee = loanValue * 0.0009; // 0.09% fee
    const gasCost = currentGasPrice * 1.5; // Estimated gas cost
    const grossProfit = loanValue * (expectedProfit / 100);
    const netProfit = grossProfit - flashFee - gasCost;
    
    // Update UI
    document.getElementById('loan-value').textContent = loanValue.toFixed(0);
    
    showNotification(`Net profit calculated: $${netProfit.toFixed(2)}`, 'info');
}

// Update Statistics (Enhanced)
function updateStats() {
    // Update opportunity count
    updateOpportunityCount();
    
    // Update total profit (24h)
    const totalProfit = executedTrades.reduce((sum, trade) => sum + trade.profit, 0);
    document.getElementById('total-profit').textContent = totalProfit.toFixed(0);
    
    // Update success rate
    const successRate = executedTrades.length > 0 
        ? Math.floor((executedTrades.filter(t => t.profit > 0).length / executedTrades.length) * 100)
        : 0;
    document.getElementById('success-rate').textContent = successRate;
    
    // Update gas price with more realistic variation
    const gasVariation = Math.sin(Date.now() / 10000) * 10;
    currentGasPrice = Math.floor(35 + gasVariation + Math.random() * 20);
    document.getElementById('gas-price').textContent = currentGasPrice;
    
    // Update additional metrics
    updateNetworkHealth();
    updateTopPerformers();
}

// Update network health indicator
function updateNetworkHealth() {
    const health = currentGasPrice < 50 ? 'Optimal' : currentGasPrice < 100 ? 'Moderate' : 'Congested';
    const healthColor = currentGasPrice < 50 ? 'green' : currentGasPrice < 100 ? 'yellow' : 'red';
    
    // Update UI if element exists
    const healthElement = document.getElementById('network-health');
    if (healthElement) {
        healthElement.textContent = health;
        healthElement.className = `text-${healthColor}-400`;
    }
}

// Update top performing strategies
function updateTopPerformers() {
    const strategyPerformance = {};
    opportunities.forEach(opp => {
        if (!strategyPerformance[opp.strategy]) {
            strategyPerformance[opp.strategy] = { count: 0, totalProfit: 0 };
        }
        strategyPerformance[opp.strategy].count++;
        strategyPerformance[opp.strategy].totalProfit += parseFloat(opp.profit);
    });
    
    // Update UI with top strategies
    Object.entries(strategyPerformance).forEach(([strategy, data]) => {
        console.log(`Strategy ${strategy}: ${data.count} opportunities, $${data.totalProfit.toFixed(2)} potential`);
    });
}

// Update Opportunity Count
function updateOpportunityCount() {
    const profitableCount = opportunities.filter(o => o.isProfitable).length;
    document.getElementById('opportunities-count').textContent = profitableCount;
}

// Update Recent Executions
function updateRecentExecutions() {
    // This would update the recent executions list
    // For now, it's handled by the static HTML
}

// Update Profit History
function updateProfitHistory() {
    profitHistory.push({
        time: new Date(),
        profit: Math.random() * 2000 - 200
    });
    
    // Keep last 24 data points
    if (profitHistory.length > 24) {
        profitHistory.shift();
    }
    
    updateChart();
}

// Initialize Chart
let profitChart;
function initializeChart() {
    const ctx = document.getElementById('profitChart').getContext('2d');
    
    // Generate initial data
    for (let i = 0; i < 24; i++) {
        profitHistory.push({
            time: new Date(Date.now() - (24 - i) * 3600000),
            profit: Math.random() * 2000 - 200
        });
    }
    
    profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: profitHistory.map(h => h.time.getHours() + ':00'),
            datasets: [{
                label: 'Profit ($)',
                data: profitHistory.map(h => h.profit),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(168, 85, 247, 0.1)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(168, 85, 247, 0.1)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                }
            }
        }
    });
}

// Update Chart
function updateChart() {
    if (!profitChart) return;
    
    profitChart.data.labels = profitHistory.map(h => h.time.getHours() + ':00');
    profitChart.data.datasets[0].data = profitHistory.map(h => h.profit);
    profitChart.update();
}

// Start Block Number Updates
function startBlockUpdates() {
    document.getElementById('block-number').textContent = currentBlock.toLocaleString();
    setInterval(() => {
        currentBlock++;
        document.getElementById('block-number').textContent = currentBlock.toLocaleString();
    }, 12000); // New block every 12 seconds
}

// Generate Mock Opportunities on Load
function generateMockOpportunities() {
    // Generate some initial opportunities
    for (let i = 0; i < 3; i++) {
        findArbitrageOpportunities();
    }
    updateOpportunitiesList();
}

// Utility: Get time ago string
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
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
                <p class="font-semibold">Notification</p>
                <p class="text-sm text-gray-400">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for new features
    initializeAdvancedFeatures();
    
    // Add keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Load saved settings
    loadUserSettings();
});

// Initialize advanced features
function initializeAdvancedFeatures() {
    // Strategy filter
    const strategyFilter = document.createElement('select');
    strategyFilter.id = 'strategy-filter';
    strategyFilter.className = 'bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm';
    strategyFilter.innerHTML = `
        <option value="all">All Strategies</option>
        <option value="triangular">Triangular</option>
        <option value="crossDex">Cross-DEX</option>
        <option value="stablecoin">Stablecoin</option>
    `;
    strategyFilter.addEventListener('change', (e) => {
        selectedStrategy = e.target.value;
        filterOpportunities();
    });
    
    // Sound toggle
    const soundToggle = document.createElement('button');
    soundToggle.id = 'sound-toggle';
    soundToggle.className = 'bg-black/30 px-3 py-2 rounded-lg text-sm';
    soundToggle.innerHTML = `<i class="fas fa-volume-up"></i>`;
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        localStorage.setItem('soundEnabled', soundEnabled);
    });
}

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S: Start/Stop scanning
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            isScanning ? stopScanning() : startScanning();
        }
        
        // Ctrl/Cmd + E: Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportData();
        }
        
        // Ctrl/Cmd + C: Clear opportunities
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            clearOpportunities();
        }
    });
}

// Load user settings
function loadUserSettings() {
    soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    selectedStrategy = localStorage.getItem('selectedStrategy') || 'all';
    
    const minProfit = localStorage.getItem('minProfit');
    if (minProfit) {
        document.getElementById('min-profit').value = minProfit;
    }
    
    const maxGas = localStorage.getItem('maxGas');
    if (maxGas) {
        document.getElementById('max-gas').value = maxGas;
    }
}

// Save user settings
function saveUserSettings() {
    localStorage.setItem('minProfit', document.getElementById('min-profit').value);
    localStorage.setItem('maxGas', document.getElementById('max-gas').value);
    localStorage.setItem('selectedStrategy', selectedStrategy);
}

// Load user history
function loadUserHistory() {
    const history = localStorage.getItem(`history_${userAddress}`);
    if (history) {
        executedTrades = JSON.parse(history);
        updateRecentExecutions();
    }
}

// Filter opportunities by strategy
function filterOpportunities() {
    updateOpportunitiesList();
}

// Clear all opportunities
function clearOpportunities() {
    opportunities = [];
    updateOpportunitiesList();
    showNotification('Opportunities cleared', 'info');
}

// Export data to JSON
function exportData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        opportunities: opportunities,
        executedTrades: executedTrades,
        profitHistory: profitHistory,
        settings: {
            minProfit: document.getElementById('min-profit').value,
            maxGas: document.getElementById('max-gas').value,
            strategy: selectedStrategy
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `arbitrage_data_${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully', 'success');
}

// Update analytics
function updateAnalytics(opportunity) {
    // Track strategy performance
    if (!window.strategyAnalytics) {
        window.strategyAnalytics = {};
    }
    
    if (!window.strategyAnalytics[opportunity.strategy]) {
        window.strategyAnalytics[opportunity.strategy] = {
            count: 0,
            totalProfit: 0,
            avgProfit: 0,
            bestProfit: 0
        };
    }
    
    const analytics = window.strategyAnalytics[opportunity.strategy];
    analytics.count++;
    analytics.totalProfit += parseFloat(opportunity.profit);
    analytics.avgProfit = analytics.totalProfit / analytics.count;
    analytics.bestProfit = Math.max(analytics.bestProfit, parseFloat(opportunity.profit));
}

// Auto-start scanning on load (demo mode)
setTimeout(() => {
    startScanning();
    showNotification('Scanner auto-started. Press Ctrl+S to toggle', 'info');
}, 2000);

// Update stats periodically
setInterval(updateStats, 5000);

// Save settings periodically
setInterval(saveUserSettings, 30000);
