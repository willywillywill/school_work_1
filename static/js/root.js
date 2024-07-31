
const title = ["班級","座號","學號 ","姓名 ","1","2","3","4","5","6"]
function updata_table(){
    $.get("/download_data", function (data, sta){
        const download_data = data;
        $("#download_head").html("")
        for (const i in title){
            $("#download_head").append(`
                <th>${title[i]}</th>
            `)
        }
        $("#download_body").html("")

        for (const i in download_data){
            let out = "";
            for (const j in title){
                if (download_data[i][title[j]] === undefined)
                    download_data[i][title[j]] = ''
                out += `
                    <th>
                        ${download_data[i][title[j]]}
                    </th>
                `
            }
            $("#download_body").append(
                `<tr>${out}</tr>`
            )
        }
    })
}

updata_table()

$("#cls_btn").click(()=>{
    $.get("/cls", {cls:1})
    updata_table()
})

$("#log_off_btn").click(()=>{
    $(window).attr('location',`/final?root=1`);
})