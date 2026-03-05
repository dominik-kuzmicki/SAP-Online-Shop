sap.ui.define([], function () {
    "use strict";

    const CartService = {
        _getModel(oComponent) {
            return oComponent.getModel("cart");
        },

        addProduct(oComponent, oProduct, fnNotify) {
            const oCartModel = this._getModel(oComponent);
            let aItems = [...(oCartModel.getProperty("/items") || [])];

            const iIndex = aItems.findIndex(i => i.ID === oProduct.ID);

            if (iIndex !== -1) {
                aItems[iIndex] = {
                    ...aItems[iIndex],
                    quantity: aItems[iIndex].quantity + 1
                };
            } else {
                aItems.push({
                    ID: oProduct.ID,
                    image: oProduct.images?.[0] || "",
                    name: oProduct.name,
                    price: Number(oProduct.price) || 0,
                    discount: Number(oProduct.discount) || 0,
                    stock: Number(oProduct.stock) || 0,
                    quantity: oProduct.quantity || 1
                });
            }

            this._updateCart(oCartModel, aItems);

            if (typeof fnNotify === "function") {
                fnNotify(oProduct);
            }
        },

        removeProduct: function(oComponent, oProduct, fnNotify) {
            const oCartModel = this._getModel(oComponent);
            let aItems = [...(oCartModel.getProperty("/items") || [])];
            
            aItems = aItems.filter(item => item.ID !== oProduct.ID);

            this._updateCart(oCartModel, aItems);

            if (typeof fnNotify === "function") {
                fnNotify(oProduct);
            }
        },

        changeQuantity(oComponent, sProductId, iNewQuantity) {
            const oCartModel = this._getModel(oComponent);
            let aItems = [...(oCartModel.getProperty("/items") || [])];

            const iIndex = aItems.findIndex(item => item.ID === sProductId);

            if (iIndex !== -1) {
                aItems[iIndex] = {
                    ...aItems[iIndex],
                    quantity: iNewQuantity
                };
            }

            this._updateCart(oCartModel, aItems);
        },

        clear(oComponent) {
            const oCartModel = this._getModel(oComponent);
            oCartModel.setProperty("/comment", "");
            this._updateCart(oCartModel, []);
        },

        _updateCart(oCartModel, aItems) {
            let quantity = 0;
            let subtotal = 0;
            let discount = 0;
            let total = 0;

            aItems.forEach(item => {
                const price = Number(item.price);
                const disc = Number(item.discount);
                const qty = Number(item.quantity);
                quantity += qty;

                const itemSubtotal = price * qty;
                const itemTotal = Number(((price * (100 - disc) / 100).toFixed(2) * qty).toFixed(2));

                subtotal += itemSubtotal;
                total += itemTotal;
                discount += itemSubtotal - itemTotal;
            });
            oCartModel.setProperty("/items", aItems);
            oCartModel.setProperty("/quantity", quantity);
            oCartModel.setProperty("/subtotal", Number(subtotal.toFixed(2)));
            oCartModel.setProperty("/discount", Number(discount.toFixed(2)));
            oCartModel.setProperty("/total", Number(total.toFixed(2)));
        },
    };

    return CartService;
});