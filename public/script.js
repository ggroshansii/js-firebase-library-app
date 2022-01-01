// Modal that asks how many pages youve read for that book when book item clicked
// Disable hover/mouseover when trying to click Status Btn or Delete icon -> lower div in book item that will trigger background image change
// Hover/mouseover shows Title, Author, Rating and Progress Bar
// Limit amount of words in modal

// Local storage saving
// Save to firebase option (Sign In button)

document.addEventListener("DOMContentLoaded", (e) => {
    const app = firebase.app();

    Object.values(localStorage).forEach((storageItem) => {
        library.push(JSON.parse(storageItem));
    });
    displayLibraryBooks();
});

const searchBtn = document.querySelector(".search-btn");
const titleInput = document.querySelector("#book-title");
const authorInput = document.querySelector("#book-author");
const subjectInput = document.querySelector("#book-subject");

const searchForm = document.querySelector("#collapseForm");

const searchModal = new bootstrap.Modal(document.getElementById("bookModal")); //activates content as a modal
const mySearchModal = document.getElementById("bookModal"); //modal itself

const readPagesModal = new bootstrap.Modal(
    document.getElementById("readPagesModal")
);
const modalSearchBody = document.querySelector(".modal-search-body");
const modalCloseBtn = document.querySelector(".btn-close");

const myReadPagesModal = document.getElementById("readPagesModal");
const modalReadPagesBody = document.querySelector(".modal-read-pages-body");


let searchData = {
    title: "",
    author: "",
    subject: "",
};
let searchResults = null;
let library = [];
let userAuth;

function Book(id, title, author, totalPages, rating, bookCover) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.totalPages = totalPages;
    this.readPages = null;
    this.haveRead = "not-read";
    this.rating = rating;
    this.bookCover = bookCover;
}

displayLibraryBooks();
// localStorage.clear();
console.log(localStorage);

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchData = {
        title: titleInput.value,
        author: authorInput.value,
        subject: subjectInput.value,
    };
    let hideSearchForm = new bootstrap.Collapse(searchForm, {
        // collapses search form
        hide: true,
    });
    queryBooks();
});

async function queryBooks() {
    let searchTitle;
    let searchAuthor;
    let searchSubject;

    searchData.title
        ? (searchTitle = `intitle:${searchData.title}`)
        : (searchTitle = "");
    searchData.author
        ? (searchAuthor = `+inauthor:${searchData.author}`)
        : (searchAuthor = "");
    searchData.subject
        ? (searchSubject = `+insubject:${searchData.subject}`)
        : (searchSubject = "");

    const options = {
        method: "GET",
    };
    const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchTitle}${searchAuthor}${searchSubject}&key=AIzaSyDhnFHiBiax8maT3xgRGpe14SUPQG8iaMc`,
        options
    );
    const data = await response.json();
    searchResults = data.items;
    searchModal.toggle();
    displaySearchResultsModal();
}

function displaySearchResultsModal() {
    searchResults.forEach((item) => {
        if (item.volumeInfo.imageLinks) {
            let bookOuterContainer = document.createElement("div");
            bookOuterContainer.classList.add("modal-book-outer-container");

            let bookTitle = document.createElement("h2");
            bookTitle.textContent = item.volumeInfo.title;
            bookOuterContainer.append(bookTitle);

            let bookAuthors = document.createElement("h3");
            let authors = [];
            if (authors.length > 0) {
                item.volumeInfo.authors.forEach((author) => {
                    authors.push(author);
                });
            }
            bookAuthors.classList.add("modal-book-authors");
            bookAuthors.textContent = authors.join(", ");
            bookOuterContainer.append(bookAuthors);

            let bookPageCount = document.createElement("p");
            bookPageCount.classList.add("modal-book-page-count");
            bookPageCount.textContent = item.volumeInfo.pageCount + " pages";
            bookOuterContainer.append(bookPageCount);

            let bookInnerContainer = document.createElement("div");
            bookInnerContainer.classList.add("modal-book-inner-container");

            let bookImgDiv = document.createElement("div");
            let bookImg = document.createElement("img");
            bookImg.src = item.volumeInfo.imageLinks.thumbnail;
            bookImgDiv.append(bookImg);

            bookInnerContainer.append(bookImgDiv);

            let bookDescBtnContainer = document.createElement("div");
            bookDescBtnContainer.classList.add("modal-book-desc-btn-container");
            let bookDescDiv = document.createElement("div");
            let bookDescription = document.createElement("p");
            bookDescription.textContent =
                item.volumeInfo.description.substring(0, 450) + "...";
            bookDescDiv.append(bookDescription);
            bookDescBtnContainer.append(bookDescDiv);
            let bookBtnDiv = document.createElement("div");
            let bookAddBtn = document.createElement("button");
            bookAddBtn.textContent = "Add Book to Library";
            bookAddBtn.classList.add(
                "btn",
                "btn-primary",
                "modal-book-add-btn"
            );
            bookBtnDiv.append(bookAddBtn);
            bookDescBtnContainer.append(bookBtnDiv);

            bookInnerContainer.append(bookDescBtnContainer);
            bookOuterContainer.append(bookInnerContainer);

            modalSearchBody.append(bookOuterContainer);
        }
    });
    addBookToLibrary();
}

function addBookToLibrary() {
    const addBtns = document.querySelectorAll(".modal-book-add-btn");
    addBtns.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            const currentBook = searchResults[idx];
            const newBook = new Book(
                currentBook.id,
                currentBook.volumeInfo.title,
                currentBook.volumeInfo.authors,
                currentBook.volumeInfo.pageCount,
                currentBook.volumeInfo.averageRating,
                currentBook.volumeInfo.imageLinks.thumbnail
            );
            library.push(newBook);
            localStorage.setItem(localStorage.length, JSON.stringify(newBook));

            let db = firebase.firestore();

            if (userAuth) {
                let bookRating;
                newBook.rating === undefined
                    ? (bookRating = "No Rating")
                    : (bookRating = newBook.rating);

                db.collection("users")
                    .doc(userAuth.uid)
                    .collection("books")
                    .doc(newBook.id)
                    .set({
                        id: newBook.id,
                        title: newBook.title,
                        author: newBook.author,
                        totalPages: newBook.totalPages,
                        readPages: null,
                        haveRead: "not-read",
                        rating: bookRating,
                        bookCover: newBook.bookCover,
                        userID: userAuth.uid,
                    });
            }

            displayLibraryBooks();
        });
    });
}

function displayLibraryBooks() {
    let gridContainer = document.querySelector(".main-grid-container");
    gridContainer.innerHTML = "";

    library.forEach((bookObj, idx) => {
        const bookItemContainer = document.createElement("div");
        bookItemContainer.classList.add("book-item-container");
        bookItemContainer.setAttribute("id", `${bookObj.id}-container`);

        const bookButtonContainer = document.createElement("div");
        const bookLowerDiv = document.createElement("div");
        bookLowerDiv.classList.add("book-lower-div");
        bookLowerDiv.setAttribute("id", `${bookObj.id}-lower-div`);

        bookItemContainer.style.backgroundImage = `url(${bookObj.bookCover})`;
        bookItemContainer.style.backgroundSize = "cover";
        bookButtonContainer.innerHTML = `<i class="${bookObj.id} fas fa-times book-item-delete-btn "></i>`;
        const readStatusBtn = document.createElement("button");
        readStatusBtn.value = idx;
        if (bookObj.haveRead === "not-read") {
            readStatusBtn.classList.add(
                `${bookObj.id}`,
                "status-btn",
                "status-not-read"
            );
            readStatusBtn.textContent = "Not Read";
        } else if (bookObj.haveRead === "read") {
            readStatusBtn.classList.add(
                `${bookObj.id}`,
                "status-btn",
                "status-read"
            );
            readStatusBtn.textContent = "Read";
        } else {
            readStatusBtn.classList.add(
                `${bookObj.id}`,
                "status-btn",
                "status-in-progress"
            );
            readStatusBtn.textContent = "In Progress";
        }
        bookButtonContainer.append(readStatusBtn);
        bookButtonContainer.classList.add("book-btn-container");
        bookItemContainer.append(bookButtonContainer);
        bookItemContainer.append(bookLowerDiv);
        gridContainer.append(bookItemContainer);

        hideBookCover(bookObj.id);
    });
    deleteBook();
    toggleStatusBtn();
    readPagesEvent();
}

function deleteBook() {
    const deleteIcon = document.querySelectorAll(".book-item-delete-btn");
    deleteIcon.forEach((icon, idx) => {
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            for (prop in localStorage) {
                if (JSON.parse(localStorage[prop]).id === icon.classList[0]) {
                    delete localStorage[prop];
                    library.splice(idx, 1);

                    if (userAuth) {
                        const db = firebase.firestore();
                        db.collection("users")
                            .doc(userAuth.uid)
                            .collection("books")
                            .where("id", "==", icon.classList[0])
                            .get()
                            .then((results) => {
                                results.docs.forEach((doc) => {
                                    doc.ref.delete();
                                });
                            });
                    }
                    displayLibraryBooks();
                }
            }
        });
    });
}

function toggleStatusBtn() {
    const statusBtn = document.querySelectorAll(".status-btn");
    statusBtn.forEach((btn, idx) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            for (prop in localStorage) {
                if (JSON.parse(localStorage[prop]).id === btn.classList[0]) {
                    let db = firebase.firestore();

                    if (JSON.parse(localStorage[prop]).haveRead == "read") {
                        let updatedStorageItem = JSON.parse(localStorage[prop]);
                        updatedStorageItem.haveRead = "not-read";
                        localStorage.setItem(
                            prop,
                            JSON.stringify(updatedStorageItem)
                        );
                        btn.textContent = "Not Read";
                        library[btn.value].haveRead = "not-read";

                        if (userAuth) {
                            db.collection("users")
                                .doc(userAuth.uid)
                                .collection("books")
                                .doc(btn.classList[0])
                                .update({ haveRead: "not-read" });
                        }
                        btn.classList.toggle("status-read");
                        btn.classList.toggle("status-not-read");
                    } else if (
                        JSON.parse(localStorage[prop]).haveRead == "not-read"
                    ) {
                        let updatedStorageItem = JSON.parse(localStorage[prop]);
                        updatedStorageItem.haveRead = "in-progress";
                        localStorage.setItem(
                            prop,
                            JSON.stringify(updatedStorageItem)
                        );
                        btn.textContent = "In Progress";
                        library[btn.value].haveRead = "in-progress";

                        if (userAuth) {
                            db.collection("users")
                                .doc(userAuth.uid)
                                .collection("books")
                                .doc(btn.classList[0])
                                .update({ haveRead: "in-progress" });
                        }
                        btn.classList.toggle("status-not-read");
                        btn.classList.toggle("status-in-progress");
                    } else {
                        let updatedStorageItem = JSON.parse(localStorage[prop]);
                        updatedStorageItem.haveRead = "read";
                        localStorage.setItem(
                            prop,
                            JSON.stringify(updatedStorageItem)
                        );
                        btn.textContent = "Read";
                        library[btn.value].haveRead = "read";

                        if (userAuth) {
                            db.collection("users")
                                .doc(userAuth.uid)
                                .collection("books")
                                .doc(btn.classList[0])
                                .update({ haveRead: "read" });
                        }

                        btn.classList.toggle("status-read");
                        btn.classList.toggle("status-in-progress");
                    }
                }
            }
        });
    });
}

function hideBookCover(id) {
    const bookLowerDiv = document.getElementById(`${id}-lower-div`);
    const bookContainer = document.getElementById(`${id}-container`);
    bookLowerDiv.addEventListener("mouseover", () => {
        bookContainer.style.backgroundImage = "none";
        bookContainer.style.backgroundColor = "white";
        displayDetails(id);
    });

    bookContainer.addEventListener("mouseout", () => {
        let index = Object.values(localStorage).findIndex((book) => {
            book = JSON.parse(book);
            return book.id === id;
        });
        bookContainer.style.backgroundImage = `url(${
            JSON.parse(Object.values(localStorage)[index]).bookCover
        })`;
        bookContainer.style.backgroundSize = "cover";
        bookContainer.style.backgroundRepeat = "no-repeat";

        while (bookLowerDiv.firstChild) {
            bookLowerDiv.removeChild(bookLowerDiv.firstChild);
        }
    });
}

function displayDetails(id) {
    const bookLowerDiv = document.getElementById(`${id}-lower-div`);
    let index = Object.values(localStorage).findIndex((book) => {
        book = JSON.parse(book);
        return book.id === id;
    });

    const title = document.createElement("p");
    title.textContent = JSON.parse(Object.values(localStorage)[index]).title;
    title.classList.add("book-details");
    bookLowerDiv.append(title);

    const author = document.createElement("p");
    author.textContent = JSON.parse(Object.values(localStorage)[index]).author;
    author.classList.add("book-details");
    bookLowerDiv.append(author);

    const rating = document.createElement("p");
    rating.innerHTML = `<p>${calculateRating(
        JSON.parse(Object.values(localStorage)[index]).rating
    )}</p>`;
    rating.classList.add("book-details");
    bookLowerDiv.append(rating);

    const progressWrapper = document.createElement('div');
    progressWrapper.classList.add('progress');
    progressWrapper.style.width = '75%';
    progressWrapper.style.margin = 'auto';
    const progress = document.createElement('div');
    progress.classList.add('progress-bar');
    progress.style.width = `${(library[index].readPages / library[index].totalPages) * 100}%`;
    progressWrapper.append(progress);
    bookLowerDiv.append(progressWrapper);
}

function calculateRating(number) {
    switch (number) {
        case 1:
            return "&#9733;&#9734;&#9734;&#9734;&#9734;";
        case 2:
            return "&#9733;&#9733;&#9734;&#9734;&#9734;";
        case 3:
            return "&#9733;&#9733;&#9733;&#9734;&#9734;";
        case 4:
            return "&#9733;&#9733;&#9733;&#9733;&#9734;";
        case 5:
            return "&#9733;&#9733;&#9733;&#9733;&#9733;";
        default:
            return "No Rating";
    }
}

mySearchModal.addEventListener("hide.bs.modal", (e) => {
    modalSearchBody.innerHTML = "";
    searchResults = null;
    titleInput.value = "";
    authorInput.value = "";
    subjectInput.value = "";
});

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
            userAuth = result.user;
            console.log("userAuth", userAuth);
            localStorageToFirestore(userAuth.uid);
            getLoggedInUserBooks(userAuth.uid);

            setTimeout(() => {
                displayLibraryBooks();
            }, 800);
        });
}

function localStorageToFirestore(userID) {
    const db = firebase.firestore();

    if (localStorage.length > 0) {
        Object.values(localStorage).forEach((bookObj) => {
            let parsedObj = JSON.parse(bookObj);

            let bookRating;
            bookObj.rating === undefined
                ? (bookRating = "No Rating")
                : (bookRating = newBook.rating);

            db.collection("users")
                .doc(userID)
                .collection("books")
                .doc(parsedObj.id)
                .set({
                    id: parsedObj.id,
                    title: parsedObj.title,
                    author: parsedObj.author,
                    totalPages: parsedObj.totalPages,
                    readPages: parsedObj.readPages,
                    haveRead: parsedObj.haveRead,
                    rating: bookRating,
                    bookCover: parsedObj.bookCover,
                    userID: userAuth.uid,
                });
        });
    }
}

function getLoggedInUserBooks(userID) {
    library = [];
    localStorage.clear();
    const db = firebase.firestore();
    db.collection("users")
        .doc(userID)
        .collection("books")
        .where("userID", "==", userID)
        .get()
        .then((userBooks) => {
            userBooks.forEach((book, idx) => {
                library.push(book.data());
                localStorage.setItem(
                    localStorage.length,
                    JSON.stringify(book.data())
                );
                console.log(localStorage);
            });
        });
}

function readPagesEvent() {
    const bookItems = document.querySelectorAll(".book-item-container");

    bookItems.forEach((bookItem) => {
        bookItem.addEventListener("click", (e) => {
            let bookID = e.target.id.split("-")[0];
            readPagesModal.toggle();
            console.log("BOOKITEM ", bookItem);
            let input = document.createElement("input");
            input.placeholder = `Enter Pages Read for `;
            let submitBtn = document.createElement("button");
            submitBtn.textContent = "Save";
            modalReadPagesBody.append(input);
            modalReadPagesBody.append(submitBtn);
            submitBtn.addEventListener("click", () => {
                readPagesModal.hide();

                for (prop in localStorage) {
                    if (JSON.parse(localStorage[prop]).id === bookID) {
                        let db = firebase.firestore();

                        let updatedStorageItem = JSON.parse(localStorage[prop]);
                        updatedStorageItem.readPages = input.value;
                        localStorage.setItem(
                            prop,
                            JSON.stringify(updatedStorageItem)
                        );
                        let index = library.findIndex(bookObj => bookObj.id === bookID);
                        library[index].readPages = input.value;

                        if (userAuth) {
                            db.collection("users")
                                .doc(userAuth.uid)
                                .collection("books")
                                .doc(bookID)
                                .update({ readPages: input.value });
                        }
                    }
                }


            });

        });
    });
}

myReadPagesModal.addEventListener("hide.bs.modal", (e) => {
    removeAllChildNodes(modalReadPagesBody);
});

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}