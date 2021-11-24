
async function queryBooks() {
    const options = {
        method: "GET"
    }
    const response = await fetch("https://www.googleapis.com/books/v1/volumes?q=quilting&key=AIzaSyDhnFHiBiax8maT3xgRGpe14SUPQG8iaMc", options);
    console.log(response);
    const data = await response.json();
    console.log(data);
}

queryBooks();