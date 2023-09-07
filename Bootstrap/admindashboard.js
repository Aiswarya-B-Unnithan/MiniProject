// Use any JavaScript animation library, such as Anime.js, to add animations to the dashboard elements
// For example, you can use Anime.js to animate the summary cards on page load
anime({
  targets: ".summary-card",
  translateY: [-20, 0],
  opacity: [0, 1],
  duration: 1000,
  delay: anime.stagger(200),
});
