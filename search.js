var selected_id = -1;

var loadedResults = 0;

var n_results = 1;

var api_url = "http://127.0.0.1:8000/";

var companies = [];

var days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];

var selected_county;

var filters = [];

window.onload = getDistricts;

function getDistricts(){
    $.ajax({
        url: api_url+"all_districts", 
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
    select.disabled = "true";

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

            select.removeAttribute("disabled");
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
    card_div.classList.add('col-lg-3');
    card_div.classList.add('col-md-6');
    card_div.classList.add('col-sm-12');
    card_div.onclick = function(){loadDetails(id)};
    card_div.id = id;

    var img = document.createElement('img');
    img.classList.add('card-img-top');
    img.src = company["imagens"]["logotipo"];
    img.alt = "Logo of the Company";
    
    var info_div = document.createElement('div');
    info_div.classList.add("card");

    var inside_div = document.createElement('div');
    inside_div.classList.add("card-body");

    var title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerText = company["nome"];

    var text = document.createElement('p');
    text.innerText = "Closed";
    var i = 0;
    for(; i < company["horarios"][week_day].length; i++){
        var work_times = company["horarios"][week_day][i].split("-")
        var start_time = work_times[0].split(":");
        var end_time = work_times[1].split(":");
        if((start_time[0] < hour) || (start_time[0] == hour && start_time[1] <= minutes)){
            if((end_time[0] > hour) ||  (end_time[0] == hour && end_time[1] > minutes)){
                text.innerText = company["horarios"][week_day][i];
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
    card_div.classList.add("col-lg-12");
    card_div.classList.add("detail-card");
    card_div.id = "details";
    var row = document.createElement("div");
    row.classList.add("row");

    var info1_div = document.createElement("div");
    info1_div.classList.add("col-lg-4");

    var row_info1 = document.createElement("div");
    row_info1.classList.add("row");
    
    var morada = document.createElement("p");
    morada.innerText = companies[id]["morada"];
    morada.classList.add("col-lg-12");
    row_info1.appendChild(morada);

    companies[id]["contactos"]["telemovel"].forEach(contacto => {
        var c = document.createElement("p");
        c.innerText = contacto;
        c.classList.add("col-lg-12");
        row_info1.appendChild(c);
    });

    var entrega = document.createElement("p");
    entrega.innerText = "Entregas ao Domicílio: "
    entrega.classList.add("col-lg-12");
    var resultado_entrega = document.createElement("p");
    resultado_entrega.classList.add("col-lg-12");
    resultado_entrega.innerText = companies["entrega_em_casa"] ? "Sim" : "Não";

    row_info1.appendChild(entrega);
    row_info1.appendChild(resultado_entrega);

    info1_div.appendChild(row_info1);

    var info2_div = document.createElement("div");
    info2_div.classList.add("col-lg-8");

    var row_info2 = document.createElement("div");
    row_info2.classList.add("row");

    var desc = document.createElement("p");
    desc.innerText = "Descrição"
    desc.classList.add("col-lg-12");
    var desc_text = document.createElement("p");
    desc_text.classList.add("col-lg-12");
    desc_text.innerText = companies[id]["notas"];

    row_info2.appendChild(desc);
    row_info2.appendChild(desc_text);

    var site = document.createElement("a");
    site.classList.add("col-lg-12");
    site.href =  companies[id]["redes_sociais"]["facebook"];
    site.innerText = "Facebook";

    row_info2.appendChild(site);

    info2_div.appendChild(row_info2);

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
    
    county_coords = selected_county[1];

    $.ajax({
        url: api_url+"companies_by_location?geohash="+county_coords, 
        success : function(data){
            if(data["companies"].length > n_results){
                for(loadedResults = 0; loadedResults < n_results; loadedResults ++){
                    results.appendChild(generate_card(data["companies"][loadedResults], loadedResults));
                }
                document.getElementById('loadMore').style.display = '';
            }
            else{
                for(loadedResults = 0; loadedResults < data["companies"].length; loadedResults ++){
                    results.appendChild(generate_card(data["companies"][loadedResults], loadedResults));
                }
            }
            companies = data["companies"];
        }
    });

    filter_list = document.getElementById("filters").childNodes;
    
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].classList != null){
            filter_list[f].classList.remove("list-group-item-clicked");
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
        console.log(loadedResults);
        for(c=loadedResults; c < companies.length; c++){
            for(l = 0; l < companies[c]["categorias"].length; l++){
                if(filters.indexOf(companies[c]["categorias"][l]) >= 0){
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
        var details = document.getElementById('details')
        details.parentNode.removeChild(details);
        childnodes[selected_id].childNodes[1].classList.remove("card-clicked");
    }

    if(selected_id != id){
        selected_id = id;
        childnodes[selected_id].childNodes[1].classList.add("card-clicked");
        
        if(document.getElementsByTagName('body')[0].clientWidth < 750){
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    results.insertBefore(document.getElementById('results').appendChild(generate_details(id)),  childnodes[i+1]);
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
                    results.insertBefore(document.getElementById('results').appendChild(generate_details(id)),  childnodes[i+1]);
                    break;
                }
            }
        }else{
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    while(i%4 != 3){
                        i++;
                    }
                    results.insertBefore(document.getElementById('results').appendChild(generate_details(id)),  childnodes[i+1]);
                    break;
                }
            }
        }
    }
    else{
        selected_id = -1;
    }
}


function filerResults(filter){
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
            for(l = 0; l < companies[c]["categorias"].length; l++){
                if(loadedResults >= n_results){
                    break;
                }
                if(filters.indexOf(companies[c]["categorias"][l]) >= 0){
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







window.addEventListener('resize', function(event){
    var details = document.getElementById('details');

    if(  details != null){
        details.parentNode.removeChild(details);
        
        var results = document.getElementById('results');
        var childnodes = results.childNodes;

        if(document.getElementsByTagName('body')[0].clientWidth < 750){
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