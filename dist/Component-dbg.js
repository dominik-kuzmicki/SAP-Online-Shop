sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("sap.ui.demo.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            
 

            // Модель Products
            const oProductsModel = this.getModel("products");
            oProductsModel.dataLoaded().then(() => {
                const oData = oProductsModel.getData();
                const aProducts = Array.isArray(oData)
                    ? oData
                    : oData.products;

                aProducts.forEach(p => {
                    const price = Number(p.price) || 0;
                    const discount = Number(p.discount) || 0;
                
                    p.finalPrice = (100 - discount) * price / 100;
                });
            
                oProductsModel.refresh(true);
            });

            // Модель Cart
            const oCartModel = new JSONModel({
                items: [],
                quantity: 0,
                subtotal: 0,
                discount: 0,
                total: 0,
                comment: ""
            });
            this.setModel(oCartModel, "cart")

            this.getRouter().initialize();
        },

    });
});
