//здесь общение с сервером
'use strict';

var stompClient = null;
var endpoint = "https://alexa-control-panel.herokuapp.com/alexa";
//var endpoint = "http://localhost:8080/alexa";

// address for actions with user page
var userSubscribeAddress = "/topic/user/";

var footballSubscribeAddress = "/topic/football";

var requestConfigAddress = "/app/start_config/";
var requestConfigTimerId;

function authorization(username){
    let request = new XMLHttpRequest();
    //let address = 'http://localhost:8080/authorization/' + username;
    let address = 'https://alexa-control-panel.herokuapp.com/authorization/' + username;
    request.open('GET', address, true);
    request.send();
    request.onreadystatechange = function() {
        if(this.readyState == 4) {
            console.log(this.responseText);
            if(this.responseText === "yes") {
                hideLogin();
                connectToAlexa(username);
            } else {
                alert("not found user!");
            }
        }
    }
}

function connectToAlexa(username) {
    userSubscribeAddress += username;
    requestConfigAddress += username;
    var socket = new SockJS(endpoint);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected);
}

function onConnected() {
    let subscription = stompClient.subscribe(userSubscribeAddress, onCommandReceived);
    console.log(subscription);
    requestUserConfig();
    requestConfigTimerId = setInterval(requestUserConfig, 300);
}

function requestUserConfig(){
    stompClient.send(requestConfigAddress);
}

function onCommandReceived(frame) {
    let alexaCommand = JSON.parse(frame.body);
    if(alexaCommand.commandType !== undefined) {
        switch(alexaCommand.commandType){
            case 'NEXT_PAGE':
                hideAvailableTickets();
                hideTicketPanel();
                nextPage();
                break;
            case 'SET_NUMBER_PAGE':
                console.log("set number");
                hideAvailableTickets();
                hideTicketPanel();
                nextPage(alexaCommand.context);
                break;
            case 'SET_LOCATION':
                console.log("set location");
                setLocation(alexaCommand.context);
                break;
            case 'SHOW_TICKET_PANEL':
                showTicketPanel();
                break;
            case 'GRANT_TICKET':
                hideTicketPanel("slow");
                showAvailableTickets();
                break;
            case 'TAKE_TICKET':
                hideTicketPanel("slow");
                showAvailableTickets();
                break;
            case 'HIDE_TICKETS':
                hideTicketPanel("fast");
                hideAvailableTickets();
                break;
            case 'SET_LOYALTY_POINTS':
                setLoyaltyPoints(alexaCommand.context);
                break;
            case 'OPEN_CARTOON':
                openVideo("https://ncdemo18.github.io/video");
                break;
            case 'OPEN_FOOTBALL':
                //TODO: copy video
                openVideo("http://ncdemo18.github.io/footbal");
                //openVideo("https://hangouts.google.com/call/wj64ayyszfgtnaz462gdsbjx3me");
                break;
            case 'CHANGE_TEMPERATURE':
                change_temperature(alexaCommand.context);
                break;
            case 'OPEN_DMP':
                openVideo("http://salesengnaas2.ebcshroom2.openshift.sdntest.netcracker.com")
        }
    } else if(isGeneratePages === false) {
        if(requestConfigTimerId !== undefined) {
            clearInterval(requestConfigTimerId);
        }
        generateHtmlPage(alexaCommand);
        initTransition();
    }
}

function footballSubscribe() {
    stompClient.subscribe(footballSubscribeAddress, onFootballScoreReceived);
}

function onFootballScoreReceived(frame){
    let score = frame.body;
    setFootballScore(score);
}