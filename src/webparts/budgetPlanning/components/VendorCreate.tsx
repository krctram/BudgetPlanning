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
  ITextFieldStyles,
  SearchBox,
  DefaultButton,
  IIconProps,
  IconButton,
  ISearchBoxStyles,
  IButtonStyles,
  IModalStyles,
  Dropdown,
} from "@fluentui/react";
import { Config } from "../../../globals/Config";
import Loader from "./Loader";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import SPServices from "../../../CommonServices/SPServices";
import { _getFilterDropValues } from "../../../CommonServices/DropFunction";
import commonServices from "../../../CommonServices/CommonServices";
import Pagination from "office-ui-fabric-react-pagination";
// import styles from "./VendorCreate.module.scss";

interface IVendorList {
  VendorId: number;
  Vendor: string;
  Validate: boolean;
}
interface IDeleteVendor {
  DeleteFlag: boolean;
  DeleteId: number;
}
interface IPagination {
  totalPageItems: number;
  pagenumber: number;
}

const addIcon: IIconProps = { iconName: "Add" };

const VendorCreate = (props: any): JSX.Element => {
  const Columns: IColumn[] = [
    {
      key: "column1",
      name: "Vendor",
      fieldName: "Vendor",
      minWidth: 200,
      maxWidth: 500,
    },
    {
      key: "column2",
      name: "Action",
      fieldName: "Action",
      minWidth: 200,
      maxWidth: 500,
      onRender: (item) => {
        return (
          <IconButton
            styles={iconStyle}
            iconProps={{
              iconName: "Delete",
            }}
            style={{ color: "red" }}
            title="Delete"
            ariaLabel="Delete"
            onClick={() =>
              setDeletePopup({ DeleteFlag: true, DeleteId: item.VendorId })
            }
          />
        );
      },
    },
  ];
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [istrigger, setIstrigger] = useState<boolean>(false);
  const [vendorPopup, setVendorPopup] = useState<boolean>(false);
  const [MData, setMData] = useState<IVendorList[]>([]);
  const [master, setMaster] = useState<IVendorList[]>([]);
  const [items, setItems] = useState<IVendorList[]>([]);
  const [deletePopup, setDeletePopup] = useState<IDeleteVendor>({
    DeleteFlag: false,
    DeleteId: null,
  });
  const [newVendor, setNewVendor] = useState<IVendorList[]>([
    {
      VendorId: null,
      Vendor: "",
      Validate: false,
    },
  ]);
  const [pagination, setPagination] = useState<IPagination>({
    totalPageItems: 10,
    pagenumber: 1,
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

  const vendorPopupStyle = {
    main: {
      padding: "10px 20px",
      borderRadius: 4,
      width: "20%",
      height: "auto !important",
      minHeight: "none",
    },
  };

  const vendorDeletePopupStyle: Partial<IModalStyles> = {
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

  const vendorinputStyle = {
    root: {
      marginRight: 6,
    },
    fieldGroup: {
      "::after": {
        border: "1px solid rgb(96, 94, 92)",
      },
    },
  };

  const vendorErrorStyle = {
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
      // marginRight: 10,
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

  const _getErrorFunction = (errMsg: any, name: string): void => {
    console.log(name, errMsg);
    alertify.error(name);
    setIsLoader(false);
  };

  const getMastervendorendorData = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.VendorList,
      Filter: [
        {
          FilterKey: "isDeleted",
          FilterValue: "1",
          Operator: "ne",
        },
      ],
      Topcount: 5000,
      Orderbydecorasc: false,
    })
      .then((resMasVendor) => {
        let vendorListData = [];
        if (resMasVendor.length) {
          resMasVendor.forEach((vendorData) => {
            vendorListData.push({
              VendorId: vendorData["Id"],
              Vendor: vendorData["Title"],
            });
          });
          setMData([...vendorListData]);
          setMaster([...vendorListData]);
        } else {
          setMData([...vendorListData]);
          setMaster([...vendorListData]);
        }
      })
      .catch((err) => _getErrorFunction(err, "Get vendor"));
  };

  const vendorValidation = (arr: IVendorList[]): IVendorList[] => {
    let newAddData = [];
    let DuplicateData = [];

    arr.forEach((dData) => {
      if (
        dData.Vendor.trim() != "" &&
        MData.filter((mdata) => {
          return (
            mdata.Vendor.trim().toLowerCase() ==
            dData.Vendor.trim().toLowerCase()
          );
        }).length == 0
      ) {
        let OriginalFlagChange = {
          ...dData,
          Validate: false,
        };
        DuplicateData.push(OriginalFlagChange);
      } else {
        if (dData.Vendor.trim() != "") {
          let DuplicateFlagChange = {
            ...dData,
            Validate: true,
          };
          DuplicateData.push(DuplicateFlagChange);
          alertify.error("Already Vendor exists");
        } else {
          let EmptyData = {
            ...dData,
            Validate: true,
          };
          DuplicateData.push(EmptyData);
          alertify.error("Please Enter The Vendor");
        }
      }
    });

    DuplicateData.forEach((item) => {
      if (
        newAddData.findIndex((items) => {
          return (
            items.Vendor.trim().toLowerCase() ==
            item.Vendor.trim().toLowerCase()
          );
        }) == -1
      ) {
        newAddData.push(item);
      } else {
        let DuplicateDataFlagChange = {
          ...item,
          Validate: true,
        };
        newAddData.push(DuplicateDataFlagChange);
        alertify.error("Already Vendor exists");
      }
    });

    setNewVendor([...newAddData]);

    return newAddData;
  };

  const addMasterVendorData = (VendorItems: IVendorList[]) => {
    let masVendorData = [];
    let authentication = false;

    let validationData = vendorValidation([...VendorItems]);
    authentication = validationData.every((val) => {
      return val.Validate == false;
    });

    authentication &&
      [...validationData].forEach((e: any) => {
        masVendorData.push({
          Title: e.Vendor,
        });
      });

    if (authentication) {
      if (masVendorData.length > 0) {
        SPServices.batchInsert({
          ListName: Config.ListNames.VendorList,
          responseData: masVendorData,
        })
          .then((result) => {
            setNewVendor([{ VendorId: null, Vendor: "", Validate: false }]);
            setVendorPopup(false);
            setIsLoader(false);
            setIstrigger(!istrigger);
          })
          .catch((err) => _getErrorFunction(err, "Add masvendor"));
      } else {
        setNewVendor([{ VendorId: null, Vendor: "", Validate: false }]);
        setIsLoader(false);
      }
    } else {
      setIsLoader(false);
    }
  };

  const addVendorData = (index: number, data: string) => {
    let addData = [...newVendor];
    addData[index].Vendor = data;
    setNewVendor([...addData]);
  };

  const deleteVendor = (index: number) => {
    let delVendor = [...newVendor];
    delVendor.splice(index, 1);
    setNewVendor([...delVendor]);
  };

  const addVendor = (index: number) => {
    let validData = vendorValidation([...newVendor]);
    if (
      [...validData].every((val) => {
        return val.Validate == false;
      })
    ) {
      let addvendordata = [...validData];
      addvendordata.push({
        VendorId: null,
        Vendor: "",
        Validate: false,
      });
      setNewVendor([...addvendordata]);
    }
  };

  const deleteVendorItem = (itemID) => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.VendorList,
      RequestJSON: { isDeleted: true },
      ID: itemID,
    })
      .then((resDelItem) => {
        setDeletePopup({ DeleteFlag: false, DeleteId: null });
        setIsLoader(false);
        setIstrigger(!istrigger);
      })
      .catch((err) => {
        _getErrorFunction(err, "Delete vendor");
      });
  };

  const searchData = (data: string) => {
    setPagination({ ...pagination, pagenumber: 1 });
    let searchdata = [...MData].filter((value) => {
      return value.Vendor.toLowerCase().includes(data.trim().toLowerCase());
    });
    setMaster([...searchdata]);
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
    getMastervendorendorData();
  }, [istrigger]);

  return isLoader ? (
    <Loader />
  ) : (
    <div>
      <Label className={styles.HeaderLable}>Budget Vendor</Label>
      <div className={styles.countryModalBtnSec}>
        <div className={styles.countryModalSearchBox}>
          {/* search section */}
          <SearchBox
            styles={searchStyle}
            placeholder="Search"
            onChange={(val, text) => searchData(text)}
          />
        </div>
        <div>
          {/*Vendor Add Btn section*/}
          <DefaultButton
            text="New Vendor"
            styles={btnStyle}
            iconProps={addIcon}
            onClick={() => setVendorPopup(true)}
          />
        </div>
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
      {/*Vendor Modal */}
      <Modal isOpen={vendorPopup} styles={vendorPopupStyle}>
        <div className={styles.modalHeader}>
          <h3>Add New Vendor</h3>
        </div>
        <div>
          {newVendor.map((val, index) => {
            return (
              <>
                <div key={index} className={styles.countryModalBox}>
                  <div className={styles.contryTextField}>
                    <TextField
                      styles={
                        val.Validate ? vendorErrorStyle : vendorinputStyle
                      }
                      type="text"
                      value={val.Vendor}
                      placeholder="Enter The Vendor"
                      onChange={(e, text) => addVendorData(index, text)}
                    />
                  </div>
                  <div>
                    {newVendor.length > 1 && newVendor.length != index + 1 ? (
                      <IconButton
                        styles={iconStyle}
                        iconProps={{
                          iconName: "Delete",
                        }}
                        style={{ color: "red" }}
                        title="Delete"
                        ariaLabel="Delete"
                        onClick={() => deleteVendor(index)}
                      />
                    ) : (
                      <div>
                        {newVendor.length > 1 && (
                          <IconButton
                            styles={iconStyle}
                            iconProps={{
                              iconName: "Delete",
                            }}
                            style={{ color: "red" }}
                            title="Delete"
                            ariaLabel="Delete"
                            onClick={() => deleteVendor(index)}
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
                          onClick={() => addVendor(index)}
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
              setNewVendor([{ VendorId: null, Vendor: "", Validate: false }]);
              setVendorPopup(false);
            }}
          />
          <DefaultButton
            styles={saveBtnStyle}
            text={"Save"}
            onClick={() => {
              setIsLoader(true);
              addMasterVendorData([...newVendor]);
            }}
          />
        </div>
      </Modal>
      {/*Delete Modal */}
      <Modal isOpen={deletePopup.DeleteFlag} styles={vendorDeletePopupStyle}>
        <div>
          <div style={{ textAlign: "center" }}>
            <Label style={{ color: "red", fontSize: 16 }}>
              Do you want to delete this Vendor?
            </Label>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6%",
              marginTop: 20,
            }}
          >
            <div className={styles.deleteIconCircle}>
              <IconButton
                className={styles.deleteImg}
                iconProps={{ iconName: "Delete" }}
              />
            </div>

            <DefaultButton
              styles={cancelBtnStyle}
              text={"No"}
              onClick={() => {
                setDeletePopup({ DeleteFlag: false, DeleteId: null });
              }}
            />
            <DefaultButton
              styles={saveBtnStyle}
              text={"Yes"}
              onClick={() => {
                setIsLoader(true);
                deleteVendorItem(deletePopup.DeleteId);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default VendorCreate;
