// <!-- To deal with Tabs -->
function openTab(tabName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(tabName).style.display = "block";
  elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// <!-- To write data in TABS -->
function addDataIn(text, target, elmnt) {
  let tabcontent = document.getElementById(target + "Sub");
  tabcontent.innerHTML = text;
}

// <!-- To deal with Collapsible Elements -->
function refreshCollapsibleElements() {
  //console.log("---------------refreshCollapsibleElements : ");
  const coll = document.getElementsByClassName("collapsible");
  let i;

  for (i = 0; i < coll.length; i++) {
    //console.log("add listener : ", coll[i]);
    //TODO removed....
    coll[i].addEventListener("click", collapse);
  }
}

function collapse() {
  this.classList.toggle("active");
  let content = this.nextElementSibling;
  /*    if (content.style.maxHeight){
          content.style.maxHeight = null;
      } else {
          content.style.maxHeight = content.scrollHeight + "px";
      }
  
   */

  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
}
