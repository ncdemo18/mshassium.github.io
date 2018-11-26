var imageBackgroundPrefix = "mockup/";
var isFootballSubscribe = false; 
var isGeneratePages = false;

function generateHtmlPage(content) {
    isGeneratePages = true;
    document.title = content.login;

    let ticketPanelElement = document.getElementById("ticket_panel_img_id");
    let ticketCountElement = document.getElementById("ticket_count_img_id");

    let imageNameTicketPanel = "Passes Panel - " + content.login[0].toUpperCase() + content.login.slice(1);
    setProperty(ticketPanelElement, 'src', imageBackgroundPrefix + imageNameTicketPanel + ".png");

    //TODO: real score in db, print number instead picture
    setProperty(ticketCountElement, 'src', imageBackgroundPrefix + "Passes Button - " + content.countTickets + ".png");

    imageBackgroundPrefix += content.location.locationName + "/bg/";

    let pageContainer = document.getElementById("pt-main");
    for(let i = 0; i < content.pages.length; i++) {
        pageContainer.appendChild(generateUserPage(content.pages[i], i + 1));
    }
    if(isFootballSubscribe) {
        footballSubscribe();
    }
}

function generateUserPage(pageInfo, numberPage) {
    let pageElement = createEmptyDivContainer("pt-page pt-page-" + numberPage);
    for(let i = 0; i < pageInfo.elements.length; i++){
        let block = pageInfo.elements[i];
        switch(block.blockName) {
            case "time_block" :
                pageElement.appendChild(createTimeBlock(block.param));
                pageElement.appendChild(createDateBlock(block.param));
                break;
            case "loyalty_block":
                pageElement.appendChild(createLoyaltyPointsBlock(block.param));
                break;
            case "scroll_image":
                pageElement.appendChild(
                    createBackgroundScrollImage(imageBackgroundPrefix + block.param + ".png")
                );
                break;
            case "scroll_image_video":
                pageElement.appendChild(
                    createBackgroundScrollLinkImage(imageBackgroundPrefix + block.param + ".png")
                );
                break;
            case "score_block":
                pageElement.appendChild(createPlayScoreBlock(block.param));
                isFootballSubscribe = true;
        }
    }
    return pageElement;
}

function createTimeBlock(position) {
    if(position === "left") {
        return createEmptyDivContainer("time_block time_block_left", getFormatTime());
    } else {
        return createEmptyDivContainer("time_block time_block_right", getFormatTime());
    }
}

function createDateBlock(position) {
    let dateBlock;
    if(position === "left") {
        dateBlock = createEmptyDivContainer("date_block date_block_left");
    } else {
        dateBlock = createEmptyDivContainer("date_block date_block_right");
    }
    dateBlock.appendChild(createEmptyDivContainer(undefined, getFormatDate()));    
    dateBlock.appendChild(createEmptyDivContainer("week_day", getWeekDay()));       
    return dateBlock;
}

function createPlayScoreBlock(scoreValue) {
    return createEmptyDivContainer("score_block", scoreValue);
}

function createBackgroundScrollImage(path) {
    let image = createImage("bcg_img_one", path);
    let imageContainer = createEmptyDivContainer("scroll-image");
    imageContainer.appendChild(image);
    return imageContainer;
}

function createBackgroundScrollLinkImage(path) {
    //TODO: copy video, make it as param in this function
    let image = createImageLink("https://ncdemo18.github.io/video", "bcg_img_one", path);
    let imageContainer = createEmptyDivContainer("scroll-image");
    imageContainer.appendChild(image);
    return imageContainer;
}


function createLoyaltyPointsBlock(loyaltyPointsValue) {
    let linkToLoyaltyHtmlPage = createLink("https://ncdemo18.github.io/loyalty_points.html", "loyalty_value", loyaltyPointsValue);
    let loyaltyContainer = createEmptyDivContainer("loyalty_point_block");
    loyaltyContainer.appendChild(linkToLoyaltyHtmlPage);
    return loyaltyContainer;
}

function createImageLink(url, imgClassName, imgPath) {
    let link = createLink(url);
    link.appendChild(createImage(imgClassName, imgPath));
    return link;
}

function createLink(url, id, textContent) {
    return createSimpleElement('a', [{'href' : url}, {'class' : id}, {'target' : 'blank'}], textContent);
}

function createImage(className, path) {
    return createSimpleElement('img', [{'class' : className}, {'src' : path}]);
}

function createEmptyDivContainer(className, textContent) {
    return createSimpleElement('div', [{'class' : className}], textContent);
}

function createSimpleElement(tagName, properties, textContent) {
    let element = document.createElement(tagName);
    for(let i = 0; i < properties.length; i++) {
        for(let key in properties[i]) {
            setProperty(element, key, properties[i][key]);
        }
        let value = properties[i];
        setProperty(element, value.key, value.value);
    }
    if(textContent !== undefined) {
        element.textContent = textContent;
    }
    return element;
}

function setProperty(element, attrName, value) {
    if(attrName !== undefined && value !== undefined) {
        element.setAttribute(attrName, value);
    }
}