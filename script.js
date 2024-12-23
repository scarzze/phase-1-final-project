const apiURL = "https://www.okx.com/api/v5/market/tickers?instType=SPOT";

// Select DOM elements
const cryptoContainer = document.getElementById("crypto-container");
const searchInput = document.getElementById("search");

// Store alert conditions and favorites
const alertConditions = {};
let favoriteCryptos = JSON.parse(localStorage.getItem("favoriteCryptos")) || [];

// Fetch crypto data
async function fetchCryptoData() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const tickers = data.data || [];
        displayCryptoData(tickers);
        checkAlerts(tickers);
    } catch (error) {
        console.error("Error fetching crypto data:", error);
    }
}

// Display only favorites, top 20 cryptos, and make the rest searchable
function displayCryptoData(tickers) {
    cryptoContainer.innerHTML = ""; // Clear existing content

    // Sort the tickers by price
    const sortedTickers = tickers.sort((a, b) => parseFloat(b.last) - parseFloat(a.last));

    // Separate favorites
    const favoriteTickerData = sortedTickers.filter(ticker => favoriteCryptos.includes(ticker.instId));
    const nonFavoriteTickers = sortedTickers.filter(ticker => !favoriteCryptos.includes(ticker.instId));

    // Top 20 non-favorites
    const topCryptos = nonFavoriteTickers.slice(0, 20);
    const remainingCryptos = nonFavoriteTickers.slice(20);

    // Combine favorites, top 20, and remaining cryptos
    const allCryptos = favoriteTickerData.concat(topCryptos, remainingCryptos);

    allCryptos.forEach(ticker => {
        const symbol = ticker.instId; // eg btc-usdt
        const price = parseFloat(ticker.last);
        const isFavorite = favoriteCryptos.includes(symbol);
        const card = document.createElement("div");
        card.className = "crypto-card";
        card.innerHTML = `
            <h2>${symbol}</h2>
            <p>Price: $${price.toLocaleString()}</p>
            <div class="alert-form">
                <input type="number" id="alert-${symbol}" placeholder="Set price alert...">
                <button onclick="setAlert('${symbol}', ${price})">Set Alert</button>
            </div>
            <button class="favorite-btn" onclick="toggleFavorite('${symbol}')">
                ${isFavorite ? "★ Remove Favorite" : "☆ Add to Favorites"}
            </button>
        `;
        cryptoContainer.appendChild(card);
    });
}

// Set a price alert for a cryptocurrency
function setAlert(crypto, currentPrice) {
    const input = document.getElementById(`alert-${crypto}`);
    const alertPrice = parseFloat(input.value);
    if (isNaN(alertPrice)) {
        alert("Please enter a valid price.");
        return;
    }
    alertConditions[crypto] = alertPrice;
    alert(`Alert set for ${crypto} at $${alertPrice.toLocaleString()}`);
}

// Check alerts against current prices
function checkAlerts(tickers) {
    tickers.forEach(ticker => {
        const symbol = ticker.instId;
        const currentPrice = parseFloat(ticker.last);
        const alertPrice = alertConditions[symbol];
        if (alertPrice && currentPrice >= alertPrice) {
            playBeepSound(); // Play the beep sound when the alert triggers
            alert(`🚨 ${symbol} has reached $${currentPrice.toLocaleString()}!`);
            delete alertConditions[symbol]; // Remove the alert once triggered
        }
    });
}

// Function to play the beep sound
function playBeepSound() {
    const beepSound = document.getElementById("beep-sound");
    beepSound.play();
}

// Toggle favorite status for crypto
function toggleFavorite(crypto) {
    if (favoriteCryptos.includes(crypto)) {
        favoriteCryptos = favoriteCryptos.filter(fav => fav !== crypto);
        alert(`${crypto} removed from favorites.`);
    } else {
        favoriteCryptos.push(crypto);
        alert(`${crypto} added to favorites.`);
    }
    localStorage.setItem("favoriteCryptos", JSON.stringify(favoriteCryptos));
    fetchCryptoData(); // Refresh the UI
}

// Filter cryptos based on search input
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".crypto-card");
    cards.forEach(card => {
        const title = card.querySelector("h2").textContent.toLowerCase();
        card.style.display = title.includes(query) ? "block" : "none";
    });
});

// refresh data every 30 seconds
setInterval(fetchCryptoData, 30000);

// fetch data for the first time
fetchCryptoData();
