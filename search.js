var selected_id = -1;

var loadedResults = 0;

var n_results = 9;

var api_url = "http://127.0.0.1:8000/";

var companies = [];

var days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];

function getDistricts(){
    $.ajax({
        "url": api_url+"all_districts", 
        "Access-Control-Allow-Origin" : "*",
        success : function(data){

            var select = document.getElementById('districts_items');

            data["districts"].forEach(district => {
                var li = document.createElement("li");
                var option = document.createElement('a');
                option.classList.add("dropdown-item");
                option.innerText = district;
                option.onclick = function(){
                    getCounty(district);
                }
                li.appendChild(option);
                select.appendChild(li);
            });
            document.getElementById('districts').removeAttribute("disabled");
        }
    });
}

function getCounty(selected_district){
    document.getElementById("districts").innerText = selected_district;

    var select = document.getElementById('counties_items');
    document.getElementById('counties').disabled = true;

    $.ajax({
        url: api_url+"counties_by_distric?district="+selected_district, 
        success : function(data){
            select.innerHTML = '';
            document.getElementById("counties").innerText = "Concelhos";
            data["counties"].forEach(county => {
                var li = document.createElement("li");
                var option = document.createElement('a');
                option.classList.add("dropdown-item");
                option.innerText = county[0];
                option.onclick = function(){
                    selectCounty(county);
                }
                li.appendChild(option);
                select.appendChild(li);
            });

            document.getElementById('counties').removeAttribute("disabled");
        }
    });
}

function selectCounty(county){
    document.getElementById('counties').innerText = county[0];
    selected_county = county[1];
    document.getElementById("search_button").removeAttribute("disabled");
}

function generate_card(company, id){
    var temp_date = new Date();
    var week_day = days[ temp_date.getDay() ];
    var hour = temp_date.getHours();
    var minutes = temp_date.getMinutes();

    var card_div = document.createElement('div');
    card_div.classList.add('col-xl-4');
    card_div.classList.add('col-lg-6');
    card_div.classList.add('col-sm-12');
    card_div.id = id;

    var img = document.createElement('img');
    img.classList.add('card-img-top');
    if(company["images"]["logo"] != ''){
        img.src = company["images"]["logo"];
    }
    else{
        img.src = "favicon/android-chrome-512x512.png"
    }
    img.alt = "Logo of the Company";
    
    var info_div = document.createElement('div');
    info_div.classList.add("card");
    info_div.onclick = function(){loadDetails(id)};

    var inside_div = document.createElement('div');
    inside_div.classList.add("card-body");
    

    var title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerText = company["name"];

    var text = document.createElement('p');
    text.innerText = "Encerrado";
    var i = 0;
    for(; i < company["schedules"][week_day].length; i++){
        if(company["schedules"][week_day] == "Encerrado"){
            break;
        }
        var work_times = company["schedules"][week_day][i].split("-")
        var start_time = work_times[0].split(":");
        var end_time = work_times[1].split(":");
        if((start_time[0] < hour) || (start_time[0] == hour && start_time[1] <= minutes)){
            if((end_time[0] > hour) ||  (end_time[0] == hour && end_time[1] > minutes)){
                text.innerText = company["schedules"][week_day][i];
                break;
            }   
        }       
    }

    text.classList.add("card-text");

    inside_div.appendChild(title);
    inside_div.appendChild(text);

    info_div.appendChild(inside_div);


    card_div.appendChild(img);
    card_div.appendChild(info_div);

    return card_div;
}

function generate_details(id){
    var card_div = document.createElement("div");
    card_div.classList.add("col-xl-12");
    card_div.classList.add("col-lg-12");
    card_div.classList.add("details-card");
    card_div.id = "details";
    var row = document.createElement("div");
    row.classList.add("row");

    var info1_div = document.createElement("div");
    info1_div.classList.add("col-xl-6");
    info1_div.classList.add("col-lg-12");
    info1_div.classList.add("details-card-section");

    var morada = document.createElement("span");
    var text_morada = document.createElement("p");
    text_morada.innerText = companies[id]["address"];
    morada.appendChild(text_morada);
    info1_div.appendChild(morada);    

    var contacto = document.createElement("span");
    var text = document.createElement("p");
    text.innerHTML = "";
    companies[id]["contacts"]["cellphone"].forEach(contacto => {
        if(contacto != ""){
            text.innerHTML += contacto;
            text.innerHTML += "<br/>";
        }
    });
    companies[id]["contacts"]["telephone"].forEach(contacto => {
        if(contacto != ""){
            text.innerHTML += contacto;
            text.innerHTML += "<br/>";
        }
    });
    contacto.appendChild(text);
    info1_div.appendChild(contacto);

    var entrega = document.createElement("span");
    entrega.innerHTML = "<p><b> Entregas ao Domicílio: </b><br/>";
    entrega.classList.add("col-xl-12");
    entrega.classList.add("col-lg-12");
    entrega.classList.add("detail-title");
    entrega.innerHTML += companies["home_delivery"] ? "Sim</p>" : "Não</p>";
    info1_div.appendChild(entrega);

    var social = document.createElement("span");
    var social_div = document.createElement("div");
    social_div.classList.add("row");
    var div_col = document.createElement("div");
    div_col.classList.add("col-12")
    if(companies[id]["social"]["facebook"] != ""){
        var a = document.createElement("a");
        var fb = document.createElement("i");
        fb.classList.add("fa");
        fb.classList.add("fa-facebook");
        fb.classList.add("fa-lg");
        fb.classList.add("button");
        a.href = companies[id]["social"]["facebook"];
        a.target = "_blank";
        a.appendChild(fb)
        div_col.appendChild(a);
    }
    if(companies[id]["social"]["instagram"] != ""){
        var a = document.createElement("a");
        var ig = document.createElement("i");
        ig.classList.add("fa");
        ig.classList.add("fa-instagram");
        ig.classList.add("fa-lg");
        ig.classList.add("button");
        a.href = companies[id]["social"]["instagram"];
        a.target = "_blank";
        a.appendChild(fb)
        div_col.appendChild(a);
    }
    if(companies[id]["social"]["twitter"] != ""){
        var a = document.createElement("a");
        var tt = document.createElement("i");
        tt.classList.add("fa");
        tt.classList.add("fa-instagram");
        tt.classList.add("fa-lg");
        tt.classList.add("button");
        a.href = companies[id]["social"]["twitter"];
        a.target = "_blank";
        a.appendChild(tt)
        div_col.appendChild(a);
    }
    if(companies[id]["gmaps_url"] != ""){
        var a = document.createElement("a");
        var gm = document.createElement("i");
        gm.classList.add("fa");
        gm.classList.add("fa-map-marker");
        gm.classList.add("fa-lg");
        gm.classList.add("button");
        a.href = companies[id]["gmaps_url"];
        a.target = "_blank";
        a.appendChild(gm)
        div_col.appendChild(a);
    }
    social_div.appendChild(div_col);
    social.appendChild(social_div);
    info1_div.appendChild(social);


    var info2_div = document.createElement("div");
    info2_div.classList.add("col-xl-6");
    info2_div.classList.add("col-lg-12");
    info2_div.classList.add("details-card-section");

    generate_schedule(id, info2_div);

    if(companies[id]["notes"] != ""){
        var span = document.createElement("span");
        span.innerHTML = "<p><b>Observações</b><br/>"+companies[id]["notes"]+ "</p>";
        info2_div.appendChild(span);
    }

    row.appendChild(info1_div);
    row.appendChild(info2_div);
    card_div.appendChild(row);

    return card_div;
}

function loadSearch(){
    results = document.getElementById('results');
    results.style.display = 'none';
    results.innerHTML = '';
    results.style.display = '';
    selected_id = -1;
    
    county_coords = selected_county;

    $.ajax({
        url: api_url+"companies_by_location?geohash="+county_coords, 
        success : function(data){
            companies_keys = Object.keys(data["companies"]);
            companies_keys.forEach(key => {
               companies.push(data["companies"][key]);
            });
            console.log(data["companies"]);
            if(companies.length > n_results){
                for(loadedResults = 0; loadedResults < n_results; loadedResults ++){
                    results.appendChild(generate_card(companies[loadedResults], loadedResults));
                }
                document.getElementById('loadMore').style.display = '';
            }
            else{
                for(loadedResults = 0; loadedResults < companies.length; loadedResults ++){
                    results.appendChild(generate_card(companies[loadedResults], loadedResults));
                }
            }
        }
    });

    filter_list = document.getElementById("filters").childNodes;
    
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].classList != null){
            filter_list[f].classList.remove("list-group-item-clicked");
        }

    }
    filter_list = document.getElementById("filter_dropdown").childNodes;
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].childNodes.length > 0){
            filter_list[f].childNodes[1].classList.remove("dropdown-item-clicked");
        }
    }

    filters = [];
}

function loadMore(){
    var results = document.getElementById('results');
    var childnodes = results.childNodes;

    if(selected_id != -1){
        var details = document.getElementById('details')
        details.parentNode.removeChild(details);
        childnodes[selected_id].childNodes[1].classList.remove("card-clicked");
    }

    if(filters.length == 0){
        if(loadedResults + n_results < companies.length){
            var temp = loadedResults + n_results;
            for(; loadedResults < temp; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
        }
        else{
            for(; loadedResults < companies.length; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
            document.getElementById('loadMore').style.display = 'none';
        }
    }
    else{
        document.getElementById('loadMore').style.display = 'none';
        var temp = loadedResults + n_results;
        for(c=loadedResults; c < companies.length; c++){
            for(l = 0; l < companies[c]["categories"].length; l++){
                if(filters.indexOf(companies[c]["categories"][l]) >= 0){
                    results.appendChild(generate_card(companies[c], loadedResults));
                    loadedResults++;
                    break;
                }
                
            }
            if(loadedResults >= temp){
                break;
            } 
        }
        if(loadedResults >= temp && c < companies.length -1){
            document.getElementById('loadMore').style.display = '';
        }
    }
    var temp = selected_id
    selected_id = -1;
    loadDetails(temp);
}


function loadDetails(id){
    
    var results = document.getElementById('results');
    var childnodes = results.childNodes;
   
    if(selected_id != -1){
        var details = document.getElementById('details');
        details.parentNode.removeChild(details);
        childnodes[selected_id].childNodes[1].classList.remove("card-clicked");
        childnodes[selected_id].childNodes[1].childNodes[0].childNodes[0].classList.remove("card-title-clicked");
        childnodes[selected_id].childNodes[1].childNodes[0].childNodes[1].classList.remove("card-text-clicked");
    }

    if(selected_id != id){
        selected_id = id;
        childnodes[selected_id].childNodes[1].classList.add("card-clicked");
        childnodes[selected_id].childNodes[1].childNodes[0].childNodes[0].classList.add("card-title-clicked");
        childnodes[selected_id].childNodes[1].childNodes[0].childNodes[1].classList.add("card-text-clicked");
        if(document.getElementsByTagName('body')[0].clientWidth < 992){
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    results.insertBefore(generate_details(id),  childnodes[i+1]);
                    break;
                }
            }
        }
        else if(document.getElementsByTagName('body')[0].clientWidth < 1200){
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    while(i%2 != 1){
                        i++;
                    }
                    results.insertBefore(generate_details(id),  childnodes[i+1]);
                    break;
                }
            }
        }else{
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    while(i%3 != 2){
                        i++;
                    }
                    results.insertBefore(generate_details(id),  childnodes[i+1]);
                    break;
                }
            }
        }
    }
    else{
        selected_id = -1;
    }
}


function filterResults(filter){
    if( document.getElementById(filter).classList.length >= 2){
        document.getElementById(filter).classList.remove("list-group-item-clicked");
        var index = filters.indexOf(filter);
        if (index > -1) {
            filters.splice(index, 1);
        }
    }
    else{
        document.getElementById(filter).classList.add("list-group-item-clicked");
        filters.push(filter);
    }
    
    filter_list = document.getElementById("filter_dropdown").childNodes;
    for(f = 0; f < filter_list.length; f++){
        
        if(filter_list[f].childNodes.length > 0 && filter_list[f].childNodes[1].innerText.split(" ").join("_") == filter){
            
            if(filter_list[f].childNodes[1].classList.length >= 2){
                filter_list[f].childNodes[1].classList.remove("dropdown-item-clicked");
            }
            else{
                filter_list[f].childNodes[1].classList.add("dropdown-item-clicked");
            }
        }
    }

    results = document.getElementById('results');
    results.style.display = 'none';
    results.innerHTML = '';
    selected_id = -1;
 
    document.getElementById('loadMore').style.display = 'none';

    if(filters.length == 0){
        if(companies.length > n_results){
            for(loadedResults = 0; loadedResults < n_results; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
            document.getElementById('loadMore').style.display = '';
        }
        else{
            for(loadedResults = 0; loadedResults < companies.length; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
        }
    }
    else{
        loadedResults = 0;
        for(c=0; c < companies.length; c++){
            for(l = 0; l < companies[c]["categories"].length; l++){
                if(loadedResults >= n_results){
                    break;
                }
                if(filters.indexOf(companies[c]["categories"][l]) >= 0){
                    results.appendChild(generate_card(companies[c], loadedResults));
                    loadedResults++;
                }
            } 
        }
        if(loadedResults >= n_results){
            document.getElementById('loadMore').style.display = '';
        }
    }
    results.style.display = '';

}


function pageLoad(){
    
    companies = [];
    loadedResults = 0;
    selected_id = -1;
    filtres = [];
    document.getElementById('districts').disabled = true;
    document.getElementById('counties').disabled = true;
    document.getElementById('search_button').disabled = true;
    

    filter_list = document.getElementById("filters").childNodes;
    
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].classList != null){
            filter_list[f].classList.remove("list-group-item-clicked");
        }

    }
    filter_list = document.getElementById("filter_dropdown").childNodes;
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].childNodes.length > 0){
            filter_list[f].childNodes[1].classList.remove("dropdown-item-clicked");
        }
    }

    filters = [];

    getDistricts();
}

window.addEventListener('resize', function(event){
    var details = document.getElementById('details');

    if(details != null){
        details.parentNode.removeChild(details);
        
        var results = document.getElementById('results');
        var childnodes = results.childNodes;

        if(document.getElementsByTagName('body')[0].clientWidth < 992){
            for(i = 0; i < childnodes.length; i++){
                if(selected_id == childnodes[i].id){
                    results.insertBefore(details,  childnodes[i+1]);
                    break;
                }
            }
        }
        else if(document.getElementsByTagName('body')[0].clientWidth < 1200){
            for(i = 0; i < childnodes.length; i++){
                if(selected_id == childnodes[i].id){
                    while(i%2 != 1){
                        i++;
                    }
                    results.insertBefore(details,  childnodes[i+1]);
                    break;
                }
            }
        }else{
            for(i = 0; i < childnodes.length; i++){
                if(selected_id == childnodes[i].id){
                    while(i%3 != 2){
                        i++;
                    }
                    results.insertBefore(details,  childnodes[i+1]);
                    break;
                }
            }
        }
    }
});

window.onload = pageLoad;


function compareArrays(ar1, ar2){
    if(ar1.length == ar2.length){
        var index;
        for(index = 0; index < ar1.length; index++){
            if(ar1[index] != ar2[index])
                return false;
        }
        return true;
    }
    return false;
}

function generate_schedule(id, info2_div){
    equal_days = [0, 0];
    for(day = 1; day < days.length; day++){
        if(compareArrays(companies[id]["schedules"][days[day]], companies[id]["schedules"][days[day-1]])){
            equal_days[1] = day;
        }
        else{
            var span = document.createElement("span");
            if(equal_days[0] != equal_days[1]){
                var text = "<p><b>" +days[equal_days[0]] + " - " + days[equal_days[1]] + "</b><br/> | ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | "
                });
                text += "</p>";
                span.innerHTML = text;
            }
            else{
                var text = "<p><b>" + days[equal_days[0]] + "</b><br/> | ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | ";
                });
                text += "</p>";
                span.innerHTML = text;
            }
            info2_div.appendChild(span);
            equal_days = [day, day];
        }
    }
    var span = document.createElement("span");
    if(equal_days[0] != equal_days[1]){
        var text = "<p><b>" +days[equal_days[0]] + " - " + days[equal_days[1]] + "</b><br/> | ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | "
                });
                text += "</p>";
                span.innerHTML = text;
    }
    else{
        var text = "<p><b>" + days[equal_days[0]] + "</b><br/> | ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | ";
                });
                text += "</p>";
                span.innerHTML = text;
    }
    info2_div.appendChild(span);
}