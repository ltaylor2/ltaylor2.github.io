var speciesButtons = document.getElementsByClassName("species");
console.log(speciesButtons.length)
for (var i = 0; i < speciesButtons.length; i++) {
  speciesButtons[i].addEventListener("click", function() {
    this.classList.toggle("active");
  	alert()
  });
}
