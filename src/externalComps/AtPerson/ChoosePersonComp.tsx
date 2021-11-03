import { PersonShape } from "./source";
import { Button, Card, Col, Row, Select, Space, Tag } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { utils } from "../../components/RichEditor/common/utils";
import { CypressFlagValues } from "../../components/RichEditor/common/Defines";
import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Random } from "mockjs";

const datas: PersonShape[] = new Array(100).fill(0).map((item, index) => {
  return {
    name: Random.cname(),
    id: Random.id(),
    moreInfo: {
      org: "开发二团队/数字技术产品部/系统产品_产研平台与直属fkdsajflkasdjlfjasdkjfkdsajkflsadj;klfjksdljfksdjfkd",
    },
  };
});

const mountPopComp = (nowNode: HTMLElement) =>
  ((nowNode) => {
    let parent = nowNode.parentNode as HTMLElement;
    while (parent != null && parent.id !== "ChoosePersonComp") {
      parent = parent.parentNode as HTMLElement;
    }
    return parent;
  })(nowNode) || document.body;

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
    }, 100);
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
  onChange?(person: PersonShape[] | undefined | null): void;
  cypressId?: CypressFlagValues;
}> = (props) => {
  const { initPerson } = props;
  const [personsList, setPersonsList] = useState<PersonShape[]>(
    initPerson?.id ? [initPerson] : []
  );
  const [nowPersons, setNowPersons] = useState<PersonShape[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const containerDom = useRef<HTMLDivElement>();
  const ref = useCallback((divDom: HTMLDivElement) => {
    if (divDom) {
      containerDom.current = divDom;
      setTimeout(() => {
        divDom.querySelector("input")?.focus();
      }, 0);
    }
  }, []);

  // useEffect(() => {
  //   console.log("mounted");
  //   return () => {
  //     console.log("unmounted");
  //   };
  // }, []);

  useEffect(() => {
    // 如果initPerson变化，说明是刚刚点击人员文字，此时应该只选中这个initPerson
    if (initPerson?.id == null || initPerson?.id === "") {
      setPersonsList([]);
    } else {
      setPersonsList([initPerson]);
      setNowPersons([initPerson]);
    }
  }, [initPerson]);

  const selectCompProps: Parameters<typeof Select>[0] = useMemo(() => {
    return {
      allowClear: true,
      showSearch: true,
      mode: "multiple",
      dropdownClassName: "choosePersonCompDropDown",
      style: { width: 450 },
      filterOption: false,
      loading: isFetching,
      placeholder: "输入工号或姓名进行搜索",
      optionLabelProp: "label",
      value: nowPersons.map((p) => p.id),
      tagRender: (props) => {
        return (
          <Tag {...props} style={{ marginTop: 4, marginBottom: 4 }}>
            <Typography.Text
              title={String(props.label)}
              ellipsis
              style={{ width: 92 }}
            >
              {props.label}
            </Typography.Text>
          </Tag>
        );
      },
      getPopupContainer: mountPopComp,
      onClear: () => {
        setPersonsList([]);
        setNowPersons([]);
      },
      onSearch: (value) => {
        setIsFetching(true);
        getUsers(value, (users) => {
          setIsFetching(false);
          setPersonsList(users);
        });
      },
      onChange: (ids) => {
        setNowPersons(
          personsList.filter((person) =>
            (ids as string[]).find((id) => id === String(person.id))
          )
        );
      },
      dropdownStyle: {
        zIndex: Number.MAX_SAFE_INTEGER,
      },
      dropdownRender: (originNode) => {
        const ColAttr = {
          offset: 1,
        };
        return (
          <Row style={{ flexDirection: "column" }}>
            <Col {...ColAttr}>
              <Typography.Text type="secondary">联系人</Typography.Text>
            </Col>
            <Col>{originNode}</Col>
            <Col {...ColAttr}>
              <Typography.Text type="secondary">群组</Typography.Text>
            </Col>
            <Col {...ColAttr}>more</Col>
          </Row>
        );
      },
    };
  }, [isFetching, nowPersons, personsList]);

  const submitPerson = () => {
    props?.onChange?.(_.cloneDeep(nowPersons));
  };

  const renderOption = personsList.map((person) => {
    return (
      <Select.Option
        key={person.id}
        value={person.id}
        label={person.name + person.id}
        style={{ fontSize: 10, paddingTop: 4, paddingBottom: 4 }}
      >
        <Row
          style={{ flexDirection: "row", flexWrap: "nowrap" }}
          align="middle"
          gutter={12}
        >
          <Col>
            <Avatar
              size="default"
              src={person.moreInfo?.avatarSrc}
              icon={<UserOutlined />}
            />
          </Col>
          <Col flex="1">
            <Row
              style={{
                width: "calc(100% - 44px)",
                height: "100%",
                lineHeight: 1.5,
              }}
              justify="center"
            >
              <Col>
                <Typography.Text strong>{person.name}</Typography.Text>
                <br></br>
                <Typography.Text
                  type="secondary"
                  ellipsis
                  title={person.moreInfo?.org}
                >
                  {person.moreInfo?.org}
                </Typography.Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Select.Option>
    );
  });

  return (
    <div
      ref={ref}
      id="ChoosePersonComp"
      data-no-base-class="externalComp"
      {...utils.insertCypressId(props, "cypressId")}
    >
      <Card
        bodyStyle={{
          padding: 12,
          boxShadow:
            "0 1px 2px -2px #00000029, 0 3px 6px #0000001f, 0 5px 12px 4px #00000017",
        }}
      >
        <Space>
          {/* 选人下拉框 */}
          <Select {...selectCompProps}>{renderOption}</Select>
          <Button type="primary" onClick={submitPerson}>
            确定
          </Button>
        </Space>
      </Card>
    </div>
  );
};
