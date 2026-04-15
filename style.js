let rule_logic = document.getElementById("rules_logic");
let bal_section = document.getElementById("balance_section")
let opt_title = document.getElementById("opt_title")
let game_section = document.getElementById("game_section");
let how_to_section = document.getElementById("how_to_section")
let foot_section = document.getElementById("foot_section")
let section3 = document.getElementById("section3")



const params = new URLSearchParams(window.location.search);
if (params.get("action")) {
    if (params.get("action") == "rules") {
        bal_section.style.display = "none"
        opt_title.style.display = "none"
        game_section.style.display = "none"
        how_to_section.style.display = "none"
        foot_section.style.display = "none"
        section3.style.display = "none"

        rule_logic.style.display = "flex"


    }
}

function showRules() {
    window.location.search = "?action=rules";
}

function hideRules() {
    window.location.search = "";

    bal_section.style.display = "flex"
    opt_title.style.display = "flex"
    game_section.style.display = "flex"
    how_to_section.style.display = "flex"
    foot_section.style.display = "flex"
    section3.style.display = "flex"

    rule_logic.style.display = "none"
}
