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
  IDropdownStyles,
  IDetailsListStyles,
  NormalPeoplePicker,
  IPersonaProps,
  IPeoplePickerItemSelectedStyles,
  DefaultButton,
  IButtonStyles,
} from "@fluentui/react";
import {
  IDrop,
  IDropdowns,
  ICurBudgetItem,
  ICurCategoryItem,
  IOverAllItem,
  IGroupUsers,
  IVendorProp,
  IUserDetail,
  IVendorNave,
} from "../../../globalInterFace/BudgetInterFaces";
import { Config } from "../../../globals/Config";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import SPServices from "../../../CommonServices/SPServices";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import styles from "./BudgetDistribution.module.scss";
import Vendor from "./Vendor";
import { _filterArray } from "../../../CommonServices/filterCommonArray";
import * as moment from "moment";
import VendorApprove from "./VendorApprove";
import VendorConfig from "./VendorConfig";
import Supplier from "./Supplier";
import VendorAdd from "./VendorAdd";

let propDropValue: IDropdowns;
let _isCurYear: boolean = true;
let isUserPermissions: IGroupUsers;
let _arrOfMaster: IOverAllItem[] = [];
let _isAdminView: boolean = false;
let _selID: number = null;
let _isManager: boolean = false;

const BudgetDistribution = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;
  propDropValue = { ...props.dropValue };
  let _curYear: string = moment().format("YYYY");
  isUserPermissions = { ...props.groupUsers };
  let _isApprover =
    props.groupUsers.isEnterpricesManager ||
    props.groupUsers.isInfraManager ||
    props.groupUsers.isSpecialManager ||
    props.groupUsers.isSuperAdmin;
  let _isEditor =
    props.groupUsers.isEnterpricesAdmin ||
    props.groupUsers.isInfraAdmin ||
    props.groupUsers.isSpecialAdmin ||
    props.groupUsers.isSuperAdmin ||
    props.groupUsers.isSuperAdminView;

  const _budgetPlanColumns: IColumn[] = [
    {
      key: "column1",
      name: "Category",
      fieldName: Config.BudgetListColumns.CategoryId.toString(),
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: ICurBudgetItem): any => {
        return item.Category;
      },
    },
    {
      key: "column2",
      name: "Area",
      fieldName: Config.BudgetListColumns.Area,
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: ICurBudgetItem): any => {
        return item.Area;
      },
    },
    {
      key: "column3",
      name: "Description",
      fieldName: Config.BudgetListColumns.Description,
      minWidth: 200,
      maxWidth: _isCurYear ? 250 : 300,
      onRender: (item: ICurBudgetItem): any => {
        return (
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
        return (
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
        return (
          <div style={{ color: "#E39C5A" }}>
            {SPServices.format(Number(item.BudgetProposed))}
          </div>
        );
      },
    },
    {
      key: "column6",
      name: "Budget Allocated",
      fieldName: Config.BudgetListColumns.BudgetAllocated,
      minWidth: 150,
      maxWidth: 150,
      onRender: (item: ICurBudgetItem): any => {
        return (
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
        return (
          <div style={{ color: "#AC455E" }}>
            {SPServices.format(Number(item.Used))}
          </div>
        );
      },
    },
    {
      key: "column8",
      name: "Remaining",
      minWidth: 100,
      maxWidth: 130,
      onRender: (item: any) => {
        return (
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
            {SPServices.format(Number(item.RemainingCost))}
          </div>
        );
      },
    },
    {
      key: "column9",
      name: "Action",
      minWidth: 70,
      maxWidth: 80,
      onRender: (item: any) => {
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <Icon
              iconName="EntryView"
              style={{
                color: "blue",
                fontSize: "16px",
                cursor: "pointer",
              }}
              onClick={() => {
                _getVendorNave("vendorapprove", item.ID);
              }}
            />
            {item.VendorStatus !== "Approved" && (
              <div style={{ display: "flex", gap: "10px" }}>
                {_isApprover && (
                  <Icon
                    iconName="PageArrowRight"
                    style={{
                      color: "blue",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      _getVendorNave("vendorconfig", null);
                      setSubCatDet(item);
                      _isManager = true;
                    }}
                  />
                )}
                {_isEditor && (
                  <Icon
                    iconName="Add"
                    style={{
                      color: "blue",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      _getVendorNave("vendorconfig", null);
                      setSubCatDet(item);
                      _isManager = false;
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // (isUserPermissions.isEnterpricesAdmin ||
  //   isUserPermissions.isInfraAdmin ||
  //   isUserPermissions.isSpecialAdmin) &&
  //   _budgetPlanColumns.pop();

  const [subCatDet, setSubCatDet] = useState([]);

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [filPeriodDrop, setFilPeriodDrop] = useState<string>(
    propDropValue.Period[propDropValue.Period.length - 1].text
  );
  const [filCountryDrop, setFilCountryDrop] = useState<string>("All");
  const [filTypeDrop, setFilTypeDrop] = useState<string>("All");
  const [filAreaDrop, setFilAreaDrop] = useState<string>("All");
  const [items, setItems] = useState<ICurBudgetItem[]>([]);
  const [group, setGroup] = useState<any[]>([]);
  const [detailColumn, setDetailColumn] = useState<IColumn[]>([]);
  const [userDatas, setUserDatas] = useState<IPersonaProps[]>([]);
  const [vendorDetails, setVendorDetails] = useState<IVendorProp>({
    ...Config.VendorProp,
  });
  const [isTrigger, setIsTrigger] = useState<boolean>(true);
  const [isVendorNave, setIsVendorNave] = useState<IVendorNave>({
    ...Config.VenNaveigation,
  });

  /* Style Section */
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
        height: items.length ? "58vh" : 20,
        overflowY: "auto",
        overflowX: "hidden",
      },
    },
  };

  const peoplePickerStyle: Partial<IPeoplePickerItemSelectedStyles> = {
    root: {
      width: "72%",
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

  const VendorBtnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      background: "#2580e0 !important",
      height: 33,
      width: "144px !important",
      borderRadius: 5,
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

  const VendorConfigBtnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      background: "#2580e0 !important",
      height: 33,
      width: "232px !important",
      borderRadius: 5,
      cursor: "pointer",
      marginLeft: "22px",
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
    setIsLoader(false);
    console.log(name, errMsg);
    alertify.error(name);
  };

  const _getDefaultFunction = (): void => {
    setIsLoader(true);
    setIsVendorNave({ ...Config.VenNaveigation });

    // if (
    //   isUserPermissions.isEnterpricesAdmin ||
    //   isUserPermissions.isInfraAdmin ||
    //   isUserPermissions.isSpecialAdmin
    // ) {
    //   _budgetPlanColumns.pop();
    // } else
    if (filPeriodDrop === _curYear) {
      _budgetPlanColumns;
    } else if (filPeriodDrop !== _curYear) {
      _budgetPlanColumns.pop();
    } else {
      _budgetPlanColumns;
    }

    setDetailColumn([..._budgetPlanColumns]);
    _getCategoryDatas();
  };

  const _getCategoryDatas = (): void => {
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
          FilterValue: filPeriodDrop,
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
              isAdmin: false,
              isManager: false,
            });
            i + 1 == resCate.length && _getFilterFunction([..._curCategory]);
          }
        } else {
          _getFilterFunction([..._curCategory]);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get category datas");
      });
  };

  const _getFilterFunction = (_filData: ICurCategoryItem[]): void => {
    let tempArr: ICurCategoryItem[] = [];

    tempArr = _filterArray(
      isUserPermissions,
      [..._filData],
      Config.Navigation.BudgetDistribution
    );

    if (tempArr.length) {
      if (filCountryDrop != "All" && tempArr.length) {
        tempArr = [...tempArr].filter((arr: ICurCategoryItem) => {
          return arr.CountryAcc.Text == filCountryDrop;
        });
      }
      if (filTypeDrop != "All" && tempArr.length) {
        tempArr = [...tempArr].filter((arr: ICurCategoryItem) => {
          return arr.Type == filTypeDrop;
        });
      }
      if (filAreaDrop != "All" && tempArr.length) {
        tempArr = [...tempArr].filter((arr: ICurCategoryItem) => {
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
      Filter: [
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
      Orderbydecorasc: false,
    })
      .then((resBudget: any) => {
        let _curItem: ICurBudgetItem[] = [];
        if (resBudget.length) {
          for (let i: number = 0; resBudget.length > i; i++) {
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
                : null,
              BudgetProposed: resBudget[i].BudgetProposed
                ? resBudget[i].BudgetProposed
                : null,
              Used: resBudget[i].Used ? resBudget[i].Used : null,
              ApproveStatus: resBudget[i].ApproveStatus
                ? resBudget[i].ApproveStatus
                : "",
              Description: resBudget[i].Description
                ? resBudget[i].Description
                : "",
              Comments: resBudget[i].Comments ? resBudget[i].Comments : "",
              RemainingCost: resBudget[i].RemainingCost
                ? resBudget[i].RemainingCost
                : null,
              isDeleted: resBudget[i].isDeleted,
              VendorStatus: resBudget[i].VendorStatus
                ? resBudget[i].VendorStatus
                : "",
              isEdit: false,
              isDummy: false,
              isAdmin: false,
              isManager: false,
            });
            i + 1 == resBudget.length &&
              _arrMasterCategoryData([..._arrCate], [..._curItem]);
          }
        } else {
          _arrMasterCategoryData([..._arrCate], [..._curItem]);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get budget datas");
      });
  };

  const _arrMasterCategoryData = (
    _arrCate: ICurCategoryItem[],
    _arrBudget: ICurBudgetItem[]
  ): void => {
    let _arrMasterCategory: IOverAllItem[] = [];
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
          isAdmin: _arrCate[i].isAdmin,
          isManager: _arrCate[i].isManager,
          subCategory: [],
        });
        i + 1 == _arrCate.length &&
          _prepareArrMasterDatas([..._arrMasterCategory], [..._arrBudget]);
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
          _arrBudget[j].isAdmin = _arrCateDatas[i].isAdmin;
          _arrBudget[j].isManager = _arrCateDatas[i].isManager;
          _arrBudget[j].OverAllBudgetCost = _arrCateDatas[i].OverAllBudgetCost;
          _arrBudget[j].OverAllRemainingCost =
            _arrCateDatas[i].OverAllRemainingCost;
          _arrBudget[j].OverAllPOIssuedCost =
            _arrCateDatas[i].OverAllPOIssuedCost;
          _arrCateDatas[i].subCategory.push({ ..._arrBudget[j] });
        }
        if (!isDatas && j + 1 == _arrBudget.length) {
          _arrOfMaster.push(_arrCateDatas[i]);
        }
      }
      i + 1 == _arrCateDatas.length && groups([..._arrOfMaster]);
    }
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
      groupsforDL([...reOrderedRecords], [..._filRecord]);
    }
  };

  const groupsforDL = (records: ICurBudgetItem[], arrCate: IOverAllItem[]) => {
    let newRecords: any[] = [];
    let varGroup: any[] = [];
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
      });
      _recordsLength += arr.subCategory.length;
    });
    newRecords.forEach((ur: any, index: number) => {
      let recordLength: number = records.filter((arr: ICurBudgetItem) => {
        return (
          arr.CateId === ur.ID && arr.Type === ur.Type && arr.Area === ur.Area
        );
      }).length;
      let _totalAmount: string = ur.OverAllBudgetCost
        ? ur.OverAllBudgetCost.toString()
        : ur.TotalProposed
        ? ur.TotalProposed.toString()
        : "0";
      varGroup.push({
        key: ur.Category,
        name: ur.Country
          ? `${
              ur.Category +
              " - " +
              ur.Country +
              " ( " +
              ur.Type +
              " ) ~ AED " +
              SPServices.format(Number(_totalAmount))
            }`
          : ur.Category,
        startIndex: ur.indexValue,
        count: recordLength,
      });
      if (index == newRecords.length - 1) {
        setItems([...records]);
        setGroup([...varGroup]);
        setIsLoader(false);
      }
    });
  };

  const addAdminData = (data: string): void => {
    SPServices.SPAddItem({
      Listname: Config.ListNames.AdminList,
      RequestJSON: {
        AdminData: data,
      },
    })
      .then((res: any) => {
        alertify.success("Admins added successfully");
        setUserDatas([]);
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Add admin datas");
      });
  };

  const _getVendorNave = (type: string, id: number): void => {
    if (type === "vendorcreate") {
      setIsVendorNave({ ...Config.VenNaveigation, isVendorCreate: true });
    } else if (type === "vendorconfig") {
      setIsVendorNave({ ...Config.VenNaveigation, isVendorConfig: true });
    } else if (type === "vendorapprove") {
      _selID = id;
      setIsVendorNave({ ...Config.VenNaveigation, isVendorApprove: true });
    } else {
      setIsVendorNave({ ...Config.VenNaveigation });
    }

    setIsLoader(true);
    _getCategoryDatas();
  };

  /* Life cycle of onload */
  useEffect(() => {
    _getDefaultFunction();
  }, [isTrigger]);

  /* NormalPeoplePicker Function */
  const GetUserDetails = (filterText: any): any[] => {
    let result: any = props.adminUsers.filter(
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
  ) : isVendorNave.isVendorApprove ? (
    <VendorApprove
      _getVendorNave={_getVendorNave}
      groupUsers={props.groupUsers}
      dropValue={props.dropValue}
      _selID={_selID}
    />
  ) : isVendorNave.isVendorConfig ? (
    <VendorAdd
      _getVendorNave={_getVendorNave}
      _getDefaultFunction={_getDefaultFunction}
      groupUsers={props.groupUsers}
      dropValue={props.dropValue}
      subCatDet={subCatDet}
      _isManager={_isManager}
    />
  ) : // <VendorConfig
  //   _getVendorNave={_getVendorNave}
  //   _getDefaultFunction={_getDefaultFunction}
  //   groupUsers={props.groupUsers}
  //   dropValue={props.dropValue}
  // />
  isVendorNave.isVendorCreate ? (
    <Supplier
      _getVendorNave={_getVendorNave}
      groupUsers={props.groupUsers}
      dropValue={props.dropValue}
      currentUser={props.currentUser}
    />
  ) : true ? (
    <div style={{ width: "100%" }}>
      {/* Heading section */}
      <Label className={styles.HeaderLable}>Budget Distribution</Label>
      {/* Dropdown and btn section */}
      <div className={styles.filterSection}>
        {/* Left side section */}
        <div className={styles.filters}>
          {/* Country section */}
          <div style={{ width: "26%" }}>
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
          <div style={{ width: "26%" }}>
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
          <div style={{ width: "10%" }}>
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
          <div style={{ width: "10%" }}>
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

        {/* btn and people picker section */}
        {!_isAdminView &&
          filPeriodDrop === _curYear &&
          (isUserPermissions.isInfraManager ||
            isUserPermissions.isEnterpricesManager ||
            isUserPermissions.isSpecialManager ||
            isUserPermissions.isSuperAdmin) && (
            <div style={{ display: "flex", alignItems: "end", width: "24%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                {/* People picker section */}
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

                {/* btn section */}
                <button
                  className={styles.btns}
                  onClick={() => {
                    userDatas.length &&
                      addAdminData(JSON.stringify([...userDatas]));
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}

        {/* vendor config btn section */}
        {/* {!_isAdminView &&
            filPeriodDrop === _curYear &&
            (isUserPermissions.isInfraManager ||
              isUserPermissions.isEnterpricesManager ||
              isUserPermissions.isSpecialManager ||
              isUserPermissions.isInfraAdmin ||
              isUserPermissions.isSpecialAdmin ||
              isUserPermissions.isEnterpricesAdmin ||
              isUserPermissions.isSuperAdmin) && (
              <DefaultButton
                text="Vendor Configuration"
                styles={VendorConfigBtnStyle}
                onClick={() => {
                  _getVendorNave("vendorconfig", null);
                }}
              />
            )} */}

        {/* vendor create btn section */}
        {!_isAdminView &&
          filPeriodDrop === _curYear &&
          (isUserPermissions.isInfraManager ||
            isUserPermissions.isEnterpricesManager ||
            isUserPermissions.isSpecialManager ||
            isUserPermissions.isInfraAdmin ||
            isUserPermissions.isEnterpricesAdmin ||
            isUserPermissions.isSpecialAdmin ||
            isUserPermissions.isSuperAdmin) && (
            <div style={{ marginLeft: 20 }}>
              <DefaultButton
                text="Vendor Create"
                style={{
                  cursor: group.length ? "pointer" : "not-allowed",
                }}
                styles={VendorBtnStyle}
                onClick={() => {
                  group.length && _getVendorNave("vendorcreate", null);
                }}
              />
            </div>
          )}
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
    </div>
  ) : (
    <Vendor
      props={props}
      _masDistribution={[..._arrOfMaster]}
      vendorDetails={vendorDetails}
      setVendorDetails={setVendorDetails}
    />
  );
};

export default BudgetDistribution;
