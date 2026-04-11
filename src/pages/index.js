import "./index.css";

import logo from "../images/logo.svg";
import avatarDefault from "../images/avatar.jpg";
import pencil from "../images/pencil.svg";
import plus from "../images/plus.svg";

import Api from "../scripts/Api.js";
import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";


document.querySelector(".header__logo").src = logo;
document.querySelector(".profile__avatar").src = avatarDefault;
document.querySelector(".profile__edit-icon").src = pencil;
document.querySelector(".profile__add-icon").src = plus;


const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "1c835892-6444-4fe5-bb01-7b34d6d8b556",
    "Content-Type": "application/json",
  },
});


let activeModal = null;

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  activeModal = modal;
  document.addEventListener("keydown", onEscClose);
  modal.addEventListener("mousedown", onOverlayClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  activeModal = null;
  document.removeEventListener("keydown", onEscClose);
  modal.removeEventListener("mousedown", onOverlayClose);
}

function onEscClose(evt) {
  if (evt.key === "Escape" && activeModal) {
    closeModal(activeModal);
  }
}

function onOverlayClose(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}


const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileForm.querySelector("#profile-name-input");
const editProfileDescriptionInput = editProfileForm.querySelector(
  "#profile-description-input"
);

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const cardNameInput = newPostForm.querySelector("#card-description-input");
const cardLinkInput = newPostForm.querySelector("#card-image-input");
const newPostSubmitBtn = newPostForm.querySelector(".modal__submit-btn");

const avatarEditBtn = document.querySelector(".profile__avatar-edit-btn");
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarLinkInput = avatarForm.querySelector("#avatar-link-input");
const avatarSubmitBtn = avatarForm.querySelector(".modal__submit-btn");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardForm = deleteCardModal.querySelector(".modal__form");
const deleteCardSubmitBtn = deleteCardForm.querySelector(".modal__submit-btn");

const cardsList = document.querySelector(".cards__list");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");


let selectedCard = null;
let selectedCardId = null;


function renderLoading(button, isLoading, defaultText, loadingText) {
  button.textContent = isLoading ? loadingText : defaultText;
}


function setUserInfo({ name, about, avatar }) {
  profileNameEl.textContent = name;
  profileDescriptionEl.textContent = about;
  profileAvatarEl.src = avatar;
}


function createCardElement(cardData) {
  const cardElement = cardTemplate.cloneNode(true);

  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const likeBtn = cardElement.querySelector(".card__like-btn");
  const deleteBtn = cardElement.querySelector(".card__delete-btn");

  cardImageEl.src = cardData.link;
  cardImageEl.alt = cardData.name;
  cardTitleEl.textContent = cardData.name;

  if (cardData.isLiked) {
    likeBtn.classList.add("card__like-btn_active");
  }

 
  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = cardData.link;
    previewCaptionEl.textContent = cardData.name;
    openModal(previewModal);
  });


  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-btn_active");

    api
      .changeLikeStatus(cardData._id, isLiked)
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          likeBtn.classList.add("card__like-btn_active");
        } else {
          likeBtn.classList.remove("card__like-btn_active");
        }
      })
      .catch(console.error);
  });

  
  deleteBtn.addEventListener("click", () => {
    selectedCard = cardElement;
    selectedCardId = cardData._id;
    resetValidation(deleteCardForm, validationConfig);
    openModal(deleteCardModal);
  });

  return cardElement;
}


function renderInitialCards(cards) {
  cardsList.innerHTML = "";
  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    cardsList.append(cardElement);
  });
}



function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const submitBtn = editProfileForm.querySelector(".modal__submit-btn");
  renderLoading(submitBtn, true, "Save", "Saving...");

  api
    .updateUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((userData) => {
      setUserInfo(userData);
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(submitBtn, false, "Save", "Saving...");
    });
}


function handleNewPostSubmit(evt) {
  evt.preventDefault();

  renderLoading(newPostSubmitBtn, true, "Save", "Saving...");

  api
    .addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((newCard) => {
      const cardElement = createCardElement(newCard);
      cardsList.prepend(cardElement);
      newPostForm.reset();
      disableButton(newPostSubmitBtn, validationConfig);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(newPostSubmitBtn, false, "Save", "Saving...");
    });
}

function handleDeleteCardSubmit(evt) {
  evt.preventDefault();

  renderLoading(deleteCardSubmitBtn, true, "Yes, delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteCardModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(deleteCardSubmitBtn, false, "Yes, delete", "Deleting...");
    });
}

// Editar avatar
function handleAvatarSubmit(evt) {
  evt.preventDefault();

  renderLoading(avatarSubmitBtn, true, "Save", "Saving...");

  api
    .updateAvatar(avatarLinkInput.value)
    .then((userData) => {
      setUserInfo(userData);
      avatarForm.reset();
      disableButton(avatarSubmitBtn, validationConfig);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(avatarSubmitBtn, false, "Save", "Saving...");
    });
}


editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileForm, validationConfig);
  openModal(editProfileModal);
});

// Abrir nueva tarjeta
newPostBtn.addEventListener("click", () => {
  newPostForm.reset();
  disableButton(newPostSubmitBtn, validationConfig);
  resetValidation(newPostForm, validationConfig);
  openModal(newPostModal);
});


avatarEditBtn.addEventListener("click", () => {
  avatarForm.reset();
  disableButton(avatarSubmitBtn, validationConfig);
  resetValidation(avatarForm, validationConfig);
  openModal(avatarModal);
});

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
deleteCardForm.addEventListener("submit", handleDeleteCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);


document.querySelectorAll(".modal__close-btn").forEach((btn) => {
  const modal = btn.closest(".modal");
  btn.addEventListener("click", () => closeModal(modal));
});


enableValidation(validationConfig);


api
  .getAppInfo()
  .then(([userData, cards]) => {
    setUserInfo(userData);
    renderInitialCards(cards);
  })
  .catch(console.error);


