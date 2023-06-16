let btn_csv_upload = document.getElementById("btn-upload-csv");
btn_csv_upload.addEventListener("click", function () {
  Papa.parse(document.getElementById("upload-csv").files[0], {
    download: true,
    header: true,
    complete: function (results) {
      //console.log(results);
      UIAnnotations = getUIProperties(results);
      //console.log("====> Click" + results + " : " + UIAnnotations);
      //app.options = app.getOptions(app.options, UIAnnotations);
      refresh(UIAnnotations);
      refreshCollapsibleElements();
      let button = document.getElementById("InitialDataButton");
      openTab(initialData + "Section", button, defaultColor);
    },
  });

  //execShellCommand("ls -la");
});

function getUIProperties(results) {
  //console.log('call to getUIProperties :', results);
  let UIProperties4Features = results;
  let featuresProperties = new Map();
  UIProperties4Features.data.forEach(function (item, index) {
    featuresProperties.set(item.feature, index);
  });
  return {
    jsoncontent: results,
    featureMap: featuresProperties,
    featureIndex: function (name) {
      return this.featureMap.get(name);
    },
  };
}

function refresh(UIAnnotations) {
  try {
    //const xml = $.parseXML($("textarea").val().trim());
    window.app = resetConfiguratorToNewFM(UIAnnotations);
  } catch (e) {
    alert(e);
  }
}
