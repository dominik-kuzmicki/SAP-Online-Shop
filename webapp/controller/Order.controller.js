sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/demo/services/CartService"
], function (Controller, CartService) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Order", {
        onInit: function () {
            const oOrderModel = new sap.ui.model.json.JSONModel({ busy: true });
            this.getView().setModel(oOrderModel, "order");

            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Order").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: async function (oEvent) {
            const sId = oEvent.getParameter("arguments").id;
  
            try {
                const response = await fetch("/api", { headers: { "Content-Type": "application/json" } });
                if (!response.ok) throw new Error(response.statusText);
            
                const data = await response.json(); 
                const aOrders = data.orders;     
                const iIndex = aOrders.findIndex(o => String(o.id) === String(sId));

                if (iIndex !== -1) {
                    const oOrder = aOrders[iIndex];
                    const oModel = this.getOwnerComponent().getModel("products");
                    const aProducts = oModel.getProperty("/products");
                
                    // Обновляем items с полными данными продуктов
                    oOrder.items = oOrder.items.map(item => {
                        const oProduct = aProducts.find(p => String(p.ID) === String(item.id));
                        console.log(oProduct)
                        if (oProduct) {
                         return {
                                ...oProduct,             
                                quantity: item.quantity  
                            };
                        
                        }
                    });
                
                    const oOrderModel = new sap.ui.model.json.JSONModel(oOrder);
                    oOrderModel.setProperty("/busy", false);
                    this.getView().setModel(oOrderModel, "order");
                }
            } catch (error) {
                MessageToast.show("Error while fetching order data: " + error.message);
            }
        },

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("Account", { tab: "Orders" });

            setTimeout(() => {
                const oOrderModel = new sap.ui.model.json.JSONModel({ busy: true });
                this.getView().setModel(oOrderModel, "order");
            }, 300);
        },

        onRepeatOrder: function () {
            const oModel = this.getView().getModel("order");
            const oOrder = oModel.getData(); ;
 
            const oProductsModel = this.getOwnerComponent().getModel("products");
            const aAllProducts = oProductsModel.getProperty("/products") || [];

            const aCartItems = oOrder.items.map(oItem => {
                const oProduct = aAllProducts.find(p => String(p.ID) === String(oItem.ID));
                
                if (!oProduct) {
                    console.error(`Product with ID ${oItem.product.ID} not found`);
                    return null; 
                }

                return {
                    ...oProduct,
                    quantity: oItem.quantity
                };
            });

            // Очищаем корзину перед добавлением новых товаров
            CartService.clear(this.getOwnerComponent())
            
            // Добавляем товары в корзину через CartService
            aCartItems.forEach(oCartItem => {
                CartService.addProduct(this.getOwnerComponent(), oCartItem);
            });

            this.getOwnerComponent().getRouter().navTo("Cart");
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
        },

        formatCurrency(value) {
            if (value === null || value === undefined || isNaN(value)) {
                return "";
            }

            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        }  
        
    });
});
