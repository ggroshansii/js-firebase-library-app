
const searchBtn = document.querySelector(".search-btn");
const titleInput = document.querySelector("#book-title");
const authorInput = document.querySelector("#book-author");
const subjectInput = document.querySelector("#book-subject");

let searchData = {
    title: "",
    author: "",
    subject: "",
}

searchBtn.addEventListener("click", (e) => {
    e.preventDefault()
    searchData = {
        title: titleInput.value,
        author: authorInput.value,
        subject: subjectInput.value,

    }

    console.log(searchData)
})

async function queryBooks() {
    const options = {
        method: "GET"
    }
    const response = await fetch("https://www.googleapis.com/books/v1/volumes?q=quilting&key=AIzaSyDhnFHiBiax8maT3xgRGpe14SUPQG8iaMc", options);
    console.log(response);
    const data = await response.json();
    console.log(data);
}

