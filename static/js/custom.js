function umami() {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      var script = document.createElement("script");
      script.defer = true;
      script.src = "https://umami.ricolxwz.io/script.js";
      script.setAttribute(
        "data-website-id",
        "22d3a882-3707-44dc-8b1a-4d49876f504d
      );
      document.head.appendChild(script);
    }
  }
  umami();