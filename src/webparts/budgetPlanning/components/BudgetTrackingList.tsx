import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./BudgetTrackingList.module.scss";
import {
  Label,
  Dropdown,
  Icon,
  TextField,
  IDropdownStyles,
  DefaultButton,
  IButtonStyles,
  DatePicker,
  Checkbox,
  Modal,
  DetailsListLayoutMode,
  SelectionMode,
  DetailsList,
  IDetailsListStyles,
  IColumn,
  IPeoplePickerItemSelectedStyles,
  NormalPeoplePicker,
  ITextFieldStyles,
  IDatePickerStyles,
  IModalStyles,
  TooltipHost,
} from "@fluentui/react";
import { Config } from "../../../globals/Config";
import {
  IDrop,
  IDropdowns,
  ICurBudgetItem,
  ICurCategoryItem,
  IGroupUsers,
  IBudTrackDistribution,
  IOverAllTrackItem,
  ITrackSelectedItem,
  ITrackUpdateItem,
  IUserDetail,
} from "../../../globalInterFace/BudgetInterFaces";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import SPServices from "../../../CommonServices/SPServices";
import { _filterArray } from "../../../CommonServices/filterCommonArray";
import { Accordion } from "@pnp/spfx-controls-react/lib/Accordion";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import * as moment from "moment";
import { styled, values } from "office-ui-fabric-react";

let propDropValue: IDropdowns;
let isUserPermissions: IGroupUsers;
let _arrCategory: ICurCategoryItem[] = [];
let _arrBudget: ICurBudgetItem[] = [];
let _arrDistribution: IBudTrackDistribution[] = [];
let _isSelectAll: boolean = false;
let _isCurrentYear: boolean = true;
let _isAdminView: boolean = false;

const BudgetTrackingList = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;
  propDropValue = { ...props.dropValue };
  isUserPermissions = { ...props.groupUsers };

  let currentYear: string = moment().format("YYYY");
  // let currentYear: string =
  //   propDropValue.Period[propDropValue.Period.length - 1].text;

  const _selectedItemColumn: IColumn[] = [
    {
      key: "column1",
      name: "Entry Date",
      fieldName: "EntryDate",
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: IBudTrackDistribution): any => {
        return moment(item.EntryDate).format("DD/MM/YYYY");
      },
    },
    {
      key: "column2",
      name: "Item",
      fieldName: "Item",
      minWidth: 200,
      maxWidth: 250,
      onRender: (item) => {
        return (
          <TooltipHost content={item.Item}>
            <label>{item.Item}</label>
          </TooltipHost>
        );
      },
    },
    {
      key: "column3",
      name: "Cost",
      fieldName: "Cost",
      minWidth: 100,
      maxWidth: 150,
    },
    {
      key: "column4",
      name: "Type",
      fieldName: "Type",
      minWidth: 100,
      maxWidth: 150,
    },
    {
      key: "column5",
      name: "Vendor",
      fieldName: "Vendor",
      minWidth: 150,
      maxWidth: 200,
    },
  ];

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [filPeriodDrop, setFilPeriodDrop] = useState<string>(
    propDropValue.Period[propDropValue.Period.length - 1].text
  );
  // const [filPeriodDrop, setFilPeriodDrop] = useState<string>('2022');
  const [filCountryDrop, setFilCountryDrop] = useState<string>("All");
  const [filTypeDrop, setFilTypeDrop] = useState<string>("All");
  const [filAreaDrop, setFilAreaDrop] = useState<string>("All");
  const [trackItems, setTrackItems] = useState([]);
  const [Master, setMaster] = useState([]);
  const [Changedata, setChangeData] = useState([]);
  const [selItems, setSelItems] = useState<IBudTrackDistribution[]>([]);
  const [userDatas, setUserDatas] = useState([]);
  const [curEditItem, setCurEditItem] = useState<ITrackSelectedItem>({
    ...Config.TrackSelectedItem,
  });
  const [isModal, setIsModal] = useState<boolean>(false);
  const [isTrigger, setIsTrigger] = useState<boolean>(true);

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
      // ".ms-DetailsList-contentWrapper": {
      //   height: 20,
      //   overflowY: "auto",
      //   overflowX: "hidden",
      // },
    },
  };

  const DropdownStyle: Partial<IDropdownStyles> = {
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const disabledDropdownStyles: Partial<IDropdownStyles> = {
    title: {
      background: "#fff",
      border: "1px solid #000",
    },
    root: {
      width: "100%",
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid #000",
      },
    },
  };

  const buttonStyles: Partial<IButtonStyles> = {
    root: {
      background: "#2580e0 !important",
      color: "#fff !important",
      ".ms-Button-label": {
        fontWeight: "500",
      },
    },
  };

  const peoplePickerStyle: Partial<IPeoplePickerItemSelectedStyles> = {
    root: {
      width: "30%",
      marginRight: 20,
      ".ms-BasePicker-text": {
        "::after": {
          border: "1px solid rgb(96, 94, 92) !important",
        },
      },
      ".ms-BasePicker-itemsWrapper": {
        maxHeight: 50,
        overflow: "auto",
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

  const dateStyles: Partial<IDatePickerStyles> = {
    root: {
      ".ms-TextField-fieldGroup": {
        "::after": {
          border: "1px solid rgb(96, 94, 92)",
        },
      },
      // ".ms-TextField-field": {
      //   padding: "0px 21px 0px 0px",
      // },
    },
  };

  const modalStyle: Partial<IModalStyles> = {
    main: {
      padding: 20,
    },
  };

  /* function creation */
  const _getErrorFunction = (errMsg: any, name: string): void => {
    console.log(name, errMsg);
    alertify.error(name);
    setIsLoader(false);
  };

  // const _getDefaultFunction = (): void => {
  //   setIsLoader(true);
  //   _getCategoryDatas();
  // };

  // const _getCategoryDatas = (): void => {
  //   SPServices.SPReadItems({
  //     Listname: Config.ListNames.CategoryList,
  //     Select:
  //       "*, Year/ID, Year/Title, Country/ID, Country/Title, MasterCategory/ID",
  //     Expand: "Year, Country, MasterCategory",
  //     Filter: [
  //       {
  //         FilterKey: "isDeleted",
  //         Operator: "ne",
  //         FilterValue: "1",
  //       },
  //       {
  //         FilterKey: "Year/Title",
  //         Operator: "eq",
  //         FilterValue: filPeriodDrop,
  //       },
  //     ],
  //     Topcount: 5000,
  //   })
  //     .then((resCate: any) => {
  //       let _curCategory = [];

  //       if (resCate.length) {
  //         for (let i: number = 0; resCate.length > i; i++) {
  //           let TitleCol: string = `${
  //             resCate[i].Title ? resCate[i].Title : ""
  //           } - ${resCate[i].CountryId ? resCate[i].Country.Title : ""} ( ${
  //             resCate[i].CategoryType
  //           } ) ~ AED ${resCate[i].OverAllBudgetCost}`;

  //           _curCategory.push({
  //             // ID: resCate[i].ID,
  //             CategoryId: resCate[i].ID ? resCate[i].ID : null,
  //             CategoryType: resCate[i].CategoryType
  //               ? resCate[i].CategoryType
  //               : "",
  //             // Area: resCate[i].Area ? resCate[i].Area : "",
  //             // YearAcc: resCate[i].YearId
  //             //   ? {
  //             //       ID: resCate[i].Year.ID,
  //             //       Text: resCate[i].Year.Title,
  //             //     }
  //             //   : undefined,
  //             CountryId: resCate[i].CountryId ? resCate[i].CountryId : null,
  //             CatTitle: TitleCol,
  //             OverAllBudgetCost: resCate[i].OverAllBudgetCost
  //               ? resCate[i].OverAllBudgetCost
  //               : null,
  //             // TotalProposed: resCate[i].TotalProposed
  //             //   ? resCate[i].TotalProposed
  //             //   : null,
  //             OverAllPOIssuedCost: resCate[i].OverAllPOIssuedCost
  //               ? resCate[i].OverAllPOIssuedCost
  //               : null,
  //             OverAllRemainingCost: resCate[i].OverAllRemainingCost
  //               ? resCate[i].OverAllRemainingCost
  //               : null,
  //           });
  //           i + 1 == resCate.length && getvendorDetails();
  //         }
  //       } else {
  //         setSelItems([]);
  //         setTrackItems([]);
  //         setIsLoader(false);
  //       }
  //     })
  //     .catch((err: any) => {
  //       _getErrorFunction(err);
  //     });
  // };

  // const _getBudgetDatas = (_arrCate: ICurCategoryItem[]): void => {
  //   SPServices.SPReadItems({
  //     Listname: Config.ListNames.BudgetList,
  //     Select:
  //       "*, Category/ID, Category/Title, Year/ID, Year/Title, Country/ID, Country/Title",
  //     Expand: "Category, Year, Country",
  //     Filter: [
  //       {
  //         FilterKey: "isDeleted",
  //         FilterValue: "1",
  //         Operator: "ne",
  //       },
  //       {
  //         FilterKey: "Year/Title",
  //         Operator: "eq",
  //         FilterValue: filPeriodDrop,
  //       },
  //     ],
  //     Topcount: 5000,
  //     Orderbydecorasc: false,
  //   })
  //     .then((resBudget: any) => {
  //       let _curItem: ICurBudgetItem[] = [];
  //       if (resBudget.length) {
  //         for (let i: number = 0; resBudget.length > i; i++) {
  //           _curItem.push({
  //             ID: resBudget[i].ID,
  //             Category: resBudget[i].CategoryId
  //               ? resBudget[i].Category.Title
  //               : "",
  //             Country: resBudget[i].CountryId ? resBudget[i].Country.Title : "",
  //             Year: resBudget[i].YearId ? resBudget[i].Year.Title : "",
  //             Type: resBudget[i].CategoryType ? resBudget[i].CategoryType : "",
  //             Area: resBudget[i].Area ? resBudget[i].Area : "",
  //             CateId: resBudget[i].CategoryId ? resBudget[i].Category.ID : null,
  //             CounId: resBudget[i].CountryId ? resBudget[i].Country.ID : null,
  //             YearId: resBudget[i].YearId ? resBudget[i].Year.ID : null,
  //             BudgetAllocated: resBudget[i].BudgetAllocated
  //               ? resBudget[i].BudgetAllocated
  //               : null,
  //             BudgetProposed: resBudget[i].BudgetProposed
  //               ? resBudget[i].BudgetProposed
  //               : null,
  //             Used: resBudget[i].Used ? resBudget[i].Used : null,
  //             ApproveStatus: resBudget[i].ApproveStatus
  //               ? resBudget[i].ApproveStatus
  //               : "",
  //             Description: resBudget[i].Description
  //               ? resBudget[i].Description
  //               : "",
  //             Comments: resBudget[i].Comments ? resBudget[i].Comments : "",
  //             RemainingCost: resBudget[i].RemainingCost
  //               ? resBudget[i].RemainingCost
  //               : null,
  //             isDeleted: resBudget[i].isDeleted,
  //             isEdit: false,
  //             isDummy: false,
  //           });
  //           i + 1 == resBudget.length &&
  //             _getVendorDetail([..._arrCate], [..._curItem]);
  //         }
  //       } else {
  //         setSelItems([]);
  //         setTrackItems([]);
  //         setIsLoader(false);
  //       }
  //     })
  //     .catch((err: any) => {
  //       _getErrorFunction(err);
  //     });
  // };

  // const _getVendorDetail = (
  //   _arrCate: ICurCategoryItem[],
  //   _arrBud: ICurBudgetItem[]
  // ): void => {
  //   SPServices.SPReadItems({
  //     Listname: Config.ListNames.VendorDetails,
  //     Select:
  //       "*, Category/ID, Category/Title, Budget/ID, Budget/Description, Country/ID, Country/Title, AttachmentFiles",
  //     Expand: "Category, Budget, Country, AttachmentFiles",
  //     Filter: [
  //       {
  //         FilterKey: "Year",
  //         Operator: "eq",
  //         FilterValue: filPeriodDrop,
  //       },
  //       {
  //         FilterKey: "Status",
  //         Operator: "eq",
  //         FilterValue: "Approved",
  //       },
  //       {
  //         FilterKey: "IsDeleted",
  //         Operator: "ne",
  //         FilterValue: "1",
  //       },
  //     ],
  //     Topcount: 5000,
  //     Orderbydecorasc: false,
  //   })
  //     .then((resDis: any) => {
  //       let _arrDis: IBudTrackDistribution[] = [];

  //       if (resDis.length) {
  //         resDis.forEach((e: any) => {
  //           _arrDis.push({
  //             Title: "",
  //             ID: e.ID,
  //             // BudgetId: e.BudgetId ? e.BudgetId : null,
  //             BudgetId: e.BudgetId,
  //             Cost: e.Price
  //               ? SPServices.format(Number(e.Price))
  //               : SPServices.format(0),
  //             Vendor: e.VendorName ? e.VendorName : "",
  //             Po: e.Po ? e.Po : "",
  //             PoCurrency: e.PoCurrency ? e.PoCurrency : "",
  //             InvoiceNo: e.InvoiceNo ? e.InvoiceNo : "",
  //             Area: e.Area ? e.Area : "",
  //             EntryDate: new Date(e.Created),
  //             StartDate: e.StartingDate ? new Date(e.StartingDate) : null,
  //             ToDate: e.ToDate ? new Date(e.ToDate) : null,
  //             isClick: false,
  //             isEdit: false,
  //           });
  //         });

  //         resDis.length == _arrDis.length &&
  //           _areaFilterFun([..._arrCate], [..._arrBud], [..._arrDis]);
  //       } else {
  //         setSelItems([]);
  //         setTrackItems([]);
  //         setIsLoader(false);
  //       }
  //     })
  //     .catch((err: any) => {
  //       _getErrorFunction(err);
  //     });
  // };

  // const _areaFilterFun = (
  //   _arrCate: ICurCategoryItem[],
  //   _arrBud: ICurBudgetItem[],
  //   _arrDis: any[]
  // ): void => {
  //   if (_arrCate.length && _arrBud.length && _arrDis.length) {
  //     _arrCategory = _filterArray(
  //       isUserPermissions,
  //       [..._arrCate],
  //       Config.Navigation.BudgetTrackingList
  //     );

  //     _arrBudget = _filterArray(
  //       isUserPermissions,
  //       [..._arrBud],
  //       Config.Navigation.BudgetTrackingList
  //     );

  //     _arrDistribution = _filterArray(
  //       isUserPermissions,
  //       [..._arrDis],
  //       Config.Navigation.BudgetTrackingList
  //     );

  //     if (_arrCategory.length && _arrBudget.length && _arrDistribution.length) {
  //       _getFilterFunction();
  //     } else {
  //       setSelItems([]);
  //       setTrackItems([]);
  //       setIsLoader(false);
  //     }
  //   } else {
  //     setSelItems([]);
  //     setTrackItems([]);
  //     setIsLoader(false);
  //   }
  // };

  // const _getFilterFunction = (): void => {
  //   let tempArr: ICurCategoryItem[] = [..._arrCategory];

  //   if (filCountryDrop != "All" && tempArr.length) {
  //     tempArr = tempArr.filter((arr: ICurCategoryItem) => {
  //       return arr.CountryAcc.Text == filCountryDrop;
  //     });
  //   }
  //   if (filTypeDrop != "All" && tempArr.length) {
  //     tempArr = tempArr.filter((arr: ICurCategoryItem) => {
  //       return arr.Type == filTypeDrop;
  //     });
  //   }
  //   if (filAreaDrop != "All" && tempArr.length) {
  //     tempArr = tempArr.filter((arr: ICurCategoryItem) => {
  //       return arr.Area == filAreaDrop;
  //     });
  //   }

  //   if (tempArr.length) {
  //     _arrMasterCategoryData([...tempArr]);
  //   } else {
  //     setSelItems([]);
  //     setTrackItems([]);
  //     setIsLoader(false);
  //   }
  // };

  // const FilterFunction = (): void => {
  //   let tempArr = [...Changedata];

  //   if (filCountryDrop != "All" && tempArr.length) {
  //     tempArr = tempArr.filter((arr) => {
  //       return arr.Country == filCountryDrop;
  //     });
  //   }
  //   if (filTypeDrop != "All" && tempArr.length) {
  //     tempArr = tempArr.filter((arr) => {
  //       return arr.Type == filTypeDrop;
  //     });
  //   }
  //   if (filAreaDrop != "All" && tempArr.length) {
  //     tempArr = tempArr.filter((arr) => {
  //       return arr.Area == filAreaDrop;
  //     });
  //   }

  //   // if (tempArr.length) {
  //   //   _arrMasterCategoryData([...tempArr]);
  //   // } else {
  //   //   setSelItems([]);
  //   //   setTrackItems([]);
  //   //   setIsLoader(false);
  //   // }
  //   groupSplit([...tempArr]);
  // };

  // const _arrMasterCategoryData = (tempArr: ICurCategoryItem[]): void => {
  //   let _arrMasterCategory: IOverAllTrackItem[] = [];

  //   for (let i: number = 0; tempArr.length > i; i++) {
  //     _arrMasterCategory.push({
  //       CategoryAcc: tempArr[i].CategoryAcc.Text,
  //       YearAcc: tempArr[i].YearAcc.Text,
  //       CountryAcc: tempArr[i].CountryAcc.Text,
  //       Type: tempArr[i].Type,
  //       Area: tempArr[i].Area,
  //       ID: tempArr[i].ID,
  //       yearID: tempArr[i].YearAcc.ID,
  //       countryID: tempArr[i].CountryAcc.ID,
  //       OverAllBudgetCost: tempArr[i].OverAllBudgetCost,
  //       OverAllPOIssuedCost: tempArr[i].OverAllPOIssuedCost,
  //       OverAllRemainingCost: tempArr[i].OverAllRemainingCost,
  //       TotalProposed: tempArr[i].TotalProposed,
  //       isMasterClick: false,
  //       VendorDetails: [],
  //     });
  //     _arrMasterCategory.length == tempArr.length &&
  //       _getPrepareArray([..._arrMasterCategory]);
  //   }
  // };

  // const _getPrepareArray = (_cateArray: IOverAllTrackItem[]): void => {
  //   let _arrTrack: IOverAllTrackItem[] = [];

  //   for (let i: number = 0; _cateArray.length > i; i++) {
  //     let _isTrack: Boolean = false;
  //     for (let j: number = 0; _arrBudget.length > j; j++) {
  //       if (
  //         _cateArray[i].ID === _arrBudget[j].CateId &&
  //         _cateArray[i].CategoryAcc === _arrBudget[j].Category &&
  //         _cateArray[i].CountryAcc === _arrBudget[j].Country &&
  //         _cateArray[i].YearAcc === _arrBudget[j].Year &&
  //         _cateArray[i].Type === _arrBudget[j].Type &&
  //         _cateArray[i].Area === _arrBudget[j].Area &&
  //         !_isTrack
  //       ) {
  //         for (let k: number = 0; _arrDistribution.length > k; k++) {
  //           // if (_arrBudget[j].ID === _arrDistribution[k].BudgetId) {
  //           if (_arrDistribution[k].BudgetId.includes(_arrBudget[j].ID)) {
  //             _isTrack = true;
  //             _arrDistribution[k].Item = _arrBudget[j].Description;
  //             _arrDistribution[k].Type = _arrBudget[j].Type;
  //             _arrDistribution[k].Category = _cateArray[i].CategoryAcc;
  //             _arrDistribution[k].CateId = _cateArray[i].ID;
  //             _arrDistribution[k].OverAllBudgetCost =
  //               _cateArray[i].OverAllBudgetCost;
  //             _arrDistribution[k].OverAllPOIssuedCost =
  //               _cateArray[i].OverAllPOIssuedCost;
  //             _arrDistribution[k].OverAllRemainingCost =
  //               _cateArray[i].OverAllRemainingCost;

  //             _cateArray[i].VendorDetails.push({ ..._arrDistribution[k] });
  //           }

  //           if (_isTrack && k + 1 === _arrDistribution.length) {
  //             _isTrack = false;
  //             _arrTrack.push({ ..._cateArray[i] });
  //           }
  //         }
  //       }
  //     }
  //   }

  //   if (_arrTrack.length) {
  //     _getUniqueValues([..._arrTrack]);
  //   } else {
  //     setSelItems([]);
  //     setTrackItems([]);
  //     setIsLoader(false);
  //   }
  // };

  // const _getUniqueValues = (_arrTrack: IOverAllTrackItem[]) => {
  //   let _arrBudgetTrackList: IOverAllTrackItem[] = [];
  //   let matches: any[] = [];
  //   let idTrack: number[] = [];
  //   let _uniqueTrackList: string[] = [];
  //   let distinctMap = {};
  //   let _objBudget: IOverAllTrackItem;

  //   _arrTrack.reduce((item: number[], e1: IOverAllTrackItem) => {
  //     matches = item.filter((e2: number) => {
  //       return e1.ID === e2;
  //     });
  //     if (matches.length == 0) {
  //       idTrack.push(e1.ID);
  //     }
  //     return idTrack;
  //   }, []);

  //   for (let i: number = 0; i < idTrack.length; i++) {
  //     let value: number = idTrack[i];
  //     distinctMap[value] = null;
  //   }
  //   _uniqueTrackList = Object.keys(distinctMap);

  //   if (_uniqueTrackList.length) {
  //     for (let i: number = 0; _uniqueTrackList.length > i; i++) {
  //       _objBudget = [..._arrTrack].filter((e: IOverAllTrackItem) => {
  //         return e.ID === Number(_uniqueTrackList[i]);
  //       })[0];
  //       _arrBudgetTrackList.push({ ..._objBudget });

  //       if (_uniqueTrackList.length === i + 1) {
  //         setSelItems([]);
  //         setTrackItems([..._arrBudgetTrackList]);
  //         setIsLoader(false);
  //       }
  //     }
  //   } else {
  //     setSelItems([]);
  //     setTrackItems([]);
  //     setIsLoader(false);
  //   }
  // };

  // const _getEditItem = (
  //   masIndex: number,
  //   subIndex: number,
  //   type: string
  // ): void => {
  //   let _masterArray: IOverAllTrackItem[] = [...trackItems];

  //   for (let i: number = 0; _masterArray.length > i; i++) {
  //     _masterArray[i].isMasterClick = false;
  //     [..._masterArray[i].VendorDetails].map(
  //       (e: IBudTrackDistribution) => ((e.isClick = false), (e.isEdit = false))
  //     );
  //   }

  //   if (trackItems.length === _masterArray.length) {
  //     if (type === "edit") {
  //       _masterArray[masIndex].VendorDetails[subIndex].isEdit = true;
  //       curEditItem.ID = _masterArray[masIndex].VendorDetails[subIndex].ID;
  //       curEditItem.ToDate =
  //         _masterArray[masIndex].VendorDetails[subIndex].ToDate;
  //       curEditItem.StartDate =
  //         _masterArray[masIndex].VendorDetails[subIndex].StartDate;
  //       curEditItem.Po = _masterArray[masIndex].VendorDetails[subIndex].Po;
  //       curEditItem.PoCurrency =
  //         _masterArray[masIndex].VendorDetails[subIndex].PoCurrency;
  //       curEditItem.InvoiceNo =
  //         _masterArray[masIndex].VendorDetails[subIndex].InvoiceNo;

  //       setSelItems([]);
  //       setCurEditItem({ ...curEditItem });
  //       setTrackItems([..._masterArray]);
  //     } else {
  //       setSelItems([]);
  //       setCurEditItem({ ...Config.TrackSelectedItem });
  //       setTrackItems([..._masterArray]);
  //     }
  //   }
  // };

  // const handleChecked = (
  //   isChecked: boolean,
  //   masIndex: number,
  //   subIndex: number,
  //   type: string
  // ): void => {
  //   let _masCateArray: IOverAllTrackItem[] = [...trackItems];
  //   let _reArrangedArray: IOverAllTrackItem[] = [];
  //   let _selVendorsArray: IBudTrackDistribution[] = [];
  //   let _findIndexNo: number = null;
  //   _isSelectAll = false;

  //   _findIndexNo = [...trackItems].findIndex(
  //     (e: IOverAllTrackItem) => e.isMasterClick === true
  //   );

  //   if (_findIndexNo >= 0) {
  //     if (type === "all" && masIndex === _findIndexNo) {
  //       _masCateArray[masIndex].isMasterClick = isChecked;
  //       [..._masCateArray[masIndex].VendorDetails].map(
  //         (e: IBudTrackDistribution) => (
  //           (e.isClick = isChecked), (e.isEdit = false)
  //         )
  //       );
  //       _selVendorsArray = [..._masCateArray[masIndex].VendorDetails].filter(
  //         (e: IBudTrackDistribution) => e.isClick === true
  //       );
  //       _isSelectAll = isChecked;
  //       setSelItems([..._selVendorsArray]);
  //       setTrackItems([..._masCateArray]);
  //     } else if (type === "all") {
  //       for (let i: number = 0; _masCateArray.length > i; i++) {
  //         _masCateArray[i].isMasterClick = false;
  //         [..._masCateArray[i].VendorDetails].map(
  //           (e: IBudTrackDistribution) => (
  //             (e.isClick = false), (e.isEdit = false)
  //           )
  //         );
  //         _reArrangedArray.push({ ..._masCateArray[i] });
  //       }
  //       if (_masCateArray.length === _reArrangedArray.length) {
  //         _reArrangedArray[masIndex].isMasterClick = isChecked;
  //         [..._reArrangedArray[masIndex].VendorDetails].map(
  //           (e: IBudTrackDistribution) => (
  //             (e.isClick = isChecked), (e.isEdit = false)
  //           )
  //         );
  //         _selVendorsArray = [
  //           ..._reArrangedArray[masIndex].VendorDetails,
  //         ].filter((e: IBudTrackDistribution) => e.isClick === true);
  //         _isSelectAll = isChecked;
  //         setSelItems([..._selVendorsArray]);
  //         setTrackItems([..._reArrangedArray]);
  //       }
  //     } else if (masIndex === _findIndexNo) {
  //       _masCateArray[masIndex].isMasterClick = true;
  //       _masCateArray[masIndex].VendorDetails[subIndex].isClick = isChecked;
  //       _selVendorsArray = [..._masCateArray[masIndex].VendorDetails].filter(
  //         (e: IBudTrackDistribution) => e.isClick === true
  //       );
  //       _isSelectAll = [..._masCateArray[masIndex].VendorDetails].every(
  //         (e: IBudTrackDistribution) => e.isClick === true
  //       );
  //       setSelItems([..._selVendorsArray]);
  //       setTrackItems([..._masCateArray]);
  //     } else {
  //       for (let i: number = 0; _masCateArray.length > i; i++) {
  //         _masCateArray[i].isMasterClick = false;
  //         [..._masCateArray[i].VendorDetails].map(
  //           (e: IBudTrackDistribution) => (
  //             (e.isClick = false), (e.isEdit = false)
  //           )
  //         );
  //         _reArrangedArray.push({ ..._masCateArray[i] });
  //       }
  //       if (_masCateArray.length === _reArrangedArray.length) {
  //         _reArrangedArray[masIndex].isMasterClick = true;
  //         [..._reArrangedArray[masIndex].VendorDetails].map(
  //           (e: IBudTrackDistribution) => (e.isEdit = false)
  //         );
  //         _reArrangedArray[masIndex].VendorDetails[subIndex].isClick =
  //           isChecked;
  //         _selVendorsArray = [
  //           ..._reArrangedArray[masIndex].VendorDetails,
  //         ].filter((e: IBudTrackDistribution) => e.isClick === true);
  //         _isSelectAll = [..._reArrangedArray[masIndex].VendorDetails].every(
  //           (e: IBudTrackDistribution) => e.isClick === true
  //         );
  //         setSelItems([..._selVendorsArray]);
  //         setTrackItems([..._reArrangedArray]);
  //       }
  //     }
  //   } else {
  //     if (type === "all") {
  //       _masCateArray[masIndex].isMasterClick = isChecked;
  //       [..._masCateArray[masIndex].VendorDetails].map(
  //         (e: IBudTrackDistribution) => (
  //           (e.isClick = isChecked), (e.isEdit = false)
  //         )
  //       );
  //       _selVendorsArray = [..._masCateArray[masIndex].VendorDetails].filter(
  //         (e: IBudTrackDistribution) => e.isClick === true
  //       );
  //       _isSelectAll = isChecked;
  //       setSelItems([..._selVendorsArray]);
  //       setTrackItems([..._masCateArray]);
  //     } else {
  //       _masCateArray[masIndex].isMasterClick = isChecked;
  //       [..._masCateArray[masIndex].VendorDetails].map(
  //         (e: IBudTrackDistribution) => (e.isEdit = false)
  //       );
  //       _masCateArray[masIndex].VendorDetails[subIndex].isClick = isChecked;
  //       _selVendorsArray = _masCateArray[masIndex].VendorDetails.filter(
  //         (e: IBudTrackDistribution) => e.isClick === true
  //       );
  //       _isSelectAll =
  //         _masCateArray[masIndex].VendorDetails.length === 1 ? true : false;
  //       setSelItems([..._selVendorsArray]);
  //       setTrackItems([..._masCateArray]);
  //     }
  //   }
  // };

  const handleUpdate = (Item): void => {
    let json: ITrackUpdateItem = {
      StartingDate: Item.StartDate ? Item.StartDate.toISOString() : null,
      ToDate: Item.ToDate ? Item.ToDate.toISOString() : null,
      Po: Item.Po,
      PoCurrency: Item.PoCurrency,
      InvoiceNo: Item.InvoiceNo,
    };

    SPServices.SPUpdateItem({
      Listname: Config.ListNames.VendorDetails,
      ID: Number(Item.ID),
      RequestJSON: json,
    })
      .then((data: any) => {
        // _getDefaultFunction();
        // setIsTrigger(!isTrigger);
        let MData = [...Changedata];
        let Index = MData.findIndex((val) => val.ID == Item.ID);
        MData[Index].isEdit = false;
        let MasUpdate = [...Master];
        let index = MasUpdate.findIndex((val) => val.ID == Item.ID);
        MasUpdate[index] = MData[Index];
        setChangeData([...MData]);
        setMaster([...MasUpdate]);
        groupSplit([...MData]);
        // handleChange(Item.ID, "isEdit", false);
      })
      .catch((error: any) => {
        _getErrorFunction(error, "Vendor details update issue");
      });
  };

  const handleSend = (): void => {
    // let _masterArray: IOverAllTrackItem[] = [...trackItems];

    // for (let i: number = 0; _masterArray.length > i; i++) {
    //   _masterArray[i].isMasterClick = false;
    //   [..._masterArray[i].VendorDetails].map(
    //     (e: IBudTrackDistribution) => ((e.isClick = false), (e.isEdit = false))
    //   );
    // }

    let json: any = {
      AdminData: JSON.stringify([...userDatas]),
      MailJSON: JSON.stringify([...selItems]),
      TypeOfNotification: "Tracking List",
    };

    SPServices.SPAddItem({
      Listname: Config.ListNames.AdminList,
      RequestJSON: json,
    })
      .then((res: any) => {
        setSelItems([]);
        setUserDatas([]);
        // setTrackItems([..]);
        handleCheck(selItems[0].Title, false, "clear");
      })
      .catch((err: any) => {
        _getErrorFunction(err, "handle send");
      });
  };

  const getvendorDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.VendorDetails,
      Select:
        "*, Category/ID, Category/Title,Category/OverAllBudgetCost,Category/OverAllRemainingCost,Category/OverAllPOIssuedCost, Budget/ID, Budget/Description, Country/ID, Country/Title, AttachmentFiles",
      Expand: "Category, Budget, Country, AttachmentFiles",
      Filter: [
        {
          FilterKey: "Year",
          Operator: "eq",
          FilterValue: filPeriodDrop,
        },
        {
          FilterKey: "Status",
          Operator: "eq",
          FilterValue: "Approved",
        },
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderbydecorasc: false,
    })
      .then((resDis: any) => {
        let _arrDis: any[] = [];
        if (resDis.length) {
          for (let i = 0; i < resDis.length; i++) {
            // let FilData = [...VendorData].filter((value) => {
            //   return (
            //     value.CategoryId == resDis[i].CategoryId &&
            //     value.CountryId == resDis[i].CountryId &&
            //     value.CategoryType == resDis[i].CategoryType
            //   );
            // });
            let TitleCol: string = `${
              resDis[i].CategoryId ? resDis[i].Category.Title : ""
            } - ${resDis[i].CountryId ? resDis[i].Country.Title : ""} ( ${
              resDis[i].CategoryType
            } ) ~ AED ${
              resDis[i].CategoryId ? resDis[i].Category.OverAllBudgetCost : ""
            }`;
            // let TitleCol: string = FilData.length ? FilData[0].CatTitle : "";
            // let CatMasTitle = VendorData.filter((val) => {
            //   return val.CatTitle == TitleCol;
            // });
            _arrDis.push({
              Title: TitleCol,
              ID: resDis[i].ID,
              // BudgetId: resDis[i].BudgetId ? resDis[i].BudgetId : null,
              Country: resDis[i].CountryId ? resDis[i].Country.Title : "",
              BudgetId: resDis[i].BudgetId,
              Item: resDis[i].BudgetId ? resDis[i].Budget.Description : "",
              Type: resDis[i].CategoryType ? resDis[i].CategoryType : "",
              Cost: resDis[i].Price
                ? SPServices.format(Number(resDis[i].Price))
                : SPServices.format(0),
              Vendor: resDis[i].VendorName ? resDis[i].VendorName : "",
              Po: resDis[i].Po ? resDis[i].Po : "",
              PoCurrency: resDis[i].PoCurrency ? resDis[i].PoCurrency : "",
              InvoiceNo: resDis[i].InvoiceNo ? resDis[i].InvoiceNo : "",
              Area: resDis[i].Area ? resDis[i].Area : "",
              EntryDate: new Date(resDis[i].Created),
              StartDate: resDis[i].StartingDate
                ? new Date(resDis[i].StartingDate)
                : null,
              ToDate: resDis[i].ToDate ? new Date(resDis[i].ToDate) : null,
              OverAllBudgetCost: resDis[i].CategoryId
                ? resDis[i].Category.OverAllBudgetCost
                : null,
              OverAllPOIssuedCost: resDis[i].CategoryId
                ? resDis[i].Category.OverAllPOIssuedCost
                : null,
              OverAllRemainingCost: resDis[i].CategoryId
                ? resDis[i].Category.OverAllRemainingCost
                : null,
              isClick: false,
              isEdit: false,
            });
            // });
          }

          // setIsLoader(false);
          // groupSplit([..._arrDis]);
          _areaFilterFun([..._arrDis]);
          // resDis.length == _arrDis.length &&
          //   _areaFilterFun([..._arrCate], [..._arrBud], [..._arrDis]);
        } else {
          setSelItems([]);
          setTrackItems([]);
          setIsLoader(false);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "get vendor details");
      });
  };
  const _areaFilterFun = (_arrDis: any[]): void => {
    if (_arrDis.length) {
      // _arrCategory = _filterArray(
      //   isUserPermissions,
      //   [..._arrCate],
      //   Config.Navigation.BudgetTrackingList
      // );

      // _arrBudget = _filterArray(
      //   isUserPermissions,
      //   [..._arrBud],
      //   Config.Navigation.BudgetTrackingList
      // );

      _arrDistribution = _filterArray(
        isUserPermissions,
        [..._arrDis],
        Config.Navigation.BudgetTrackingList
      );

      if (_arrDistribution.length) {
        setMaster([..._arrDis]);
        _getFilterFunction(_arrDistribution);
      } else {
        setSelItems([]);
        setTrackItems([]);
        setIsLoader(false);
      }
    } else {
      setSelItems([]);
      setTrackItems([]);
      setIsLoader(false);
    }
  };
  const _getFilterFunction = (_arrCategory): void => {
    let tempArr = [..._arrCategory];

    if (filCountryDrop != "All" && tempArr.length) {
      tempArr = tempArr.filter((arr) => {
        return arr.Country == filCountryDrop;
      });
    }
    if (filTypeDrop != "All" && tempArr.length) {
      tempArr = tempArr.filter((arr) => {
        return arr.Type == filTypeDrop;
      });
    }
    if (filAreaDrop != "All" && tempArr.length) {
      tempArr = tempArr.filter((arr) => {
        return arr.Area == filAreaDrop;
      });
    }

    if (tempArr.length) {
      setChangeData([...tempArr]);
      groupSplit([...tempArr]);
      setIsLoader(false);
    } else {
      setSelItems([]);
      setTrackItems([]);
      setIsLoader(false);
    }
  };
  const groupSplit = (Data) => {
    let TrackTitles = [];

    let MData = [];
    Data.forEach((value) => {
      if (TrackTitles.every((val) => val != value.Title)) {
        TrackTitles.push(value.Title);
      }
    });
    TrackTitles.forEach((gName) => {
      let MGrpData = Data.filter((val) => {
        return gName == val.Title;
      });

      MData.push({
        Title: gName,
        isMasClick: [...MGrpData].every((val) => val.isClick == true),
        VendorDetails: [...MGrpData],
      });
    });

    setTrackItems([...MData]);
  };

  // const isEditItem = (Id: Number, flag: string) => {
  //   let MData = [...Changedata];
  //   let Change = [];

  //   if (flag == "edit") {
  //     MData.forEach((val) => {
  //       if (val.ID == Id) {
  //         val.isEdit = true;
  //       } else {
  //         val.StartDate = null;
  //         val.ToDate = null;
  //         val.Po = "";
  //         val.PoCurrency = "";
  //         val.InvoiceNo = "";
  //         val.isEdit = false;
  //       }
  //       Change.push(val);
  //     });
  // for (let i = 0; i < Master.length; i++) {
  //   if (Id == MData[i].ID) {
  //     MData[i].isEdit = true;
  //     MData[i].StartDate = Master[i];
  //     MData[i].ToDate = null;
  //     MData[i].Po = "";
  //     MData[i].PoCurrency = "";
  //     MData[i].InvoiceNo = "";
  //     MData[i].isEdit = false;
  //   } else {
  //     MData[i].isEdit = false;
  //   }
  // }
  // } else {
  // MData.forEach((val) => {
  //   val.isEdit = false;
  //   Change.push(val);
  // });
  //   Change = [...Changedata];
  //   let Index = MData.findIndex((val) => val.ID == Id);
  //   Change[Index] = { ...curEditItem };
  // }
  // let Index = MData.findIndex((val) => val.ID == Id);
  // MData[Index][key] = value;
  // setMaster([...MData]);
  //   groupSplit([...Change]);
  // };
  const handleChange = (Id: Number, key: string, value: any) => {
    let MData = [...Changedata];
    let Index = MData.findIndex((val) => val.ID == Id);
    let item = MData[Index];
    // setMaster([...MData]);
    if (key == "isEdit" && !value) {
      let index = Master.findIndex((val) => val.ID == Id);
      MData[Index] = Master[index];
    } else if (key == "isClick") {
      let selectVal = [...selItems];
      if (value) {
        let checkData = MData.filter((val) => {
          return val.ID == Id;
        });
        setSelItems([...selectVal, ...checkData]);
      } else {
        let UncheckData = [...selectVal].filter((val) => {
          return val.ID != Id;
        });
        setSelItems([...UncheckData]);
      }
      MData[Index] = { ...item, [key]: value };
    } else {
      MData[Index] = { ...item, [key]: value };
    }
    setChangeData([...MData]);
    groupSplit([...MData]);
  };

  const handleCheck = (title, value, type) => {
    let ChHandleData = [...Changedata];
    let selectItems = [];
    if (type == "insert") {
      ChHandleData.forEach((val) => {
        if (val.Title == title && !val.isedit) {
          val.isClick = value;
          if (value) {
            selectItems.push(val);
          }
        }
      });
    } else {
      ChHandleData.forEach((val) => {
        val.isClick = value;
      });
    }
    setChangeData([...ChHandleData]);
    setSelItems([...selectItems]);
    groupSplit([...ChHandleData]);
  };
  /* Life cycle of onload */
  useEffect(() => {
    getvendorDetails();
    // _getDefaultFunction();
  }, [isTrigger]);

  /* NormalPeoplePicker Function */
  const GetUserDetails = (filterText: any): any[] => {
    let result: any = props.directors.filter(
      (value, index, self) => index === self.findIndex((t) => t.ID === value.ID)
    );
    return result.filter((item) =>
      doesTextStartWith(item.text as string, filterText)
    );
  };

  const doesTextStartWith = (text: string, filterText: string): boolean => {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  };

  return isLoader ? (
    <Loader />
  ) : (
    <div style={{ width: "100%" }}>
      {/* Heading section */}
      <Label className={styles.HeaderLable}>Budget Tracking List</Label>
      {/* Dropdown and btn section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* Dropdown section */}
        <div
          style={{
            display: "flex",
            gap: "2%",
            width: "95%",
          }}
        >
          {/* Country dropdown section */}
          <div style={{ width: "15%" }}>
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
                setFilCountryDrop(text.text as string);
                setIsTrigger(!isTrigger);
                // FilterFunction();
              }}
            />
          </div>

          {/* Area dropdown section */}
          <div style={{ width: "15%" }}>
            <Label>Area</Label>
            <Dropdown
              styles={DropdownStyle}
              options={[...propDropValue.Area]}
              selectedKey={_getFilterDropValues(
                "Area",
                {
                  ...propDropValue,
                },
                filAreaDrop
              )}
              onChange={(e: any, text: IDrop) => {
                setFilAreaDrop(text.text as string);
                setIsTrigger(!isTrigger);
                // FilterFunction();
              }}
            />
          </div>

          {/* Category type dropdown section */}
          <div style={{ width: "8%" }}>
            <Label>Category Type</Label>
            <Dropdown
              styles={disabledDropdownStyles}
              options={[...propDropValue.Type]}
              selectedKey={_getFilterDropValues(
                "Type",
                {
                  ...propDropValue,
                },
                filTypeDrop
              )}
              onChange={(e: any, text: IDrop) => {
                setFilTypeDrop(text.text as string);
                setIsTrigger(!isTrigger);
                // FilterFunction();
              }}
            />
          </div>

          {/* Year dropdown section */}
          <div style={{ width: "8%" }}>
            <Label>Year</Label>
            <Dropdown
              styles={DropdownStyle}
              options={[...propDropValue.Period]}
              selectedKey={_getFilterDropValues(
                "Period",
                { ...propDropValue },
                filPeriodDrop
              )}
              onChange={(e: any, text: IDrop) => {
                _isCurrentYear = text.text === currentYear;
                setFilPeriodDrop(text.text as string);
                setIsTrigger(!isTrigger);
              }}
            />
          </div>

          {/* Over all refresh section */}
          <div style={{ display: "flex", alignItems: "end" }}>
            <div
              className={styles.refIcon}
              onClick={() => {
                _isCurrentYear = true;
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
        </div>

        {/* btn section */}
        {_isCurrentYear && !_isAdminView && (
          <div style={{ display: "flex", alignItems: "end", width: "5%" }}>
            <DefaultButton
              text="Submit"
              styles={buttonStyles}
              className={styles.export}
              style={{
                cursor: selItems.length ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                selItems.length && setIsModal(true);
              }}
            />
          </div>
        )}
      </div>
      {trackItems.length ? (
        trackItems.map((item, index: number) => {
          return (
            <Accordion
              className={styles.accordion}
              title={item.Title}
              defaultCollapsed={true}
              collapsedIcon={"ChevronRight"}
              expandedIcon={"ChevronDown"}
              key={index}
            >
              <div
                style={{
                  width: "100%",
                }}
              >
                {/* Table section */}
                <table
                  style={{
                    width: "100%",
                    marginBottom: "20px",
                    border: 0,
                  }}
                  className={styles.tableStyle}
                >
                  {/* table header section */}
                  <tr>
                    {_isCurrentYear && !_isAdminView && (
                      <th style={{ width: 20 }}>
                        <Checkbox
                          styles={{
                            root: {
                              justifyContent: "center",
                            },
                          }}
                          checked={item.isMasClick}
                          onChange={(e: any, isChecked: boolean) => {
                            // handleChecked(isChecked, index, null, "all");
                            let Checkdata = [...Changedata].filter((val) => {
                              return val.Title != item.Title;
                            });
                            if (
                              item.VendorDetails.every((ch) => {
                                return ch.isEdit == false;
                              }) &&
                              Checkdata.every((val) => val.isClick == false)
                            ) {
                              handleCheck(item.Title, isChecked, "insert");
                            }
                          }}
                        />
                      </th>
                    )}
                    <th style={{ width: 100 }}>Entry Date</th>
                    <th style={{ width: 100 }}>Item</th>
                    <th style={{ width: 100 }}>Cost</th>
                    <th style={{ width: 100 }}>Type</th>
                    <th style={{ width: 120 }}>Vendor</th>
                    <th style={{ width: 130 }}>Start Date</th>
                    <th style={{ width: 120 }}>To Date</th>
                    <th style={{ width: 120 }}>PO#</th>
                    <th style={{ width: 100 }}>PO Currency</th>
                    <th style={{ width: 100 }}>Invoice No</th>
                    {_isCurrentYear && !_isAdminView && (
                      <th style={{ width: 100 }}>Action</th>
                    )}
                  </tr>

                  {/* table body section */}
                  {item.VendorDetails.map(
                    (data: IBudTrackDistribution, i: number) => {
                      return (
                        <tr>
                          {_isCurrentYear && !_isAdminView && (
                            <td style={{ width: 20 }}>
                              <Checkbox
                                styles={{
                                  root: {
                                    justifyContent: "center",
                                  },
                                }}
                                checked={data.isClick}
                                onChange={(e: any, isChecked: boolean) => {
                                  // handleChecked(isChecked, index, i, "");
                                  let Checkdata = [...Changedata].filter(
                                    (val) => {
                                      return val.Title != item.Title;
                                    }
                                  );
                                  if (
                                    !data.isEdit &&
                                    Checkdata.every(
                                      (val) => val.isClick == false
                                    )
                                  ) {
                                    handleChange(data.ID, "isClick", isChecked);
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td style={{ width: 100 }}>
                            {moment(data.EntryDate).format("DD/MM/YYYY")}
                          </td>
                          <td style={{ width: 100 }}>
                            <div title={data.Item} className={styles.dripleDot}>
                              {data.Item.length > 15
                                ? `${data.Item.slice(0, 15)}...`
                                : data.Item}
                            </div>
                          </td>
                          <td style={{ width: 100 }}>{data.Cost}</td>
                          <td style={{ width: 100 }}>{data.Type}</td>
                          <td
                            style={{ width: 120, cursor: "pointer" }}
                            title={data.Vendor}
                          >
                            {data.Vendor}
                          </td>
                          <td style={{ width: 130 }}>
                            {data.isEdit ? (
                              <DatePicker
                                styles={dateStyles}
                                style={{ marginTop: 6 }}
                                placeholder="DD/MM/YYYY"
                                value={data.StartDate ? data.StartDate : null}
                                formatDate={(date) =>
                                  moment(date).format("DD/MM/YYYY")
                                }
                                onSelectDate={(e: Date) => {
                                  // curEditItem.StartDate = e;
                                  // setCurEditItem({ ...curEditItem });
                                  handleChange(data.ID, "StartDate", e);
                                }}
                              />
                            ) : data.StartDate ? (
                              moment(data.StartDate).format("DD/MM/YYYY")
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 120 }}>
                            {data.isEdit ? (
                              <DatePicker
                                styles={dateStyles}
                                style={{ marginTop: 6 }}
                                placeholder="DD/MM/YYYY"
                                value={data.ToDate ? data.ToDate : null}
                                formatDate={(date) =>
                                  moment(date).format("DD/MM/YYYY")
                                }
                                onSelectDate={(e: Date) => {
                                  // curEditItem.ToDate = e;
                                  // setCurEditItem({ ...curEditItem });
                                  handleChange(data.ID, "ToDate", e);
                                }}
                              />
                            ) : data.ToDate ? (
                              moment(data.ToDate).format("DD/MM/YYYY")
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 120 }}>
                            {data.isEdit ? (
                              <TextField
                                styles={textFieldStyle}
                                value={data.Po}
                                placeholder="Enter here"
                                onChange={(e: any, text) => {
                                  // curEditItem.Po = e.target.value.trimStart();
                                  // setCurEditItem({ ...curEditItem });
                                  handleChange(data.ID, "Po", text);
                                }}
                              />
                            ) : data.Po ? (
                              data.Po
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 100 }}>
                            {data.isEdit ? (
                              <TextField
                                styles={textFieldStyle}
                                value={data.PoCurrency}
                                placeholder="Enter here"
                                onChange={(e: any, text) => {
                                  // curEditItem.PoCurrency =
                                  //   e.target.value.trimStart();
                                  // setCurEditItem({ ...curEditItem });
                                  handleChange(data.ID, "PoCurrency", text);
                                }}
                              />
                            ) : data.PoCurrency ? (
                              data.PoCurrency
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 100 }}>
                            {data.isEdit ? (
                              <TextField
                                styles={textFieldStyle}
                                value={data.InvoiceNo}
                                placeholder="Enter here"
                                onChange={(e: any, text) => {
                                  // curEditItem.InvoiceNo =
                                  //   e.target.value.trimStart();
                                  // setCurEditItem({ ...curEditItem });
                                  handleChange(data.ID, "InvoiceNo", text);
                                }}
                              />
                            ) : data.InvoiceNo ? (
                              data.InvoiceNo
                            ) : (
                              "-"
                            )}
                          </td>
                          {_isCurrentYear && !_isAdminView && (
                            <td style={{ width: 100 }}>
                              {!data.isEdit ? (
                                <Icon
                                  iconName="Edit"
                                  style={{
                                    color: "blue",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    // _getEditItem(index, i, "edit");
                                    // isEditItem(data.ID, "edit");

                                    // setCurEditItem(data);
                                    if (!data.isClick) {
                                      handleChange(data.ID, "isEdit", true);
                                    }
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "start",
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
                                      handleUpdate(data);
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
                                      handleChange(data.ID, "isEdit", false);
                                      // isEditItem(data.ID, "cancel");
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    }
                  )}
                </table>

                {/* Over All Amount Details */}
                <div className={styles.indicatorSection}>
                  <div className={styles.indicatorWidth}>
                    <div className={styles.budgetIndicators}>
                      <div className={styles.leftDiv}>Budget</div>
                      <div
                        style={{
                          background:
                            "linear-gradient(to right, #20cbde, #fff)",
                        }}
                        className={styles.righttDiv}
                      >
                        {SPServices.format(
                          item.VendorDetails[0].OverAllBudgetCost
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.indicatorSection}>
                  <div className={styles.indicatorWidth}>
                    <div className={styles.budgetIndicators}>
                      <div className={styles.leftDiv}>PO Issued</div>
                      <div
                        style={{
                          background:
                            "linear-gradient(to right, #ded420, #fff)",
                        }}
                        className={styles.righttDiv}
                      >
                        {SPServices.format(
                          item.VendorDetails[0].OverAllPOIssuedCost
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.indicatorSection}>
                  <div className={styles.indicatorWidth}>
                    <div className={styles.budgetIndicators}>
                      <div className={styles.leftDiv}>Remaining Budget</div>
                      <div
                        style={{
                          background:
                            item.VendorDetails[0].OverAllRemainingCost >= 0
                              ? "linear-gradient(to right, #31de20, #fff)"
                              : "linear-gradient(to right, #e25e59, #f1f1f1)",
                        }}
                        className={styles.righttDiv}
                      >
                        {SPServices.format(
                          item.VendorDetails[0].OverAllRemainingCost
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Accordion>
          );
        })
      ) : (
        <div className={styles.noRecords}>No data found !!!</div>
      )}
      {/* Accordion section */}
      {/* <div>
        {trackItems.length ? (
          trackItems.map((item: IOverAllTrackItem, index: number) => {
            return (
              <Accordion
                className={styles.accordion}
                title={`${item.CategoryAcc} - ${item.CountryAcc} ( ${
                  item.Type
                } ) ~ AED ${SPServices.format(item.OverAllBudgetCost)}`}
                defaultCollapsed={true}
                collapsedIcon={"ChevronRight"}
                expandedIcon={"ChevronDown"}
                key={index}
              >
                <div
                  style={{
                    width: "100%",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      marginBottom: "20px",
                      border: 0,
                    }}
                    className={styles.tableStyle}
                  >
                    <tr>
                      {_isCurrentYear && !_isAdminView && (
                        <th style={{ width: 20 }}>
                          <Checkbox
                            styles={{
                              root: {
                                justifyContent: "center",
                              },
                            }}
                            checked={item.isMasterClick ? _isSelectAll : false}
                            onChange={(e: any, isChecked: boolean) => {
                              handleChecked(isChecked, index, null, "all");
                            }}
                          />
                        </th>
                      )}
                      <th style={{ width: 100 }}>Entry Date</th>
                      <th style={{ width: 100 }}>Item</th>
                      <th style={{ width: 100 }}>Cost</th>
                      <th style={{ width: 100 }}>Type</th>
                      <th style={{ width: 120 }}>Vendor</th>
                      <th style={{ width: 130 }}>Start Date</th>
                      <th style={{ width: 120 }}>To Date</th>
                      <th style={{ width: 120 }}>PO#</th>
                      <th style={{ width: 100 }}>PO Currency</th>
                      <th style={{ width: 100 }}>Invoice No</th>
                      {_isCurrentYear && !_isAdminView && (
                        <th style={{ width: 100 }}>Action</th>
                      )}
                    </tr>

                    {[].map((data: IBudTrackDistribution, i: number) => {
                      return (
                        <tr>
                          {_isCurrentYear && !_isAdminView && (
                            <td style={{ width: 20 }}>
                              <Checkbox
                                styles={{
                                  root: {
                                    justifyContent: "center",
                                  },
                                }}
                                checked={data.isClick}
                                onChange={(e: any, isChecked: boolean) => {
                                  handleChecked(isChecked, index, i, "");
                                }}
                              />
                            </td>
                          )}
                          <td style={{ width: 100 }}>
                            {moment(data.EntryDate).format("DD/MM/YYYY")}
                          </td>
                          <td style={{ width: 100 }}>
                            <div title={data.Item} className={styles.dripleDot}>
                              {data.Item.length > 15
                                ? `${data.Item.slice(0, 15)}...`
                                : data.Item}
                            </div>
                          </td>
                          <td style={{ width: 100 }}>{data.Cost}</td>
                          <td style={{ width: 100 }}>{data.Type}</td>
                          <td
                            style={{ width: 120, cursor: "pointer" }}
                            title={data.Vendor}
                          >
                            {data.Vendor}
                          </td>
                          <td style={{ width: 130 }}>
                            {data.isEdit ? (
                              <DatePicker
                                styles={dateStyles}
                                style={{ marginTop: 6 }}
                                placeholder="DD/MM/YYYY"
                                value={
                                  curEditItem.StartDate
                                    ? curEditItem.StartDate
                                    : null
                                }
                                formatDate={(date) =>
                                  moment(date).format("DD/MM/YYYY")
                                }
                                onSelectDate={(e: Date) => {
                                  curEditItem.StartDate = e;
                                  setCurEditItem({ ...curEditItem });
                                }}
                              />
                            ) : data.StartDate ? (
                              moment(data.StartDate).format("DD/MM/YYYY")
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 120 }}>
                            {data.isEdit ? (
                              <DatePicker
                                styles={dateStyles}
                                style={{ marginTop: 6 }}
                                placeholder="DD/MM/YYYY"
                                value={
                                  curEditItem.ToDate ? curEditItem.ToDate : null
                                }
                                formatDate={(date) =>
                                  moment(date).format("DD/MM/YYYY")
                                }
                                onSelectDate={(e: Date) => {
                                  curEditItem.ToDate = e;
                                  setCurEditItem({ ...curEditItem });
                                }}
                              />
                            ) : data.ToDate ? (
                              moment(data.ToDate).format("DD/MM/YYYY")
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 120 }}>
                            {data.isEdit ? (
                              <TextField
                                styles={textFieldStyle}
                                value={curEditItem.Po}
                                placeholder="Enter here"
                                onChange={(e: any) => {
                                  curEditItem.Po = e.target.value.trimStart();
                                  setCurEditItem({ ...curEditItem });
                                }}
                              />
                            ) : data.Po ? (
                              data.Po
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 100 }}>
                            {data.isEdit ? (
                              <TextField
                                styles={textFieldStyle}
                                value={curEditItem.PoCurrency}
                                placeholder="Enter here"
                                onChange={(e: any) => {
                                  curEditItem.PoCurrency =
                                    e.target.value.trimStart();
                                  setCurEditItem({ ...curEditItem });
                                }}
                              />
                            ) : data.PoCurrency ? (
                              data.PoCurrency
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ width: 100 }}>
                            {data.isEdit ? (
                              <TextField
                                styles={textFieldStyle}
                                value={curEditItem.InvoiceNo}
                                placeholder="Enter here"
                                onChange={(e: any) => {
                                  curEditItem.InvoiceNo =
                                    e.target.value.trimStart();
                                  setCurEditItem({ ...curEditItem });
                                }}
                              />
                            ) : data.InvoiceNo ? (
                              data.InvoiceNo
                            ) : (
                              "-"
                            )}
                          </td>
                          {_isCurrentYear && !_isAdminView && (
                            <td style={{ width: 100 }}>
                              {!data.isEdit ? (
                                <Icon
                                  iconName="Edit"
                                  style={{
                                    color: "blue",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    _getEditItem(index, i, "edit");
                                    // handleChange(data.ID, "isEdit", true);
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "start",
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
                                      // handleUpdate();
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
                                      _getEditItem(index, i, "cancel");
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </table>

                  <div className={styles.indicatorSection}>
                    <div className={styles.indicatorWidth}>
                      <div className={styles.budgetIndicators}>
                        <div className={styles.leftDiv}>Budget</div>
                        <div
                          style={{
                            background:
                              "linear-gradient(to right, #20cbde, #fff)",
                          }}
                          className={styles.righttDiv}
                        >
                          {SPServices.format(item.OverAllBudgetCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.indicatorSection}>
                    <div className={styles.indicatorWidth}>
                      <div className={styles.budgetIndicators}>
                        <div className={styles.leftDiv}>PO Issued</div>
                        <div
                          style={{
                            background:
                              "linear-gradient(to right, #ded420, #fff)",
                          }}
                          className={styles.righttDiv}
                        >
                          {SPServices.format(item.OverAllPOIssuedCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.indicatorSection}>
                    <div className={styles.indicatorWidth}>
                      <div className={styles.budgetIndicators}>
                        <div className={styles.leftDiv}>Remaining Budget</div>
                        <div
                          style={{
                            background:
                              item.OverAllRemainingCost >= 0
                                ? "linear-gradient(to right, #31de20, #fff)"
                                : "linear-gradient(to right, #e25e59, #f1f1f1)",
                          }}
                          className={styles.righttDiv}
                        >
                          {SPServices.format(item.OverAllRemainingCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Accordion>
            );
          })
        ) : (
          <div className={styles.noRecords}>No data found !!!</div>
        )}
      </div> */}
      {/* Modal box section */}
      {selItems.length ? (
        <Modal isOpen={isModal} isBlocking={false} styles={modalStyle}>
          {/* modal box header section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Label style={{ fontSize: 18, color: "#202945" }}>
              {selItems[0].Title}
            </Label>
            <Icon
              iconName="Cancel"
              style={{
                color: "red",
                fontSize: "20px",
                cursor: "pointer",
              }}
              onClick={() => {
                // _getEditItem(null, null, "cancel");
                setIsModal(false);
                handleCheck(selItems[0].Title, false, "clear");
              }}
            />
          </div>

          {/* modal box Details list section */}
          <DetailsList
            items={[...selItems]}
            columns={[..._selectedItemColumn]}
            styles={_DetailsListStyle}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />

          {/* modal box Budget Details section */}
          <div style={{ margin: "10px 0px" }}>
            <div className={styles.indicatorSection}>
              <div className={styles.indicatorWidth} style={{ width: "46%" }}>
                <div className={styles.budgetIndicators}>
                  <div className={styles.leftDiv} style={{ fontSize: 14 }}>
                    Budget
                  </div>
                  <div
                    style={{
                      background: "linear-gradient(to right, #20cbde, #fff)",
                      fontSize: 14,
                    }}
                    className={styles.righttDiv}
                  >
                    {SPServices.format(selItems[0].OverAllBudgetCost)}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.indicatorSection}>
              <div className={styles.indicatorWidth} style={{ width: "46%" }}>
                <div className={styles.budgetIndicators}>
                  <div className={styles.leftDiv} style={{ fontSize: 14 }}>
                    PO Issued
                  </div>
                  <div
                    style={{
                      background: "linear-gradient(to right, #ded420, #fff)",
                      fontSize: 14,
                    }}
                    className={styles.righttDiv}
                  >
                    {SPServices.format(selItems[0].OverAllPOIssuedCost)}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.indicatorSection}>
              <div className={styles.indicatorWidth} style={{ width: "46%" }}>
                <div className={styles.budgetIndicators}>
                  <div className={styles.leftDiv} style={{ fontSize: 14 }}>
                    Remaining Budget
                  </div>
                  <div
                    style={{
                      background:
                        selItems[0].OverAllRemainingCost >= 0
                          ? "linear-gradient(to right, #31de20, #fff)"
                          : "linear-gradient(to right, #e25e59, #f1f1f1)",
                      fontSize: 14,
                    }}
                    className={styles.righttDiv}
                  >
                    {SPServices.format(selItems[0].OverAllRemainingCost)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* modal box Footer section */}
          {/* People picker section */}
          <div className={styles.modalSubmitSection}>
            <NormalPeoplePicker
              inputProps={{ placeholder: "Insert person" }}
              onResolveSuggestions={GetUserDetails}
              itemLimit={10}
              styles={peoplePickerStyle}
              selectedItems={userDatas}
              onChange={(selectedUser: any): void => {
                if (selectedUser.length) {
                  let slctedUsers = [];
                  selectedUser.forEach((value: IUserDetail) => {
                    let authendication: boolean = [...slctedUsers].some(
                      (val: IUserDetail) =>
                        val.secondaryText === value.secondaryText
                    );
                    if (!authendication) {
                      slctedUsers.push(value);
                    }
                  });
                  setUserDatas([...slctedUsers]);
                } else {
                  setUserDatas([]);
                }
              }}
            />

            <DefaultButton
              text="Send"
              styles={buttonStyles}
              className={styles.export}
              style={{
                cursor: userDatas.length ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                userDatas.length && (setIsModal(false), handleSend());
              }}
            />
          </div>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default BudgetTrackingList;
