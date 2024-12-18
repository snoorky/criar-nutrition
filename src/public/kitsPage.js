import { cart } from 'wix-stores-frontend';
import { products } from 'wix-stores.v2';
import wixWindowFrontend from 'wix-window-frontend';
import wixLocation from 'wix-location';

export async function kitsPage(productId) {
    let product;

    try {
        const result = await products.queryProducts().eq("_id", productId).find();
        product = result.items[0];

        $w('#imgProductBanner').src = product.media.mainMedia.image.url;
        $w('#txtNameProduct').text = product.name;

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

        stockStatus(product);
    } catch (error) {
        console.error('Erro ao carregar a página:', error);
    }
}

function stockStatus(product) {
    if (product.stock.quantity != 0) {
        $w('#btnBuy').label = "Adicionar ao carrinho";
        $w('#btnBuy').enable();
        $w('#btnBuy').onClick(() => { addToCart(product) });
    } else {
        $w('#btnBuy').label = "Produto esgotado";
        $w('#btnBuy').disable();
        $w('#btnBuy').collapseIcon();
    }
}

function addToCart(product) {
    let addProductCart = [{
        productId: product._id,
        quantity: 1,
    }];

    cart.addProducts(addProductCart)
    .then(() => {
        if (wixWindowFrontend.formFactor === "Desktop") {
            cart.showMiniCart();
        } else if (wixWindowFrontend.formFactor === "Mobile") {
            wixLocation.to("/cart-page");
        }
    })
    .catch((error) => {
        console.error('Erro ao adicionar produto ao carrinho:', error);
    });
}