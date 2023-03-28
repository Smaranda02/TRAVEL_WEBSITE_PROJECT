const express = require("express")
const fs=require('fs');  //fs=filesystem
const path=require('path')

obGlobal={
    obErorrs:null,
    obImages:null
}

app=express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd);


vectorFoldere=["temp","temp1"]
for(let folder of vectorFoldere){
    //let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname,folder)
    //caleFolder="./"+folder
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app.set("view engine","ejs");


app.use("/resurse",express.static(__dirname+"/resurse"));


app.get("/favicon.ico", function (req,res){
    res.sendFile(__dirname+"/resurse/ico/favicon.ico")
})

//app use trebuie sa se potriveasca doar cu inceputul caii
//app get vrea calea exacta
// app.use("/resurse",function (req,res){
//     res.send("Ceva");
//     console.log(req.originalUrl)
//     console.log(req.url)
// })

//dupa resurse pot sa am oricate /sn8/9w8d/3rd adica oricate combinatii de litere si cifre  de asta am pus *
app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/,function (req,res) {
    // res.send("Ceva");
    // console.log(req.originalUrl)
    // console.log(req.url)

    afisareEroare(res,403)

})

app.get("/ceva", function(req,res) {
    console.log("cale:",req.url)
    res.send("altceva ip:"+req.ip)
})



app.get(["/index", "/","/home" ], function(req,res) {
    res.render("pagini/index",{ip:req.ip, a:10, b:20});
})

/*
app.get("/despre", function(req,res) {
    res.render("pagini/despre");  //ce am scris aici e locals
})
*/


//vreau fisierele cu expresia ejs
// in regex \w inseamana orice caracter alfanumeric (wildcard)
// ^\w+\.ejs$

app.get("/*.ejs",function (req,res){
    afisareEroare(res,400);
})



app.get("/*",function(req,res){  //functia function data ca parametu e callback (fucntie asincrona)
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                console.log(err);
                if (err.message.startsWith("Failed to lookup view"))
                    //afisareEroare(res,{_identificator:404,_titlu:"ceva"});
                    afisareEroare(res, 404, "titlu custom");
                else afisareEroare(res);
            } else {
                console.log(rezRandare);
                res.send(rezRandare);
            }


        }); //cerere generala
    }catch(err) {
        if (err.message.startsWith("Cannot find module"))
            //afisareEroare(res,{_identificator:404,_titlu:"ceva"});
            afisareEroare(res, 404, "titlu custom");
        else afisareEroare(res);
    }
});




function initErrors(){
    var continut = fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8"); //daca nu are var sau let e globala
    console.log(continut);
    obGlobal.obErrors=JSON.parse(continut);
    let vErrors=obGlobal.obErrors.info_erori;
    //for(let i=0; i<vErrors.length;i++)
    for(let eroare of vErrors){
        eroare.imagine="/"+obGlobal.obErrors.cale_baza+"/"+eroare.imagine;


    }
}

initErrors();

//daca prgramatorul seteaza titlul, se ia titlul din argument
//daca nu e setat se ia cel din json
//daca nu ave, titlul nici in json se ia titlul de la valoare default
//idem pt celelalte

//function afisareEroare(res,{_identificator, _titlu, _text, _imagine} ={} )
function afisareEroare(res,_identificator, _titlu="titlu default", _text,_imagine){
    let vErrors=obGlobal.obErrors.info_erori;
    let eroare=vErrors.find(function (elem) {return elem.identificator===_identificator; })
    if(eroare) {
        let titlu1= _titlu==="titlu default" ?( eroare.titlu || _titlu): _titlu;
        let text1= _text || eroare.text;
        let imagine1= _imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("/pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("/pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});

    }
    else
    {
        let errDef=obGlobal.obErrors.eroare_default;
        res.render("/pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:errDef.imagine});
    }

}


app.listen(8080);

console.log("Server ON");

