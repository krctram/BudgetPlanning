import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./Supplier.module.scss";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import {
  DefaultButton,
  DetailsList,
  Dropdown,
  IDetailsListStyles,
  IDropdownStyles,
  ITextFieldStyles,
  Icon,
  Label,
  SelectionMode,
  TextField,
} from "@fluentui/react";
import { Config } from "../../../globals/Config";
import {
  ICountryAdminData,
  IDrop,
  IDropdowns,
  ISuplierData,
  ISuplierDetail,
  ISuplierDetailValidation,
  ISuplierDropData,
} from "../../../globalInterFace/BudgetInterFaces";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import SPServices from "../../../CommonServices/SPServices";
import * as moment from "moment";
import Loader from "./Loader";
import ViewSupplier from "./ViewSupplier";

let propDropValue: IDropdowns;
let isOpex: boolean = false;

const Supplier = (props: any): JSX.Element => {
  const currentUser = props.currentUser;

  const allCoumns = [
    {
      key: "column1",
      name: "Vendors",
      fieldName: "Name",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.Name}
            styles={
              item.NameValidation
                ? DetailListErrTextFieldStyle
                : DetailListTextFieldStyle
            }
            onChange={(e: any, value: any) => {
              handleInputValue("Name", value.trimStart(), index);
            }}
          />
        );
      },
    },
    {
      key: "column2",
      name: "Pricing - Excluding VAT in AED",
      fieldName: "Pricing",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.Pricing !== "" ? item.Pricing : "0"}
            styles={
              item.PricingValidation
                ? DetailListErrTextFieldStyle
                : DetailListTextFieldStyle
            }
            onChange={(e: any, value: any) => {
              let _isNumber: boolean = /^[0-9]*\.?[0-9]*$/.test(value);
              if (_isNumber) {
                let number = SPServices.numberFormat(value);
                handleInputValue("Pricing", number, index);
              }
            }}
          />
        );
      },
    },
    {
      key: "column3",
      name: "Payment Terms",
      fieldName: "PaymentTerms",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.PaymentTerms}
            styles={DetailListTextFieldStyle}
            onChange={(e: any, value: any) => {
              handleInputValue("PaymentTerms", value.trimStart(), index);
            }}
          />
        );
      },
    },
    {
      key: "column4",
      name: "Delivery",
      fieldName: "Delivery",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.Delivery}
            styles={DetailListTextFieldStyle}
            onChange={(e: any, value: any) => {
              handleInputValue("Delivery", value.trimStart(), index);
            }}
          />
        );
      },
    },
    {
      key: "column5",
      name: "Last Year Cost in AED",
      fieldName: "LastYearCost",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.LastYearCost !== "" ? item.LastYearCost : "0"}
            styles={DetailListTextFieldStyle}
            onChange={(e: any, value: any) => {
              let _isNumber: boolean = /^[0-9]*\.?[0-9]*$/.test(value);
              if (_isNumber) {
                let number = SPServices.numberFormat(value);
                handleInputValue("LastYearCost", number, index);
              }
            }}
          />
        );
      },
    },
    {
      key: "column6",
      name: "Last year PO#",
      fieldName: "PoNumber",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.LastYearPO}
            styles={DetailListTextFieldStyle}
            onChange={(e: any, value: any) => {
              handleInputValue("LastYearPO", value.trimStart(), index);
            }}
          />
        );
      },
    },
    {
      key: "column7",
      name: "Recommended Supplier",
      fieldName: "RecomendedName",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.RecomendedName}
            styles={DetailListTextFieldStyle}
            onChange={(e: any, value: any) => {
              handleInputValue("RecomendedName", value.trimStart(), index);
            }}
          />
        );
      },
    },
    {
      key: "column8",
      name: "Requested amount in AED",
      fieldName: "RequestAmount",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ISuplierData, index: number) => {
        return (
          <TextField
            value={item.RequestAmount !== "" ? item.RequestAmount : "0"}
            styles={DetailListTextFieldStyle}
            onChange={(e: any, value: any) => {
              let _isNumber: boolean = /^[0-9]*\.?[0-9]*$/.test(value);
              if (_isNumber) {
                let number = SPServices.numberFormat(value);
                handleInputValue("RequestAmount", number, index);
              }
            }}
          />
        );
      },
    },
  ];

  let columns = isOpex ? [...allCoumns] : [...allCoumns].slice(0, 4);

  propDropValue = props.dropValue;

  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [isSubmitBtn, setIsSubmitBtn] = useState<boolean>(false);
  const [isSaveBtn, setIsSaveBtn] = useState<boolean>(true);
  const [isViewSupplier, setIsviewSupplier] = useState<boolean>(false);
  const [isAreaDisabled, setIsAreaDisabled] = useState<boolean>(false);
  const [isCountryDisabled, setIsCountryDisabled] = useState<boolean>(false);
  const [countryDropValues, setCountryDropvalues] = useState<IDrop[]>([]);
  const [areaDropdownValues, setAreaDropdownValues] = useState<IDrop[]>([]);
  const [vendorDetails, setVendorDetails] = useState<ISuplierDetail>({
    ...Config.SuplierDetails,
  });
  const [vendorData, setVendorData] = useState<ISuplierData[]>([]);
  const [vendorDetailsValidation, setVendorDetailsValidaion] =
    useState<ISuplierDetailValidation>({
      ...Config.SuplierDetailsValidation,
    });

  const DropdownStyle: Partial<IDropdownStyles> = {
    root: {
      width: "100%",
      ".ms-Dropdown-container": {
        width: "100%",
      },
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
      "ms-Dropdown-title": {
        backgroundColor: "red",
      },
    },
  };

  const ErrDropdownStyle: Partial<IDropdownStyles> = {
    root: {
      width: "100%",
      ".ms-Dropdown-container": {
        width: "100%",
      },
    },
    dropdown: {
      border: "1px solid red",
      span: {
        border: "none",
      },
      ":focus::after": {
        border: "1px solid red",
      },
      "ms-Dropdown-title": {
        backgroundColor: "red",
      },
    },
  };

  const textFieldStyle: Partial<ITextFieldStyles> = {
    root: {
      width: "100%",
      resize: "none",
    },
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const DetailListTextFieldStyle: Partial<ITextFieldStyles> = {
    root: {
      width: "100%",
      ".ms-TextField-wrapper": {
        with: "10%",
      },
    },
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const DetailListErrTextFieldStyle: Partial<ITextFieldStyles> = {
    root: {
      width: "100%",
      ".ms-TextField-wrapper": {
        with: "10%",
      },
    },
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
  };

  const errtxtFieldStyle: Partial<ITextFieldStyles> = {
    root: {
      width: "100%",
      resize: "none",
    },
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
  };

  const btnStyle = {
    root: {
      border: "none",
      background: "#2580e0 !important",
      color: "#fff",
      height: 33,
      borderRadius: 5,
    },
    rootHovered: {
      color: "#fff",
    },
    icon: {
      fontSize: 16,
      color: "#fff",
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
  const _getErrorFunction = (errMsg: any, name: string) => {
    setIsLoader(false);
    console.log(name, errMsg);
    alertify.error(name);
  };

  const getDefaultFunction = () => {
    setIsLoader(true);
    getCountryDropdown();
  };

  const getCountryDropdown = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CountryConfig,
      Select:
        "*, Country/Title,Country/ID, AreaAdmins/Title, AreaAdmins/EMail, AreaAdmins/ID",
      Expand: "Country, AreaAdmins",
      Filter: [
        {
          FilterKey: "isDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
    })
      .then((res: any) => {
        if (res.length) {
          getAllCountry(res);
        } else {
          setIsLoader(false);
        }
      })
      .catch((err) => {
        _getErrorFunction(err, "Get country dropdown");
      });
  };

  const getAllCountry = (result: any) => {
    let data: any = [...result];
    let AllDatas: ISuplierDropData[] = [];
    let AllAreas: IDrop[] = [...propDropValue.Area];
    AllAreas.shift();

    AllAreas.forEach((value: any) => {
      data.forEach((val: any) => {
        let isAdmin = [...val.AreaAdmins].some(
          (users: any) => users.EMail === currentUser
        );
        if (value.text === val.Area && isAdmin) {
          AllDatas.push({
            Area: val.Area,
            Country: val.Country.Title,
            CountryId: val.Country.ID,
          });
        }
      });
    });

    setCountryDropdown(AllDatas);
  };

  const setCountryDropdown = (AllDatas: ISuplierDropData[]) => {
    let datas = [...AllDatas];
    let allCountryDropValues: IDrop[] = [...propDropValue.Country];
    let CountryDropValues: IDrop[] = [{ key: 0, text: "All", ID: null }];

    if (!props.groupUsers.isSuperAdmin) {
      datas.forEach((value: ISuplierDropData) => {
        let isDuplicate = [...CountryDropValues].some(
          (val: IDrop) => val.text === value.Country
        );

        if (!isDuplicate) {
          let _Option: IDrop = [...allCountryDropValues].find(
            (val: IDrop) => val.text === value.Country
          );
          CountryDropValues.push({ ..._Option });
        }
      });
    } else {
      CountryDropValues = [...propDropValue.Country];
    }

    let vendorDtls = { ...vendorDetails };

    if (CountryDropValues.length === 2) {
      vendorDtls.Country = CountryDropValues[CountryDropValues.length - 1].text;
      vendorDtls.CountryId = CountryDropValues[CountryDropValues.length - 1].ID;
      setIsCountryDisabled(true);
    }

    setCountryDropvalues([...CountryDropValues]);
    getAreaDropdown(vendorDtls);
  };

  const getAreaDropdown = (vendorDtls) => {
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
        getAllAreas(res, vendorDtls);
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Get area dropdown");
      });
  };

  const getAllAreas = (datas: any, vendorDtls) => {
    let allData = [...datas];
    let allArea = [];
    allData.forEach((value: any) => {
      let isDuplicate = false;

      isDuplicate = [...allArea].some((Area: string) => Area === value.Area);

      if (!isDuplicate) {
        allArea.push(value.Area);
      }
    });

    setAreaDropdown(allArea, vendorDtls);
  };

  const setAreaDropdown = (allAreas: string[], vendorDtls) => {
    let areas: string[] = [...allAreas];
    let areaDropdown = [{ key: 0, text: "All" }];
    let areaDropValues: IDrop[] = [...propDropValue.Area];
    let venDetails = { ...vendorDtls };

    areas.forEach((area: string, index: number) => {
      areaDropValues.forEach((value: IDrop) => {
        if (area === value.text) {
          areaDropdown.push(value);
        }
      });
    });

    if (areaDropdown.length === 2) {
      (venDetails.Area = areaDropdown[areaDropdown.length - 1].text),
        setIsAreaDisabled(true);
    }

    setAreaDropdownValues([...areaDropdown]);
    setVendorDetails({ ...venDetails });
    setIsLoader(false);
  };

  const setAttachmentData = (files: any) => {
    let attachments = [];
    for (let i = 0; i < files.length; i++) {
      attachments.push({ name: files[i].name, content: files[i] });
    }
    setVendorDetails({ ...vendorDetails, Attachments: attachments });
  };

  const vendorDetailValidation = (): boolean => {
    let details: ISuplierDetail = { ...vendorDetails };
    let validations: ISuplierDetailValidation = {
      ...Config.SuplierDetailsValidation,
    };
    let isSubmit: boolean = true;

    if (details.Area === "All") {
      isSubmit = false;
      validations.AreaValidate = true;
    }

    if (details.Country === "All") {
      isSubmit = false;
      validations.CountryValidate = true;
    }

    if (details.Type === "All") {
      isSubmit = false;
      validations.TypeValidate = true;
    }

    if (!details.Description) {
      isSubmit = false;
      validations.DescriptionValidate = true;
    }

    if (details.NumberOfVendor === "All") {
      isSubmit = false;
      validations.NumberOfVendorValidate = true;
    } else {
      if (Number(details.NumberOfVendor) === 1) {
        if (!details.Attachments.length) {
          isSubmit = false;
          validations.AttachmentsValidate = true;
        }

        if (!details.Comments) {
          isSubmit = false;
          validations.CommentsValidate = true;
        }
      }
    }

    if (validations.AreaValidate) {
      alertify.error("Please choose the Area");
    } else if (validations.CountryValidate) {
      alertify.error("Please choose the Country");
    } else if (validations.TypeValidate) {
      alertify.error("Please choose the Type");
    } else if (validations.DescriptionValidate) {
      alertify.error("Please enter the description");
    } else if (validations.NumberOfVendorValidate) {
      alertify.error("Please choose the number of vendors");
    } else if (validations.AttachmentsValidate) {
      alertify.error("Please choose the type");
    } else if (validations.CommentsValidate) {
      alertify.error("Please choose the type");
    }

    setVendorDetailsValidaion({ ...validations });
    return isSubmit;
  };

  const handleSubmit = (): void => {
    let isSubmit: boolean = vendorDetailValidation();
    if (isSubmit) {
      let vendorDatas = [];
      for (let i = 0; i < Number(vendorDetails.NumberOfVendor); i++) {
        vendorDatas.push({ ...Config.SuplierData });
      }
      isOpex = vendorDetails.Type === "Opex";
      setVendorData([...vendorDatas]);
      setIsSaveBtn(false);
      setIsSubmitBtn(true);
    }
  };

  const handleInputValue = (key: string, value: string, index: number) => {
    let datas: ISuplierData[] = [...vendorData];
    datas[index][key] = value;
    setVendorData([...datas]);
  };

  const vendorDataValidation = (): boolean => {
    let data: ISuplierData[] = [...vendorData];
    data.forEach((value: ISuplierData, index: number) => {
      if (!value.Name) {
        data[index].NameValidation = true;
      } else {
        data[index].NameValidation = false;
      }

      if (!Number(value.Pricing)) {
        data[index].PricingValidation = true;
      } else {
        data[index].PricingValidation = false;
      }
    });

    let isSave = [...data].some(
      (value: ISuplierData) => value.NameValidation || value.PricingValidation
    );

    let vendorNameValidate: number = [...data].filter(
      (value: ISuplierData) => value.Name === ""
    ).length;
    let pricingValidate: number = [...data].filter(
      (value: ISuplierData) => Number(value.Pricing) === 0
    ).length;

    if (vendorNameValidate > 1 && !pricingValidate) {
      alertify.error("Please fill the manditory venor name field");
    } else if (!vendorNameValidate && pricingValidate > 1) {
      alertify.error("Please fill the manditory pricing field");
    } else if (vendorNameValidate + pricingValidate > 1) {
      alertify.error("Please fill the manditory field");
    } else if (vendorNameValidate === 1) {
      alertify.error("Vendor name cannot be empty");
    } else if (pricingValidate === 1) {
      alertify.error("Pricing cannot be empty");
    }

    isSave && setVendorData(data);
    return !isSave;
  };

  const handleSave = (): void => {
    let isSave: boolean = vendorDataValidation();

    if (isSave) {
      setIsLoader(true);
      let json = [];
      vendorData.forEach((value: ISuplierData) => {
        json.push({
          Area: vendorDetails.Area,
          CountryId: vendorDetails.CountryId,
          Title: vendorDetails.Description,
          CategoryType: vendorDetails.Type,
          Comment: vendorDetails.Comments,
          VendorName: value.Name,
          Price: SPServices.decimalCount(Number(value.Pricing)),
          Payment: value.PaymentTerms,
          Delivery: value.Delivery,
          LastYearCost: SPServices.decimalCount(Number(value.LastYearCost)),
          LastYearPO: value.LastYearPO,
          Recommended: value.RecomendedName,
          RequestedAmount: SPServices.decimalCount(Number(value.RequestAmount)),
          Year: moment().format("YYYY"),
        });
      });

      for (let i = 0; i < json.length; i++) {
        SPServices.SPAddItem({
          Listname: Config.ListNames.VendorConfig,
          RequestJSON: [...json][i],
        })
          .then((res) => {
            let attachments = [...vendorDetails.Attachments];
            let ID = res.data.ID;
            SPServices.SPAddAttachments({
              ListName: Config.ListNames.VendorConfig,
              ListID: ID,
              Attachments: [...vendorDetails.Attachments],
            })
              .then((err) => {})
              .catch((err) => _getErrorFunction(err, "attachment added"));
            alertify.success("added succesfully");
          })
          .catch((err) => _getErrorFunction(err, "Add vendor config"));
        i === json.length - 1 && props._getVendorNave("");
      }
    }
  };

  const handleBack = (type: string) => {
    setIsLoader(true);
    let value = type !== "";
    setIsviewSupplier(value);
    if (!value) {
      setVendorDetails({ ...Config.SuplierDetails });
      setVendorDetailsValidaion({ ...Config.SuplierDetailsValidation });
      setVendorData([]);
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getDefaultFunction();
  }, []);
  return (
    <>
      {isViewSupplier ? (
        <ViewSupplier
          currentUser={currentUser}
          handleBack={handleBack}
          groupUsers={props.groupUsers}
        />
      ) : isLoader ? (
        <Loader />
      ) : (
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
                props._getVendorNave("");
              }}
            />
            <Label className={styles.HeaderLable}>Vendor Details</Label>
          </div>

          {/* Master data add section */}
          <div>
            {/* First row */}
            <div
              className={styles.supplierAdd}
              style={{
                marginBottom: "20px",
              }}
            >
              {/* Area section */}
              <div className={styles.supplierRow}>
                <Dropdown
                  styles={
                    vendorDetailsValidation.AreaValidate
                      ? ErrDropdownStyle
                      : DropdownStyle
                  }
                  label="Area"
                  options={[...areaDropdownValues]}
                  selectedKey={_getFilterDropValues(
                    "Area",
                    { ...propDropValue },
                    vendorDetails.Area
                  )}
                  disabled={isAreaDisabled}
                  onChange={(e: any, text: IDrop) => {
                    setIsSubmitBtn(false);
                    setVendorDetails({
                      ...vendorDetails,
                      Area: text.text,
                    });
                  }}
                />
              </div>

              {/* Country section */}
              <div className={styles.supplierRow}>
                <Dropdown
                  styles={
                    vendorDetailsValidation.CountryValidate
                      ? ErrDropdownStyle
                      : DropdownStyle
                  }
                  label="Country"
                  disabled={isCountryDisabled}
                  options={[...countryDropValues]}
                  selectedKey={_getFilterDropValues(
                    "Country",
                    { ...propDropValue },
                    vendorDetails.Country
                  )}
                  onChange={(e: any, text: IDrop) => {
                    setIsSubmitBtn(false);
                    setVendorDetails({
                      ...vendorDetails,
                      Country: text.text,
                      CountryId: text.ID,
                    });
                  }}
                />
              </div>

              {/* Area section */}
              <div className={styles.supplierRow}>
                <Dropdown
                  styles={
                    vendorDetailsValidation.TypeValidate
                      ? ErrDropdownStyle
                      : DropdownStyle
                  }
                  label="Type"
                  options={[...propDropValue.Type]}
                  selectedKey={_getFilterDropValues(
                    "Type",
                    { ...propDropValue },
                    vendorDetails.Type
                  )}
                  onChange={(e: any, text: IDrop) => {
                    setIsSubmitBtn(false);
                    setVendorDetails({
                      ...vendorDetails,
                      Type: text.text,
                    });
                  }}
                />
              </div>

              {/* Description section */}
              <div className={styles.supplierRow}>
                <TextField
                  value={vendorDetails.Description}
                  label="Description"
                  styles={
                    vendorDetailsValidation.DescriptionValidate
                      ? errtxtFieldStyle
                      : textFieldStyle
                  }
                  onChange={(e: any, value: any) => {
                    setIsSubmitBtn(false);
                    setVendorDetails({ ...vendorDetails, Description: value });
                  }}
                />
              </div>
            </div>

            {/* Secind row */}
            <div className={styles.supplierAdd}>
              {/* Number of vendors section */}
              <div className={styles.supplierRow}>
                <Dropdown
                  styles={
                    vendorDetailsValidation.NumberOfVendorValidate
                      ? ErrDropdownStyle
                      : DropdownStyle
                  }
                  label="Number of vendors"
                  options={[...propDropValue.NuberOfVendors]}
                  selectedKey={_getFilterDropValues(
                    "Number of vendors",
                    { ...propDropValue },
                    vendorDetails.NumberOfVendor
                  )}
                  onChange={(e: any, text: IDrop) => {
                    setIsSubmitBtn(false);
                    setVendorDetails({
                      ...vendorDetails,
                      NumberOfVendor: text.text,
                    });
                  }}
                />
              </div>

              {/* Attachment section */}
              <div className={styles.supplierRow}>
                <div className={styles.Attachment}>
                  <Label>Procurement confirmation email/approved iMemo</Label>

                  <input
                    id="AttachmentFile"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      setIsSubmitBtn(false);
                      if (event.target.files.length) {
                        setAttachmentData(event.target.files);
                      }
                    }}
                  />

                  <label
                    htmlFor="AttachmentFile"
                    style={{
                      border: `1px solid ${
                        vendorDetailsValidation.AttachmentsValidate
                          ? "red"
                          : "black"
                      }`,
                      paddingLeft: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      height: "30px",
                    }}
                  >
                    {vendorDetails.Attachments.length
                      ? vendorDetails.Attachments[0].name + ",.."
                      : "Choose the file"}
                  </label>
                </div>
              </div>

              {/* Comments section */}
              <div className={styles.supplierRow}>
                <TextField
                  value={vendorDetails.Comments}
                  styles={
                    vendorDetailsValidation.CommentsValidate
                      ? errtxtFieldStyle
                      : textFieldStyle
                  }
                  label="Comments"
                  multiline
                  onChange={(e: any, value: any) => {
                    setIsSubmitBtn(false);
                    setVendorDetails({ ...vendorDetails, Comments: value });
                  }}
                />
              </div>

              {/* btn section */}
              <div className={styles.submitBTN}>
                <DefaultButton
                  text="Submit"
                  styles={btnStyle}
                  disabled={isSubmitBtn}
                  onClick={() => {
                    handleSubmit();
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.border} />

          <div className={styles.VendorData}>
            <Label className={styles.SubHeaderLable}>Vendor Data</Label>
            <div className={styles.btns}>
              <DefaultButton
                text="View"
                styles={btnStyle}
                onClick={() => {
                  setIsLoader(true);
                  handleBack("go to view");
                }}
              />
              <DefaultButton
                text="Save"
                disabled={isSaveBtn}
                styles={btnStyle}
                onClick={() => {
                  handleSave();
                }}
              />
            </div>
          </div>

          <DetailsList
            items={vendorData}
            columns={columns}
            selectionMode={SelectionMode.none}
            styles={_DetailsListStyle}
          />
          {!vendorData.length ? (
            <div className={styles.noRecords}>No data found !!!</div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default Supplier;
