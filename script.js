// Modal that asks how many pages youve read for that book when book item clicked
// Disable hover/mouseover when trying to click Status Btn or Delete icon -> lower div in book item that will trigger background image change
// Hover/mouseover shows Title, Author, Rating and Progress Bar
// Limit amount of words in modal

// Local storage saving
// Save to firebase option (Sign In button)

const searchBtn = document.querySelector(".search-btn");
const titleInput = document.querySelector("#book-title");
const authorInput = document.querySelector("#book-author");
const subjectInput = document.querySelector("#book-subject");

const searchForm = document.querySelector("#collapseForm");

const searchModal = new bootstrap.Modal(document.getElementById("bookModal")); //activates content as a modal
const mySearchModal = document.getElementById("bookModal"); //modal itself

const modalBody = document.querySelector(".modal-body");
const modalCloseBtn = document.querySelector(".btn-close");

let searchData = {
    title: "",
    author: "",
    subject: "",
};
let searchResults = null;
let library = [];

function Book(id, title, author, totalPages, rating, bookCover) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.totalPages = totalPages;
    this.readPages = null;
    this.haveRead = false;
    this.rating = rating;
    this.bookCover = bookCover;
}

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

    console.log(searchData.title, searchData.author, searchData.subject);
    console.log(searchTitle, searchAuthor, searchSubject);

    const options = {
        method: "GET",
    };
    const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchTitle}${searchAuthor}${searchSubject}&key=AIzaSyDhnFHiBiax8maT3xgRGpe14SUPQG8iaMc`,
        options
    );
    const data = await response.json();
    searchResults = data.items;
    console.log(searchResults);
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
            bookDescription.textContent = item.volumeInfo.description;
            bookDescDiv.append(bookDescription);
            bookDescBtnContainer.append(bookDescDiv);
            let bookBtnDiv = document.createElement("div");
            let bookAddBtn = document.createElement("button");
            bookAddBtn.textContent = "Add Book to Library";
            bookAddBtn.classList.add(
                "btn",
                "btn-success",
                "modal-book-add-btn"
            );
            bookBtnDiv.append(bookAddBtn);
            bookDescBtnContainer.append(bookBtnDiv);

            bookInnerContainer.append(bookDescBtnContainer);
            bookOuterContainer.append(bookInnerContainer);

            modalBody.append(bookOuterContainer);
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
            displayLibraryBooks();
        });
    });
}

function displayLibraryBooks() {
    let gridContainer = document.querySelector(".main-grid-container");
    gridContainer.innerHTML = "";
    library.forEach((bookObj, idx) => {
        const bookItemContainer = document.createElement("div");
        bookItemContainer.classList.add("book-item-container", bookObj.id);
        bookItemContainer.setAttribute("id", bookObj.id);

        const bookButtonContainer = document.createElement("div");
        const bookCoverContainer = document.createElement("div");
        bookCoverContainer.classList.add("book-cover-container", bookObj.id);
        bookCoverContainer.setAttribute("id", bookObj.id);

        bookItemContainer.style.backgroundImage = `url(${bookObj.bookCover})`;
        bookItemContainer.style.backgroundSize = "cover";
        bookButtonContainer.innerHTML =
            '<i class="fas fa-times book-item-delete-btn"></i>';
        const readStatusBtn = document.createElement("button");
        readStatusBtn.value = idx;
        if (bookObj.haveRead === false) {
            readStatusBtn.classList.add("status-btn", "status-not-read");
            readStatusBtn.textContent = "Not Read";
        } else {
            readStatusBtn.classList.add("status-btn", "status-read");
            readStatusBtn.textContent = "Read";
        }
        bookButtonContainer.append(readStatusBtn);
        // bookButtonContainer.classList.add("hide", "book-btn-container");
        bookItemContainer.append(bookButtonContainer);
        bookItemContainer.append(bookCoverContainer);
        gridContainer.append(bookItemContainer);

        hideBookCover(bookObj.id);
    });
    deleteBook();
    toggleStatusBtn();
    // showContentMouseEnter();
    // hideContentMouseLeave();
}

function deleteBook() {
    const deleteIcon = document.querySelectorAll(".book-item-delete-btn");
    deleteIcon.forEach((icon, idx) => {
        icon.value = idx;
        icon.addEventListener("click", () => {
            library.splice(icon.value, 1);
            displayLibraryBooks();
        });
    });
}

function toggleStatusBtn() {
    const statusBtn = document.querySelectorAll(".status-btn");
    statusBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("status-read");
            btn.classList.toggle("status-not-read");
            if (btn.classList.contains("status-read")) {
                btn.textContent = "Read";
                library[btn.value].haveRead = true;
            } else {
                btn.textContent = "Not Read";
                library[btn.value].haveRead = false;
            }
        });
    });
}

// work on this next
function hideBookCover(id) {
    const bookItem = document.getElementById(id);
    bookItem.addEventListener("mouseenter", (e) => {
        let index = library.findIndex((book) => book.id === id);
        const bookContainers = document.querySelectorAll(`.${id}`); //more than one because bookcover container and bookitem container have same class, hovering over bookcover container should trigger bookitem container's image to hide (this is to eliminate clashing hover effects)
        bookContainers.forEach(
            (bookContainer) => (bookContainer.style.backgroundImage = "")
        );
        console.log(library[index]);
    });

    bookItem.addEventListener("mouseout", (e) => {
        let index = library.findIndex((book) => book.id === id);
        const bookContainer = document.getElementById(`${id}`); //more than one because bookcover container and bookitem container have same class, hovering over bookcover container should trigger bookitem container's image to hide (this is to eliminate clashing hover effects)

        bookContainer.style.backgroundImage = `url(${library[index].bookCover})`;
        bookContainer.style.backgroundSize = "cover";
        bookContainer.style.backgroundRepeat = "no-repeat";

        console.log(library[index]);
    });
}

// function showContentMouseEnter() {
//     const bookItemContainerNodeList = document.querySelectorAll(".book-item-container");

//     bookItemContainerNodeList.forEach(bookItem => {
//         console.log(bookItem)
//         bookItem.addEventListener("mouseenter", () => {
//             const bookButtonContainerNodeList = document.querySelectorAll(".book-btn-container");

//             bookButtonContainerNodeList.forEach(bookBtnContainer => {
//                 bookBtnContainer.classList.remove('hide');
//             })
//         })
//     })
// }

// function hideContentMouseLeave() {
//     const bookItemContainer = document.querySelectorAll(".book-item-container");

//     // bookItemContainer.addEventListener("mouseleave", () => {
//     //     const bookButtonContainer = document.querySelector(".book-btn-container");
//     //     console.log(bookButtonContainer)
//     //     bookButtonContainer.classList.add("hide");
//     // })
// }

mySearchModal.addEventListener("hide.bs.modal", (e) => {
    modalBody.innerHTML = "";
    searchResults = null;
    titleInput.value = "";
    authorInput.value = "";
    subjectInput.value = "";
});
