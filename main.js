const url_params = new URL(window.location.href);
const params = new URLSearchParams(url_params.search);
var ads = false;
var user_favs = ",";
var user_eps = ",";
var user_login = 0;
var user_history = ",";
if (localStorage.getItem('user_login') != null)
    user_login = localStorage.getItem('user_login');
else
    localStorage.setItem("user_login", 0);
if (localStorage.getItem('user_favs') != null)
    user_favs = localStorage.getItem('user_favs');
else
    localStorage.setItem("user_favs", ",");
if (localStorage.getItem('user_history') != null)
    user_history = localStorage.getItem('user_history');
else
    localStorage.setItem("user_history", ",");
if (localStorage.getItem('user_eps') != null)
    user_eps = localStorage.getItem('user_eps');
else
    localStorage.setItem("user_eps", ",");

function alertToast(message) {
    MegaFlix.showToast(message);
}
var alertAppTime;

function alertApp(message) {
    clearInterval(alertAppTime);
    $(".alertNew .bar span").text(message);
    $(".alertNew").removeClass("off").addClass("on");
    alertAppTime = setTimeout(function() {
        $(".alertNew").removeClass("on").addClass("off");
    }, 3500);
}
$(".alertNew").on("click", function() {
    clearInterval(alertAppTime);
    $(".alertNew").removeClass("on").addClass("off");
});

function errorServer() {
    loading(0);
    MegaFlix.showToast("Não foi possivel se conectar com o servidor, tente novamente.");
}

function openAds() {
    MegaFlix.showToast("Iniciando anuncio...\nisso ajuda a manter o MegaFlix online.")
    MegaFlix.showAds();
}

function loading(status) {
    if (status == 1)
        $("#loading").removeClass("off").addClass("on");
    else
        $("#loading").removeClass("on").addClass("off");
}
var backInit = 0;
var backAnt = 0;

function updateBack(id) {
    backAnt = backInit, backInit = id;
}

function pressBackAction() {
    if ($("#adVast").css("display") == "none") {
        if (backInit == 0)
            MegaFlix.closeApp();
        if (backInit == 1)
            closeMenu();
        if (backInit == 2)
            $("#view").removeClass("on").addClass("off");
        if (backInit == 3)
            close_episodes();
        if (backInit == 4)
            close_options();
        if (backInit == 5)
            $('#report').hide();
        if (backInit != 0 || backInit < 6)
            if (backInit != 4)
                backInit = backInit - 1;
            else
                backInit = backAnt;
    }
}

function pageSaga(id) {
    loading(1), closeMenu();
    $.ajax({
        url: appApi + "?page=sagas",
        method: "POST",
        data: {
            id: id
        }
    }).done(function(result) {
        $("#page").html(result);
        $(".open-page").removeClass("active");
        $(".lazyload").lazyload();
        loading(0);
    }).fail(function(jqXHR, textStatus, msg) {
        errorServer();
    });
}
$(document).on("click", ".sagaItem", function(e) {
    var sagaId = $(this).data("id");
    pageSaga(sagaId);
});
$(document).on("click", ".open-page", function(e) {
    loading(1), closeMenu();
    var page = $(this).data("page");
    $.ajax({
        url: appApi + "?page=" + page,
        method: "POST",
        data: {
            favs: user_favs,
            history: user_history,
            user_login: user_login
        }
    }).done(function(result) {
        $("#page").html(result);
        $(".open-page").removeClass("active");
        $(".content").animate({
            scrollTop: 0
        }, {
            duration: 1,
        });
        $(`[data-page="${page}"]`).addClass("active");
        $(".lazyload").lazyload();
        loading(0)
    }).fail(function(jqXHR, textStatus, msg) {
        errorServer();
    });
});
$(".navbar_icon").click(function(e) {
    $(".navbar").removeClass("off").addClass("on");
});
$(".navbar .close").click(function(e) {
    $(".navbar").removeClass("on").addClass("off");
});
var updateValues = function() {
    $(".dates").text(`${from} - ${to}`);
};
var explorar = function(page) {
    var title = $("#title").val();
    var tipo = $("#tipo").val();
    var genero = $("#genero").val();
    var ordem = $("#ordem").val();
    var min_date = from;
    var max_date = to;
    loading(1);
    $.ajax({
        url: appApi + "?page=search",
        method: "POST",
        data: {
            page: page,
            title: title,
            tipo: tipo,
            genero: genero,
            ordem: ordem,
            min_date: min_date,
            max_date: max_date
        }
    }).done(function(result) {
        $("#result").html(result);
        $(".content").animate({
            scrollTop: 0
        }, {
            duration: 1000,
            complete: function() {
                loading(0);
                $(".lazyload").lazyload();
            }
        });
        $("#page_select").change(function() {
            var page = $("#page_select").val();
            explorar(page);
        });
    }).fail(function(jqXHR, textStatus, msg) {
        errorServer();
    });
}

function open_tv(id) {
    loading(1)
    $.ajax({
        url: appApi + "?page=view_tv",
        method: "POST",
        data: {
            item: id
        }
    }).done(function(result) {
        updateBack(2);
        loading(0);
        $("#view").html(result);
        $("#view").removeClass("off").addClass("on");
    }).fail(function(jqXHR, textStatus, msg) {
        errorServer();
    });
}

function openMenu() {
    $(".menu_full").show();
    $(".menu_full .ltr").removeClass("off").addClass("on");
    menu_full = 1, updateBack(1);
}

function closeMenu() {
    $(".menu_full .ltr").removeClass("on").addClass("off");
    setTimeout(function() {
        $(".menu_full").hide();
    }, 410);
    menu_full = 0;
}
var menu_full = 0;
$(".menu-full").click(function(e) {
    openMenu();
});
$(document).on('click', function(e) {
    if (menu_full == 1 && e.target.className == "menu_full")
        pressBackAction();
});
var heart;

function openMovie(id) {
    closeMenu(), loading(1);
    $.ajax({
        url: appApi + "?page=view",
        method: "POST",
        data: {
            item: id
        }
    }).done(function(result) {
        updateBack(2);
        loading(0);
        $("#view").html(result);
        $("#view").removeClass("off").addClass("on");
        heart = false;
        $(".heart").html("<i class=\"fa-sharp fa-regular fa-heart\"></i>")
        if (user_favs.includes(`,${item_id},`))
            heart = true, $(".heart").html("<i class=\"fa-sharp fa-solid fa-heart\"></i>");
    }).fail(function(jqXHR, textStatus, msg) {
        errorServer();
    });
}
$(document).on('click', '.heart', function(e) {
    if (user_login == 0)
        $('[data-page="user"]').click(), $("#view").removeClass("on").addClass("off");
    else
    if (heart)
        $(this).html("<i class=\"fa-sharp fa-regular fa-heart\"></i>"), user_favs = user_favs.replace(`,${item_id},`, ","), heart = false, console.log(item_titulo + " removido dos favoritos");
    else
        $(this).html("<i class=\"fa-sharp fa-solid fa-heart\"></i>"), user_favs += item_id + ",", heart = true, console.log(item_titulo + " adicionado aos favoritos");
    localStorage.setItem("user_favs", user_favs), $.ajax({
        url: appApi + "?page=update_favs",
        method: "POST",
        data: {
            user_favs: user_favs,
            user_login: user_login
        }
    }).done(function(result) {
        if (result != "OK")
            alertToast(result);
    });
});

function close_episodes() {
    $(".modal_episodes .box").removeClass("on").addClass("off");
    setTimeout(function() {
        $(".modal_episodes").hide(0)
    }, 800);
}

function close_options() {
    $(".modal_view .box").removeClass("on").addClass("off");
    setTimeout(function() {
        $(".modal_view").hide(0)
    }, 800);
}

function open_seasons(qnt) {
    updateBack(3);
    $("#select_season").empty();
    for (i = 1; i < qnt + 1; i++) {
        $('#select_season').append($('<option>', {
            value: i,
            text: 'Temporada ' + i
        }));
    }
    $("#select_season").change();
    $(".modal_episodes").show(0, function() {
        $(".modal_episodes .box").removeClass("off").addClass("on");
    });
}

function playerName(name) {
    var namePlayer = "Alternativo";
    if (name.includes("wish") || name.includes("swhoi"))
        namePlayer = "Wish";
    if (name.includes("hide"))
        namePlayer = "Hide";
    if (name.includes("moon"))
        namePlayer = "Moon";
    if (name.includes("ed."))
        namePlayer = "Bed";
    if (name.includes("dood"))
        namePlayer = "Dood";
    return namePlayer;
}

function open_options(urlBR, urlENG, data) {
    updateBack(4);
    item_data = data;
    $("#select_option").empty();
    if (urlBR) {
        i = 0, urlBR.split(",").forEach(function(value) {
            i++, $('#select_option').append($('<option>', {
                value: value,
                text: `Dub#${i} - ${playerName(value)}`
            }));
        });
    }
    if (urlENG) {
        i = 0, urlENG.split(",").forEach(function(value) {
            i++, $('#select_option').append($('<option>', {
                value: value,
                text: `Leg#${i} - ${playerName(value)}`
            }));
        });
    }
    $("#select_option").change();
    $(".modal_view").show(0, function() {
        $(".modal_view .box").removeClass("off").addClass("on");
    });
}
$(document).on("change", '#select_season', function() {
    loading(1);
    $.ajax({
        url: appApi + "?page=seasons",
        method: "POST",
        data: {
            item: item_id,
            season: this.value,
            user_eps: user_eps
        }
    }).done(function(result) {
        loading(0);
        $(".episodes").html(result);
        $(".lazyload").lazyload();
    }).fail(function(jqXHR, textStatus, msg) {
        errorServer();
    });
});
$(document).on("change", '#select_option', function(e) {
    console.log(this.value);
    url = this.value;
    $(".modal_view .buttons").empty();
    $(".modal_view .buttons").append(`<div class="option" data-url="` + url + `" data-type="app">Assistir</div>`);
    if (url.includes("wish") || url.includes("swhoi") || url.includes("hide") || url.includes("megafrixapi.com") || url.includes("moon") || url.includes("ed."))
        $(".modal_view .buttons").append(`<div class="option" data-url="` + url + `" data-type="ext">Assistir Externo</div>`);
    else
        $(".modal_view .buttons").append(`<div class="option off" style="opacity:0.3">Assistir Externo</div>`);
    $(".modal_view .buttons").append(`<div class="option" data-url="` + url + `" data-type="cast">Transmitir</div>`);
    if (url.includes("wish") || url.includes("swhoi") || url.includes("hide") || url.includes("megafrixapi.com")) {
        var url_down = url;
        if (url.includes("hide"))
            url_down = url_down.replace("/v/", "/d/"), url_down = url_down.replace("/embed/", "/d/");
        if (url.includes("wish") || url.includes("swhoi"))
            url_down = url_down.replace("/e/", "/f/");
        $(".modal_view .buttons").append(`<div class="option" data-url="` + url_down + `" data-type="download">Baixar</div>`);
    } else if (url.includes("bembed") || url.includes("moon")) {
        var url_down = url;
        url_down = url_down.replace("/e/", "/d/");
        $(".modal_view .buttons").append(`<div class="option off" onclick="MegaFlix.showToast('Continue o download pelo navegador.');MegaFlix.openBrowser('${url_down}');">Baixar</div>`);
    } else
        $(".modal_view .buttons").append(`<div class="option off" style="opacity:0.3" data-url="` + url_down + `" data-type="download">Baixar</div>`);
    $(".modal_view .buttons").append(`
        <div style="margin-top:15px;font-size: 12px;margin-bottom: 5px;">Problemas ao assistir?</div>
        <div class="option report" data-url="` + url + `" data-type="report">Suporte</div>
        `);
});
$(document).on("submit", '#report form', function(e) {
    loading(1), e.preventDefault();
    $.post({
        url: appApi + "?page=report_url",
        data: $(this).serialize() + "&user=" + user_login,
        success: function(data) {
            $('#report').css("display", "none");
            loading(0);
            MegaFlix.showToast(data);
        }
    });
});
$(document).on("click", '.buttons .option.report', function() {
    MegaFlix.openBrowser("https://t.me/megaflix_app");
});
$(document).on("click", '.buttons .option:not(.report):not(.off)', function() {
    url_op = $(this).data("url");
    type_op = $(this).data("type");
    id_op = item_data.split(";")[0];
    if (id_op.includes("ep"))
        mark_ep(id_op);
    console.log(url_op);
    MegaFlix.getSource(url_op, type_op, item_data);
});

function add_hist(id) {
    user_history = user_history.replace(`,${id},`, ",");
    user_history += id + ",";
    localStorage.setItem("user_history", user_history);
}

function remove_hist(id) {
    user_history = user_history.replace(`,${id},`, ",");
    localStorage.setItem("user_history", user_history);
    $("#hist_" + id).remove();
}

function update_hist(id, title, img) {
    $("#hist_" + id).remove();
    $(".items.historico").prepend(`<div class="item" id="hist_${id}">
                            <div class="box-historico">
                                <div class="image"><img src="${img}"></div>
                                <div class="infos" onclick="openMovie(${id});">
                                    <div class="title">${title}</div>
                                    <div class="desc">Continue assistindo</div>
                                </div>
                                <div class="play" onclick="remove_hist(${id})"><i class="fa-solid fa-times"></i> </div>
                            </div>
                        </div>`)
}

function mark_ep(id) {
    user_eps = user_eps.replace(`,${id},`, ",");
    user_eps += id + ",";
    localStorage.setItem("user_eps", user_eps);
    $("#view_" + id).attr("onclick", "unmark_ep('" + id + "')").css("color", "#c9c9c9").html("<i class=\"fa-regular fa-eye\"></i>")
}

function unmark_ep(id) {
    user_eps = user_eps.replace(`,${id},`, ",");
    localStorage.setItem("user_eps", user_eps);
    $("#view_" + id).attr("onclick", "mark_ep('" + id + "')").css("color", "#6c6c6c").html("<i class=\"fa-regular fa-eye-slash\"></i>")
}

function logout() {
    user_favs = ",", user_login = 0, ads = true, localStorage.setItem("user_favs", ","), localStorage.setItem("user_login", 0), $(".menu_full .user .btn_open_profile").text("Entrar"), $(".menu_full .user .name").text("Guest 26042009"), $(".menu_full .user .image").attr("src", "https://img.estadao.com.br/resources/jpg/7/0/1583359510707.jpg"), $('[data-page="user"]').click();
}

function verifyUser() {
    $.ajax({
        url: appApi + "?page=verify_user",
        method: "POST",
        data: {
            user_login: user_login
        },
        success: function(data) {
            var data = JSON.parse(data);
            if (data.guest)
                logout();
            else
                ads = data.ads, user_favs = data.info.favoritos, localStorage.setItem("user_favs", user_favs), $(".menu_full .user .btn_open_profile").text("Meu Perfil"), $(".menu_full .user .name").text(data.info.name), $(".menu_full .user .image").attr("src", data.info.avatar);
        }
    });
}

function startApp() {
    $.ajax({
        url: appApi + "?page=home",
        method: "POST",
        data: {
            history: user_history
        }
    }).done(function(data) {
        $("#page").html(data);
        setTimeout(function() {
            $("#loading").removeClass("on").addClass("off").css("background-color", "rgb(17 24 30 / 96%)");
            $(".versionLoading").remove();
        }, 200);
        $(".lazyload").lazyload();
        if (user_login != 0)
            verifyUser();
        if (params.get("item") != null)
            openMovie(params.get("item"));
        $("#versionApp").text("V" + appVersion);
        MegaFlix.appIsLoad();
    }).fail(function(jqXHR, textStatus, msg) {
        $(".error").css("visibility", "visible");
    });
}
$(function() {
    startApp();
});