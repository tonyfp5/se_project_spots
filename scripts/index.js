const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileMoldal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileMoldal.querySelector(".modal__close-btn");


editProfileBtn.addEventListener("click", function () {editProfileMoldal.classList.add("modal_is-opened");
});

editProfileCloseBtn.addEventListener("click", function () { editProfileMoldal.classList.remove("modal_is-opened");
});

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");

newPostBtn.addEventListener("click", function () {newPostModal.classList.add("modal_is-opened");
});

newPostCloseBtn.addEventListener("click", function () { newPostModal.classList.remove("modal_is-opened");
});