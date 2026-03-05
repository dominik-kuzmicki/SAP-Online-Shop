sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/demo/services/CartService"
], function (Controller, MessageToast, CartService) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Products", {
        onInit: function () {        
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Products").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sId = oEvent.getParameter("arguments").id;
            const oModel = this.getOwnerComponent().getModel("products")

            const aProducts = oModel.getProperty("/products")

            oModel.setProperty("/products", aProducts);
            this.getView().setModel(oModel);
        },

        onAddToCart: function (oEvent) {
            const oProduct = oEvent.getSource().getBindingContext()?.getObject();
            if (!oProduct) return;

            CartService.addProduct(this.getOwnerComponent(), oProduct, (product) => {
                MessageToast.show(`${product.name} added to cart`, { duration: 300 });
            });
        },

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("Main");
        },

        onSortChange: function(oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            var oBinding = this.byId("products").getBinding("items"); 
            var oSorter;
        
            switch (sSelectedKey) {
                case "priceAsc":
                    oSorter = new sap.ui.model.Sorter("finalPrice", false); // false для сортировки по возрастанию
                    break;
                case "priceDesc":
                    oSorter = new sap.ui.model.Sorter("finalPrice", true); // true для сортировки по убыванию
                    break;
                case "featured":
                    break;
                default: 
                    return;  
            } 

            oBinding.sort(oSorter);
        },

        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sId = oBindingContext.getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("Product", { id: sId });
        },

    });
});