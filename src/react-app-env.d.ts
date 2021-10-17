/// <reference types="react-scripts" />

export declare global {
  interface Window {
    // unmountingMap: Set<CypressFlagValues>;
    isGoingToRender: boolean; // 此标志表示根组件即将要进行render
  }
}
