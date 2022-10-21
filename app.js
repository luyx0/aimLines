window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  let myCanvas = new Canvas();
  myCanvas.init(context);
  document.getElementById("clear").addEventListener("click", () => {
    myCanvas.clear();
  });
};
