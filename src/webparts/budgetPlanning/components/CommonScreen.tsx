import * as React from "react";
import { useState, useEffect } from "react";
import { Label, Icon } from "@fluentui/react";
import {
  IComScreen,
  IDrop,
  IDropdowns,
  IGroupUsers,
} from "../../../globalInterFace/BudgetInterFaces";
import { Config } from "../../../globals/Config";
import Country from "./Country";
import BudgetCategory from "./BudgetCategory";
import CategoryConfig from "./CategoryConfig";
import Loader from "./Loader";
import styles from "./CommonScreen.module.scss";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.css";
import SPServices from "../../../CommonServices/SPServices";
import * as moment from "moment";
import CountryConfig from "./CountryConfig";

let groupUsers: IGroupUsers;

const CommonScreen = (props: any): JSX.Element => {
  /* Variable creation */
  groupUsers = { ...props.groupUsers };

  const _Blocks: any[] = [
    { name: "Country", iconName: "MyNetwork" },
    { name: "Budget Category", iconName: "DocumentManagement" },
    { name: "Country Configuration", iconName: "WaitlistConfirm" },
    { name: "Category Configuration", iconName: "ContactLink" },
  ];

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [isNave, setIsNave] = useState<IComScreen>({ ...Config.ComScreen });
  const [dropValue, setDropValue] = useState<IDropdowns>(Config.dropdownValues);

  /* function creation */
  const _getErrorFunction = (errMsg: any): void => {
    alertify.error("Error message");
  };

  const _getDropDownValues = (): void => {
    setIsLoader(true);
    // get years choice function
    SPServices.SPReadItems({
      Listname: Config.ListNames.YearList,
      Orderby: Config.YearListColumns.Title,
      Orderbydecorasc: true,
    })
      .then((resType: any[]) => {
        let _yearDrop: IDrop[] = [];
        if (resType.length) {
          resType.forEach((e: any, i: number) => {
            _yearDrop.push({
              ID: e.ID,
              key: i,
              text: e.Title,
            });
          });
        } else {
          _yearDrop = [{ key: 1, text: moment().format("YYYY") }];
        }
        dropValue.Period = _yearDrop;

        // get country choice function
        SPServices.SPReadItems({
          Listname: Config.ListNames.CountryList,
          Orderby: Config.CountryListColumns.Title,
          Orderbydecorasc: true,
        })
          .then((resType: any[]) => {
            let _countryDrop: IDrop[] = [{ key: 0, text: "All" }];
            if (resType.length) {
              resType.forEach((e: any, i: number) => {
                _countryDrop.push({
                  ID: e.ID,
                  key: i + 1,
                  text: e.Title,
                });
              });
            }
            dropValue.Country = _countryDrop;

            // get type choice function
            SPServices.SPGetChoices({
              Listname: Config.ListNames.CategoryList,
              FieldName: Config.CategoryListColumns.CategoryType,
            })
              .then((resType: any) => {
                let _typeDrop: IDrop[] = [{ key: 0, text: "All" }];
                if (resType.Choices.length) {
                  resType.Choices.sort();
                  resType.Choices.forEach((e: string, i: number) => {
                    _typeDrop.push({
                      key: i + 1,
                      text: e,
                    });
                  });
                }
                dropValue.Type = _typeDrop;

                // get master category datas function
                SPServices.SPReadItems({
                  Listname: Config.ListNames.MasterCategoryList,
                  Topcount: 5000,
                })
                  .then((resMasCategory: any) => {
                    let _strMasCateArray: IDrop[] = [];
                    let _typeMasterCate: IDrop[] = [];

                    resMasCategory.length &&
                      resMasCategory.forEach((e: any) => {
                        _strMasCateArray.push({
                          key: e.ID,
                          text: e.Title,
                          Area: e.Area,
                        });
                      });

                    if (resMasCategory.length == _strMasCateArray.length) {
                      _typeMasterCate = _strMasCateArray.sort((a, b) => {
                        let _firstText: string = a.text.toLowerCase();
                        let _secondText: string = b.text.toLowerCase();
                        if (_firstText < _secondText) return -1;
                        if (_firstText > _secondText) return 1;
                      });
                    }
                    dropValue.masterCate = [..._typeMasterCate];

                    // get Vendor datas function
                    // SPServices.SPReadItems({
                    //   Listname: Config.ListNames.VendorList,
                    //   Filter: [
                    //     {
                    //       FilterKey: "isDeleted",
                    //       Operator: "ne",
                    //       FilterValue: "1",
                    //     },
                    //   ],
                    //   Topcount: 5000,
                    // })
                    //   .then((resVend: any) => {
                    //     let _strVendorArray: IDrop[] = [];
                    //     let _typeVendor: IDrop[] = [];

                    //     resVend.length &&
                    //       resVend.forEach((e: any) => {
                    //         _strVendorArray.push({
                    //           key: e.ID,
                    //           text: e.Title,
                    //         });
                    //       });

                    //     if (resVend.length == _strVendorArray.length) {
                    //       _typeVendor = _strVendorArray.sort((a, b) => {
                    //         let _firstText: string = a.text.toLowerCase();
                    //         let _secondText: string = b.text.toLowerCase();
                    //         if (_firstText < _secondText) return -1;
                    //         if (_firstText > _secondText) return 1;
                    //       });
                    //       _typeVendor.unshift({ key: 0, text: "All" });
                    //     }
                    //     dropValue.Vendor = [..._typeVendor];
                    //   })
                    //   .catch((err: any) => {
                    //     _getErrorFunction(err);
                    //   });

                    setDropValue({ ...dropValue });
                    _getNaveFun("");
                  })
                  .catch((err: any) => {
                    _getErrorFunction(err);
                  });
              })
              .catch((err: any) => {
                _getErrorFunction(err);
              });
          })
          .catch((err: any) => {
            _getErrorFunction(err);
          });
      })
      .catch((err: any) => {
        _getErrorFunction(err);
      });
  };

  const _getNaveFun = (type: string): void => {
    if (type === "Country") {
      setIsNave({ ...isNave, isCountry: true });
    }
    if (type === "Budget Category") {
      setIsNave({ ...isNave, isBudgetCategory: true });
    }
    if (type === "Country Configuration") {
      setIsNave({ ...isNave, isCountryConfig: true });
    }
    if (type === "Category Configuration") {
      setIsNave({ ...isNave, isCategoryConfig: true });
    }
    if (type === "") {
      setIsNave({ ...Config.ComScreen });
    }
    setIsLoader(false);
  };

  /* Life cycle of onload */
  useEffect(() => {
    _getDropDownValues();
  }, []);

  return isLoader ? (
    <Loader />
  ) : (
    <div className={styles.container}>
      {isNave.isCountry ? (
        <Country
          dropValue={dropValue}
          groupUsers={groupUsers}
          _getDropDownValues={_getDropDownValues}
        />
      ) : isNave.isBudgetCategory ? (
        <BudgetCategory
          dropValue={dropValue}
          groupUsers={groupUsers}
          _getDropDownValues={_getDropDownValues}
        />
      ) : isNave.isCategoryConfig ? (
        <CategoryConfig
          dropValue={dropValue}
          groupUsers={groupUsers}
          _getDropDownValues={_getDropDownValues}
        />
      ) : isNave.isCountryConfig ? (
        <CountryConfig
          dropValue={dropValue}
          groupUsers={groupUsers}
          _getDropDownValues={_getDropDownValues}
          context={props.context}
        />
      ) : (
        <div className={styles.masBox}>
          {_Blocks.length &&
            _Blocks.map((e: any) => {
              return (
                <div
                  className={styles.block}
                  onClick={() => _getNaveFun(e.name)}
                >
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <Icon
                      iconName={e.iconName}
                      style={{
                        fontSize: 46,
                      }}
                    />
                    <Label
                      style={{
                        fontSize: 26,
                        cursor: "pointer",
                      }}
                    >
                      {e.name}
                    </Label>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CommonScreen;
