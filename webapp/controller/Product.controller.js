sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Product", {
        onInit: function () {
            const oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("model/products.json", null, false); // Синхронная загрузка данных
            this.getView().setModel(oModel);
        
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            const sId = oEvent.getParameter("arguments").id;
            const oModel = this.getView().getModel();

            const aProducts = oModel.getProperty().find(prod => prod.subcategory === sId).proucts;        
            oModel.setProperty("/products", aProducts);
            this.getView().setModel(oModel);
        }
    });
});