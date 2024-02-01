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
  SelectionMode,
  SearchBox,
  TextField,
  IDropdownOption,
} from "@fluentui/react";
import SPServices from "../../../CommonServices/SPServices";
import {
  IAttach,
  IVenDrop,
  IVendorData,
} from "../../../globalInterFace/BudgetInterFaces";
import Loader from "./Loader";
import { Config } from "../../../globals/Config";
import { Item } from "@pnp/sp/items";

let TextFieldVal: boolean = false;

const VendorAdd = (props: any) => {
  console.log("props", props);

  // Local Variables
  let TextFieldConfirm: boolean = false;

  // Columns
  const _VendorColumn: IColumn[] = [
    {
      key: "column1",
      name: "Vendor Name",
      fieldName: "VendorName",
      minWidth: 130,
      maxWidth: 130,
      onRender: (item: IVendorData, i: number): any => {
        return TextFieldConfirm ? (
          item.VendorName
        ) : (
          <Dropdown
            placeholder="Please select"
            styles={DropdownStyle}
            options={[...vendorDropName]}
            selectedKey={vendorValue ? vendorValue.text : undefined}
            onChange={(e: any, text: any) => {
              _handleOnChange(item, text, "vendorName");
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
      onRender: (item: IVendorData) => {
        return TextFieldConfirm ? (
          item.Description
        ) : (
          <TextField
            value={item.Description}
            onChange={(e: any, text: any) =>
              _handleOnChange(item, text, "Description")
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
      onRender: (item: any, i: number): any => {
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
              _handleOnChange(item, text, "Price")
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
      onRender: (item: IVendorData) => {
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
              _handleOnChange(item, text, "Payment")
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
      onRender: (item: IVendorData) => {
        return TextFieldConfirm ? (
          item.Delivery
        ) : (
          <TextField
            value={item.Delivery}
            onChange={(e: any, text: any) =>
              _handleOnChange(item, text, "Delivery")
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
                console.log("data", item);

                FData.splice(index, 1);
                console.log("FData", FData);
                setFData([...FData])

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
      Status: "",
      Type: "",
      VendorName: "",
      Year: "",
    },
  ];

  // Use States
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [MData, setMData] = useState([]);
  const [FData, setFData] = useState<IVendorData[]>([...datas]);
  const [isModal, setIsModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState({
    id: null,
    confirm: false,
    edit: false,
  });
  const [vendorDropName, setVendorDropName] = useState([]);
  const [vendorValue, setVendorValue] = useState<IDropdownOption>();
  const [vendorDetails, setVendorDetails] = useState([]);

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
    console.log("masterCategory", masterCategory);
    console.log("budgetData", budgetData);

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
        console.log("res", res);

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
              Category: masterCategory.length > 0 && masterCategory[0].Title ? masterCategory[0].Title : "-",
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
            });
          }

        setVendorDropName([...vendorNameArray]);
        setMData([...VendorDetailsData]);

        console.log("VendorDetailsData", VendorDetailsData);
      })
      .catch((res: any) => {
        GetErrFunctions("Category List Reading error");
        console.log("res", res);
      });
  };

  const _handleOnChange = (
    value: IVendorData,
    textValue: any,
    name: string
  ) => {
    const tempFData = [...FData];
    const tempMData = [...MData];

    if (name === "vendorName") {
      setVendorValue(textValue.text);
      let FilterData = MData.filter((Mvalue: any) => {
        return Mvalue.ID === textValue.key;
      });

      if (!(FData.length > 1)) {
        setFData(FilterData);
      } else {
        FData.pop();
        setFData([...FData, ...FilterData]);
      }
    } else if (name === "Category") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Category = textValue;
      setFData([...tempFData]);
    } else if (name === "subCategory") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].subCategory = textValue;
      setFData([...tempFData]);
    } else if (name === "Area") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Area = textValue;
      setFData([...tempFData]);
    } else if (name === "Country") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Country = textValue;
      setFData([...tempFData]);
    } else if (name === "Type") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Type = textValue;
      setFData([...tempFData]);
    } else if (name === "Description") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Description = textValue;
      setFData([...tempFData]);
    } else if (name === "Price") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Price = textValue;
      setFData([...tempFData]);
    } else if (name === "Payment") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Payment = textValue;
      setFData([...tempFData]);
    } else if (name === "Delivery") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Delivery = textValue;
      setFData([...tempFData]);
    } else if (name === "LastYearCost") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].LastYearCost = textValue;
      setFData([...tempFData]);
    } else if (name === "LastYearPO") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].LastYearPO = textValue;
      setFData([...tempFData]);
    } else if (name === "RequestedAmount") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].RequestedAmount = textValue;
      setFData([...tempFData]);
    } else if (name === "Recommended") {
      let TextIndex = tempFData.findIndex(
        (temValue: IVendorData) => temValue.ID === value.ID
      );

      tempFData[TextIndex].Recommended = textValue;
      setFData([...tempFData]);
    }

    //   let BalanceVendorName = vendorDropName.filter((vendorName) => {
    //     return !(vendorName.key === value.key);
    //   });

    //   if (TextFieldVal) {
    //     setVendorDropName([...BalanceVendorName]);
    //     TextFieldVal = false;
    //   }
  };

  const _UpdateData = () => {
    if (FData.every((e) => e.ID)) {
      let AddVendorData = [];

      FData.forEach((value: any) => {
        AddVendorData.push({
          Title: value.Description,
          CategoryType: value.Type,
          VendorName: value.VendorName,
          Payment: value.Payment,
          Delivery: value.Delivery,
          LastYearPO: value.LastYearPO,
          Recommended: value.Recommended,
          Year: value.Year,
          Status: value.Status,
          Comment: value.Comment,
          Area: value.Area,
          CountryId: value.CountryId,
          Price: value.Price,
          LastYearCost: value.LastYearCost,
          RequestedAmount: value.RequestedAmount,
          BudgetId: props.subCatDet.ID,
          CategoryId: value.CategoryId,
        });
      });
      console.log("insert", AddVendorData);

      SPServices.batchInsert({
        ListName: Config.ListNames.VendorDetails,
        responseData: AddVendorData,
      })
        .then((res: any) => {
          props._getVendorNave("");
        })
        .catch(() => GetErrFunctions("Update error"));
    } else {
      alert("Please fill the data");
    }
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

        <div className={styles.rightBtns}>
          <DefaultButton
            text="Add"
            styles={btnStyle}
            onClick={() => {
              // if (FData.every((FValue: IVendorData) => FValue.ID)) {
              // TextFieldVal = true;
              setFData([...FData, ...datas]);
              // } else {
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
        {/* Dashboard Detail list section */}
        <DetailsList
          columns={_VendorColumn}
          items={FData}
          styles={_DetailsListStyle}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
        />
        {/* {MData.length === 0 && (
          <div className={styles.noRecords}>No data found !!!</div>
        )} */}
      </div>
    </div>
  );
};

export default VendorAdd;
