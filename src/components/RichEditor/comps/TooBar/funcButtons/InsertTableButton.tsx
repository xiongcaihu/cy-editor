import { TableOutlined } from "@ant-design/icons";
import { Button, Dropdown, Tooltip } from "antd";
import _ from "lodash";
import { useState, useRef, useEffect, useMemo } from "react";
import { Editor, Transforms } from "slate";
import { useSlate, ReactEditor } from "slate-react";
import { CET } from "../../../common/Defines";
import { utils } from "../../../common/utils";
import { tdMinHeight } from "../../Td";
import { ToolBarConfig } from "../common/config";

export const InsertTableButton: React.FC<{
  onChange?: (color?: string) => void;
}> = (props) => {
  const editor = useSlate();
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState<string>("");
  const tableDom = useRef<any>();
  const [disabled, setDisabled] = useState(false);
  const ref = useRef({
    _isDisabled: _.debounce(() => {
      setDisabled(editor.selection == null);
    }, ToolBarConfig.calcStatusDelay),
  });
  useEffect(() => {
    ref.current._isDisabled();
  });

  const rowCount = 10,
    cellCount = 10;

  const tdMouseEnter = (e: any) => {
    const table: any = tableDom.current;
    const td = e.target;
    const tr = e.target.parentNode;
    if (!table || !td || !tr) return;

    Array.from(table.querySelectorAll("td")).forEach((td: any) => {
      td.style.backgroundColor = "unset";
    });
    const trs = Array.from(table.querySelectorAll("tr"));

    for (let i = 0; i <= tr.rowIndex; i++) {
      const nowTr: any = trs[i];
      const tds: any = Array.from(nowTr.querySelectorAll("td"));
      for (let j = 0; j <= td.cellIndex; j++) {
        const nowTd = tds[j];
        nowTd.style.backgroundColor = "rgba(180,215,255,.7)";
      }
    }

    setCounts(`${td.cellIndex + 1}x${tr.rowIndex + 1}`);
  };

  const addTable = () => {
    const cellCount = Number(counts.split("x")[0]);
    const rowCount = Number(counts.split("x")[1]);
    if (!Number.isInteger(cellCount) || !Number.isInteger(rowCount)) return;

    ReactEditor.focus(editor);

    if (!editor.selection) return;

    const [tw] = Editor.nodes(editor, {
      mode: "lowest",
      match(n) {
        return utils.isTextWrapper(n);
      },
    });
    if (!tw) return;
    const twDom = ReactEditor.toDOMNode(editor, tw[0]);
    const parent: any = twDom.offsetParent;
    if (!parent) return;
    const tableWrapperWidth = twDom.offsetWidth - 2;

    Transforms.insertNodes(editor, {
      type: CET.TABLE,
      wrapperWidthWhenCreated: tableWrapperWidth,
      children: [
        {
          type: CET.TBODY,
          children: new Array(rowCount).fill("0").map(() => {
            return {
              type: CET.TR,
              children: new Array(cellCount).fill("0").map(() => {
                return {
                  type: CET.TD,
                  width: tableWrapperWidth / cellCount,
                  height: tdMinHeight,
                  children: [
                    {
                      type: CET.DIV,
                      children: [{ text: "" }],
                    },
                  ],
                };
              }),
            };
          }),
        },
      ],
    });

    Transforms.deselect(editor);
    setVisible(false);
  };

  return useMemo(() => {
    return (
      <div
        onMouseLeave={() => {
          setVisible(false);
        }}
      >
        <Dropdown
          placement="bottomCenter"
          overlayStyle={{ zIndex: 999 }}
          visible={visible}
          overlay={() => {
            return (
              <div
                className="cyEditor__toolbar__tablePanelWrapper"
                style={{
                  width: 200,
                  padding: 8,
                  display: "flex",
                  justifyContent: "flex-start",
                  backgroundColor: "white",
                  flexDirection: "column",
                }}
              >
                {visible ? (
                  <table border="1" ref={tableDom}>
                    <tbody>
                      {new Array(rowCount).fill(0).map((item, index) => {
                        return (
                          <tr key={index}>
                            {new Array(cellCount).fill(0).map((item, index) => {
                              return (
                                <td
                                  key={index}
                                  onMouseEnter={tdMouseEnter}
                                  onClick={addTable}
                                ></td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : null}
                <div style={{ textAlign: "right" }}>{counts}</div>
              </div>
            );
          }}
          trigger={["click"]}
          getPopupContainer={(triggerNode) =>
            triggerNode.parentElement || document.body
          }
        >
          <Tooltip
            title="表格"
            zIndex={99}
            mouseLeaveDelay={0}
            mouseEnterDelay={0}
          >
            <Button
              type="text"
              onMouseDown={(e) => {
                e.preventDefault();
                setVisible(true);
              }}
              disabled={disabled}
            >
              <TableOutlined />
            </Button>
          </Tooltip>
        </Dropdown>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, disabled, counts]);
};
