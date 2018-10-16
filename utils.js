var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getFormatTime() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours > 12 ? "pm" : "am";

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes + "     " + ampm;
}

function getFormatDate() {
    let date = new Date();
    let month = monthNames[date.getMonth()];
    let day = date.getDate();
    let year = date.getFullYear();

    let endDayPhrase = "th";
    if(day === "2" || day === "22") {
        endDayPhrase = "nd";
    } else if (day === "3" || day === "23") {
        endDayPhrase = "rd";
    } else if (day === "1" || day === "21" || day === "31") {
        endDayPhrase = "st";
    }

    return month + " " + day + endDayPhrase + ", " + year;
}

function getWeekDay() {
    let date = new Date();
    return weekNames[date.getDay()];
}

function findLocationFolder(path) {
    for(let i = 0; i < path.length; i++) {
        if(path[i] === "mockup") {
            return i;
        }
    }
    return -1;
}

function pathToString(path) {
    let strPath = "", fileName = path[path.length - 1];
    for(let i = 0; i < path.length - 1; i++) {
        strPath += path[i] + "/";
    }
    return strPath + fileName;
}

function setLocation(locationName) {
    let images = document.getElementsByTagName("img");
    for(let i = 0; i < images.length; i++) {
        let path = images[i].src.split("/");
        let indexLocationFolder = findLocationFolder(path);
        if(indexLocationFolder > -1){
            path[indexLocationFolder + 1] = locationName;
        }
        images[i].src = pathToString(path);
    }
}

function setFootballScore(score) {
    let scoreBlocks = document.getElementsByClassName("score_block");
    for(let i = 0; i < scoreBlocks.length; i++) {
        scoreBlocks[i].textContent = score;
    }
}

function showTicketPanel(speedAnimate){
    changeTicketPanelOpacity(1, speedAnimate);
}

function hideTicketPanel(speedAnimate){
    changeTicketPanelOpacity(0, speedAnimate);
}

function changeTicketPanelOpacity(value, speedAnimate) {
    if(speedAnimate === "slow") {
        $('.ticket_panel').animate({"opacity" : value}, "slow");
    } else {
       $('.ticket_panel').animate({"opacity" : value}, "fast");
    }    
}

function showAvailableTickets(){
    $(".ticket_count_block").css("visibility", "");
}

function hideAvailableTickets(){
    $(".ticket_count_block").css("visibility", "hidden");
}

function reduceLoyaltyPoints(countRemovePoints) {
    let loyaltyPointsElements = document.getElementsByClassName("loyalty_value");
    for(let i = 0; i < loyaltyPointsElements.length; i++) {
        loyaltyPointsElements[i].textContent -= countRemovePoints;
    }
}

function addLoyaltyPoints(countAddPoints) {
    document.getElementById("loyalty_value").textContent += countAddPoints;
}

function openVideo(url) {
    window.open(url, '_blank');
}

function hideLogin(){
    let loginBlock = document.getElementById("loginBlock");
    loginBlock.style.display = "none";
}