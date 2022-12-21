import { Field } from "formik";
import {
  Fragment,
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useAsyncSearchResult } from "./api";
import {
  DivSpinner,
  ErrorMessage,
  SearchForm,
  SearchFormProps,
} from "./components";

type Commonwork = {
  code: string;
  detailno: "";
  finalprice: number;
  fixprice: number;
  groupid: number;
  id: number;
  notes: string | null;
  operationid: number;
  positionno: string;
  selected: string;
  timevalue: number;
  workname: number;
};

type CmnwksgroupsT = {
  loading: boolean;
  [id: number]: {
    groupname: string;
    levelintree: number;
    notes: string | null;
    parent: number;
  };
};

const CmnwksgroupsContext = createContext<CmnwksgroupsT | null>(null);

export const CommonworkPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cmnwksGroups, setCmnwksGroups] = useState<CmnwksgroupsT | null>(null);
  const asyncCommonworks = useAsyncSearchResult<Commonwork[]>(
    "commonworks?",
    searchParams.toString()
  );
  type cmnwksgrps = {
    groupname: string;
    id: number;
    levelintree: number;
    notes: string | null;
    parent: number;
  };
  const asyncCommonworkgroup = useAsyncSearchResult<cmnwksgrps[] | undefined>(
    "commonworks/groups",
    "?"
  );
  useEffect(() => {
    if (asyncCommonworkgroup.error) {
      setCmnwksGroups(null);
    }
    if (asyncCommonworkgroup.loading) {
      setCmnwksGroups((wgr) => ({
        ...wgr,
        loading: asyncCommonworkgroup.loading,
      }));
    }
    if (asyncCommonworkgroup.result) {
      asyncCommonworkgroup.result.forEach((workGr) => {
        setCmnwksGroups((wgr) => ({
          ...wgr,
          loading: asyncCommonworkgroup.loading,
          [workGr.id]: {
            groupname: workGr.groupname,
            levelintree: workGr.levelintree,
            notes: workGr.notes,
            parent: workGr.parent,
          },
        }));
      });
    }
  }, [
    asyncCommonworkgroup.result,
    asyncCommonworkgroup.loading,
    asyncCommonworkgroup.error,
  ]);
  const onFormSubmit = (sParams: URLSearchParams) => {
    setSearchParams(sParams);
  };
  const onFormReset = () => {
    setSearchParams({});
  };
  return (
    <div className="block">
      <p className="pb-3 has-text-weight-bold is-size-5">Поиск общих работ:</p>
      <div className="column is-4 has-background-white-bis">
        <CommonworkSearchForm
          searchParams={searchParams}
          onSubmit={onFormSubmit}
          onReset={onFormReset}
        />
      </div>
      {!asyncCommonworks.loading &&
        !asyncCommonworks.result &&
        !asyncCommonworks.error && (
          <div className="has-background-grey-lighter has-text-centered is-size-5">
            <p>Данные из БД не запрашивались.</p>
            <div>
              <a href="commonworks?workname=">Загрузить </a>
              <span>все <strong>общие работы</strong> без фильтрации?</span>
            </div>
          </div>
        )}
      {asyncCommonworks.loading && <DivSpinner />}
      {asyncCommonworks.error && (
        <ErrorMessage text={asyncCommonworks.error.message} />
      )}
      {asyncCommonworks.result && (
        <div className="">
          <div className="has-text-weight-bold is-size-4">
            Найденные общие работы:{" "}
          </div>
          <CmnwksgroupsContext.Provider value={cmnwksGroups}>
            <ResultsTable fetchResult={asyncCommonworks.result} />
          </CmnwksgroupsContext.Provider>
        </div>
      )}
    </div>
  );
};

const CommonworkSearchForm = (props: SearchFormProps) => {
  const initValues = {
    workname: "",
  };
  return (
    <>
      <SearchForm initValues={initValues} {...props}>
        <div className="field">
          <label className="label">Имя</label>
          <div className="control">
            <Field
              name="workname"
              type="search"
              className="input"
              placeholder="Наименование работы"
            />{" "}
          </div>
        </div>
      </SearchForm>
    </>
  );
};

const ResultsTable = (props: { fetchResult: Commonwork[] }) => {
  const heads = [
    "Название работы",
    "Группа/подгруппа",
    "Норма времени",
    "Код",
    "Финальная цена",
    "Фиксированная цена",
  ];

  const total = props.fetchResult ? props.fetchResult.length : 0;
  if (total === 0) {
    return (
      <p className="has-background-grey has-text-centered is-size-5">
        <strong>Ничего не найдено.</strong>
      </p>
    );
  }
  return (
    <div className="table-container">
      <table className="table is-bordered is-narrow is-hoverable ">
        <thead>
          <tr className="mainthead">
            {heads.map((val, i) => (
              <th key={i}>{val}</th>
            ))}
          </tr>
        </thead>
        <tfoot className="">
          <tr className="mainthead">
            <th colSpan={10}>{`Всего: ${total}`}</th>
          </tr>
        </tfoot>
        <tbody>
          {props.fetchResult.length > 0 ? (
            <Works worksArray={props.fetchResult} />
          ) : (
            <EmptyRow />
          )}
        </tbody>
      </table>
    </div>
  );
};
const Works = (props: { worksArray: Commonwork[] }) => {
  return (
    <>
      {props.worksArray.map((item) => (
        <WorksRender key={item.id} work={item} />
      ))}
    </>
  );
};
const Ul = ({
  id = -1,
  children,
  cmnwksGroups,
}: {
  id: number;
  children?: ReactNode;
  cmnwksGroups: CmnwksgroupsT;
}) => {
  const parentID =
    cmnwksGroups[id] && cmnwksGroups[id].parent ? cmnwksGroups[id].parent : 0;
  const isNested = parentID !== 0 ? "nested-ul" : "";
  const current = (
    <ul className={isNested}>
      <li>
        {`${cmnwksGroups[id].groupname}${children ? "->" : ""}`}
        {children}
      </li>
    </ul>
  );
  if (parentID !== 0) {
    return (
      <Ul id={parentID} cmnwksGroups={cmnwksGroups}>
        {current}
      </Ul>
    );
  } else return current;
};
const WorksRender = (props: { work: Commonwork }) => {
  const cmnwksGroups = useContext(CmnwksgroupsContext);
  return (
    <Fragment>
      <tr className="has-text-weight-semibold">
        <td className="wide">{props.work.workname}</td>
        <td className="wide">
          {!cmnwksGroups && "-"}
          {cmnwksGroups && cmnwksGroups.loading && <DivSpinner size={7} />}
          {cmnwksGroups && (
            <Ul id={props.work.groupid} cmnwksGroups={cmnwksGroups}/>
          )}
        </td>
        <td>{props.work.timevalue}</td>
        <td>{props.work.operationid}</td>
        <td>{props.work.finalprice}</td>
        <td>{props.work.fixprice}</td>
      </tr>
    </Fragment>
  );
};

const EmptyRow = () => (
  <tr>
    <td colSpan={10}>
      <hr className="blank" />
    </td>
  </tr>
);
