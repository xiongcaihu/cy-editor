/* eslint-disable no-undef */
import React from "react";
import { mount } from "@cypress/react";

const Comp = ()=>{
  return <div>a</div>
}

it("demo test", () => {
  mount(<Comp />);
  cy.contains("a");
});
