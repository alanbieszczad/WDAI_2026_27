let wszystkieProdukty = [];
let aktualneProdukty = [];
const inputFiltra = document.querySelector("#filtr-input");
const selectSort = document.querySelector("#sort-select");

async function getData() {
    try {
        const response = await fetch('https://dummyjson.com/products');
        if (!response.ok){
            throw new Error("Błąd sieci: " + response.statusText);
        }
        const data = await response.json();
        const first30 = data.products.slice(0,30);
        return first30;
    }
    catch(error) {
        console.log("Wystąpił błąd:" + error);
        return [];
    }
}

function showTable(produkty){
    const tbody = document.querySelector("#tabela-produktow tbody");
    tbody.innerHTML = "";

    produkty.forEach(produkt => {
        const wiersz = document.createElement('tr');
        wiersz.innerHTML=`
        <td><img src="${produkt.thumbnail}" alt="${produkt.title}" width="75"></td>
        <td>${produkt.title}</td>
        <td>${produkt.description}</td>
        `;
        tbody.appendChild(wiersz);
    });
}

async function init(){
    wszystkieProdukty = await getData();
    aktualneProdukty = [...wszystkieProdukty];
    showTable(wszystkieProdukty);
}

inputFiltra.addEventListener('input', (e)=>{
    const szukanaFraza = e.target.value.toLowerCase();
    aktualneProdukty = wszystkieProdukty.filter(produkt =>
        produkt.title.toLowerCase().includes(szukanaFraza) || 
        produkt.description.toLowerCase().includes(szukanaFraza)
    );

    showTable(aktualneProdukty);
})

selectSort.addEventListener('change', (e) => {
    const kryterium = e.target.value;
    let toSort =  [...aktualneProdukty];

    if(kryterium==="rosnaco"){
        toSort.sort((a,b) => a.title.localeCompare(b.title));
    } else if (kryterium==="malejaco") {
        toSort.sort((a,b) => b.title.localeCompare(a.title));
    } else {
        toSort = [...wszystkieProdukty];
    }

    showTable(toSort);
})

init();