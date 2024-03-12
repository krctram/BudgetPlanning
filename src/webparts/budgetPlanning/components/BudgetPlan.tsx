import * as React from "react";
import { useState, useEffect } from "react";
import {
  Label,
  Dropdown,
  DetailsList,
  SelectionMode,
  IColumn,
  DetailsListLayoutMode,
  Icon,
  TextField,
  IDropdownStyles,
  IDetailsListStyles,
  ITextFieldStyles,
  Modal,
  IModalStyles,
  IconButton,
  DefaultButton,
  IButtonStyles,
} from "@fluentui/react";
import {
  IDrop,
  IDropdowns,
  ICurBudgetItem,
  ICurCategoryItem,
  IOverAllItem,
  IBudgetListColumn,
  IBudgetValidation,
  IGroupUsers,
  IMasterCategoryUpdate,
} from "../../../globalInterFace/BudgetInterFaces";
import { Config } from "../../../globals/Config";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import SPServices from "../../../CommonServices/SPServices";
import { _filterArray } from "../../../CommonServices/filterCommonArray";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import styles from "./BudgetPlanning.module.scss";

const _ApproveIcon: string = require("../../../ExternalRef/images/approved.png");

let propDropValue: IDropdowns;
let _Items: ICurBudgetItem[] = [];
let _groupItem: IOverAllItem[] = [];
let alertifyMSG: string = "";
let _isBack: boolean = false;
let _isCurYear: boolean = true;
let isUserPermissions: IGroupUsers;
let _arrOfMaster: IOverAllItem[] = [];
let listItems: any[] = [];
let _masArray: any[] = [];
let _isMasterSubmit: boolean = false;
let _isMasApprove: boolean = false;
let _totalRemaningAmount: number = 0;
let _curBudgetAllocated: number = 0;
let _curRemainingCost: number = 0;
let _curUsedCost: number = 0;
let _isAction: boolean = false;
let _isAdminView: boolean = false;
let nextYear: string = "";
let newRecords: any[] = [];
let _masRecords: ICurBudgetItem[] = [];
let _isSubmit: boolean = false;

const BudgetPlan = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;
  propDropValue = { ...props.dropValue };
  let _curYear: string =
    propDropValue.Period[propDropValue.Period.length - 1].text;
  isUserPermissions = { ...props.groupUsers };

  const _budgetPlanColumns: IColumn[] = [
    {
      key: "column1",
      name: "Category",
      fieldName: Config.BudgetListColumns.CategoryId.toString(),
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: ICurBudgetItem): any => {
        return item.ID ? (
          <div title={item.Category} style={{ cursor: "pointer" }}>
            {item.Category}
          </div>
        ) : (
          item.isEdit && (
            <div title={item.Category} style={{ cursor: "pointer" }}>
              {item.Category}
            </div>
          )
        );
      },
    },
    {
      key: "column2",
      name: "Area",
      fieldName: Config.BudgetListColumns.Area,
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: ICurBudgetItem): any => {
        return item.ID ? (
          <div title={item.Area} style={{ cursor: "pointer" }}>
            {item.Area}
          </div>
        ) : (
          item.isEdit && (
            <div title={item.Area} style={{ cursor: "pointer" }}>
              {item.Area}
            </div>
          )
        );
      },
    },
    {
      key: "column3",
      name: "Description",
      fieldName: Config.BudgetListColumns.Description,
      minWidth: 200,
      maxWidth: _isCurYear ? 250 : 300,
      onRender: (item: ICurBudgetItem): any => {
        return !item.isEdit ? (
          <div title={item.Description} style={{ cursor: "pointer" }}>
            {item.Description}
          </div>
        ) : isUserPermissions.isSuperAdmin ||
          item.ApproveStatus !== "Approved" ? (
          <div>
            <TextField
              value={curData.Description ? curData.Description : ""}
              styles={
                isValidation.isDescription ? errtxtFieldStyle : textFieldStyle
              }
              placeholder="Enter Here"
              onChange={(e: any) => {
                curData.Description = e.target.value;
                setCurData({ ...curData });
              }}
            />
          </div>
        ) : (
          <div title={item.Description} style={{ cursor: "pointer" }}>
            {item.Description}
          </div>
        );
      },
    },
    {
      key: "column4",
      name: "Comment",
      fieldName: Config.BudgetListColumns.Comments,
      minWidth: 300,
      maxWidth: 330,
      onRender: (item: ICurBudgetItem): any => {
        return item.isDummy && !item.isEdit ? (
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              width: "100%",
            }}
          >
            <div
              style={{
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: "#4d546a",
                display: "inline",
                padding: 4,
                color: "#fff",
                borderRadius: 4,
              }}
              onClick={() => {
                if (!_isBack) {
                  _isBack = !item.isEdit;
                  _isAction = false;
                  _isSubmit = false;
                  _getEditItem(item, "Add");
                } else {
                  _getPageErrorMSG(item, "Add", null);
                }
              }}
            >
              Click here to create a subcategory
            </div>
          </div>
        ) : !item.isEdit ? (
          <div
            title={item.Comments}
            style={{
              cursor: "pointer",
              width: "98%",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {item.Comments.trim() ? item.Comments : "N/A"}
          </div>
        ) : isUserPermissions.isSuperAdmin ||
          item.ApproveStatus !== "Approved" ? (
          <div>
            <TextField
              multiline
              value={curData.Comments ? curData.Comments : ""}
              placeholder="Enter Here"
              styles={multilineStyle}
              className={styles.multilinePlaceHolder}
              onChange={(e: any) => {
                curData.Comments = e.target.value;
                setCurData({ ...curData });
              }}
            />
          </div>
        ) : (
          <div
            title={item.Comments}
            style={{
              cursor: "pointer",
              width: "98%",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {item.Comments.trim() ? item.Comments : "N/A"}
          </div>
        );
      },
    },
    {
      key: "column5",
      name: "Budget Required",
      fieldName: Config.BudgetListColumns.BudgetProposed,
      minWidth: 100,
      maxWidth: 130,
      onRender: (item: ICurBudgetItem): any => {
        return item.isDummy && !item.isEdit ? null : !item.isEdit ? (
          <div style={{ color: "#E39C5A" }}>
            {SPServices.format(Number(item.BudgetProposed))}
          </div>
        ) : isUserPermissions.isSuperAdmin ||
          item.ApproveStatus !== "Approved" ? (
          <div>
            <TextField
              value={
                curData.BudgetProposed ? curData.BudgetProposed.toString() : "0"
              }
              placeholder="Enter Here"
              styles={
                isValidation.isBudgetRequired
                  ? errtxtFieldStyle
                  : textFieldStyle
              }
              onChange={(e: any, value: any) => {
                if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                  curData.BudgetProposed = SPServices.numberFormat(value);
                  setCurData({ ...curData });
                }
              }}
            />
          </div>
        ) : (
          <div style={{ color: "#E39C5A" }}>
            {SPServices.format(Number(item.BudgetProposed))}
          </div>
        );
      },
    },
    {
      // Selva Changes
      key: "column6",
      name: "Budget Allocated",
      fieldName: Config.BudgetListColumns.BudgetAllocated,
      minWidth: 150,
      maxWidth: 150,
      onRender: (item: ICurBudgetItem): any => {
        return item.isDummy && !item.isEdit ? null : !item.isEdit ? (
          <div style={{ color: "#E39C5A" }}>
            {SPServices.format(Number(item.BudgetAllocated))}
          </div>
        ) : (isUserPermissions.isSuperAdmin ||
            isUserPermissions.isInfraManager ||
            isUserPermissions.isEnterpricesManager ||
            isUserPermissions.isSpecialManager) &&
          item.ApproveStatus !== "Approved" ? (
          <div>
            <TextField
              value={
                curData.BudgetAllocated
                  ? curData.BudgetAllocated.toString()
                  : "0"
              }
              placeholder="Enter Here"
              styles={
                isValidation.isBudgetAllocated
                  ? errtxtFieldStyle
                  : textFieldStyle
              }
              onChange={(e: any, value: any) => {
                if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                  curData.BudgetAllocated = SPServices.numberFormat(value);
                  let result: any =
                    Number(curData.BudgetAllocated) - curData.Used;
                  curData.RemainingCost = SPServices.numberFormat(result);
                  setCurData({ ...curData });
                }
              }}
            />
          </div>
        ) : (
          <div style={{ color: "#E39C5A" }}>
            {SPServices.format(Number(item.BudgetAllocated))}
          </div>
        );
      },
    },
    {
      key: "column7",
      name: "Used",
      minWidth: 100,
      maxWidth: 130,
      onRender: (item: any) => {
        return item.isDummy && !item.isEdit ? null : (
          <div style={{ color: "#AC455E" }}>{SPServices.format(item.Used)}</div>
        );
      },
    },
    {
      key: "column8",
      name: "Budget Variance",
      minWidth: 100,
      maxWidth: 130,
      onRender: (item: any) => {
        return item.isDummy && !item.isEdit ? null : (
          <div
            style={{
              padding: "4px 12px",
              backgroundImage:
                item.RemainingCost >= 0
                  ? "linear-gradient(to right, #59e27f, #f1f1f1)"
                  : "linear-gradient(to right, #e25e59, #f1f1f1)",
              display: "inline",
              borderRadius: 4,
              color: "#000",
            }}
          >
            {SPServices.format(item.RemainingCost)}
          </div>
        );
      },
    },
    {
      key: "column9",
      name: "Action",
      minWidth: 50,
      maxWidth: 80,
      onRender: (item: any) => {
        return (
          <div>
            {item.isEdit ? (
              <div
                style={{
                  display: "flex",
                  gap: "6%",
                }}
              >
                <Icon
                  iconName="CheckMark"
                  style={{
                    color: "green",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // !_isSubmit && _getValidation();
                    // _isSubmit = true;
                    _getValidation();
                  }}
                />
                <Icon
                  iconName="Cancel"
                  style={{
                    color: "red",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    _isBack = !item.isEdit;
                    _getCancelItems();
                    _isSubmit = false;
                  }}
                />
              </div>
            ) : item.ID &&
              item.Year == _curYear &&
              item.ApproveStatus !== "Approved" ? (
              <div
                style={{
                  display: "flex",
                  gap: "6%",
                }}
              >
                <Icon
                  iconName="Edit"
                  style={{
                    color: "blue",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (!_isBack) {
                      _isBack = !item.isEdit;
                      _isAction = true;
                      _isSubmit = false;
                      _getEditItem(item, "Edit");
                    } else {
                      _getPageErrorMSG(item, "Edit", null);
                    }
                  }}
                />
                <Icon
                  iconName="Delete"
                  style={{
                    color: "red",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (!_isBack) {
                      _isSubmit = false;
                      _getEditItem(item, "Deleted");
                    } else {
                      _getPageErrorMSG(item, "Deleted", null);
                    }
                  }}
                />
              </div>
            ) : (
              !item.isDummy && (
                <img
                  style={{
                    height: 26,
                    width: 30,
                  }}
                  src={_ApproveIcon}
                />
              )
            )}
          </div>
        );
      },
    },
  ];

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [detailColumn, setDetailColumn] = useState<IColumn[]>([]);
  const [items, setItems] = useState<ICurBudgetItem[]>([]);
  const [group, setGroup] = useState<any[]>([]);
  const [filPeriodDrop, setFilPeriodDrop] = useState<string>(
    propDropValue.Period[propDropValue.Period.length - 1].text
  );
  const [filCountryDrop, setFilCountryDrop] = useState<string>("All");
  const [filTypeDrop, setFilTypeDrop] = useState<string>("All");
  const [filAreaDrop, setFilAreaDrop] = useState<string>("All");
  const [curData, setCurData] = useState<ICurBudgetItem>({
    ...Config.curBudgetItem,
  });
  const [isValidation, setIsValidation] = useState<IBudgetValidation>(
    Config.budgetValidation
  );
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [isTrigger, setIsTrigger] = useState<boolean>(true);
  const [isModal, setIsModal] = useState<boolean>(false);
  const [isSubModal, setIsSubModal] = useState<boolean>(false);
  const [isSubmitModal, setIsSubmitModal] = useState<boolean>(false);
  const [isAllocateMSG, setIsAllocateMSG] = useState<boolean>(false);
  const [isNextYearModal, setIsNextYearModal] = useState<boolean>(false);
  const [MCUpdate, setMCUpdate] = useState<IMasterCategoryUpdate>({
    ...Config.MasterCategoryUpdate,
  });

  /* Style Section */
  const _DetailsListStyle: Partial<IDetailsListStyles> = {
    root: {
      marginTop: "20px",
      ".ms-DetailsHeader": {
        backgroundColor: "#ededed",
        padding: "0px",
      },
      ".ms-DetailsHeader-cell": {
        ":first-child": {
          color: "#202945",
          cursor: "pointer",
        },
        ":hover": {
          backgroundColor: "#ededed",
        },
      },
      ".ms-DetailsHeader-cellName": {
        color: "#202945",
        fontWeight: "700 !important",
        fontSize: "16px !important",
      },
      ".ms-GroupHeader-title": {
        width: "100%",
        "span:nth-child(2)": {
          display: "none",
        },
      },
      "[data-automationid=DetailsRowFields]": {
        alignItems: "center !important",
      },
      ".ms-DetailsRow-cell": {
        fontSize: 14,
      },
      ".ms-DetailsList-contentWrapper": {
        height: items.length ? "58vh" : 20,
        width: items.length && "100%",
        overflowY: "auto",
        overflowX: "hidden",
      },
    },
  };

  const DropdownStyle: Partial<IDropdownStyles> = {
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const textFieldStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const multilineStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      minHeight: 18,
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
    field: {
      padding: "0px 8px",
    },
    root: {
      textarea: {
        resize: "none",
      },
    },
  };

  const errtxtFieldStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      border: "1px solid red",
      "::after": {
        border: "1px solid red",
      },
      ":hover": {
        border: "1px solid red",
      },
    },
  };

  const modalStyles: Partial<IModalStyles> = {
    main: {
      width: "20%",
      minHeight: 128,
      background: "#f7f9fa",
      padding: 10,
      height: "auto",
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      overflow: "unset",
    },
  };

  const nextYearBtnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      background: "#f5ce42 !important",
      height: 33,
      borderRadius: 5,
      cursor: "pointer",
    },
    label: {
      fontWeight: 500,
      color: "#000",
      fontSize: 16,
    },
    icon: {
      fontSize: 16,
      color: "#fff",
    },
  };

  const btnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      background: _isMasterSubmit ? "#fc0362 !important" : "#05da73 !important",
      height: 33,
      borderRadius: 5,
      cursor: items.length && _isMasterSubmit ? "pointer" : "not-allowed",
    },
    label: {
      fontWeight: 500,
      color: "#fff",
      fontSize: 16,
    },
    icon: {
      fontSize: 16,
      color: "#fff",
    },
  };

  /* function creation */
  const _getErrorFunction = (errMsg: any, name: string): void => {
    console.log(name, errMsg);
    alertify.error(name);
    setIsLoader(false);
  };

  window.onbeforeunload = (e: any): string => {
    if (_isBack) {
      let dialogText =
        "You have unsaved changes, are you sure you want to leave?";
      e.returnValue = dialogText;
      isValidation.isBudgetRequired = false;
      isValidation.isDescription = false;
      isValidation.isBudgetAllocated = false;
      setIsValidation({ ...isValidation });
      return dialogText;
    }
  };

  const _getGenerateExcel = (): void => {
    let _arrGenExcel: IOverAllItem[] = JSON.parse(JSON.stringify(_arrOfMaster));
    let _arrExport: IOverAllItem[] = [];

    for (let i: number = 0; _arrGenExcel.length > i; i++) {
      _arrGenExcel[i].subCategory.pop();
      _arrExport.push({ ..._arrGenExcel[i] });
    }

    if (_arrExport.length) {
      const workbook: any = new Excel.Workbook();
      const worksheet: any = workbook.addWorksheet("My Sheet");
      let headerRows: string[] = [];

      worksheet.columns = [
        { header: "ID", key: "ID", width: 10 },
        { header: "Category Type", key: "CategoryType", width: 25 },
        { header: "Status", key: "Status", width: 25 },
        { header: "Area", key: "Area", width: 25 },
        { header: "Category", key: "Category", width: 25 },
        { header: "Country", key: "Country", width: 25 },
        { header: "Year", key: "Year", width: 25 },
        { header: "Type", key: "Type", width: 25 },
        { header: "Description", key: "Description", width: 25 },
        { header: "Budget Required", key: "BudgetRequired", width: 25 },
        { header: "Budget Allocated", key: "BudgetAllocated", width: 25 },
      ];

      for (let i: number = 0; _arrExport.length > i; i++) {
        let _curObject: any = {};
        let _isCreate: boolean = true;

        if (_arrExport[i].subCategory.length && filPeriodDrop === _curYear) {
          _isCreate = _arrExport[i].subCategory.every(
            (e: ICurBudgetItem) => e.ApproveStatus === "Approved"
          );
        } else if (filPeriodDrop !== _curYear) {
          _isCreate = false;
        }

        if (!_isCreate) {
          _curObject = {
            ID: _arrExport[i].ID,
            CategoryType: _arrExport[i].CategoryType,
            Status: _arrExport[i].Status,
            Area: _arrExport[i].Area,
            Category: _arrExport[i].CategoryAcc,
            Country: _arrExport[i].CountryAcc,
            Year: _arrExport[i].YearAcc,
            Type: _arrExport[i].Type,
            Description: "-",
            BudgetRequired: _arrExport[i].TotalProposed,
            BudgetAllocated: _arrExport[i].OverAllBudgetCost,
          };

          const row = worksheet.addRow({ ..._curObject });

          for (const [key, val] of Object.entries({ ..._curObject })) {
            const cell = row.getCell(key);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "ffc9d1" },
            };
          }

          for (let j: number = 0; _arrExport[i].subCategory.length > j; j++) {
            if (
              filPeriodDrop === _curYear &&
              _arrExport[i].subCategory[j].ApproveStatus !== "Approved"
            ) {
              worksheet.addRow({
                ID: _arrExport[i].subCategory[j].ID,
                CategoryType: _arrExport[i].subCategory[j].CategoryType,
                Status: _arrExport[i].subCategory[j].ApproveStatus,
                Area: _arrExport[i].subCategory[j].Area,
                Category: _arrExport[i].subCategory[j].Category,
                Country: _arrExport[i].subCategory[j].Country,
                Year: _arrExport[i].subCategory[j].Year,
                Type: _arrExport[i].subCategory[j].Type,
                Description: _arrExport[i].subCategory[j].Description,
                BudgetRequired: _arrExport[i].subCategory[j].BudgetProposed,
                BudgetAllocated: _arrExport[i].subCategory[j].BudgetAllocated,
              });
            } else if (filPeriodDrop !== _curYear) {
              worksheet.addRow({
                ID: _arrExport[i].subCategory[j].ID,
                CategoryType: _arrExport[i].subCategory[j].CategoryType,
                Status: _arrExport[i].subCategory[j].ApproveStatus,
                Area: _arrExport[i].subCategory[j].Area,
                Category: _arrExport[i].subCategory[j].Category,
                Country: _arrExport[i].subCategory[j].Country,
                Year: _arrExport[i].subCategory[j].Year,
                Type: _arrExport[i].subCategory[j].Type,
                Description: _arrExport[i].subCategory[j].Description,
                BudgetRequired: _arrExport[i].subCategory[j].BudgetProposed,
                BudgetAllocated: _arrExport[i].subCategory[j].BudgetAllocated,
              });
            }
          }
        }
      }

      headerRows = [
        "A1",
        "B1",
        "C1",
        "D1",
        "E1",
        "F1",
        "G1",
        "H1",
        "I1",
        "J1",
        "K1",
      ];

      worksheet.protect("", { formatCells: true });

      const columnsToUnlock = ["K"];
      columnsToUnlock.forEach((column) => {
        worksheet
          .getColumn(column)
          .eachCell({ includeEmpty: true }, (cell: any) => {
            cell.protection = { locked: false };
          });
      });

      headerRows.map((key: any) => {
        worksheet.getCell(key).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "88dbdf" },
          bold: true,
        };
      });

      headerRows.map((key: any) => {
        worksheet.getCell(key).font = {
          bold: true,
        };
      });

      headerRows.map((key: any) => {
        worksheet.getCell(key).alignment = {
          vertical: "middle	",
          horizontal: "center",
        };
      });

      workbook.xlsx
        .writeBuffer()
        .then((buffer: any) =>
          FileSaver.saveAs(
            new Blob([buffer]),
            `Budget Planning-${moment().format("MM_DD_YYYY")}.xlsx`
          )
        )
        .catch((err: any) => {
          _getErrorFunction(err, "Error writing excel export");
        });
    } else {
      alertify.error("There are no sub categories");
    }
  };

  const _getFileImport = async (e: any) => {
    let file: any = e;
    let fileType: string = file.name.split(".");

    if (fileType[1].toLowerCase() == "xlsx") {
      const workbook: any = new Excel.Workbook();
      await workbook.xlsx.load(file);
      const worksheet: any = workbook.worksheets[0];
      const rows: any = worksheet.getSheetValues();
      let _removeEmptyDatas: any[] = rows.slice(1);

      listItems = [];
      listItems = _removeEmptyDatas.map((row: any, i: number) => ({
        ID: row[1] ? row[1] : "",
        CategoryType: row[2] ? row[2] : "",
        Status:
          i === 0
            ? row[3]
              ? row[3]
              : ""
            : row[3] !== "Not Started"
            ? row[3]
            : "Pending",
        Area: row[4] ? row[4] : "",
        Category: row[5] ? row[5] : "",
        Country: row[6] ? row[6] : "",
        Year: row[7] ? row[7] : "",
        Type: row[8] ? row[8] : "",
        Description: row[9] ? row[9] : "",
        BudgetRequired: row[10] ? row[10] : 0,
        BudgetAllocated: row[11] ? row[11] : 0,
      }));

      document.getElementById("fileUpload")["value"] = "";

      if (
        worksheet.name.toLowerCase() == "my sheet" &&
        listItems[0].ID.toLowerCase() == "id" &&
        listItems[0].CategoryType.toLowerCase() == "category type" &&
        listItems[0].Status.toLowerCase() == "status" &&
        listItems[0].Area.toLowerCase() == "area" &&
        listItems[0].Category.toLowerCase() == "category" &&
        listItems[0].Country.toLowerCase() == "country" &&
        listItems[0].Year.toLowerCase() == "year" &&
        listItems[0].Type.toLowerCase() == "type" &&
        listItems[0].Description.toLowerCase() == "description" &&
        listItems[0].BudgetRequired.toLowerCase() == "budget required" &&
        listItems[0].BudgetAllocated.toLowerCase() == "budget allocated"
      ) {
        let _catArray: any[] = [];
        let _subArray: any[] = [];
        _masArray = [];

        listItems.shift();
        [...listItems].forEach((e: any) => {
          if (e.CategoryType.toLowerCase() === "master category") {
            _catArray.push({
              ID: e.ID,
              Status: e.Status,
              OverAllBudgetCost: e.BudgetAllocated,
              OverAllRemainingCost: e.BudgetAllocated,
            });
          }
          if (e.CategoryType.toLowerCase() === "sub category") {
            _subArray.push({
              ID: e.ID,
              ApproveStatus: e.Status,
              BudgetAllocated: e.BudgetAllocated,
              RemainingCost: e.BudgetAllocated,
            });
          }
        });

        _masArray = [
          { ListName: Config.ListNames.CategoryList, _Array: [..._catArray] },
          { ListName: Config.ListNames.BudgetList, _Array: [..._subArray] },
        ];
        setIsModal(true);
      } else {
        alertify.error("Please import correct excel format");
      }
    } else {
      alertify.error("Please import only xlsx file");
    }
  };

  const _getDefaultFunction = (): void => {
    alertifyMSG = "";
    _isBack = false;
    _isAction = false;
    setIsNextYearModal(false);
    isValidation.isBudgetRequired = false;
    isValidation.isDescription = false;
    isValidation.isBudgetAllocated = false;
    setIsValidation({ ...isValidation });
    setIsLoader(true);
    filPeriodDrop == _curYear && !_isAdminView
      ? _budgetPlanColumns
      : _budgetPlanColumns.pop();
    setDetailColumn([..._budgetPlanColumns]);
    _getCategoryDatas(filPeriodDrop);
  };

  const _getCategoryDatas = (year: string): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryList,
      Select:
        "*, Year/ID, Year/Title, Country/ID, Country/Title, MasterCategory/ID",
      Expand: "Year, Country, MasterCategory",
      Filter:
        filPeriodDrop == _curYear
          ? [
              {
                FilterKey: "isDeleted",
                Operator: "ne",
                FilterValue: "1",
              },
              {
                FilterKey: "Year/Title",
                Operator: "eq",
                FilterValue: year,
              },
            ]
          : [
              {
                FilterKey: "isDeleted",
                Operator: "ne",
                FilterValue: "1",
              },
              {
                FilterKey: "Year/Title",
                Operator: "eq",
                FilterValue: year,
              },
              {
                FilterKey: "Status",
                Operator: "eq",
                FilterValue: "Approved",
              },
            ],
      Topcount: 5000,
    })
      .then((resCate: any) => {
        let _curCategory: ICurCategoryItem[] = [];

        if (resCate.length) {
          for (let i: number = 0; resCate.length > i; i++) {
            _curCategory.push({
              ID: resCate[i].ID,
              CategoryAcc: resCate[i].Title
                ? {
                    ID: resCate[i].ID,
                    Text: resCate[i].Title,
                  }
                : undefined,
              Type: resCate[i].CategoryType ? resCate[i].CategoryType : "",
              Area: resCate[i].Area ? resCate[i].Area : "",
              YearAcc: resCate[i].YearId
                ? {
                    ID: resCate[i].Year.ID,
                    Text: resCate[i].Year.Title,
                  }
                : undefined,
              CountryAcc: resCate[i].CountryId
                ? {
                    ID: resCate[i].Country.ID,
                    Text: resCate[i].Country.Title,
                  }
                : undefined,
              OverAllBudgetCost: resCate[i].OverAllBudgetCost
                ? resCate[i].OverAllBudgetCost
                : null,
              OverAllRemainingCost: resCate[i].OverAllRemainingCost
                ? resCate[i].OverAllRemainingCost
                : null,
              OverAllPOIssuedCost: resCate[i].OverAllPOIssuedCost
                ? resCate[i].OverAllPOIssuedCost
                : null,
              TotalProposed: resCate[i].TotalProposed
                ? resCate[i].TotalProposed
                : null,
              CategoryType: "Master Category",
              Status: resCate[i].Status ? resCate[i].Status : "",
            });
            i + 1 == resCate.length && _getFilterFunction([..._curCategory]);
          }
        } else {
          _getFilterFunction([..._curCategory]);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get category list");
      });
  };

  const _getFilterFunction = (_filData: ICurCategoryItem[]): void => {
    let tempArr: ICurCategoryItem[] = [];

    tempArr = _filterArray(
      isUserPermissions,
      [..._filData],
      Config.Navigation.BudgetPlanning
    );

    if (tempArr.length) {
      if (filCountryDrop != "All" && tempArr.length) {
        tempArr = tempArr.filter((arr: ICurCategoryItem) => {
          return arr.CountryAcc.Text == filCountryDrop;
        });
      }
      if (filTypeDrop != "All" && tempArr.length) {
        tempArr = tempArr.filter((arr: ICurCategoryItem) => {
          return arr.Type == filTypeDrop;
        });
      }
      if (filAreaDrop != "All" && tempArr.length) {
        tempArr = tempArr.filter((arr: ICurCategoryItem) => {
          return arr.Area == filAreaDrop;
        });
      }

      if (tempArr.length) {
        _getBudgetDatas([...tempArr]);
      } else {
        setItems([]);
        setGroup([]);
        setIsLoader(false);
      }
    } else {
      setItems([]);
      setGroup([]);
      setIsLoader(false);
    }
  };

  const _getBudgetDatas = (_arrCate: ICurCategoryItem[]): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.BudgetList,
      Select:
        "*, Category/ID, Category/Title, Year/ID, Year/Title, Country/ID, Country/Title",
      Expand: "Category, Year, Country",
      Filter:
        filPeriodDrop === _curYear
          ? [
              {
                FilterKey: "isDeleted",
                FilterValue: "1",
                Operator: "ne",
              },
              {
                FilterKey: "Year/Title",
                Operator: "eq",
                FilterValue: _arrCate[0].YearAcc.Text,
              },
            ]
          : [
              {
                FilterKey: "isDeleted",
                FilterValue: "1",
                Operator: "ne",
              },
              {
                FilterKey: "Year/Title",
                Operator: "eq",
                FilterValue: _arrCate[0].YearAcc.Text,
              },
              {
                FilterKey: "ApproveStatus",
                Operator: "eq",
                FilterValue: "Approved",
              },
            ],
      Topcount: 5000,
      Orderbydecorasc: true,
    })
      .then((resBudget: any) => {
        let _curItem: ICurBudgetItem[] = [];

        if (resBudget.length) {
          for (let i: number = 0; resBudget.length > i; i++) {
            let _remainCost: number = 0;

            if (resBudget[i].Used || resBudget[i].BudgetAllocated) {
              _remainCost = resBudget[i].BudgetAllocated
                ? resBudget[i].BudgetAllocated - resBudget[i].Used
                : 0 - resBudget[i].Used;
            }

            _curItem.push({
              ID: resBudget[i].ID,
              Category: resBudget[i].CategoryId
                ? resBudget[i].Category.Title
                : "",
              Country: resBudget[i].CountryId ? resBudget[i].Country.Title : "",
              Year: resBudget[i].YearId ? resBudget[i].Year.Title : "",
              Type: resBudget[i].CategoryType ? resBudget[i].CategoryType : "",
              Area: resBudget[i].Area ? resBudget[i].Area : "",
              CateId: resBudget[i].CategoryId ? resBudget[i].Category.ID : null,
              CounId: resBudget[i].CountryId ? resBudget[i].Country.ID : null,
              YearId: resBudget[i].YearId ? resBudget[i].Year.ID : null,
              BudgetAllocated: resBudget[i].BudgetAllocated
                ? resBudget[i].BudgetAllocated
                : 0,
              BudgetProposed: resBudget[i].BudgetProposed
                ? resBudget[i].BudgetProposed
                : 0,
              Used: resBudget[i].Used ? resBudget[i].Used : 0,
              ApproveStatus: resBudget[i].ApproveStatus
                ? resBudget[i].ApproveStatus
                : "",
              Description: resBudget[i].Description
                ? resBudget[i].Description
                : "",
              Comments: resBudget[i].Comments ? resBudget[i].Comments : "",
              RemainingCost: _remainCost,
              isDeleted: resBudget[i].isDeleted,
              isEdit: false,
              isDummy: false,
              isApproved: false,
              CategoryType: "Sub Category",
            });
            i + 1 == resBudget.length &&
              _arrMasterCategoryData([..._arrCate], [..._curItem]);
          }
        } else {
          _arrMasterCategoryData([..._arrCate], [..._curItem]);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get budget list");
      });
  };

  const _arrMasterCategoryData = (
    _arrCate: ICurCategoryItem[],
    _arrBudget: ICurBudgetItem[]
  ): void => {
    let _arrMasterCategory: IOverAllItem[] = [];
    _isMasApprove = [..._arrBudget].some(
      (e: ICurBudgetItem) => e.ApproveStatus === "Approved"
    );

    if (_arrCate.length) {
      for (let i: number = 0; _arrCate.length > i; i++) {
        _arrMasterCategory.push({
          CategoryAcc: _arrCate[i].CategoryAcc.Text,
          YearAcc: _arrCate[i].YearAcc.Text,
          CountryAcc: _arrCate[i].CountryAcc.Text,
          Type: _arrCate[i].Type,
          Area: _arrCate[i].Area,
          ID: _arrCate[i].ID,
          yearID: _arrCate[i].YearAcc.ID,
          countryID: _arrCate[i].CountryAcc.ID,
          OverAllBudgetCost: _arrCate[i].OverAllBudgetCost,
          OverAllPOIssuedCost: _arrCate[i].OverAllPOIssuedCost,
          OverAllRemainingCost: _arrCate[i].OverAllRemainingCost,
          TotalProposed: _arrCate[i].TotalProposed,
          CategoryType: _arrCate[i].CategoryType,
          Status: _arrCate[i].Status,
          subCategory: [],
        });
        i + 1 == _arrCate.length &&
          (_prepareArrMasterDatas([..._arrMasterCategory], [..._arrBudget]),
          (_groupItem = [..._arrMasterCategory]));
      }
    } else {
      setItems([]);
      setGroup([]);
      setIsLoader(false);
    }
  };

  const _prepareArrMasterDatas = (
    _arrCateDatas: IOverAllItem[],
    _arrBudget: ICurBudgetItem[]
  ): void => {
    let _curEmptyItem: ICurBudgetItem;
    _arrOfMaster = [];

    for (let i: number = 0; _arrCateDatas.length > i; i++) {
      let isDatas: boolean = true;
      _arrCateDatas[i].subCategory = [];
      for (let j: number = 0; _arrBudget.length > j; j++) {
        if (
          _arrCateDatas[i].ID == _arrBudget[j].CateId &&
          _arrCateDatas[i].YearAcc == _arrBudget[j].Year &&
          _arrCateDatas[i].CategoryAcc == _arrBudget[j].Category &&
          _arrCateDatas[i].CountryAcc == _arrBudget[j].Country &&
          _arrCateDatas[i].Type == _arrBudget[j].Type &&
          _arrCateDatas[i].Area == _arrBudget[j].Area
        ) {
          isDatas = false;
          _arrCateDatas[i].subCategory.push(_arrBudget[j]);
        }
        if (!isDatas && j + 1 == _arrBudget.length) {
          _curEmptyItem =
            _arrCateDatas[i].YearAcc == _curYear &&
            _getPrepareArrangedDatas(_arrCateDatas[i]);
          if (filPeriodDrop === _curYear && !_isAdminView) {
            _arrCateDatas[i].subCategory.push({ ..._curEmptyItem });
          }
          [..._arrCateDatas[i].subCategory].map((e: ICurBudgetItem) => {
            return (e.isApproved = _isMasApprove);
          });
          _arrOfMaster.push(_arrCateDatas[i]);
        }
      }
      if (!_isAdminView && isDatas && _arrCateDatas[i].YearAcc == _curYear) {
        _curEmptyItem = _getPrepareArrangedDatas({ ..._arrCateDatas[i] });
        _arrCateDatas[i].subCategory.push({ ..._curEmptyItem });
        [..._arrCateDatas[i].subCategory].map((e: ICurBudgetItem) => {
          return (e.isApproved = _isMasApprove);
        });
        _arrOfMaster.push(_arrCateDatas[i]);
      }
      i + 1 == _arrCateDatas.length &&
        _getMasterRecordsDetails([..._arrOfMaster]);
    }
  };

  const _getPrepareArrangedDatas = (
    _arrCateDatas: IOverAllItem
  ): ICurBudgetItem => {
    let _curSampleData: ICurBudgetItem;
    _curSampleData = {
      ID: null,
      Category: _arrCateDatas.CategoryAcc,
      Country: _arrCateDatas.CountryAcc,
      Year: _arrCateDatas.YearAcc,
      Type: _arrCateDatas.Type,
      CateId: _arrCateDatas.ID,
      CounId: _arrCateDatas.countryID,
      YearId: _arrCateDatas.yearID,
      Area: _arrCateDatas.Area,
      BudgetAllocated: 0,
      BudgetProposed: 0,
      Used: 0,
      RemainingCost: 0,
      ApproveStatus: "Not Started",
      Description: "",
      Comments: "",
      isDeleted: false,
      isEdit: false,
      isDummy: true,
      isApproved: false,
    };
    return _curSampleData;
  };

  const _getMasterRecordsDetails = (data: IOverAllItem[]): void => {
    let _isValue: boolean = false;
    let _arrMas: IOverAllItem[] = [...data];
    let _curObj: ICurBudgetItem;

    _master: for (let i: number = 0; _arrMas.length > i; i++) {
      _curObj = _arrMas[i].subCategory.pop();

      _isValue = _arrMas[i].subCategory.some(
        (e: ICurBudgetItem) => e.ApproveStatus !== "Approved"
      );

      _arrMas[i].subCategory.push({ ..._curObj });

      if (_isValue) {
        _isMasterSubmit = _isValue;
        break _master;
      } else {
        _isMasterSubmit = _isValue;
      }
    }

    groups([...data]);
  };

  const groups = (_filRecord: IOverAllItem[]): void => {
    let reOrderedRecords: ICurBudgetItem[] = [];
    let Uniquelessons: ICurBudgetItem[] = [];
    let matches: ICurBudgetItem[] = [];
    let _overAllCategoryArr: ICurBudgetItem[] = [];

    if (_filRecord.length == 0) {
      setItems([]);
      setGroup([]);
      setIsLoader(false);
    } else {
      for (let i: number = 0; _filRecord.length > i; i++) {
        if (_filRecord[i].subCategory.length) {
          Uniquelessons = _filRecord[i].subCategory.reduce(
            (item: any, e1: any) => {
              matches = item.filter((e2: any) => {
                return (
                  e1.Category === e2.CategoryAcc &&
                  e1.Year === e2.YearAcc &&
                  e1.Country === e2.CountryAcc &&
                  e1.Type === e2.Type &&
                  e1.CateId === e2.ID &&
                  e1.Area === e2.Area
                );
              });
              if (matches.length == 0) {
                _overAllCategoryArr.push(e1);
              }
              return _overAllCategoryArr;
            },
            []
          );
        }
      }
      _filRecord.forEach((ul: any) => {
        let FilteredData: ICurBudgetItem[] = Uniquelessons.filter(
          (arr: any) => {
            return (
              arr.CateId === ul.ID &&
              arr.Type === ul.Type &&
              arr.Area === ul.Area
            );
          }
        );
        let sortingRecord = reOrderedRecords.concat(FilteredData);
        reOrderedRecords = sortingRecord;
      });
      _masRecords = [...reOrderedRecords];
      groupsforDL([..._filRecord]);
    }
  };

  const groupsforDL = (arrCate: IOverAllItem[]) => {
    newRecords = [];
    let _recordsLength: number = 0;

    arrCate.forEach((arr: IOverAllItem, i: number) => {
      newRecords.push({
        Category: arr.CategoryAcc ? arr.CategoryAcc : "",
        Country: arr.CountryAcc ? arr.CountryAcc : "",
        Year: arr.YearAcc ? arr.YearAcc : "",
        Type: arr.Type ? arr.Type : "",
        Area: arr.Area ? arr.Area : "",
        ID: arr.ID ? arr.ID : null,
        OverAllBudgetCost: arr.OverAllBudgetCost ? arr.OverAllBudgetCost : null,
        TotalProposed: arr.TotalProposed ? arr.TotalProposed : null,
        indexValue: _recordsLength,
        isEdit: false,
        OverAllPOIssuedCost: arr.OverAllPOIssuedCost
          ? arr.OverAllPOIssuedCost
          : 0,
        OverAllRemainingCost: arr.OverAllRemainingCost
          ? arr.OverAllRemainingCost
          : 0,
      });
      _recordsLength += arr.subCategory.length;
    });

    _groupAcc([...newRecords]);
  };

  const _groupAcc = (newRecords: any[]): void => {
    let varGroup: any[] = [];

    newRecords.forEach((ur: any, index: number) => {
      let record = _masRecords.filter((arr: ICurBudgetItem) => {
        return (
          arr.CateId === ur.ID && arr.Type === ur.Type && arr.Area === ur.Area
        );
      });

      let _totalAmount: string = ur.OverAllBudgetCost
        ? ur.OverAllBudgetCost.toString()
        : ur.TotalProposed
        ? ur.TotalProposed.toString()
        : "0";

      let totalUsedAmt: number = 0;
      record.forEach((val: ICurBudgetItem) => {
        totalUsedAmt = Number(val.Used) + Number(totalUsedAmt);
      });

      varGroup.push({
        key: ur.Category,
        name: ur.Country ? (
          <div
            style={{
              color: ur.OverAllBudgetCost ? "#000" : "#a7a700",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
              }}
            >
              <div>
                {ur.Category + " - " + ur.Country + " ( " + ur.Type + " ) ~ "}
              </div>

              <div
                style={{
                  marginLeft: 6,
                  display: "flex",
                }}
              >
                <span
                  style={{
                    marginRight: 6,
                  }}
                >
                  AED
                </span>
                <p
                  style={{
                    margin: "0 7px",
                    color: ur.OverAllBudgetCost ? "#E39C5A" : "#a7a700",
                  }}
                >
                  {`(Total Remaining Balance -
                  ${SPServices.format(
                    Number(_totalAmount) - Number(totalUsedAmt)
                  )})`}
                </p>
                {SPServices.format(Number(_totalAmount))}
              </div>

              {isUserPermissions.isSuperAdmin && (
                <div
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <Icon
                    iconName="Edit"
                    style={{
                      color: "blue",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (!_isBack) {
                        _isBack = !ur.isEdit;
                        _isAction = true;
                        _masEdit(index, "edit");
                      } else {
                        _getPageErrorMSG(ur, "edit", index);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          ur.Category
        ),
        startIndex: ur.indexValue,
        count: record.length,
      });

      if (index == newRecords.length - 1) {
        _Items = [..._masRecords];
        _isBack = false;
        setItems([..._masRecords]);
        setGroup([...varGroup]);
        setIsDeleteModal(false);
        alertifyMSG && alertify.success(`Item ${alertifyMSG} successfully`);
        setIsLoader(false);
      }
    });
  };

  const _masEdit = (index: number, type: string): void => {
    let _currentArr: any[] = [...newRecords];

    _currentArr.forEach((e: any) => {
      return (e.isEdit = false);
    });

    if (type === "edit") {
      MCUpdate.Status = Config.ApprovalStatus.Approved;
      MCUpdate.ID = _currentArr[index].ID;
      MCUpdate.TotalProposed = _currentArr[index].TotalProposed;
      MCUpdate.OverAllBudgetCost = _currentArr[index].OverAllBudgetCost;
      MCUpdate.OverAllPOIssuedCost = _currentArr[index].OverAllPOIssuedCost;
      MCUpdate.OverAllRemainingCost = _currentArr[index].OverAllRemainingCost;
      MCUpdate.Value = _currentArr[index].OverAllBudgetCost
        ? _currentArr[index].OverAllBudgetCost
        : _currentArr[index].TotalProposed
        ? _currentArr[index].TotalProposed
        : 0;
      MCUpdate.isEdit = true;
      MCUpdate.Index = index;

      _currentArr[index].isEdit = true;
      setMCUpdate({ ...MCUpdate });
    } else {
      _currentArr[index].isEdit = false;
      setMCUpdate({ ...Config.MasterCategoryUpdate });
    }

    _groupAcc([..._currentArr]);
  };

  const _getEditItem = (_curItem: ICurBudgetItem, type: string): void => {
    curData.Category = _curItem.Category;
    curData.Year = _curItem.Year;
    curData.Type = _curItem.Type;
    curData.Country = _curItem.Country;
    curData.ApproveStatus = _curItem.ApproveStatus;
    curData.Description = _curItem.Description;
    curData.Comments = _curItem.Comments;
    curData.Area = _curItem.Area;
    curData.ID = _curItem.ID;
    curData.CateId = _curItem.CateId;
    curData.CounId = _curItem.CounId;
    curData.YearId = _curItem.YearId;
    curData.BudgetAllocated = SPServices.decimalCount(
      Number(_curItem.BudgetAllocated)
    );
    curData.BudgetProposed = SPServices.decimalCount(
      Number(_curItem.BudgetProposed)
    );
    curData.Used = SPServices.decimalCount(Number(_curItem.Used));
    // curData.RemainingCost = SPServices.decimalCount(
    //   Number(_curItem.RemainingCost)
    // );
    curData.RemainingCost = curData.BudgetAllocated - curData.Used;
    curData.isDeleted = false;
    curData.isEdit = false;
    curData.isApproved = _curItem.isApproved;
    setCurData({ ...curData });

    _curBudgetAllocated = SPServices.decimalCount(
      Number(_curItem.BudgetAllocated)
    );
    _curRemainingCost = SPServices.decimalCount(Number(_curItem.RemainingCost));
    _curUsedCost = SPServices.decimalCount(Number(_curItem.Used));

    if (type == "Deleted") {
      setIsDeleteModal(true);
    } else {
      for (let i: number = 0; _Items.length > i; i++) {
        if (
          _Items[i].Category === _curItem.Category &&
          _Items[i].Country === _curItem.Country &&
          _Items[i].Year === _curItem.Year &&
          _Items[i].Type === _curItem.Type &&
          _Items[i].ID === _curItem.ID &&
          _Items[i].Area === _curItem.Area
        ) {
          _Items[i].isEdit = true;
        } else {
          _Items[i].isEdit = false;
        }
        i + 1 == _Items.length && setItems([..._Items]);
      }
    }
  };

  const _getCancelItems = (): void => {
    isValidation.isBudgetRequired = false;
    isValidation.isDescription = false;
    isValidation.isBudgetAllocated = false;
    setIsValidation({ ...isValidation });
    setCurData({ ...Config.curBudgetItem });
    for (let i: number = 0; _Items.length > i; i++) {
      _Items[i].isEdit = false;
      i + 1 == _Items.length && setItems([..._Items]);
    }
  };

  const _getValidation = (): void => {
    let _isValid: boolean = true;
    let _isDuplicate: boolean = false;
    let _curOverAllAllocatedAmount: number = 0;

    let _arrDuplicate: ICurBudgetItem[] = _Items.filter(
      (e: ICurBudgetItem) => e.CateId === curData.CateId && e.ID != curData.ID
    );
    _isDuplicate = [..._arrDuplicate].some(
      (e: ICurBudgetItem) =>
        e.Description.toLowerCase().trim() ===
        curData.Description.toLowerCase().trim()
    );

    if (!curData.Description.trim() || _isDuplicate) {
      _isValid = false;
      isValidation.isDescription = _isDuplicate ? _isDuplicate : true;
      // isValidation.isBudgetRequired = curData.BudgetAllocated ? false : true;
    }
    if (!curData.Description.trim()) {
      alertify.error("Please enter description");
    } else if (_isDuplicate) {
      alertify.error("Already description exists");
    }
    // if (!curData.BudgetProposed || _isDuplicate) {
    //   _isValid = false;
    //   isValidation.isBudgetRequired = curData.BudgetProposed ? false : true;
    //   isValidation.isDescription = _isDuplicate
    //     ? _isDuplicate
    //     : curData.Description.trim()
    //     ? false
    //     : true;
    // }

    // if (!curData.Description.trim() && !curData.BudgetProposed) {
    //   alertify.error("Please enter description and budget propsed");
    // } else if (
    //   (!curData.Description.trim() || _isDuplicate) &&
    //   !curData.BudgetProposed
    // ) {
    //   _isDuplicate && !curData.BudgetProposed
    //     ? alertify.error(
    //         "Already description exists and Please enter budget propsed"
    //       )
    //     : !curData.Description.trim()
    //     ? alertify.error("Please enter description")
    //     : _isDuplicate
    //     ? alertify.error("Already description exists")
    //     : !curData.Description.trim() &&
    //       alertify.error("Please enter description");
    // } else if (_isDuplicate || !curData.Description.trim()) {
    //   !curData.Description.trim()
    //     ? alertify.error("Please enter description")
    //     : alertify.error("Already description exists");
    // } else if (!curData.BudgetProposed) {
    //   alertify.error("Please enter budget propsed");
    // } else if (!curData.Description.trim()) {
    //   alertify.error("Please enter description");
    // }

    // for (let n: number = 0; _arrOfMaster.length > n; n++) {
    //   let _count: number = 0;
    //   let _TotalAllocated: number = 0;
    //   let _indexNo: number = null;

    //   if (
    //     _arrOfMaster[n].CategoryAcc === curData.Category &&
    //     _arrOfMaster[n].CountryAcc === curData.Country &&
    //     _arrOfMaster[n].YearAcc === curData.Year &&
    //     _arrOfMaster[n].Type === curData.Type &&
    //     _arrOfMaster[n].ID === curData.CateId &&
    //     _arrOfMaster[n].Area === curData.Area
    //   ) {
    //     let _initial: number = 0;
    //     let _curNewSubCategory: ICurBudgetItem[] = [];
    //     let _curAmountArray: number[] = [];

    //     _curNewSubCategory = _arrOfMaster[n].subCategory.filter(
    //       (e: ICurBudgetItem) => e.BudgetAllocated !== null
    //     );

    //     _indexNo = [..._curNewSubCategory].findIndex(
    //       (e: ICurBudgetItem) => e.ID === curData.ID
    //     );

    //     [..._curNewSubCategory].forEach((e: ICurBudgetItem) =>
    //       _curAmountArray.push(
    //         e.BudgetAllocated ? Number(e.BudgetAllocated) : 0
    //       )
    //     );

    //     if (curData.ID) {
    //       _curAmountArray.splice(_indexNo, 1, Number(curData.BudgetAllocated));
    //     }

    //     if (_curAmountArray.length === _curNewSubCategory.length) {
    //       _curOverAllAllocatedAmount = _arrOfMaster[n].OverAllBudgetCost
    //         ? _arrOfMaster[n].OverAllBudgetCost
    //         : 0;
    //       _TotalAllocated = _curOverAllAllocatedAmount;
    //       _count = [..._curAmountArray].reduce((a, b) => a + b, _initial);
    //       _totalRemaningAmount = _TotalAllocated - _count;
    //       _curRemainingCost =
    //         _curUsedCost === 0
    //           ? Number(curData.BudgetAllocated)
    //           : Number(curData.BudgetAllocated) - _curUsedCost;
    //     }
    //   }
    // }

    if (_isValid) {
      setIsValidation({ ...Config.budgetValidation });
      _getPrepareDatas();

      // isValidation.isBudgetRequired = false;
      // isValidation.isDescription = false;

      // if (
      //   _curOverAllAllocatedAmount !== 0 &&
      //   _curUsedCost > Number(curData.BudgetAllocated)
      // ) {
      //   isValidation.isBudgetAllocated = true;
      //   setIsValidation({ ...isValidation });
      //   alertify.error("You have less than of used amount");
      // } else if (
      //   _curOverAllAllocatedAmount === 0 ||
      //   (_totalRemaningAmount >= 0 && _isAction)
      // ) {
      //   _isBack = !curData.isEdit;
      //   setIsLoader(true);
      //   isValidation.isBudgetAllocated = false;
      //   setIsValidation({ ...isValidation });
      //   _getPrepareDatas();
      // } else if (
      //   _curOverAllAllocatedAmount === 0 ||
      //   (_totalRemaningAmount >= Number(curData.BudgetAllocated) &&
      //     _totalRemaningAmount >= 0)
      // ) {
      //   _isBack = !curData.isEdit;
      //   setIsLoader(true);
      //   isValidation.isBudgetAllocated = false;
      //   setIsValidation({ ...isValidation });
      //   _getPrepareDatas();
      // } else if (_curOverAllAllocatedAmount !== 0) {
      //   isValidation.isBudgetAllocated = true;
      //   setIsValidation({ ...isValidation });
      //   alertify.error("The budget allocated amount limit crossed");
      // }
    } else {
      setIsValidation({ ...isValidation });
    }
  };

  const _getPrepareDatas = (): void => {
    setIsLoader(true);
    let data: any = {};
    const columns: IBudgetListColumn = Config.BudgetListColumns;
    if (curData.ID) {
      _isBack = !curData.isEdit;
      data[columns.Description] = curData.Description;
      data[columns.BudgetProposed] = Number(curData.BudgetProposed);
      data[columns.BudgetAllocated] = Number(curData.BudgetAllocated);
      // data[columns.RemainingCost] = Number(_curRemainingCost);
      data[columns.RemainingCost] = Number(curData.BudgetAllocated);
      data[columns.Comments] = curData.Comments;
      data[columns.Area] = curData.Area;
      data[columns.ApproveStatus] =
        isUserPermissions.isSuperAdmin ||
        isUserPermissions.isEnterpricesManager ||
        isUserPermissions.isInfraManager ||
        isUserPermissions.isSpecialManager
          ? Config.ApprovalStatus.Pending
          : curData.ApproveStatus;
      _getEditData({ ...data }, "Updated");
    } else {
      data[columns.CategoryId] = curData.CateId;
      data[columns.CountryId] = curData.CounId;
      data[columns.YearId] = curData.YearId;
      data[columns.Description] = curData.Description;
      // data[columns.ApproveStatus] = curData.isApproved
      //   ? curData.ApproveStatus === "Approved"
      //     ? curData.ApproveStatus
      //     : "Pending"
      //   : "Not Started";
      data[columns.ApproveStatus] =
        isUserPermissions.isSuperAdmin ||
        isUserPermissions.isEnterpricesManager ||
        isUserPermissions.isInfraManager ||
        isUserPermissions.isSpecialManager
          ? Config.ApprovalStatus.Pending
          : curData.ApproveStatus;
      data[columns.CategoryType] = curData.Type;
      data[columns.BudgetProposed] = Number(curData.BudgetProposed);
      data[columns.BudgetAllocated] = Number(curData.BudgetAllocated);
      // data[columns.RemainingCost] = Number(_curRemainingCost);
      data[columns.RemainingCost] = Number(curData.BudgetAllocated);
      data[columns.Comments] = curData.Comments;
      data[columns.Area] = curData.Area;
      _getAddData({ ...data });
    }
  };

  const _getAddData = (_addData: any): void => {
    SPServices.SPAddItem({
      Listname: Config.ListNames.BudgetList,
      RequestJSON: _addData,
    })
      .then((_resAdd: any) => {
        let _arrNewBudget: ICurBudgetItem[] = [];
        let _TotalAmount: number = 0;
        curData.ID = _resAdd.data.ID;
        curData.CategoryType = "Sub Category";
        curData.ApproveStatus =
          isUserPermissions.isSuperAdmin ||
          isUserPermissions.isEnterpricesManager ||
          isUserPermissions.isInfraManager ||
          isUserPermissions.isSpecialManager
            ? Config.ApprovalStatus.Pending
            : curData.ApproveStatus;
        _Items.push({ ...curData });

        for (let i: number = 0; _Items.length > i; i++) {
          if (
            _Items[i].CateId == curData.CateId &&
            _Items[i].Category == curData.Category &&
            _Items[i].Country == curData.Country &&
            _Items[i].Year == curData.Year &&
            _Items[i].Type == curData.Type &&
            _Items[i].Area == curData.Area
          ) {
            _TotalAmount +=
              _Items[i].ID == curData.ID
                ? Number(curData.BudgetProposed)
                : _Items[i].BudgetProposed
                ? Number(_Items[i].BudgetProposed)
                : 0;
          }
          if (_Items[i].ID === curData.ID) {
            _Items[i].CategoryType = "Sub Category";
            // _Items[i].RemainingCost = Number(_curRemainingCost);
            _arrNewBudget.push(_Items[i]);
          } else if (_Items[i].ID) {
            _arrNewBudget.push(_Items[i]);
          }
          i + 1 == _Items.length &&
            ((alertifyMSG = "Added"),
            _getUpdateCategoryTotal(_TotalAmount, [..._arrNewBudget]));
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Add budget list");
      });
  };

  const _getEditData = (_editData: any, type: string): void => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.BudgetList,
      ID: curData.ID,
      RequestJSON: _editData,
    })
      .then((_resEdit: any) => {
        let _arrNewBudget: ICurBudgetItem[] = [];
        let _TotalAmount: number = 0;
        let _message: string = "";
        let isDeleted: boolean = true;
        for (let i: number = 0; _Items.length > i; i++) {
          if (
            _Items[i].CateId == curData.CateId &&
            _Items[i].Category == curData.Category &&
            _Items[i].Country == curData.Country &&
            _Items[i].Year == curData.Year &&
            _Items[i].Type == curData.Type &&
            _Items[i].Area == curData.Area &&
            isDeleted
          ) {
            if (type == "Updated") {
              isDeleted = true;
              _TotalAmount +=
                _Items[i].ID == curData.ID
                  ? Number(curData.BudgetProposed)
                  : _Items[i].BudgetProposed
                  ? Number(_Items[i].BudgetProposed)
                  : 0;
            } else {
              isDeleted = false;
              _TotalAmount =
                Number(
                  _groupItem.filter(
                    (e: IOverAllItem) => e.ID == curData.CateId
                  )[0].TotalProposed
                ) - Number(curData.BudgetProposed);
            }
          }

          if (_Items[i].ID) {
            if (type == "Updated" && _Items[i].ID == curData.ID) {
              _message = type;
              // curData.RemainingCost = Number(_curRemainingCost);
              _arrNewBudget.push({ ...curData });
            } else if (type == "Deleted" && _Items[i].ID == curData.ID) {
              _message = type;
            } else {
              _arrNewBudget.push(_Items[i]);
            }
          }
          i + 1 == _Items.length &&
            ((alertifyMSG = _message),
            _getUpdateCategoryTotal(_TotalAmount, [..._arrNewBudget]));
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get edit");
      });
  };

  const _getUpdateCategoryTotal = (
    Total: number,
    _arrNewBudget: ICurBudgetItem[]
  ): void => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CategoryList,
      ID: curData.CateId,
      RequestJSON: {
        TotalProposed: Total,
      },
    })
      .then((res: any) => {
        _isAction = false;
        let _emptyGroup: IOverAllItem[] = [];
        for (let i: number = 0; _groupItem.length > i; i++) {
          if (
            _groupItem[i].ID == curData.CateId &&
            _groupItem[i].CategoryAcc == curData.Category &&
            _groupItem[i].CountryAcc == curData.Country &&
            _groupItem[i].YearAcc == curData.Year &&
            _groupItem[i].Type == curData.Type &&
            _groupItem[i].Area == curData.Area
          ) {
            _groupItem[i].TotalProposed = Total;
            _emptyGroup.push({ ..._groupItem[i] });
          } else {
            _emptyGroup.push(_groupItem[i]);
          }
        }
        _prepareArrMasterDatas([..._emptyGroup], [..._arrNewBudget]);
      })
      .catch((err: any) => {
        _getErrorFunction(err, "get update category");
      });
  };

  const _getPageErrorMSG = (
    _item: ICurBudgetItem,
    _type: string,
    index: number
  ): void => {
    if (_isBack) {
      if (_type == "Deleted") {
        if (
          confirm("You have unsaved changes, are you sure you want to leave?")
        ) {
          isValidation.isBudgetRequired = false;
          isValidation.isDescription = false;
          isValidation.isBudgetAllocated = false;
          setIsValidation({ ...isValidation });
          _isBack = false;
          _getEditItem(_item, "Deleted");
        }
      } else if (_type == "edit") {
        if (
          confirm("You have unsaved changes, are you sure you want to leave?")
        ) {
          isValidation.isBudgetRequired = false;
          isValidation.isDescription = false;
          isValidation.isBudgetAllocated = false;
          setIsValidation({ ...isValidation });
          _isBack = false;
          _masEdit(index, "edit");
        }
      } else if (
        confirm("You have unsaved changes, are you sure you want to leave?")
      ) {
        isValidation.isBudgetRequired = false;
        isValidation.isDescription = false;
        isValidation.isBudgetAllocated = false;
        setIsValidation({ ...isValidation });
        _getEditItem(_item, "Add");
      } else null;
    } else {
      _isBack = false;
    }
  };

  const _getPrepareJSON = (): void => {
    let _curMasterArray: IOverAllItem[] = JSON.parse(
      JSON.stringify(_arrOfMaster)
    );
    let _curArray: any[] = [];
    let _curCateArray: any[] = [];
    let _curSubArray: any[] = [];
    let _isFunTriger: boolean = true;
    let _curNewBudgetArray: ICurBudgetItem[] = [];
    let _curIdRemoveArray: ICurBudgetItem[] = [];

    _loop: for (let j: number = 0; _curMasterArray.length > j; j++) {
      _curIdRemoveArray = [];
      _curNewBudgetArray = [];

      _curIdRemoveArray = _curMasterArray[j].subCategory.filter(
        (e: ICurBudgetItem) => e.ID !== null && e.BudgetProposed != 0
      );

      _curNewBudgetArray =
        !isUserPermissions.isSuperAdmin ||
        !isUserPermissions.isEnterpricesManager ||
        !isUserPermissions.isInfraManager ||
        !isUserPermissions.isSpecialManager
          ? _curIdRemoveArray.filter(
              (e: ICurBudgetItem) => e.ApproveStatus === "Not Started"
            )
          : [];

      if (
        _curMasterArray[j].Status !== "Not Started" &&
        _curIdRemoveArray.length
      ) {
        _curCateArray.push({
          ID: _curMasterArray[j].ID,
          Status: "Approved",
        });

        if (!_curNewBudgetArray.length) {
          _isFunTriger = true;

          for (let k: number = 0; _curIdRemoveArray.length > k; k++) {
            _curSubArray.push({
              ID: _curIdRemoveArray[k].ID,
              ApproveStatus: "Approved",
            });
          }
        } else {
          _isFunTriger = false;
          setIsSubModal(false);
          // setIsSubmitModal(true);
          break _loop;
        }
      } else {
        if (_curIdRemoveArray.length) {
          _isFunTriger = false;
          // setIsSubModal(false);
          // setIsAllocateMSG(true);
          break _loop;
        }
      }
    }

    if (
      (_curCateArray.length && _curSubArray.length && _isFunTriger) ||
      isUserPermissions.isSuperAdmin ||
      isUserPermissions.isEnterpricesManager ||
      isUserPermissions.isInfraManager ||
      isUserPermissions.isSpecialManager
    ) {
      _curArray = [
        { ListName: Config.ListNames.CategoryList, _Array: [..._curCateArray] },
        { ListName: Config.ListNames.BudgetList, _Array: [..._curSubArray] },
      ];

      _isFunTriger = false;
      setIsSubModal(false);
      _getUpdateBulkDatas([..._curArray]);
    }
  };

  const _getUpdateBulkDatas = async (data: any[]) => {
    setIsModal(false);
    setIsSubModal(false);
    setIsLoader(true);

    for (let i: number = 0; data.length > i; i++) {
      if (data[i]._Array.length) {
        await SPServices.batchUpdate({
          ListName: data[i].ListName,
          responseData: data[i]._Array,
        })
          .then((res: any) => {
            data.length === i + 1 && setIsTrigger(!isTrigger);
          })
          .catch((err: any) => {
            _getErrorFunction(err, "Get update bulk data");
          });
      } else if (i === 1) {
        setIsTrigger(!isTrigger);
      }
    }
  };

  const _addYear = (nextYear: string): void => {
    SPServices.SPAddItem({
      Listname: Config.ListNames.YearList,
      RequestJSON: { Title: nextYear, ManuallyCreated: true },
    })
      .then((res: any) => {
        setIsNextYearModal(false);
        alertify.success(`Please wait ${nextYear} year data's processing.`);
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Add year");
      });
  };

  const _handleUpdateJSON = (): void => {
    MCUpdate.OverAllBudgetCost = MCUpdate.Value;
    MCUpdate.OverAllRemainingCost =
      MCUpdate.Value - MCUpdate.OverAllPOIssuedCost;

    delete MCUpdate.Index;
    delete MCUpdate.OverAllPOIssuedCost;
    delete MCUpdate.TotalProposed;
    delete MCUpdate.Value;
    delete MCUpdate.isEdit;

    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CategoryList,
      ID: MCUpdate.ID,
      RequestJSON: { ...MCUpdate },
    })
      .then((res: any) => {
        alertifyMSG = "";
        _isBack = false;
        setMCUpdate({ ...Config.MasterCategoryUpdate });
        alertify.success(`Item updated successfully`);
        _getDefaultFunction();
      })
      .catch((err: any) => {
        _getErrorFunction(err, "handle update json");
      });
  };

  /* Life cycle of onload */
  useEffect(() => {
    _getDefaultFunction();
  }, [isTrigger]);

  return isLoader ? (
    <Loader />
  ) : (
    <div style={{ width: "100%" }}>
      {/* Heading section */}
      <Label className={styles.HeaderLable}>Budget Planning</Label>

      {/* Filter section */}
      <div className={styles.filterSection}>
        {/* Left side section */}
        <div className={styles.filters}>
          {/* Country section */}
          <div style={{ width: "24%" }}>
            <Label>Country</Label>
            <Dropdown
              styles={DropdownStyle}
              options={[...propDropValue.Country]}
              selectedKey={_getFilterDropValues(
                "Country",
                {
                  ...propDropValue,
                },
                filCountryDrop
              )}
              onChange={(e: any, text: IDrop) => {
                _isCurYear = filPeriodDrop == _curYear ? true : false;
                setFilCountryDrop(text.text as string);
                setIsTrigger(!isTrigger);
              }}
            />
          </div>

          {/* Area section */}
          <div style={{ width: "24%" }}>
            <Label>Area</Label>
            <Dropdown
              styles={DropdownStyle}
              options={[...propDropValue.Area]}
              selectedKey={_getFilterDropValues(
                "Area",
                { ...propDropValue },
                filAreaDrop
              )}
              onChange={(e: any, text: IDrop) => {
                _isCurYear = filPeriodDrop == _curYear ? true : false;
                setFilAreaDrop(text.text as string);
                setIsTrigger(!isTrigger);
              }}
            />
          </div>

          {/* Period section */}
          <div style={{ width: "12%" }}>
            <Label>Period</Label>
            <Dropdown
              styles={DropdownStyle}
              options={[...propDropValue.Period]}
              selectedKey={_getFilterDropValues(
                "Period",
                { ...propDropValue },
                filPeriodDrop
              )}
              onChange={(e: any, text: IDrop) => {
                _isCurYear = (text.text as string) == _curYear ? true : false;
                setFilPeriodDrop(text.text as string);
                setIsTrigger(!isTrigger);
              }}
            />
          </div>

          {/* Type section */}
          <div style={{ width: "12%" }}>
            <Label>Type</Label>
            <Dropdown
              styles={DropdownStyle}
              options={[...propDropValue.Type]}
              selectedKey={_getFilterDropValues(
                "Type",
                { ...propDropValue },
                filTypeDrop
              )}
              onChange={(e: any, text: IDrop) => {
                _isCurYear = filPeriodDrop == _curYear ? true : false;
                setFilTypeDrop(text.text as string);
                setIsTrigger(!isTrigger);
              }}
            />
          </div>

          {/* Over all refresh section */}
          <div
            className={styles.refIcon}
            onClick={() => {
              _isCurYear = true;
              _getCancelItems();
              setFilPeriodDrop(
                propDropValue.Period[propDropValue.Period.length - 1].text
              );
              setFilCountryDrop("All");
              setFilTypeDrop("All");
              setFilAreaDrop("All");
              setIsTrigger(!isTrigger);
            }}
          >
            <Icon iconName="Refresh" style={{ color: "#ffff" }} />
          </div>
        </div>

        {/* btn sections */}
        <div className={styles.rightBtns}>
          {/* Next year plan btn section */}
          {filPeriodDrop == _curYear && isUserPermissions.isSuperAdmin && (
            <DefaultButton
              text="Next Year Plan"
              styles={nextYearBtnStyle}
              onClick={() => {
                nextYear = (
                  Number(
                    propDropValue.Period[propDropValue.Period.length - 1].text
                  ) + 1
                ).toString();
                setIsNextYearModal(true);
              }}
            />
          )}

          {/* import btn section */}
          {filPeriodDrop == _curYear &&
            !_isAdminView &&
            (isUserPermissions.isEnterpricesManager ||
              isUserPermissions.isInfraManager ||
              isUserPermissions.isSpecialManager ||
              isUserPermissions.isSuperAdmin) && (
              <>
                <input
                  id="fileUpload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    _getFileImport(e.target.files[0]);
                  }}
                />
                <label htmlFor="fileUpload" className={styles.uploadBtn}>
                  Import
                </label>
              </>
            )}

          {/* export btn section */}
          {(isUserPermissions.isEnterpricesManager ||
            isUserPermissions.isInfraManager ||
            isUserPermissions.isSpecialManager ||
            isUserPermissions.isSuperAdmin) && (
            <button
              className={styles.exportBtns}
              style={{
                cursor: items.length ? "pointer" : "not-allowed",
              }}
              onClick={() => items.length && _getGenerateExcel()}
            >
              Export
            </button>
          )}

          {/* submit btn section */}
          {filPeriodDrop == _curYear &&
            !_isAdminView &&
            (isUserPermissions.isEnterpricesManager ||
              isUserPermissions.isInfraManager ||
              isUserPermissions.isSpecialManager ||
              isUserPermissions.isSuperAdmin) && (
              <DefaultButton
                text="Submit"
                styles={btnStyle}
                onClick={() => {
                  if (_isMasterSubmit && items.length) {
                    setIsSubModal(true);
                  }
                }}
              />
            )}
        </div>
      </div>

      {/* Dashboard Detail list section */}
      <DetailsList
        items={[...items]}
        groups={[...group]}
        columns={[...detailColumn]}
        styles={_DetailsListStyle}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
      {items.length == 0 && (
        <div className={styles.noRecords}>No data found !!!</div>
      )}

      {/* Delete Modal section */}
      <Modal isOpen={isDeleteModal} isBlocking={false} styles={modalStyles}>
        <div>
          {/* Content section */}
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "Delete" }}
            />
          </div>
          <Label
            style={{
              color: "red",
              fontSize: 16,
            }}
          >
            Do you want to delete this item?
          </Label>
          {/* gif or img */}

          {/* btn section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                setIsDeleteModal(false);
              }}
            >
              No
            </button>
            <button
              className={styles.yesBTN}
              onClick={() => {
                setIsLoader(true);
                let data: any = {};
                const _deletedColumn: IBudgetListColumn =
                  Config.BudgetListColumns;
                data[_deletedColumn.isDeleted] = true;
                _getEditData({ ...data }, "Deleted");
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>

      {/* modal section*/}
      <Modal isOpen={isModal} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "Import" }}
            />
          </div>
          <Label
            style={{
              color: "red",
              fontSize: 16,
            }}
          >
            Do you want to import the exel file?
          </Label>

          {/* btn section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                setIsModal(false);
              }}
            >
              No
            </button>
            <button
              className={styles.yesBTN}
              onClick={() => {
                _getUpdateBulkDatas([..._masArray]);
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>

      {/* modal section of over all submit */}
      <Modal isOpen={isSubModal} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "CheckMark" }}
            />
          </div>
          <Label
            style={{
              color: "#202945",
              fontSize: 16,
              lineHeight: 1.3,
              marginTop: 20,
            }}
          >
            Are your sure want to submit.
            <br />
            You can't change the data after submit.
          </Label>

          {/* btn section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                setIsSubModal(false);
              }}
            >
              No
            </button>
            <button
              className={styles.yesBTN}
              onClick={() => {
                _getPrepareJSON();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>

      {/* modal of over all submit */}
      {/* <Modal isOpen={isSubmitModal} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "Warning12" }}
            />
          </div>
          <Label
            style={{
              color: "#202945",
              fontSize: 16,
              lineHeight: 1.3,
              marginTop: 20,
            }}
          >
            Budget allocated was not update for the sub category. <br />
            Please export and import to update.
          </Label>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                setIsSubmitModal(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal> */}

      {/* modal of allocate msg */}
      {/* <Modal isOpen={isAllocateMSG} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "Warning12" }}
            />
          </div>
          <Label
            style={{
              color: "#202945",
              fontSize: 16,
              lineHeight: 1.3,
              marginTop: 20,
            }}
          >
            Budget allocated was not Updated and it will
            <br />
            be highlighted in the Yellow colour.Please
            <br />
            Export and Import to Update the Budget
            <br />
            Allocated details.
          </Label>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                setIsAllocateMSG(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal> */}

      {/* modal section*/}
      <Modal isOpen={isNextYearModal} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "WebAppBuilderFragmentCreate" }}
            />
          </div>
          <Label
            style={{
              color: "#000",
              fontSize: 16,
            }}
          >
            Are you want sure {nextYear} planning?
          </Label>

          {/* btn section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                setIsNextYearModal(false);
              }}
            >
              No
            </button>
            <button
              className={styles.yesBTN}
              onClick={() => {
                _addYear(nextYear);
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>

      {/* Master Category Amount Calculate Modal Box */}
      <Modal isOpen={MCUpdate.isEdit} isBlocking={false} styles={modalStyles}>
        <div>
          {/* Lable section */}
          <div
            style={{
              display: "flex",
              fontSize: "16px",
              fontWeight: 600,
              paddingBottom: "10px",
            }}
          >
            Master Category ( AED )
          </div>

          {/* Text Feild section */}
          <TextField
            value={MCUpdate.Value ? MCUpdate.Value.toString() : "0"}
            placeholder="Enter Here"
            styles={textFieldStyle}
            onChange={(e: any, value: any) => {
              if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                MCUpdate.Value = SPServices.numberFormat(value);
                setMCUpdate({ ...MCUpdate });
              }
            }}
          />

          {/* btn section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: "20px",
            }}
          >
            <button
              className={styles.noBTN}
              onClick={() => {
                _isBack = false;
                _masEdit(MCUpdate.Index, "cancle");
              }}
            >
              Cancel
            </button>
            <button
              style={{
                cursor: MCUpdate.Value !== 0 ? "pointer" : "not-allowed",
              }}
              disabled={MCUpdate.Value !== 0 ? false : true}
              className={styles.yesBTN}
              onClick={() => {
                _handleUpdateJSON();
              }}
            >
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetPlan;
