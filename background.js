console.log('server running')

const REPEAT_INTERVALS = [
    5 * 60 * 1000,                   // 5 минут
    1 * 24 * 60 * 60 * 1000,      // 1 день
    3 * 24 * 60 * 60 * 1000,      // 3 дня
    7 * 24 * 60 * 60 * 1000,      // 1 неделя
    21 * 24 * 60 * 60 * 1000,     // 3 недели
    60 * 24 * 60 * 60 * 1000      // 2 месяца
  ];
  // ▶ Установка: контекстное меню + alarm
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "save-to-remind",
      title: "Save to ReMind",
      contexts: ["selection"]
    });
    chrome.alarms.create('checkReminders', { periodInMinutes: 1 }); // каждые 6 секунд
  });
  // ▶ Клик по пункту контекстного меню
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-to-remind" && info.selectionText) {
      const card = {
        id: crypto.randomUUID(),
        url: tab.url,
        title: tab.title,
        text: info.selectionText,
        createdAt: Date.now(),
        repeatStage: 0,
        nextRepeat: Date.now() + REPEAT_INTERVALS[0]
      };
      chrome.storage.sync.get({ cards: [] }, (data) => {
        const updated = [card, ...data.cards];
        chrome.storage.sync.set({ cards: updated });
      });
    }
  });
  // ▶ Сообщение от popup → сохранить вручную
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'saveSelection') {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const card = {
          id: crypto.randomUUID(),
          url: tab.url,
          title: tab.title,
          text: msg.text,
          createdAt: Date.now(),
          repeatStage: 0,
          nextRepeat: Date.now() + REPEAT_INTERVALS[0]
        };
        chrome.storage.sync.get({ cards: [] }, (data) => {
          const updated = [card, ...data.cards];
          chrome.storage.sync.set({ cards: updated });
        });
      });
    }
  });
  // ▶ Повторная проверка карточек и уведомление
  chrome.alarms.onAlarm.addListener(() => {
    chrome.storage.sync.get({ cards: [] }, (data) => {
      const now = Date.now();
      const updated = data.cards.map((card) => {
        if (card.repeatStage < REPEAT_INTERVALS.length && now >= card.nextRepeat) {
          // ❗ Уведомление должно быть видно всегда
          chrome.notifications.create(card.id, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'ReMind',
            message: `What you know about: ${card.title}?`,
            priority: 2
          });
          // Увеличиваем стадию и задаём следующее напоминание
          const nextStage = card.repeatStage + 1;
          const nextTime = now + (REPEAT_INTERVALS[nextStage] || 0);
          return {
            ...card,
            repeatStage: nextStage,
            nextRepeat: nextTime
          };
        }
        return card;
      });
      chrome.storage.sync.set({ cards: updated });
    });
  });
  
