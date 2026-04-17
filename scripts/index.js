import "./index.css";
import Api from "./Api.js";
import { openPopup, closePopup } from "./popup.js";
import { createCard } from "./card.js";
import { enableValidation, resetValidation, validationConfig } from "./validation.js";



const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1/web_es_11",
  headers: {
    authorization: "722403d1-8d4a-4472-9e05-c73ebe492bb8" ,
    "Content-Type": "application/json",
  },
});


const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");


const editProfileButton = document.querySelector(".profile__edit-button");
const editProfilePopup = document.querySelector(".popup_type_edit-profile");
const editProfileForm = editProfilePopup.querySelector(".popup__form");
const nameInput = editProfileForm.querySelector("input[name='name']");
const aboutInput = editProfileForm.querySelector("input[name='about']");


const avatarButton = document.querySelector(".profile__avatar-edit-button");
const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector("input[name='avatar']");


const newPostButton = document.querySelector(".profile__add-button");
const newPostPopup = document.querySelector(".popup_type_new-post");
const newPostForm = newPostPopup.querySelector(".popup__form");


const previewPopup = document.querySelector(".popup_type_preview");
const previewImage = previewPopup.querySelector(".popup__preview-image");
const previewCaption = previewPopup.querySelector(".popup__preview-caption");


const confirmPopup = document.querySelector(".popup_type_confirm");
const confirmForm = confirmPopup.querySelector(".popup__form_type_confirm");


const cardsList = document.querySelector(".cards__list");

let userId = null;
let cardToDelete = null;


api.getAppInfo()
  .then(([userData, cards]) => {
    userId = userData._id;

    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.src = userData.avatar;

    cards.reverse().forEach((card) => {
      cardsList.append(
        createCard(
          card,
          userId,
          handleLike,
          openConfirmDelete,
          openPreview
        )
      );
    });
  })
  .catch(console.error);


editProfileButton.addEventListener("click", () => {
  nameInput.value = profileName.textContent;
  aboutInput.value = profileDescription.textContent;

  resetValidation(editProfileForm, validationConfig);
  openPopup(editProfilePopup);
});

editProfileForm.addEventListener("submit", () => {
  api.updateUserInfo({
    name: nameInput.value,
    about: aboutInput.value,
  })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closePopup(editProfilePopup);
    })
    .catch(console.error);
});

avatarButton.addEventListener("click", () => {
  avatarForm.reset();
  resetValidation(avatarForm, validationConfig);
  openPopup(avatarPopup);
});

avatarForm.addEventListener("submit", () => {
  api.updateAvatar(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closePopup(avatarPopup);
    })
    .catch(console.error);
});

newPostButton.addEventListener("click", () => {
  newPostForm.reset();
  resetValidation(newPostForm, validationConfig);
  openPopup(newPostPopup);
});

newPostForm.addEventListener("submit", () => {
  const name = newPostForm.querySelector("input[name='name']").value;
  const link = newPostForm.querySelector("input[name='link']").value;

  api.addCard({ name, link })
    .then((card) => {
      cardsList.prepend(
        createCard(
          card,
          userId,
          handleLike,
          openConfirmDelete,
          openPreview
        )
      );
      closePopup(newPostPopup);
    })
    .catch(console.error);
});

function handleLike(card, likeButton, likeCount) {
  const isLiked = likeButton.classList.contains("card__like-button_active");

  api.changeLikeStatus(card._id, isLiked)
    .then((updated) => {
      likeCount.textContent = updated.likes.length;
      likeButton.classList.toggle("card__like-button_active");
    })
    .catch(console.error);
}

function openConfirmDelete(cardId, cardElement) {
  cardToDelete = { cardId, cardElement };
  openPopup(confirmPopup);
}

confirmForm.addEventListener("submit", () => {
  api.deleteCard(cardToDelete.cardId)
    .then(() => {
      cardToDelete.cardElement.remove();
      closePopup(confirmPopup);
    })
    .catch(console.error);
});

function openPreview(card) {
  previewImage.src = card.link;
  previewImage.alt = card.name;
  previewCaption.textContent = card.name;
  openPopup(previewPopup);
}


enableValidation(validationConfig);
