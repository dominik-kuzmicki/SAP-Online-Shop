sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Main", {
        onInit: function () {
            const oModel = this.getOwnerComponent().getModel("categories");
            this.getView().setModel(oModel);
        },
        
        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sId = oBindingContext.getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("Products", { id: sId });
        }
    });
});
