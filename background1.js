//Создаёт контекстное меню, обрабатывает напоминания
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'scheduleReminder') {
      setTimeout(async () => {
        const data = await chrome.storage.local.get('lastSaved');
        const { title, url } = data.lastSaved || {};
        if (title && url) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'ReMind',
            message: `Что ты запомнил о: ${title}?`,
            priority: 2
          });
        }
      }, 5 * 60 * 1000); // 5 минут
    }
  });
  
  // Добавляем пункт в контекстное меню при установке
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "save-to-remind",
      title: "Сохранить в ReMind",
      contexts: ["selection"]
    });
  });
  // При клике на пункт меню
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-to-remind" && info.selectionText) {
      const card = {
        id: crypto.randomUUID(),
        url: tab.url,
        title: tab.title,
        text: info.selectionText,
        createdAt: Date.now(),
        repeatStage: 0,
        nextRepeat: Date.now(), // сразу вспоминаем
      };
      chrome.storage.sync.get({ cards: [] }, (data) => {
        const updated = [card, ...data.cards];
        chrome.storage.sync.set({ cards: updated });
      });
    }
  });
  