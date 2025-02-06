sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Cart", {
        onInit: function () {
            this.oAuthModel = this.getOwnerComponent().getModel("authModel");
            this.oEventBus = this.getOwnerComponent().getEventBus();

            var oUiStateModel = new JSONModel({
                isCheckoutClicked: false,
                isDeliveryVisible: false
            });
            this.getOwnerComponent().setModel(oUiStateModel, "uiStateModel");

            const oCartModel = this.getOwnerComponent().getModel("cart");
            const aCartItems = oCartModel.getProperty("/items");
            // Устанавливаем флаг isEmpty в зависимости от количества товаров в корзине
            const bIsEmpty = aCartItems.length === 0;
            oCartModel.setProperty("/isEmpty", bIsEmpty);
            this.getView().setModel(oCartModel, "cart");
        },

         // Увеличение количества товара
         onIncreaseQuantity: function (oEvent) {
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("cart");
            const oCartModel = this.getView().getModel("cart");

            const oItem = oContext.getObject();
            oItem.quantity += 1;

            oCartModel.refresh(); // Обновляем модель, чтобы отобразить изменения
            this._updateCartSummary(); // Пересчет итоговых значений
        },

        // Уменьшение количества товара
        onDecreaseQuantity: function (oEvent) {
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("cart");
            const oCartModel = this.getView().getModel("cart");

            const oItem = oContext.getObject();

            if (oItem.quantity > 1) {
                oItem.quantity -= 1;
                oCartModel.refresh(); // Обновляем модель, чтобы отобразить изменения
                this._updateCartSummary(); // Пересчет итоговых значений
            } else {
                MessageToast.show("Quantity cannot be less than 1");
            }
        },

        // Удаление товара из корзины
        onRemoveItem: function (oEvent) {
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("cart");
            const oCartModel = this.getView().getModel("cart");

            const oItem = oContext.getObject();
            const aCartItems = oCartModel.getProperty("/items");

            // Удаляем товар из массива
            const aUpdatedCartItems = aCartItems.filter(item => item.ID !== oItem.ID);
            oCartModel.setProperty("/items", aUpdatedCartItems);

            this._updateCartSummary(); // Пересчет итоговых значений
            this._checkCartState(); // Проверяем состояние корзины
            MessageToast.show(`${oItem.name} removed from cart`);
        },

        _updateCartSummary: function () {
            const oCartModel = this.getView().getModel("cart");
            const aCartItems = oCartModel.getProperty("/items");
        
            // Считаем общее количество и стоимость
            let iTotalQuantity = 0;
            let fTotalPrice = 0;
        
            aCartItems.forEach(item => {
                iTotalQuantity += item.quantity;
                fTotalPrice += item.quantity * item.price;
            });

            const fDiscount = fTotalPrice * 0.1; // Скидка 10%
            const fFinalPrice = fTotalPrice - fDiscount; // Итоговая стоимость со скидкой
        
            // Устанавливаем значения в модель
            oCartModel.setProperty("/totalQuantity", iTotalQuantity);
            oCartModel.setProperty("/totalPrice", fTotalPrice.toFixed(2));
            oCartModel.setProperty("/discount", fDiscount.toFixed(2));
            oCartModel.setProperty("/finalPrice", fFinalPrice.toFixed(2));
        },

        _checkCartState: function () {
            const oCartModel = this.getOwnerComponent().getModel("cart");
            const aCartItems = oCartModel.getProperty("/items");
        
            // Устанавливаем флаг isEmpty в зависимости от количества товаров в корзине
            const bIsEmpty = aCartItems.length === 0;
            oCartModel.setProperty("/isEmpty", bIsEmpty);
        },

        onRemoveFromCart: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var oContext = oItem.getBindingContext("cartModel");
            var iIndex = oContext.getPath().split("/")[2];

            var oCartModel = this.getView().getModel("cartModel");
            var aCartItems = oCartModel.getProperty("/cartItems");

            // Удаляем элемент из массива
            aCartItems.splice(iIndex, 1);

            // Пересчитываем общую стоимость
            this._calculateTotal();

            // Обновляем модель
            oCartModel.setProperty("/cartItems", aCartItems);
        },

        _calculateTotal: function () {
            var oCartModel = this.getView().getModel("cartModel");
            var aCartItems = oCartModel.getProperty("/cartItems");
            var fTotal = 0;

            // Рассчитываем общую стоимость товаров в корзине
            aCartItems.forEach(function (oItem) {
                fTotal += oItem.price;
            });

            // Обновляем общую стоимость в модели
            oCartModel.setProperty("/totalPrice", fTotal.toFixed(2));
        },

        onCheckoutPress: function () {
            var oUiStateModel = this.getView().getModel("uiStateModel");
            oUiStateModel.setProperty("/isCheckoutClicked", true); 

            if (!this.oAuthModel.getProperty("/isAuthorized")) {
                this.oEventBus.publish("app", "onLoginPress", true);
            } else {
                oUiStateModel.setProperty("/isDeliveryVisible", true); 
            }
        },

        onToPaymentPress: function () {
            const oView = this.getView();
            const oCartModel = oView.getModel("cart");
            const aCartItems = oCartModel.getProperty("/items");
            const fTotalPrice = oCartModel.getProperty("/totalPrice");
            const fTotalQuantity = oCartModel.getProperty("/totalQuantity");
            const fDiscount = oCartModel.getProperty("/discount");
            const fFinalPrice = oCartModel.getProperty("/finalPrice");
    
            const sName = oView.byId("name").getValue();
            const sPhone = oView.byId("phone").getValue();
            const sStreet = oView.byId("street").getValue();
            const sHouse = oView.byId("house").getValue();
            const sEntrance = oView.byId("entrance").getValue();
            const sFloor = oView.byId("floor").getValue();
            const sApartment = oView.byId("apartment").getValue();
            const sComment = oView.byId("comment").getValue();
            const sPaymentMethod = "Card";
        
            if (!sName || !sPhone || !sStreet || !sHouse) {
                sap.m.MessageToast.show("Please fill in all required fields.");
                return;
            }
        
            // Формирование заказа
            const oOrder = {
                items: aCartItems,
                totalPrice: fTotalPrice,
                totalQuantity: fTotalQuantity,
                discount: fDiscount,
                finalPrice: fFinalPrice,
                customer: {
                    name: sName,
                    phone: sPhone,
                    address: {
                        street: sStreet,
                        house: sHouse,
                        entrance: sEntrance,
                        floor: sFloor,
                        apartment: sApartment
                    }
                },
                comment: sComment,
                paymentMethod: sPaymentMethod
            };
        
            // console.log("Order:", oOrder);
            // sap.m.MessageToast.show("Order send");
            // sap.ui.core.BusyIndicator.show(0);
            // jQuery.ajax({
            //     url: "/api/orders", // Замените на URL
            //     method: "POST",
            //     contentType: "application/json",
            //     data: JSON.stringify(oOrder),
            //     success: function () {
            //         sap.ui.core.BusyIndicator.hide();
            //         sap.m.MessageToast.show("Order placed successfully!");
            //     },
            //     error: function () {
            //         sap.ui.core.BusyIndicator.hide();
            //         sap.m.MessageToast.show("Failed to place the order.");
            //     }
            // });

            window.location.href = "https://buy.stripe.com/test_7sI292bAeeSPd0c6op"
        }
    });
});