import "./index.css";
import  {setButtonText} from "../Utils/utils.js";
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
  modal.addEventListener("click", handleOverlayClose);
}


function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  activeModal = null;
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("click", handleOverlayClose);
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
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

function setUserInfo({ name, about, avatar, _id }) {
  profileNameEl.textContent = name;
  profileDescriptionEl.textContent = about;
  profileAvatarEl.src = avatar;
  userId = _id;
}


const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");

const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");

const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardForm = deleteCardModal.querySelector(".modal__form");


const editProfileBtn = document.querySelector(".profile__edit-button");
const newPostBtn = document.querySelector(".profile__add-button");
const avatarEditBtn = document.querySelector(".profile__avatar-edit-button");


const nameInput = document.querySelector("#profile-name-input");
const aboutInput = document.querySelector("#profile-description-input");

const cardNameInput = document.querySelector("#card-description-input");
const cardLinkInput = document.querySelector("#card-image-input");

const avatarInput = document.querySelector("#avatar-link-input");

const deleteCancelButton = deleteCardModal.querySelector(".modal__cancel-button");
deleteCancelButton.addEventListener("click", () => {
  closeModal(deleteCardModal);
});

const deleteConfirmButton = deleteCardModal.querySelector(".modal__delete-button");
deleteConfirmButton.addEventListener("click", () => {
  api.deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteCardModal);
    })
    .catch(console.error);
});


const cardsList = document.querySelector(".cards__list");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

let selectedCard = null;
let selectedCardId = null;



function createCardElement(cardData) {
  const cardElement = cardTemplate.cloneNode(true);

  const image = cardElement.querySelector(".card__image");
  const title = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  image.src = cardData.link;
  image.alt = cardData.name;
  title.textContent = cardData.name;





  if (cardData.isLiked) {
    likeButton.classList.add("card__like-button_active");
  }


  likeButton.addEventListener("click", () => {
    const liked = likeButton.classList.contains(
      "card__like-button_active"
    );

    api.changeLikeStatus(cardData._id, liked)
      .then(() => {

        likeButton.classList.toggle(
          "card__like-button_active"
        );
      })
      .catch(console.error);
  });


  image.addEventListener("click", () => {
    previewImageEl.src = cardData.link;
    previewImageEl.alt = cardData.name;
    previewCaptionEl.textContent = cardData.name;
    openModal(previewModal);
  });

 
    deleteButton.addEventListener("click", () => {
      selectedCard = cardElement;
      selectedCardId = cardData._id;
      openModal(deleteCardModal);
    });

  return cardElement;
}

function renderCards(cards) {
  cardsList.innerHTML = "";
  cards.forEach((card) =>
    cardsList.append(createCardElement(card))
  );
}


editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const button = evt.submitter;

  renderLoading(button, true, "Saving...", "Save");

  api.updateUserInfo({
    name: nameInput.value,
    about: aboutInput.value,
  })
    .then((data) => {
      setUserInfo(data);
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(button, false, "Saving...", "Save");
    });
});


newPostForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const button = evt.submitter;

  renderLoading(button, true, "Saving...", "Save");

  api.addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((card) => {
      cardsList.prepend(createCardElement(card));
      newPostForm.reset();
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(button, false, "Saving...", "Save");
    });
});

avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const button = evt.submitter;

  renderLoading(button, true, "Saving...", "Save");

  api.updateAvatar(avatarInput.value)
    .then((data) => {
      setUserInfo(data);
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(button, false, "Saving...", "Save");
    });
});


deleteCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const button = evt.submitter;

  renderLoading(button, true, "Deleting...", "Delete");

  api.deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteCardModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(button, false, "Deleting...", "Delete");
    });
});


editProfileBtn.addEventListener("click", () => {
  nameInput.value = profileNameEl.textContent;
  aboutInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileForm, validationConfig);
  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  newPostForm.reset();
  resetValidation(newPostForm, validationConfig);
  openModal(newPostModal);
});

avatarEditBtn.addEventListener("click", () => {
  avatarForm.reset();
  resetValidation(avatarForm, validationConfig);
  openModal(avatarModal);
});


document
  .querySelectorAll(".modal__close-button")
  .forEach((btn) => {
    const modal = btn.closest(".modal");
    btn.addEventListener("click", () =>
      closeModal(modal)
    );
  });


enableValidation(validationConfig);


api.getAppInfo()
  .then(([userData, cards]) => {
    setUserInfo(userData);
    renderCards(cards);
  })
  .catch(console.error);



function renderLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;
  button.textContent = isLoading ? loadingText : defaultText;
}