let generateButton = document.getElementById("generateNB");
let downloadButton = document.getElementById("download_btn");

const generateRequest = async () => {
  const response = await fetch(`${getCurrentURL()}generate`, {
    method: "POST",
    body: JSON.stringify({
      config: window.app.configuration.serializeIncomplete(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await response.json();
  alert(res.message);
  // res.then((result) => {
  //   alert(`${result.message}`);
  // });
  // if (document.body.contains(document.getElementById("download"))) {
  //   console.log("already exist");
  // } else {
  //   console.log("creating button");
  //   createButton(res);
  // }
};

generateButton.addEventListener("click", generateRequest);

function download(url, filename) {
  var element = document.createElement("a");
  element.setAttribute("href", url);
  element.setAttribute("download", filename);

  document.body.appendChild(element);

  //onClick property
  element.click();

  document.body.removeChild(element);
}

downloadButton.addEventListener(
  "click",
  async () => {
    const response = await fetch(`${getCurrentURL()}download`, {
      method: "GET",
    });
    const res = await response.blob();
    var url = URL.createObjectURL(res);
    download(url, "generated_notebook.ipynb");
  },
  false
);

function getCurrentURL() {
  return window.location.href;
}

// function createButton(res) {
//   let dlLink = document.createElement("button");
//   dlLink.innerHTML = "Download Notebook";
//   dlLink.id = "download";
//   dlLink.download = "Generated_notebook.ipynb";
//   dlLink.addEventListener("click", downloadAction(res));
//   document.getElementById("exportButtons").appendChild(dlLink);
// }

// const downloadAction = async (res) => {
//   let blobUrl = URL.createObjectURL(res);
//   window.location.href = blobUrl;
// };
