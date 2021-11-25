
const searchBtn = document.querySelector(".search-btn");
const titleInput = document.querySelector("#book-title");
const authorInput = document.querySelector("#book-author");
const subjectInput = document.querySelector("#book-subject");

const modal = new bootstrap.Modal(document.getElementById('bookModal')); //activates content as a modal
const myModal = document.getElementById('bookModal'); //modal itself
const modalBody = document.querySelector('.modal-body');
const modalCloseBtn = document.querySelector('.btn-close');

let searchData = {
    title: "",
    author: "",
    subject: "",
}

let searchResults = null;

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
    searchResults = data;
    modal.toggle()
    displaySearchResults();
}




function displaySearchResults() {
    searchResults.items.forEach(item => {
        
        if (item.volumeInfo.imageLinks) {
            let bookOuterContainer = document.createElement('div');
            bookOuterContainer.classList.add("modal-book-outer-container")

            let bookTitle = document.createElement('h2');
            bookTitle.textContent = item.volumeInfo.title;
            bookOuterContainer.append(bookTitle);

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


        console.log(item.volumeInfo)
    })
    modal.show();
}

// modalCloseBtn.addEventListener('click', ()=> {

// })

myModal.addEventListener('hide.bs.modal', (e) => {
    modalBody.innerHTML = "";
    searchResults = null;
    titleInput.value = "";
    authorInput.value = "";
    subjectInput.value = "";
  })