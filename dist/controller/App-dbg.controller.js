sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.App", {
        onInit: function () {
            // Обработка клика на Лого
            var oBox = this.byId("mainBox");
            oBox.addEventDelegate({
                onclick: function () {
                    this.onMain();
                }.bind(this)
            });
        },

        onMain: function () {
            this.getOwnerComponent().getRouter().navTo("Main");
        },

        onCart: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        onAccount: function () {
            this.getOwnerComponent().getRouter().navTo("Account", { tab: "Profile" });
        }

    });
});