import { getCards, updateCard, deleteCard } from "../utils/storage.js";
const container = document.getElementById("cards-container");
const template = document.getElementById("card-template");
function formatDate(ms) {
  return new Date(ms).toLocaleString();
}
(async () => {
  const cards = await getCards();
  cards.sort((a, b) => b.createdAt - a.createdAt); // от новых к старым
  cards.forEach(card => {
    const node = template.content.cloneNode(true);
    const url = node.querySelector(".url");
    const text = node.querySelector(".text");
    const info = node.querySelector(".info");
    const learnedBtn = node.querySelector(".learned");
    const repeatBtn = node.querySelector(".repeat-again");
    const deleteBtn = node.querySelector(".delete");
    const progressScale = node.querySelector(".scale");
    url.textContent = card.title;
    url.href = card.url;
    text.textContent = card.text;
    progressScale.value = card.repeatStage;
    if (card.repeatStage === 6) {
        info.textContent = `Repeat: ${card.repeatStage}/6`;
      } else {
        info.textContent = `Repeat: ${card.repeatStage}/6, Next: ${formatDate(card.nextRepeat)}`;
      }
    //info.textContent = `Repeat: ${card.repeatStage}/6, Next: ${formatDate(card.nextRepeat)}`;
    learnedBtn.addEventListener("click", async () => {
      await updateCard(card.id, { repeatStage: 6 }); // считается выученным
      location.reload();
    });

    repeatBtn.addEventListener("click", async () => {
      await updateCard(card.id, {
        repeatStage: 0,
        nextRepeat: Date.now()
      });
      location.reload();
    });
  
    deleteBtn.addEventListener("click", async () => {
      await deleteCard(card.id);
      location.reload();
    });


    container.appendChild(node);
  });
})();
