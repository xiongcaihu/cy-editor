import { mountPopComp, PersonShape } from "./source";
import { Select, Space } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { utils } from "../../components/RichEditor/common/utils";
import { CypressFlagValues } from "../../components/RichEditor/common/Defines";

const datas = [
  {
    name: "程亮",
    id: "10244020",
  },
  {
    name: "阎贺丽",
    id: "160000000",
  },
  {
    name: "陈宇",
    id: "10191699",
  },
  {
    name: "程亮2",
    id: "102440201",
  },
  {
    name: "阎贺丽2",
    id: "1600000001",
  },
  {
    name: "陈宇2",
    id: "101916991",
  },
];

const matchRule = (data: PersonShape, searchContent: string) => {
  if (searchContent === "") return false;
  return (
    data.name.indexOf(searchContent) !== -1 ||
    String(data.id).includes(searchContent)
  );
};

function fetchUsers(searchContent: string, taskId: number) {
  return new Promise<PersonShape[]>((rel, reject) => {
    setTimeout(() => {
      if (taskId !== runId) {
        console.warn(`search request canceled, reason: has new request`);
        reject();
        return;
      }
      rel(
        _.cloneDeep(
          _.filter(datas, (user) => {
            return matchRule(user, searchContent);
          })
        )
      );
    }, 300);
  });
}

var runId: number; // 进行远程请求时候的id，如果当前请求时的taskId和此id不对应，那么说明该请求任务应该被取消
const getUsers = _.debounce<(a: string, b: (p: PersonShape[]) => void) => void>(
  (searchContent, callback) => {
    runId = new Date().getTime();
    fetchUsers(searchContent, runId)
      .then((users) => {
        callback(users);
      })
      .catch(() => {});
  },
  300
);

export const ChoosePersonComp: React.FC<{
  initPerson?: PersonShape;
  onChange?(person: PersonShape | undefined | null): void;
  cypressId?: CypressFlagValues;
}> = (props) => {
  const { initPerson } = props;
  const [personsList, setPersonsList] = useState<PersonShape[]>(
    initPerson?.id ? [initPerson] : []
  );
  const [isFetching, setIsFetching] = useState(false);
  const inputDom = useRef<HTMLDivElement>();
  const ref = useCallback((divDom: HTMLDivElement) => {
    if (divDom) {
      inputDom.current = divDom;
    }
  }, []);

  useEffect(() => {
    console.log("mounted");
    return () => {
      console.log("unmounted");
    };
  }, []);

  useEffect(() => {
    if (initPerson?.id == null) {
      setPersonsList([]);
    } else {
      setPersonsList([initPerson]);
    }
  }, [initPerson]);

  const selectCompProps: Parameters<typeof Select>[0] = useMemo(() => {
    return {
      showSearch: true,
      getPopupContainer: mountPopComp,
      dropdownClassName:'choosePersonCompDropDown',
      style: { width: 200 },
      maxTagCount: 5,
      filterOption: false,
      loading: isFetching,
      placeholder: "输入工号或姓名",
      onClear: () => {
        setPersonsList([]);
      },
      onSearch: (value) => {
        setIsFetching(true);
        getUsers(value, (users) => {
          setIsFetching(false);
          setPersonsList(users);
        });
      },
      options: personsList.map((person) => ({
        label: person.name + person.id,
        value: person.id,
      })),
      value: String(initPerson?.id),
      onChange: (id) => {
        props?.onChange?.(
          _.cloneDeep(
            personsList.find((person) => String(id) === String(person.id))
          )
        );
      },
    };
  }, [initPerson?.id, isFetching, personsList, props]);

  return (
    <div
      ref={ref}
      data-no-base-class="externalComp"
      {...utils.insertCypressId(props, "cypressId")}
    >
      <Space>
        <Select {...selectCompProps}></Select>
      </Space>
    </div>
  );
};
