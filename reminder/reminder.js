chrome.storage.sync.get({ cards: [] }, ({ cards }) => {
    const now = Date.now();
    const nextCard = cards.find(c => c.nextRepeat <= now);
    if (!nextCard) {
      document.getElementById('reminder').innerHTML = '<p>Нет карточек для повторения 💤</p>';
      return;
    }
    document.getElementById('text').textContent = nextCard.text;
    const link = document.getElementById('link');
    link.textContent = nextCard.title;
    link.href = nextCard.url;
    document.getElementById('remember').onclick = () => {
      const intervals = [
        1 * 24 * 60 * 60 * 1000,  // 1 день
        3 * 24 * 60 * 60 * 1000,  // 3 дня
        7 * 24 * 60 * 60 * 1000,  // 1 неделя
        21 * 24 * 60 * 60 * 1000, // 3 недели
        60 * 24 * 60 * 60 * 1000  // 2 месяца
      ];
      const updated = cards.map(card => {
        if (card.id === nextCard.id) {
          const nextRepeat = Date.now() + intervals[card.repeatStage] || Infinity;
          return {
            ...card,
            repeatStage: card.repeatStage + 1,
            nextRepeat
          };
        }
        return card;
      });
      chrome.storage.sync.set({ cards: updated }, () => window.close());
    };
    document.getElementById('later').onclick = () => {
      const updated = cards.map(card => {
        if (card.id === nextCard.id) {
          return {
            ...card,
            nextRepeat: Date.now() + 5 * 60 * 1000 // отложить на 5 минут
          };
        }
        return card;
      });
      chrome.storage.sync.set({ cards: updated }, () => window.close());
    };
  });
  