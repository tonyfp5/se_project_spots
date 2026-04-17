import { openPopup } from "./popup.js";

export function createCard(data, userId, handleLike, handleDelete, handlePreview) {
  const template = document.querySelector("#card-template").content;
  const cardElement = template.querySelector(".card").cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  likeCount.textContent = data.likes.length;


  if (data.likes.some((like) => like._id === userId)) {
    likeButton.classList.add("card__like-button_active");
  }

  likeButton.addEventListener("click", () => handleLike(data, likeButton, likeCount));

  if (data.owner._id !== userId) {
    deleteButton.style.display = "none";
  } else {
    deleteButton.addEventListener("click", () => handleDelete(data._id, cardElement));
  }

  cardImage.addEventListener("click", () => handlePreview(data));

  return cardElement;
}
