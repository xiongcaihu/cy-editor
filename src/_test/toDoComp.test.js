/* eslint-disable no-undef */
import React from "react";
import { mount } from "@cypress/react";
import CyEditor from "../components/RichEditor/RichEditor";

const content = `[{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"apple"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"banana"}]}]},{"type":"ol","children":[{"type":"li","children":[{"type":"div","children":[{"text":"two apple"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"three apple"}]}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"iphone"}]}]},{"type":"li","children":[{"type":"div","children":[{"text":"ios"}]}]}]}]`;

it("test list comp", () => {
  mount(<CyEditor content={content} />);
  cy.contains("iphone").should("be.visible");
});