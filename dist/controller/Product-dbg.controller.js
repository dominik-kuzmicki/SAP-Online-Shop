sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/demo/services/CartService"
], function (Controller, MessageToast, CartService) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Product", {
        onInit: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Product").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sId = oEvent.getParameter("arguments").id;
            const oModel = this.getOwnerComponent().getModel("products");
            
            const aProducts = oModel.getProperty("/products")
            const oProduct = aProducts.find(prod =>  String(prod.ID) ===  String(sId)); 
            const oProductModel = new sap.ui.model.json.JSONModel(oProduct);
            this.getView().setModel(oProductModel, "product");
        },

        onAddToCart: function () {
            const oProduct = this.getView().getModel("product").getData();
            if (!oProduct) return;

            CartService.addProduct(this.getOwnerComponent(), oProduct, (product) => {
                MessageToast.show(`${product.name} added to cart`, { duration: 300 });
            });
        },

        onBack: function () {
            const sPreviousHash = sap.ui.core.routing.History.getInstance().getPreviousHash();
       
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // Fallback, если открыли страницу напрямую
                this.getOwnerComponent().getRouter().navTo("Main");
            }
        }
    });
});