import * as React from "react";
import styles from "./CountryConfig.module.scss";
import Loader from "./Loader";
import {
  DefaultButton,
  DetailsList,
  Dropdown,
  IDetailsListStyles,
  IDropdownStyles,
  IIconProps,
  IModalStyles,
  Icon,
  IconButton,
  Label,
  Modal,
  Persona,
  PersonaSize,
  SelectionMode,
  TextField,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import {
  ICountryAdminData,
  ICountryConfigData,
  ICountryConfigItems,
  IDrop,
  IDropdowns,
  IGroupUsers,
  IUpdateValidation,
} from "../../../globalInterFace/BudgetInterFaces";
import SPServices from "../../../CommonServices/SPServices";
import { Config } from "../../../globals/Config";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Item } from "@pnp/sp/items";
import Pagination from "office-ui-fabric-react-pagination";
import { _filterArray } from "../../../CommonServices/filterCommonArray";

let _isAdminView: boolean = false;
const addIcon: IIconProps = { iconName: "Add" };
let propDropValue: IDropdowns;
let deleteId: number = null;
let modalText = "";
let isUserPermissions: IGroupUsers;

interface IPagination {
  perPage: number;
  currentPage: number;
}

const CountryConfig = (props: any): JSX.Element => {
  /* Variable creation */
  propDropValue = { ...props.dropValue };
  // console.log("props", props);

  _isAdminView = props.groupUsers.isSuperAdminView;
  isUserPermissions = { ...props.groupUsers };

  let areaDropValue: IDrop[] = [...propDropValue.Area];
  areaDropValue.shift();
  let countryDropValue: IDrop[] = [...propDropValue.Country];
  countryDropValue.shift();

  let isNewConfig: boolean = countryDropValue.length ? false : true;

  const columns = [
    {
      key: "column1",
      name: "Area",
      fieldName: "Area",
      minWidth: 200,
      maxWidth: 300,
    },
    {
      key: "column2",
      name: "Country",
      fieldName: "Country",
      minWidth: 200,
      maxWidth: 300,
    },
    {
      key: "column3",
      name: "Admins",
      // fieldName: "Admins",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ICountryConfigItems, index: number) => {
        if (item.IsEdit) {
          let selectedUsers = [...inputData.Admins].map(
            (users: ICountryAdminData) => users.Email
          );
          return (
            <PeoplePicker
              // titleText="Admins"
              styles={{
                root: {
                  ".ms-BasePicker-text": {
                    border:
                      isUpdateValidation.emty || isUpdateValidation.duplicate
                        ? " 1px solid red"
                        : "1px solid #605e5b",
                    "::after": {
                      border: "none",
                    },
                    minHeigth: 36,
                    maxHeight: 70,
                    overflowX: "hidden",
                    // padding: "3px 5px",
                  },
                },
              }}
              disabled={false}
              context={props.context.context}
              placeholder={`Insert area admins`}
              personSelectionLimit={10}
              showtooltip={true}
              ensureUser={true}
              showHiddenInUI={false}
              principalTypes={[PrincipalType.User]}
              resolveDelay={1000}
              onChange={(users) => getPeoplePickerItems(users, index, "Edit")}
              defaultSelectedUsers={[...selectedUsers]}
              required={false}
              //groupName={""} // Leave this blank in case you want to filter from all users
            />
          );
        } else {
          return (
            <div
              style={{
                display: "flex",
              }}
            >
              {item.Admins.map((value: ICountryAdminData) => {
                return (
                  <Persona
                    styles={{
                      root: {
                        margin: "0 !important;",
                        ".ms-Persona-details": {
                          display: "none",
                        },
                      },
                    }}
                    imageUrl={
                      "/_layouts/15/userphoto.aspx?size=S&username=" +
                      value.Email
                    }
                    title={value.Title}
                    size={PersonaSize.size32}
                  />
                );
              })}
            </div>
          );
        }
      },
    },
    {
      key: "column4",
      name: "Action",
      fieldName: "Action",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: ICountryConfigItems, index: number) => {
        if (item.IsEdit) {
          return (
            <div
              style={{
                display: "flex",
                gap: "1%",
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
                  handleModalUpdate(index);
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
                  setIsUpdateValidation({ ...Config.UpdateValidation });
                  handleEdit(index, "Close");
                }}
              />
            </div>
          );
        } else {
          return (
            <div
              style={{
                display: "flex",
                gap: "1%",
              }}
            >
              <Icon
                iconName="Edit"
                style={{
                  color: "blue",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleEdit(index, "Edit");
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
                  deleteId = item.ID;
                  setIsDelModal(true);
                }}
              />
            </div>
          );
        }
      },
    },
  ];

  _isAdminView && columns.pop();

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [filAreaDrop, setAreaDrop] = useState<string>("All");
  const [filCountryDrop, setCountryDrop] = useState<string>("All");
  const [allItems, setAllItems] = useState<ICountryConfigItems[]>([]);
  const [viewItems, setViewItems] = useState<ICountryConfigItems[]>([]);
  const [items, setItems] = useState<ICountryConfigItems[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDelModal, setIsDelModal] = useState<boolean>(false);
  const [isUpdateValidation, setIsUpdateValidation] =
    useState<IUpdateValidation>({
      ...Config.UpdateValidation,
    });
  // const [isValidation, setIsValidation] = useState<ICountryConfigValidation[]>([]);
  const [data, setData] = useState<ICountryConfigData[]>([
    {
      ...Config.CountryConfigData,
      isAdd: false,
      Area: areaDropValue ? areaDropValue[0].text : "",
      Country: countryDropValue.length ? countryDropValue[0].text : "",
      CountryId: countryDropValue.length ? countryDropValue[0].ID : null,
    },
  ]);
  const [inputData, setInputData] = useState({ ...Config.CountryConfigInput });
  const [pagination, setPagination] = useState<IPagination>({
    perPage: 10,
    currentPage: 1,
  });

  // console.log("data", data);
  // console.log("inputData", inputData);

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

  const ModalDropdownStyle: Partial<IDropdownStyles> = {
    root: {
      width: "28%",
      ".ms-Dropdown-container": {
        width: "100%",
      },
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const ErrModalDropdownStyle: Partial<IDropdownStyles> = {
    root: {
      width: "28%",
      ".ms-Dropdown-container": {
        width: "100%",
      },
      ".ms-Dropdown-title": {
        border: "1px solid red",
      },
    },
    dropdown: {
      ":focus::after": {
        border: "1px solid rgb(96, 94, 92)",
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

  const saveBtnStyle = {
    root: {
      border: "none",
      height: 32,
      color: "#fff",
      background: "#2580e0 !important",
      borderRadius: 3,
      width: "18%",
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
      width: "18%",
    },
    rootHovered: {
      background: "#dc3120",
      color: "#fff",
    },
  };

  const iconStyle = {
    rootHovered: {
      background: "transparent !important",
    },
  };

  const countryPopupStyle = {
    main: {
      padding: "10px 20px",
      borderRadius: 4,
      width: "40%",
      height: "auto !important",
      minHeight: "none",
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

  /* function creation */
  const _getErrorFunction = (errMsg: string): void => {
    alertify.error(errMsg);
    setIsLoader(false);
  };

  const getDefaultFunction = () => {
    setIsLoader(true);
    getAllData();
  };

  const getAllData = async () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CountryConfig,
      Select: "*,Country/Title,AreaAdmins/Title,AreaAdmins/EMail,AreaAdmins/ID",
      Expand: "Country,AreaAdmins",
      Filter: [
        {
          FilterKey: "isDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
    })
      .then((result: any) => {
        if (result.length) {
          // console.log("result", result);
          setAllData(result);
        } else {
          setAllItems([]);
          setItems([]);
          setViewItems([]);
          setIsLoader(false);
        }
      })
      .catch((error) => _getErrorFunction("get country configration"));
  };

  const setAllData = (datas: any) => {
    let itms: ICountryConfigItems[] = [];
    datas.forEach((value: any) => {
      let admins = [];

      value.AreaAdmins.forEach((val: any) => {
        admins.push({
          Title: val.Title ? val.Title : "",
          Email: val.EMail ? val.EMail : "",
          EmailId: val.ID ? val.ID : "",
        });
      });

      itms.push({
        ID: value.ID,
        Area: value.Area ? value.Area : "",
        Country: value.Country.Title ? value.Country.Title : "",
        Admins: [...admins],
        IsEdit: false,
      });
    });

    let _filArray: ICountryConfigItems[] = _filterArray(
      isUserPermissions,
      [...itms],
      Config.Navigation.CountryConfig
    );

    if (_filArray.length) {
      setAllItems([..._filArray]);
      handleFilter([..._filArray], filAreaDrop, filCountryDrop);
    } else {
      setAllItems([]);
      setViewItems([]);
      setIsLoader(false);
    }
  };

  const handleFilter = (
    datas: ICountryConfigItems[],
    Area: string,
    Country: string
  ) => {
    let itms: ICountryConfigItems[] = [...datas];

    if (Area !== "All") {
      itms = [...itms].filter(
        (value: ICountryConfigItems) => value.Area === Area
      );
    }

    if (Country !== "All") {
      itms = [...itms].filter(
        (value: ICountryConfigItems) => value.Country === Country
      );
    }

    setViewItems(itms);
    setPaginationData(itms, 1);
    setIsLoader(false);
  };

  const setPaginationData = async (
    viewDatas: ICountryConfigItems[],
    currentPage: number
  ) => {
    let startIndex = (currentPage - 1) * pagination.perPage;
    let endIndex = startIndex + pagination.perPage;
    let itms = [...viewDatas].slice(startIndex, endIndex);
    setPagination({ ...pagination, currentPage: currentPage });
    setItems(itms);
  };

  const getPeoplePickerItems = (datas: any[], index: number, type: string) => {
    // console.log("items", items);
    let isAdd = type === "add";
    let users: ICountryAdminData[] = [];
    if (datas.length) {
      datas.forEach((value: any) => {
        users.push({
          Title: value.text,
          Email: value.secondaryText,
          EmailId: value.id,
        });
      });
    }

    if (isAdd) {
      let datas = [...data];
      datas[index].Email = users;
      setData(datas);
    } else {
      setInputData({ ...inputData, Admins: users });
    }

    // setValue({...value,EmailId:items[0].id,Email:items[0].secondaryText})
  };

  const Validation = (allDatas: any, type: string): boolean => {
    let isAdd: boolean = false;
    let isUpdate = type === "Update";

    let datas = !isUpdate ? [...allDatas] : [];
    let updateValidate: IUpdateValidation = { ...Config.UpdateValidation };
    console.log("allDatas", allDatas);
    allDatas.forEach((value: any, index: number) => {
      let isEmtyValidate: boolean = false;
      let isExistValidate: boolean = false;
      if (!value.Email.length) {
        isEmtyValidate = true;
      } else {
        let emailDatas: ICountryAdminData[] = [];
        let itms: ICountryConfigItems[] = [...allItems];
        let currentDatas: ICountryConfigData[] = [...data];

        if (isUpdate) {
          let indx = [...itms].findIndex((val) => val.ID === value.ID);
          itms.splice(indx, 1);
        } else {
          currentDatas.splice(index, 1);
        }

        [...itms].forEach((val: ICountryConfigItems) => {
          if (val.Area === value.Area && val.Country === value.Country) {
            emailDatas.push(...val.Admins);
          }
        });

        [...currentDatas].forEach((val: ICountryConfigData) => {
          if (val.Area === value.Area && val.Country === value.Country) {
            emailDatas.push(...val.Email);
          }
        });

        isExistValidate = [...emailDatas].some((user: ICountryAdminData) => {
          let isDuplicate = [...value.Email].some(
            (val) => user.Email === val.Email
          );
          return isDuplicate;
        });
      }

      if (isUpdate) {
        updateValidate.emty = isEmtyValidate;
        updateValidate.duplicate = isExistValidate;
      } else {
        datas[index].IsEmailEmty = isEmtyValidate;
        datas[index].IsEmailValidate = isExistValidate;
      }
    });

    if (isUpdate) {
      isAdd = updateValidate.emty === true || updateValidate.duplicate === true;

      if (updateValidate.duplicate) {
        alertify.error("some users already exists");
      } else if (updateValidate.emty) {
        alertify.error("Please select the users");
      }

      isAdd && setIsUpdateValidation({ ...updateValidate });
    } else {
      let emailValidationCount = [...datas].filter(
        (value) => value.IsEmailValidate
      ).length;
      let emtyValidationCount = [...datas].filter(
        (value) => value.IsEmailEmty
      ).length;

      if (emailValidationCount && emtyValidationCount) {
        alertify.error("Please select the users and some users already exists");
      } else if (emailValidationCount && !emtyValidationCount) {
        alertify.error("some users already exists");
      } else if (!emailValidationCount && emtyValidationCount) {
        alertify.error("Please select the users");
      }

      isAdd = [...datas].some(
        (value) => value.IsEmailEmty || value.IsEmailValidate
      );

      isAdd && setData(datas);
    }
    return !isAdd;
  };

  const handleAdd = (value: ICountryConfigData, index: number) => {
    let isAdd: boolean = Validation(data, "Add");

    if (isAdd) {
      let datas: ICountryConfigData[] = [...data];
      datas[index].isAdd = true;
      datas[index].IsEmailEmty = false;
      datas[index].IsEmailValidate = false;
      datas.push({
        ...Config.CountryConfigData,
        Area: areaDropValue ? areaDropValue[0].text : "",
        Country: countryDropValue.length ? countryDropValue[0].text : "",
        CountryId: countryDropValue.length ? countryDropValue[0].ID : null,
      });
      setData(datas);
    }
  };

  const handleModalSave = () => {
    let isAdd: boolean = Validation(data, "Add");

    if (isAdd) {
      setIsLoader(true);

      let json: any[] = [];

      [...data].forEach((value: ICountryConfigData) => {
        json.push({
          Area: value.Area,
          CountryId: value.CountryId,
          AreaAdminsId: {
            results: [...value.Email].map((users) => users.EmailId),
          },
        });
      });
      console.log("json", json);
      addData(json);
    }
  };

  const handleDelete = (): void => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CountryConfig,
      RequestJSON: { isDeleted: true },
      ID: deleteId,
    })
      .then((res) => {
        // let index = [...items].findIndex(
        //   (value: ICountryConfigItems) => value.ID === deleteId
        // );
        // let itms = [...items];
        // itms.splice(index, 1);
        // deleteId = null;
        // setItems(itms);
        setIsDelModal(false);
        // setIsLoader(false);
        getDefaultFunction();
      })
      .catch((err) => _getErrorFunction("Country config delete"));
  };

  const addData = (json: any) => {
    SPServices.batchInsert({
      ListName: Config.ListNames.CountryConfig,
      responseData: json,
    })
      .then((result) => {
        console.log("res", result);
        alertify.success("Data added successfully");
        getDefaultFunction();
        setData([
          {
            ...Config.CountryConfigData,
            isAdd: false,
            Area: areaDropValue ? areaDropValue[0].text : "",
            Country: countryDropValue.length ? countryDropValue[0].text : "",
            CountryId: countryDropValue.length ? countryDropValue[0].ID : null,
          },
        ]);
        setIsModalOpen(false);
        setIsLoader(false);
      })
      .catch((err) => console.log("err", err));
  };

  const handleEdit = (index: number, type: string) => {
    let value: boolean = type === "Edit";
    let itms: ICountryConfigItems[] = [...items];
    let indx = [...itms].findIndex((value) => value.IsEdit === true);
    if (indx !== -1) {
      itms[indx].IsEdit = false;
    }
    itms[index].IsEdit = value;
    if (value) {
      setInputData({
        ID: itms[index].ID,
        Area: itms[index].Area,
        Country: itms[index].Country,
        Admins: itms[index].Admins,
      });
    } else {
      setInputData({ ...Config.CountryConfigInput });
    }
    setItems(itms);
  };

  const handleModalUpdate = (index: number) => {
    let values = [];

    values.push({
      Area: inputData.Area,
      Country: inputData.Country,
      Email: inputData.Admins,
      ID: inputData.ID,
    });

    let isUpdate = Validation(values, "Update");

    if (isUpdate) {
      setIsLoader(true);
      let adminId: number[] = [...inputData.Admins].map(
        (user: ICountryAdminData) => user.EmailId
      );
      let json: any = {
        AreaAdminsId: {
          results: [...adminId],
        },
      };
      SPServices.SPUpdateItem({
        Listname: Config.ListNames.CountryConfig,
        RequestJSON: json,
        ID: inputData.ID,
      })
        .then((res) => {
          // let index: number = [...items].findIndex(
          //   (value: ICountryConfigItems) => value.ID === inputData.ID
          // );
          // let itms: ICountryConfigItems[] = [...items];
          // itms[index].Admins = inputData.Admins;
          // itms[index].IsEdit = false;
          // setItems(itms);
          // setInputData({ ...Config.CountryConfigInput });
          // setIsLoader(false);
          setIsUpdateValidation({ ...Config.UpdateValidation });
          getDefaultFunction();
        })
        .catch((err) => _getErrorFunction("Country config update"));
    }
  };

  useEffect(() => {
    getDefaultFunction();
  }, []);

  return isLoader ? (
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
            props._getDropDownValues();
          }}
        />
        <Label className={styles.HeaderLable}>Country Configuration</Label>
      </div>

      <div className={styles.Header}>
        <div className={styles.HeaderFilters}>
          <div className={styles.dropdowns}>
            <div style={{ width: "32%" }}>
              <Dropdown
                styles={DropdownStyle}
                label="Area"
                options={[...propDropValue.Area]}
                selectedKey={_getFilterDropValues(
                  "Area",
                  { ...propDropValue },
                  filAreaDrop
                )}
                onChange={(e: any, text: IDrop) => {
                  handleFilter([...allItems], text.text, filCountryDrop);
                  setAreaDrop(text.text);
                }}
              />
            </div>
            <div style={{ width: "32%" }}>
              <Dropdown
                styles={DropdownStyle}
                label="Country"
                options={[...propDropValue.Country]}
                selectedKey={_getFilterDropValues(
                  "Country",
                  { ...propDropValue },
                  filCountryDrop
                )}
                onChange={(e: any, text: IDrop) => {
                  handleFilter([...allItems], filAreaDrop, text.text);
                  setCountryDrop(text.text);
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <div
                className={styles.refIcon}
                onClick={() => {
                  setIsLoader(true);
                  handleFilter([...allItems], "All", "All");
                  setAreaDrop("All");
                  setCountryDrop("All");
                }}
              >
                <Icon iconName="Refresh" style={{ color: "#ffff" }} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>
            {/*Counter Add Btn section*/}
            {!_isAdminView && (
              <DefaultButton
                text="New Config"
                styles={btnStyle}
                iconProps={addIcon}
                disabled={isNewConfig}
                onClick={() => {
                  setIsModalOpen(true);
                }}
              />
            )}
          </div>
        </div>
        {/* import btn section */}
      </div>

      <DetailsList
        columns={columns}
        items={items}
        styles={_DetailsListStyle}
        selectionMode={SelectionMode.none}
      />
      {items.length ? (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={Math.ceil(viewItems.length / pagination.perPage)}
          onChange={(page: number) => {
            let viewDatas = [...viewItems];
            let index = [...allItems].findIndex(
              (val: ICountryConfigItems) => val.IsEdit === true
            );
            if (index !== -1) {
              viewDatas[index].IsEdit = false;
              setViewItems(viewDatas);
            }
            setPaginationData(viewDatas, page);
          }}
        />
      ) : (
        <div className={styles.noRecords}>No data found !!!</div>
      )}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} styles={countryPopupStyle}>
          <div className={styles.modalHeader}>
            <h3>Add Country Configuration</h3>
          </div>
          {data.map((value, index) => {
            let selectedUsers = [];
            if (value.Email.length) {
              selectedUsers = [...value.Email].map((value) => value.Email);
            }
            let isAddBtn = index === data.length - 1;
            return (
              <div
                style={{
                  display: "flex",
                  gap: "1%",
                  padding: "5px 0px",
                }}
              >
                <Dropdown
                  styles={
                    value.IsEmailValidate
                      ? ErrModalDropdownStyle
                      : ModalDropdownStyle
                  }
                  options={[...areaDropValue]}
                  selectedKey={_getFilterDropValues(
                    "Area",
                    { ...propDropValue },
                    value.Area
                  )}
                  onChange={(e: any, text: IDrop) => {
                    let datas = [...data];
                    datas[index].Area = text.text;
                    setData(datas);
                  }}
                />

                <Dropdown
                  styles={
                    value.IsEmailValidate
                      ? ErrModalDropdownStyle
                      : ModalDropdownStyle
                  }
                  options={[...countryDropValue]}
                  selectedKey={
                    value.Country
                      ? _getFilterDropValues(
                          "Country",
                          { ...propDropValue },
                          value.Country
                        )
                      : null
                  }
                  onChange={(e: any, text: IDrop) => {
                    let datas = [...data];
                    datas[index].Country = text.text;
                    datas[index].CountryId = text.ID;
                    setData(datas);
                  }}
                />
                <div style={{ width: "30%" }}>
                  {/* {value.IsEmailValidate ? "true" : "false"} */}
                  <PeoplePicker
                    // titleText="Admins"
                    styles={{
                      root: {
                        ".ms-BasePicker-text": {
                          border:
                            value.IsEmailValidate || value.IsEmailEmty
                              ? " 1px solid red"
                              : "1px solid #605e5b",
                          "::after": {
                            border: "none",
                          },
                          minHeigth: 36,
                          maxHeight: 70,
                          overflowX: "hidden",
                          // padding: "3px 5px",
                        },
                      },
                    }}
                    disabled={false}
                    context={props.context.context}
                    placeholder={`Insert area admins`}
                    personSelectionLimit={10}
                    showtooltip={true}
                    ensureUser={true}
                    showHiddenInUI={false}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={1000}
                    onChange={(users) =>
                      getPeoplePickerItems(users, index, "add")
                    }
                    defaultSelectedUsers={[...selectedUsers]}
                    required={false}
                    //groupName={""} // Leave this blank in case you want to filter from all users
                  />
                </div>
                <div>
                  {value.isAdd && (
                    <IconButton
                      styles={iconStyle}
                      iconProps={{
                        iconName: "Delete",
                      }}
                      style={{ color: "red" }}
                      title="Delete"
                      ariaLabel="Delete"
                      onClick={() => {
                        let datas = [...data];
                        datas.splice(index, 1);
                        if (datas.length === 1) {
                          datas[0].isAdd = false;
                        }
                        setData(datas);
                      }}
                    />
                  )}
                  {isAddBtn && (
                    <IconButton
                      styles={iconStyle}
                      iconProps={{
                        iconName: "Add",
                      }}
                      style={{ color: "#000" }}
                      title="Add"
                      ariaLabel="Add"
                      onClick={() => {
                        handleAdd(value, index);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <DefaultButton
              styles={cancelBtnStyle}
              text={"Cancel"}
              onClick={() => {
                setData([
                  {
                    ...Config.CountryConfigData,
                    isAdd: false,
                    Area: areaDropValue ? areaDropValue[0].text : "",
                    Country: countryDropValue.length
                      ? countryDropValue[0].text
                      : "",
                  },
                ]);
                setIsModalOpen(false);
              }}
            />
            <DefaultButton
              styles={saveBtnStyle}
              text={"Save"}
              onClick={() => {
                handleModalSave();
              }}
            />
          </div>
        </Modal>
      )}
      {isDelModal && (
        <Modal isOpen={isDelModal} isBlocking={false} styles={modalStyles}>
          <div>
            {/* Content section */}
            {/* img */}
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
              Do you want to delete the item?
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
                  // _curItem = undefined;
                  // setIsModal(false);
                  setIsDelModal(false);
                  deleteId = null;
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
                  setIsLoader(true);
                  handleDelete();
                  // setIsLoader(true);
                  // _getUnlink();
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CountryConfig;
