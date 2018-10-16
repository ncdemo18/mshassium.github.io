//здесь магия переключения страниц

var $main, $pages,

    currentNumber = 0,
    nextNumber = 1,

    isAnimating = false,

    endCurrPage = false,
    endNextPage = false,

    animEndEventName = 'animationend',
    outClass = 'pt-page-fade',
    inClass = 'pt-page-moveFromRight pt-page-ontop';

function isCorrectPageNumber(pageNumber) {
    if (pageNumber !== undefined && pageNumber !== null) {
        if (pageNumber >= 0 && pageNumber < $pages.size()) {
            return true;
        }
    }
    return false;
}

function nextPage(pageNumber) {

    if (isAnimating) {
        return false;
    }

    isAnimating = true;

    if (isCorrectPageNumber(pageNumber)) {
        nextNumber = pageNumber;
    } else {
        nextNumber = (currentNumber + 1) % $pages.size();
    }

    var $currPage = $pages.eq(currentNumber);
    var $nextPage = $pages.eq(nextNumber).addClass('pt-page-current');

    $currPage.addClass(outClass).on(animEndEventName, function () {
        $currPage.off(animEndEventName);
        endCurrPage = true;
        if (endNextPage) {
            onEndAnimation($currPage, $nextPage);
        }
    });

    $nextPage.addClass(inClass).on(animEndEventName, function () {
        $nextPage.off(animEndEventName);
        endNextPage = true;
        if (endCurrPage) {
            onEndAnimation($currPage, $nextPage);
        }
    });
}

function onEndAnimation($outpage, $inpage) {
    endCurrPage = false;
    endNextPage = false;
    currentNumber = nextNumber;
    resetPage($outpage, $inpage);
    isAnimating = false;
}

function resetPage($outpage, $inpage) {
    $outpage.attr('class', $outpage.data('originalClassList'));
    $inpage.attr('class', $inpage.data('originalClassList') + ' pt-page-current');
}

function initTransition(){
    $main = $('#pt-main');
    $pages = $main.children('div.pt-page');
    $pages.each(function () {
        var $page = $(this);
        $page.data('originalClassList', $page.attr('class'));
    });
    $pages.eq(currentNumber).addClass('pt-page-current');
}


