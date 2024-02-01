import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./BudgetCategory.module.scss";
import {
  Label,
  DetailsList,
  SelectionMode,
  IColumn,
  DetailsListLayoutMode,
  Modal,
  TextField,
  IDetailsListStyles,
  ITextFieldStyles,
  SearchBox,
  DefaultButton,
  IIconProps,
  IconButton,
  ISearchBoxStyles,
  IButtonStyles,
  IModalStyles,
  Dropdown,
  IDropdownStyles,
  Icon,
} from "@fluentui/react";
import { Config } from "../../../globals/Config";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import SPServices from "../../../CommonServices/SPServices";
import {
  IDrop,
  IDropdowns,
  IGroupUsers,
  IMasCategoryItems,
} from "../../../globalInterFace/BudgetInterFaces";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import commonServices from "../../../CommonServices/CommonServices";
import Pagination from "office-ui-fabric-react-pagination";
import { _filterArray } from "../../../CommonServices/filterCommonArray";

interface IimportExcelDataView {
  removeExcelData: IMasCategoryItems[];
  addExcelData: any[];
}

interface IPagination {
  totalPageItems: number;
  pagenumber: number;
}

let propDropValue: IDropdowns;
let _isBack: boolean = false;
let listItems: IMasCategoryItems[] = [];
const addIcon: IIconProps = { iconName: "Add" };
let areaExport = [];
let _areasDrop: IDrop[] = [];
let isUserPermissions: IGroupUsers;
let _strSearch: string = "";
let _strArea: string = "All";
let categoryName: string = "";
let _arrOfMaster: IMasCategoryItems[] = [];
let _isAdminView: boolean = false;

const BudgetCategory = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;
  propDropValue = { ...props.dropValue };
  _areasDrop = [...props.dropValue.Area];
  _areasDrop.shift();
  let allArea = [..._areasDrop].map((value) => value.text);

  isUserPermissions = { ...props.groupUsers };

  const _budgetPlanColumns: IColumn[] = [
    {
      key: "column1",
      name: "Category",
      fieldName: Config.masCategoryListColumns.Title,
      minWidth: 200,
      maxWidth: 500,
    },
    {
      key: "column2",
      name: "Area",
      fieldName: Config.masCategoryListColumns.Area,
      minWidth: 200,
      maxWidth: 500,
    },
  ];

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [MData, setMData] = useState<IMasCategoryItems[]>([]);
  const [master, setMaster] = useState<IMasCategoryItems[]>([]);
  const [items, setItems] = useState<IMasCategoryItems[]>([]);
  const [area, setArea] = useState([]);
  const [categoryPopup, setcategoryPopup] = useState<boolean>(false);
  const [importFilePopup, setImportFilePopup] = useState<boolean>(false);
  const [istrigger, setIstrigger] = useState<boolean>(false);
  const [backupData, setBackupData] = useState<IMasCategoryItems[]>([]);
  const [importExcelDataView, setImportExcelDataView] =
    useState<IimportExcelDataView>({
      removeExcelData: [],
      addExcelData: [
        {
          Title: "",
          Area: _areasDrop[0].text,
          CatgryValidate: false,
          AreaValidate: false,
        },
      ],
    });
  const [pagination, setPagination] = useState<IPagination>({
    totalPageItems: 10,
    pagenumber: 1,
  });
  const [filArea, setFilArea] = useState<string>("All");
  const [searchText, setSearchText] = useState<string>("");

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
      // ".ms-DetailsHeader-cellTitle": {
      //   display: "flex",
      //   justifyContent: "center",
      // },
    },
  };

  const searchStyle: Partial<ISearchBoxStyles> = {
    root: {
      width: 240,
      height: 33,
      "::after": {
        border: "1px solid rgb(96, 94, 92) !important",
      },
    },
  };

  const btnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      // background: "#f6db55 !important",
      background: "#2580e0 !important",
      height: 33,
      borderRadius: 5,
    },
    label: {
      fontWeight: 500,
      color: "#fff",
      cursor: "pointer",
      fontSize: 16,
    },
    icon: {
      fontSize: 16,
      color: "#fff",
    },
  };

  const NewmodalStyle: Partial<IModalStyles> = {
    main: {
      // padding: "10px 20px",
      padding: " 10px 0px 10px 18px",
      borderRadius: 4,
      width: "30%",
      height: "auto !important",
      minHeight: "none",
    },
  };

  const inputStyle: Partial<ITextFieldStyles> = {
    root: {
      width: "48%",
      marginRight: 6,
      // ".ms-TextField-fieldGroup": {
      //   ":focus-visible": {
      //     border: "none",
      //   },
      // },
    },
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const dropDownStyle: Partial<IDropdownStyles> = {
    root: {
      width: "48%",
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const filterdropDownStyle: Partial<IDropdownStyles> = {
    root: {
      // width: "100%",
      width: 240,
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const dropErrorStyle = {
    root: {
      width: "48%",
      ".ms-Dropdown-title": {
        borderColor: "red !important",
      },
    },
  };

  const errorStyle = {
    root: {
      width: "48%",
      marginRight: 6,
    },
    fieldGroup: {
      border: "1px solid red !important",
      "::after": {
        border: "1px solid red !important",
      },
    },
  };

  const iconStyle: Partial<IButtonStyles> = {
    rootHovered: {
      background: "transparent !important",
    },
  };

  const saveBtnStyle = {
    root: {
      border: "none",
      height: 32,
      color: "#fff",
      background: "#2580e0 !important",
      borderRadius: 3,
      // marginRight: 10,
      width: "26%",
    },
    rootHovered: {
      background: "#2580e0",
      color: "#fff",
    },
  };

  const cancelBtnStyle = {
    root: {
      backgroundColor: "#dc3120",
      color: "#FFF",
      height: 32,
      borderRadius: 3,
      border: "none",
      marginRight: 20,
      width: "26%",
    },
    rootHovered: {
      background: "#dc3120",
      color: "#fff",
    },
  };

  const importModalStyle: Partial<IModalStyles> = {
    main: {
      padding: "15px 25px",
      borderRadius: 4,
      width: "25%",
      height: "auto !important",
      minHeight: "none",
    },
  };

  /* function creation */
  const _getErrorFunction = (errMsg: any): void => {
    alertify.error(errMsg);
    setIsLoader(false);
  };

  window.onbeforeunload = (e: any): string => {
    if (_isBack) {
      let dialogText =
        "You have unsaved changes, are you sure you want to leave?";
      e.returnValue = dialogText;
      return dialogText;
    }
  };

  const _getGenerateExcel = (): void => {
    let _arrExport: IMasCategoryItems[] = [...master];
    const workbook: any = new Excel.Workbook();
    const worksheet: any = workbook.addWorksheet("My Sheet");
    let headerRows: string[] = [];
    let _isAdmin: boolean = true;

    worksheet.columns = [
      { header: "Category", key: "Category", width: 100 },
      { header: "Area", key: "Area", width: 50 },
    ];
    for (let i: number = 0; 1000 > i; i++) {
      if (_arrExport.length > i) {
        worksheet.addRow({
          Category: _arrExport[i].Title,
          Area: _arrExport[i].Area,
        });
      }

      worksheet.getCell(`B${i + 2}`).dataValidation = {
        type: "list",
        // formulae: ['"One,Two,Three Three,Four"'],
        formulae: [`"${areaExport.join(",")}"`],
      };
    }
    worksheet.autoFilter = {
      from: "A1",
      to: "B1",
    };
    headerRows = ["A1", "B1"];

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
          `Category-${moment().format("MM_DD_YYYY")}.xlsx`
        )
      )
      .catch((err: any) => {
        _getErrorFunction("Error writing excel export");
      });
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
      const filteredData = _removeEmptyDatas.filter((row) =>
        row.some((cell) => cell.trim() !== null && cell.trim() !== "")
      );
      listItems = [];
      listItems = filteredData.map((row: any) => ({
        Title: row[1] ? row[1] : "",
        Area: row[2] ? row[2] : "",
      }));
      //Reset the file
      document.getElementById("fileUpload")["value"] = "";
      if (
        worksheet.name.toLowerCase() == "my sheet" &&
        listItems[0].Title.toLowerCase() == "category" &&
        listItems[0].Area.toLowerCase() == "area"
      ) {
        listItems.shift();
        listItems = listItems.filter(
          (e: any) => e.Title.trim() !== "" && e.Area.trim() !== ""
        );
        setImportFilePopup(true);
        importFileValidation([...listItems]);
      } else {
        alertify.error("Please import correct excel format");
      }
    } else {
      alertify.error("Please import only xlsx file");
    }
  };

  const importFileValidation = (items: IMasCategoryItems[]) => {
    let newItems = [];
    let notMatchItems = [];

    items.forEach((value: IMasCategoryItems) => {
      let authendication = [...allArea].some(
        (Area: string) => Area === value.Area
      );
      if (authendication) {
        newItems.push(value);
      } else {
        notMatchItems.push(value);
      }
    });

    splitCategoryData([...newItems]);
    setBackupData([...notMatchItems]);
  };

  const _getDefaultFunction = (): void => {
    _isBack = false;
    setIsLoader(true);
    manipulation();
  };

  const manipulation = (): void => {
    if (isUserPermissions.isSuperAdmin) {
      areaExport.push(
        Config.AreaName.InfraStructure,
        Config.AreaName.EnterpriseApplication,
        Config.AreaName.SpecialProject
      );
    } else {
      if (isUserPermissions.isInfraManager) {
        areaExport.push(Config.AreaName.InfraStructure);
      }
      if (isUserPermissions.isEnterpricesManager) {
        areaExport.push(Config.AreaName.EnterpriseApplication);
      }
      if (isUserPermissions.isSpecialManager) {
        areaExport.push(Config.AreaName.SpecialProject);
      }
    }

    setArea([..._areasDrop]);
    setImportExcelDataView({
      removeExcelData: [],
      addExcelData: [
        {
          Title: "",
          Area: _areasDrop[0].text,
          CatgryValidate: false,
          AreaValidate: false,
        },
      ],
    });
    _getMasterCategoryData();
  };

  const _getMasterCategoryData = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.MasterCategoryList,
      Topcount: 5000,
      Orderbydecorasc: false,
    })
      .then((_resMasCate: any) => {
        let _masCategory: IMasCategoryItems[] = [];
        _arrOfMaster = [];
        if (_resMasCate.length) {
          _resMasCate.forEach((data: any, i: number) => {
            _masCategory.push({
              Title: data.Title ? data.Title : "",
              Area: data.Area ? data.Area : "",
            });
            _masCategory.length == _resMasCate.length &&
              _getFilteredMas([..._masCategory]);
          });
        } else {
          _arrOfMaster = [..._masCategory];
          searchData();
        }
      })
      .catch((err: any) => {
        _getErrorFunction("Get category data");
      });
  };

  const _getFilteredMas = (arr: IMasCategoryItems[]): void => {
    let _filArray: IMasCategoryItems[] = [];
    _arrOfMaster = [];

    _filArray = _filterArray(
      isUserPermissions,
      [...arr],
      Config.Navigation.BudgetCategory
    );

    if (_filArray.length) {
      _arrOfMaster = [..._filArray];
      searchData();
      // setMData([..._filArray]);
      // setMaster([..._filArray]);
      // setIsLoader(false);
    } else {
      _arrOfMaster = [..._filArray];
      searchData();
      // setMData([..._filArray]);
      // setMaster([..._filArray]);
      // setIsLoader(false);
    }
  };

  const splitCategoryData = (listItems: IMasCategoryItems[]): void => {
    let newaddData = [];
    let DuplicateData = [];
    let dummyData = [];

    listItems.forEach((item) => {
      if (
        dummyData.findIndex((arr) => {
          return (
            arr.Title.trim().toLowerCase() == item.Title.trim().toLowerCase() &&
            arr.Area.trim().toLowerCase() == item.Area.trim().toLowerCase()
          );
        }) == -1
      ) {
        dummyData.push(item);
      }
    });

    dummyData.forEach((dData) => {
      if (
        MData.filter((mdata) => {
          return (
            mdata.Title.trim().toLowerCase() ==
              dData.Title.trim().toLowerCase() &&
            mdata.Area.trim().toLowerCase() == dData.Area.trim().toLowerCase()
          );
        }).length == 0
      ) {
        newaddData.push(dData);
      } else {
        DuplicateData.push(dData);
      }
    });
    setImportExcelDataView({
      removeExcelData: [...DuplicateData],
      addExcelData: [...newaddData],
    });
  };

  const addMasterCategoryData = (listItems: any[], type: string): void => {
    let mascatgryData = [];
    let authentication = false;
    if (type == "ImportFiles") {
      mascatgryData = [...listItems];
      authentication = true;
    } else {
      let validationData = catgryValidation([...listItems]);
      authentication = validationData.every((val) => {
        return val.CatgryValidate == false && val.AreaValidate == false;
      });

      authentication &&
        [...validationData].forEach((e: any) => {
          mascatgryData.push({
            Title: e.Title,
            Area: e.Area,
          });
        });
    }

    if (authentication) {
      if (mascatgryData.length > 0) {
        SPServices.batchInsert({
          ListName: Config.ListNames.MasterCategoryList,
          responseData: mascatgryData,
        })
          .then((result) => {
            setImportExcelDataView({
              addExcelData: [
                {
                  Title: "",
                  Area: area[0].text,
                  CatgryValidate: false,
                  AreaValidate: false,
                },
              ],
              removeExcelData: [],
            });
            setIstrigger(!istrigger);
            setcategoryPopup(false);
            setImportFilePopup(false);
            setIsLoader(false);
            addBackupData();
          })
          .catch((err) => _getErrorFunction("Add category data"));
      } else {
        setImportExcelDataView({
          addExcelData: [
            {
              Title: "",
              Area: area[0].text,
              CatgryValidate: false,
              AreaValidate: false,
            },
          ],
          removeExcelData: [],
        });
        setIsLoader(false);
      }
    } else {
      setIsLoader(false);
    }
  };

  const deleteCategory = (index: number): void => {
    let delcatgry = [...importExcelDataView.addExcelData];
    delcatgry.splice(index, 1);
    setImportExcelDataView({
      ...importExcelDataView,
      addExcelData: [...delcatgry],
    });
  };

  const addCategory = (index: number): void => {
    let validData = catgryValidation([...importExcelDataView.addExcelData]);
    if (
      [...validData].every((val) => {
        return val.CatgryValidate == false && val.AreaValidate == false;
      })
    ) {
      let addcatcrydata = [...validData];
      addcatcrydata.push({
        Title: "",
        Area: area[0].text,
        CatgryValidate: false,
      });
      setImportExcelDataView({
        ...importExcelDataView,
        addExcelData: [...addcatcrydata],
      });
    }
  };

  const addCategoryData = (index: number, data: string, type: string): void => {
    let addData = [...importExcelDataView.addExcelData];
    if (type == "Category") {
      addData[index].Title = data;
    } else {
      addData[index].Area = data;
    }
    setImportExcelDataView({ ...importExcelDataView, addExcelData: addData });
  };

  const catgryValidation = (arr: any[]): any[] => {
    let newAddData = [];
    let DuplicateData = [];

    arr.forEach((dData) => {
      if (
        dData.Title.trim() != "" &&
        dData.Area.trim() != "" &&
        MData.filter((mdata) => {
          return (
            mdata.Title.trim().toLowerCase() ==
              dData.Title.trim().toLowerCase() &&
            mdata.Area.trim() == dData.Area.trim()
          );
        }).length == 0
      ) {
        let OriginalFlagChange = {
          ...dData,
          CatgryValidate: false,
          AreaValidate: false,
        };
        DuplicateData.push(OriginalFlagChange);
      } else {
        if (dData.Title.trim() != "" && dData.Area.trim() != "") {
          let DuplicateFlagChange = {
            ...dData,
            CatgryValidate: true,
            AreaValidate: true,
          };
          DuplicateData.push(DuplicateFlagChange);
          categoryName = dData.Title.trim();
          alertify.error(`The category "${categoryName}" already exists`);
        } else {
          let EmptyData = {
            ...dData,
            CatgryValidate: true,
            AreaValidate: false,
          };
          DuplicateData.push(EmptyData);
          alertify.error("Please Enter The Category");
        }
      }
    });

    DuplicateData.forEach((item) => {
      if (
        newAddData.findIndex((items) => {
          return (
            items.Title.trim().toLowerCase() ==
              item.Title.trim().toLowerCase() &&
            items.Area.trim().toLowerCase() == item.Area.trim().toLowerCase()
          );
        }) == -1
      ) {
        newAddData.push(item);
      } else {
        let DuplicateDataFlagChange = {
          ...item,
          CatgryValidate: true,
          AreaValidate: true,
        };
        categoryName = item.Title.trim();
        newAddData.push(DuplicateDataFlagChange);
        alertify.error(`The category "${categoryName}" already exists`);
      }
    });

    setImportExcelDataView({
      removeExcelData: [],
      addExcelData: [...newAddData],
    });

    return newAddData;
  };

  const searchData = (): void => {
    setPagination({ ...pagination, pagenumber: 1 });
    let searchdata: any[] = [..._arrOfMaster];

    searchdata = searchdata.filter((value) => {
      return value.Title.toLowerCase().includes(
        _strSearch.trim().toLowerCase()
      );
    });
    if (_strArea !== "All" && _strArea !== "") {
      searchdata = searchdata.filter((e: any) => {
        return e.Area === _strArea;
      });
    }

    setMaster([...searchdata]);
    setMData([..._arrOfMaster]);
    // setMaster([..._masCategory]);
    setIsLoader(false);
  };

  const dropKeyFilter = (textVal: string): number => {
    let filterkey: number = _areasDrop.filter((keyval: IDrop) => {
      return keyval.text == textVal;
    })[0].key;

    return filterkey;
  };

  const addBackupData = (): void => {
    SPServices.batchInsert({
      ListName: Config.ListNames.MasterCategoryBackupList,
      responseData: backupData,
    })
      .then((data) => console.log("Backup data added succefully"))
      .catch((error) => _getErrorFunction("Backup data set"));
  };

  /* Life cycle of onload */
  useEffect(() => {
    let masterData = commonServices.paginateFunction(
      pagination.totalPageItems,
      pagination.pagenumber,
      master
    );
    setItems(masterData.displayitems);
  }, [pagination, master]);

  useEffect(() => {
    _getDefaultFunction();
  }, [istrigger]);

  return isLoader ? (
    <Loader />
  ) : (
    <div style={{ width: "100%" }}>
      {/* Heading section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Icon
          iconName="ChromeBack"
          style={{
            marginRight: 20,
            fontSize: 20,
            fontWeight: 600,
            color: "#202945",
            cursor: "pointer",
          }}
          onClick={() => {
            props._getDropDownValues();
          }}
        />
        <Label className={styles.HeaderLable}>Budget Category</Label>
      </div>

      {/* filter and btn section */}
      <div className={styles.btnContainer}>
        <div className={styles.leftSection}>
          {/* search section */}
          <div>
            <Label>Category</Label>
            <SearchBox
              styles={searchStyle}
              value={searchText}
              placeholder="Search"
              onChange={(val, text) => {
                _strSearch = text;
                setSearchText(text);
                searchData();
              }}
            />
          </div>

          {/* Area dropdown section */}
          <div>
            <Label>Type</Label>
            <Dropdown
              options={[...propDropValue.Area]}
              styles={filterdropDownStyle}
              placeholder="Select The Area"
              selectedKey={
                filArea
                  ? [...propDropValue.Area].filter((e: IDrop) => {
                      return e.text === filArea;
                    })[0].key
                  : 0
              }
              onChange={(e: any, item: IDrop) => {
                _strArea = item.text as string;
                setFilArea(item.text as string);
                searchData();
              }}
            />
          </div>

          <Icon
            iconName="Refresh"
            className={styles.refresh}
            onClick={() => {
              _strSearch = "";
              _strArea = "All";
              setSearchText("");
              setFilArea("All");
              searchData();
            }}
          />
        </div>

        {/* btn sections */}
        <div className={styles.rightBtns}>
          {/* New btn section */}
          {!_isAdminView && (
            <DefaultButton
              text="New item"
              styles={btnStyle}
              iconProps={addIcon}
              onClick={() => {
                setcategoryPopup(true);
                setImportExcelDataView({
                  ...importExcelDataView,
                  addExcelData: [
                    {
                      Title: "",
                      Area: _areasDrop[0].text,
                      CatgryValidate: false,
                      AreaValidate: false,
                    },
                  ],
                });
              }}
            />
          )}

          {/* import btn section */}
          {!_isAdminView && (
            <input
              id="fileUpload"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => {
                _getFileImport(e.target.files[0]);
              }}
            />
          )}
          {!_isAdminView && (
            <label htmlFor="fileUpload" className={styles.uploadBtn}>
              Import
            </label>
          )}

          {/* export btn section */}
          <button className={styles.btns} onClick={() => _getGenerateExcel()}>
            Export
          </button>
        </div>
      </div>

      {/* Details list section */}
      <DetailsList
        items={[...items]}
        columns={[..._budgetPlanColumns]}
        styles={_DetailsListStyle}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
      {items.length == 0 && (
        <div className={styles.noRecords}>No data found !!!</div>
      )}
      {master.length > 0 && (
        <Pagination
          currentPage={pagination.pagenumber}
          totalPages={Math.ceil(master.length / pagination.totalPageItems)}
          onChange={(page) =>
            setPagination({ ...pagination, pagenumber: page })
          }
        />
      )}

      {/* new modal */}
      <Modal isOpen={categoryPopup} styles={NewmodalStyle}>
        <div className={styles.modalHeader}>
          <h3>Add New Category</h3>
        </div>

        <div>
          {importExcelDataView.addExcelData.map((val, index) => {
            return (
              <>
                <div key={index} className={styles.modalTextAndIconFlex}>
                  <div className={styles.modalTextAndDropFlex}>
                    <TextField
                      styles={val.CatgryValidate ? errorStyle : inputStyle}
                      type="text"
                      value={val.Title}
                      placeholder="Enter The Category"
                      onChange={(e, text) =>
                        addCategoryData(index, text, "Category")
                      }
                    />
                    <Dropdown
                      options={area}
                      styles={val.AreaValidate ? dropErrorStyle : dropDownStyle}
                      placeholder="Select The Area"
                      selectedKey={dropKeyFilter(
                        importExcelDataView.addExcelData[index].Area
                      )}
                      onChange={(e, item) =>
                        addCategoryData(index, item.text, "Area")
                      }
                    />
                  </div>
                  <div>
                    {importExcelDataView.addExcelData.length > 1 &&
                    importExcelDataView.addExcelData.length != index + 1 ? (
                      <IconButton
                        styles={iconStyle}
                        iconProps={{
                          iconName: "Delete",
                        }}
                        style={{ color: "red" }}
                        title="Delete"
                        ariaLabel="Delete"
                        onClick={() => deleteCategory(index)}
                      />
                    ) : (
                      <div>
                        {importExcelDataView.addExcelData.length > 1 && (
                          <IconButton
                            styles={iconStyle}
                            iconProps={{
                              iconName: "Delete",
                            }}
                            style={{ color: "red" }}
                            title="Delete"
                            ariaLabel="Delete"
                            onClick={() => deleteCategory(index)}
                          />
                        )}
                        <IconButton
                          styles={iconStyle}
                          iconProps={{
                            iconName: "Add",
                          }}
                          style={{ color: "#000" }}
                          title="Add"
                          ariaLabel="Add"
                          onClick={() => addCategory(index)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <DefaultButton
            styles={cancelBtnStyle}
            text={"Cancel"}
            onClick={() => {
              setcategoryPopup(false);
            }}
          />
          <DefaultButton
            styles={saveBtnStyle}
            text={"Save"}
            onClick={() => {
              setIsLoader(true);
              addMasterCategoryData([...importExcelDataView.addExcelData], "");
            }}
          />
        </div>
      </Modal>

      {/* import modal */}
      <Modal isOpen={importFilePopup} styles={importModalStyle}>
        <div className={styles.importBoxView}>
          <div>
            <h3 className={styles.importBoxHeader}>New Category</h3>
            <div style={{ width: "100%", display: "flex" }}>
              <h4 className={styles.importHeader}>Category</h4>
              <h4 className={styles.importHeader}>Area</h4>
            </div>
            {importExcelDataView.addExcelData.map((value, index) => {
              return (
                <div>
                  <div key={index} style={{ width: "100%", display: "flex" }}>
                    <label className={styles.boxViewLabel}>{value.Title}</label>
                    <label className={styles.boxViewLabel}>{value.Area}</label>
                  </div>
                </div>
              );
            })}
            {importExcelDataView.addExcelData.length == 0 && (
              <div className={styles.nodatas}>
                <label>No Records</label>
              </div>
            )}
          </div>
          <div>
            <h3 className={styles.importBoxHeader}>Duplicate Category</h3>
            <div style={{ width: "100%", display: "flex" }}>
              <h4 className={styles.importHeader}>Category</h4>
              <h4 className={styles.importHeader}>Area</h4>
            </div>
            <div className={styles.importDataView}>
              {importExcelDataView.removeExcelData.map((value, index) => {
                return (
                  <div>
                    <div key={index} style={{ width: "100%", display: "flex" }}>
                      <label className={styles.boxViewLabel}>
                        {value.Title}
                      </label>
                      <label className={styles.boxViewLabel}>
                        {value.Area}
                      </label>
                    </div>
                  </div>
                );
              })}
              {importExcelDataView.removeExcelData.length === 0 && (
                <div className={styles.nodatas}>
                  <label>No Records</label>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <DefaultButton
            styles={cancelBtnStyle}
            text="Cancel"
            onClick={() => {
              setImportExcelDataView({
                removeExcelData: [],
                addExcelData: [
                  {
                    Title: "",
                    Area: _areasDrop[0].text,
                    CatgryValidate: false,
                    AreaValidate: false,
                  },
                ],
              });
              setImportFilePopup(false);
            }}
          />
          <DefaultButton
            styles={saveBtnStyle}
            text="Save"
            style={{
              cursor: importExcelDataView.addExcelData.length
                ? "pointer"
                : "not-allowed",
            }}
            onClick={() => {
              if (importExcelDataView.addExcelData.length) {
                setIsLoader(true);
                addMasterCategoryData(
                  importExcelDataView.addExcelData,
                  "ImportFiles"
                );
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BudgetCategory;
