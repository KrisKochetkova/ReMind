// Получаем выделенный текст со страницы

function getSelectedTextFromTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const url = tab.url || "";
        if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
          resolve("Unable to retrieve text from this page.");
          return;
        }
        chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: () => window.getSelection().toString(),
            },
            (results) => {
              if (chrome.runtime.lastError) {
                console.warn("Error accessing content:", chrome.runtime.lastError.message);
                resolve("Unable to retrieve text from this page.");
                return;
              }
              resolve(results[0]?.result || "");
            }
          );
      });
    });
  }
  // Генератор UUID для карточек
  function generateId() {
    return crypto.randomUUID();
  }
  // Расчёт следующей даты повторения (0 — сразу)
  function getNextRepeatDate(stage) {
    const now = Date.now();
    const delays = [0, 1, 3, 7, 21, 45]; // в днях
    return now + delays[stage] * 24 * 60 * 60 * 1000;
  }
  document.addEventListener("DOMContentLoaded", async () => {
    const textElement = document.getElementById("selected-text");
    const saveBtn = document.getElementById("save-btn");
    const manageBtn = document.getElementById("manage-btn"); // добавляем
  
    const selectedText = await getSelectedTextFromTab();
    textElement.textContent = selectedText || "Select text before saving.";
  
    saveBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        const card = {
          id: generateId(),
          url: tab.url,
          title: tab.title,
          text: selectedText || null,
          createdAt: Date.now(),
          repeatStage: 0,
          nextRepeat: getNextRepeatDate(0),
        };
        chrome.storage.sync.get({ cards: [] }, (data) => {
          const updatedCards = [card, ...data.cards];
          chrome.storage.sync.set({ cards: updatedCards }, () => {
            saveBtn.textContent = "SAVED!";
            saveBtn.disabled = true;
          });
        });
      });
    });
  
    manageBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("manage/manage.html") });
    });
  });
  