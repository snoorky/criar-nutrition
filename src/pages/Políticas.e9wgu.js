import wixWindowFrontend from 'wix-window-frontend';

$w.onReady(async function () {
    const sections = ["#secDevolucoes", "#secTrocas", "#secEntrega", "#secPrivacidade"];
    const buttons = ["#btnDevolucoes", "#btnTrocas", "#btnEntrega", "#btnPrivacidade"];
    const buttonMainColor = "#e8694d";

    const isDesktop = wixWindowFrontend.formFactor === "Desktop";

    if (isDesktop) {
        buttons.forEach(button => {
            $w(button).show();
        });

        $w("#dropdownPoliticas").hide();
    } else {
        buttons.forEach(button => {
            $w(button).hide();
        });

        $w("#dropdownPoliticas").show();
    }

    function expandSection(sectionId) {
        sections.forEach(section => {
            if (section === sectionId) {
                $w(section).expand();
            }
            else {
                $w(section).collapse();
            }
        });
    }

    function resetButtonStyles() {
        buttons.forEach(button => {
            $w(button).style.backgroundColor = "#e2e2e2";
            $w(button).style.color = "#000000";
        });
    }

    buttons.forEach((button, index) => {
        $w(button).onClick(() => {
            resetButtonStyles();
            $w(button).style.backgroundColor = buttonMainColor;
            $w(button).style.color = "#ffffff";

            sections.forEach((section, i) => {
                if (i === index) {
                    $w(section).expand();
                }
                else {
                    $w(section).collapse();
                }
            });
        });
    });

    $w("#dropdownPoliticas").onChange((event) => {
        switch (event.target.value) {
            case "Devoluções":
                expandSection("#secDevolucoes");
                break;
            case "Trocas":
                expandSection("#secTrocas");
                break;
            case "Entrega":
                expandSection("#secEntrega");
                break;
            case "Privacidade":
                expandSection("#secPrivacidade");
                break;
            default:
                sections.forEach(section => {
                    $w(section).collapse();
                });
                break;
        }
    });
});
