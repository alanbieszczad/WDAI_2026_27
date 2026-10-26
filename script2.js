document.addEventListener("DOMContentLoaded", function() {
    const mediaItems=document.querySelectorAll(".car-photos img, .car-photos video");
    const modal = document.getElementById("lightbox-modal");
    const modalImg=document.getElementById("lightbox-img");
    const closeBtn=document.getElementById("lightbox-close");
    const prevBtn=document.getElementById("lightbox-prev");
    const nextBtn=document.getElementById("lightbox-next");

    let currentIndex = 0;
    const mediaArray = Array.from(mediaItems);
    const modalContentContainer = modal.querySelector("img") ? modal.querySelector("img").parentNode : modal;
    
    let activeMediaElement = document.getElementById("lightbox-img");


    function showMedia(index) {
        if (index < 0) {
            currentIndex = mediaArray.length - 1;
        } else if (index >= mediaArray.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        const currentItem = mediaArray[currentIndex];
        
        // Sprawdzamy czy aktualny element to wideo czy obrazek
        if (currentItem.tagName.toLowerCase() === 'video') {
            // Jeśli to wideo, tworzymy/podmieniamy na element <video>
            if (activeMediaElement.tagName.toLowerCase() !== 'video') {
                activeMediaElement.remove();
                activeMediaElement = document.createElement("video");
                activeMediaElement.id = "lightbox-img";
                activeMediaElement.controls = true;
                activeMediaElement.autoplay = true;
                modalContentContainer.insertBefore(activeMediaElement, nextBtn);
            }
            // Pobieramy źródło z tagu source wewnątrz wideo lub bezpośrednio z elementu video
            const sourceChild = currentItem.querySelector("source");
            activeMediaElement.src = sourceChild ? sourceChild.src : currentItem.src;
        } else {
            // Jeśli to obrazek, tworzymy/podmieniamy na element <img>
            if (activeMediaElement.tagName.toLowerCase() !== 'img') {
                activeMediaElement.remove();
                activeMediaElement = document.createElement("img");
                activeMediaElement.id = "lightbox-img";
                modalContentContainer.insertBefore(activeMediaElement, nextBtn);
            }
            activeMediaElement.src = currentItem.src;
        }
    }

    mediaArray.forEach((item, index) => {
        item.addEventListener("click", function() {
            currentIndex = index;
            showMedia(currentIndex);
            modal.classList.add("active");
        });
    });

    prevBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        showMedia(currentIndex - 1);
    });

    nextBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        showMedia(currentIndex + 1);
    });

    function closeModal() {
        modal.classList.remove("active");
        // Jeśli odtwarzało się wideo, zatrzymujemy je przy zamknięciu modalu
        if (activeMediaElement.tagName.toLowerCase() === 'video') {
            activeMediaElement.pause();
            activeMediaElement.currentTime = 0;
        }
    }

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function(e) {
        if (!modal.classList.contains("active")) return;

        if (e.key === "Escape") {
            closeModal();
        } else if (e.key === "ArrowLeft") {
            showMedia(currentIndex - 1);
        } else if (e.key === "ArrowRight") {
            showMedia(currentIndex + 1);
        }
    });
});