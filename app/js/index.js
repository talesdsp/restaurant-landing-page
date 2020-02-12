const burger = document.querySelector(".burger");
const welcomeMenu = document.querySelector(".welcome__menu");
burger.addEventListener("click", toggleMenu);

document.addEventListener("aos:in:my-filter", ({detail}) => {
  detail.style.filter = "blur(3px)";
});

function toggleMenu(e) {
  welcomeMenu.classList.toggle("open");
  const el = burger.children[0].classList;

  el.toggle("open");
  burger.setAttribute("aria-expanded", el.contains("open"));
}

const anchor = document.querySelectorAll('a[href^="#"]');

function smooth(target, duration) {
  let targetPosition = target.getBoundingClientRect().top;
  let startPosition = window.pageYOffset;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;

    let timeElapsed = currentTime - startTime;
    let run = ease(timeElapsed, startPosition, targetPosition, duration);

    window.scrollTo(0, run);

    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }
  window.requestAnimationFrame(animation);
}

anchor.forEach((v) => {
  v.addEventListener("click", function(evt) {
    let target = document.querySelector(this.hash);
    evt.preventDefault();
    smooth(target, 800);
    setTimeout(() => addFocus(target), 1000);
  });
});

function addFocus(t) {
  t.focus();
  if (document.activeElement === t) {
    return false;
  } else {
    t.setAttribute("tabindex", "-1"); // Adding tabindex for elements not focusable
    t.focus(); // Set focus again
  }
}

window.AOS.init({
  easing: "ease",
  duration: 1800,
  once: true
});
