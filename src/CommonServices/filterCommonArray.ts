import { IDrop, IGroupUsers } from "../globalInterFace/BudgetInterFaces";
import { Config } from "../globals/Config";

const _filterArray = (
  isUser: IGroupUsers,
  _array: any[],
  CommentName: string
): any[] => {
  let _arrValue: any[] = [];
  if (
    (isUser.isSuperAdmin || isUser.isSuperAdminView) &&
    CommentName != Config.Navigation.BudgetDistribution
  ) {
    _arrValue = [..._array];
  } else {
    for (let i: number = 0; _array.length > i; i++) {
      if (
        CommentName == Config.Navigation.BudgetCategory ||
        CommentName == Config.Navigation.CategoryConfig ||
        CommentName == Config.Navigation.BudgetPlanning ||
        CommentName == Config.Navigation.BudgetAnalysis ||
        CommentName == Config.Navigation.CountryConfig ||
        CommentName == Config.Navigation.BudgetTrackingList
      ) {
        if (
          (isUser.isInfraManager || isUser.isInfraAdmin) &&
          _array[i].Area == Config.AreaName.InfraStructure
        ) {
          _arrValue.push(_array[i]);
        }
        if (
          (isUser.isEnterpricesManager || isUser.isInfraAdmin) &&
          _array[i].Area == Config.AreaName.EnterpriseApplication
        ) {
          _arrValue.push(_array[i]);
        }
        if (
          (isUser.isSpecialManager || isUser.isInfraAdmin) &&
          _array[i].Area == Config.AreaName.SpecialProject
        ) {
          _arrValue.push(_array[i]);
        }
      } else if (CommentName == Config.Navigation.BudgetDistribution) {
        if (isUser.isSuperAdmin || isUser.isSuperAdminView) {
          _array[i].isManager = true;
          _array[i].isAdmin = isUser.isSuperAdmin ? true : false;
          _arrValue.push({ ..._array[i] });
        } else if (
          (isUser.isInfraManager && isUser.isInfraAdmin) ||
          (isUser.isEnterpricesManager && isUser.isEnterpricesAdmin) ||
          (isUser.isSpecialManager && isUser.isSpecialAdmin)
        ) {
          if (
            isUser.isInfraManager &&
            isUser.isInfraAdmin &&
            _array[i].Area == Config.AreaName.InfraStructure
          ) {
            _array[i].isManager = true;
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isEnterpricesManager &&
            isUser.isEnterpricesAdmin &&
            _array[i].Area == Config.AreaName.EnterpriseApplication
          ) {
            _array[i].isManager = true;
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isSpecialManager &&
            isUser.isSpecialAdmin &&
            _array[i].Area == Config.AreaName.SpecialProject
          ) {
            _array[i].isManager = true;
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isInfraManager != isUser.isInfraAdmin &&
            isUser.isInfraManager &&
            _array[i].Area == Config.AreaName.InfraStructure
          ) {
            _array[i].isManager = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isEnterpricesManager != isUser.isEnterpricesAdmin &&
            isUser.isEnterpricesManager &&
            _array[i].Area == Config.AreaName.EnterpriseApplication
          ) {
            _array[i].isManager = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isSpecialManager != isUser.isSpecialAdmin &&
            isUser.isSpecialManager &&
            _array[i].Area == Config.AreaName.SpecialProject
          ) {
            _array[i].isManager = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isInfraManager != isUser.isInfraAdmin &&
            isUser.isInfraAdmin &&
            _array[i].Area == Config.AreaName.InfraStructure
          ) {
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isEnterpricesManager != isUser.isEnterpricesAdmin &&
            isUser.isEnterpricesAdmin &&
            _array[i].Area == Config.AreaName.EnterpriseApplication
          ) {
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isSpecialManager != isUser.isSpecialAdmin &&
            isUser.isSpecialAdmin &&
            _array[i].Area == Config.AreaName.SpecialProject
          ) {
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
        } else {
          if (
            isUser.isInfraManager &&
            _array[i].Area == Config.AreaName.InfraStructure
          ) {
            _array[i].isManager = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isEnterpricesManager &&
            _array[i].Area == Config.AreaName.EnterpriseApplication
          ) {
            _array[i].isManager = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isSpecialManager &&
            _array[i].Area == Config.AreaName.SpecialProject
          ) {
            _array[i].isManager = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isInfraAdmin &&
            _array[i].Area == Config.AreaName.InfraStructure
          ) {
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isEnterpricesAdmin &&
            _array[i].Area == Config.AreaName.EnterpriseApplication
          ) {
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
          if (
            isUser.isSpecialAdmin &&
            _array[i].Area == Config.AreaName.SpecialProject
          ) {
            _array[i].isAdmin = true;
            _arrValue.push({ ..._array[i] });
          }
        }
      }
    }
  }
  return _arrValue;
};

const _filAreaDrop = (user: IGroupUsers): IDrop[] => {
  let _arrArea: IDrop[] = [{ key: 0, text: "All" }];
  if (user.isSuperAdmin || user.isSuperAdminView) {
    _arrArea.push(
      { key: 1, text: Config.AreaName.InfraStructure },
      { key: 2, text: Config.AreaName.EnterpriseApplication },
      { key: 3, text: Config.AreaName.SpecialProject }
    );
  } else {
    if (
      user.isInfraManager ||
      user.isEnterpricesManager ||
      user.isSpecialManager
    ) {
      if (user.isInfraManager) {
        _arrArea.push({ key: 1, text: Config.AreaName.InfraStructure });
      }
      if (user.isEnterpricesManager) {
        _arrArea.push({ key: 2, text: Config.AreaName.EnterpriseApplication });
      }
      if (user.isSpecialManager) {
        _arrArea.push({ key: 3, text: Config.AreaName.SpecialProject });
      }
    } else {
      if (user.isInfraAdmin) {
        _arrArea.push({ key: 1, text: Config.AreaName.InfraStructure });
      }
      if (user.isEnterpricesAdmin) {
        _arrArea.push({ key: 2, text: Config.AreaName.EnterpriseApplication });
      }
      if (user.isSpecialAdmin) {
        _arrArea.push({ key: 3, text: Config.AreaName.SpecialProject });
      }
    }
  }
  return _arrArea;
};

const _areaVoiceFilter = (_area: IDrop[], _masArr: any[]): any[] => {
  let _filArray: any[] = [];

  for (let i: number = 0; _area.length > i; i++) {
    for (let j: number = 0; _masArr.length > j; j++) {
      if (_area[i].text === _masArr[j].Area) {
        _filArray.push(_masArr[j]);
      }

      if (_area.length === i + 1 && _masArr.length === j + 1) {
        return _filArray;
      }
    }
  }
};

export { _filterArray, _filAreaDrop, _areaVoiceFilter };
