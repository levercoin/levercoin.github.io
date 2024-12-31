document.addEventListener('DOMContentLoaded', () => {
    console.log('Levcoin website loaded successfully!');
    
    const devTokenAmount = 51_100_000;
    const devRugProceeds = 7;
    const dexUrl = "https://api.dexscreener.com/latest/dex/pairs/solana/57kbsu4Uj6KazfYVKDhyexDcLvovzxXVHpRsJXJm7weQ";
    const targetMissedRevenue = 777_000_000;

    const profitAmountEl = document.getElementById("profit-amount");
    const overlayEl = document.getElementById("overlay");

    async function fetchPrice() {
        try {
            const response = await fetch(dexUrl);
            if (!response.ok) {
                throw new Error(`Error fetching price: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log("DexScreener response:", data);

            const priceUsd = data?.pairs?.[0]?.priceUsd || data?.pair?.priceUsd;
            if (!priceUsd) {
                throw new Error("Price not found in DexScreener response.");
            }

            return parseFloat(priceUsd);
        } catch (error) {
            console.error("Failed to fetch price:", error);
            profitAmountEl.textContent = "Error fetching price.";
            return null;
        }
    }

    function calculateMissedRevenue(price) {
        const totalValue = price * devTokenAmount;
        return totalValue - devRugProceeds;
    }

    async function updateMissedRevenue() {
        const price = await fetchPrice();
        if (price !== null) {
            const missed = calculateMissedRevenue(price);

            profitAmountEl.textContent = `$${missed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

            updateProgressBar(missed);

            overlayEl.classList.add('shake');
            setTimeout(() => {
                overlayEl.classList.remove('shake');
            }, 300);
        }
    }

    function updateProgressBar(missedRevenue) {
        const progressBarContainer = document.getElementById('progress-bar-container');
        if (progressBarContainer) {
            const progressBar = progressBarContainer.querySelector('.progress-bar');
            
            const progressPercentage = Math.min((missedRevenue / targetMissedRevenue) * 100, 100);

            if (progressBar) {
                progressBar.style.width = `${progressPercentage}%`;
                progressBar.setAttribute('aria-valuenow', progressPercentage);
                
                if (progressPercentage < 33) {
                    progressBar.classList.remove('bg-warning', 'bg-danger');
                    progressBar.classList.add('bg-success');
                } else if (progressPercentage < 66) {
                    progressBar.classList.remove('bg-success', 'bg-danger');
                    progressBar.classList.add('bg-warning');
                } else {
                    progressBar.classList.remove('bg-success', 'bg-warning');
                    progressBar.classList.add('bg-danger');
                }
            }
        }
    }

    updateMissedRevenue();

    setInterval(updateMissedRevenue, 5000);
});

