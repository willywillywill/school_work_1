
$("#sign_btn").click(function () {
    const account = $("#account_input").val().toString()
    const password = $("#password_input").val().toString()

    $.post(`/chick_id`, {account:account, password:password}, function (data, sta) {
        if (data==="NO"){
            $("#account_input").css("background-color", "rgba(229, 154, 154, 0.55)");
            $("#password_input").css("background-color", "rgba(229, 154, 154, 0.55)");
        } else{
            $(window).attr('location',`/write?key=${data}`);
        }
    })
})