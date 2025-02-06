sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.controller.Products", {
        onInit: function () {
            const oViewModel = new sap.ui.model.json.JSONModel({
                isListVisible: false,
                isCardVisible: true
            });
            this.getView().setModel(oViewModel, "view")

            const oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("model/products.json", null, false); // Синхронная загрузка данных
            oModel.attachRequestCompleted(() => {
                const aProducts = oModel.getData().products;
                oModel.setProperty("/products", aProducts);
            });
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
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Main");
        },

        onSortChange: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var sSelectedKey = oSelectedItem.getKey();
            var oBinding = this.byId("products").getBinding("items"); 
            var oBindingList = this.byId("list").getBinding("items"); 
            
            // Создаем объект сортировки
            var oSorter;
        
            if (sSelectedKey === "2") {
                // Сортировка по возрастанию цены (Price: Low to High)
                oSorter = new sap.ui.model.Sorter("price", false); // false для сортировки по возрастанию
            } else if (sSelectedKey === "3") {
                // Сортировка по убыванию цены (Price: High to Low)
                oSorter = new sap.ui.model.Sorter("price", true); // true для сортировки по убыванию
            }
        
            // Применяем сортировку к привязанным данным
            oBinding.sort(oSorter);
            oBindingList.sort(oSorter);
        },

        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sId = oBindingContext.getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("Product", { id: sId });
        },

        onAddToCart: function (oEvent) {
            // Получаем текущий контекст элемента
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext();
            const oProduct = oContext.getObject();

            // Получаем модель корзины
            const oCartModel = this.getView().getModel("cart");
            const aCartItems = oCartModel.getProperty("/items");
            console.log(aCartItems)

            // Проверяем, есть ли продукт уже в корзине
            const oExistingProduct = aCartItems.find(item => item.ID === oProduct.ID);

            if (oExistingProduct) {
                oExistingProduct.quantity += 1;
            } else {
                // Добавляем новый продукт в корзину
                aCartItems.push({
                    ID: oProduct.ID,
                    image: oProduct.image,
                    name: oProduct.name,
                    price: oProduct.price,
                    quantity: 1
                });
            }

            // Обновляем модель
            oCartModel.setProperty("/items", aCartItems);

            // Вызываем пересчет итоговых значений
            this._updateCartSummary(oCartModel);
            
            // Проверяем состояние корзины
            this._checkCartState(); 

            // Устанавливаем флаг inCart в модели продукта
            oContext.getModel().setProperty(oContext.getPath() + "/inCart", true);

            MessageToast.show(`${oProduct.name} added to cart`);
        },

        _updateCartSummary: function (oCartModel) {
            const aCartItems = oCartModel.getProperty("/items");

            let iTotalQuantity = 0;
            let fTotalPrice = 0;

            aCartItems.forEach(item => {
                iTotalQuantity += item.quantity;
                fTotalPrice += item.quantity * item.price;
            });

            const fDiscount = fTotalPrice * 0.1; // Скидка 10%
            const fFinalPrice = fTotalPrice - fDiscount; // Итоговая стоимость со скидкой
        
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

        onNavToCart: function () {
            this.getOwnerComponent().getRouter().navTo("Cart");
        },

        onViewChange: function (oEvent) {
            const selectedKey = oEvent.getSource().getSelectedKey();
            const oModel = this.getView().getModel("view");

            if (selectedKey === "list") {
                oModel.setProperty("/isListVisible", true);
                oModel.setProperty("/isCardVisible", false);
            } else if (selectedKey === "card") {
                oModel.setProperty("/isListVisible", false);
                oModel.setProperty("/isCardVisible", true);
            }
        },
    });
});