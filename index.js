const express = require("express")
const fs=require('fs');  //fs=filesystem

obGlobal={
    obErorrs:null,
    obImages:null
}

app=express();
console.log("Folder proiect", __dirname);


app.set("view engine","ejs");


app.use("/resurse",express.static(__dirname+"/resurse"));




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

app.get("/*",function(req,res){  //functia function data ca parametu e callback (fucntie asincrona)
    res.render("pagini"+req.url,function(err,rezRandare){
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view"))
                afisareEroare(res,404);
            else afisareEroare(res);
        }

        else {
            console.log(rezRandare);
            res.send(rezRandare);
        }


    }); //cerere generala
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

function afisareEroare(res,_identificator, _titlu, _text,_imagine){
    let vErrors=obGlobal.obErrors.info_erori;
    let eroare=vErrors.find(function (elem) {return elem.identificator==_identificator; })
    if(eroare) {
        let titlu1= _titlu || eroare.titlu;
        let text1= _text || eroare.text;
        let imagine1= _imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});

    }
    else
    {
        let errDef=obGlobal.obErrors.eroare_default;
        res.render("pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:errDef.imagine});
    }

}


app.listen(8080);

console.log("Server ON");

