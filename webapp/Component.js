sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/Router",
    "sap/ui/model/json/JSONModel",
], function (UIComponent, Router, JSONModel) {
    "use strict";

    return UIComponent.extend("sap.ui.demo.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Создание глобальной модели для авторизации
            var oAuthModel = new JSONModel({
                isAuthorized: false
            });
            this.setModel(oAuthModel, "authModel");

            // Создание модели корзины
             const cartModel = new JSONModel({
                items: [],
                totalQuantity: 0,
                totalPrice: 0,
                discount: 0,
                finalPrice: 0 
            });
            this.setModel(cartModel, "cart")

            this.getRouter().initialize();
        }
    });
});
