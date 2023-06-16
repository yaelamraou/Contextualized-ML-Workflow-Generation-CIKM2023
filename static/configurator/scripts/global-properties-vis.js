function refreshGlobalProperties(configurator) {
  let htmlGP = presentGlobalProperties(configurator);
  let divGP = document.getElementById("GlobalInformation");
  $(divGP).empty().append(htmlGP);
}

function printConstraints(featureArray) {
  let output = "";
  let involvedConstraints = new Array();

  featureArray.forEach(function (feature) {
    involvedConstraints = involvedConstraints.concat([
      ...constraints.get(feature.name),
    ]);
  });

  involvedConstraints = new Set(involvedConstraints);
  involvedConstraints.forEach(function (constraintString) {
    output += "<tr> " + constraintString + "</tr> ";
  });
  return output;
}

//TODO : encapsuler cette fonction...
function presentGlobalProperties(configurator) {
  //console.log("------------ Appel à present");
  const state = configurator.configuration.isComplete()
    ? "complete"
    : "incomplete";

  // let html =
  //   "<div class='info'>" +
  //   "<h4>This configuration is " +
  //   (configurator.configuration.isValid() ? "valid" : "invalid") +
  //   " and " +
  //   state +
  //   ".</h4>";

  let html = "<div class='info'>";

  //console.log("activated features ", activatedFeatures);
  dealWithConstraints(configurator, activatedFeatures, deactivatedFeatures);
  //console.log("activated features ", configurator.configuration._activatedFeatures);
  //console.log("desActivated features ", configurator.configuration.getDeactivatedFeatures());
  html += //"<p style=\"background-color:powderblue;\">" +
    "<h4> New automatically activated features by the previous selection </h4>" +
    "<div class='var'>" +
    printfeatures(diffActivatedFeatures) +
    "</div>" +
    "<h4> New automatically deactivated features by the previous selection </h4> " +
    "<div class='var'>" +
    printfeatures(diffDeactivatedFeatures) +
    "</div>" +
    "<h4> No more activated features by the previous selection</h4> " +
    "<div class='var'>" +
    printfeatures(featuresNoMoreActive) +
    "</div>" +
    "<h4> Constraints potentially involved in the propagation of feature selection </h4>" +
    "<table>" +
    printConstraints(diffActivatedFeatures.concat(diffDeactivatedFeatures)) +
    "</table>";

  //html += fn();
  /* html += '<button class="export" ' +
        (configurator.configuration.isComplete() ? "" : "disabled") +
        '>Export Complete Configuration ' + '</button>';
    html += '<button class="exportXML" ' +
        //(this.configuration.isComplete() ? "" : "disabled") +
        '>Export Current Configuration ' + state + '</button>';
     */
  return html + "</div>";
}

//selected f1 f2 f3 f4 before
//selecetd f1 f2 f5 now
//=> diff = now-before = f5
//=> nomoreselected = before-now = f3 f4
//deselected f1' f2'  before
//deselecetd f1' f2' f5' f3 now
//difd = now-before = f3 f5'
//=> nomoredeselected = before-now = []

//=> no more selected = nomoreselected + nomoredeselected -diffselected-diffdeselected

//that ===> app  = configuraor
function dealWithConstraints(that) {
  //console.log("activated features to deal with before ", activatedFeatures);
  newactivatedFeatures = that.configuration._activatedFeatures;
  newdeactivatedFeatures = that.configuration._deactivatedFeatures;
  diffActivatedFeatures = newactivatedFeatures.filter(
    (x) => activatedFeatures.indexOf(x) === -1
  );
  let noMoreSelected = activatedFeatures.filter(
    (x) => newactivatedFeatures.indexOf(x) === -1
  );

  //console.log("New automatically activated features ", diffActivatedFeatures);

  diffDeactivatedFeatures = newdeactivatedFeatures.filter(
    (x) => deactivatedFeatures.indexOf(x) === -1
  );
  //console.log("New automatically deactivated features ", diffDeactivatedFeatures);
  let noMoreDeselected = deactivatedFeatures.filter(
    (x) => newdeactivatedFeatures.indexOf(x) === -1
  );

  featuresNoMoreActive = noMoreDeselected.concat(noMoreSelected);
  //Feature nomore active should have been selected or deselected
  featuresNoMoreActive = featuresNoMoreActive.filter(
    (x) => newdeactivatedFeatures.indexOf(x) === -1
  );
  featuresNoMoreActive = featuresNoMoreActive.filter(
    (x) => newactivatedFeatures.indexOf(x) === -1
  );
  activatedFeatures = newactivatedFeatures;
  deactivatedFeatures = newdeactivatedFeatures;

  //Loop on activated/desactivated feature
  let affectedFeatures = diffActivatedFeatures.concat(diffDeactivatedFeatures);
  //console.log("set of affected features", affectedFeatures);
  //These constraints cannot be interpreted
  //let constraintsolver = that.model.constraintSolver;
  //let constraints = new Set(affectedFeatures.map(feature => constraintsolver.configurationConstraint(that.configuration, feature)));
  //console.log("***** constraints : ", constraints);
}

function printfeatures(array) {
  var output = "[";
  array.forEach(function (feature) {
    output += feature.name + " ";
  });

  return output + "]";
}
