sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/Popover",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/BusyDialog" // Import the BusyDialog control
], function(Controller, History, Popover, List, StandardListItem, Filter, FilterOperator, BusyDialog) {
  "use strict";

  return Controller.extend("nfaarb.nfaarb.controller.App", {
    onInit() {
      // Create a BusyDialog instance
      this._busyDialog = new BusyDialog({
        title: "Please wait...", // Set the title of the dialog
        text: "Loading data...",
        showCancelButton: false // Set whether to show a cancel button (optional)
      });

      this.loadData(); // Call the function to load the data
    },

    // Function to load data and show the loader
    loadData: function() {
      // Show the BusyDialog before fetching data
      this._busyDialog.open();

      var url = 'https://ariba-empathic-reedbuck-up.cfapps.us20.hana.ondemand.com/dev/GetEntitySet';
      fetch(url)
        .then(res => res.json())
        .then(res => {
          var dataModel = new sap.ui.model.json.JSONModel();
          dataModel.setData(res.data);
          this.getView().setModel(dataModel, "oJSONModel");

          // Hide the BusyDialog after data is fetched
          this._busyDialog.close();
        })
        .catch(err => {
          // In case of error, hide the loader and handle the error
          this._busyDialog.close();
          console.error("Error fetching data:", err);
        });
    },

    onSearch: function (oEvent) {
      var sValue = oEvent.getParameter("query");
      var oTable = this.getView().byId("List");
      var oBinding = oTable.getBinding("items");

      var aFilters = [
        new Filter("Srcevtname", FilterOperator.Contains, sValue),
        new Filter("Desc", FilterOperator.Contains, sValue),
        new Filter("Createdby", FilterOperator.Contains, sValue),
        new Filter("status", FilterOperator.Contains, sValue),
        new Filter("Version", FilterOperator.Contains, sValue)
      ];

      var oMultiFilter = new Filter({
        filters: aFilters,
        and: false
      });

      oBinding.filter([oMultiFilter]);
    },

    onSearchLiveChange: function (oEvent) {
      var sValue = oEvent.getParameter("newValue");
      var oTable = this.getView().byId("List");
      var oBinding = oTable.getBinding("items");

      var aFilters = [
        new Filter("Srcevtname", FilterOperator.Contains, sValue),
        new Filter("Desc", FilterOperator.Contains, sValue),
        new Filter("Createdby", FilterOperator.Contains, sValue),
        new Filter("status", FilterOperator.Contains, sValue),
        new Filter("Version", FilterOperator.Contains, sValue)
      ];

      var oMultiFilter = new Filter({
        filters: aFilters,
        and: false
      });

      oBinding.filter([oMultiFilter]);
    },
    onSortPress: function () {
      var oTable = this.getView().byId("List");
      var oBinding = oTable.getBinding("items");

      // Determine the sort order based on the current sort state
      var bSortAscending = oBinding.aSorters.length === 0 || !oBinding.aSorters[0].bDescending;

      // Create a sorter for the "Status" column with the reverse sort order
      var oStatusSorter = new sap.ui.model.Sorter("status", !bSortAscending);

      // Apply the sorter to the table binding
      oBinding.sort(oStatusSorter);
    },

    onload: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("detail");
    },

    back: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("");
    },

    onOpen: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("questions");
    },

    onPreview: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("vendorprice");
    },

    fetchversion: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("version");
    },

    backtoDetail: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("detail");
    },

    backToHome: function (oEvent) {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("App");
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("app", {}, true);
      }
    }
  });
});
