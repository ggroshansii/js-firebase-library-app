
//To Do: have searchResults assigned items instead of entire obj (will have to refactor createElement forEach())
//Add functionality to 'add book btns' -> btn will grab index of searchResults array, then make new Book (make constructor), and add that new Book instance to Library array

const searchBtn = document.querySelector(".search-btn");
const titleInput = document.querySelector("#book-title");
const authorInput = document.querySelector("#book-author");
const subjectInput = document.querySelector("#book-subject");

const searchModal = new bootstrap.Modal(document.getElementById('bookModal')); //activates content as a modal
const mySearchModal = document.getElementById('bookModal'); //modal itself

const modalBody = document.querySelector('.modal-body');
const modalCloseBtn = document.querySelector('.btn-close');

let searchData = {
    title: "",
    author: "",
    subject: "",
}

let searchResults = null;

let library = [];

searchBtn.addEventListener("click", (e) => {
    e.preventDefault()
    searchData = {
        title: titleInput.value,
        author: authorInput.value,
        subject: subjectInput.value,

    }
    queryBooks();
})

async function queryBooks() {
    const options = {
        method: "GET"
    }
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${searchData.title}&inauthor:${searchData.author}&insubject:${searchData.subject}&key=AIzaSyDhnFHiBiax8maT3xgRGpe14SUPQG8iaMc`, options);
    const data = await response.json();
    searchResults = data.items;
    console.log("SR", searchResults);
    searchModal.toggle()
    displaySearchResults();
}


function displaySearchResults() {
    searchResults.forEach(item => {
        
        if (item.volumeInfo.imageLinks) {
            let bookOuterContainer = document.createElement('div');
            bookOuterContainer.classList.add("modal-book-outer-container")

            let bookTitle = document.createElement('h2');
            bookTitle.textContent = item.volumeInfo.title;
            bookOuterContainer.append(bookTitle);

            let bookAuthors = document.createElement('h3');
            let authors = [];
            item.volumeInfo.authors.forEach(author => {
                authors.push(author);
            })
            bookAuthors.classList.add('modal-book-authors');
            bookAuthors.textContent = authors.join(", ");
            bookOuterContainer.append(bookAuthors);

            let bookPageCount = document.createElement('p');
            bookPageCount.classList.add('modal-book-page-count');
            bookPageCount.textContent = item.volumeInfo.pageCount + ' pages';
            bookOuterContainer.append(bookPageCount);

            let bookInnerContainer = document.createElement('div');
            bookInnerContainer.classList.add("modal-book-inner-container");

            let bookImgDiv = document.createElement('div');
            let bookImg = document.createElement('img');
            bookImg.src = item.volumeInfo.imageLinks.thumbnail;
            bookImgDiv.append(bookImg);


            bookInnerContainer.append(bookImgDiv);

            let bookDescBtnContainer = document.createElement('div');
            bookDescBtnContainer.classList.add('modal-book-desc-btn-container')
            let bookDescDiv = document.createElement('div');
            let bookDescription = document.createElement('p');
            bookDescription.textContent = item.volumeInfo.description;
            bookDescDiv.append(bookDescription);
            bookDescBtnContainer.append(bookDescDiv);
            let bookBtnDiv = document.createElement('div');
            let bookAddBtn = document.createElement('button');
            bookAddBtn.textContent = "Add Book to Library";
            bookAddBtn.classList.add("btn", "btn-success", "modal-book-add-btn")
            bookBtnDiv.append(bookAddBtn);
            bookDescBtnContainer.append(bookBtnDiv);

            bookInnerContainer.append(bookDescBtnContainer);
            bookOuterContainer.append(bookInnerContainer);

            modalBody.append(bookOuterContainer);
        }
    })
    addBookFunctionality();
    searchModal.show();
}

function addBookFunctionality() {
    const addBtns = document.querySelectorAll(".modal-book-add-btn");
    addBtns.forEach((btn, idx) => {
        // btn.value = idx; //btn value will be index so book can be accessed in searchResults (array) via this index
        btn.addEventListener('click', ()=> {
            const bookDetails = searchResults[idx]
            const gridContainer = document.querySelector(".main-grid-container");
            const bookItemContainer = document.createElement('div');
            bookItemContainer.classList.add('book-item-container');

            bookItemContainer.style.backgroundImage = `url(${bookDetails.volumeInfo.imageLinks.thumbnail})`;
            bookItemContainer.style.backgroundSize = 'cover';

            gridContainer.append(bookItemContainer);
        })
    })
}

mySearchModal.addEventListener('hide.bs.modal', (e) => {
    modalBody.innerHTML = "";
    searchResults = null;
    titleInput.value = "";
    authorInput.value = "";
    subjectInput.value = "";
  })