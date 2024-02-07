import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./VendorAdd.module.scss";
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
  Selection,
  SelectionMode,
  SearchBox,
  TextField,
  IDropdownOption,
  ITextFieldStyles,
  Checkbox,
} from "@fluentui/react";
import SPServices from "../../../CommonServices/SPServices";
import {
  IAttach,
  IBudList,
  ICateList,
  IUpdateJSON,
  IVenDrop,
  IVenList,
  IVendorData,
} from "../../../globalInterFace/BudgetInterFaces";
import Loader from "./Loader";
import { Config } from "../../../globals/Config";
import { Item } from "@pnp/sp/items";

let TextFieldVal: boolean = false;

const VendorAdd = (props: any) => {
  console.log("props", props);

  // Local Variables
  let TextFieldConfirm: boolean =
    props.groupUsers.isEnterpricesAdmin ||
    props.groupUsers.isInfraAdmin ||
    props.groupUsers.isSpecialAdmin
      ? false
      : true;

  // Columns
  const _VendorColumn: IColumn[] = [
    // {
    //   key: "column1",
    //   name: "Vendor Name",
    //   fieldName: "VendorName",
    //   minWidth: 130,
    //   maxWidth: 130,
    //   onRender: (item: IVendorData, index: number): any => {
    //     return (
    //       <div>
    //         <Checkbox></Checkbox>
    //       </div>
    //     );
    //   },
    // },
    {
      key: "column1",
      name: "Vendor Name",
      fieldName: "VendorName",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData, index: number): any => {
        return TextFieldConfirm ? (
          item.VendorName
        ) : (
          <Dropdown
            placeholder="Please select"
            styles={DropdownStyle}
            options={[...vendorDropName]}
            selectedKey={item.VendorConfig}
            onChange={(e: any, text: any) => {
              _handleOnChange(item, text, "vendorName", index);
            }}
          />
        );
      },
    },
    // {
    //   key: "column2",
    //   name: "Master Category",
    //   fieldName: "Category",
    //   minWidth: 130,
    //   maxWidth: 130,
    //   // onRender: (item: IVendorData) => {
    //   //   return TextFieldConfirm ? (
    //   //     item.Category
    //   //   ) : (
    //   //     <TextField
    //   //       value={item.Category}
    //   //       onChange={(e: any, text: any) =>
    //   //         _handleOnChange(item, text, "Category")
    //   //       }
    //   //     />
    //   //   );
    //   // },
    // },
    {
      key: "column3",
      name: "Category",
      fieldName: "subCategory",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: IVendorData) => {
      //   return TextFieldConfirm ? (
      //     item.subCategory
      //   ) : (
      //     <TextField
      //       value={item.subCategory}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "subCategory")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column4",
      name: "Area",
      fieldName: "Area",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: IVendorData) => {
      //   return TextFieldConfirm ? (
      //     item.Area
      //   ) : (
      //     <TextField
      //       value={item.Area}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "Area")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column5",
      name: "Country",
      fieldName: "Country",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: IVendorData) => {
      //   return TextFieldConfirm ? (
      //     item.Country
      //   ) : (
      //     <TextField
      //       value={item.Country}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "Country")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column6",
      name: "Type",
      fieldName: "Type",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: IVendorData) => {
      //   return TextFieldConfirm ? (
      //     item.Type
      //   ) : (
      //     <TextField
      //       value={item.Type}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "Type")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column7",
      name: "Description",
      fieldName: "Description",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData, index: number) => {
        return TextFieldConfirm ? (
          item.Description
        ) : (
          <TextField
            value={item.Description}
            onChange={(e: any, text: any) =>
              _handleOnChange(item, text, "Description", index)
            }
          />
        );
      },
    },
    {
      key: "column8",
      name: "Pricing - Excluding VAT in AED",
      fieldName: "Price",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: any, index: number): any => {
        return TextFieldConfirm ? (
          isEdit.edit && isEdit.id === item.ID ? (
            <TextField
              value={item.Price ? item.Price.toString() : ""}
              onChange={(e: any, value: any) => {
                if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                  let tempData = MData.filter(
                    (value: IVendorData) => value.ID === item.ID
                  );
                  tempData[0].Price = value;
                  SPServices.numberFormat(value);

                  //   _handleOnChange(item, value, "Price");
                }
              }}
            />
          ) : (
            item.Price
          )
        ) : (
          <TextField
            value={item.Price}
            onChange={(e: any, text: any) =>
              _handleOnChange(item, text, "Price", index)
            }
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
      onRender: (item: IVendorData, index: number) => {
        return TextFieldConfirm ? (
          isEdit.edit && isEdit.id === item.ID ? (
            <TextField
              value={item.Payment ? item.Payment : ""}
              onChange={(e: any, text: any) => {
                // _handleOnChange(item, text, "RequestedAmount")
              }}
            />
          ) : (
            item.Payment
          )
        ) : (
          <TextField
            value={item.Payment}
            onChange={(e: any, text: any) =>
              _handleOnChange(item, text, "Payment", index)
            }
          />
        );
      },
    },
    {
      key: "column10",
      name: "Delivery",
      fieldName: "Delivery",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData, index: number) => {
        return TextFieldConfirm ? (
          item.Delivery
        ) : (
          <TextField
            value={item.Delivery}
            onChange={(e: any, text: any) =>
              _handleOnChange(item, text, "Delivery", index)
            }
          />
        );
      },
    },
    {
      key: "column11",
      name: "Last Year Cost in AED",
      fieldName: "LastYearCost",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: any): any => {
      //   return TextFieldConfirm ? (
      //     SPServices.format(item.LastYearCost)
      //   ) : (
      //     <TextField
      //       value={item.LastYearCost}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "LastYearCost")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column12",
      name: "Last year PO#",
      fieldName: "LastYearPO",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: IVendorData) => {
      //   return TextFieldConfirm ? (
      //     item.LastYearPO
      //   ) : (
      //     <TextField
      //       value={item.LastYearPO}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "LastYearPO")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column13",
      name: "Recommended Supplier",
      fieldName: "Recommended",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: IVendorData, i: number) => {
      //   return TextFieldConfirm ? (
      //     item.Recommended
      //   ) : (
      //     <TextField
      //       value={item.Recommended}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "Recommended")
      //       }
      //     />
      //   );
      // },
    },
    {
      key: "column14",
      name: "Requested amount in AED",
      fieldName: "RequestedAmount",
      minWidth: 130,
      maxWidth: 130,
      // onRender: (item: any): any => {
      //   return TextFieldConfirm ? (
      //     SPServices.format(item.RequestedAmount)
      //   ) : (
      //     <TextField
      //       value={item.RequestedAmount}
      //       onChange={(e: any, text: any) =>
      //         _handleOnChange(item, text, "RequestedAmount")
      //       }
      //     />
      //   );
      // },
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
    {
      key: "column16",
      name: "Action",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData, index: number) => {
        let showIcon = FData.some(
          (FValue: IVendorData) => FValue.ID === item.ID && item.ID
        );
        return true ? (
          <div
            style={{
              display: "flex",
              gap: "6%",
            }}
          >
            <Icon
              iconName="Delete"
              style={{
                color: "red",
                fontSize: "16px",
                cursor: "pointer",
              }}
              onClick={() => {
                setIsDeleteModal({ isDelete: true, Id: item.ID, index: index });

                // setIsEdit({ id: item.ID, edit: true, confirm: false })
              }}
            />
          </div>
        ) : null;
      },
    },
  ];

  // Variables
  let datas: IVendorData[] = [
    {
      Area: "",
      Attachments: [],
      Category: "",
      Comment: "",
      Country: "",
      CountryId: null,
      Delivery: "",
      Description: "",
      ID: null,
      index: null,
      LastYearCost: 0.0,
      LastYearPO: "",
      Payment: "",
      Price: 0,
      Recommended: "",
      RequestedAmount: 0.0,
      Status: "Pending",
      Type: "",
      VendorName: "",
      Year: "",
      VendorConfig: null,
    },
  ];

  // Use States

  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [Error, setError] = useState("");
  const [MData, setMData] = useState([]);
  const [FData, setFData] = useState<IVendorData[]>([]);
  const [isAppRejModal, setIsAppRejModal] = useState<any>({
    Flag: false,
    Name: "",
    Value: "",
    error: false,
  });
  const [isEdit, setIsEdit] = useState({
    id: null,
    confirm: false,
    edit: false,
  });
  const [vendorDropName, setVendorDropName] = useState([]);
  const [vendorValue, setVendorValue] = useState<IDropdownOption>();
  const [vendorDetails, setVendorDetails] = useState([]);
  const [MasCatUniData, setMasCatUniData] = useState([]);
  const [SubCatUniData, setSubCatUniData] = useState([]);
  const [selItems, setSelItems] = useState([]);
  const [isDeleteModal, setIsDeleteModal] = useState({
    isDelete: false,
    Id: null,
    index: null,
  });
  // Styles
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
        height: "auto",
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
      cursor: "pointer",
      //   cursor: _calArray.length ? "pointer" : "not-allowed",
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

  // const modalStyles: Partial<IModalStyles> = {
  //   main: {
  //     width: "20%",
  //     minHeight: 128,
  //     background: "#f7f9fa",
  //     padding: 20,
  //     height: "auto",
  //     borderRadius: 4,
  //     // display: "flex",
  //     // alignItems: "center",
  //     // justifyContent: "center",
  //     // textAlign: "center",
  //     overflow: "unset",
  //   },
  // };
  const modalStyles = {
    root: {
      ".ms-Dialog-main": {
        width: "25%",
        maxHeight: "fit-content",
        // padding: "20px",
      },
    },
  };
  const deleteModalStyles: Partial<IModalStyles> = {
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
  const multilineTextFieldStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      "::after": {
        border: "none",
      },
    },
    root: {
      width: "90%",
      textarea: {
        resize: "none",
      },
      ".ms-Label": {
        color: "#323130 !important",
      },
      ".ms-TextField-field": {
        background: "transparent !important",
        color: "#323130 !important",
        border: "1px solid #605e5c !important",
        height: "60px",
      },
      ".ms-TextField-fieldGroup": {
        border: "none !important",
      },
    },
  };

  const errmultilineTextFieldStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      "::after": {
        border: "none",
      },
    },
    root: {
      width: "90%",
      textarea: {
        resize: "none",
      },
      ".ms-Label": {
        color: "#323130 !important",
      },
      ".ms-TextField-field": {
        background: "transparent !important",
        color: "#323130 !important",
        border: "1px solid red !important",
        height: "60px",
      },
      ".ms-TextField-fieldGroup": {
        border: "none !important",
      },
    },
  };
  const TextFieldStyle = {
    root: {
      ".ms-TextField-field": {
        border: "1px solid #323130 !important",
        background: "#fff !important",
      },
    },
  };

  // All Functions
  const GetErrFunctions = (type: string) => {
    alert(type);
  };

  const AllFunctions = () => {
    setIsLoader(false);
    GetMasterCategory();
    // GetAllData();
  };

  const GetMasterCategory = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryList,
      Select: "*, MasterCategory/ID, MasterCategory/Title",
      Expand: "MasterCategory",
    })
      .then((res: any) => {
        let MasterID: number;
        let tempData = [];

        for (let i = 0; res.length > i; i++) {
          for (let j = 0; props.subCatDet.length > j; j++) {
            if (res[i].MasterCategoryId === props.dropValue.masterCate[j].key)
              //   MasterID = props.dropValue.masterCate[j].key;
              tempData.push({
                ID: res[i].MasterCategory.ID,
                Title: res[i].MasterCategory.Title,
              });
          }
        }

        GetBudgetData(tempData);
      })
      .catch(() => GetErrFunctions("Master Category get error"));
  };

  const GetBudgetData = (masterCategory: any) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.BudgetList,
    })
      .then((res: any) => {
        let budgetData = [];

        let budgetID = res.filter((value: any) => {
          return value.CategoryId === props.subCatDet.CateId;
        });

        budgetID.forEach((value: any) => {
          budgetData.push(value.ID);
        });

        GetAllData(masterCategory, budgetData);
      })
      .catch(() => GetErrFunctions("Budget data get error"));
  };

  const GetAllData = (masterCategory, budgetData) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.VendorConfig,
      Select:
        "*, Category/ID, Category/Title, Budget/ID, Budget/Description, Country/ID, Country/Title, AttachmentFiles",
      Expand: "Category, Budget, Country, AttachmentFiles",
      //   Filter: [
      //     {
      //       FilterKey: "CountryId",
      //       Operator: "eq",
      //       FilterValue: props.subCatDet.CounId,
      //     },
      //     {
      //       FilterKey: "Area",
      //       Operator: "eq",
      //       FilterValue: props.subCatDet.Area,
      //     },
      //   ],
    })
      .then((res: any) => {
        let vendorNameArray = [];
        let VendorDetailsData: any[] = [];

        if (res.length)
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

            vendorNameArray.push({
              text: res[i].VendorName ? res[i].VendorName : "",
              key: res[i].ID ? res[i].ID : null,
            });

            VendorDetailsData.push({
              ID: res[i].ID,
              Description: res[i].Title ? res[i].Title : "-",
              Category:
                masterCategory.length > 0 && masterCategory[0].Title
                  ? masterCategory[0].Title
                  : "-",
              subCategory: props.subCatDet.Category,
              Type: res[i].CategoryType ? res[i].CategoryType : "-",
              VendorName: res[i].VendorName ? res[i].VendorName : "-",
              Payment: res[i].Payment ? res[i].Payment : "-",
              Delivery: res[i].Delivery ? res[i].Delivery : "-",
              LastYearPO: res[i].LastYearPO ? res[i].LastYearPO : "-",
              Recommended: res[i].Recommended ? res[i].Recommended : "-",
              Year: res[i].Year ? res[i].Year : "-",
              Status: res[i].Status ? res[i].Status : "-",
              Comment: res[i].Comment ? res[i].Comment : "-",
              Area: res[i].Area ? res[i].Area : "-",
              Country: res[i].CountryId ? res[i].Country.Title : "-",
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
              BudgetId: budgetData,
              CategoryId: props.subCatDet.CateId,
              VendorConfig: null,
            });
          }

        setVendorDropName([...vendorNameArray]);
        setMData([...VendorDetailsData]);
        GetVendorDetails(masterCategory, budgetData);
      })
      .catch((res: any) => {
        GetErrFunctions("Category List Reading error");
      });
  };

  const GetVendorDetails = (masterCategory, budgetData) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.VendorDetails,
      Select:
        "*, Category/ID, Category/Title, Category/OverAllBudgetCost, Category/OverAllPOIssuedCost, Category/OverAllRemainingCost, Budget/ID, Budget/Description, Budget/RemainingCost, Budget/BudgetAllocated, Budget/Used, Country/ID, VendorConfig/Title,Country/Title, AttachmentFiles",
      Expand: "Category, Budget, Country, AttachmentFiles,VendorConfig",
      Filter: [
        // {
        //   FilterKey: "CountryId",
        //   Operator: "eq",
        //   FilterValue: props.subCatDet.CounId,
        // },
        // {
        //   FilterKey: "Area",
        //   Operator: "eq",
        //   FilterValue: props.subCatDet.Area,
        // },
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
        {
          FilterKey: "BudgetId",
          Operator: "eq",
          FilterValue: props.subCatDet.ID,
        },
        {
          FilterKey: "Status",
          Operator: "eq",
          FilterValue: TextFieldConfirm ? "Pending" : "Rejected",
        },
      ],
    })
      .then((res: any) => {
        console.log("vendor", res);

        let VendorDetailsData: any[] = [];
        let BudUniqData: any[] = [];
        let CatUniData: any[] = [];
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
            if (
              res[i].BudgetId &&
              [...BudUniqData].every((val) => val.ID != res[i].BudgetId)
            ) {
              BudUniqData.push({
                ID: res[i].BudgetId,
                RemainingCost: res[i].Budget.RemainingCost
                  ? res[i].Budget.RemainingCost
                  : 0,
                BudgetAllocated: res[i].Budget.BudgetAllocated
                  ? res[i].Budget.BudgetAllocated
                  : 0,
                Used: res[i].Budget.Used ? res[i].Budget.Used : 0,
              });
            }
            if (
              res[i].CategoryId &&
              [...CatUniData].every((val) => val.ID != res[i].CategoryId)
            ) {
              CatUniData.push({
                ID: res[i].CategoryId,
                OverAllRemainingCost: res[i].Category.OverAllRemainingCost
                  ? res[i].Category.OverAllRemainingCost
                  : 0,

                OverAllBudgetCost: res[i].Category.OverAllBudgetCost
                  ? res[i].Category.OverAllBudgetCost
                  : 0,
                OverAllPOIssuedCost: res[i].Category.OverAllPOIssuedCost
                  ? res[i].Category.OverAllPOIssuedCost
                  : 0,
              });
            }
            VendorDetailsData.push({
              ID: res[i].ID,
              Description: res[i].Title ? res[i].Title : "-",
              Category:
                masterCategory.length > 0 && masterCategory[0].Title
                  ? masterCategory[0].Title
                  : "-",
              subCategory: props.subCatDet.Category,
              Type: res[i].CategoryType ? res[i].CategoryType : "-",
              VendorName: res[i].VendorName ? res[i].VendorName : "-",
              Payment: res[i].Payment ? res[i].Payment : "-",
              Delivery: res[i].Delivery ? res[i].Delivery : "-",
              LastYearPO: res[i].LastYearPO ? res[i].LastYearPO : "-",
              Recommended: res[i].Recommended ? res[i].Recommended : "-",
              Year: res[i].Year ? res[i].Year : "-",
              Status: res[i].Status ? res[i].Status : "-",
              Comment: res[i].Comment ? res[i].Comment : "-",
              Area: res[i].Area ? res[i].Area : "-",
              Country: res[i].CountryId ? res[i].Country.Title : "-",
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
              BudgetId: res[i].BudgetId ? res[i].BudgetId : null,
              CategoryId: props.subCatDet.CateId,
              VendorConfig: res[i].VendorConfigId
                ? res[i].VendorConfigId
                : null,
            });
          }

          // setVendorDropName([...vendorNameArray]);
          // setMData([...VendorDetailsData]);
          setSubCatUniData([...BudUniqData]);
          setMasCatUniData([...CatUniData]);
          setFData([...VendorDetailsData]);
          console.log("butget", BudUniqData);
          console.log("category", CatUniData);
        } else {
          setFData([]);
        }
      })
      .catch((res: any) => {
        GetErrFunctions("Vendor List Reading error");
        console.log("vendorerr", res);
      });
  };

  const _handleOnChange = (
    value: IVendorData,
    textValue: any,
    name: string,
    index: number
  ) => {
    const tempFData = [...FData];
    const tempMData = [...MData];

    if (name === "vendorName") {
      // setVendorValue(textValue.text);
      let VFilter = tempMData.filter((Mvalue: any) => {
        return Mvalue.ID === textValue.key;
      })[0];
      // if (tempFData[index].ID) {
      //   tempFData[index] = [...FilterData][0];
      //   setFData(tempFData);
      // } else {

      // }
      let FilterData = { ...VFilter };
      FilterData.ID = tempFData[index].ID;
      FilterData.Comment = tempFData[index].Comment;
      FilterData.VendorConfig = textValue.key;
      FilterData.Status = "Pending";
      tempFData[index] = FilterData;
      setFData(tempFData);
      // let VendorDrop = [...vendorDropName];
      // let VendorDrpDown = [];
      // tempFData.forEach((val) => {
      //   if (VendorDrop.every((value) => value.key != val.ID)) {
      //     VendorDrpDown.push(value);
      //   }
      // });
      // setVendorDropName([...VendorDrpDown]);

      // if (!(FData.length > 1)) {
      //   setFData(FilterData);
      // } else {
      //   FData.pop();
      //   setFData([...FData, ...FilterData]);
      // }
      // let TextIndex = tempFData.findIndex(
      //   (temValue: IVendorData) => temValue.ID === value.ID
      // );

      // tempFData[TextIndex].VendorConfig = textValue.key;
      // setFData([...tempFData]);
    }
    // else if (name === "Category") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].Category = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "subCategory") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].subCategory = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "Area") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].Area = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "Country") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].Country = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "Type") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].Type = textValue;
    //   setFData([...tempFData]);
    // }
    else if (name === "Description") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[index].Description = textValue;
      setFData([...tempFData]);
    } else if (name === "Price") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[index].Price = textValue;
      setFData([...tempFData]);
    } else if (name === "Payment") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[index].Payment = textValue;
      setFData([...tempFData]);
    } else if (name === "Delivery") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[index].Delivery = textValue;
      setFData([...tempFData]);
    }
    //  else if (name === "LastYearCost") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].LastYearCost = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "LastYearPO") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].LastYearPO = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "RequestedAmount") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].RequestedAmount = textValue;
    //   setFData([...tempFData]);
    // } else if (name === "Recommended") {
    //   let TextIndex = tempFData.findIndex(
    //     (temValue: IVendorData) => temValue.ID === value.ID
    //   );

    //   tempFData[TextIndex].Recommended = textValue;
    //   setFData([...tempFData]);
    // }

    //   let BalanceVendorName = vendorDropName.filter((vendorName) => {
    //     return !(vendorName.key === value.key);
    //   });

    //   if (TextFieldVal) {
    //     setVendorDropName([...BalanceVendorName]);
    //     TextFieldVal = false;
    //   }
  };
  const Validation = () => {
    let duplicateCheck = [];
    let validatedata = [...FData].filter((val) => {
      return val.VendorConfig != null;
    });
    validatedata.forEach((val) => {
      if (
        duplicateCheck.every((check) => {
          return check.VendorConfig != val.VendorConfig;
        })
      ) {
        duplicateCheck.push(val);
      }
    });
    return validatedata.length == duplicateCheck.length ? true : false;
  };
  const _UpdateData = () => {
    if (Validation()) {
      setError("");
      let AddVendorData = [];
      let UpdateVendorData = [];

      FData.forEach((value: any) => {
        if (value.ID && value.VendorConfig) {
          UpdateVendorData.push({
            ID: value.ID,
            Title: value.Description,
            CategoryType: value.Type,
            VendorName: value.VendorName,
            Payment: value.Payment,
            Delivery: value.Delivery,
            LastYearPO: value.LastYearPO,
            Recommended: value.Recommended,
            Year: value.Year,
            Status: "Pending",
            Comment: value.Comment,
            Area: value.Area,
            CountryId: value.CountryId,
            Price: value.Price,
            LastYearCost: value.LastYearCost,
            RequestedAmount: value.RequestedAmount,
            BudgetId: props.subCatDet.ID,
            CategoryId: value.CategoryId,
            VendorConfigId: value.VendorConfig,
          });
        } else if (value.VendorConfig) {
          AddVendorData.push({
            Title: value.Description,
            CategoryType: value.Type,
            VendorName: value.VendorName,
            Payment: value.Payment,
            Delivery: value.Delivery,
            LastYearPO: value.LastYearPO,
            Recommended: value.Recommended,
            Year: value.Year,
            Status: "Pending",
            Comment: value.Comment,
            Area: value.Area,
            CountryId: value.CountryId,
            Price: value.Price,
            LastYearCost: value.LastYearCost,
            RequestedAmount: value.RequestedAmount,
            BudgetId: props.subCatDet.ID,
            CategoryId: value.CategoryId,
            VendorConfigId: value.VendorConfig,
          });
        }
      });

      if (AddVendorData.length) {
        SPServices.batchInsert({
          ListName: Config.ListNames.VendorDetails,
          responseData: AddVendorData,
        })
          .then((res: any) => {
            if (UpdateVendorData.length) {
              SPServices.batchUpdate({
                ListName: Config.ListNames.VendorDetails,
                responseData: UpdateVendorData,
              })
                .then((res: any) => {
                  SPServices.SPUpdateItem({
                    Listname: Config.ListNames.BudgetList,
                    ID: UpdateVendorData[0].BudgetId,
                    RequestJSON: { VendorStatus: "Pending" },
                  })
                    .then((budUpdate) => {
                      props._getVendorNave("");
                    })
                    .catch((err) => console.log(err));
                })
                .catch(() => GetErrFunctions("Update error"));
            } else {
              SPServices.SPUpdateItem({
                Listname: Config.ListNames.BudgetList,
                ID: AddVendorData[0].BudgetId,
                RequestJSON: { VendorStatus: "Pending" },
              })
                .then((budUpdate) => {
                  props._getVendorNave("");
                })
                .catch((err) => console.log(err));
            }
          })
          .catch(() => GetErrFunctions("Update error"));
      } else if (UpdateVendorData.length) {
        SPServices.batchUpdate({
          ListName: Config.ListNames.VendorDetails,
          responseData: UpdateVendorData,
        })
          .then((res: any) => {
            SPServices.SPUpdateItem({
              Listname: Config.ListNames.BudgetList,
              ID: UpdateVendorData[0].BudgetId,
              RequestJSON: { VendorStatus: "Pending" },
            })
              .then((budUpdate) => {
                props._getVendorNave("");
              })
              .catch((err) => console.log(err));
          })
          .catch(() => GetErrFunctions("Update error"));
      } else {
        props._getVendorNave("");
      }
    } else {
      setError("Please check");
    }
  };

  const itemSelection = new Selection({
    onSelectionChanged: () => {
      const selectedItem: any[] = itemSelection.getSelection();
      setSelItems(selectedItem);
    },
  });

  const handleCal = (): void => {
    let _overAllAllocated: number = 0;
    let _overAllUsed: number = 0;
    let _overAllRemaining: number = 0;
    let _subAllocated: number = 0;
    let _subUsed: number = 0;
    let _subRemaining: number = 0;
    let _preCateList: ICateList[] = [];
    let _preBudList: IBudList[] = [];
    let _preVenList: IVenList[] = [];
    let _updateLists: IUpdateJSON[] = [];
    let _isCate: boolean = false;
    let _isBud: boolean = false;
    let _isVen: boolean = false;

    for (let i: number = 0; MasCatUniData.length > i; i++) {
      _overAllAllocated = Number(MasCatUniData[i].OverAllBudgetCost);
      _overAllUsed = Number(MasCatUniData[i].OverAllPOIssuedCost);
      _overAllRemaining = Number(MasCatUniData[i].OverAllRemainingCost);

      for (let j: number = 0; selItems.length > j; j++) {
        if (MasCatUniData[i].ID === selItems[j].CategoryId) {
          _overAllUsed = _overAllUsed + Number(selItems[j].Price);
        }

        if (selItems.length === j + 1) {
          _preCateList.push({
            ID: MasCatUniData[i].ID,
            OverAllPOIssuedCost: _overAllUsed,
            OverAllRemainingCost: _overAllAllocated - _overAllUsed,
          });
        }

        if (selItems.length === j + 1 && MasCatUniData.length === i + 1) {
          _isCate = true;
          _updateLists.push({
            ListName: Config.ListNames.CategoryList,
            CateList: [..._preCateList],
          });
        }
      }
    }

    for (let i: number = 0; SubCatUniData.length > i; i++) {
      _subAllocated = Number(SubCatUniData[i].BudgetAllocated);
      _subUsed = Number(SubCatUniData[i].Used);
      _subRemaining = Number(SubCatUniData[i].RemainingCost);

      for (let j: number = 0; selItems.length > j; j++) {
        if (SubCatUniData[i].ID === selItems[j].BudgetId) {
          _subUsed = _subUsed + Number(selItems[j].Price);
        }

        if (selItems.length === j + 1) {
          _preBudList.push({
            ID: SubCatUniData[i].ID,
            Used: _subUsed,
            RemainingCost: _subAllocated - _subUsed,
          });
        }

        if (selItems.length === j + 1 && SubCatUniData.length === i + 1) {
          _isBud = true;
          _updateLists.push({
            ListName: Config.ListNames.BudgetList,
            BudList: [..._preBudList],
          });
        }
      }
    }

    for (let i: number = 0; selItems.length > i; i++) {
      _preVenList.push({
        ID: selItems[i].ID,
        Comment: isAppRejModal.Value,
        Status: "Approved",
      });

      if (selItems.length === i + 1) {
        _isVen = true;
        _updateLists.push({
          ListName: Config.ListNames.VendorDetails,
          VenList: [..._preVenList],
        });
      }
    }

    if (_isCate && _isBud && _isVen) {
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
            SPServices.SPUpdateItem({
              Listname: Config.ListNames.BudgetList,
              ID: SubCatUniData.length ? SubCatUniData[0].ID : null,
              RequestJSON: { VendorStatus: "Approved" },
            })
              .then((budUpdate) => {
                props._getVendorNave("");
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err: any) => {
          GetErrFunctions(err);
        });
    }
  };

  const AppRejComment = (status) => {
    let AppRejComment = [];
    if (status == "Approved") {
      handleCal();
    } else {
      selItems.forEach((val) => {
        AppRejComment.push({
          ID: val.ID,
          Comment: isAppRejModal.Value,
          Status: status,
        });
      });
      SPServices.batchUpdate({
        ListName: Config.ListNames.VendorDetails,
        responseData: AppRejComment,
      })
        .then((res: any) => {
          SPServices.SPUpdateItem({
            Listname: Config.ListNames.BudgetList,
            ID: SubCatUniData.length ? SubCatUniData[0].ID : null,
            RequestJSON: { VendorStatus: "Rejected" },
          })
            .then((budUpdate) => {
              props._getVendorNave("");
            })
            .catch((err) => console.log(err));
        })
        .catch(() => GetErrFunctions("Update error"));
    }
  };

  const deleteVendor = () => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.VendorDetails,
      ID: isDeleteModal.Id,
      RequestJSON: { IsDeleted: true },
    })
      .then((delitem) => {
        let index = FData.findIndex((val) => val.ID == isDeleteModal.Id);
        FData.splice(index, 1);
        setFData([...FData]);
        setIsDeleteModal({ isDelete: false, Id: null, index: null });
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    AllFunctions();
  }, []);

  return (
    <div>
      <div>
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
        {TextFieldConfirm ? (
          <div className={styles.rightBtns}>
            <DefaultButton
              text="Approve"
              styles={btnStyle}
              style={
                selItems.length ? { cursor: "pointer" } : { cursor: "default" }
              }
              onClick={() => {
                if (selItems.length) {
                  setIsAppRejModal({
                    Flag: true,
                    Name: "Approve",
                  });
                }
              }}
            />
            <DefaultButton
              text="Reject"
              styles={btnStyle}
              style={
                selItems.length ? { cursor: "pointer" } : { cursor: "default" }
              }
              onClick={() => {
                if (selItems.length) {
                  setIsAppRejModal({
                    Flag: true,
                    Name: "Reject",
                  });
                }
              }}
            />
          </div>
        ) : (
          <div className={styles.rightBtns}>
            <label style={{ color: "red" }}>{Error}</label>
            <DefaultButton
              text="Add"
              styles={btnStyle}
              onClick={() => {
                if (
                  FData.every(
                    (FValue: IVendorData) => FValue.VendorConfig != null
                  )
                ) {
                  // TextFieldVal = true;
                  setFData([...FData, ...datas]);
                }
                // else {
                //   alert("Fill the data");
                // }

                //   setIsModal(true);
                // _calArray.length && setIsModal(true);
              }}
            />
            <DefaultButton
              text="Save"
              styles={btnStyle}
              onClick={() => {
                _UpdateData();
                //   setIsModal(true);
                // _calArray.length && setIsModal(true);
              }}
            />
          </div>
        )}
        {/* Dashboard Detail list section */}
        <DetailsList
          columns={_VendorColumn}
          items={FData}
          selection={itemSelection}
          // onItemInvoked={handleSelection}
          onShouldVirtualize={() => {
            return false;
          }}
          selectionMode={
            TextFieldConfirm ? SelectionMode.multiple : SelectionMode.none
          }
          // styles={_DetailsListStyle}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
        />
        {FData.length === 0 && (
          <div className={styles.noRecords}>No data found !!!</div>
        )}
      </div>
      <Modal isOpen={isAppRejModal.Flag} styles={modalStyles}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
          }}
        >
          <TextField
            value={isAppRejModal.Value}
            label={`${isAppRejModal.Name} comments`}
            required
            multiline
            resizable={false}
            styles={
              isAppRejModal.error
                ? errmultilineTextFieldStyle
                : multilineTextFieldStyle
            }
            onChange={(e, text) => {
              setIsAppRejModal({ ...isAppRejModal, Value: text });
            }}
          />
        </div>
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
              setIsAppRejModal({
                Flag: false,
                Name: "",
                Value: "",
                error: false,
              });
            }}
          >
            Cancel
          </button>
          <button
            className={styles.yesBTN}
            onClick={() => {
              if (isAppRejModal.Value) {
                AppRejComment(
                  isAppRejModal.Name == "Approve" ? "Approved" : "Rejected"
                );
              } else {
                setIsAppRejModal({ ...isAppRejModal, error: true });
              }
            }}
          >
            {isAppRejModal.Name == "Approve" ? "Approved" : "Rejected"}
          </button>
        </div>
      </Modal>
      {/* Delete Modal section */}
      <Modal
        isOpen={isDeleteModal.isDelete}
        isBlocking={false}
        styles={deleteModalStyles}
      >
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
                setIsDeleteModal({ isDelete: false, Id: null, index: null });
              }}
            >
              No
            </button>
            <button
              className={styles.yesBTN}
              onClick={() => {
                if (isDeleteModal.Id) {
                  deleteVendor();
                  setIsDeleteModal({ ...isDeleteModal, isDelete: false });
                } else {
                  FData.splice(isDeleteModal.index, 1);
                  setFData(FData);
                  setIsDeleteModal({ isDelete: false, Id: null, index: null });
                }
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

export default VendorAdd;
