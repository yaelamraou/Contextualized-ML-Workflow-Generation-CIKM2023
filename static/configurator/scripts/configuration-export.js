// <!-- TO export Configuration-->

let btn_exportConfigXML = document.getElementById("exportConfigXML");
btn_exportConfigXML.addEventListener("click", function () {
  document.getElementById("exportArea").textContent =
    window.app.configuration.serializeIncomplete();
});
