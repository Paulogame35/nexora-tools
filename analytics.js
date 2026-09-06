/* Google Analytics 4 — configuração centralizada do NEXORA Tools. */
(function () {
  const measurementId = "G-51GCTVDFP8";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  if (document.querySelector("script[data-nexora-ga4]")) return;
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  tag.dataset.nexoraGa4 = measurementId;
  document.head.appendChild(tag);
}());
