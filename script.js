document.addEventListener("DOMContentLoaded", function() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");
    const rejectBtn = document.getElementById("reject-cookies");

    const userConsent = localStorage.getItem("bmw_cookie_consent");

    if(!userConsent){
        setTimeout(() => {
            cookieBanner.classList.add("show");
        }, 500);
    }

    acceptBtn.addEventListener("click", function() {
        localStorage.setItem("bmw_cookie_consent","accepted");
        cookieBanner.classList.remove("show");
    });

    rejectBtn.addEventListener("click", function() {
        localStorage.setItem("bmw_cookie_consent", "rejected");
        cookieBanner.classList.remove("show");
    });
});