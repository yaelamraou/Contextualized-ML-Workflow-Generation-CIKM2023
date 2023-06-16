// <!-- To load FM File -->
fmFileContent = "";
document.getElementById("inputFMfile").addEventListener("change", function () {
  var fr = new FileReader();
  fr.onload = function () {
    document.getElementById("fmxml").textContent = fr.result;
    fmFileContent = fr.result;
  };
  fr.readAsText(this.files[0]);
});

// <!-- To read FM FILE -->
let btn_fmload = document.getElementById("btn-fmload");

function readFM(xmlValue) {
  if (xmlValue === "" || xmlValue == undefined) {
    xml4FM = $.parseXML($("textarea").val().trim());
    fmFileContent = xml4FM;
  }
  return xml4FM;
  //else $.parseXML(fmFileContent.trim());
}

function initializeConfiguratorApp(UIAnnotations) {
  xml4FM = readFM("");
  let modelFM = new Model(new XmlModel(xml4FM));
  initConstraintsMap(modelFM, xml4FM);
  window.app = new Configurator(modelFM, {
    target: $("body"), //$("#InitialDataSub"),    //$(".tabcontent"),
    renderer: {
      renderAround: function (fn) {
        // return presentGlobalProperties(this, fn);
      },

      afterRender: function () {
        exportConfigurationActions(this);
      },
    },
    UIAnnotations: UIAnnotations, //(typeof UIAnnotations === 'undefined' ? '' : UIAnnotations),
    //MIX
    EntryPoints: entryPoints,
    OtherEntryPoints: otherEntryPoints,
    alreadyDisplayed: false,
  });
}

function reInitConfigurator(xml, UIAnnotations) {
  return new Configurator(
    new Model(new XmlModel(xml)),
    this.app.options,
    this.app.configuration,
    UIAnnotations,
    //MIX : lui filer la table des entrypoints calculée? ou bien on s'en moque... qu'est-ce qu'on gagne pn passera
    // de toutes les facons body...
    // ce serait quand même mieux pour l'évolution ici ...
    {
      target: $("body"), //$("#InitialDataSub"),
      renderer: {
        renderAround: function (fn) {
          //return presentGlobalProperties(this, fn);
        },

        afterRender: function () {
          exportConfigurationActions(this);
        },
      },
      //UIAnnotations: (typeof UIAnnotations === 'undefined' ? '' : UIAnnotations)
    }
  );
}

//étape 2
function resetConfiguratorToNewFM(UIAnnotations) {
  if (window.app == null) {
    initializeConfiguratorApp(UIAnnotations);
  } else {
    //MI TODAY
    window.app = reInitConfigurator(readFM(""), UIAnnotations);
  }
  return window.app;
}

// point d'entrée de tout, un click de ce bouton lance tout
// étape 1: click sur ce bouton
btn_fmload.addEventListener("click", function () {
  try {
    activatedFeatures = [];
    deactivatedFeatures = [];
    resetConfiguratorToNewFM();
    let button = document.getElementById("InitialDataButton");
    //refreshGlobalProperties(this.app);
    openTab(initialData + "Section", button, defaultColor);
  } catch (e) {
    alert(e);
  }
});

function initConstraintsMap(modelFM, xmlModel) {
  modelFM.features.forEach(function (feature) {
    constraints.set(feature.name, new Set());
  });

  let xml4Model = modelFM.xmlModel;
  //if (modelFM.xmlModel.rules !== undefined)
  //desc = $(xmlModel).find("constraints rule").children("description")
  //si elle existe
  //desc=desc[0].textContent;
  // I could read desc in xmlModel, building a list of desciption ("") if not....
  // Ugly .....
  let ruleDescriptions = getRuleDescription(xmlModel);
  let i = 0;
  if (xml4Model.rules !== undefined) {
    for (const rule of xml4Model.rules) {
      let currentDesc = ruleDescriptions[i];
      i++;
      readingRule(rule, currentDesc);
    }
  }
}

function extractFeatureNames(rule) {
  let featureNameList = new Set();
  let op = rule.tagName;
  if (op === "var") return featureNameList.add(rule.textContent);
  if (op === "not") return extractFeatureNames(rule.children[0]);
  //Binary op
  featureNameList = extractFeatureNames(rule.children[0]);
  extractFeatureNames(rule.children[1]).forEach(function (featureName) {
    featureNameList.add(featureName);
  });
  return featureNameList;
}

function getRuleDescription(xmlModel) {
  return $(xmlModel)
    .find("constraints rule")
    .map(function () {
      var children = $(this).children("description");
      if (children == undefined || children.length == 0) return "";
      else return children[0].textContent;
    });
}

function ruleToString(rule, desc) {
  if (
    //(desc !== "") &&
    desc !== undefined
  )
    return "<td>" + desc + "</td>" + "<td>" + ruleToString(rule) + "</td>";

  let op = rule.tagName;
  if (op === "var") return rule.textContent;
  if (op === "not") return op + "(" + ruleToString(rule.children[0]) + ")";
  if (op === "disj")
    return (
      "(" +
      ruleToString(rule.children[0]) +
      " or " +
      ruleToString(rule.children[1]) +
      ")"
    );
  if (op === "conj")
    return (
      "(" +
      ruleToString(rule.children[0]) +
      " and  " +
      ruleToString(rule.children[1]) +
      ")"
    );
  if (op === "eq")
    return (
      "(" +
      ruleToString(rule.children[0]) +
      " equiv  " +
      ruleToString(rule.children[1]) +
      ")"
    );
  if (op === "imp")
    return (
      "(" +
      ruleToString(rule.children[0]) +
      " =>  " +
      ruleToString(rule.children[1]) +
      ")"
    );
}

function readingRule(rule, desc) {
  let features = extractFeatureNames(rule);
  let constraint = ruleToString(rule, desc);
  features.forEach(function (featureName) {
    constraints.set(featureName, constraints.get(featureName).add(constraint));
  });
}

function exportConfigurationActions(that) {
  let self = that;
  $(".export").click(function () {
    $("pre").empty().text(self.configuration.serialize());
  });

  $(".exportXML").click(function () {
    $("pre").empty().text(self.configuration.serializeIncomplete());
  });
}
