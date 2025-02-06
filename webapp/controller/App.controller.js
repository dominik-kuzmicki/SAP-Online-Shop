sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.App", {
        onInit: function () {
            this.oEventBus = this.getOwnerComponent().getEventBus();
            this.oEventBus.subscribe("app", "onLoginPress", this.onLoginPress, this);
     
            this.oAuthModel = this.getOwnerComponent().getModel("authModel");
            this._oDialog = this.getView().byId("loginDialog");
        },

        onNavToMain: function () {
            this.getOwnerComponent().getRouter().navTo("Main");
        },

        onNavToCart: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        onOrdersPress: function () {
            this.getOwnerComponent().getRouter().navTo("Orders");
        },

        onLoginPress: function () {
            this._oDialog.open()
        },

        onLoginCancel: function () {
            this._oDialog.close();
        },

        onLoginSubmit: function (checkout) {
            var sUsername = this.getView().byId("username").getValue();
            var sPassword = this.getView().byId("password").getValue();
            
            if (sUsername === "user" && sPassword === "123") {
                this._setAuthorizationStatus(true);
                MessageToast.show("Login successful!");
                this._oDialog.close();
                
                if (checkout) {
                    var oUiStateModel = this.getView().getModel("uiStateModel");
                    oUiStateModel.setProperty("/isDeliveryVisible", true); 
                }
            } else {
                MessageToast.show("Invalid username or password");
            }
        },

        onLogoutPress: function () {
            this._setAuthorizationStatus(false);
            MessageToast.show("Logout successful. See you again soon!");
        },

        _setAuthorizationStatus: function (bAuthorized) {
            this.oAuthModel.setProperty("/isAuthorized", bAuthorized);
        },

        onSearch: function (oEvent) {
        },
    });
});