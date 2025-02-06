sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast'
], function (Controller, Image, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Orders", {
        onInit: function () {
            const oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("model/orders.json");
            this.getView().setModel(oModel);
        },
        
        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sId = oBindingContext.getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("Subcategories", { id: sId });
        }
    });
});
