sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/demo/services/CartService"
], function (Controller, MessageToast, CartService) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Cart", {
        onInit: function () {
            // UI State Model
            const oUIModel = new sap.ui.model.json.JSONModel({ isOrdered: false, busy: false });
            this.getView().setModel(oUIModel, "uiModel");
        },

        onChangeQuantity: function(oEvent) {            
            const oProduct = oEvent.getSource().getBindingContext("cart").getObject();
            let iNewValue = oEvent.getSource().getValue();

            if (iNewValue > oProduct.stock) { 
                iNewValue = oProduct.stock;
                MessageToast.show(`You have reached the maximum available quantity of ${oProduct.stock} units for ${oProduct.name}.`, { duration: 1000 });
            }

            CartService.changeQuantity(this.getOwnerComponent(), oProduct.ID, iNewValue);
        },
     
        onRemoveProduct: function (oEvent) {
            const oProduct = oEvent.getSource().getBindingContext("cart").getObject();
 
            CartService.removeProduct(this.getOwnerComponent(), oProduct, (product) => {
                MessageToast.show(`${product.name} removed from cart`, { duration: 300 });
            });
        },

        onSubmitOrder: async function () {
            const oUIModel = this.getView().getModel("uiModel");
            oUIModel.setProperty("/busy", true);

            const oCartModel = this.getView().getModel("cart");

            const aItems = oCartModel.getProperty("/items") || [];
            const subtotal = parseFloat(oCartModel.getProperty("/subtotal")) || 0;
            const totalDiscount = parseFloat(oCartModel.getProperty("/discount")) || 0;
            const total = parseFloat(oCartModel.getProperty("/total")) || 0;
            const promoCode = oCartModel.getProperty("/promoCode") || null;
            const orderComment = oCartModel.getProperty("/comment") || "";

            // Формируем items в нужный формат
            const formattedItems = aItems.map(item => ({
                ID: item.ID,
                price: item.price,
                discount: item.discount, 
                quantity: item.quantity,
            }));
        
            const orderNumber = "ORD-" + Date.now();
            const createdAt = new Date().toISOString();
        
            const oOrder = {
                ID: orderNumber,
                userId: 182, 
                status: "Open",
                subtotal: subtotal,
                discount: totalDiscount,
                total: total,
                promoCode: promoCode,
                comment: orderComment,
                createdAt: createdAt,
                items: formattedItems
            };        
            console.log("Sending order:", oOrder);

            try {
                const response = await fetch("/api", { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(oOrder) });
                if (!response.ok) throw new Error(response.statusText);
            
                const oCreatedOrder  = await response.json();
                console.log("Order created:", oCreatedOrder );
                const oOrderModel = new sap.ui.model.json.JSONModel({id : orderNumber});
                this.getView().setModel(oOrderModel, "order");

                MessageToast.show(`Your order ${orderNumber} has been placed successfully`);
                oUIModel.setProperty("/busy", false);
                oUIModel.setProperty("/isOrdered", true);
                this.getView().setModel(oUIModel, "uiModel");

                CartService.clear(this.getOwnerComponent())
                setTimeout(() => {
                    this.onOrders()
                }, 5000);
            } catch (error) {
                MessageToast.show("Error placing order: " + error.message);
            }
        },

        onOrders: function () {
            this.getView().getModel("uiModel").setProperty("/isOrdered", false);
            this.getOwnerComponent().getRouter().navTo("Account", { tab: "Orders" });
        },
        
        onContinueShopping: function () {
            this.getOwnerComponent().getRouter().navTo("Products", { id: "1"});
        },

        onClearCart: function () {
           CartService.clear(this.getOwnerComponent())
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