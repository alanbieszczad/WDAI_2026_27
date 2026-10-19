document.addEventListener("DOMContentLoaded", function() {
    const checkbox1 = document.getElementById("type3");
    const checkbox2 = document.getElementById("type4");
    const checkbox3 = document.getElementById("type5");
    const checkbox4 = document.getElementById("type6");

    // Gdy zaznaczysz pierwszy checkbox, odznacz drugi
    checkbox1.addEventListener("change", function() {
        if (checkbox1.checked) {
            checkbox2.checked = false;
        }
    });

    // Gdy zaznaczysz drugi checkbox, odznacz pierwszy
    checkbox2.addEventListener("change", function() {
        if (checkbox2.checked) {
            checkbox1.checked = false;
        }
    });

    checkbox3.addEventListener("change", function() {
        if(checkbox3.checked){
            checkbox4.checked=false;
        }
    });

    checkbox4.addEventListener("change", function() {
        if (checkbox4.checked){
            checkbox3.checked=false;
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const sendBtn = document.getElementById("send-btn");
    const clearBtn = document.getElementById("clear-btn");

    const textareas = document.querySelectorAll(".text-area");
    const prevCarInput = document.getElementById("prev-car")
    const STORAGE_KEY = "bmw_survey_history";

    if(!sendBtn) return;

    function clearForm() {
        textareas.forEach(textarea => {
            textarea.value = "";
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        hideAllSuggestions();
    }

    // Obsługa przycisku Clear
    if (clearBtn) {
        clearBtn.addEventListener("click", function(e) {
            e.preventDefault();
            clearForm();
        });
    }

    // Obsługa przycisku Send (Zapisuje DO PAMIĘCI TYLKO TEXTAREA, pomija checkboxy)
    sendBtn.addEventListener("click", function() {
        let hasValue = false;

        textareas.forEach(textarea => {
            const val = textarea.value.trim();
            const fieldId = textarea.id; // np. "first-name", "prev-car"

            if (val !== "") {
                hasValue = true;
                const storageKey = "bmw_survey_" + fieldId;
                let history = JSON.parse(localStorage.getItem(storageKey)) || [];

                if (!history.includes(val)) {
                    history.push(val);
                    localStorage.setItem(storageKey, JSON.stringify(history));
                }
            }
        });

        if (hasValue) {
            alert("Formularz został wysłany i dane tekstowe zapisane!");
            clearForm();
        } else {
            alert("Wypełnij przynajmniej jedno pole tekstowe!");
        }
    });

    // --- SYSTEM PODPOWIEDZI DLA KAŻDEGO POLA TEXTAREA OSOBNO ---
    textareas.forEach(textarea => {
        const fieldId = textarea.id;
        const STORAGE_KEY = "bmw_survey_" + fieldId;

        const suggestionsBox = document.createElement("div");
        suggestionsBox.className = "suggestions-box";
        textarea.parentNode.style.position = "relative";
        textarea.parentNode.appendChild(suggestionsBox);

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