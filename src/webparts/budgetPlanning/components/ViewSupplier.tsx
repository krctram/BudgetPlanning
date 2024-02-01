import * as React from "react";
import Loader from "./Loader";
import { Config } from "../../../globals/Config";
import styles from "./ViewSupplier.module.scss";
import {
  DetailsList,
  IDetailsListStyles,
  Icon,
  Label,
  SelectionMode,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import SPServices from "../../../CommonServices/SPServices";
import * as moment from "moment";
import { ISupplierViewData } from "../../../globalInterFace/BudgetInterFaces";
import { _filterArray } from "../../../CommonServices/filterCommonArray";

const ViewSupplier = (props: any): JSX.Element => {
  const columns = [
    {
      key: "column1",
      name: "Vendor",
      fieldName: "Name",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column2",
      name: "Pricing - Excluding VAT in AED",
      fieldName: "Pricing",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: any, index: number) => {
        let value = SPServices.format(item.Pricing);
        return <div>{value}</div>;
      },
    },
    {
      key: "column3",
      name: "Area",
      fieldName: "Area",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column4",
      name: "Country",
      fieldName: "Country",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column5",
      name: "Type",
      fieldName: "Type",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column6",
      name: "Description",
      fieldName: "Description",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column7",
      name: "Payment Term",
      fieldName: "PaymentTerms",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column8",
      name: "Delivery",
      fieldName: "Delivery",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column9",
      name: "Last Year Cost in AED",
      fieldName: "LastYearCost",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: any, index: number) => {
        let value = SPServices.format(item.LastYearCost);
        return <div>{value}</div>;
      },
    },
    {
      key: "column10",
      name: "Last year PO#",
      fieldName: "LastYearPO",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column11",
      name: "Recommended Supplier",
      fieldName: "RecomendedName",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
    {
      key: "column12",
      name: "Requested amount in AED",
      fieldName: "RequestAmount",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: any, index: number) => {
        let value = SPServices.format(item.RequestAmount);
        return <div>{value}</div>;
      },
    },
    {
      key: "column13",
      name: "Attachments",
      // fieldName: "Status",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: any, index: number) => {
        if (item.Attachments.length) {
          console.log("hel");
          return (
            <a href={item.Attachments[0].ServerRelativeUrl}>
              <Icon
                title={item.Attachments[0].FileName}
                iconName="OpenFile"
                style={{
                  color: "green",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              />
            </a>
          );
        }
      },
    },
    {
      key: "column14",
      name: "Status",
      fieldName: "Status",
      minWidth: 200,
      maxWidth: 300,
      // onRender: (item: any, index: number) => {
      //   return <></>;
      // },
    },
  ];

  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [items, setItems] = useState<ISupplierViewData[]>([]);

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

  const getDefaultFunction = () => {
    setIsLoader(true);
    getAllData();
  };

  const getAllData = () => {
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
      ],
    })
      .then((res: any) => {
        setAllDatas(res);
      })
      .catch((err: any) => console.log("err", err));
  };

  const setAllDatas = (datas: any) => {
    console.log("datas", datas);
    let data = [...datas];
    let itms: ISupplierViewData[] = [];

    data.forEach((value: any) => {
      itms.push({
        Name: value.VendorName ? value.VendorName : "-",
        PaymentTerms: value.Payment ? value.Payment : "-",
        Delivery: value.Delivery ? value.Delivery : "-",
        RecomendedName: value.Recommended ? value.Recommended : "-",
        LastYearPO: value.LastYearPO ? value.LastYearPO : "-",
        Type: value.CategoryType ? value.CategoryType : "-",
        Description: value.Title ? value.Title : "-",
        NumberOfVendor: "-",
        Comments: value.Comment ? value.Comment : "-",
        Area: value.Area ? value.Area : "-",
        Country: value.CountryId ? value.Country.Title : "-",
        Status: value.Status ? value.Status : "-",
        Pricing: value.Price ? value.Price : null,
        RequestAmount: value.RequestedAmount ? value.RequestedAmount : null,
        LastYearCost: value.LastYearCost ? value.LastYearCost : null,
        Attachments: value.AttachmentFiles,
      });
    });

    // console.log("grp users", props.groupUsers);
    let newItems = _filterArray(
      props.groupUsers,
      itms,
      Config.Navigation.BudgetDistribution
    );

    // console.log("newItems", newItems);
    setItems(newItems);
    setIsLoader(false);
  };

  useEffect(() => {
    getDefaultFunction();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <>
      <div className={styles.Container}>
        {/* Header section */}
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
              setIsLoader(true);
              props.handleBack("");
              //   props._getVendorNave("");
            }}
          />
          <Label className={styles.HeaderLable}>Vendor View</Label>
        </div>
        <DetailsList
          items={items}
          columns={columns}
          selectionMode={SelectionMode.none}
          styles={_DetailsListStyle}
        />
      </div>
    </>
  );
};

export default ViewSupplier;
