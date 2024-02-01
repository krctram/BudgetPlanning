import * as React from "react";
import { useState, useEffect } from "react";
import {
  Label,
  Dropdown,
  DetailsList,
  SelectionMode,
  IColumn,
  Icon,
  TextField,
  IDropdownStyles,
  IDetailsListStyles,
  ITextFieldStyles,
  Checkbox,
  IconButton,
  IButtonStyles,
  Modal,
  IModalStyles,
  ICheckStyles,
} from "@fluentui/react";
import { Config } from "../../../globals/Config";
import {
  IDrop,
  IDropdowns,
  ICurBudgetItem,
  ICurCategoryItem,
  IOverAllItem,
  IBudgetListColumn,
  IBudgetValidation,
  IVendorItems,
  IVendorValidation,
  IVendorDetail,
} from "../../../globalInterFace/BudgetInterFaces";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import SPServices from "../../../CommonServices/SPServices";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import styles from "./Vendor.module.scss";
import { config } from "exceljs";
import { sp } from "@pnp/sp/presets/all";
import { truncate } from "@microsoft/sp-lodash-subset";
import { DefaultButton } from "office-ui-fabric-react";
import { Selection } from "@fluentui/react";

// image and gif variables
const deleteGif = require("../../../ExternalRef/Images/Delete.gif");

let TypeFlag: string = "";
let ConfimMsg: boolean = false;
let isChangeRenual: boolean = true;
let isAllSelect: boolean = false;
let isSubmit: boolean = true;
let confirmBoxText: string = "";
let Status: string = "";
let _curMasRemainingCost: number = 0;
let _curMasUsedCost: number = 0;
let _curSubAllocatedCost: number = 0;
let _curSubRemainingCost: number = 0;
let _curSubUsedCost: number = 0;
let _curPOIssuedCost: number = 0;
let _curRemainingCost: number = 0;
let _subUsedCost: number = 0;
let _subRemCost: number = 0;
let _isAdminView: boolean = false;
let _isDeleteIndex: number = null;

const Vendor = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.props.groupUsers.isSuperAdminView;
  let admin: boolean = props.vendorDetails.isAdmin;

  const column: IColumn[] = [
    {
      key: "1",
      name: "Vendor",
      fieldName: "Vendor",
      minWidth: 100,
      maxWidth: 300,
      onRender: (item, index) => {
        return item.isEdit ? (
          <TextField
            // styles={DropdownStyle}
            // options={dropdownValue}
            // // selectedKey={dropdownValue[0].key}
            // selectedKey={_getFilterDropValues(
            //   "Vendor",
            //   { ...props.props.dropValue },
            //   vendorData.Vendor ? vendorData.Vendor : "All"
            // )}
            value={vendorData.Vendor}
            styles={Validate.Vendor ? errtxtFieldStyle : textFieldStyle}
            onChange={(e: any, text: string) => {
              if (isRenual) {
                setVendorData({ ...vendorData, Vendor: text.trimStart() });
              } else {
                handelVendorData(text);
              }
            }}
          />
        ) : (
          <label>{!item.isDummy ? item.Vendor : ""}</label>
        );
      },
    },
    {
      key: "2",
      name: "Description",
      fieldName: "Description",
      minWidth: 150,
      maxWidth: 300,
      onRender: (item) => {
        return item.isEdit ? (
          <TextField
            value={vendorData.Description}
            styles={Validate.Description ? errtxtFieldStyle : textFieldStyle}
            //placeholder="Enter The Description"
            onChange={(e, text) => {
              setVendorData({ ...vendorData, Description: text.trimStart() });
            }}
          />
        ) : (
          <label>{item.Description}</label>
        );
      },
    },
    // {
    //   key: "12",
    //   name: "Action",
    //   fieldName: "Action",
    //   minWidth: 100,
    //   maxWidth: 500,
    //   onRender: (item, index) => {
    //     let isActionView = item.Status !== Config.ApprovalStatus.Approved;

    //     if (isActionView) {
    //       return admin ? (
    //         item.isEdit ? (
    //           <div>
    //             <Icon
    //               iconName="CheckMark"
    //               style={{
    //                 color: "green",
    //                 fontSize: "20px",
    //                 cursor: "pointer",
    //               }}
    //               onClick={() => {
    //                 isChangeRenual = true;
    //                 if (TypeFlag == "Add") {
    //                   _prepareJSON(index);
    //                 } else {
    //                   _prepareJSON(index);
    //                 }
    //               }}
    //             />
    //             <Icon
    //               iconName="Cancel"
    //               style={{
    //                 color: "red",
    //                 fontSize: "16px",
    //                 cursor: "pointer",
    //               }}
    //               onClick={() => {
    //                 setValidate({ ...Config.vendorValidation });
    //                 isChangeRenual = true;
    //                 if (TypeFlag == "Add") {
    //                   ConfimMsg = !ConfimMsg;
    //                   addVendorCancel(item, index);
    //                 } else {
    //                   ConfimMsg = !ConfimMsg;
    //                   editVendorCancel(item, index);
    //                 }
    //               }}
    //             />
    //           </div>
    //         ) : (
    //           !item.isDummy && (
    //             <div>
    //               <Icon
    //                 iconName="Edit"
    //                 style={{
    //                   color: "blue",
    //                   fontSize: "16px",
    //                   cursor: "pointer",
    //                 }}
    //                 onClick={() => {
    //                   isChangeRenual = false;
    //                   if (!ConfimMsg) {
    //                     ConfimMsg = !ConfimMsg;
    //                     TypeFlag = "Edit";
    //                     editVendorItem(item, index);
    //                   } else {
    //                     ConfirmPageChange(item, index, "Edit");
    //                   }
    //                 }}
    //               />
    //               <Icon
    //                 iconName="Delete"
    //                 style={{
    //                   color: "red",
    //                   fontSize: "16px",
    //                   cursor: "pointer",
    //                 }}
    //                 onClick={() => {
    //                   if (isChangeRenual) {
    //                     setIsDelModal(true);
    //                     setVendorData(item);
    //                   }
    //                 }}
    //               />
    //             </div>
    //           )
    //         )
    //       ) : (
    //         <div></div>
    //       );
    //     }
    //   },
    // },
    {
      key: "3",
      name: "Pricing",
      fieldName: "Pricing",
      minWidth: 100,
      maxWidth: 500,
      onRender: (item) => {
        return item.isEdit ? (
          <TextField
            value={vendorData.Pricing.toString()}
            styles={Validate.Pricing ? errtxtFieldStyle : textFieldStyle}
            //placeholder="Enter The Pricing"
            onChange={(e, text) => {
              let _isNumber: boolean = /^[0-9]*\.?[0-9]*$/.test(
                text.trimStart()
              );
              if (_isNumber) {
                setVendorData({
                  ...vendorData,
                  Pricing: text.trimStart(),
                });
              }
            }}
          />
        ) : (
          <label>{!item.isDummy && SPServices.format(item.Pricing)}</label>
        );
      },
    },
    {
      key: "4",
      name: "PaymentTerms",
      fieldName: "PaymentTerms",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => {
        return item.isEdit ? (
          <TextField
            value={vendorData.PaymentTerms}
            styles={textFieldStyle}
            //placeholder="Enter The PaymentTerms"
            onChange={(e, text) => {
              setVendorData({ ...vendorData, PaymentTerms: text.trimStart() });
            }}
          />
        ) : (
          <label>{item.PaymentTerms}</label>
        );
      },
    },
    {
      key: "5",
      name: "LastYearCost",
      fieldName: "LastYearCost",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => {
        return item.isEdit ? (
          <TextField
            value={vendorData.LastYearCost}
            styles={textFieldStyle}
            //placeholder="Enter The LastYearCost"
            onChange={(e, text) => {
              setVendorData({ ...vendorData, LastYearCost: text.trimStart() });
            }}
          />
        ) : (
          <label>{item.LastYearCost}</label>
        );
      },
    },
    {
      key: "6",
      name: "PO",
      fieldName: "PO",
      minWidth: 150,
      maxWidth: 200,
      onRender: (item, index) => {
        return item.isDummy && admin ? (
          <div
            onClick={() => {
              isChangeRenual = false;
              if (!ConfimMsg) {
                ConfimMsg = true;
                newVendorAdd(item, index);
                TypeFlag = "Add";
              } else {
                ConfirmPageChange(item, index, "Add");
              }
            }}
            style={{
              cursor: "pointer",
              fontWeight: "600",
              padding: "5px 10px",
              fontSize: "14px",
              background: "rgb(77, 84, 106)",
              color: "rgb(255, 255, 255)",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            New Vendor Add
          </div>
        ) : item.isEdit ? (
          <TextField
            value={vendorData.PO}
            styles={textFieldStyle}
            //placeholder="Enter The PO"
            onChange={(e, text) => {
              setVendorData({ ...vendorData, PO: text.trimStart() });
            }}
          />
        ) : (
          <label>{item.PO}</label>
        );
      },
    },
    {
      key: "7",
      name: "Supplier",
      fieldName: "Supplier",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => {
        return item.isEdit ? (
          <TextField
            value={vendorData.Supplier}
            styles={textFieldStyle}
            //placeholder="Enter The Supplier"
            onChange={(e, text) => {
              setVendorData({ ...vendorData, Supplier: text.trimStart() });
            }}
          />
        ) : (
          <label>{item.Supplier}</label>
        );
      },
    },
    {
      key: "8",
      name: "Attachment",
      fieldName: "Attachment",
      minWidth: 100,
      maxWidth: 500,
      onRender: (item) => {
        return item.isEdit ? (
          <div>
            <input
              id="AttachmentFile"
              type="file"
              style={{ display: "none" }}
              multiple
              accept=".xlsx,.docx,.txt"
              onChange={(e) => handleInputValue(e.target.files, "Attachment")}
            />
            <label htmlFor="AttachmentFile">
              {vendorData.AttachmentURL.length
                ? vendorData.AttachmentURL[0].split("/").pop()
                : "AttachmentFile"}
            </label>
          </div>
        ) : !item.isDummy && item.AttachmentURL.length ? (
          <a href={item.AttachmentURL[0]}>
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
      key: "9",
      name: "Procurement",
      fieldName: "Procurement",
      minWidth: 100,
      maxWidth: 500,
      onRender: (item) => {
        return item.isEdit ? (
          <div>
            <input
              id="ProcurementFile"
              type="file"
              style={{ display: "none" }}
              multiple
              accept=".xlsx,.docx,.txt"
              onChange={(e) => {
                handleInputValue(e.target.files, "Procurment");
              }}
            />
            <label htmlFor="ProcurementFile">
              {vendorData.ProcurementURL.length
                ? vendorData.ProcurementURL[0].split("/").pop()
                : "ProcurementFile"}
            </label>
          </div>
        ) : !item.isDummy && item.ProcurementURL.length ? (
          <a href={item.ProcurementURL[0]}>
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
      key: "10",
      name: "RequestedAmount",
      fieldName: "RequestedAmount",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => {
        return item.isEdit ? (
          <TextField
            value={vendorData.RequestedAmount}
            styles={textFieldStyle}
            //placeholder="Enter The RequestedAmount"
            onChange={(e, text) => {
              setVendorData({
                ...vendorData,
                RequestedAmount: text.trimStart(),
              });
            }}
          />
        ) : (
          <label>{item.RequestedAmount}</label>
        );
      },
    },
    {
      key: "11",
      name: "Status",
      fieldName: "Status",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => {
        return false ? (
          <TextField
            value={vendorData.Status}
            //placeholder="Enter The RequestedAmount"
            disabled={true}
          />
        ) : (
          <label>{item.Status}</label>
        );
      },
    },
    {
      key: "12",
      name: "Action",
      fieldName: "Action",
      minWidth: 100,
      maxWidth: 500,
      onRender: (item, index) => {
        let isActionView = item.Status !== Config.ApprovalStatus.Approved;

        if (isActionView) {
          return admin ? (
            item.isEdit ? (
              <div>
                <Icon
                  iconName="CheckMark"
                  style={{
                    color: "green",
                    fontSize: "20px",
                    cursor: "pointer",
                    marginRight: 10,
                  }}
                  onClick={() => {
                    isChangeRenual = true;
                    if (TypeFlag == "Add") {
                      _prepareJSON(index, "check");
                    } else {
                      _prepareJSON(index, "check");
                    }
                  }}
                />
                <Icon
                  iconName="Cancel"
                  style={{
                    color: "red",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setValidate({ ...Config.vendorValidation });
                    isChangeRenual = true;
                    if (TypeFlag == "Add") {
                      ConfimMsg = !ConfimMsg;
                      addVendorCancel(item, index);
                    } else {
                      ConfimMsg = !ConfimMsg;
                      editVendorCancel(item, index);
                    }
                  }}
                />
              </div>
            ) : (
              !item.isDummy && (
                <div>
                  <Icon
                    iconName="Edit"
                    style={{
                      color: "blue",
                      fontSize: "16px",
                      cursor: "pointer",
                      marginRight: 10,
                    }}
                    onClick={() => {
                      isChangeRenual = false;
                      if (!ConfimMsg) {
                        ConfimMsg = !ConfimMsg;
                        TypeFlag = "Edit";
                        editVendorItem(item, index);
                      } else {
                        ConfirmPageChange(item, index, "Edit");
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
                      if (isChangeRenual) {
                        _isDeleteIndex = index;
                        setIsDelModal(true);
                        setVendorData(item);
                      }
                    }}
                  />
                </div>
              )
            )
          ) : (
            <div></div>
          );
        }
      },
    },
  ];

  const newColumn: any[] = [...column];
  newColumn.pop();
  !_isAdminView &&
    newColumn.unshift({
      key: "0",
      name: (
        <Checkbox
          checked={isAllSelect}
          onChange={(event, checked) => {
            handleAllSelectedUsers(checked);
          }}
        />
      ),
      fieldName: "Vendor",
      minWidth: 100,
      maxWidth: 500,
      onRender: (item, index) => {
        if (!item.isDummy && !item.isEdit) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Checkbox
                disabled={item.isDisable}
                checked={item.isClick}
                onChange={(event, checked) =>
                  handleSelectedUsers(item, index, checked)
                }
              />
            </div>
          );
        }
      },
    });

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [MData, setMData] = useState<IVendorItems[]>([]);
  const [vendorDetails, setVendorDetails] = useState<any[]>([]);
  const [isRenual, setIsRenual] = useState<boolean>(true);
  const [selectedItems, setselectedItems] = useState<any[]>([]);
  const [isDelModal, setIsDelModal] = useState<boolean>(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [vendorData, setVendorData] = useState<IVendorItems>({
    ...Config.Vendor,
  });
  const [Validate, setValidate] = useState<IVendorValidation>({
    ...Config.vendorValidation,
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

  const textFieldStyle: Partial<ITextFieldStyles> = {
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const disbableTextFieldStyle: Partial<ITextFieldStyles> = {
    root: {
      input: {
        backgroundColor: "#fff",
        color: "#242424",
      },
      label: {
        color: "#242424",
      },
    },
    fieldGroup: {
      border: "1px solid #000 !important",
    },
  };

  const DropdownStyle: Partial<IDropdownStyles> = {
    root: {
      dropdown: {
        ":focus::after": {
          border: "5px solid red",
        },
      },
      ".ms-Dropdown-container": {
        width: "100%",
      },
    },
  };

  const IconStyle: Partial<IButtonStyles> = {
    root: {
      marginRight: 10,
      color: "#000 !important",
      background: "transparent !important",
    },
    icon: {
      fontSize: 20,
      background: "transparent !important",
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

  const saveBtnStyle: Partial<IButtonStyles> = {
    root: {
      border: "none",
      height: 32,
      color: "#fff",
      fontSize: 16,
      background: "#2580e0 !important",
      borderRadius: 3,
      // marginRight: 10,
      width: "26%",
      span: {
        fontWeight: 100,
      },
    },
    rootHovered: {
      background: "#2580e0",
      color: "#fff",
    },
  };

  /* function creation */
  const getErrorFunction = (error: any) => {
    alertify.error(error);
    setIsLoader(false);
  };

  const getDefaultFunction = () => {
    setIsLoader(true);
    isChangeRenual = true;
    ConfimMsg = false;
    _getCategoryDatas();
  };

  const _getCategoryDatas = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CategoryList,
      Filter: [
        {
          FilterKey: "ID",
          Operator: "eq",
          FilterValue: props.vendorDetails.Item.CateId.toString(),
        },
      ],
    })
      .then((res: any) => {
        _curMasRemainingCost = res[0].OverAllRemainingCost
          ? res[0].OverAllRemainingCost
          : 0;
        _curMasUsedCost = res[0].OverAllPOIssuedCost
          ? res[0].OverAllPOIssuedCost
          : 0;

        _getBudgetDatas();
      })
      .catch((err: any) => {
        getErrorFunction("Master category datas get issue");
      });
  };

  const _getBudgetDatas = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.BudgetList,
      Filter: [
        {
          FilterKey: "ID",
          Operator: "eq",
          FilterValue: props.vendorDetails.Item.ID.toString(),
        },
      ],
    })
      .then((res: any) => {
        _curSubAllocatedCost = res[0].BudgetAllocated
          ? res[0].BudgetAllocated
          : 0;
        _curSubRemainingCost = res[0].RemainingCost ? res[0].RemainingCost : 0;
        _curSubUsedCost = res[0].Used ? res[0].Used : 0;

        _getVendorsArr();
      })
      .catch((err: any) => {
        getErrorFunction("Sub category datas get issue");
      });
  };

  const _getVendorsArr = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.DistributionList,
      Select: "*, Year/ID, Year/Title",
      Expand: "Year",
      Filter: [
        {
          FilterKey: "isDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
        {
          FilterKey: "Year/Title",
          Operator: "eq",
          FilterValue: (Number(props.vendorDetails.Item.Year) - 1).toString(),
        },
        {
          FilterKey: "Status",
          Operator: "eq",
          FilterValue: "Approved",
        },
      ],
      Topcount: 5000,
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then((res: any) => {
        let matches: any[] = [];
        let strVendors: string[] = [];
        let distinctMap = {};
        let _uniqueVendorName: string[] = [];
        let filLastVendor: any;
        let _uniqueVendor: IVendorDetail[] = [];

        res.length &&
          res.reduce((item: any, e1: any) => {
            matches = item.filter((e2: any) => {
              return e1.Vendor.toLowerCase() === e2.toLowerCase();
            });
            if (matches.length == 0) {
              strVendors.push(e1.Vendor);
            }
            return strVendors;
          }, []);

        for (let i: number = 0; i < strVendors.length; i++) {
          let value: string = strVendors[i];
          distinctMap[value] = null;
        }
        _uniqueVendorName = Object.keys(distinctMap);

        if (_uniqueVendorName.length) {
          for (let i: number = 0; _uniqueVendorName.length > i; i++) {
            filLastVendor = res.filter((e: any) => {
              return (
                e.Vendor.toLowerCase() === _uniqueVendorName[i].toLowerCase()
              );
            })[0];
            let data: any = {};
            const column: IVendorDetail = Config.VendorDetail;
            data[column.ID] = filLastVendor.ID;
            data[column.Vendor] = filLastVendor.Vendor;
            data[column.LastYearCost] = filLastVendor.LastYearCost;
            data[column.PO] = filLastVendor.PO;
            data[column.Supplier] = filLastVendor.Supplier;
            _uniqueVendor.push({ ...data });
            if (_uniqueVendorName.length === i + 1) {
              setVendorDetails([..._uniqueVendor]);
              getVendorData();
            }
          }
        } else {
          getVendorData();
        }
      })
      .catch((err: any) => {
        getErrorFunction("Get previous year vendor");
      });
  };

  const getVendorData = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.DistributionList,
      Select: "*,Budget/ID,Year/ID,Year/Title ",
      Expand: "Budget,Year",
      Filter: [
        {
          FilterKey: "isDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
        {
          FilterKey: "Budget/ID",
          Operator: "eq",
          FilterValue: props.vendorDetails.Item.ID,
        },
      ],
    })
      .then((resVendor: any) => {
        let getVendorData: IVendorItems[] = [];
        if (resVendor.length) {
          let allDatas: IVendorItems[] = [...resVendor].filter((value) => {
            if (admin) {
              return (
                value.Status === Config.ApprovalStatus.NotStarted ||
                value.Status === Config.ApprovalStatus.Rejected ||
                value.Status === Config.ApprovalStatus.Approved
              );
            } else {
              return value.Status === Config.ApprovalStatus.Pending;
            }
          });
          setIsSubmit([...allDatas]);

          allDatas.forEach((item: any) => {
            // let disabled:boolean = item.Status === 'Approved' || item.Status === 'Pending'
            getVendorData.push({
              ID: item.ID,
              // VendorId: item.VendorId,
              Vendor: item.Vendor ? item.Vendor : "",
              Description: item.Description ? item.Description : "",
              Pricing: item.Pricing ? item.Pricing : 0,
              PaymentTerms: item.PaymentTerms ? item.PaymentTerms : "",
              LastYearCost: item.LastYearCost ? item.LastYearCost : "",
              PO: item.PO ? item.PO : "",
              Supplier: item.Supplier ? item.Supplier : "",
              AttachmentURL: item.AttachmentURL
                ? JSON.parse(item.AttachmentURL)
                : [],
              ProcurementURL: item.ProcurementTeamQuotationURL
                ? JSON.parse(item.ProcurementTeamQuotationURL)
                : [],
              RequestedAmount: item.RequestedAmount ? item.RequestedAmount : "",
              BudgetId: item.BudgetId ? item.BudgetId : null,
              isDummy: false,
              isEdit: false,
              Attachment: [],
              Procurement: [],
              Status: item.Status ? item.Status : "",
              isClick: false,
              // isDisable:disabled
            });
          });

          if (admin) {
            getVendorData.push({ ...Config.Vendor });
          }
          setMData([...getVendorData]);
          setIsDelModal(false);
          setIsLoader(false);
        } else {
          if (admin) {
            setMData([...MData, { ...Config.Vendor }]);
          }
          setIsDelModal(false);
          setIsLoader(false);
        }
      })
      .catch((error: any) => getErrorFunction("Get vendor data"));
  };

  const newVendorAdd = (item: IVendorItems, index: number): void => {
    let items: IVendorItems[] = [...MData];
    items[index].isDummy = false;
    items[index].isEdit = true;
    setMData([...items]);
    setVendorData(item);
  };

  const addVendorCancel = (item: IVendorItems, index: number): void => {
    let AVendorCancel: IVendorItems[] = [...MData];
    AVendorCancel[index].isDummy = true;
    AVendorCancel[index].isEdit = false;
    setMData([...AVendorCancel]);
    setVendorData(item);
  };

  const _prepareJSON = (index: number, type: string): void => {
    let _curJSON: any = {};
    let _count: number = 0;
    let _indexNo: number = -1;
    let _initial: number = 0;
    let _curAmountArray: number[] = [];
    let authendication: boolean = false;
    let _isValid: boolean = false;
    let _curMasArray: IOverAllItem;
    let _curSubArray: ICurBudgetItem[] = [];
    let _curSubNumber: number[] = [];
    let _overAllCount: number = 0;

    _curMasArray = [...props._masDistribution].filter(
      (e: IOverAllItem) => e.ID === props.vendorDetails.Item.CateId
    )[0];
    _curSubArray = [..._curMasArray.subCategory].filter(
      (e: ICurBudgetItem) => e.ID !== props.vendorDetails.Item.ID
    );
    [..._curSubArray].forEach((e: ICurBudgetItem) =>
      _curSubNumber.push(e.Used ? Number(e.Used) : 0)
    );
    _overAllCount = [..._curSubNumber].reduce((a, b) => a + b, _initial);

    let _arrOfMaster: IVendorItems[] = [...MData].filter(
      (e: IVendorItems) => e.ID !== null
    );

    _indexNo =
      vendorData.ID &&
      [..._arrOfMaster].findIndex((e: IVendorItems) => e.ID === vendorData.ID);

    [..._arrOfMaster].forEach((e: IVendorItems) =>
      _curAmountArray.push(e.Pricing ? Number(e.Pricing) : 0)
    );

    if (vendorData.ID) {
      let _curSum: number = 0;

      type === "delete"
        ? _curAmountArray.splice(_indexNo, 1)
        : _curAmountArray.splice(_indexNo, 1, Number(vendorData.Pricing));

      if (_curAmountArray.length === _arrOfMaster.length) {
        let _overSum: number = 0;

        _curSum = [..._curAmountArray].reduce((a, b) => a + b, _initial);
        _count = _curSubAllocatedCost - _curSum;
        _overSum = _overAllCount + _curSum;
        _subRemCost = _count;
        _subUsedCost = _curSum;
        _curRemainingCost =
          Number(props.vendorDetails.Item.OverAllBudgetCost) - _overSum;
        _curPOIssuedCost = _overSum;

        if (_subRemCost >= 0) {
          _isValid = true;
        }
      } else if (_curAmountArray.length === _arrOfMaster.length - 1) {
        let _overSum: number = 0;

        _curSum = [..._curAmountArray].reduce((a, b) => a + b, _initial);
        _count = _curSubAllocatedCost - _curSum;
        _overSum = _overAllCount + _curSum;
        _subRemCost = _count;
        _subUsedCost = _curSum;
        _curRemainingCost =
          Number(props.vendorDetails.Item.OverAllBudgetCost) - _overSum;
        _curPOIssuedCost = _overSum;

        if (_subRemCost >= 0) {
          _isValid = true;
        }
      }
    } else {
      if (_curAmountArray.length === _arrOfMaster.length) {
        _count = Number(vendorData.Pricing);
        _curPOIssuedCost = _curMasUsedCost + Number(vendorData.Pricing);
        _curRemainingCost = _curMasRemainingCost - Number(vendorData.Pricing);
        _subRemCost = _curSubRemainingCost - _count;
        _subUsedCost = _curSubUsedCost + _count;
      }

      if (_subRemCost >= 0) {
        _isValid = true;
      }
    }

    if (_isValid) {
      _curJSON = {
        Vendor: vendorData.Vendor,
        Description: vendorData.Description,
        Pricing: SPServices.decimalCount(Number(vendorData.Pricing)),
        PaymentTerms: vendorData.PaymentTerms,
        LastYearCost: vendorData.LastYearCost,
        PO: vendorData.PO,
        Supplier: vendorData.Supplier,
        RequestedAmount: vendorData.RequestedAmount,
        BudgetId: props.vendorDetails.Item.ID,
        YearId: props.vendorDetails.Item.YearId,
        Area: props.vendorDetails.Item.Area,
        isDeleted: type === "delete" ? true : false,
      };

      authendication = Validation(index);
    } else {
      Validation(index);
    }

    if (authendication) {
      type === "delete"
        ? handleDelete({ ..._curJSON })
        : vendorData.ID
        ? vendorUpdate({ ..._curJSON })
        : addVendor({ ..._curJSON });
    }
  };

  const addVendor = (item: any): void => {
    setIsLoader(true);

    SPServices.SPAddItem({
      Listname: Config.ListNames.DistributionList,
      RequestJSON: { ...item },
    })
      .then((resAddItem: any) => {
        createMasterFolder(resAddItem.data.Id);
      })
      .catch((error: any) => {
        getErrorFunction("Add categorty list");
      });
  };

  const createMasterFolder = async (itemId: number) => {
    await sp.web.rootFolder.folders
      .getByName(Config.ListNames.DistributionLibrary)
      .folders.addUsingPath(itemId.toString(), true)
      .then(async (folder: any) => {
        await sp.web.lists
          .getByTitle(Config.ListNames.DistributionLibrary)
          .rootFolder.folders.getByName(folder.data.Name)
          .expand("ListItemAllFields")
          .get()
          .then(async (_folder: any) => {
            await sp.web.lists
              .getByTitle(Config.ListNames.DistributionLibrary)
              .items.getById(_folder["ListItemAllFields"]["ID"])
              .update({ DistributionId: itemId })
              .then((item1: any) => {})
              .catch((error: any) => getErrorFunction("Id update error"));
          });

        createFirstSubFolder(folder, itemId);
      })
      .catch((err) => {
        getErrorFunction("Create folder");
      });
  };

  const createFirstSubFolder = async (folder: any, itemId: number) => {
    let Attachment: string[] = [];
    await sp.web
      .getFolderByServerRelativePath(folder.data.ServerRelativeUrl)
      .folders.addUsingPath("Attachment", true)
      .then(async (data) => {
        for (let i = 0; i < vendorData.Attachment.length; i++) {
          await sp.web
            .getFolderByServerRelativePath(data.data.ServerRelativeUrl)
            .files.addUsingPath(
              vendorData.Attachment[i].name,
              vendorData.Attachment[i],
              { Overwrite: true }
            )
            .then(async (result) => {
              await Attachment.push(result.data.ServerRelativeUrl);
            })
            .catch((error) =>
              getErrorFunction("Create file for first sub folder")
            );
        }

        createSecondSubFolder(folder, itemId, Attachment);
      })
      .catch((error) => getErrorFunction("Create first sub folder"));
  };

  const createSecondSubFolder = async (
    folder: any,
    itemId: number,
    Attachment: string[]
  ) => {
    let Procurement: string[] = [];
    await sp.web
      .getFolderByServerRelativePath(folder.data.ServerRelativeUrl)
      .folders.addUsingPath("Procurement", true)
      .then(async (data) => {
        for (let i = 0; i < vendorData.Procurement.length; i++) {
          await sp.web
            .getFolderByServerRelativePath(data.data.ServerRelativeUrl)
            .files.addUsingPath(
              vendorData.Procurement[i].name,
              vendorData.Procurement[i],
              { Overwrite: true }
            )
            .then(async (result) => {
              await Procurement.push(result.data.ServerRelativeUrl);
            })
            .catch((error) =>
              getErrorFunction("create file for second sub folder")
            );
        }

        updateJson(Attachment, Procurement, itemId, "Add");
      })
      .catch((error) => getErrorFunction("create second sub folder"));
  };

  const updateJson = (
    Attachment: string[],
    Procurement: string[],
    itemId: number,
    type: string
  ) => {
    let json = {
      AttachmentURL: JSON.stringify(Attachment),
      ProcurementTeamQuotationURL: JSON.stringify(Procurement),
    };

    setattachmentJson(json, itemId, type);
  };

  const setattachmentJson = (json: any, Id: number, type: string) => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.DistributionList,
      ID: Id,
      RequestJSON: json,
    })
      .then((data) => {
        _UpdateMasterCatercory();
      })
      .catch((error) => getErrorFunction("Update attachment"));
  };

  const _UpdateMasterCatercory = (): void => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CategoryList,
      ID: props.vendorDetails.Item.CateId,
      RequestJSON: {
        OverAllPOIssuedCost: SPServices.decimalCount(Number(_curPOIssuedCost)),
        OverAllRemainingCost: SPServices.decimalCount(
          Number(_curRemainingCost)
        ),
      },
    })
      .then((res: any) => {
        _UpdateSubCatercory();
      })
      .catch((err: any) => {
        getErrorFunction("Master Category Amount Update Issue");
      });
  };

  const _UpdateSubCatercory = (): void => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.BudgetList,
      ID: props.vendorDetails.Item.ID,
      RequestJSON: {
        Used: SPServices.decimalCount(Number(_subUsedCost)),
        RemainingCost: SPServices.decimalCount(Number(_subRemCost)),
      },
    })
      .then((res: any) => {
        TypeFlag = "";
        ConfimMsg = false;
        getDefaultFunction();
      })
      .catch((err: any) => {
        getErrorFunction("Sub Category Amount Update Issue");
      });
  };

  const handleInputValue = (files: any, type: string) => {
    let allFiles = [];
    let allURL = [];
    for (let i = 0; i < files.length; i++) {
      allFiles.push(files[i]);
      let authendication = [...allURL].some((value) => value === files[i].name);
      if (authendication) {
        allURL = [...allURL].filter(
          (value, index) => index !== allURL.indexOf(value)
        );
        allURL.unshift(files[i].name);
      } else {
        allURL.unshift(files[i].name);
      }
    }

    if (type === "Attachment") {
      setVendorData({
        ...vendorData,
        Attachment: allFiles,
        AttachmentURL: allURL,
      });
    } else {
      setVendorData({
        ...vendorData,
        Procurement: allFiles,
        ProcurementURL: allURL,
      });
    }
  };

  const editVendorItem = (items: IVendorItems, index: number) => {
    let editItem = [...MData];
    editItem[index].isEdit = true;
    setVendorData({ ...items });
    setMData([...editItem]);
  };

  const editVendorCancel = (item: IVendorItems, index: number) => {
    let EVendorCancel = [...MData];
    EVendorCancel[index].isEdit = false;
    setMData([...EVendorCancel]);
  };

  const vendorUpdate = (item: any) => {
    setIsLoader(true);

    SPServices.SPUpdateItem({
      Listname: Config.ListNames.DistributionList,
      RequestJSON: { ...item },
      ID: vendorData.ID,
    })
      .then((resUpdateItem) => {
        getMasterFolder(vendorData.ID);
      })
      .catch((error) => {
        getErrorFunction("Update distribution error");
      });
  };

  const getMasterFolder = (itemId: number) => {
    sp.web.lists
      .getByTitle(Config.ListNames.DistributionLibrary)
      .rootFolder.folders.getByName(itemId.toString())
      .expand("ListItemAllFields")
      .get()
      .then((folder) => {
        getFisrtSubFolder(folder, itemId);
      })
      .catch((error) => getErrorFunction("Get master folder"));
  };

  const getFisrtSubFolder = async (folder: any, itemId: number) => {
    let Attachment: string[] = [...vendorData.AttachmentURL];

    for (let i = 0; i < vendorData.Attachment.length; i++) {
      await sp.web
        .getFolderByServerRelativePath(folder.ServerRelativeUrl + "/Attachment")
        .files.addUsingPath(
          vendorData.Attachment[i].name,
          vendorData.Attachment[i],
          { Overwrite: true }
        )
        .then((data) => {
          Attachment.unshift(data.data.ServerRelativeUrl);
        })
        .catch((err) => getErrorFunction("Update first sub folder files"));
    }
    getSecondSubFolder(folder, itemId, Attachment);
  };

  const getSecondSubFolder = async (
    folder: any,
    itemId: number,
    Attachment: string[]
  ) => {
    let Procurement: string[] = [...vendorData.ProcurementURL];

    for (let i = 0; i < vendorData.Procurement.length; i++) {
      await sp.web
        .getFolderByServerRelativePath(
          folder.ServerRelativeUrl + "/Procurement"
        )
        .files.addUsingPath(
          vendorData.Procurement[i].name,
          vendorData.Procurement[i],
          { Overwrite: true }
        )
        .then((data) => {
          Procurement.unshift(data.data.ServerRelativeUrl);
        })
        .catch((err) => getErrorFunction("Update second sub folder files"));
    }
    updateJson(Attachment, Procurement, itemId, "Update");
  };

  const ConfirmPageChange = (
    item: IVendorItems,
    index: number,
    type: string
  ) => {
    if (confirm("page change")) {
      if (type == "Add") {
        TypeFlag = "Add";
        let EditChange = [];
        MData.forEach((EChange) => {
          EChange.isEdit = false;
          EditChange.push(EChange);
        });
        setMData([...EditChange]);
        newVendorAdd(item, index);
      } else {
        setVendorData({ ...Config.Vendor });
        let AddChange = [...MData];
        AddChange[AddChange.length - 1].isDummy = true;
        AddChange[AddChange.length - 1].isEdit = false;
        AddChange.forEach((EChange) => {
          EChange.isEdit = false;
        });
        TypeFlag = "Edit";
        setMData([...AddChange]);
        editVendorItem(item, index);
      }
    }
  };

  const Validation = (index: number): boolean => {
    let isValidation: boolean = true;
    let validationData: IVendorValidation = { ...Config.vendorValidation };
    let isDuplicate = [...MData].some(
      (value, indx) => value.Vendor === vendorData.Vendor && indx !== index
    );

    if (!vendorData.Vendor) {
      validationData.Vendor = true;
      isValidation = false;
    }

    if (isDuplicate) {
      isValidation = false;
      validationData.Vendor = true;
    }

    if (!vendorData.Description) {
      validationData.Description = true;
      isValidation = false;
    }

    if (!vendorData.Pricing || _subRemCost <= 0) {
      validationData.Pricing = true;
      isValidation = false;
    }

    if (!vendorData.Vendor) {
      alertify.error("Please enter Vendor");
    } else if (isDuplicate) {
      alertify.error(`The "${vendorData.Vendor}" has already exists`);
    } else if (!vendorData.Description) {
      alertify.error("Please enter Description");
    } else if (!vendorData.Pricing) {
      alertify.error("Please enter Pricing");
    } else if (_subRemCost <= 0) {
      alertify.error("Pricing amount crossed the limit");
    }

    setValidate(validationData);
    return isValidation;
  };

  const handelVendorData = (text: string) => {
    let data = [...vendorDetails].filter((value) => value.Vendor === text);
    let newVendorData = { ...vendorData };
    if (data.length) {
      newVendorData.Vendor = text;
      newVendorData.PO = data[0].PO ? data[0].PO : "0";
      newVendorData.LastYearCost = data[0].LastYearCost
        ? data[0].LastYearCost
        : "0";
      newVendorData.Supplier = data[0].Supplier;
    } else {
      newVendorData.Vendor = text;
      newVendorData.PO = "0";
      newVendorData.LastYearCost = "0";
      newVendorData.Supplier = "";
    }
    setVendorData({ ...newVendorData });
  };

  const handleSelectedUsers = (
    item: IVendorItems,
    index: number,
    value: boolean
  ) => {
    let newMData: IVendorItems[] = [...MData];
    newMData[index].isClick = value;

    let slctdItems: IVendorItems[] = [...newMData].filter(
      (value) => value.isClick === true
    );
    let authendication = [...newMData]
      .filter((value) => value.ID !== null)
      .every((value) => value.isClick === true);

    isAllSelect = authendication;
    setselectedItems([...slctdItems]);
    setMData([...newMData]);
  };

  const handleAllSelectedUsers = (checked: boolean) => {
    let newMdata: IVendorItems[] = [...MData].map((value) => {
      checked ? (value.isClick = true) : (value.isClick = false);
      return value;
    });

    let slctdItems: IVendorItems[] = checked
      ? newMdata.filter((value) => value.ID !== null)
      : [];
    isAllSelect = checked;
    setMData([...newMdata]);
    setselectedItems([...slctdItems]);
  };

  const setStatus = () => {
    let updateItems = [...selectedItems];
    if (Status === Config.ApprovalStatus.Pending) {
      updateItems = [...MData].filter(
        (value) =>
          value.Status === Config.ApprovalStatus.NotStarted ||
          value.Status === Config.ApprovalStatus.Rejected
      );
    }

    updateItems = [...updateItems].map((value) => {
      return {
        ID: value.ID,
        Status: Status,
      };
    });

    if (updateItems.length && isChangeRenual) {
      setIsLoader(true);

      SPServices.batchUpdate({
        ListName: Config.ListNames.DistributionList,
        responseData: [...updateItems],
      })
        .then(() => {
          isAllSelect = false;
          Status = "";
          confirmBoxText = "";
          setIsConfirmModal(false);
          getVendorData();
        })
        .catch((error) => getErrorFunction("Update status"));
    }
  };

  const handleDelete = (item: any) => {
    setIsLoader(true);
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.DistributionList,
      RequestJSON: { ...item },
      ID: vendorData.ID,
    })
      .then((resUpdateItem) => {
        // let index: number = [...MData].findIndex(
        //   (value) => value.ID === vendorData.ID
        // );
        // let items: IVendorItems[] = [...MData];
        // items.splice(index, 1);

        // setIsSubmit([...items]);
        // setMData(items);
        // setIsDelModal(false);
        // setIsLoader(false);
        _UpdateMasterCatercory();
      })
      .catch((error) => {
        getErrorFunction("Update distribution error");
      });
  };

  const setIsSubmit = (allDatas: any[]) => {
    isSubmit = [...allDatas].find(
      (value) =>
        value.Status === Config.ApprovalStatus.NotStarted ||
        value.Status === Config.ApprovalStatus.Rejected
    );
  };

  // const setActionView = (item:IVendorItems) =>{
  //   let isAction = true
  //   if(item.Status === "Pending"){
  //     isAction = false
  //   }
  //   return isAction
  // }

  useEffect(() => {
    getDefaultFunction();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div>
      <div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
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
              props.setVendorDetails({
                ...props.vendorDetails,
                isVendor: true,
              });
            }}
          />
          <h2 style={{ margin: 0, fontSize: 28, color: "#202945" }}>
            Budget Distribution
          </h2>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            width: "80%",
            gap: "2%",
          }}
        >
          <div style={{ width: "19%" }}>
            <TextField
              styles={disbableTextFieldStyle}
              label="Country"
              value={props.vendorDetails.Item.Country}
              disabled={true}
            />
          </div>
          <div style={{ width: "19%" }}>
            <TextField
              styles={disbableTextFieldStyle}
              label="Area"
              value={props.vendorDetails.Item.Area}
              disabled={true}
            />
          </div>
          <div style={{ width: "10%" }}>
            <TextField
              label="Period"
              styles={disbableTextFieldStyle}
              value={props.vendorDetails.Item.Year}
              disabled={true}
            />
          </div>

          <div style={{ width: "10%" }}>
            <TextField
              styles={disbableTextFieldStyle}
              label="Type"
              value={props.vendorDetails.Item.Type}
              disabled={true}
            />
          </div>

          {admin && (
            <div style={{ width: "20%" }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Renewal Type
              </label>
              <div
                style={{
                  display: "flex",
                  marginTop: 15,
                  gap: "2%",
                }}
              >
                <Checkbox
                  label="New"
                  checked={isRenual}
                  onChange={() => {
                    isChangeRenual && setIsRenual(true);
                  }}
                />
                <Checkbox
                  label="Existing"
                  checked={!isRenual}
                  onChange={() => {
                    isChangeRenual && setIsRenual(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "20%",
            gap: "2%",
          }}
        >
          {admin
            ? isSubmit && (
                <DefaultButton
                  text="Submit"
                  styles={saveBtnStyle}
                  onClick={() => {
                    confirmBoxText = "Submit";
                    Status = Config.ApprovalStatus.Pending;
                    setIsConfirmModal(true);
                  }}
                />
              )
            : !_isAdminView && (
                <>
                  <DefaultButton
                    text="Review"
                    styles={saveBtnStyle}
                    onClick={() => {
                      confirmBoxText = "Review";
                      Status = Config.ApprovalStatus.Rejected;
                      if (selectedItems.length) {
                        setIsConfirmModal(true);
                      } else {
                        alertify.error("please select users to Review");
                      }
                    }}
                  />
                  <DefaultButton
                    text="Approve"
                    styles={saveBtnStyle}
                    onClick={() => {
                      confirmBoxText = "Approve";
                      Status = Config.ApprovalStatus.Approved;
                      // textforlable="aslkjgalskjghkja"
                      if (selectedItems.length) {
                        setIsConfirmModal(true);
                      } else {
                        alertify.error("please select users to Approve");
                      }
                    }}
                  />
                </>
              )}
        </div>
      </div>
      <DetailsList
        columns={admin ? [...column] : [...newColumn]}
        items={MData}
        styles={_DetailsListStyle}
        selectionMode={SelectionMode.none}
      />
      {/* <button >click</button> */}
      {!MData.length ? <div>No data found</div> : null}

      {/* Delete Modal section */}
      <Modal isOpen={isDelModal} isBlocking={false} styles={modalStyles}>
        <div>
          {/* Content section */}
          {/* <img src={`${deleteGif}`} /> */}
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.unlinkImg}
              iconProps={{ iconName: "Delete" }}
            />
          </div>
          {/* <IconButton
            // className={styles.deleteImg}
            iconProps={{ iconName: "Delete" }}
          /> */}
          <Label
            style={{
              color: "red",
              fontSize: 16,
            }}
          >
            Do you want to delete this "{vendorData.Vendor}"?
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
                setIsDelModal(false);
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
                _prepareJSON(_isDeleteIndex, "delete");
                // handleDelete();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isConfirmModal} isBlocking={false} styles={modalStyles}>
        <div>
          <div className={styles.deleteIconCircle}>
            <IconButton
              className={styles.unlinkImg}
              iconProps={
                confirmBoxText == "Review"
                  ? { iconName: "DocumentApproval" }
                  : { iconName: "CheckMark" }
              }
            />
          </div>

          <Label
            style={{
              color: "red",
              fontSize: 16,
            }}
          >
            Do you want to {confirmBoxText} this items?
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
                setIsConfirmModal(false);
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
                setStatus();
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

export default Vendor;
