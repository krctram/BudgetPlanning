import * as React from "react";
import styles from "./VendorApprove.module.scss";
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

const VendorApprove = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;
  propDropValue = { ...props.dropValue };
  _areaDrop = [...props.dropValue.Area];

  const _VendorColumn: IColumn[] = [
    // {
    //   key: "column1",
    //   name: "Master Category",
    //   fieldName: "Category",
    //   minWidth: 130,
    //   maxWidth: 130,
    // },
    {
      key: "column2",
      name: "Category",
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
      onRender: (item: IVendorData): string => {
        return SPServices.format(item.Price);
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
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [filCountryDrop, setFilCountryDrop] = useState<string>("All");
  const [filTypeDrop, setFilTypeDrop] = useState<string>("All");
  const [filAreaDrop, setFilAreaDrop] = useState<string>("All");
  const [MData, setMData] = useState<IVendorData[]>([]);

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

  /* function creation */
  const _getErrorFunction = (errMsg: any): void => {
    console.log(errMsg);
    alertify.error("Error Message");
  };

  const _getDefaultFunction = (): void => {
    setIsLoader(true);
    _Area = "Please select";
    _Country = "Please select";
    _Type = "Please select";
    _getVendorDetail();
  };

  const _getVendorDetail = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.VendorDetails,
      Select:
        "*, Category/ID, Category/Title, Budget/ID, Budget/Description, Country/ID, Country/Title, AttachmentFiles",
      Expand: "Category, Budget, Country, AttachmentFiles",
      Filter: [
        {
          FilterKey: "Year",
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
        let _isData: boolean = false;
        _masIteams = [];
        if (res.length) {
          for (let i: number = 0; res.length > i; i++) {
            // if (res[i].BudgetId && res[i].BudgetId.includes(props._selID)) {
            if (res[i].BudgetId == props._selID) {
              let _Attach: IAttach[] = [];

              _isData = true;

              res[i].AttachmentFiles.length &&
                res[i].AttachmentFiles.forEach((e: any) => {
                  _Attach.push({
                    Name: e.FileName ? e.FileName : "",
                    Path: e.ServerRelativePath.DecodedUrl
                      ? e.ServerRelativePath.DecodedUrl
                      : "",
                  });
                });

              _masIteams.push({
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
                Area: res[i].Area ? res[i].Area : "-",
                Country: res[i].CountryId ? res[i].Country.Title : "-",
                Category: res[i].CategoryId ? res[i].Category.Title : "-",
                subCategory: res[i].BudgetId.length
                  ? res[i].Budget.filter((e: any) => e.ID === props._selID)[0]
                    .Description
                  : "",
                CountryId: res[i].CountryId ? res[i].CountryId : 0,
                Price: res[i].Price ? res[i].Price : 0,
                LastYearCost: res[i].LastYearCost ? res[i].LastYearCost : 0,
                RequestedAmount: res[i].RequestedAmount
                  ? res[i].RequestedAmount
                  : 0,
                Attachments: [..._Attach],
                index: 0,
              });
            }

            if (res.length === i + 1 && _isData) {
              setMData([..._masIteams]);
              setIsLoader(false);
            } else {
              setMData([]);
              setIsLoader(false);
            }
          }
        } else {
          setMData([]);
          setIsLoader(false);
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err);
      });
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
        <Label className={styles.HeaderLable}>Used Vendors</Label>
      </div>

      {/* Dashboard Detail list section */}
      <DetailsList
        columns={_VendorColumn}
        items={MData}
        styles={_DetailsListStyle}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
      {MData.length === 0 && (
        <div className={styles.noRecords}>No data found !!!</div>
      )}
    </div>
  );
};

export default VendorApprove;
