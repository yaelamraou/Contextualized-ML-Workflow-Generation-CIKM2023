//var activatedFeatures = [];
//var deactivatedFeatures = [];
document
  .getElementById("inputConfigFile")
  .addEventListener("change", function () {
    let fr = new FileReader();
    fr.onload = function () {
      document.getElementById("configArea").textContent = fr.result;
    };
    fr.readAsText(this.files[0]);
  });

let btn_configure = document.getElementById("btn-configure");
btn_configure.addEventListener("click", function () {
  //const xml = $.parseXML($("textarea").val().trim());
  //const model = new Model(new XmlModel(xml));
  const configArea = document.getElementById("configArea");
  const xmlConfig = $.parseXML(configArea.value.trim());
  //console.log(Configuration.prototype);
  app.configuration = Configuration.fromXml(app.model, xmlConfig);
  alreadyDisplayed = false;
  refresh();
  let button = document.getElementById("InitialDataButton");
  openTab(initialData + "Section", button, defaultColor);
});
