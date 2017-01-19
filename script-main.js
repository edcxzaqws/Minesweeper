var ROWS_NUMBER;
var COLUMNS_NUMBER;
var BOMBS_NUMBER;

var MINE_WIDTH;
var MINE_HEIGHT;

var bombs;
var display;
var opened;
var flagged;
var numOpened;
var numFlagged;

var isFirstCell;
var isStarted;
var isOver;

var isTimerOn;
var startingTime;

function isValid(r, c) {
    return (r >= 0 && r < ROWS_NUMBER && c >= 0 && c < COLUMNS_NUMBER);
}

function isBomb(r, c) {
    if (isValid(r, c)) return (bombs[r][c] == -1);
}

function gameOver(result) {

    if (result == "win") {
        document.getElementById("displayWin").value = " (: ";
		
        var now = new Date();
        var timeTaken = now.getTime() - startingTime.getTime();
        var secs = Math.floor(timeTaken/1000);
        var decimals = Math.floor((timeTaken % 1000)/10);
        document.getElementById("displayTimePassed").innerHTML = pad((secs > 999 ? "&infin;" : "" + secs), 3) + "." + decimals;
    }

    if (result == "lose") {
        document.getElementById("displayWin").value = " :( ";
    }

    isStarted = false;
    isOver = true;
    isTimerOn = false;
    for (var i=0; i<ROWS_NUMBER; i++) {
        for (var j=0; j<COLUMNS_NUMBER; j++) {
            var id = (i<10 ? "0"+i : i) + "" + (j<10 ? "0"+j : j);
            if (!opened[i][j] && !(flagged[i][j] == 1) && isBomb(i, j))
                display[i][j] = "<span style='color:#aaa'>B</span>";
            if (flagged[i][j] == 1 && !isBomb(i, j))
                display[i][j] = "<span style='color:#f99'>X</span>";
            document.getElementById(id).innerHTML = display[i][j];
        }
    }
    document.getElementById("help").style.color="#000";
}

function idToXOrY(id, variable) {
    if (id.charAt(0) == "0") {
        if (variable == "x")
            return parseInt(parseInt(id.substr(1, 3))/100);
        if (variable == "y")
            return parseInt(parseInt(id.substr(1, 3))%100);
    }
    else {
        if (variable == "x")
            return parseInt(parseInt(id)/100);
        if (variable == "y")
            return parseInt(parseInt(id)%100);
    }
}

function setElapsed() {
    // update elapsed time display
    var elt = document.getElementById("displayTimePassed");
    if (isTimerOn) {
        var now = new Date();
    		var secs = Math.floor((now.getTime() - startingTime.getTime())/1000);
    		elt.innerHTML = pad((secs > 999 ? "&infin;" : "" + secs), 3);
    }
    else
        elt.innerHTML = "000";
}

function timerAction() {
    // Called via setTimeout
    // Update the elapsed time, and schedule another call if wanted
    // Note: setInterval is similar, but stops (Safarai 1.3) after
    // user has navigated away then returned to the page.
    if (isTimerOn) {
        setElapsed();
        setTimeout("timerAction()", 100);
    }
}

function startTimer() {
    startingTime = new Date();
    isTimerOn = true;
    timerAction();
}

function openThis(id) {
    var x = idToXOrY(id, "x"), y = idToXOrY(id, "y");

    if (opened[x][y] || flagged[x][y] == 1 || !isValid(x, y) || isOver)
        return;

    if (isFirstCell) {
        do {
            resetMap(ROWS_NUMBER, COLUMNS_NUMBER);
            setBombs(ROWS_NUMBER, COLUMNS_NUMBER, BOMBS_NUMBER);
            setHints(ROWS_NUMBER, COLUMNS_NUMBER);
            document.getElementById("help").style.color="#fff";
        }
        while (bombs[x][y] != 0);
    }
    isFirstCell = false;
    isStarted = true;

    if (!isTimerOn) startTimer();

    display[x][y] = "<strong>";
    switch (bombs[x][y]) {
        case -1:
            display[x][y] += "B";
            break;
        case 0:
            display[x][y] += " ";
            break;
        case 1:
            display[x][y] += "<span style='color:#11f'>1</span>";
            break;
        case 2:
            display[x][y] += "<span style='color:#090'>2</span>";
            break;
        case 3:
            display[x][y] += "<span style='color:#e00'>3</span>";
            break;
        case 4:
            display[x][y] += "<span style='color:#00a'>4</span>";
            break;
        case 5:
            display[x][y] += "<span style='color:#a10'>5</span>";
            break;
        case 6:
            display[x][y] += "<span style='color:#19b'>6</span>";
            break;
        case 7:
            display[x][y] += "<span style='color:#111'>7</span>";
            break;
        case 8:
            display[x][y] += "<span style='color:#aaa'>8</span>";
            break;
    }
    display[x][y] += "</strong>";

    document.getElementById(id).style.backgroundColor = "#fff";
    document.getElementById(id).innerHTML = display[x][y];

    opened[x][y] = true;
    numOpened++;

    if (isBomb (x, y)) {
        gameOver("lose");
        return;
    }

    if (bombs[x][y] == 0)
        openAroundThis(id);

    if (numOpened == ((ROWS_NUMBER * COLUMNS_NUMBER ) - BOMBS_NUMBER))
        gameOver("win");
}

function openAroundThis(id) {
    var x = idToXOrY(id, "x"), y = idToXOrY(id, "y");

    if (!opened[x][y] || flagged[x][y] == 1)
        return;

    var counter = 0;
    for (var i=-1; i<2; i++) {
        for (var j=-1; j<2; j++) {
            if (isValid(x+i, y+j)) {
                if (flagged[x+i][y+j] == 1)
                    counter++;
            }
        }
    }

    if (counter == bombs[x][y]) {
        for (var i=-1; i<2; i++) {
            for (var j=-1; j<2; j++) {
                if (isValid(x+i, y+j)) {
                    openThis(""+((x+i)<10 ? '0'+(x+i) : (x+i)) + "" + ((y+j)<10 ? '0'+(y+j) : (y+j))+"");
                }
            }
        }
    }
}

function flagThis(id) {
    var x = idToXOrY(id, "x"), y = idToXOrY(id, "y");

    if (opened[x][y])
        return;

    switch (flagged[x][y]) {
        case "":
        case 0:
            display[x][y] = "<span style='color:#f00;'>f</span>";
            flagged[x][y] = 1;
            numFlagged++;
            break;
        case 1:
            display[x][y] = "<span style='color:#666;'>?</span>";
            flagged[x][y] = 2;
            numFlagged--;
            break;
        case 2:
            display[x][y] = "";
            flagged[x][y] = 0;
            break;
    }
    document.getElementById(id).innerHTML = display[x][y];
    document.getElementById("displayBombsLeft").innerHTML = pad(BOMBS_NUMBER-numFlagged, 3);
}

function renderMap() {
    var text = "";
    text += "<table width='300'><tr>"
    + "<td width=30% id='displayBombsLeft' style='text-align:right;'>" + pad(BOMBS_NUMBER, 3) + " </td>"
    + "<td width=10%></td>"
    + "<td width=20% style='text-align:center;'><input id='displayWin' type='button' onclick='resetMap(ROWS_NUMBER, COLUMNS_NUMBER);' value=' F2 ' style='font weight:bold;font-family:monospace'></td>"
    + "<td width=10% ></td>"
    + "<td width=30% id='displayTimePassed' style='text-align:left;'>" + "000" + " </td>"
    + "</tr></table><br>";
    text += "<table border=1>";
    for (var i=0; i<ROWS_NUMBER; i++ ) {
        text += "<tr>";
        for (var j=0; j<COLUMNS_NUMBER; j++) {
            var id = (i<10 ? "0"+i : i) + "" + (j<10 ? "0"+j : j);
            text += "<td id='" + id + "' class='mine' "
                  + "oncontextmenu='javascript:flagThis(this.id);return false;' "
                  + "onclick='openThis(this.id)' "
                  + "ondblclick='openAroundThis(this.id)' "
                  + "style='background-color:#ddd; width:" + MINE_WIDTH + "px; height:" + MINE_HEIGHT + "px;'>";
                display[i][j] = "";
                text += display[i][j];
            text += "</td>";
        }
        text += "</tr>";
    }
    text += "</table>";
    document.getElementById("map").innerHTML = text;
}

function Create2DArray(r, c) {
    var arr = [];
    for (var i=0;i<r;i++) {
        arr[i] = [];
        for (var j=0; j<c; j++)
            arr[i][j] = "";
    }
    return arr;
}

function getRandomInt(min, max) {
    //Returns a random integer between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(str, max) {
    //alert(pad("1", 3));    // "003"
    //alert(pad("123", 3));  // "123"
    //alert(pad("1234", 3)); // "1234"
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function setBombs(r, c, b) {
    for (var i=0; i<b; i++) {
        var isBombPlaced = false;
        while (isBombPlaced == false) {
            var x = getRandomInt(0, r-1), y = getRandomInt(0, c-1);
            if (isBomb (x, y))
                continue;
            bombs[x][y] = -1;
            isBombPlaced = true;
        }
    }
}

function setHints(r, c) {
    var counter = 0;
    for (var i=0; i<r; i++) {
        for (var j=0; j<c; j++) {
            if (isBomb(i, j)) continue;
            counter = 0;
            for (var k=-1; k<2; k++) {
                for (var l=-1; l<2; l++) {
                    if (isBomb((i+k), (j+l)))
                        counter++;
                }
            }
            bombs[i][j] = counter;
        }
    }
}

function resetMap(r, c) {
    numOpened = 0;
    numFlagged = 0;
    isFirstCell = true;
    isStarted = false;
    isOver = false;

    isTimerOn = false;

    for (var i=0; i<r; i++) {
        for (var j=0; j<c; j++) {
            bombs[i][j] = "";
            display[i][j] = "";
            opened[i][j] = "";
            flagged[i][j] = "";
            var id = (i<10 ? "0"+i : i) + "" + (j<10 ? "0"+j : j);
            document.getElementById(id).style.backgroundColor = "#ddd";
            document.getElementById(id).innerHTML = "";
        }
    }
    document.getElementById("displayBombsLeft").innerHTML = pad(BOMBS_NUMBER, 3);
    document.getElementById("displayWin").value = " F2 ";
    document.getElementById("displayTimePassed").innerHTML = "000";
	document.getElementById("help").style.color="#000";
}

function resetIfF2(e) {
    if (e.keyCode == 113) resetMap(ROWS_NUMBER, COLUMNS_NUMBER);
}

function setDifficulty(id) {
    if (isStarted) return;

    if (id != "beg") document.getElementById("beg").style.fontWeight="normal";
    if (id != "int") document.getElementById("int").style.fontWeight="normal";
    if (id != "exp") document.getElementById("exp").style.fontWeight="normal";
    document.getElementById(id).style.fontWeight="bold";

    switch (id) {
        case "beg":
            ROWS_NUMBER = 9;
            COLUMNS_NUMBER = 9;
            BOMBS_NUMBER = 10;
            break;
        case "int":
            ROWS_NUMBER = 16;
            COLUMNS_NUMBER = 16;
            BOMBS_NUMBER = 40;
            break;
        case "exp":
            ROWS_NUMBER = 16;
            COLUMNS_NUMBER = 30;
            BOMBS_NUMBER = 99;
            break;
    }

    renderMap();
    resetMap(ROWS_NUMBER, COLUMNS_NUMBER); 
}

function main() {
    // maximum ROWS_NUMBER and COLUMNS_NUMBER is 99
    ROWS_NUMBER = 16;
    COLUMNS_NUMBER = 16;
    BOMBS_NUMBER = 90;

    MINE_WIDTH = 30;
    MINE_HEIGHT = 30;

    bombs = Create2DArray(ROWS_NUMBER, COLUMNS_NUMBER);
    display = Create2DArray(ROWS_NUMBER, COLUMNS_NUMBER);
    opened = Create2DArray(ROWS_NUMBER, COLUMNS_NUMBER);
    flagged = Create2DArray(ROWS_NUMBER, COLUMNS_NUMBER);
    numOpened = 0;
    numFlagged = 0;

    isFirstCell = true;
    isStarted = false;
    isOver = false;

    isTimerOn = false;
    //startingTime;

    renderMap();
    document.addEventListener("keyup", resetIfF2);
}