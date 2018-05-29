$.get("https://raw.githubusercontent.com/ltaylor2/ltaylor2.github.io/master/Media/book_list.csv",
function(bookListRaw) 
{
	var bookList = bookListRaw.split("\n");

	var prom_books = [];

	for (var i = bookList.length; i > 0; i--) {
		let s = bookList[i-1].split(",")
		let book = s[0];
		let url = s[1];
		if (book != "") {
			prom_books.push(promiseBookLink(book, url));
		}
	}

	Promise.all(prom_books).then(function(bookLinks) {
		let bs = document.createElement("ul");
		bs.id = "book-list";
		for (i in bookLinks) {
			let b = document.createElement("li");
			b.append(bookLinks[i]);
			bs.append(b);
		}
		$("#books").append(bs);
		$("#books").css("background", "white");
	});

});

function promiseBookLink(title, url) {

	var promise = new Promise(function(resolve) {

		var imgLink = document.createElement("A");

		var imgPath = "./Media/Book_Covers/" + title + ".jpg";
		imgLink.href = url;
		imgLink.target = "_blank";

		var alImg = document.createElement("img");
		alImg.classList.add("book-cover");
		alImg.onerror = function() {
			alImg.src = "./Media/Album_Art/ALBUM_ERROR.jpg";
			imgLink.append(alImg);
			resolve(imgLink);
		};

		alImg.onload = function() {
			imgLink.append(alImg);
			resolve(imgLink)
		};

		alImg.alt = title;
		alImg.src = imgPath;

	});

	return promise;
}