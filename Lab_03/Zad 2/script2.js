const passwordMinLength = document.getElementById("passwordMinLen");
const passwordMaxLength = document.getElementById("passwordMaxLen");
const passwordCapitalLetters = document.getElementById("passwordCapitalLetters");
const passwordSpecialChar = document.getElementById("passwordSpecialChar");
const genBtn = document.getElementById("generateBtn");

const Letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
         'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const specialChars=['/','!','#','@','$','%','^','&'];

function generatePassword(){
    const min = parseInt(passwordMinLength.value) || 6;
    const max = parseInt(passwordMaxLength.value) || 12;
    const passLen = Math.floor(Math.random() * (max - min + 1)) + min;
    let password="";

    for(let i=0; i<passLen; i++){
        let char="";
        let chosenArray=passwordSpecialChar.checked ? Math.floor(Math.random()*2) : 0; // 0 - letters, 1 - specials
        if (chosenArray===0){
            let maxIndex = passwordCapitalLetters.checked ? Letters.length : 26;
            let randomIndex = Math.floor(Math.random() * maxIndex);
            char = Letters[randomIndex];
        }
        else{
            char=specialChars[Math.floor(Math.random()*specialChars.length)];
        }
        password+=char;
    }
    alert("Wygenerowane hasło: \n".concat(password));
}

genBtn.addEventListener('click', generatePassword);