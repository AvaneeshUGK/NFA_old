sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/Column",
  "sap/m/Text",
  "sap/m/ColumnListItem",
  "sap/m/Label"
], function(Controller, JSONModel, Column, Text, ColumnListItem, Label) {
  "use strict";

  return Controller.extend("nfaarb.nfaarb.controller.Versiontable", {
    onInit: function () {
      sap.ui.core.BusyIndicator.show(0);
      var url = "https://ariba-empathic-reedbuck-up.cfapps.us20.hana.ondemand.com/dev/getVersionsV1?event_id=Doc33123002&ver=v1";
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          var oData = res.data;
          var oModel = new JSONModel();
          oModel.setData(oData);
          this.getView().setModel(oModel);

          var oTable = this.getView().byId("dynamicTable");
          var aColumns = Object.keys(oData[0]);
          var data = oData.length;
          var lowcol = oData[data - 1].low_flag;

          // Move the last header to the first header
          aColumns.unshift(aColumns.pop());

          // Move the last column data to the first column
          for (var j = 0; j < oData.length; j++) {
            var lastColumnValue = oData[j][aColumns[aColumns.length - 1]];
            for (var i = aColumns.length - 1; i > 0; i--) {
              oData[j][aColumns[i]] = oData[j][aColumns[i - 1]];
            }
            oData[j][aColumns[0]] = lastColumnValue;
          }

          // Columns
          for (var i = 0; i < aColumns.length; i++) {
            var sColumnName = aColumns[i];
            if (sColumnName == lowcol) {
              var oColumn = new Column({
                header: new Label({ text: sColumnName }),
                demandPopin: true,
                styleClass: "highlightColumn"
              });
            } else {
              var oColumn = new Column({
                header: new Label({ text: sColumnName }),
                demandPopin: true
              });
            }
            oTable.addColumn(oColumn);
          }

          // Rows
          for (var j = 0; j < oData.length; j++) {
            var oRowData = oData[j];
            var oCells = [];
            for (var key in oRowData) {
              if (key !== "low_flag") {
                var cellValue = oRowData[key];
                var oCell = new Text({
                  text: cellValue
                });

                if (key == "Total") {
                  var oCell = new Text({
                    text: cellValue,
                    fontFace: "Bold"
                  });
                }
                oCells.push(oCell);
              }
            }
            var oRow = new ColumnListItem({
              cells: oCells
            });
            oTable.addItem(oRow);
          }
          sap.ui.core.BusyIndicator.hide();
        });

    },


    onGeneratePDF: function () {
      sap.ui.core.BusyIndicator.show(0);
      var oVBox = this.getView().byId("_IDGenVBox1");
      var oPrintButton = this.getView().byId("printButton");
      var oSubmitButton = this.getView().byId("_IDGenButton1");

      // Hide the buttons temporarily
      oPrintButton.setVisible(false);
      oSubmitButton.setVisible(false);

      var url = "https://ariba-empathic-reedbuck-up.cfapps.us20.hana.ondemand.com/dev/getVersionsV1?event_id=Doc33123002&ver=v1";

      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          // PDF generation code here

          // After PDF generation is complete, show the buttons again
          oPrintButton.setVisible(true);
          oSubmitButton.setVisible(true);
         // sap.ui.core.BusyIndicator.hide();
        //  sap.ui.core.BusyIndicator.show(0);
         sap.ui.core.BusyIndicator.hide();

          // Print the current page using window.print()
          window.print();
        });
    },








  });
});
