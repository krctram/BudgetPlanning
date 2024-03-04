import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./BudgetCategory.module.scss";
import {
  Label,
  DetailsList,
  SelectionMode,
  IColumn,
  DetailsListLayoutMode,
  Modal,
  TextField,
  IDetailsListStyles,
  SearchBox,
  DefaultButton,
  IIconProps,
  IconButton,
  ISearchBoxStyles,
  Icon,
  ITextFieldStyles,
  IModalStyles,
} from "@fluentui/react";
import { Config } from "../../../globals/Config";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import SPServices from "../../../CommonServices/SPServices";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import commonServices from "../../../CommonServices/CommonServices";
import Pagination from "office-ui-fabric-react-pagination";
import { dark } from "@material-ui/core/styles/createPalette";

interface ICountryList {
  Country: string;
  Validate: boolean;
}

interface IPagination {
  totalPageItems: number;
  pagenumber: number;
}

const addIcon: IIconProps = { iconName: "Add" };
let isCheckDuplicate: boolean = false;
let countryName: string = "";
let _isAdminView: boolean = false;

const Country = (props: any): JSX.Element => {
  /* Variable creation */
  _isAdminView = props.groupUsers.isSuperAdminView;

  const Columns: IColumn[] = [
    {
      key: "column1",
      name: "Country",
      fieldName: "Country",
      minWidth: 400,
      maxWidth: 500,
      onRender: (item: any) => {
        return item.isEdit ? (
          <div>
            <TextField
              value={editCountry.Country ? editCountry.Country : ""}
              styles={isValid ? errtxtFieldStyle : textFieldStyle}
              placeholder="Enter Here"
              onChange={(e: any) => {
                isCheckDuplicate = true;
                editCountry.Country = e.target.value.trimStart();
                setEditCountry({ ...editCountry });
              }}
            />
          </div>
        ) : (
          item.Country
        );
      },
    },
    {
      key: "column2",
      name: "Action",
      minWidth: 200,
      maxWidth: 500,
      onRender: (item: any, index: number) => {
        return item.isEdit ? (
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
                _getValidation(index);
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
                _getEditFunction({ ...item }, "Cancel");
              }}
            />
          </div>
        ) : (
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
                _getEditFunction({ ...item }, "Edit");
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
                setIsDeletePopup({ isDelete: true, Id: item.ID });
                // _getEditFunction({ ...item }, "Edit");
              }}
            />
          </div>
        );
      },
    },
  ];
  _isAdminView && Columns.pop();

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [istrigger, setIstrigger] = useState<boolean>(false);
  const [countryPopup, setCountryPopup] = useState<boolean>(false);
  const [MData, setMData] = useState<any[]>([]);
  const [master, setMaster] = useState<ICountryList[]>([]);
  const [items, setItems] = useState<ICountryList[]>([]);
  const [newCountry, setNewCountry] = useState<ICountryList[]>([
    {
      Country: "",
      Validate: false,
    },
  ]);
  const [pagination, setPagination] = useState<IPagination>({
    totalPageItems: 10,
    pagenumber: 1,
  });
  const [editCountry, setEditCountry] = useState<any>();
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isDeletePopup, setIsDeletePopup] = useState({
    isDelete: false,
    Id: null,
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

  const countryPopupStyle = {
    main: {
      padding: "10px 20px",
      borderRadius: 4,
      width: "20%",
      height: "auto !important",
      minHeight: "none",
    },
  };

  const countryinputStyle = {
    root: {
      marginRight: 6,
    },
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const countryErrorStyle = {
    root: {
      marginRight: 6,
    },
    fieldGroup: {
      border: "1px solid red !important",
      "::after": {
        border: "1px solid red !important",
      },
    },
  };

  const iconStyle = {
    rootHovered: {
      background: "transparent !important",
    },
  };

  const saveBtnStyle = {
    root: {
      border: "none",
      height: 32,
      color: "#fff",
      background: "#2580e0 !important",
      borderRadius: 3,
      width: "26%",
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
      width: "26%",
    },
    rootHovered: {
      background: "#dc3120",
      color: "#fff",
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

  const searchStyle: Partial<ISearchBoxStyles> = {
    root: {
      width: 240,
      height: 33,
      "::after": {
        border: "1px solid rgb(96, 94, 92) !important",
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
  const _getErrorFunction = (errMsg: string, name: string): void => {
    console.log(name, errMsg);
    alertify.error(name);
    setIsLoader(false);
  };

  const getMasterCountryData = (): void => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CountryList,
      Topcount: 5000,
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
    })
      .then((resMasCountry) => {
        let countryListData = [];
        if (resMasCountry.length) {
          resMasCountry.forEach((countryData) => {
            countryListData.push({
              ID: countryData["ID"],
              Country: countryData[Config.CountryListColumns.Title],
              isEdit: false,
            });
          });
          setMData([...countryListData]);
          setMaster([...countryListData]);
        } else {
          setMData([...countryListData]);
          setMaster([...countryListData]);
        }
      })
      .catch((err) => _getErrorFunction(err, "get country data"));
  };

  const countryValidation = (arr: ICountryList[]): ICountryList[] => {
    let newAddData = [];
    let DuplicateData = [];

    arr.forEach((dData) => {
      if (
        dData.Country.trim() != "" &&
        [...MData].filter((mdata) => {
          return (
            mdata.Country.trim().toLowerCase() ==
            dData.Country.trim().toLowerCase()
          );
        }).length == 0
      ) {
        let OriginalFlagChange = {
          ...dData,
          Validate: false,
        };
        DuplicateData.push(OriginalFlagChange);
      } else {
        if (dData.Country.trim() != "") {
          countryName = dData.Country;
          let DuplicateFlagChange = {
            ...dData,
            Validate: true,
          };
          DuplicateData.push(DuplicateFlagChange);
          alertify.error(`The  Country "${countryName}" was already exists`);
        } else {
          let EmptyData = {
            ...dData,
            Validate: true,
          };
          DuplicateData.push(EmptyData);
          alertify.error("Please Enter The Country");
        }
      }
    });

    DuplicateData.forEach((item) => {
      if (
        newAddData.findIndex((items) => {
          return (
            items.Country.trim().toLowerCase() ==
            item.Country.trim().toLowerCase()
          );
        }) == -1
      ) {
        newAddData.push(item);
      } else {
        let DuplicateDataFlagChange = {
          ...item,
          Validate: true,
        };
        countryName = item.Country;
        newAddData.push(DuplicateDataFlagChange);
        alertify.error(`The  Country "${countryName}" was already exists`);
      }
    });

    setNewCountry([...newAddData]);

    return newAddData;
  };

  const addMasterCountryData = (CountryItems: ICountryList[]) => {
    let mascountryData = [];
    let authentication = false;

    let validationData = countryValidation([...CountryItems]);
    authentication = validationData.every((val) => {
      return val.Validate == false;
    });

    authentication &&
      [...validationData].forEach((e: any) => {
        mascountryData.push({
          Title: e.Country,
        });
      });

    if (authentication) {
      if (mascountryData.length > 0) {
        SPServices.batchInsert({
          ListName: Config.ListNames.CountryList,
          responseData: mascountryData,
        })
          .then((result) => {
            setNewCountry([{ Country: "", Validate: false }]);
            setIstrigger(!istrigger);
            setCountryPopup(false);
            setIsLoader(false);
          })
          .catch((err) => _getErrorFunction(err, "Add country data"));
      } else {
        setNewCountry([{ Country: "", Validate: false }]);
        setIsLoader(false);
      }
    } else {
      setIsLoader(false);
    }
  };

  const addCountryData = (index: number, data: string) => {
    let addData = [...newCountry];
    addData[index].Country = data;
    setNewCountry([...addData]);
  };

  const deleteCountry = (index: number) => {
    let delcountry = [...newCountry];
    delcountry.splice(index, 1);
    setNewCountry([...delcountry]);
  };

  const addCountry = (index: number) => {
    let validData = countryValidation([...newCountry]);
    if (
      [...validData].every((val) => {
        return val.Validate == false;
      })
    ) {
      let addcountrydata = [...validData];
      addcountrydata.push({
        Country: "",
        Validate: false,
      });
      setNewCountry([...addcountrydata]);
    }
  };

  const searchData = (data: string) => {
    setPagination({ ...pagination, pagenumber: 1 });
    let searchdata = [...MData].filter((value) => {
      return value.Country.toLowerCase().includes(data.trim().toLowerCase());
    });
    setMaster([...searchdata]);
  };

  const _getEditFunction = (_Item: any, type: string): void => {
    let _preArray: any[] = [];
    if (type === "Edit") {
      for (let i: number = 0; MData.length > i; i++) {
        if (_Item.ID === MData[i].ID) {
          MData[i].isEdit = true;
          _preArray.push({ ...MData[i] });
        } else {
          MData[i].isEdit = false;
          _preArray.push({ ...MData[i] });
        }

        if (MData.length === _preArray.length) {
          setEditCountry({ ..._Item });
          setIsValid(false);
          setMData([..._preArray]);
          setMaster([..._preArray]);
        }
      }
    } else {
      isCheckDuplicate = false;
      for (let i: number = 0; MData.length > i; i++) {
        MData[i].isEdit = false;
        _preArray.push({ ...MData[i] });

        if (MData.length === _preArray.length) {
          setIsValid(false);
          setMData([..._preArray]);
          setMaster([..._preArray]);
        }
      }
    }
  };

  const _getValidation = (index: number): void => {
    let _masCountry: any[] = [...MData];
    let _isValid: boolean = false;

    if (!editCountry.Country) {
      _isValid = true;
      setIsValid(_isValid);
      alertify.error("Please Enter The Country");
    } else {
      if (isCheckDuplicate) {
        // _masCountry = [..._masCountry].filter((value:any)=>value.Country.toLowerCase() !== editCountry.Country.toLowerCase())
        _isValid = _masCountry.some(
          (e: any, indx) =>
            e.Country.toLowerCase() === editCountry.Country.toLowerCase() &&
            index !== indx
        );
        countryName = editCountry.Country;
        _isValid &&
          alertify.error(`The Country "${countryName}" already exists`);
      }
      isCheckDuplicate = true;
      setIsValid(_isValid);
    }

    !_isValid && (setIsLoader(true), _getUpdateFun());
  };

  const _getUpdateFun = (): void => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CountryList,
      ID: editCountry.ID,
      RequestJSON: {
        Title: editCountry.Country,
      },
    })
      .then((res: any) => {
        let _masArray: any[] = [...MData];
        let index: number = [...MData].findIndex(
          (value) => value.ID === editCountry.ID
        );
        editCountry.isEdit = false;
        _masArray.splice(index, 1, { ...editCountry });

        if (MData.length === _masArray.length) {
          setMData([..._masArray]);
          setMaster([..._masArray]);
          setIsValid(false);
          setIsLoader(false);
          countryName = editCountry.Country;
          alertify.success(
            `The country ${countryName} was updated successfully`
          );
          isCheckDuplicate = false;
        }
      })
      .catch((err: any) => {
        _getErrorFunction(err, "Update country data");
      });
  };

  const handleDelete = () => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CountryList,
      ID: isDeletePopup.Id,
      RequestJSON: { IsDeleted: true },
    })
      .then((delItem) => {
        let _masArray: any[] = [...MData];
        let index: number = [...MData].findIndex(
          (value) => value.ID === isDeletePopup.Id
        );
        _masArray.splice(index, 1);
        setMData([..._masArray]);
        setMaster([..._masArray]);
        setIsDeletePopup({
          isDelete: false,
          Id: null,
        });
        setIsLoader(false);
      })

      .catch((err) => {
        _getErrorFunction(err, "Country delete");
      });
  };

  useEffect(() => {
    let masterData = commonServices.paginateFunction(
      pagination.totalPageItems,
      pagination.pagenumber,
      master
    );
    setItems(masterData.displayitems);
  }, [pagination, master]);

  useEffect(() => {
    getMasterCountryData();
  }, [istrigger]);

  return isLoader ? (
    <Loader />
  ) : (
    <div>
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
        <Label className={styles.HeaderLable}>Budget Country</Label>
      </div>

      {/* Filter & btn section */}
      <div className={styles.countryModalBtnSec}>
        <div className={styles.countryModalSearchBox}>
          {/* search section */}
          <SearchBox
            styles={searchStyle}
            placeholder="Search"
            onChange={(val, text) => searchData(text)}
          />
        </div>
        {!_isAdminView && (
          <div>
            {/*Counter Add Btn section*/}
            <DefaultButton
              text="New Country"
              styles={btnStyle}
              iconProps={addIcon}
              onClick={() => setCountryPopup(true)}
            />
          </div>
        )}
      </div>

      {/* Details list section */}
      <DetailsList
        items={[...items]}
        columns={Columns}
        styles={_DetailsListStyle}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
      {items.length == 0 && (
        <div className={styles.noRecords}>No data found !!!</div>
      )}
      {master.length > 0 && (
        <Pagination
          currentPage={pagination.pagenumber}
          totalPages={Math.ceil(master.length / pagination.totalPageItems)}
          onChange={(page) =>
            setPagination({ ...pagination, pagenumber: page })
          }
        />
      )}

      {/*Country Modal */}
      <Modal isOpen={countryPopup} styles={countryPopupStyle}>
        <div className={styles.modalHeader}>
          <h3>Add New Country</h3>
        </div>
        <div>
          {newCountry.map((val, index) => {
            return (
              <>
                <div key={index} className={styles.countryModalBox}>
                  <div className={styles.contryTextField}>
                    <TextField
                      styles={
                        val.Validate ? countryErrorStyle : countryinputStyle
                      }
                      type="text"
                      value={val.Country}
                      placeholder="Enter The Country"
                      onChange={(e, text) => addCountryData(index, text)}
                    />
                  </div>
                  <div>
                    {newCountry.length > 1 && newCountry.length != index + 1 ? (
                      <IconButton
                        styles={iconStyle}
                        iconProps={{
                          iconName: "Delete",
                        }}
                        style={{ color: "red" }}
                        title="Delete"
                        ariaLabel="Delete"
                        onClick={() => deleteCountry(index)}
                      />
                    ) : (
                      <div>
                        {newCountry.length > 1 && (
                          <IconButton
                            styles={iconStyle}
                            iconProps={{
                              iconName: "Delete",
                            }}
                            style={{ color: "red" }}
                            title="Delete"
                            ariaLabel="Delete"
                            onClick={() => deleteCountry(index)}
                          />
                        )}
                        <IconButton
                          styles={iconStyle}
                          iconProps={{
                            iconName: "Add",
                          }}
                          style={{ color: "#000" }}
                          title="Add"
                          ariaLabel="Add"
                          onClick={() => addCountry(index)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <DefaultButton
            styles={cancelBtnStyle}
            text={"Cancel"}
            onClick={() => {
              setNewCountry([{ Country: "", Validate: false }]);
              setCountryPopup(false);
            }}
          />
          <DefaultButton
            styles={saveBtnStyle}
            text={"Save"}
            onClick={() => {
              setIsLoader(true);
              addMasterCountryData([...newCountry]);
            }}
          />
        </div>
      </Modal>
      <Modal
        isOpen={isDeletePopup.isDelete}
        isBlocking={false}
        styles={modalStyles}
      >
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
            Do you want to delete this country?
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
                // setIsDelModal(false);
                // deleteId = null;
                setIsDeletePopup({
                  isDelete: false,
                  Id: null,
                });
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
    </div>
  );
};
export default Country;
