/* @license
elias kuiter
feature-confirator
v1.0.1
https://github.com/ekuiter/feature-configurator
License: LGPL3.0
*/

let alreadyDisplayed = false;

function Configurator(model, options, configuration, annotations) {
  if (!(this instanceof Configurator))
    return new Configurator(model, options, configuration);

  this.model = model;
  this.options = options || {};
  this.options.target = this.options.target || $("body");
  this.render(configuration, annotations);
  if (options.alreadyDisplayed === false) alreadyDisplayed = false;
}

Configurator.prototype.render = function (configuration, annotations) {
  const self = this;
  configuration = configuration || new Configuration(this.model);
  self.configuration = configuration;

  let uiAnnotations = annotations;
  if (
    uiAnnotations == null ||
    uiAnnotations == undefined ||
    uiAnnotations == ""
  )
    uiAnnotations = this.options.UIAnnotations;

  const configurationRenderer = new ConfigurationRenderer(
    configuration,
    this.options,
    uiAnnotations
  );
  //Il semble que l'on ne passe ici qu'après un click....
  //attention on n'affecte la nouvelle configuration que dans render...
  //Il faut donc déplacer dans render à la place du renderTo
  //*****  MIX : Ajout pour couper le renderer....
  refreshGlobalProperties(this);

  if (alreadyDisplayed) {
    changeStatusOfModifiedFeatures(configuration);
  } else {
    configurationRenderer.renderTo(self.options.target, function () {
      const newConfiguration = this.read(self.options.target);
      //refreshGlobalProperties(this);
      if (newConfiguration.isValid()) {
        //MIX je change je comprend pas
        //if (alreadyDisplayed)
        //    changeStatusOfModifiedFeatures(newConfiguration);
        //else{
        self.render(newConfiguration, uiAnnotations);
        //  alreadyDisplayed=true;
      } else self.render(this.configuration);
    });
    refreshCollapsibleElements();
    alreadyDisplayed = true;
  }
};
//refreshCollapsibleElements();

//MIX
//refreshGlobalProperties(this);

/*
  //*****  MIX : Ajout pour couper le renderer....
    refreshGlobalProperties(this);
    if (alreadyDisplayed) {
        changeStatusOfModifiedFeatures(configuration);
    } else {
 */
