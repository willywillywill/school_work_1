
const express = require("express")
const app = express();
const XLSX = require("xlsx");
const path = require("path");
var bodyParser = require('body-parser');
const file1 = "static/xls/school.xls";
const workbook = XLSX.readFile(file1);
const title1 = "四技甄選簡章資料";
const title2 = "可報名之系科組學程數";
const w1 = XLSX.utils.sheet_to_json(workbook.Sheets[title1]);
const w2 = XLSX.utils.sheet_to_json(workbook.Sheets[title2]);

const id_workbook = XLSX.readFile("static/xls/身分.xlsx")
const w3 = XLSX.utils.sheet_to_json(id_workbook.Sheets["身分"])
const sheet_name = "final"
let id2key = {}
let key2idx = {}

app.use("/public", express.static(path.join(__dirname, "static", )))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "static", "html/Sign.html"))
})

app.post("/chick_id", function (req, res){
    const info = req.body
    let key = "NO";
    if (info.password === 'root'){
        key = "root+"+Math.random().toString();
        key2idx["root"] = key;
        id2key["root"] = key;
    } else{
        for (const i in w3){
            if ((w3[i]["密碼"].toString() === info.password.toString()) && (w3[i]["帳號"].toString() === info.account.toString())){
                if (w3[i]["密碼"].toString() in id2key)
                    key = id2key[w3[i]["密碼"].toString()]
                else
                    key = Math.random().toString();

                key2idx[key] = i;
                id2key[w3[i]["密碼"].toString()] = key;
                break;
            }
        }
    }

    res.send(key);
});

app.get(`/write`, (req,res)=>{
    try{
        let yn = 0;
        const key = req.query.key.toString().split(" ")

        if (key.length === 1){
            if (key in key2idx) yn = 1;
        } else{
            if (key[0] === "root" && key2idx["root"] === "root+"+key[1].toString())
                yn = 2;
        }

        if (yn===1){
            res.sendFile(path.join(__dirname, "static", "html/index.html"))
        } else if (yn===2){
            res.sendFile(path.join(__dirname, "static", "html/root.html"))
        } else{
            res.sendFile(path.join(__dirname, "static", "html/err.html"))
        }
    } catch (e) {
        res.sendFile(path.join(__dirname, "static", "html/err.html"))
    }

});

app.get("/final", (req, res)=>{
    if (req.query.root === "1"){
        if ("root" in key2idx)
            delete key2idx["root"];
        if ("root" in id2key)
            delete id2key["root"];
    }
    res.sendFile(path.join(__dirname, "static", "html/final.html"))
})

function ec(r, c) {
    return XLSX.utils.encode_cell({ r: r, c: c });
}
app.post("/save_info", (req,res)=>{
    const info = JSON.parse(req.body.info)
    const key = req.body.key.toString()

    const idx = key2idx[key];
    let out = [w3[idx]["班級"], w3[idx]["座號"], w3[idx]["學號"], w3[idx]["姓名"]]

    for (let j=0 ; j<info.length ; j++){
        out.push(info[j]["校系科組學程代碼"])
    }


    let workbook = XLSX.readFile("static/xls/ok.xlsx")
    let sheet = workbook.Sheets["final"];
    const variable = XLSX.utils.decode_range(sheet['!ref']);
    variable.e.r++;
    variable.e.c = 0;
    let rc = XLSX.utils.encode_range(variable.s, variable.e).split(":")[1];
    //console.log(workbook.Sheets[sheet_name])
    XLSX.utils.sheet_add_aoa(workbook.Sheets[sheet_name], [out], { origin: rc })
    XLSX.writeFile(workbook, "static/xls/ok.xlsx")

    if (id2key[w3[idx]["密碼"].toString()] in key2idx)
        delete key2idx[id2key[w3[idx]["密碼"].toString()]];
    if (w3[idx]["密碼"].toString() in id2key)
        delete id2key[w3[idx]["密碼"].toString()];

})

app.get("/search_title", (req, res)=>{
    let str_val = req.query.id;
    let head = str_val[0]+str_val[1]+str_val[2];
    let ok=0;
    for (let i=0; i<w1.length ; i++){
        if (w2[i]["學校代碼"].toString()===head){
            ok = w2[i]["可報名之系科組學程數"];
            break;
        }
    }
    if (!ok){
        ok = -1;
    }
    res.send(ok.toString());
});

app.get("/download_data", (req, res)=>{
    const workbook = XLSX.readFile("static/xls/ok.xlsx")
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name])
    res.send(data)
})


app.get("/cls", (req, res)=>{
    if (req.query.cls === "1") {
        let workbook = XLSX.readFile("static/xls/ok.xlsx")
        let sheet = workbook.Sheets["final"]
        const variable = XLSX.utils.decode_range(sheet['!ref']);
        for (let i =1 ; i<=variable.e.r ; i++){
            for (let j=0; j<11 ; j++){
                sheet[ec(i,j)] = undefined
            }
        }
        variable.e.r--;
        sheet['!ref'] = XLSX.utils.encode_range(variable.s, variable.e);
        workbook.Sheets["final"] = sheet;
        XLSX.writeFile(workbook, "static/xls/ok.xlsx")
    }
    res.send("ok")
})

function get_w1_title(title){
    let out = Array();

    for (let i=0 ; i<w1.length ; i++){
        let t = w1[i]["招生群（類）別"];
        t = t[0]+t[1];
        if (t===title){
            out.push(w1[i]);
        }
    }
    if (title==='09'){
        let out2 = get_w1_title('21');
        out = out.concat(out2);
    }
    return out;
}
function search_w1(val){
    for (let i=0 ; i<w1.length ; i++){
        if (w1[i]["校系科組學程代碼"].toString()===val.toString()) return w1[i];
    }
    return "0";
}

app.get("/search_val", (req, res)=>{
    const id = req.query.id
    const out = search_w1(id)
    res.send(out)
});
app.get("/title_search_val", (req, res)=>{
    const title = req.query.id.toString()

    let out = Array();
    for (let i=0 ; i<w1.length ; i++){
        let t = w1[i]["招生群（類）別"];
        t = t[0]+t[1];
        if (t===title){
            out.push(w1[i]);
        }
    }
    if (title==='09'){
        let out2 = get_w1_title('21');
        out = out.concat(out2);
    }
    res.send(out)
})

app.listen(3000, ()=>{
    console.log('Server is running at http://localhost:3000/');
})

