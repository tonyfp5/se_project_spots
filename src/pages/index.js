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

let userId = null;


let activeModal = null;

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  activeModal = modal;
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverlayClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  activeModal = null;
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverlayClose);
}

function handleEscClose(evt) {
  if (evt.key === "Escape" && activeModal) {
    closeModal(activeModal);
  }
}

function handleOverlayClose(evt) {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.currentTarget);
  }
}


const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(
  ".profile__description"
);
const profileAvatarEl = document.querySelector(".profile__avatar");


const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm =
  editProfileModal.querySelector(".modal__form");

const editProfileBtn = document.querySelector(
  ".profile__edit-button"
);

const editProfileNameInput =
  editProfileForm.querySelector("#profile-name-input");
const editProfileDescriptionInput =
  editProfileForm.querySelector("#profile-description-input");

const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");

const newPostBtn = document.querySelector(".profile__add-button");

const cardNameInput =
  newPostForm.querySelector("#card-description-input");
const cardLinkInput =
  newPostForm.querySelector("#card-image-input");

const newPostSubmitBtn =
  newPostForm.querySelector(".modal__submit-button");

const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");

const avatarEditBtn = document.querySelector(
  ".profile__avatar-edit-button"
);

const avatarLinkInput =
  avatarForm.querySelector("#avatar-link-input");

const avatarSubmitBtn =
  avatarForm.querySelector(".modal__submit-button");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl =
  previewModal.querySelector(".modal__image");
const previewCaptionEl =
  previewModal.querySelector(".modal__caption");

const deleteCardModal =
  document.querySelector("#delete-card-modal");
const deleteCardForm =
  deleteCardModal.querySelector(".modal__form");

const deleteCardSubmitBtn =
  deleteCardForm.querySelector(".modal__submit-button");


const cardsList = document.querySelector(".cards__list");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

let selectedCard = null;
let selectedCardId = null;



function renderLoading(button, isLoading, defaultText, loadingText) {
  button.textContent = isLoading ? loadingText : defaultText;
}

function setUserInfo({ name, about, avatar, _id }) {
  profileNameEl.textContent = name;
  profileDescriptionEl.textContent = about;
  profileAvatarEl.src = avatar;
  userId = _id;
}


function createCardElement(cardData) {
  const cardElement = cardTemplate.cloneNode(true);

  const cardImageEl =
    cardElement.querySelector(".card__image");
  const cardTitleEl =
    cardElement.querySelector(".card__title");
  const likeBtn =
    cardElement.querySelector(".card__like-button");
  const deleteBtn =
    cardElement.querySelector(".card__delete-button");

  cardImageEl.src = cardData.link;
  cardImageEl.alt = cardData.name;
  cardTitleEl.textContent = cardData.name;

  const isLiked = cardData.likes.some(
    (user) => user._id === userId
  );

  if (isLiked) {
    likeBtn.classList.add("card__like-button_active");
  }

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = cardData.link;
    previewImageEl.alt = cardData.name;
    previewCaptionEl.textContent = cardData.name;
    openModal(previewModal);
  });

  likeBtn.addEventListener("click", () => {
    const liked =
      likeBtn.classList.contains(
        "card__like-button_active"
      );

    api
      .changeLikeStatus(cardData._id, liked)
      .then((updatedCard) => {
        const newLiked = updatedCard.likes.some(
          (user) => user._id === userId
        );

        likeBtn.classList.toggle(
          "card__like-button_active",
          newLiked
        );
      })
      .catch(console.error);
  });

  if (cardData.owner._id !== userId) {
    deleteBtn.remove();
  } else {
    deleteBtn.addEventListener("click", () => {
      selectedCard = cardElement;
      selectedCardId = cardData._id;
      resetValidation(deleteCardForm, validationConfig);
      openModal(deleteCardModal);
    });
  }

  return cardElement;
}

function renderInitialCards(cards) {
  cardsList.innerHTML = "";
  cards.forEach((card) =>
    cardsList.append(createCardElement(card))
  );
}


function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const submitBtn =
    editProfileForm.querySelector(".modal__submit-button");

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
    .finally(() =>
      renderLoading(submitBtn, false, "Save", "Saving...")
    );
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
      cardsList.prepend(createCardElement(newCard));
      newPostForm.reset();
      disableButton(newPostSubmitBtn, validationConfig);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() =>
      renderLoading(newPostSubmitBtn, false, "Save", "Saving...")
    );
}

function handleDeleteCardSubmit(evt) {
  evt.preventDefault();

  renderLoading(
    deleteCardSubmitBtn,
    true,
    "Yes, delete",
    "Deleting..."
  );

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteCardModal);
    })
    .catch(console.error)
    .finally(() =>
      renderLoading(
        deleteCardSubmitBtn,
        false,
        "Yes, delete",
        "Deleting..."
      )
    );
}

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
    .finally(() =>
      renderLoading(avatarSubmitBtn, false, "Save", "Saving...")
    );
}


editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value =
    profileDescriptionEl.textContent;

  resetValidation(editProfileForm, validationConfig);
  openModal(editProfileModal);
});

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

editProfileForm.addEventListener(
  "submit",
  handleEditProfileSubmit
);

newPostForm.addEventListener(
  "submit",
  handleNewPostSubmit
);

deleteCardForm.addEventListener(
  "submit",
  handleDeleteCardSubmit
);

avatarForm.addEventListener("submit", handleAvatarSubmit);

document
  .querySelectorAll(".modal__close-button")
  .forEach((button) => {
    const modal = button.closest(".modal");
    button.addEventListener("click", () =>
      closeModal(modal)
    );
  });


enableValidation(validationConfig);


api
  .getAppInfo()
  .then(([userData, cards]) => {
    setUserInfo(userData);
    renderInitialCards(cards);
  })
  .catch(console.error);

