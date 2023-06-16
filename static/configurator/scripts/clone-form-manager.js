const select = document.getElementById("select_clone");
const generate = document.getElementById("btn-fmload");
const clone_btn = document.getElementById("clone_btn");
const clonable = [];

generate.addEventListener("click", async () => {
  // get configuration data
  const config = window.app.configuration;
  // console.log(config.model.features);
  // go through all features, searching for xps and nbs,
  // add them into an array
  config.model.features.forEach((element) => {
    const nbRegexp = new RegExp("^NB[0-9]_");
    const xpRegexp = new RegExp("^XP[0-9]_");
    if (nbRegexp.test(element.name) || xpRegexp.test(element.name)) {
      // console.log(element);
      clonable.push(element.name);
    }
  });
  // go through nb and xp array and add them as option for the select menu
  clonable.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.innerHTML = option;
    select.appendChild(opt);
  });
});

clone_btn.addEventListener(
  "click",
  async () => {
    const response = await fetch(`${getCurrentURL()}clone`, {
      method: "POST",
      body: JSON.stringify({
        config: window.app.configuration.serializeIncomplete(),
        clone: select.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.blob();
    var url = URL.createObjectURL(res);
    download(url, `${select.value}.zip`);
  },
  false
);

function download(url, filename) {
  var element = document.createElement("a");
  element.setAttribute("href", url);
  element.setAttribute("download", filename);

  document.body.appendChild(element);

  //onClick property
  element.click();

  document.body.removeChild(element);
}

function getCurrentURL() {
  return window.location.href;
}
