import { cart } from 'wix-stores-frontend';
import { products } from 'wix-stores.v2';
import wixWindowFrontend from 'wix-window-frontend';
import wixLocation from 'wix-location';

export async function suplementsPage(productId, buttonMainColor) {
    let product;
    let optionProductSelected = 0;
    const buttons = ["#btnOption1", "#btnOption2", "#btnOption3", "#btnOption4", "#btnOption5"];

    try {
        const result = await products.queryProducts().eq("_id", productId).find();
        product = result.items[0];

        $w('#imgProductBanner').src = product.media.mainMedia.image.url;
        $w('#imgProductTables').src = product.media.mainMedia.image.url;
        $w('#txtNameProduct').text = product.name;

        if (product.productOptions.length > 0) {
            console.log("entrou aqui")
            const optionsProduct = product.productOptions[0].choices.map(choice => ({ label: choice.description, value: choice.description }));

            buttons.forEach(button => {
                $w(button).hide();
            });

            optionsProduct.forEach((item, index) => {
                $w(buttons[index]).label = item.value;
                $w(buttons[index]).show();
                $w(buttons[index]).style.backgroundColor = buttonMainColor;
                $w(buttons[index]).style.color = "#ffffff";
                // $w(buttons[index]).onClick(() => {
                //     optionProductSelected = index;
                //     const variantPrice = product.variants[optionProductSelected].variant.convertedPriceData.formatted.discountedPrice;

                //     $w('#txtDiscountValue').text = variantPrice;
                //     buttons.forEach(btn => {
                //         $w(btn).style.backgroundColor = "#e2e2e2";
                //     });
                //     $w(buttons[index]).style.backgroundColor = buttonMainColor;
                //     $w(buttons[index]).style.color = "#ffffff";
                //     stockStatus(product, optionProductSelected);
                // });
            });

            $w('#dropOptions').options = optionsProduct;
            $w('#dropOptions').onChange((event) => {
                optionProductSelected = event.target.selectedIndex;
                const variantPrice = product.variants[optionProductSelected].variant.convertedPriceData.formatted.discountedPrice;

                $w('#txtDiscountValue').text = variantPrice;
                stockStatus(product, optionProductSelected);
            });

            if (wixWindowFrontend.formFactor === "Desktop") {
                $w('#dropOptions').hide();
            } else if (wixWindowFrontend.formFactor === "Mobile") {
                buttons.forEach(button => $w(button).hide());
            }
        } else {
            $w('#txtOptions').collapse();
            $w('#dropOptions').hide();
            buttons.forEach(button => $w(button).collapse());
        }

        if ((product.discount.type === "NONE") && (product.price.formatted.price === product.price.formatted.discountedPrice)) {
            for (let i = 0; i < product.variants.length; i++) {
                if (product.variants[i].variant.convertedPriceData.formatted.discountedPrice == product.price.formatted.discountedPrice) {
                    $w('#txtRealValue').text = product.price.formatted.price;
                    $w('#boxDiscount').hide();
                } else {
                    $w('#txtRealValue').hide();
                    $w('#boxDiscount').show();
                    $w('#txtDiscountValue').text = product.variants[0].variant.convertedPriceData.formatted.discountedPrice;
                }
            }
        } else {
            $w('#txtRealValue').hide();
            $w('#boxDiscount').show();
            $w('#txtDiscountValue').text = product.price.formatted.discountedPrice;
        }

            let font = wixWindowFrontend.formFactor === "Desktop" ? "14px" : "12px";
        $w('#txtDiscountRealValue').html = `<p class="font_8 wixui-rich-text__text" style="font-size:${font}; text-decoration: line-through"><span class="color_40 wixui-rich-text__text">${product.price.formatted.price}</span></p>`;

        stockStatus(product, optionProductSelected);
    } catch (error) {
        console.error('Erro ao carregar a página:', error);
    }
}

function stockStatus(product, optionProductSelected) {
    if (product.stock.quantity != 0 && product.variants[optionProductSelected].stock.quantity != 0) {
        $w('#btnBuy').label = "Adicionar ao carrinho";
        $w('#btnBuy').enable();
        $w('#btnBuy').onClick(() => { addToCart(product, optionProductSelected) });
        $w('#btnAddCartLast').label = "Adicionar ao carrinho";
        $w('#btnAddCartLast').enable();
        $w('#btnAddCartLast').onClick(() => { addToCart(product, optionProductSelected) });
    } else {
        $w('#btnBuy').label = "Produto esgotado";
        $w('#btnBuy').disable();
        $w('#btnBuy').collapseIcon();
        $w('#btnAddCartLast').label = "Produto esgotado";
        $w('#btnAddCartLast').disable();
        $w('#btnAddCartLast').collapseIcon();
    }
}

function addToCart(product, optionProductSelected) {
    let itemToAdd;
    
    if (product.productOptions.length > 0) {
        let optionName = product.productOptions[0].name;
        let selectedOptionValue = product.productOptions[0].choices[optionProductSelected].description;
        itemToAdd = [{
            productId: product._id,
            quantity: 1,
            options: {
                choices: {
                    [optionName]: selectedOptionValue
                }
            }
        }];
    } else {
        itemToAdd = [{
            productId: product._id,
            quantity: 1,
        }];
    }

    cart.addProducts(itemToAdd)
    .then(() => {
        if (wixWindowFrontend.formFactor === "Desktop") {
            cart.showMiniCart();
        } else if (wixWindowFrontend.formFactor === "Mobile") {
            wixLocation.to("/cart-page");
        }
    });
}