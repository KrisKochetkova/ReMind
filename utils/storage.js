export async function getCards() {
    return new Promise(resolve => {
      chrome.storage.sync.get({ cards: [] }, (result) => {
        resolve(result.cards);
      });
    });
  }
  export async function saveCards(cards) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ cards }, () => {
        resolve();
      });
    });
  }
  export async function addCard(card) {
    const cards = await getCards();
    cards.push(card);
    await saveCards(cards);
  }
  export async function updateCard(id, updates) {
    const cards = await getCards();
    const updatedCards = cards.map(card => {
      return card.id === id ? { ...card, ...updates } : card;
    });
    await saveCards(updatedCards);
  }
  export async function deleteCard(id) {
    const cards = await getCards();
    const updated = cards.filter(card => card.id !== id);
    await saveCards(updated);
  }
  
  