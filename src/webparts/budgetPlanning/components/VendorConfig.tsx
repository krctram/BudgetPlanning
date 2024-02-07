import * as React from "react";
import styles from "./VendorConfig.module.scss";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import * as moment from "moment";
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  IButtonStyles,
  IColumn,
  IDetailsListStyles,
  IDropdownStyles,
  IModalStyles,
  Icon,
  IconButton,
  Label,
  Modal,
  SelectionMode,
  SearchBox,
  TextField,
} from "@fluentui/react";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import {
  IAttach,
  IBudList,
  ICateList,
  IDrop,
  IDropdowns,
  IUpdateJSON,
  IVenDrop,
  IVenList,
  IVenMasCategory,
  IVenSubCategory,
  IVendorData,
} from "../../../globalInterFace/BudgetInterFaces";
import SPServices from "../../../CommonServices/SPServices";
import { Config } from "../../../globals/Config";
import { _areaVoiceFilter } from "../../../CommonServices/filterCommonArray";

interface IVendorBudget {
  ID: number;
  BudgetId: number[];
}

let propDropValue: IDropdowns;
let _isAdminView: boolean = false;
let _categoryList: IVenMasCategory[] = [];
let _budgetList: IVenSubCategory[] = [];
let _masCategory: IVenMasCategory[] = [];
let _subCategory: IVenSubCategory[] = [];
let _vendDatas: IVendorData[] = [];
let _areaDrop: IDrop[] = [];
let _masIteams: IVendorData[] = [];
let _Area: string = "";
let _Country: string = "";
let _Type: string = "";
let _calArray: IVendorData[] = [];

const VendorConfig = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;
  propDropValue = { ...props.dropValue };
  _areaDrop = [...props.dropValue.Area];

  const _VendorColumn: IColumn[] = [
    {
      key: "column1",
      name: "Sub Category",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData, i: number): any => {
        return (
          <Dropdown
            placeholder="Please select"
            styles={DropdownStyle}
            multiSelect
            options={[...item.Budget]}
            selectedKeys={[...item.arrKeys]}
            onChange={(e: any, text: IVenDrop, j: number) => {
              _handleOnChange(i, text, j);
            }}
          />
        );
      },
    },
    {
      key: "column2",
      name: "Master Category",
      fieldName: "Category",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column3",
      name: "Area",
      fieldName: "Area",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column4",
      name: "Country",
      fieldName: "Country",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column5",
      name: "Type",
      fieldName: "Type",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column6",
      name: "Description",
      fieldName: "Description",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column7",
      name: "Vendor Name",
      fieldName: "VendorName",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column8",
      name: "Pricing - Excluding VAT in AED",
      fieldName: "Price",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: any, i: number): any => {
        // return SPServices.format(item.Price);
        return (
          <TextField
            value={item.Price ? item.Price.toString() : "0"}
            onChange={(e: any, value: any) => {
              if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                let tempData = MData.filter(
                  (value: IVendorData) => value.ID === item.ID
                );
                tempData[0].Price = value;

                SPServices.numberFormat(value);
                setMData([...tempData]);
              }
            }}
          />
        );
      },
    },
    {
      key: "column9",
      name: "Payment Terms",
      fieldName: "Payment",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column10",
      name: "Delivery",
      fieldName: "Delivery",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column11",
      name: "Last Year Cost in AED",
      fieldName: "LastYearCost",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData): string => {
        return SPServices.format(item.LastYearCost);
      },
    },
    {
      key: "column12",
      name: "Last year PO#",
      fieldName: "LastYearPO",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column13",
      name: "Recommended Supplier",
      fieldName: "Recommended",
      minWidth: 130,
      maxWidth: 130,
    },
    {
      key: "column14",
      name: "Requested amount in AED",
      fieldName: "RequestedAmount",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData): string => {
        return SPServices.format(item.RequestedAmount);
      },
    },
    {
      key: "column15",
      name: "Procurement confirmation email/approved iMemo",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData): any => {
        return item.Attachments.length ? (
          <a href={item.Attachments[0].Path} title={item.Attachments[0].Name}>
            <Icon
              iconName="OpenFile"
              style={{
                color: "green",
                fontSize: "20px",
                cursor: "pointer",
              }}
            />
          </a>
        ) : null;
      },
    },
  ];

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [filCountryDrop, setFilCountryDrop] = useState<string>("All");
  const [filTypeDrop, setFilTypeDrop] = useState<string>("All");
  const [filAreaDrop, setFilAreaDrop] = useState<string>("All");
  const [filVendorDrop, setFilVendorDrop] = useState<string>("");
  const [MData, setMData] = useState<IVendorData[]>([]);
  const [fData, setFData] = useState<IVendorData[]>([]);
  const [isModal, setIsModal] = useState<boolean>(false);
  const [FilterValue, setFilterValue] = useState({
    SearchFilter: "",
  });
  const [arrId, setArrId] = useState<IVendorBudget[]>([]);
  console.log("arrId > ", arrId);

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
        height: MData.length ? "58vh" : 20,
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

  const btnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      background: "#2580e0 !important",
      height: 33,
      borderRadius: 5,
      cursor: _calArray.length ? "pointer" : "not-allowed",
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

  const searchBoxStyle = {
    root: {
      padding: "0 10px",
      fontSize: 16,
      border: "0.5px solid #605e5c !important",
      ".ms-SearchBox": {
        border: "none !important",
      },
      ":hover": {
        borderColor: "none",
      },
      ".ms-SearchBox-icon": {
        fontWeight: 900,
        color: "#4f0974",
      },
      "::after": {
        border: "none !important",
        backgrounColor: "white",
      },
      ".ms-Button-flexContainer": {
        background: "transparent",
      },
      ".ms-Button": {
        ":hover": {
          background: "transparent",
        },
      },
    },
  };

  /* function creation */
  const _getErrorFunction = (errMsg: any): void => {
    alertify.error("Error Message");
  };

  const _getDefaultFunction = (): void => {
    setIsLoader(true);
    setIsModal(false);
    _Area = "Please select";
    _Country = "Please select";
    _Type = "Please select";
    _getMasCategory();
  };

  const _getMasCategory = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryList,
      Select:
        "*, Year/ID, Year/Title, Country/ID, Country/Title, MasterCategory/ID",
      Expand: "Year, Country, MasterCategory",
      Filter: [
        {
          FilterKey: "isDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
        {
          FilterKey: "Year/Title",
          Operator: "eq",
          FilterValue: moment().format("YYYY"),
        },
        {
          FilterKey: "Status",
          Operator: "eq",
          FilterValue: "Approved",
        },
      ],
    })
      .then((res: any) => {
        _categoryList = [];
        if (res.length) {
          for (let i: number = 0; res.length > i; i++) {
            _categoryList.push({
              ID: res[i].ID,
              MasCategory: res[i].Title ? res[i].Title : "",
              Area: res[i].Area ? res[i].Area : "",
              Country: res[i].CountryId ? res[i].Country.Title : "",
              Type: res[i].CategoryType ? res[i].CategoryType : "",
              OverAllBudgetCost: res[i].OverAllBudgetCost
                ? res[i].OverAllBudgetCost
                : 0,
              OverAllUsedCost: res[i].OverAllPOIssuedCost
                ? res[i].OverAllPOIssuedCost
                : 0,
              OverAllRemainingCost: res[i].OverAllRemainingCost
                ? res[i].OverAllRemainingCost
                : 0,
            });

            if (res.length === _categoryList.length) {
              _getSubCategory();
            }
          }
        } else {
          setMData([]);
          setFData([]);
          setIsLoader(false);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err);
      });
  };

  const _getSubCategory = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.BudgetList,
      Select:
        "*, Category/ID, Category/Title, Year/ID, Year/Title, Country/ID, Country/Title, Vendors/ID, Vendors/VendorName",
      Expand: "Category, Year, Country, Vendors",
      Filter: [
        {
          FilterKey: "isDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
        {
          FilterKey: "Year/Title",
          Operator: "eq",
          FilterValue: moment().format("YYYY"),
        },
        {
          FilterKey: "ApproveStatus",
          Operator: "eq",
          FilterValue: "Approved",
        },
      ],
    })
      .then((res: any) => {
        _budgetList = [];
        if (res.length) {
          for (let i: number = 0; res.length > i; i++) {
            _budgetList.push({
              SubCategory: res[i].Description ? res[i].Description : "",
              MasCategory: res[i].CategoryId ? res[i].Category.Title : "",
              Area: res[i].Area ? res[i].Area : "",
              Country: res[i].CountryId ? res[i].Country.Title : "",
              Type: res[i].CategoryType ? res[i].CategoryType : "",
              ID: res[i].ID,
              MasCategoryID: res[i].CategoryId ? res[i].CategoryId : null,
              BudgetAllocated: res[i].BudgetAllocated
                ? res[i].BudgetAllocated
                : 0,
              BudgetUsed: res[i].Used ? res[i].Used : 0,
              BudgetRemaining: res[i].RemainingCost ? res[i].RemainingCost : 0,
              Vendors: [...res[i].VendorsId],
            });

            if (res.length === _budgetList.length) {
              _getVendorDetail([..._categoryList], [..._budgetList]);
            }
          }
        } else {
          setMData([]);
          setFData([]);
          setIsLoader(false);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err);
      });
  };

  const _getVendorDetail = (
    _categoryList: IVenMasCategory[],
    _budgetList: IVenSubCategory[]
  ): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.VendorConfig,
      Select:
        "*, Category/ID, Category/Title, Budget/ID, Budget/Description, Country/ID, Country/Title, AttachmentFiles",
      Expand: "Category, Budget, Country, AttachmentFiles",
      Filter: [
        {
          FilterKey: "Year",
          Operator: "eq",
          FilterValue: moment().format("YYYY"),
        },
        // {
        //   FilterKey: "Status",
        //   Operator: "ne",
        //   FilterValue: "Approved",
        // },
      ],
    })
      .then((res: any) => {
        let _vendorDetailsList: IVendorData[] = [];
        let _curBudgetId: IVendorBudget[] = [];
        _curBudgetId = [];

        if (res.length) {
          for (let i: number = 0; res.length > i; i++) {
            let _Attach: IAttach[] = [];

            res[i].AttachmentFiles.length &&
              res[i].AttachmentFiles.forEach((e: any) => {
                _Attach.push({
                  Name: e.FileName ? e.FileName : "",
                  Path: e.ServerRelativePath.DecodedUrl
                    ? e.ServerRelativePath.DecodedUrl
                    : "",
                });
              });

            _curBudgetId.push({
              ID: res[i].ID,
              BudgetId: res[i].BudgetId,
            });

            _vendorDetailsList.push({
              ID: res[i].ID,
              Description: res[i].Title ? res[i].Title : "-",
              Type: res[i].CategoryType ? res[i].CategoryType : "-",
              VendorName: res[i].VendorName ? res[i].VendorName : "-",
              Payment: res[i].Payment ? res[i].Payment : "-",
              Delivery: res[i].Delivery ? res[i].Delivery : "-",
              LastYearPO: res[i].LastYearPO ? res[i].LastYearPO : "-",
              Recommended: res[i].Recommended ? res[i].Recommended : "-",
              Year: res[i].Year ? res[i].Year : "-",
              Status: res[i].Status ? res[i].Status : "-",
              Comment: res[i].Comment ? res[i].Comment : "-",
              Area: res[i].Area ? res[i].Area : "",
              Country: res[i].CountryId ? res[i].Country.Title : "-",
              Category: "",
              CountryId: res[i].CountryId ? res[i].CountryId : 0,
              Price: res[i].Price ? res[i].Price : 0,
              LastYearCost: res[i].LastYearCost ? res[i].LastYearCost : 0,
              RequestedAmount: res[i].RequestedAmount
                ? res[i].RequestedAmount
                : 0,
              Attachments: [..._Attach],
              index: null,
              curDetailsArr: [],
              arrKeys: [],
              VendorConfig: res[i].VendorConfig ? res[i].VendorConfig : null,
            });

            if (res.length === _vendorDetailsList.length) {
              setArrId([..._curBudgetId]);
              _getAreaVoiceFilter(
                [..._categoryList],
                [..._budgetList],
                [..._vendorDetailsList]
              );
            }
          }
        } else {
          setMData([]);
          setFData([]);
          setIsLoader(false);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err);
      });
  };

  const _getAreaVoiceFilter = (
    _categoryList: IVenMasCategory[],
    _budgetList: IVenSubCategory[],
    _vendorDetailsList: IVendorData[]
  ): void => {
    _areaDrop.shift();

    if (_areaDrop.length !== 3) {
      _masCategory = _areaVoiceFilter([..._areaDrop], [..._categoryList]);
      _subCategory = _areaVoiceFilter([..._areaDrop], [..._budgetList]);
      _vendDatas = _areaVoiceFilter([..._areaDrop], [..._vendorDetailsList]);
    } else {
      _masCategory = [..._categoryList];
      _subCategory = [..._budgetList];
      _vendDatas = [..._vendorDetailsList];
    }

    if (_masCategory.length && _subCategory.length && _vendDatas.length) {
      _getPrepareDropdown();
    }
  };

  const _getPrepareDropdown = (): void => {
    let _drop: IVenDrop[] = [];

    for (let i: number = 0; _masCategory.length > i; i++) {
      for (let j: number = 0; _subCategory.length > j; j++) {
        if (
          _masCategory[i].Area === _subCategory[j].Area &&
          _masCategory[i].Type === _subCategory[j].Type &&
          _masCategory[i].Country === _subCategory[j].Country &&
          _masCategory[i].MasCategory === _subCategory[j].MasCategory
        ) {
          _drop.push({
            Area: _masCategory[i].Area,
            Type: _masCategory[i].Type,
            Country: _masCategory[i].Country,
            key: _subCategory[j].ID,
            text: _subCategory[j].SubCategory,
            BudgetAllocated: _subCategory[j].BudgetAllocated,
            BudgetUsed: _subCategory[j].BudgetUsed,
            BudgetRemaining: _subCategory[j].BudgetRemaining,
            CategoryID: _masCategory[i].ID,
            Category: _masCategory[i].MasCategory,
            CategoryAllocated: _masCategory[i].OverAllBudgetCost,
            CategoryUsed: _masCategory[i].OverAllUsedCost,
            CategoryRemaining: _masCategory[i].OverAllRemainingCost,
            Vendors: _subCategory[j].Vendors,
          });
        }

        if (_masCategory.length === i + 1 && _subCategory.length === j + 1) {
          _getPrepareMasterArr([..._drop]);
        }
      }
    }
  };

  const _getPrepareMasterArr = (_drop: IVenDrop[]): void => {
    _masIteams = [];

    for (let i: number = 0; _vendDatas.length > i; i++) {
      _vendDatas[i].Budget = [];

      for (let j: number = 0; _drop.length > j; j++) {
        // j === 0 && _vendDatas[i].Budget.push({ ...Config.VenDrop });

        if (
          _vendDatas[i].Area === _drop[j].Area &&
          _vendDatas[i].Country === _drop[j].Country &&
          _vendDatas[i].Type === _drop[j].Type &&
          !_drop[j].Vendors.includes(_vendDatas[i].ID)
        ) {
          _vendDatas[i].Budget.push({ ..._drop[j] });
        }

        if (_drop.length === j + 1) {
          _masIteams.push(_vendDatas[i]);
        }

        if (_vendDatas.length === i + 1 && _drop.length === j + 1) {
          _getFilterFunction();
        }
      }
    }
  };

  const _getFilterFunction = (): void => {
    let _temp: IVendorData[] = [..._masIteams];

    if (_Area !== "Please select") {
      _temp = _temp.filter((e: IVendorData) => e.Area === _Area);
    }

    if (_Country !== "Please select") {
      _temp = _temp.filter((e: IVendorData) => e.Country === _Country);
    }

    if (_Type !== "Please select") {
      _temp = _temp.filter((e: IVendorData) => e.Type === _Type);
    }

    if (_temp.length) {
      setMData([..._temp]);
      setFData([..._temp]);
      setIsLoader(false);
    } else {
      setMData([]);
      setFData([]);
      setIsLoader(false);
    }
  };

  const Filters = (
    datas: any[],
    Reset?: boolean,
    key?: string,
    option?: any
  ) => {
    let tempData: IVendorData[] = [...datas];
    let keyValues: any = { ...FilterValue };

    if (Reset) {
      keyValues = {
        SearchFilter: "",
      };
    }
    keyValues[`${key}`] = option;

    if (keyValues.SearchFilter != "") {
      tempData = tempData.filter((value) => {
        return (
          value.VendorName &&
          value.VendorName.toLowerCase().includes(
            keyValues.SearchFilter.toLowerCase()
          )
        );
      });
    }
    setFilterValue({ ...keyValues });
    setMData([...tempData]);
    setFData([...tempData]);
  };

  const _handleOnChange = (
    i: number,
    _curObj: IVenDrop,
    dropIndex: number
  ): void => {
    let _filArray: IVendorData[] = [...MData];
    let _isVal: boolean = false;
    _calArray = [];

    _isVal = !_filArray[i].arrKeys.includes(_curObj.key);

    if (_isVal) {
      _filArray[i].Category = _filArray[i].Budget[dropIndex].Category;
      _filArray[i].curDetailsArr.push(_filArray[i].Budget[dropIndex]);
      _filArray[i].arrKeys.push(_curObj.key);
      _filArray[i].index = dropIndex;
    } else {
      let _curIndex: number = null;

      if (_filArray[i].arrKeys.length === 1) {
        _filArray[i].Category = "";
        _filArray[i].curDetailsArr = [];
        _filArray[i].index = null;
        _filArray[i].arrKeys = [];
      } else {
        _filArray[i].Category = _filArray[i].Budget[dropIndex].Category;
        _filArray[i].index = dropIndex;
        _curIndex = _filArray[i].arrKeys.findIndex(
          (_num: number) => _num === _curObj.key
        );
        _filArray[i].curDetailsArr.splice(_curIndex, 1);
        _filArray[i].arrKeys.splice(_curIndex, 1);
      }
    }

    _calArray = _filArray.filter((e: IVendorData) => e.Category);

    setMData([..._filArray]);
    setFData([..._filArray]);
  };

  const _handleSubmit = (): void => {
    setIsLoader(true);
    setIsModal(false);

    let _masID: number[] = [];
    let _subID: number[] = [];
    let _uniqueMas: number[] = [];
    let _uniqueSub: number[] = [];

    _calArray.forEach((obj: IVendorData) => {
      _masID.push(obj.curDetailsArr[0].CategoryID);
    });

    _calArray.forEach((obj: IVendorData) => {
      _subID.push(...obj.arrKeys);
    });

    for (const id of _masID) {
      if (!_uniqueMas.includes(id)) {
        _uniqueMas.push(id);
      }
    }

    for (const id of _subID) {
      if (!_uniqueSub.includes(id)) {
        _uniqueSub.push(id);
      }
    }

    if (_uniqueMas.length && _uniqueSub.length) {
      _handleCalculate([..._uniqueMas], [..._uniqueSub]);
    }
  };

  const _handleCalculate = (
    _uniqueMas: number[],
    _uniqueSub: number[]
  ): void => {
    let _masUsed: number = 0;
    let _masRemaining: number = 0;
    let _subUsed: number = 0;
    let _subRemaining: number = 0;
    let _preCateList: ICateList[] = [];
    let _preBudList: IBudList[] = [];
    let _preVenList: IVenList[] = [];
    let _updateLists: IUpdateJSON[] = [];
    let _isCate: boolean = false;
    let _isBud: boolean = false;
    let _isVen: boolean = false;
    let _overAllAllocated: number = 0;
    let _overAllUsed: number = 0;
    let _budgetAllocated: number = 0;
    let _budgetUsed: number = 0;
    let _curVendorsId: number[] = [];

    for (let m: number = 0; _uniqueMas.length > m; m++) {
      _masUsed = 0;
      _overAllAllocated = 0;
      _overAllUsed = 0;

      for (let i: number = 0; _calArray.length > i; i++) {
        for (let j: number = 0; _calArray[i].curDetailsArr.length > j; j++) {
          if (_uniqueMas[m] === _calArray[i].curDetailsArr[j].CategoryID) {
            _overAllAllocated =
              _overAllAllocated +
              _calArray[i].curDetailsArr[j].CategoryAllocated;
            _overAllUsed =
              _overAllUsed + _calArray[i].curDetailsArr[j].CategoryUsed;

            _masUsed = _masUsed + _calArray[i].Price;
          }

          if (
            _calArray.length === i + 1 &&
            _calArray[i].curDetailsArr.length === j + 1
          ) {
            let _sum: number = 0;

            _sum = _overAllUsed + _masUsed;
            _masRemaining = _overAllAllocated - _sum;

            _preCateList.push({
              ID: _uniqueMas[m],
              OverAllPOIssuedCost: _sum,
              OverAllRemainingCost: _masRemaining,
            });
          }

          if (
            _uniqueMas.length === m + 1 &&
            _calArray.length === i + 1 &&
            _calArray[i].curDetailsArr.length === j + 1
          ) {
            _isCate = true;
            _updateLists.push({
              ListName: Config.ListNames.CategoryList,
              CateList: [..._preCateList],
            });
          }
        }
      }
    }

    for (let s: number = 0; _uniqueSub.length > s; s++) {
      _subUsed = 0;
      _budgetAllocated = 0;
      _budgetUsed = 0;
      _curVendorsId = _subCategory.filter(
        (data: IVenSubCategory) => data.ID === _uniqueSub[s]
      )[0].Vendors;

      for (let i: number = 0; _calArray.length > i; i++) {
        for (let j: number = 0; _calArray[i].curDetailsArr.length > j; j++) {
          if (_uniqueSub[s] === _calArray[i].curDetailsArr[j].key) {
            _budgetAllocated =
              _budgetAllocated + _calArray[i].curDetailsArr[j].BudgetAllocated;
            _budgetUsed =
              _budgetUsed + _calArray[i].curDetailsArr[j].BudgetUsed;
            _subUsed = _subUsed + _calArray[i].Price;
            _curVendorsId.push(_calArray[i].ID);
          }

          if (
            _calArray.length === i + 1 &&
            _calArray[i].curDetailsArr.length === j + 1
          ) {
            let _sum: number = 0;

            _sum = _budgetUsed + _subUsed;
            _subRemaining = _budgetAllocated - _sum;

            _preBudList.push({
              ID: _uniqueSub[s],
              Used: _sum,
              RemainingCost: _subRemaining,
              VendorsId: { results: [..._curVendorsId] },
            });
          }

          if (
            _uniqueSub.length === s + 1 &&
            _calArray.length === i + 1 &&
            _calArray[i].curDetailsArr.length === j + 1
          ) {
            _isBud = true;
            _updateLists.push({
              ListName: Config.ListNames.BudgetList,
              BudList: [..._preBudList],
            });
          }
        }
      }
    }

    for (let i: number = 0; _calArray.length > i; i++) {
      let _temp: number[] = arrId.filter(
        (obj: IVendorBudget) => obj.ID === _calArray[i].ID
      )[0].BudgetId;

      _preVenList.push({
        ID: _calArray[i].ID,
        CategoryId: _calArray[i].curDetailsArr[0].CategoryID,
        BudgetId: { results: _temp.concat([..._calArray[i].arrKeys]) },
        Status: "Approved",
      });

      if (_calArray.length === i + 1) {
        _isVen = true;
        _updateLists.push({
          ListName: Config.ListNames.VendorConfig,
          VenList: [..._preVenList],
        });
      }
    }

    if (_isCate && _isBud && _isBud) {
      handleUpdate([..._updateLists]);
    }
  };

  const handleUpdate = async (_updateLists: IUpdateJSON[]) => {
    let _listName: string = "";
    let _reqJSON: any = {};

    for (let i: number = 0; _updateLists.length > i; i++) {
      if (_updateLists[i].ListName === Config.ListNames.CategoryList) {
        _listName = _updateLists[i].ListName;
        _reqJSON = _updateLists[i].CateList;
      } else if (_updateLists[i].ListName === Config.ListNames.BudgetList) {
        _listName = _updateLists[i].ListName;
        _reqJSON = _updateLists[i].BudList;
      } else {
        _listName = _updateLists[i].ListName;
        _reqJSON = _updateLists[i].VenList;
      }

      await SPServices.batchUpdate({
        ListName: _listName,
        responseData: _reqJSON,
      })
        .then((res: any) => {
          if (_updateLists.length === i + 1) {
            _calArray = [];
            setIsLoader(false);
            props._getDefaultFunction();
            // _getVendorDetail([..._categoryList], [..._budgetList]);
          }
        })
        .catch((err: any) => {
          _getErrorFunction(err);
        });
    }
  };

  /* Life cycle of onload */
  useEffect(() => {
    _getDefaultFunction();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div style={{ width: "100%" }}>
      {/* Header section */}
      <div className={styles.Header}>
        <Icon
          iconName="ChromeBack"
          className={styles.HeaderIcon}
          onClick={() => {
            props._getVendorNave("");
          }}
        />
        <Label className={styles.HeaderLable}>Vendor Configuration</Label>
      </div>

      {/* Filter and BTN section */}
      <div className={styles.filterSection}>
        {/* Left side section */}
        <div className={styles.filters}>
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
                _Area =
                  (text.text as string) !== "All"
                    ? (text.text as string)
                    : "Please select";
                setFilAreaDrop(text.text as string);
                _getFilterFunction();
              }}
            />
          </div>

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
                _Country =
                  (text.text as string) !== "All"
                    ? (text.text as string)
                    : "Please select";
                setFilCountryDrop(text.text as string);
                _getFilterFunction();
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
                _Type =
                  (text.text as string) !== "All"
                    ? (text.text as string)
                    : "Please select";
                setFilTypeDrop(text.text as string);
                _getFilterFunction();
              }}
            />
          </div>

          {/* Search section */}
          <div style={{ width: "25%" }}>
            <Label>Vendor</Label>
            <SearchBox
              placeholder="Search"
              styles={searchBoxStyle}
              value={FilterValue.SearchFilter}
              onChange={(e: any) => {
                let searchName: string = e.target.value.toLowerCase();
                setFilterValue({ SearchFilter: searchName });

                let _tempData = [...MData].filter((e: IVendorData) =>
                  e.VendorName.toLowerCase().includes(searchName)
                );
                setFData([..._tempData]);
              }}
              onClear={() => {
                setFilterValue({
                  SearchFilter: "",
                });
                setFData([...MData]);
              }}
            />
          </div>

          {/* Over all refresh section */}
          <div
            className={styles.refIcon}
            onClick={() => {
              _Area = "Please select";
              _Country = "Please select";
              _Type = "Please select";
              setFilCountryDrop("All");
              setFilTypeDrop("All");
              setFilAreaDrop("All");
              _getFilterFunction();
              setFilterValue({
                SearchFilter: "",
              });
            }}
          >
            <Icon iconName="Refresh" style={{ color: "#ffff" }} />
          </div>
        </div>

        {/* btn sections */}
        <div className={styles.rightBtns}>
          {/* submit btn section */}
          {!_isAdminView && (
            <DefaultButton
              text="Submit"
              styles={btnStyle}
              onClick={() => {
                _calArray.length && setIsModal(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Dashboard Detail list section */}
      <DetailsList
        columns={_VendorColumn}
        items={fData}
        styles={_DetailsListStyle}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
      {MData.length === 0 && (
        <div className={styles.noRecords}>No data found !!!</div>
      )}

      {/* Modal section */}
      <Modal isOpen={isModal} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.deleteImg}
              iconProps={{ iconName: "SkypeCheck" }}
            />
          </div>
          <Label
            style={{
              color: "red",
              fontSize: 16,
            }}
          >
            Do you want to config vendors?
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
                _handleSubmit();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorConfig;
