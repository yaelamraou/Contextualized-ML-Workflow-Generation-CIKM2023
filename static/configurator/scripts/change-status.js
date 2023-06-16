function changeStatusOfModifiedFeatures(configuration) {
  setCheckBoxFeatures(configuration, diffActivatedFeatures, true);
  setCheckBoxFeatures(configuration, diffDeactivatedFeatures, false);
  setCheckBoxFeatures(configuration, featuresNoMoreActive, "");
}

function setCheckBoxFeatures(configuration, features, status) {
  for (let i = 0; i < features.length; i++) {
    let disabled =
      configuration.isDisabled(features[i]) ||
      configuration.isAutomatic(features[i]);
    changeStatus(features[i].name, status, disabled);
  }
}

//en 264 y a un truc sur disabled.... dur de comprendre

function changeStatus(feature, checked, disabled) {
  let node = document.getElementById(feature);
  // selected => checked + ! indeterminate
  // deselected => ! checked + indeterminate
  // rien => ! checked  + ! indeterminate
  if (typeof checked == "undefined") return;

  if (checked) {
    node.indeterminate = false;
    node.checked = checked;
  } else {
    if (checked !== "") {
      node.indeterminate = true;
      node.checked = checked;
    } else {
      node.indeterminate = false;
      node.checked = false;
    }
  }
  node.disabled = disabled;
}
