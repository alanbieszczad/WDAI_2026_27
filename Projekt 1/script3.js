document.addEventListener("DOMContentLoaded", function() {
    const sendBtn = document.getElementById("send-btn");
    const clearBtn = document.getElementById("clear-btn");
    const subject = document.getElementById("subject");

    const textareas = document.querySelectorAll(".text-area");
    const STORAGE_KEY = "bmw_survey_history";

    if(!sendBtn) return;

    function clearForm() {
        textareas.forEach(textarea => {
            textarea.value = "";
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        if(subject){
            subject.value="";
            subject.classList.add("placeholder-active");
        }
        hideAllSuggestions();
    }

    // Obsługa przycisku Clear
    if (clearBtn) {
        clearBtn.addEventListener("click", function(e) {
            e.preventDefault();
            clearForm();
        });
    }

    // Obsługa przycisku Send
    sendBtn.addEventListener("click", function() {
        let allFilled = true;

        textareas.forEach(textarea => {
            if(textarea.value.trim()==="") {
                allFilled=false;
            }
        });

        const isSubjectSelected=subject && subject.value!=="";

        if (allFilled && isSubjectSelected) {
            textareas.forEach(textarea => {
                const fieldId=textarea.id;
                const storageKey = "bmw_survey_" + fieldId;
                const val = textarea.value.trim();
                let history = JSON.parse(localStorage.getItem(storageKey)) || [];

                if (!history.includes(val)) {
                    history.push(val);
                    localStorage.setItem(storageKey, JSON.stringify(history));
                }
            });
            alert("Formularz został wysłany i dane tekstowe zapisane!");
            clearForm();
        }
        else{
            alert("Wypełnij cały formularz!");
        }
    });

    // --- SYSTEM PODPOWIEDZI DLA KAŻDEGO POLA TEXTAREA OSOBNO ---
    textareas.forEach(textarea => {
        if(textarea.id === "message") return;
        const fieldId = textarea.id;
        const STORAGE_KEY = "bmw_survey_" + fieldId;

        // Tworzymy kontener (wrapper) wokół textarea, aby podpowiedzi pozycjonowały się idealnie pod nim
        const wrapper = document.createElement("div");
        wrapper.className = "input-wrapper";
        
        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(textarea);

        const suggestionsBox = document.createElement("div");
        suggestionsBox.className = "suggestions-box";
        wrapper.appendChild(suggestionsBox);

        function showSuggestions() {
            hideAllSuggestions();
            let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

            if (history.length === 0) return;

            const query = textarea.value.toLowerCase();
            const filtered = history.filter(item => item.toLowerCase().includes(query));

            if (filtered.length === 0) return;

            suggestionsBox.innerHTML = filtered.map(item => `<div class="suggestion-item">${item}</div>`).join("");
            suggestionsBox.style.display = "block";

            // Kliknięcie w podpowiedź
            suggestionsBox.querySelectorAll(".suggestion-item").forEach(el => {
                el.addEventListener("click", function() {
                    textarea.value = this.textContent;
                    hideAllSuggestions();
                });
            });
        }

        textarea.addEventListener("focus", showSuggestions);
        textarea.addEventListener("input", showSuggestions);
    });

    function hideAllSuggestions() {
        document.querySelectorAll(".suggestions-box").forEach(box => {
            box.style.display = "none";
            box.innerHTML = "";
        });
    }

    // Kliknięcie poza pole chowa podpowiedzi
    document.addEventListener("click", function(e) {
        if (!e.target.classList.contains("text-area") && !e.target.classList.contains("suggestion-item")) {
            hideAllSuggestions();
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const selectElement = document.querySelector(".survey select");
    
    if (selectElement) {
        // Funkcja sprawdzająca czy wybrano opcję domyślną
        function updateSelectColor() {
            if (selectElement.value === "") {
                selectElement.classList.add("placeholder-active");
            } else {
                selectElement.classList.remove("placeholder-active");
            }
        }

        // Uruchom przy załadowaniu strony
        updateSelectColor();

        // Uruchom przy każdej zmianie wyboru
        selectElement.addEventListener("change", updateSelectColor);
    }
});