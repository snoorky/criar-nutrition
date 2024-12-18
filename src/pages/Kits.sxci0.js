import { cart } from 'wix-stores-frontend';
import { products } from 'wix-stores.v2';
import wixWindowFrontend from 'wix-window-frontend';
import wixLocation from 'wix-location';

$w.onReady(async function () {
    products.queryProducts()
    .find()
    .then((results) => {
        const storeProducts = results.items.filter(product => product.name.startsWith("Kit"));
        $w('#repeaterProducts').data = storeProducts;
    });

    $w('#repeaterProducts').onItemReady(($item, itemData) => {
        let priceDiscount;

        $item('#imgProduct').src = itemData.media.items[0].image.url;
        $item('#imgProduct').alt = itemData.media.items[0].image.url;
        $item('#imgProduct').tooltip = "";
        $item('#txtNameProduct').text = itemData.name;
        $item('#txtRibbonProduct').text = itemData.ribbon != "" ? itemData.ribbon : "Suplemento alimentar em cápsulas";

        if ((itemData.discount.type === "NONE") && (itemData.price.formatted.price === itemData.price.formatted.discountedPrice)) {
            for (let i = 0; i < itemData.variants.length; i++) {
                if (itemData.variants[i].variant.convertedPriceData.formatted.discountedPrice == itemData.price.formatted.discountedPrice) {
                    $item('#txtProductPrice').text = itemData.price.formatted.price;
                    $item('#txtProductPrice').show();
                    $item('#boxProductOfferPrice').hide();
                } else {
                    $item('#txtProductPrice').hide();
                    $item('#boxProductOfferPrice').show();
                    $item('#txtProductOfferPrice').text = itemData.variants[0].variant.convertedPriceData.formatted.discountedPrice;
                }
            }
        } else {
            $item('#txtProductPrice').hide();
            $item('#boxProductOfferPrice').show();
            $item('#txtProductOfferPrice').text = itemData.price.formatted.discountedPrice;
        }

        let font = wixWindowFrontend.formFactor === "Desktop" ? "16px" : "10px";
        $item('#txtProductRealOfferPrice').html = `<p class="font_8 wixui-rich-text__text" style="text-align:right;font-size:${font};text-decoration:line-through;">${itemData.price.formatted.price}</p>`;

        if (itemData.discount.type === "NONE") {
            $item('#boxOffer').hide();
            $item('#boxMobileOffer').hide();
        } else if (itemData.discount.type === "AMOUNT") {
            priceDiscount = `R$${itemData.discount.value} OFF`;
        } else if (itemData.discount.type === "PERCENT") {
            priceDiscount = `${itemData.discount.value}% OFF`;
        } else {
            $item('#boxOffer').hide();
            $item('#boxMobileOffer').hide();
        }

        $item('#txtOffer').text = priceDiscount;

        if ((itemData.stock.inventoryStatus == "IN_STOCK") || (itemData.stock.inventoryStatus == "PARTIALLY_OUT_OF_STOCK")) {
			const addToCartAction = () => {
				let itemToAdd = [{
					productId: itemData._id,
					quantity: 1,
				}];

                cart.addProducts(itemToAdd)
                .then(() => {
                    if (wixWindowFrontend.formFactor === "Desktop") {
                        cart.showMiniCart()
                    } else if (wixWindowFrontend.formFactor === "Mobile") {
                        wixLocation.to("/cart-page")
                    }
                });
            };

            $item('#btnFullAddCart').onClick(() => { addToCartAction() });
            $item('#btnStock').hide();
        } else {
            $item('#btnStock').show();
            $item('#btnFullAddCart').hide();
        }

        $item('#btnLink').link = "/" + itemData.slug;
    });
});