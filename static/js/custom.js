function umami() {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      var script = document.createElement("script");
      script.defer = true;
      script.src = "https://umami.ricolxwz.io/script.js";
      script.setAttribute(
        "data-website-id",
        "0c78fe49-f2f7-4c9f-8709-3c339e1ea6b5"
      );
      document.head.appendChild(script);
    }
  }
  umami();
  