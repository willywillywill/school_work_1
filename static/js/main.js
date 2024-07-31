


$("#table_info").html("");
for (let i=0 ; i<6 ; i++){
    $("#table_info").append(`
        <tr>
            <th>${i+1}</th>
            <th><input id="input_id_${i}" maxlength="6"></th>
            <th id="number_${i}">-</th>
            <th id="yn_${i}">-</th>
        </tr>
    `);
}


const r_keys = ["學校代碼", "校名", "校系科組學程代碼"]


function chick_val(val){
    if (val.toString().length !== 6) return 0
    return val;
}
function get_val(id, fun) {
    $.get(`/search_val`, { id: id }, function (data, sta){
        fun(data, sta)
    });
}
function chick_title(id, fun){
    $.get(`/search_title`, { id: id }, function (data, sta){
        fun(data, sta)
    });
}

function can_click(){
    $("#out_btn").attr("disabled", false);
    $("#out_btn").css("background-color", "rgba(166, 166, 166, 1)");
}
function can_not_click(){
    $("#out_btn").attr("disabled", true);
    $("#out_btn").css("background-color", "#ffffff");
}


can_not_click();
let save_val = [];
let max_val = {}
$("#updata_btn").click(function () {
    save_val = [];
    max_val = {}
    can_click()
    for (let i=0 ; i<6 ; i++){
        const val = chick_val($(`#input_id_${i}`).val());
        if (!val){
            if ($(`#input_id_${i}`).val().length !== 0){
                can_not_click();
            }
            $(`#number_${i}`).text("-")
            $(`#yn_${i}`).text("-")
            continue;
        }
        chick_title(val, function (data, sta){
            const title = val[0]+val[1]+val[2];
            $(`#number_${i}`).text(data)
            $(`#yn_${i}`).text("Y")

            if (title in max_val){
                max_val[title]["now"] += 1
                max_val[title]["l"].push(i)
                if (max_val[title]["now"] > max_val[title]["max"]){
                    for (let j=0 ; j<6 ; j++){
                        const val_2 = chick_val($(`#input_id_${j}`).val());
                        if (!val_2) continue;
                        const title_2 = val_2[0]+val_2[1]+val_2[2];
                        if (title === title_2){
                            $(`#yn_${j}`).text("N")
                            can_not_click();
                        }
                    }
                }
            } else {
                max_val[title] = {"max":data, "now":1, "l":[i]}
            }
        })

        get_val(val, function (data, sta) {
            if (data !== "0") save_val.push(data)
            else {
                $(`#number_${i}`).text("沒有此代碼")
                $(`#yn_${i}`).text("X")
                can_not_click();
            }
        })
    }
});

$("#out_btn").click(function (){
    $("#t_ok_info").html("");
    for (const i in save_val){
        $("#t_ok_info").append(`
            <tr>
                <th>${Number(i)+1}</th>
                <th>${save_val[i]["校名"]}</th>
                <th>${save_val[i]["系名"]}</th>
                <th>${save_val[i]["校系科組學程代碼"]}</th>
            </tr>
        `);
    }
    $("#t_ok").css("visibility", "visible");
});
$("#t_ok_y_btn").click(function () {
    let key = location.href.split("?")[1]
    $.post("/save_info", {info:JSON.stringify(save_val), key:key.split("=")[1]})
    $(window).attr('location','/final');
})
$("#t_ok_n_btn").click(function () {
    $("#t_ok").css("visibility", "hidden");
})


$("#class_btn").click(function () {
    $("#school_table_info").html("");
    $.get("/title_search_val", {id:$("#class_input").val()}, function (data, sta){
        for (let i=0 ; i<data.length ; i++){
            $("#school_table_info").append(`
            <tr>
                <th>${data[i]["學校代碼"]}</th>
                <th>${data[i]["校名"]}</th>
                <th>${data[i]["校系科組學程代碼"]}</th>
                <th>${data[i]["系名"]}</th>
                <th>${data[i]["招生群（類）別"]}</th>
            </tr>
           `)
        }
    })
})

$("#top_btn").click(function (){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
})


