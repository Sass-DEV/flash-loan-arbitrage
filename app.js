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
            const address = accounts[0];
            const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
            
            showNotification('Wallet connected successfully!', 'success');
            console.log('Connected:', address);
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

// Find Arbitrage Opportunities (Simulated)
function findArbitrageOpportunities() {
    const minProfit = parseFloat(document.getElementById('min-profit').value) || 100;
    const maxGas = parseFloat(document.getElementById('max-gas').value) || 150;
    
    // Simulate finding opportunities with various parameters
    const pairs = [
        { from: 'WETH', to: 'USDC', via: 'WETH' },
        { from: 'DAI', to: 'USDT', via: 'DAI' },
        { from: 'WBTC', to: 'WETH', via: 'WBTC' },
        { from: 'USDC', to: 'DAI', via: 'USDC' },
        { from: 'MATIC', to: 'USDC', via: 'MATIC' }
    ];
    
    const dexRoutes = [
        ['Uniswap V3', 'SushiSwap', 'Uniswap V3'],
        ['Curve', 'Balancer', 'Curve'],
        ['Balancer', 'Uniswap V2', 'SushiSwap'],
        ['1inch', 'Curve', 'Balancer']
    ];
    
    // Random opportunity generation
    if (Math.random() > 0.6) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const route = dexRoutes[Math.floor(Math.random() * dexRoutes.length)];
        const profit = Math.random() * 2000 + 50;
        
        if (profit >= minProfit && currentGasPrice <= maxGas) {
            const opportunity = {
                id: Date.now(),
                pair: `${pair.from} → ${pair.to} → ${pair.via}`,
                route: route.join(' → '),
                profit: profit.toFixed(2),
                flashLoanAmount: (Math.random() * 50 + 5).toFixed(2),
                gasCost: (currentGasPrice * 0.45).toFixed(2),
                priceImpact: (Math.random() * 0.5).toFixed(2),
                successRate: Math.floor(Math.random() * 30 + 70),
                timestamp: new Date(),
                isProfitable: profit > 500
            };
            
            opportunities.unshift(opportunity);
            
            // Keep only last 20 opportunities
            if (opportunities.length > 20) {
                opportunities.pop();
            }
            
            // Update counter
            updateOpportunityCount();
        }
    }
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

// Update Statistics
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
    
    // Update gas price
    currentGasPrice = Math.floor(Math.random() * 50 + 20);
    document.getElementById('gas-price').textContent = currentGasPrice;
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

// Auto-start scanning on load (demo mode)
setTimeout(() => {
    startScanning();
}, 2000);

// Update stats periodically
setInterval(updateStats, 10000);
