document.addEventListener("DOMContentLoaded", function() {
    const images=document.querySelectorAll(".car-photos img");
    const modal = document.getElementById("lightbox-modal");
    const modalImg=document.getElementById("lightbox-img");
    const closeBtn=document.getElementById("lightbox-close");
    const prevBtn=document.getElementById("lightbox-prev");
    const nextBtn=document.getElementById("lightbox-next");

    let currentIndex=0;
    const imagesArray=Array.from(images);

    imagesArray.forEach((img, index) => {
        img.addEventListener("click", function() {
            currentIndex=index;
            modalImg.src=img.src;
            modal.classList.add("active");
        });
    });

    function showImage(index){
        if (index < 0){
            currentIndex=imagesArray.length-1;
        } else if (index>=imagesArray.length){
            currentIndex=0;
        } else {
            currentIndex=index;
        }
        modalImg.src=imagesArray[currentIndex].src;
    }

    prevBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        showImage(currentIndex-1);
    });

    nextBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        showImage(currentIndex+1);
    });

    closeBtn.addEventListener("click", function() {
        modal.classList.remove("active");
    });

    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    document.addEventListener("keydown", function(e) {
        if (!modal.classList.contains("active")) return;

        if (e.key==="Escape") {
            modal.classList.remove("active");
        } else if (e.key==="ArrowLeft") {
            showImage(currentIndex-1);
        } else if (e.key==="ArrowRight") {
            showImage(currentIndex+1);
        }
    });
});