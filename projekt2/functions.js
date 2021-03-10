var db;
var req = indexedDB.open('db', 1);

req.onsuccess = function (event) {
    db = event.target.result;
};

req.onerror = function (event) {
    alert("Błąd przy tworzeniu lokalnej bazy: " + event.target.errorCode);
};

req.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore('surveys');
}

var next_id = function () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(32).substring(1);
  };

function load_survey() {

var saveL = document.getElementById("save_locally");
saveL.addEventListener("click", function(event){
    var formD = $("#survey_form").serialize();

    var pairs = formD.split('&');
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    var survey = JSON.parse(JSON.stringify(result));


    var tran = db.transaction(['surveys'], "readwrite");
    var store = tran.objectStore('surveys');
    store.add(survey, next_id());

    tran.oncomplete = function () {
        alert("Dodano ankiete. Aby wysłać trzeba się zalogować");
    };
    tran.onerror = function (event) {
        alert("Błąd przy dodawaniu ankiety do lokalnej bazy.");
    }
});

var submitS = document.getElementById("survey_form");
submitS.addEventListener("submit", function(event){
    event.preventDefault();
    $.ajax({
        type: "POST",
        url: "/survey",
        data: $(this).serialize(),
        success: function(data) {
            alert('Ankieta wysłana.');
        },
        error: function(){
            alert('Błąd przy dodawaniu ankiety do bazy.');
        }
    })
});
}

function load_survey_results(){

var getOnline = document.getElementById("get_results_online");
getOnline.addEventListener("click", function(event){
    $.ajax({
        type: "GET",
        url: "/analytics_data",
        success: function(data) {
            console.log(data);
            draw_table(data);
        },
        error: function(){
            alert('Błąd serwera przy próbie pobrania danych');
        }
    })

    function draw_table(data){
        $("#online_results").html("");
        var table = '';
        table += '<table>';
        for(var heading in data[0]){
            table += '<th>' + heading + '</th>';
        }
        table += '</tr>';
        for(var i = 0; i < data.length; i++){
            table += '<tr>';
            for(var field in data[i]){
                table += '<td>' + data[i][field] + '</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        $("#online_results").append(table);
    }
});

}


function load_survey_save_offline(){

var getOffline = document.getElementById("get_save_offline");
getOffline.addEventListener("click", function(event){

    var tran = db.transaction('surveys', "readwrite");
    var store = tran.objectStore('surveys');

    var data = [];
    store.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if(cursor){
            data.push(cursor.value);
            cursor.continue();
        }
    }

    tran.oncomplete = function () {
        $("#offline_results").html("");
        var table = '';
        if (typeof data !== 'undefined') {
            table += '<table>';
            for(var heading in data[0]){
                table += '<th>' + heading + '</th>';
            }
            table += '</tr>';
            for(var i = 0; i < data.length; i++){
                table += '<tr>';
                for(var field in data[i]){
                    table += '<td>' + data[i][field] + '</td>';
                }
                table += '</tr>';
            }
            table += '</table>';
        }
        $("#offline_results").append(table);
    };
    tran.onerror = function (event) {
        console.log("Błąd przy odczycie lokalnej bazy");
    }
});

}

function sendAllLocalToServer(){
    var tran = db.transaction('surveys', "readwrite");
    var store = tran.objectStore('surveys');

    var data = [];
    store.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if(cursor){
            data.push(cursor.value);
            cursor.continue();
        }
    }

    tran.oncomplete = function () {
        global_results = data;
        for(var i = 0 ; i < global_results.length; i++){
            console.log(global_results[i]);
            $.ajax({
                type: "POST",
                url: "/survey",
                data: global_results[i],
                success: function () {
                    console.log('Wysłano ankiete');
                },
                error: function (){
                    console.log('Nie udalo sie wysłać ankiety.');
                }
            })
        }

        var tran = db.transaction('surveys', "readwrite");
        var store = tran.objectStore('surveys');
        store.clear();
        
        tran.oncomplete = function () {
            console.log("Lokalna baza czysta");
        };
        tran.onerror = function (event) {
            console.log("Błąd przy usuwaniu lokalnej bazy");
        }
    };

    tran.onerror = function (event) {
        console.log("Błąd przy odczycie lokalnej bazy");
    }
}


function load_login() {

var submitL = document.getElementById("login_form");
submitL.addEventListener("submit", function(event){
    event.preventDefault();
    $.ajax({
        type: "POST",
        url: "/login",
        data: $(this).serialize(),
        success: function(response) {
            sendAllLocalToServer();
            alert(response);
        },
        error: function(response) {
            alert(response.responseText);
        }
    })
});
}

function load_analytics() {

var drawCh = document.getElementById("draw_chart");
drawCh.addEventListener("click", function(event){
    $.ajax({
        type: "GET",
        url: "/analytics_data",
        success: function(data) {
            console.log(data);
            draw_charts(data);
        },
        error: function(){
            alert('Nie udalo sie uzyskać danych z serwera.');
        }
    })

    function draw_charts(data) {
    var ctx = document.getElementById("chart01").getContext("2d");
    var values01 = ['1-2', '3-4', '5', 'moreTh5'];
    var data01 = [0,0,0,0];

    for (var i = 0; i < values01.length; i++){
        for(var j = 0; j < data.length; j++){
            if(data[j].mealsNum == values01[i]){
                data01[i]++;
            }
        }
    }
    var chart01 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1-2', '3-4', '5', 'więcej niż 5'],
            datasets: [{
                label: 'Liczba odpowiedzi',
                data: data01,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    var ctx = document.getElementById("chart03").getContext("2d");
    var values03 = ['atOnce', 'in1h', 'max3h', 'noteat'];
    var data03 = [0,0,0,0];

    for (var i = 0; i < values03.length; i++){
        for(var j = 0; j < data.length; j++){
            if(data[j].hoursAftSleep  == values03[i]){
                data03[i]++;
            }
        }
    }
    console.log(data03);
    var chart03 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['od razu', 'w ciągu godziny', 'do trzech godzin', 'nie jem śniadań'],
            datasets: [{
                label: 'Liczba odpowiedzi',
                data: data03,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    var ctx = document.getElementById("chart04").getContext("2d");
    var values04 = Array.from(Array(8).keys());
    var data04 = [];
    for (var i = 0; i < 8; i++){
        data04[i] = 0;
    }

    for (var i = 0; i < values04.length; i++){
        for(var j = 0; j < data.length; j++){
            if(data[j].hoursBefSleep == values04[i]){
                data04[i]++;
            }
        }
    }
    console.log(data04);
    var chart04 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: values04,
            datasets: [{
                label: 'Ile godzin przed snem ostatni posiłek',
                data: data04,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
});


}
