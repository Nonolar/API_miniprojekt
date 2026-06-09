let speaker = `No start`;
let guess = `No guess`;
let revealed = true;
let score = 0;


async function updatePic(searchParam){
    console.log("Getting img");
    let result = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=&generator=search&formatversion=2&iiprop=timestamp%7Cuser%7Curl&gsrsearch=${searchParam}&gsrnamespace=6&origin=*`);

    let json = await result.json();

    
    console.log("Got json");
    

    const myRegex = /File:(.*\.jpg)/gm

    let match;
    
    let index = 0;

    
    while((match = myRegex.exec(json.query.pages[index].title)) == null && index < json.query.pages.length){
        console.log(index);
        index++;
    }

    let file = json.query.pages[index].imageinfo[0].url;

    console.log(file);


    document.getElementById("clue").src = file;
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

async function getRandomQoute(){
    //Auto generated result from wikimedia api sandbox
    let result = await fetch("https://en.wikiquote.org/w/api.php?action=query&format=json&list=random&utf8=1&formatversion=2&rnnamespace=0&rnlimit=4&origin=*");

    if(!result.ok){
        console.error("Something went wrong");
        return;
    }

    let json = await result.json();

    let id = json.query.random[0].id;
    speaker = json.query.random[0].title;
    console.log(speaker);

    let alternatives = [json.query.random[0].title, json.query.random[1].title, json.query.random[2].title, json.query.random[3].title]

    console.log(alternatives);

    shuffle(alternatives);

    console.log(alternatives);

    document.getElementById('btn1').innerHTML = alternatives[0];
    document.getElementById('btn2').innerHTML = alternatives[1];
    document.getElementById('btn3').innerHTML = alternatives[2];
    document.getElementById('btn4').innerHTML = alternatives[3];

    await updatePic(speaker);

    console.log(id);

    result = await fetch(`https://en.wikiquote.org/w/api.php?action=parse&format=json&pageid=${id}&prop=wikitext&utf8=1&formatversion=2&origin=*`);

    if(!result.ok){
        console.error("Something went wrong");
        return;
    }

    json = await result.json();

    console.log(json);

    let textToParse = json.parse.wikitext;

    const myRegex = /^\*([^*{].*)/gm;

    let match;

    let myArray = [];

    while((match = myRegex.exec(textToParse)) !== null){

        myArray.push(match[1]);
    }

    let choise = Math.floor(Math.random() * myArray.length);

    console.log(`Choose ${choise}`);

    let text = myArray[choise];
    console.log(text);
    let finished = text.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')

    console.log(finished);

    document.getElementById("qout").innerHTML = finished;
}

async function getSearch(){
    let searchParam = document.getElementById('searchbar').value;
    const result = await fetch(`https://en.wikiquote.org/w/api.php?action=opensearch&format=json&search=${searchParam}&utf8=1&formatversion=2&origin=*`);

    let json = await result.json();

    let container = document.getElementById("ans");

    container.innerHTML = ``;

    for (let index = 0; index < json[1].length; index++) {
        const res = json[1][index];
        console.log(res);

        let element = document.createElement('div');
        element.innerHTML = `${res}`;
        element.addEventListener('click', () => setAnswer(res));

        container.append(element);
    }

    
}

function setAnswer(answer){
    console.log(answer);
    guess = answer;

    document.getElementById("guess").innerHTML = `Guess: ${guess}`;
}

function buttonPressed(){
    if(!revealed){
        document.getElementById('submit').innerHTML = "Get new qoute";
        revealAnswer();
        return;
    }
    
    document.getElementById('submit').innerHTML = "Check answer";
    getRandomQoute();
    revealed = false;
}

function revealAnswer(){
    revealed = true;
    document.getElementById("correct").innerHTML = `Answer: ${speaker}`;

    console.log(speaker);
    console.log(guess);
    if(speaker == guess){
        console.log("Score!");
        score++;
    }else{
        score = 0;
    }
    console.log("Setting new score");
    document.getElementById('score').innerHTML = `Score: ${score}`;

    localStorage.setItem("score", score);
}

//Copied straight from stack overflow
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

score = parseInt(localStorage.getItem("score"));
if(score == NaN) score = 0;
document.getElementById('score').innerHTML = `Score: ${score}`;

document.getElementById('submit').addEventListener('click', () => buttonPressed());
document.getElementById('btn1').addEventListener('click', () => setAnswer(document.getElementById('btn1').innerHTML));
document.getElementById('btn2').addEventListener('click', () => setAnswer(document.getElementById('btn2').innerHTML));
document.getElementById('btn3').addEventListener('click', () => setAnswer(document.getElementById('btn3').innerHTML));
document.getElementById('btn4').addEventListener('click', () => setAnswer(document.getElementById('btn4').innerHTML));
