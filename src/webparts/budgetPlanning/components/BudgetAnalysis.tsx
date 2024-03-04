import * as React from "react";
import { useState, useEffect } from "react";
import SPServices from "../../../CommonServices/SPServices";
import { Config } from "../../../globals/Config";
import Pagination from "office-ui-fabric-react-pagination";
import {
  ICurBudgetAnalysis,
  IDrop,
  IDropdowns,
  IEdit,
} from "../../../globalInterFace/BudgetInterFaces";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import styles from "./BudgetAnalysis.module.scss";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import Loader from "./Loader";
import {
  Label,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IDetailsListStyles,
  Dropdown,
  IDropdownStyles,
  IColumn,
  Icon,
  TextField,
  ITextFieldStyles,
  DefaultButton,
  Modal,
  IModalStyles,
} from "@fluentui/react";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import { IButtonStyles } from "office-ui-fabric-react";
import { _filterArray } from "../../../CommonServices/filterCommonArray";

// image and gif variables
const importGif = require("../../../ExternalRef/Images/Import.gif");

let _isCurYear: boolean = true;
let listItems = [];
let propDropValue: IDropdowns;
let _currentPage = 1;
let _previousPage = 1;
let isCheck = false;

interface IPagination {
  perPage: number;
  currentPage: number;
}

const BudgetAnalysis = (props: any): JSX.Element => {
  // local variables
  propDropValue = { ...props.dropValue };
  let currentYear: string =
    propDropValue.Period[propDropValue.Period.length - 1].text;

  const budjetColums: IColumn[] = [
    {
      key: "column1",
      name: "Category",
      fieldName: "Category",
      minWidth: _isCurYear ? 200 : 230,
      maxWidth: 300,
    },
    {
      key: "column2",
      name: "Area",
      fieldName: "Area",
      minWidth: _isCurYear ? 200 : 230,
      maxWidth: 360,
    },
    {
      key: "column3",
      name: "Country",
      fieldName: "Country",
      minWidth: _isCurYear ? 200 : 230,
      maxWidth: 360,
    },
    {
      key: "column4",
      name: "Type",
      fieldName: "Type",
      minWidth: _isCurYear ? 200 : 230,
      maxWidth: 360,
    },
    {
      key: "column5",
      name: "Total",
      fieldName: "Total",
      minWidth: _isCurYear ? 200 : 100,
      maxWidth: 250,
      onRender: (item: ICurBudgetAnalysis, index: number) => {
        if (item.isEdit) {
          return (
            <TextField
              value={edit.data ? edit.data.toString() : ""}
              placeholder="Enter Here"
              styles={isValidation ? errtxtFieldStyle : textFieldStyle}
              onChange={(e: any, value: any) => {
                if (/^[0-9]+$|^$/.test(value)) {
                  setEdit({ ...edit, data: value });
                  setIsvalidation(false);
                }

                if (!value) {
                  setIsvalidation(true);
                }
              }}
            />
          );
        } else {
          return SPServices.format(item.Total);
        }
      },
    },
    // {
    //   key: "column6",
    //   name: "Action",
    //   fieldName: "action",
    //   minWidth: 100,
    //   maxWidth: 300,
    //   onRender: (item: ICurBudgetAnalysis, index: number) => {
    //     if (!item.isEdit) {
    //       return (
    //         <Icon
    //           iconName="Edit"
    //           style={{
    //             color: "blue",
    //             fontSize: "16px",
    //             cursor: "pointer",
    //           }}
    //           onClick={() => {
    //             handelEdit(index, "Edit", item);
    //           }}
    //         />
    //       );
    //     } else {
    //       return (
    //         <div>
    //           <Icon
    //             iconName="CheckMark"
    //             style={{
    //               color: "green",
    //               fontSize: "20px",
    //               cursor: "pointer",
    //             }}
    //             onClick={() => {
    //               handleEditUpdate(item, index);
    //             }}
    //           />
    //           <Icon
    //             iconName="Cancel"
    //             style={{
    //               color: "red",
    //               fontSize: "20px",
    //               cursor: "pointer",
    //             }}
    //             onClick={() => {
    //               handelEdit(index, "Close", item);
    //             }}
    //           />
    //         </div>
    //       );
    //     }
    //   },
    // },
  ];

  // const cols = [...budjetColums];
  // cols.pop();

  // state creaction
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [masterData, setMasterData] = useState<ICurBudgetAnalysis[]>([]);
  const [budgetItems, setBudgetItems] = useState<ICurBudgetAnalysis[]>([]);
  const [viewBudgetItems, setViewBudgetItems] = useState<ICurBudgetAnalysis[]>(
    []
  );
  const [isValidation, setIsvalidation] = useState<boolean>(false);
  const [filCountryDrop, setFilCountryDrop] = useState<string>("All");
  const [filTypeDrop, setFilTypeDrop] = useState<string>("All");
  const [filCtgryDrop, setFilCtgryDrop] = useState<string>("All");
  const [fillAreaDrop, setFillAreaDrop] = useState<string>("All");
  const [isModal, setIsmodal] = useState(false);
  const [ctgryDropOptions, setCtgryDropOptions] =
    useState<IDropdowns>(propDropValue);
  const [filPeriodDrop, setFilPeriodDrop] = useState<string>(
    propDropValue.Period[propDropValue.Period.length - 1].text
  );
  const [edit, setEdit] = useState<IEdit>({
    authendication: false,
    id: null,
    data: null,
  });
  const [pagination, setPagination] = useState<IPagination>({
    perPage: 10,
    currentPage: 1,
  });

  // style cteations
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
        // height: items.length ? "58vh" : 20,
        overflowY: "auto",
        overflowX: "hidden",
      },
      ".ms-DetailsRow": {
        ":hover": {
          backgroundColor: "white",
          color: "balck",
        },
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

  const errtxtFieldStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      border: "1px solid red",
      "::after": {
        border: "1px solid red",
      },
      ":hover": {
        border: "1px solid red",
      },
      ".ms-Dropdown-title": {
        borderWidth: "2px",
        height: "30px",
      },
    },
    root: {},
  };

  const DropdownStyle: Partial<IDropdownStyles> = {
    root: {
      ".ms-Dropdown-container": {
        width: "100%",
      },
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const buttonStyles: Partial<IButtonStyles> = {
    root: {
      ".ms-Button-label": {
        fontWeight: "500",
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
    },
  };

  // functions creations
  const _getErrorFunction = (errMsg: any, name: string): void => {
    console.log(name, errMsg);
    alertify.error(name);
    setIsLoader(false);
  };

  const _getDefaultFunction = (): void => {
    getAllData(currentYear);
  };

  const getAllData = (year: string): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryList,
      Select: "*, Year/ID, Year/Title, Country/ID, Country/Title",
      Expand: " Year, Country",
      Topcount: 5000,
      Filter: [
        {
          FilterKey: "isDeleted",
          FilterValue: "1",
          Operator: "ne",
        },
        {
          FilterKey: "Year/Title",
          FilterValue: year,
          Operator: "eq",
        },
        {
          FilterKey: "Status",
          Operator: "eq",
          FilterValue: "Approved",
        },
      ],
      Orderbydecorasc: false,
    })
      .then((data: any) => {
        let items: ICurBudgetAnalysis[] = [];
        data.length &&
          data.forEach((value: any) => {
            items.push({
              Category: value.Title ? value.Title : "",
              Country: value.Country.Title ? value.Country.Title : "",
              Year: value.Year.Title ? value.Year.Title : "",
              Type: value.CategoryType ? value.CategoryType : "",
              ID: value.ID ? value.ID : null,
              Total: value.OverAllBudgetCost
                ? value.OverAllBudgetCost
                : value.TotalProposed
                ? value.TotalProposed
                : 0,
              isEdit: false,
              Area: value.Area ? value.Area : "",
              PropsedTotal: value.TotalProposed ? value.TotalProposed : 0,
            });
          });

        let newItems = _filterArray(
          props.groupUsers,
          items,
          Config.Navigation.BudgetAnalysis
        );

        setMasterData(newItems);
        setBudgetItems(newItems);
        getDropdownValues(newItems);
      })
      .catch((error: any) => _getErrorFunction(error, "Get budget data"));
  };

  const getDropdownValues = (items: ICurBudgetAnalysis[]): void => {
    let allCategory: string[] = [...items].map((value) => value.Category);
    let categories: string[] = [...allCategory].filter(
      (value, index) => index === allCategory.indexOf(value)
    );
    let ctgryOptions: IDrop[] = [{ key: 0, text: "All" }];

    categories.length &&
      categories.forEach((value, index) => {
        ctgryOptions.push({ key: index + 1, text: value });
      });

    ctgryDropOptions.ctgryDropOptions = [...ctgryOptions];

    setPaginationData(items);
    setCtgryDropOptions({ ...ctgryDropOptions });
  };

  const setPaginationData = async (items: ICurBudgetAnalysis[]) => {
    let startIndex = (pagination.currentPage - 1) * pagination.perPage;
    let endIndex = startIndex + pagination.perPage;
    let bdgItems = [...items].slice(startIndex, endIndex);
    let authendication = [...viewBudgetItems].some(
      (value) => value.isEdit === true
    );
    if (authendication && isCheck) {
      isCheck = false;
      let isNextPage = confirm(
        "You have unsaved changes, are you sure you want to change the page"
      );
      if (isNextPage) {
        let id = [...viewBudgetItems].filter(
          (value) => value.isEdit === true
        )[0].ID;
        let index = [...items].findIndex((value) => value.ID === id);
        let newBudgetItems = [...items];
        newBudgetItems[index].isEdit = false;
        setBudgetItems(newBudgetItems);
        setIsvalidation(false);
        setViewBudgetItems([...bdgItems]);
        setIsLoader(false);
        setPagination({ ...pagination, currentPage: _currentPage });
      } else {
        authendication = false;
        setPagination({ ...pagination, currentPage: _previousPage });
      }
    } else {
      setViewBudgetItems([...bdgItems]);
      setIsLoader(false);
    }
  };

  const handelEdit = (
    index: number,
    type: string,
    item: ICurBudgetAnalysis
  ): void => {
    let items: ICurBudgetAnalysis[] = [...viewBudgetItems];
    if (type === "Edit") {
      let authendication: boolean = [...items].some(
        (value) => value.isEdit === true
      );
      if (authendication) {
        let newAuthendication: boolean = confirm(
          "You have unsaved changes, are you sure you want to leave?"
        );
        let previousIndex: number = [...items].findIndex(
          (value) => value.isEdit === true
        );

        if (newAuthendication) {
          items[previousIndex].isEdit = false;
          items[index].isEdit = true;
          setEdit({
            authendication: true,
            data: item.Total,
            id: item.ID,
          });
          setIsvalidation(false);
        }
      } else {
        items[index].isEdit = true;

        setEdit({
          authendication: true,
          data: item.Total,
          id: item.ID,
        });
        if (!item.Total) {
          setIsvalidation(true);
        }
      }
      setViewBudgetItems(items);
    } else {
      items[index].isEdit = false;
      setEdit({ ...edit, authendication: false });
      setIsvalidation(false);
    }
  };

  const handleEditUpdate = (item: ICurBudgetAnalysis, index: number): void => {
    if (edit.data) {
      let items: ICurBudgetAnalysis[] = [...viewBudgetItems];
      items[index].isEdit = false;
      items[index].Total = Number(edit.data);
      setViewBudgetItems(items);
      let json = { OverAllBudgetCost: edit.data };
      SPServices.SPUpdateItem({
        Listname: Config.ListNames.CategoryList,
        ID: edit.id,
        RequestJSON: json,
      })
        .then((data) => console.log("data updated succesfully"))
        .catch((error) => _getErrorFunction(error, "Budget update"));
    }
  };

  const handleFilter = (
    Type: string,
    Country: string,
    Category: string,
    Area: string
  ): void => {
    let filteredItems = [...masterData];

    if (Type !== "All") {
      filteredItems = [...filteredItems].filter((value) => value.Type === Type);
    }
    if (Country !== "All") {
      filteredItems = [...filteredItems].filter(
        (value) => value.Country === Country
      );
    }
    if (Category !== "All") {
      filteredItems = [...filteredItems].filter(
        (value) => value.Category === Category
      );
    }
    if (Area !== "All") {
      filteredItems = [...filteredItems].filter((value) => value.Area === Area);
    }

    setBudgetItems(filteredItems);
    setPagination({ ...pagination, currentPage: 1 });
    setPaginationData(filteredItems);
  };

  const generateExcel = (items: ICurBudgetAnalysis[]): void => {
    let newItems = [...items].map;

    let _arrExport: ICurBudgetAnalysis[] = [...items];
    const workbook: any = new Excel.Workbook();
    const worksheet: any = workbook.addWorksheet("My Sheet");
    worksheet.columns = [
      { header: "ID", key: "ID", width: 15 },
      { header: "Area", key: "Area", width: 25 },
      { header: "Year", key: "Year", width: 25 },
      { header: "Category", key: "Category", width: 25 },
      { header: "Country", key: "Country", width: 25 },
      { header: "Type", key: "Type", width: 25 },
      { header: "Total", key: "Total", width: 25 },
    ];

    _arrExport.forEach((item: ICurBudgetAnalysis) => {
      worksheet.addRow({
        ID: item.ID,
        Year: item.Year,
        Category: item.Category,
        Country: item.Country,
        Type: item.Type,
        Total: item.Total,
        Area: item.Area,
      });
    });
    worksheet.autoFilter = {
      from: "A1",
      to: "G1",
    };

    const headerRows: string[] = ["A1", "B1", "C1", "D1", "E1", "F1", "G1"];
    headerRows.map((key: any) => {
      worksheet.getCell(key).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4194c5" },
        bold: true,
      };
    });
    headerRows.map((key: any) => {
      worksheet.getCell(key).font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };
    });
    headerRows.map((key: any) => {
      worksheet.getCell(key).alignment = {
        vertical: "middle	",
        horizontal: "center",
      };
    });

    const readOnlyRows = ["B1", "C1", "D1", "E1", "F1"];
    readOnlyRows.map((key: any) => {
      worksheet.getCell(key).protection = { locked: true };
    });
    workbook.xlsx
      .writeBuffer()
      .then((buffer: any) =>
        FileSaver.saveAs(
          new Blob([buffer]),
          `Category-${moment().format("MM_DD_YYYY")}.xlsx`
        )
      )
      .catch((err: any) => {
        _getErrorFunction(err, "Error writing excel export");
      });
  };

  const getFileImport = async (e: any) => {
    let file: any = e;
    let fileType: string = file.name.split(".");
    if (fileType[1].toLowerCase() == "xlsx") {
      const workbook: any = new Excel.Workbook();
      await workbook.xlsx.load(file);
      const worksheet: any = workbook.worksheets[0];
      const rows: any = worksheet.getSheetValues();
      let _removeEmptyDatas: any[] = rows.slice(1);
      const filteredData = _removeEmptyDatas.filter((row) => {
        return row.some((cell) => cell !== null && cell !== "");
      });
      listItems = [];
      listItems = filteredData.map((row: any) => ({
        ID: row[1] ? row[1] : null,
        OverAllBudgetCost: row[7] ? row[7] : null,
      }));
      //Reset the file
      document.getElementById("fileUpload")["value"] = "";
      if (
        worksheet.name.toLowerCase() == "my sheet" &&
        listItems[0].ID.toLowerCase() == "id" &&
        listItems[0].OverAllBudgetCost.toLowerCase() == "total"
      ) {
        listItems.shift();
        setIsmodal(true);
      } else {
        alertify.error("Please import correct excel format");
      }
    } else {
      alertify.error("Please import only xlsx file");
    }
  };

  const getUpdateImportDatas = (datas: any[]): void => {
    setIsLoader(true);
    SPServices.batchUpdate({
      ListName: Config.ListNames.CategoryList,
      responseData: [...datas],
    })
      .then((res: any) => {
        getAllData(filPeriodDrop);
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get update import datas");
      });
  };

  const reset = (year: string): void => {
    setFilPeriodDrop(year);
    getAllData(year);
    setIsLoader(true);
    setFilCountryDrop("All");
    setFilCtgryDrop("All");
    setFilTypeDrop("All");
    setFillAreaDrop("All");
  };

  // useEffect
  useEffect(() => {
    _getDefaultFunction();
  }, []);

  useEffect(() => {
    // setPagination({ ...pagination, currentPage: 1 })
    setPaginationData(budgetItems);
  }, [pagination]);

  // html binding
  return (
    <>
      {isLoader ? (
        <Loader />
      ) : ctgryDropOptions.ctgryDropOptions.length ? (
        <div>
          {/* Heading section */}
          <Label className={styles.HeaderLable}>Budget Analysis</Label>

          {/* Dropdowns */}
          <div className={styles.Header}>
            <div className={styles.HeaderFilters}>
              <div className={styles.dropdowns}>
                <Dropdown
                  styles={DropdownStyle}
                  label="Country"
                  options={[...propDropValue.Country]}
                  selectedKey={_getFilterDropValues(
                    "Country",
                    { ...propDropValue },
                    filCountryDrop
                  )}
                  onChange={(e: any, text: IDrop) => {
                    _isCurYear = filPeriodDrop == currentYear ? true : false;
                    setFilCountryDrop(text.text as string);
                    handleFilter(
                      filTypeDrop,
                      text.text,
                      filCtgryDrop,
                      fillAreaDrop
                    );
                  }}
                />
              </div>
              <div className={styles.dropdowns}>
                <Dropdown
                  styles={DropdownStyle}
                  label="Area"
                  options={[...propDropValue.Area]}
                  selectedKey={_getFilterDropValues(
                    "Area",
                    { ...propDropValue },
                    fillAreaDrop
                  )}
                  onChange={(e: any, text: IDrop) => {
                    _isCurYear = filPeriodDrop == currentYear ? true : false;
                    setFillAreaDrop(text.text as string);
                    handleFilter(
                      filTypeDrop,
                      filCountryDrop,
                      filCtgryDrop,
                      text.text
                    );
                  }}
                />
              </div>

              <div className={styles.dropdowns}>
                <Dropdown
                  styles={DropdownStyle}
                  label="Category"
                  options={ctgryDropOptions.ctgryDropOptions}
                  selectedKey={_getFilterDropValues(
                    "Category",
                    { ...ctgryDropOptions },
                    filCtgryDrop
                  )}
                  onChange={(e: any, text: IDrop) => {
                    _isCurYear = filPeriodDrop == currentYear ? true : false;
                    setFilCtgryDrop(text.text as string);
                    handleFilter(
                      filTypeDrop,
                      filCountryDrop,
                      text.text,
                      fillAreaDrop
                    );
                  }}
                />
              </div>
              <div className={styles.smallDrpdowns}>
                <Dropdown
                  styles={DropdownStyle}
                  label="Period"
                  options={[...propDropValue.Period]}
                  selectedKey={_getFilterDropValues(
                    "Period",
                    { ...propDropValue },
                    filPeriodDrop
                  )}
                  onChange={(e: any, text: IDrop) => {
                    _isCurYear = text.text == currentYear ? true : false;
                    reset(text.text);
                  }}
                />
              </div>
              <div className={styles.smallDrpdowns}>
                <Dropdown
                  styles={DropdownStyle}
                  label="Type"
                  options={[...propDropValue.Type]}
                  selectedKey={_getFilterDropValues(
                    "Type",
                    { ...propDropValue },
                    filTypeDrop
                  )}
                  onChange={(e: any, text: IDrop) => {
                    _isCurYear = filPeriodDrop == currentYear ? true : false;
                    setFilTypeDrop(text.text as string);
                    handleFilter(
                      text.text,
                      filCountryDrop,
                      filCtgryDrop,
                      fillAreaDrop
                    );
                  }}
                />
              </div>

              <div className={styles.icon}>
                <Icon
                  iconName="Refresh"
                  className={styles.refresh}
                  onClick={() => {
                    _isCurYear = true;
                    reset(currentYear);
                  }}
                />
              </div>
            </div>

            {/* import btn section */}
            <div className={styles.importExport} style={{ display: "none" }}>
              {_isCurYear && (
                <div className={styles.import}>
                  <input
                    id="fileUpload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      getFileImport(e.target.files[0]);
                    }}
                  />
                  <label htmlFor="fileUpload" className={styles.uploadBtn}>
                    Import
                  </label>
                </div>
              )}

              <DefaultButton
                styles={buttonStyles}
                className={styles.export}
                text="Export"
                onClick={() => generateExcel(budgetItems)}
              />
            </div>
          </div>

          {/* modal section*/}
          <Modal isOpen={isModal} isBlocking={false} styles={modalStyles}>
            <div>
              {/* Content section */}
              <img src={`${importGif}`} />
              {/* <IconButton
            className={styles.importImg}
            iconProps={{ iconName: "Delete" }}
          /> */}
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
                  style={{
                    width: "26%",
                    height: 32,
                    background: "#dc3120",
                    border: "none",
                    color: "#FFF",
                    borderRadius: "3px",
                    cursor: "pointer",
                    padding: "4px 0px",
                  }}
                  onClick={() => {
                    // _curItem = undefined;
                    // setIsModal(false);
                    setIsmodal(false);
                  }}
                >
                  No
                </button>
                <button
                  style={{
                    width: "26%",
                    height: 32,
                    color: "#FFF",
                    background: "#2580e0",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    padding: "4px 0px",
                  }}
                  onClick={() => {
                    // setIsLoader(true);
                    // _getUnlink();
                    getUpdateImportDatas(listItems);
                    setIsmodal(false);
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </Modal>

          {/* Details List section */}
          <DetailsList
            columns={budjetColums}
            items={viewBudgetItems}
            styles={_DetailsListStyle}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />

          {/* Pagination */}
          {viewBudgetItems.length ? (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={Math.ceil(budgetItems.length / pagination.perPage)}
              onChange={(page: number) => {
                isCheck = true;
                _previousPage = pagination.currentPage;
                _currentPage = page;

                setPagination({ ...pagination, currentPage: page });
              }}
            />
          ) : (
            <div className={styles.noRecords}>No data found !!!</div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default BudgetAnalysis;
