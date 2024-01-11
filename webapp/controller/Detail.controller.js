sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
  ],
  function (Controller, JSONModel, Column, ColumnListItem, Text, MessageToast, Fragment) {
    "use strict";
    let c_count = 0;
    return Controller.extend("nfaarb.nfaarb.controller.Detail",
      {
        onInit: function () {
          sap.ui.core.BusyIndicator.show(0);
          var url = "https://ariba-empathic-reedbuck-up.cfapps.us20.hana.ondemand.com/dev/GetSupplierBidsv1?event_id=Doc33123002";

          fetch(url)
            .then((res) => res.json())
            .then((res) => {
              var biddingData = res.data.items.bidding_date;
              var oTable = this.getView().byId("idMyTable");

              // Get the headers from the API response
              var headers = res.data.items.headers;
              var headersArray = Object.values(headers);

              var deleteColumnHeader = ""; // Replace "Delete" with the desired header text for the delete column
              headersArray.push(deleteColumnHeader);
              // Move the second header to the first position
              headersArray.unshift(headersArray.splice(0, 1)[0]);

              // Add columns to idMyTable
              for (var i = 0; i < headersArray.length; i++) {
                var oColumn = new Column({
                  header: new sap.m.Label({
                    text: headersArray[i]
                  })
                });
                oTable.addColumn(oColumn);
              }

              // Add rows to idMyTable
              for (var i = 0; i < biddingData.length; i++) {
                var rowData = biddingData[i];
                var oCells = [];

                // Move the second column data to the first column
                var secondColumnData = Object.values(rowData)[1];
                var temp = Object.values(rowData);
                temp.unshift(temp.splice(2, 1)[0]);

                var fourthColumnData = Object.values(rowData)[3];
                temp.splice(2, 0, temp.splice(3, 1)[0]);
                temp.splice(3, 0, temp.splice(5, 1)[0]);
                rowData = Object.fromEntries(Object.entries(rowData).map((_, i) => [headersArray[i], temp[i]]));

                for (var key in rowData) {
                  var cellValue = rowData[key];
                  var oCell = new sap.m.Text({
                    text: cellValue
                  });
                  oCells.push(oCell);
                }

                var oRow = new ColumnListItem({
                  cells: oCells
                });
                oTable.addItem(oRow);
              }
              sap.ui.core.BusyIndicator.hide();


              // ============================Add columns to list2==============================
              var qnsData = res.qns.qns_data;
              var oTable2 = this.getView().byId("Questions");

              // Clear existing items
              // oTable2.removeAllItems();

              var qnsHeader = res.qns.qns_header;
              for (var key in qnsHeader) {
                var oColumn = new Column({
                  header: new sap.m.Label({
                    text: qnsHeader[key]
                  })
                });
                oTable2.addColumn(oColumn);
              }

              oTable2.addColumn(new Column({
                header: new sap.m.Label({
                  text: ""
                })
              }));

              //  Dynamically create table rows based on qns_data
              var oRowData = res.qns.qns_data;
              for (var i = 0; i < oRowData.length; i++) {
                var oRow = new sap.m.ColumnListItem();

                // Get the last column value
                var lastColumnValue = oRowData[i][Object.keys(oRowData[i])[Object.keys(oRowData[i]).length - 1]];

                // Add the last column value as the first cell in the row
                oRow.addCell(new sap.m.Text({ text: lastColumnValue }));

                // Add the rest of the cells (excluding the last column)
                for (var j = 0; j < Object.keys(oRowData[i]).length - 1; j++) {
                  var key = Object.keys(oRowData[i])[j];
                  var sValue = oRowData[i][key];
                  oRow.addCell(new sap.m.Text({ text: sValue }));
                }
                oTable2.addItem(oRow);
              }
              sap.ui.core.BusyIndicator.hide();
            });
        },
        // ================= Add New Row ===============================================
        onOpenDialog: function () {
          if (!this.pDialog) {
            this.pDialog = new sap.m.Dialog({
              title: "Add New Line Item",
              contentWidth: "700px",
              contentHeight: "500px",
              resizable: true,
              draggable: true,
              beginButton: new sap.m.Button({
                text: "Add",
                type: "Emphasized",
                icon: "sap-icon://add",
                press: this.onAddNewRow.bind(this),
              }),
              endButton: new sap.m.Button({
                text: "Cancel",
                type: "Negative",
                press: this.onCloseDialog.bind(this),
              }),
            });
            this.pDialog.addStyleClass("myCustomDialog");
            var oTable = this.getView().byId("idMyTable");
            var oColumns = oTable.getColumns();
            var oDialogContent = new sap.m.VBox();

            // Loop through the table columns and create corresponding input fields in the dialog
            for (var i = 0; i < oColumns.length; i++) {
              var sHeaderText = oColumns[i].getHeader().getText();
              if (sHeaderText != "") {
                var oInput = new sap.m.Input({
                  width: "80%",
                  hight: "60%",
                  placeholder: sHeaderText,
                });

              }

              oDialogContent.addItem(oInput);
            }
            this.pDialog.addContent(oDialogContent);
            this.getView().addDependent(this.pDialog);
          }
          this.pDialog.open();
        },

        onAddNewRow: function () {
          // Get the input values from the dialog
          var oDialogContent = this.pDialog.getContent()[0];
          var oInputs = oDialogContent.getItems();
          var aCellValues = [];

          oInputs.forEach(function (oInput) {
            aCellValues.push(new sap.m.Text({ text: oInput.getValue() }));
          });

          aCellValues.push(new sap.m.Button({
            id: "Delete",
            text: "Delete",
            icon: "sap-icon://delete",
            type: "Negative",
            press: [this.remove, this]
          }));

          // Retrieve the Table instance
          var oTable = this.getView().byId("idMyTable");

          // Create a new ColumnListItem with input values as cells
          var oNewRow = new sap.m.ColumnListItem({
            cells: aCellValues,
          });

          // Add the new row to the table
          oTable.addItem(oNewRow);
          MessageToast.show("New Row Added");

          // Close the dialog
          this.onCloseDialog();
        },

        remove: function (oEvent) {
          var oTable = this.getView().byId("idMyTable");
          oTable.removeItem(oEvent.getSource().getParent());
        },

        onCloseDialog: function () {
          this.pDialog.close();
        },

        // =======================Questions ==========================================
        // onAdd2: function (oEvent) {
        //   var oItem = new sap.m.ColumnListItem({
        //     cells: [new sap.m.Input(), new sap.m.Input(), new sap.m.Input()],
        //   });
        //   var oTable = this.getView().byId("Questions");
        //   oTable.addItem(oItem);
        // },

        deleteRow: function (oEvent) {
          var oTable = this.getView().byId("idMyTable");
          oTable.removeItem(oEvent.getParameter("listItem"));
        },

        onOpenDialog2: function () {
          if (!this.oDialog) {
            this.oDialog = new sap.m.Dialog({
              title: "Add Question",
              contentWidth: "600px",
              contentHeight: "500px",
              resizable: true,
              draggable: true,
              beginButton: new sap.m.Button({
                text: "Add",
                type: "Emphasized",
                icon: "sap-icon://add",
                press: this.onAddQuestion.bind(this),
              }),
              endButton: new sap.m.Button({
                text: "Cancel",
                type: "Negative",

                press: this.onCloseDialog2.bind(this),
              }),
            });
            this.oDialog.addStyleClass("myCustomDialog");
            var oTable2 = this.getView().byId("Questions");
            var oColumns = oTable2.getColumns();
            var oDialogContent1 = new sap.m.VBox();

            // Loop through the table columns and create corresponding input fields in the dialog
            for (var i = 0; i < oColumns.length; i++) {
              var sHeaderText = oColumns[i].getHeader().getText();
              if (sHeaderText != "") {
                var oInput = new sap.m.Input({
                  width: "80%",

                  placeholder: sHeaderText,
                });
              }
              oDialogContent1.addItem(oInput);
            }

            this.oDialog.addContent(oDialogContent1);
            this.getView().addDependent(this.oDialog);
          }

          this.oDialog.open();
        },
        // ===========================Add questions=======================================
        onAddQuestion: function () {
          var oDialogContent1 = this.oDialog.getContent()[0];
          var oInputs = oDialogContent1.getItems();
          var aCellValues = [];

          oInputs.forEach(function (oInput) {
            aCellValues.push(new sap.m.Text({ text: oInput.getValue() }));
          });

          aCellValues.push(new sap.m.Button({
            text: "Delete",
            icon: "sap-icon://delete",
            type: "Negative",
            press: [this.remove2, this]
          }));

          // Retrieve the Table instance
          var oTable2 = this.getView().byId("Questions");

          // Create a new ColumnListItem with input values as cells
          var oNewRow = new sap.m.ColumnListItem({
            cells: aCellValues,
          });

          // Add the new row to the table
          oTable2.addItem(oNewRow);
          MessageToast.show("Question Added")
          // Close the dialog
          this.onCloseDialog2();
        },

        remove2: function (oEvent) {
          debugger
          var oTable2 = this.getView().byId("Questions");
          oTable2.removeItem(oEvent.getSource().getParent());
        },

        onCloseDialog2: function () {
          this.oDialog.close();
        },

        onPreview: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("vendorprice");
        },

        fetchversion: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("version");
        },
        onGeneratePDF: function () {
          sap.ui.core.BusyIndicator.show(0);
          var oVBox = this.getView().byId("_IDGenVBox1");
          var oPrintButton = this.getView().byId("printButton");
          var oSubmitButton = this.getView().byId("Version21");
          var oSubmitButton1 = this.getView().byId("Preview21");
          var oSubmitButton2 = this.getView().byId("button");
          var oSubmitButton3 = this.getView().byId("button3");
          // var oSubmitButton4 = this.getView().byId("Delete");



          // Hide the buttons temporarily
          oPrintButton.setVisible(false);
          oSubmitButton.setVisible(false);
          oSubmitButton1.setVisible(false);
          oSubmitButton2.setVisible(false);
          oSubmitButton3.setVisible(false);
          // oSubmitButton4.setVisible(false);

          var url = "https://ariba-empathic-reedbuck-up.cfapps.us20.hana.ondemand.com/dev/GetSupplierBidsv1?event_id=Doc33123002";

          fetch(url)
            .then((res) => res.json())
            .then((res) => {
              // PDF generation code here

              // After PDF generation is complete, show the buttons again
              oPrintButton.setVisible(true);
              oSubmitButton.setVisible(true);
              oSubmitButton1.setVisible(true);
              oSubmitButton2.setVisible(true);
              oSubmitButton3.setVisible(true);
              // oSubmitButton4.setVisible(true);
           
              sap.ui.core.BusyIndicator.hide();
              // Print the current page using window.print()
              
              window.print();
            });
        },
      });
  }
);
