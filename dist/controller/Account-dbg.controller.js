sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Account", {
        onInit: function () {      
            // Модель UI
            const oUIModel = new sap.ui.model.json.JSONModel({ activeTab: "Profile" }); // Profile | Orders
            this.getView().setModel(oUIModel, "uiModel");

            // Модель User
            const oUserModel = new sap.ui.model.json.JSONModel({
                ID: 182,
                name: "John Doe",
                email: "John.Doe@acme.com ",
                phone: "+1 (555) 123-4567",
                managerName: "Sarah Johnson",
                managerEmail: "Sarah.Johnson@techconnect.com",
                managerPhone: "+1 (555) 987-6543",
            });
            this.getView().setModel(oUserModel, "userModel");
            
            // Модель Orders
            const oOrdersModel = new sap.ui.model.json.JSONModel({ busy: true });
            this.getView().setModel(oOrdersModel);
            this._loadOrders();

            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Account").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            const sTab = oEvent.getParameter("arguments").tab;
            this.getView().getModel("uiModel").setProperty("/activeTab", sTab || "profile");
            
            if (sTab !== "Orders") return;
            const oOrdersModel = new sap.ui.model.json.JSONModel({ busy: true });
            this.getView().setModel(oOrdersModel);
            this._loadOrders();
        },

        _loadOrders: async function () {
            try {
                const response = await fetch("/api", { headers: { "Content-Type": "application/json" } });
                if (!response.ok) throw new Error(response.statusText);
            
                const aOrders = await response.json();
                console.log("Received order data:", aOrders);

                const oOrdersModel = new sap.ui.model.json.JSONModel(aOrders);
                oOrdersModel.setProperty("/busy", false);
                this.getView().setModel(oOrdersModel);
            } catch (error) {
                MessageToast.show("Error while fetching order data: " + error.message);
            }
        },

        onTabProfile: function () {
            this.getOwnerComponent().getRouter().navTo("Account", {
                tab: "Profile"
            });
        },

        onTabOrders: function () {
            this.getOwnerComponent().getRouter().navTo("Account", {
                tab: "Orders"
            });
        },
    
        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sId = oBindingContext.getProperty("id");
            this.getOwnerComponent().getRouter().navTo("Order", { id: sId });
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "Open":
                    return "Warning";     // желтый
                case "In process":
                    return "Information"; // синий
                case "Completed":
                    return "Success";     // зелёный
                case "Cancelled":
                    return "Error";       // красный
                default:
                    return "None";
            }
        }
    });
});
