const userInput = document.getElementById("search-player-input");
userInput.addEventListener("input", (event) => {
    const inputText = event.target.value.toLowerCase();
    console.log(inputText);
    
        const playerCards = document.querySelectorAll(".player-cards");
        playerCards.forEach(card => {
            const playerName = card.querySelector(".card-title").textContent.toLowerCase();
    
            if (playerName.includes(inputText)) {
                console.log(playerName);
                card.classList.remove("d-none");
            } else {
                card.classList.add("d-none"); 
            }
    });
});