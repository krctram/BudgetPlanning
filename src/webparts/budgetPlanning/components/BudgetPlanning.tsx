import * as React from "react";
import { IBudgetPlanningProps } from "./IBudgetPlanningProps";
import App from "./App";
import { sp } from "@pnp/sp/presets/all";
import { QueryCache } from "react-query";

import "../../../ExternalRef/styleSheets/Styles.css";

export default class BudgetPlanning extends React.Component<
  IBudgetPlanningProps,
  {}
> {
  constructor(prop: IBudgetPlanningProps) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context,
    });

    new QueryCache().clear();
  }

  public render(): React.ReactElement<IBudgetPlanningProps> {
    return <App sp={sp} context={this.props.context} />;
  }
}
