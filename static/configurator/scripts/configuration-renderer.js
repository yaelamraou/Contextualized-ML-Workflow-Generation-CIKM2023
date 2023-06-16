/* @license
elias kuiter
feature-confirator
v1.0.1
https://github.com/ekuiter/feature-configurator
License: LGPL3.0
*/

// <!-- Configuration renderer -->
function ConfigurationRenderer(configuration, options, UIAnnotations) {
  if (!(this instanceof ConfigurationRenderer))
    return new ConfigurationRenderer(configuration);

  this.configuration = configuration;
  if (UIAnnotations === "") {
    if (this.options != null && this.options != undefined)
      UIAnnotations = this.options.UIAnnotations;
  }

  //MIX TODO Oh My god!!!!!!
  this.options = this.getOptions(options, UIAnnotations);
  this.model = configuration.model;
}

//MIX.... elle il faudrait pouvoir lui dire d'où partir... on ne veut pas tout regarder...
function fromFMtoHTML(oldDocument, self, featureName) {
  //MIX function fromFMtoHTML(old, self) {
  let html = "<ul class='content'>";
  //MIX: to debug!!!!
  let fmRootNode = getFMRootNode(self.model.xmlModel.xml);
  if (fmRootNode == null) return "";
  if (featureName == "") featureName = self.model.rootFeature.name;
  html = traverseDocToVisuHtml(
    self,
    fmRootNode,
    featureName, //featureName,
    oldDocument,
    false,
    html
  );
  html += "</ul>";
  //Attention traverse xmlModel inside constraint solver
  /*   self.model.xmlModel.traverse(
        function (node) {
            html += self.options.renderFeature.call(self, self.model.getFeature(node.attr("name")), old);
        },
        function () {
            html += "<ul class='content'>";
        },
        function () {
            html += "</ul>";
        });

  */
  return html;
}

//MIX
/* function fromFMtoHTML(old, self, featureName, m_xml) {
    let html = "";
    html += "<ul class='content'>";
    traverseToBuildHtml(self.model.xmlModel.root, featureName, old, false, html);
    html += "</ul>";
}
 */

//Improve it par un parcours en largeur tant que isSubfeature est faux?
function isFeature(node) {
  return ["feature", "and", "or", "alt"].includes(node.prop("tagName"));
}

//C'est elle qui fait le taf (au moins à l'initialisation)
//MIX : On doit lui passer la feature à regarder...
ConfigurationRenderer.prototype.render = function (oldDocument, featureName) {
  const self = this;
  return self.options.renderAround.call(self, function () {
    //MIX
    //function fromFMtoHTML(old, self, featureName, m_xml) {
    return fromFMtoHTML(oldDocument, self, featureName);
  });
};

//from configurator:24
// fn = ƒ () {
//         const newConfiguration = this.read(self.options.target);
//         if (newConfiguration.isValid())
//             self.render(newConfiguration, self.options.UIAnnotations);
//         else

ConfigurationRenderer.prototype.renderTo = function (elemCentral, fn) {
  //pour chacun des elements de entryPoints
  //si on trouve la feature dans self.model
  //on demande renderTo la div ou un truc du genre(entryPoint+Sub)

  let targetElem = elemCentral.find("#OthersSub")[0];

  winToReadAnEntryPoint = false;
  for (let i = 0; i < this.options.EntryPoints.length; i++) {
    let entry = this.options.EntryPoints[i];
    let feature = this.model.getFeature(entry);
    if (typeof feature == "undefined" || (feature = "")) {
      //We wait the end to know what to do
    } else {
      targetElem = elemCentral.find("#" + entry + "Sub")[0];
      if (typeof targetElem == undefined) {
        //We wait the end to know what to do
      } else {
        winToReadAnEntryPoint = true;
        renderInTabs(this, targetElem, fn, entry);
      }
    }
  }

  if (!winToReadAnEntryPoint) {
    entry = "";
    renderInTabs(this, targetElem, fn, entry);
    targetElem = elemCentral.find("#OthersSub")[0];
  } else {
    targetElem = elemCentral.find("#OthersSub")[0];
    for (let i = 0; i < this.options.OtherEntryPoints.length; i++) {
      let entry = this.options.OtherEntryPoints[i];
      let feature = this.model.getFeature(entry);
      if (typeof feature == "undefined" || (feature = "")) {
        //We wait the end to know what to do
      } else {
        if (typeof targetElem == undefined) {
          //We wait the end to know what to do
        } else {
          renderInTabs(this, targetElem, fn, entry);
        }
      }
    }
  }
  //else  we do nothing becuase duplicated features fail...
};

//elem = target where to add html
function renderInTabs(that, elemHtml, fn, featureName) {
  elem = $(elemHtml);
  const self = that;
  self.options.beforeRender.call(self);

  //MIX = ici on reprend tous les olds précédents... on parcourt pour cela elem que l'on place sur body
  // A METTRE La où je peux l'inialiser, il ne bougera plus...
  //En global ... mais je n'y aurais pas accès ici.... donc j'ai intéret à creer la hasmap dans le renderer au début...
  //let entryPointsElements = new Map();
  //let entryPointsElements = getEntryPoints(elem) =>  ( let entryPointsElements = new Map(); entryPoints.set(entryPoints, elem.get... ) )
  //MIX = on fait pareil mais que sur la partie qui nous concerne...
  //
  //entryPointsElements.forEach (function(value, key) {
  //   newhtml= self.render(value,key);
  //   value.empty().append(newhtml);
  // })
  //MIX = a l'initialisation il va falloir lui dire sur quoi travailler... self.render(old,rootfeature)
  //Mi trying to avoid useless update
  const old = stringToHTML(elem.html());
  let newhtml = self.render(old, featureName);
  elem.empty().append(newhtml);
  //MIX : on fait tout le taf dans elem
  elem.find("ul li").each(function () {
    var feature = self.model.getFeature($(this).attr("name"));
    if (feature)
      self.options.initializeFeature.call(self, $(this), feature, fn, old);
  });

  //MIX : a priori cela on doit pouvoir le faire qu'une fois je crois que ca fait rien...
  self.options.afterRender.call(self);
}

ConfigurationRenderer.prototype.read = function (elem) {
  var self = this,
    obj = {
      selectedFeatures: [],
      deselectedFeatures: [],
    };

  elem.find("ul li").each(function () {
    var feature = self.model.getFeature($(this).attr("name"));
    if (feature) {
      var result = self.options.readFeature.call(self, $(this), feature);
      if (result) obj[result].push(feature);
    }
  });

  return new Configuration(
    this.model,
    obj.selectedFeatures,
    obj.deselectedFeatures
  );
};

function getFeatureInOldDocument(oldDocument, feature) {
  let oldFeature = oldDocument.getElementById(feature.name + "Master");
  if (oldFeature === null) return oldFeature;
  let defHeaderBis = $("<div></div>").append(oldFeature);
  return defHeaderBis.html();
}

function prepareFeature(section, feature, UIAnnotations) {
  var header = "";

  if (section !== "leaf") {
    let defHeader = $("<div class='collapsible'></div>")
      .attr("id", feature.name + "Master")
      .append(getFeaturePresentation(this, feature, UIAnnotations));
    let defHeaderbis = $("<div></div>").append(defHeader);
    header = defHeaderbis;
    //  header = "<div class='collapsible'>" +
    //     getFeaturePresentation(this, feature, UIAnnotations) + " </div>";
    return header;
  }
  let featureString = getFeaturePresentation(
    this,
    feature,
    UIAnnotations,
    true
  );
  let defFeatureBis = $("<div></div>").append(featureString);
  return defFeatureBis;
}

function renderFeatureMethod(old, feature, UIAnnotations) {
  let oldFeature = getFeatureInOldDocument(old, feature);
  //TODO check the csv file (or UIAnnotations didn't change)
  if (oldFeature !== null)
    //console.log(oldFeature);
    return oldFeature;
  const hidden = getFeatureVisibility(UIAnnotations, feature.name);
  if (hidden === "true" || hidden === "True") return "";
  var tab = getFeatureTab(UIAnnotations, feature.name);

  var section = getFeatureSection(UIAnnotations, feature.name);
  // TRACE-DEBUG
  //console.log('section : ' + section);
  let header = prepareFeature.call(this, section, feature, UIAnnotations);
  if (tab === "") return header.html();
  else {
    tab.append(header);
    tab = $("<div></div>").append(tab);
    return tab.html();
  }
}

function computeFeatureLabel(UIAnnotations, feature, label) {
  const question = getFeatureTitle(UIAnnotations, feature.name);
  return label.text(question).attr("title", feature.name);
}

ConfigurationRenderer.prototype.getOptions = function (options, UIAnnotations) {
  if (UIAnnotations !== "") options.UIAnnotations = UIAnnotations;
  return $.extend(
    {},
    {
      beforeRender: function () {},
      afterRender: function () {},
      renderAround: function (fn) {
        return fn();
      },

      renderLabel: function (label, feature) {
        return UIAnnotations, feature, label;
      },

      renderFeature: function (feature, old) {
        return renderFeatureMethod.call(this, old, feature, UIAnnotations);
      },

      initializeFeature: function (node, feature, fn, old) {
        const self = this;
        //MI Trying to remove useless updates
        const featureState = getFeatureState(this.configuration, feature);
        //TODO = Here I remove the optimisation untill I have time !!
        //I should remove the new html code by the old ...
        let state = "toDo";
        //MIX ne fonctionne pas... je vire
        //state = getCheckBoxState(old,feature);
        //if ((state !== "toDo") && (state === featureState))
        //    return;
        //
        //
        var change = function () {
          //window.setTimeout(fn.bind(self), 0);
          window.setTimeout(fn.bind(self), 0);
        };

        //If automaticFeature
        // si Enabled : état = vrai
        //        sinon  l'état est celui de disabled dans la configuration
        //                  l'état est null
        //                sinon l'état est faux
        node
          .find("input[type=checkbox]")
          .prop("disabled", this.configuration.isAutomatic(feature))
          .tristate({
            state: this.configuration.isEnabled(feature)
              ? true
              : this.configuration.isDisabled(feature)
              ? null
              : false,
            change: change,
          });
        //node.find("input[type=text]").change(change);
      },

      readFeature: function (node, feature) {
        var valueInput = node.find("input[type=text]");
        if (feature.hasValue && valueInput.length)
          feature.setValue(valueInput.val());

        if (node.find("input[type=checkbox]").prop("disabled")) return;
        if (node.find("input[type=checkbox]").prop("checked"))
          return "selectedFeatures";
        else if (node.find("input[type=checkbox]").prop("indeterminate"))
          return "deselectedFeatures";
      },
    },
    options
  );
};

function getFeatureState(configuration, feature) {
  if (configuration.isEnabled(feature)) return "selectedFeature";
  if (configuration.isDisabled(feature)) return "deselectedFeature";
  return "";
}

function stringToHTML(str) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, "text/html");
  return doc;
}

function getCheckBoxState(node, feature) {
  const checkboxFeature = node.getElementById(feature.name); // node.find("input[type=checkbox]");
  if (checkboxFeature == null || typeof checkboxFeature === undefined)
    return "toDo";
  if (checkboxFeature.checked) return "selectedFeature";
  if (checkboxFeature.indeterminate) return "deselectedFeature";
  if (checkboxFeature.disabled) return "";
  /*   if (checkboxFeature.prop("disabled"))
           return;
       if (checkboxFeature.prop("checked"))
           return "selectedFeature";
       if (checkboxFeature.prop("indeterminate"))
           return "deselectedFeature";

     */
}

function getFeatureSection(UIAnnotations, name) {
  if (typeof UIAnnotations != "undefined" && UIAnnotations != "") {
    var index = UIAnnotations.featureIndex(name);
    if (typeof index != "undefined") {
      var headingName = UIAnnotations.jsoncontent.data[index].nodeMode;
      return headingName;
    }
  }
  return "leaf";
}

//TODO I simplify to test
function getFeatureTab(UIAnnotations, name) {
  let tab = "";

  if (name == "InitialData") {
    tab = $("<div></div>");
    tab.attr("class", "subtabcontent");
    tab.attr("id", "InitialDataTAB");
  } else if (name == "InitialProblem") {
    tab = $("<div></div>");
    tab.attr("class", "subtabcontent");
    tab.attr("id", "InitialProblemTAB");
  }
  return tab;
}

function getFeatureVisibility(UIAnnotations, name) {
  if (typeof UIAnnotations != "undefined" && UIAnnotations != "") {
    var index = UIAnnotations.featureIndex(name);
    if (typeof index != "undefined") {
      var visibility = UIAnnotations.jsoncontent.data[index].hidden;
      if (visibility != "false") return "true";
    }
  }
  return "";
}

function getFeatureInfo(UIAnnotations, name) {
  if (typeof UIAnnotations != "undefined" && UIAnnotations != "") {
    const index = UIAnnotations.featureIndex(name);
    if (typeof index != "undefined") {
      //Because we have different ways to write Description
      let info = UIAnnotations.jsoncontent.data[index].Description;
      if (info === "undefined")
        info = +UIAnnotations.jsoncontent.data[index].description;
      if (info != "") return info;
    }
  }
  return "";
}

function getFeatureTitle(UIAnnotations, name) {
  if (typeof UIAnnotations != "undefined" && UIAnnotations != "") {
    var index = UIAnnotations.featureIndex(name);
    if (typeof index != "undefined") {
      var question = UIAnnotations.jsoncontent.data[index].question;
      //console.log("json content", UIAnnotations.jsoncontent.data[index]);
      if (question != "" && question != " " && typeof question != "undefined") {
        //console.log("title question pour" +  name +":"+ question+".");
        return question;
      }
    }
  }
  //console.log("title pour" +  name +":"+ question);
  return name;
}

function getFeaturePresentation(that, feature, UIAnnotations, isMaster) {
  const hidden = getFeatureVisibility(UIAnnotations, feature.name);

  /* if (hidden === "true") {
        li.attr("style", "display: none;");
        //console.log("Visibility :" + visibility + " : " + li);
    }
     */
  if (hidden === "true" || hidden === "True") return "";

  let li = $("<li></li>")
    .attr("name", feature.name)
    .append(
      $("<label></label>")
        .attr("class", "tooltip")
        .append($('<input type="checkbox">').attr("id", feature.name))
        .append(computeFeatureLabel(UIAnnotations, feature, $("<span></span>")))
    );
  if (feature.hasValue && that.configuration.isEnabled(feature))
    li.append($('<input type="text">').attr("value", feature.value));

  var info = getFeatureInfo(UIAnnotations, feature.name);
  if (info != "" && typeof info != "undefined" && info != " ") {
    li.append('<span class="tooltiptext">' + info + "</span>");
  }

  let featureString = $("<div class='content'></div>").append(li).html();
  return featureString;

  //TODO move construction of div
  //let header = "<div class='content'>";
  /* if (isMaster) {
         let masterName = feature.name+"Master";
         header =  "<div class='content'" + " id='" + masterName + "' >";
     }
     */
  // let featureString = header + li +"</div>";
  // let defHeaderbis = $("<div></div>").append(featureString);
  // return defHeaderbis.html();
}
