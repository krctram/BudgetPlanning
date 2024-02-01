import * as React from "react";
import { useState, useEffect } from "react";

const Dashboard = (props: any) => {
  const _getPageNave = (): void => {
    let _siteURL: any = `${props.context.context.pageContext.web.absoluteUrl}/SitePages/DashboardPowerBI.aspx?Page=Dashboard`;
    window.open(_siteURL, "_self");
  };

  useEffect(() => {
    _getPageNave();
  }, []);

  return <div></div>;
};

export default Dashboard;
