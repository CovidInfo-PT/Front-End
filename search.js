var selected_id = -1;

var loadedResults = 0;

var api_url = "http://api.proxi-mo.pt/";

var all_districts = ["Ilha Terceira","Ilha de Porto Santo","Ilha Graciosa","Ilha de São Miguel","Coimbra","Santarém","Vila Real","Viana do Castelo","Bragança","Leiria","Ilha do Faial","Ilha de Santa Maria","Portalegre","Castelo Branco","Ilha do Corvo","Viseu","Beja","Setúbal","Aveiro","Lisboa","Braga","Guarda","Porto","Ilha das Flores",    "Ilha do Pico","Ilha da Madeira","Ilha de São Jorge","Faro","Évora"];

var counties = [ ["Murtosa","ez1zervsvt2j"], ["Ovar","ez3b75y269m2"], ["Santa Maria da Feira","ez3bvd5rv6u7"], ["Mealhada","ez1vxc03u99j"], ["Vale de Cambra","ez60693wcgd8"], ["Vagos","ez1y6jmtk6p1"], ["Aveiro","ez1z5n6s01wc"], ["Anadia","ez1ypu6tk2eb"], ["Albergaria-a-Velha","ez1zx0hw7y49"], ["Castelo de Paiva","ez616gtvgu6h"], ["Ílhavo", "ez1yfz10us2j"], ["São João da Madeira","ez3bwvfpchsd"], ["Oliveira do Bairro","ez1yqxrdp594"], ["Oliveira de Azeméis","ez3br4d8mrsd"], ["Estarreja","ez1zuu3kj8bc"], ["Sever do Vouga","ez4p9x07g37u"], ["Águeda","ez4nbqp8uguw"], ["Espinho","ez3c73kgp1hj"], ["Arouca","ez60u6uu0zcy"] ];

window.onload = getDistricts;


function getDistricts(){
    console.log("entrei");
    var select = document.getElementById('districts');

    for(i = 0; i < all_districts.length; i++){
        var option = document.createElement('option');
        option.value = all_districts[i];
        option.text = all_districts[i];
        select.add(option, i);
    }
    select.removeAttribute("disabled");
}

function getCounty(){
    selected_district = document.getElementById('districts').options[document.getElementById('districts').selectedIndex ].innerHTML;

    var select = document.getElementById('counties');
    select.innerHTML = '';
    select.disabled = "true";

    if(selected_district != "Distrito"){
        var option = document.createElement('option');
        option.value = "Concelho";
        option.text = "Concelho";
        select.add(option, i);
        for(i = 0; i < counties.length; i++){
            var option = document.createElement('option');
            option.value = i;
            option.text = counties[i][0];
            select.add(option, i);
        }

       select.removeAttribute("disabled");
    }
    else{
        var option = document.createElement('option');
        option.value = "Concelho";
        option.text = "Concelho";
        select.add(option, i);
    }
}

function generate_card(id){
    var card_div = document.createElement('div');
    card_div.classList.add('col-lg-3');
    card_div.classList.add('col-md-6');
    card_div.classList.add('col-sm-12');
    card_div.onclick = function(){loadDetails(id)};
    card_div.id = id;

    var img = document.createElement('img');
    img.classList.add('card-img-top');
    img.src = "http://placehold.it/700x400";
    img.alt = "";
    
    var info_div = document.createElement('div');
    info_div.classList.add("card");

    var inside_div = document.createElement('div');
    inside_div.classList.add("card-body");

    var title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerText = "Item One";

    var text = document.createElement('p');
    text.innerText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet numquam aspernatur!";
    text.classList.add("card-text");

    inside_div.appendChild(title);
    inside_div.appendChild(text);

    info_div.appendChild(inside_div);


    card_div.appendChild(img);
    card_div.appendChild(info_div);

    return card_div;
}

function generate_details(info){
    var card_div = document.createElement('div');
    card_div.classList.add('col-lg-12');
    card_div.classList.add('col-md-12');
    card_div.classList.add('col-sm-12');
    card_div.id = "details";

    var info_div = document.createElement('div');
    info_div.classList.add("card");

    var inside_div = document.createElement('div');
    inside_div.classList.add("card-body");

    var title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerText = "Title 1";

    var text = document.createElement('p');
    text.innerText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet numquam aspernatur!";
    text.classList.add("card-text");

    inside_div.appendChild(title);
    inside_div.appendChild(text);

    info_div.appendChild(inside_div);

    card_div.appendChild(info_div);

    return card_div;
}

function loadSearch(){
    results = document.getElementById('results');
    results.style.display = 'none';
    results.innerHTML = '';
    
    for(loadedResults = 0; loadedResults < 10; loadedResults++){
        results.appendChild(generate_card(loadedResults));
    }

    results.style.display = '';
    if(loadedResults < 20){
        document.getElementById('loadMore').style.display = '';
    }
}

function loadDetails(id){
    
    if(selected_id != -1){
        var details = document.getElementById('details')
        details.parentNode.removeChild(details);
    }
    selected_id = id;

    var results = document.getElementById('results');
    var childnodes = results.childNodes;

    if(document.getElementsByTagName('body')[0].clientWidth < 750){
        for(i = 0; i < childnodes.length; i++){
            if(id == childnodes[i].id){
                results.insertBefore(document.getElementById('results').appendChild(generate_details()),  childnodes[i+1]);
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
                results.insertBefore(document.getElementById('results').appendChild(generate_details()),  childnodes[i+1]);
                break;
            }
        }
    }else{
        for(i = 0; i < childnodes.length; i++){
            if(id == childnodes[i].id){
                while(i%3 != 2){
                    i++;
                }
                results.insertBefore(document.getElementById('results').appendChild(generate_details()),  childnodes[i+1]);
                break;
            }
        }
    }
}

function loadMore(){
    for(; loadedResults <= 20; loadedResults++){
        results.appendChild(generate_card(loadedResults));
    }
    if(loadedResults >= 20){
        document.getElementById('loadMore').style.display = 'none';
    }
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