// Risk Management Module for Flash Loan Arbitrage
// Advanced risk assessment and portfolio management

class RiskManager {
    constructor(config) {
        this.config = config;
        this.riskMetrics = {
            var: 0, // Value at Risk
            sharpeRatio: 0,
            maxDrawdown: 0,
            currentExposure: 0,
            riskScore: 50
        };
        this.portfolio = new Portfolio();
        this.limits = new RiskLimits(config);
        this.alerts = [];
    }

    // Calculate overall risk score
    calculateRiskScore(opportunity) {
        let score = 50; // Base score
        
        // Factor 1: Profit vs Gas ratio
        const profitGasRatio = opportunity.profit / opportunity.gasCost;
        if (profitGasRatio > 10) score += 20;
        else if (profitGasRatio > 5) score += 10;
        else if (profitGasRatio < 2) score -= 20;
        
        // Factor 2: Success rate
        if (opportunity.successRate > 90) score += 15;
        else if (opportunity.successRate > 80) score += 5;
        else if (opportunity.successRate < 60) score -= 15;
        
        // Factor 3: Price impact
        if (opportunity.priceImpact < 0.1) score += 10;
        else if (opportunity.priceImpact > 1) score -= 20;
        
        // Factor 4: Confidence level
        score += (opportunity.confidence - 50) * 0.3;
        
        // Factor 5: Market conditions
        const marketRisk = this.assessMarketConditions();
        score -= marketRisk * 10;
        
        // Factor 6: Flash loan size
        const loanRisk = this.assessLoanSize(opportunity.flashLoanAmount);
        score -= loanRisk * 15;
        
        // Normalize to 0-100
        return Math.max(0, Math.min(100, score));
    }

    // Assess market conditions
    assessMarketConditions() {
        // Check volatility index
        const volatility = this.calculateVolatility();
        
        if (volatility > 50) return 0.8; // High risk
        if (volatility > 30) return 0.5; // Medium risk
        return 0.2; // Low risk
    }

    // Calculate market volatility
    calculateVolatility() {
        // Simplified volatility calculation
        return Math.random() * 60 + 10; // 10-70 range
    }

    // Assess loan size risk
    assessLoanSize(amount) {
        const maxSafeAmount = 1000000; // $1M
        
        if (amount > maxSafeAmount) return 1.0;
        return amount / maxSafeAmount;
    }

    // Value at Risk calculation
    calculateVaR(portfolio, confidence = 0.95, timeHorizon = 1) {
        const returns = portfolio.getHistoricalReturns();
        
        if (returns.length === 0) return 0;
        
        // Sort returns
        const sortedReturns = returns.sort((a, b) => a - b);
        
        // Calculate VaR at confidence level
        const index = Math.floor((1 - confidence) * sortedReturns.length);
        const var95 = Math.abs(sortedReturns[index] || 0);
        
        return var95 * Math.sqrt(timeHorizon);
    }

    // Sharpe Ratio calculation
    calculateSharpeRatio(returns, riskFreeRate = 0.02) {
        if (returns.length === 0) return 0;
        
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const excessReturn = avgReturn - riskFreeRate;
        
        // Calculate standard deviation
        const variance = returns.reduce((sum, r) => 
            sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        return stdDev === 0 ? 0 : excessReturn / stdDev;
    }

    // Maximum Drawdown calculation
    calculateMaxDrawdown(equityHistory) {
        if (equityHistory.length === 0) return 0;
        
        let maxDrawdown = 0;
        let peak = equityHistory[0];
        
        for (const value of equityHistory) {
            if (value > peak) {
                peak = value;
            }
            
            const drawdown = (peak - value) / peak;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        
        return maxDrawdown * 100; // Return as percentage
    }

    // Position sizing based on Kelly Criterion
    calculatePositionSize(winRate, avgWin, avgLoss) {
        if (avgLoss === 0) return 0;
        
        const b = avgWin / avgLoss;
        const p = winRate;
        const q = 1 - p;
        
        // Kelly formula: f = (p*b - q) / b
        const kelly = (p * b - q) / b;
        
        // Apply fractional Kelly (25%) for safety
        const fractionalKelly = kelly * 0.25;
        
        // Cap at 20% of portfolio
        return Math.min(Math.max(0, fractionalKelly), 0.2);
    }

    // Risk-adjusted return calculation
    calculateRiskAdjustedReturn(expectedReturn, risk) {
        // Using a simple risk adjustment factor
        const riskFactor = 1 - (risk / 100);
        return expectedReturn * riskFactor;
    }

    // Check if trade meets risk criteria
    validateTrade(opportunity) {
        const violations = [];
        
        // Check minimum profit
        if (opportunity.profit < this.limits.minProfit) {
            violations.push(`Profit ${opportunity.profit} below minimum ${this.limits.minProfit}`);
        }
        
        // Check maximum gas
        if (opportunity.gasCost > this.limits.maxGas) {
            violations.push(`Gas cost ${opportunity.gasCost} exceeds maximum ${this.limits.maxGas}`);
        }
        
        // Check risk score
        const riskScore = this.calculateRiskScore(opportunity);
        if (riskScore < this.limits.minRiskScore) {
            violations.push(`Risk score ${riskScore} below minimum ${this.limits.minRiskScore}`);
        }
        
        // Check daily limits
        if (this.portfolio.dailyTradeCount >= this.limits.maxDailyTrades) {
            violations.push(`Daily trade limit reached (${this.limits.maxDailyTrades})`);
        }
        
        // Check exposure limits
        if (this.portfolio.currentExposure + opportunity.flashLoanAmount > this.limits.maxExposure) {
            violations.push(`Would exceed maximum exposure of ${this.limits.maxExposure}`);
        }
        
        return {
            isValid: violations.length === 0,
            violations,
            riskScore
        };
    }

    // Generate risk alert
    generateAlert(type, message, severity = 'medium') {
        const alert = {
            id: Date.now(),
            type,
            message,
            severity,
            timestamp: new Date(),
            acknowledged: false
        };
        
        this.alerts.push(alert);
        this.emitAlert(alert);
        
        return alert;
    }

    // Check for risk conditions
    monitorRiskConditions() {
        // Check drawdown
        if (this.riskMetrics.maxDrawdown > 20) {
            this.generateAlert(
                'drawdown',
                `Maximum drawdown exceeded 20%: ${this.riskMetrics.maxDrawdown.toFixed(2)}%`,
                'high'
            );
        }
        
        // Check exposure
        if (this.portfolio.currentExposure > this.limits.maxExposure * 0.8) {
            this.generateAlert(
                'exposure',
                `Approaching maximum exposure limit: ${this.portfolio.currentExposure}`,
                'medium'
            );
        }
        
        // Check volatility
        const volatility = this.calculateVolatility();
        if (volatility > 50) {
            this.generateAlert(
                'volatility',
                `High market volatility detected: ${volatility.toFixed(1)}`,
                'high'
            );
        }
        
        // Check consecutive losses
        if (this.portfolio.consecutiveLosses > 3) {
            this.generateAlert(
                'losses',
                `${this.portfolio.consecutiveLosses} consecutive losses detected`,
                'high'
            );
        }
    }

    // Update risk metrics
    updateMetrics() {
        const returns = this.portfolio.getHistoricalReturns();
        const equityHistory = this.portfolio.getEquityHistory();
        
        this.riskMetrics = {
            var: this.calculateVaR(this.portfolio),
            sharpeRatio: this.calculateSharpeRatio(returns),
            maxDrawdown: this.calculateMaxDrawdown(equityHistory),
            currentExposure: this.portfolio.currentExposure,
            riskScore: this.portfolio.getAverageRiskScore()
        };
        
        // Monitor conditions
        this.monitorRiskConditions();
        
        return this.riskMetrics;
    }

    // Emit alert
    emitAlert(alert) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('riskAlert', {
                detail: alert
            }));
        }
    }

    // Get risk report
    generateReport() {
        return {
            timestamp: new Date(),
            metrics: this.riskMetrics,
            portfolio: this.portfolio.getSummary(),
            alerts: this.alerts.filter(a => !a.acknowledged),
            recommendations: this.generateRecommendations()
        };
    }

    // Generate recommendations
    generateRecommendations() {
        const recommendations = [];
        
        if (this.riskMetrics.sharpeRatio < 1) {
            recommendations.push({
                type: 'performance',
                message: 'Consider adjusting strategy parameters for better risk-adjusted returns'
            });
        }
        
        if (this.riskMetrics.maxDrawdown > 15) {
            recommendations.push({
                type: 'risk',
                message: 'Reduce position sizes to minimize drawdown risk'
            });
        }
        
        if (this.portfolio.winRate < 0.5) {
            recommendations.push({
                type: 'strategy',
                message: 'Review and optimize trading strategy selection criteria'
            });
        }
        
        return recommendations;
    }
}

// Portfolio management class
class Portfolio {
    constructor() {
        this.positions = [];
        this.trades = [];
        this.equityHistory = [10000]; // Starting with $10,000
        this.currentEquity = 10000;
        this.currentExposure = 0;
        this.dailyTradeCount = 0;
        this.consecutiveLosses = 0;
        this.lastResetDate = new Date();
    }

    // Add trade to portfolio
    addTrade(trade) {
        this.trades.push(trade);
        
        // Update equity
        this.currentEquity += trade.profit;
        this.equityHistory.push(this.currentEquity);
        
        // Update statistics
        this.dailyTradeCount++;
        
        if (trade.profit < 0) {
            this.consecutiveLosses++;
        } else {
            this.consecutiveLosses = 0;
        }
        
        // Reset daily counter if needed
        const today = new Date();
        if (today.toDateString() !== this.lastResetDate.toDateString()) {
            this.dailyTradeCount = 0;
            this.lastResetDate = today;
        }
    }

    // Get historical returns
    getHistoricalReturns() {
        const returns = [];
        
        for (let i = 1; i < this.equityHistory.length; i++) {
            const dailyReturn = (this.equityHistory[i] - this.equityHistory[i-1]) / 
                               this.equityHistory[i-1];
            returns.push(dailyReturn);
        }
        
        return returns;
    }

    // Get equity history
    getEquityHistory() {
        return this.equityHistory;
    }

    // Get win rate
    get winRate() {
        if (this.trades.length === 0) return 0;
        
        const wins = this.trades.filter(t => t.profit > 0).length;
        return wins / this.trades.length;
    }

    // Get average risk score
    getAverageRiskScore() {
        if (this.trades.length === 0) return 50;
        
        const totalScore = this.trades.reduce((sum, t) => sum + (t.riskScore || 50), 0);
        return totalScore / this.trades.length;
    }

    // Get portfolio summary
    getSummary() {
        const profitableTrades = this.trades.filter(t => t.profit > 0);
        const losingTrades = this.trades.filter(t => t.profit < 0);
        
        return {
            totalTrades: this.trades.length,
            winRate: this.winRate,
            currentEquity: this.currentEquity,
            totalProfit: this.currentEquity - 10000,
            avgWin: profitableTrades.length > 0 ? 
                profitableTrades.reduce((sum, t) => sum + t.profit, 0) / profitableTrades.length : 0,
            avgLoss: losingTrades.length > 0 ?
                Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length) : 0,
            largestWin: Math.max(...this.trades.map(t => t.profit), 0),
            largestLoss: Math.min(...this.trades.map(t => t.profit), 0),
            currentExposure: this.currentExposure,
            consecutiveLosses: this.consecutiveLosses
        };
    }
}

// Risk limits configuration
class RiskLimits {
    constructor(config) {
        this.minProfit = config.trading?.minProfit || 100;
        this.maxGas = config.trading?.maxGas || 150;
        this.maxExposure = 1000000; // $1M maximum exposure
        this.maxDailyTrades = config.trading?.autoExecute?.maxDailyTrades || 50;
        this.minRiskScore = 30; // Minimum acceptable risk score
        this.maxSlippage = config.trading?.slippage || 1;
        this.maxDrawdown = 25; // Maximum 25% drawdown
        this.stopLoss = 0.05; // 5% stop loss per trade
        this.takeProfit = 0.20; // 20% take profit
    }

    // Update limits dynamically
    updateLimits(updates) {
        Object.assign(this, updates);
    }

    // Get current limits
    getLimits() {
        return {
            minProfit: this.minProfit,
            maxGas: this.maxGas,
            maxExposure: this.maxExposure,
            maxDailyTrades: this.maxDailyTrades,
            minRiskScore: this.minRiskScore,
            maxSlippage: this.maxSlippage,
            maxDrawdown: this.maxDrawdown,
            stopLoss: this.stopLoss,
            takeProfit: this.takeProfit
        };
    }
}

// Hedging strategies
class HedgingStrategy {
    constructor(riskManager) {
        this.riskManager = riskManager;
    }

    // Delta neutral hedging
    calculateDeltaNeutralHedge(position) {
        // Calculate required hedge amount to maintain delta neutrality
        const delta = this.calculateDelta(position);
        const hedgeAmount = -position.amount * delta;
        
        return {
            type: 'delta_neutral',
            hedgeAmount,
            hedgeToken: position.token,
            cost: Math.abs(hedgeAmount) * 0.001 // 0.1% hedging cost
        };
    }

    // Calculate option delta (simplified)
    calculateDelta(position) {
        // Simplified delta calculation
        return 0.5 + (Math.random() - 0.5) * 0.3;
    }

    // Protective put strategy
    calculateProtectivePut(position, strikePrice) {
        const putPremium = this.calculatePutPremium(position.price, strikePrice);
        
        return {
            type: 'protective_put',
            strikePrice,
            premium: putPremium,
            maxLoss: putPremium,
            breakeven: position.price + putPremium
        };
    }

    // Calculate put option premium (Black-Scholes simplified)
    calculatePutPremium(spotPrice, strikePrice) {
        const timeToExpiry = 1/365; // 1 day
        const volatility = 0.5; // 50% annual volatility
        const riskFreeRate = 0.02;
        
        // Simplified premium calculation
        const moneyness = strikePrice / spotPrice;
        const basePremium = spotPrice * volatility * Math.sqrt(timeToExpiry);
        
        return basePremium * moneyness * 0.1;
    }
}

// Initialize Risk Manager
let riskManager;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        
        // Create risk manager
        riskManager = new RiskManager(config);
        
        // Start monitoring
        setInterval(() => {
            riskManager.updateMetrics();
        }, 10000); // Update every 10 seconds
        
        console.log('Risk Manager initialized');
        
        // Expose globally
        window.riskManager = riskManager;
        
    } catch (error) {
        console.error('Failed to initialize Risk Manager:', error);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiskManager, Portfolio, RiskLimits, HedgingStrategy };
}
