import classNames from "classnames/bind";
import {Field} from "formik";
import {
	Fragment,
	ReactElement,
	useEffect,
	useState
} from "react";
import {useAsyncAbortable} from "react-async-hook";
import {useSearchParams} from "react-router-dom";
import {fetchAPI} from "./api";
import {fetchClients} from "./Clients";
import {
	DivSpinner,
	ErrorMessage, Pagination, SearchForm,
	SearchFormProps, ShowDetailToggle
} from "./components";
import "./Narads.css";

type Narad = {
  id: number;
  docnumber: number;
  clm: {
    id: number;
    model: string;
    vin: string;
    regno: string;
  };
  dcl: {
    id: number;
    nameindir: string;
  };
  ngoods: naradGood[];
  ngoods_ids: number[];
  nworks: naradWork[];
  nworks_ids: number[];
  mark: number;
};
type naradGood = {
  id: number;
  amount: number;
  goodname: string;
  goodnumber: string;
  price: number;
  goods_card: goodsCard;
};
type naradWork = {
  id: number;
  amount: number;
  finalprice: number;
  timevalue: number;
  workid: number;
  workname: string;
  worker: {
    id: number;
    workername: string;
  };
};

type goodsCard = {
  id: number;
  goodsname: string;
  articul: string;
};

type fetchResult = {
  data: Narad[];
  page: number;
  pages: number;
  total_items: number;
};
const fetchNarads = (
  uri: string,
  abortSignal?: AbortSignal
): Promise<fetchResult> => fetchAPI(uri, abortSignal);

const getMark = (m: number) => {
  switch (m) {
    case 0:
      return { color: "grey" };
    case 1:
      return {
        backgroundColor: "green",
        color: "lightgrey",
      };
    case 2:
      return {
        backgroundColor: "blue",
        color: "lightgrey",
      };
    case 3:
      return {
        backgroundColor: "red",
        color: "lightgrey",
      };
    case 4:
      return {
        backgroundColor: "yellow",
        color: "lightgrey",
      };
    case 5:
      return {
        backgroundColor: "lightseagreen",
        color: "lightgrey",
      };
    case 6:
      return {
        backgroundColor: "grey",
        color: "lightgrey",
      };
    default:
      return {};
  }
};

export const NaradsPage = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const asyncNarads = useAsyncAbortable(
    async (abortSignal, searchParams) => {
      const uri = "narads?" + searchParams.toString();
      return fetchNarads(uri, abortSignal);
    },
    [searchParams]
  );
  const onFormSubmit = (searchParams: URLSearchParams) => {
	searchParams.delete("page")
    setSearchParams(searchParams);
  };
  const onFormReset = () => {
    setSearchParams({}, { replace: true });
  };
  const setPage = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  return (
    <div className="block">
      <p className="pb-3 has-text-weight-bold is-size-5">Поиск заказ-нарядов</p>
      <ByClientAuto searchParams={searchParams} />
      <NaradsSearchForm
        searchParams={searchParams}
        onSubmit={onFormSubmit}
        onReset={onFormReset}
      />
      {asyncNarads.loading && <DivSpinner />}
      {asyncNarads.error && <ErrorMessage text={asyncNarads.error.message} />}
      {asyncNarads.result && (
        <div className="">
          <div className="has-text-weight-bold is-size-4">
            Результаты запроса:{" "}
          </div>
          <Pagination
            setPage={setPage}
            curPage={asyncNarads.result.page}
            totalPages={asyncNarads.result.pages}
          />
          <ResultsTable fetchResult={asyncNarads.result} />
        </div>
      )}
    </div>
  );
};
const ResultsTable = (props: { fetchResult: fetchResult }) => {
  const heads = ["N°", "Клиент", "Автомобиль", "VIN"];
  const [showDetails, setShowDetails] = useState(false);
  const total = props.fetchResult.data.length;
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
          <tr>
            <td className="noborder" colSpan={2}>
              <ShowDetailToggle
                checked={showDetails}
                onChange={(e) => {
                  setShowDetails(e.target.checked);
                }}
                type="checkbox"
                className="checkbox"
              />
            </td>
          </tr>
          <tr className="mainthead">
            {heads.map((val, i) => (
              <th key={i}>{val}</th>
            ))}
          </tr>
        </thead>
		<tfoot className="">
		<tr className="mainthead">
            <th  colSpan={10}>
              {`Всего: ${total}`}
            </th>
		</tr>
		</tfoot>
        <tbody>
          {props.fetchResult.data.length > 0 ? (
            <Narads narads={props.fetchResult.data} showDetails={showDetails} />
          ) : (
            <EmptyRow />
          )}
        </tbody>
      </table>
    </div>
  );
};


const ByClientAuto = (props: {
  searchParams: URLSearchParams;
}) => {
  const blank = "________________________";
  const byClient = props.searchParams.get("client_id");
  const byClm = props.searchParams.get("clm_id");
  const { result, error, loading } = useAsyncAbortable(
    async (abortSignal) => {
      return fetchClients(
        `clients?client_id=${byClient || "-1"}&clm_id=${byClm || "-1"}`,
        abortSignal
      );
    },
    [byClient, byClm]
  );
  const getClName = () => {
    if (result && result.data && result.data[0]) {
      return <span className="is-size-6 has-text-info">{result.data[0].nameindir}</span>;
    } else {
      return blank;
    }
  };
  const getCarName = () => {
    if (result && result.data && result.data[0].cars) {
      return <span className="is-size-6 has-text-info">{result.data[0].cars[0].model}</span>;
    } else {
      return blank;
    }
  };
  if (byClient || byClm) {
    return (
      <div className="block columns">
        {result && (
          <>
            {(byClient || byClm) && (
              <div className="column">
                <strong>По клиенту: {getClName()}</strong>
              </div>
            )}
            {byClm && (
              <div className="column">
                <strong>По Автомобилю: {getCarName()}</strong>
              </div>
            )}
          </>
        )}
        {error && <ErrorMessage text={error.message} />}
        {loading && <DivSpinner />}
      </div>
    );
  } else return null;
};

const NaradsSearchForm = (props: SearchFormProps) => {
  const initValues = {
    g_name: "",
    articul: "",
    model_name: "",
    workname: "",
	cl_name: "",
    docnumber: "",
  };
  return (
    <>
      <SearchForm initValues={initValues} {...props}>
		<>
        <div className="field is-horizontal">
          <div className="field-body">
            <div className="field" style={{ maxWidth: "6em" }}>
              <label className="label">Номер з/н</label>
              <div className="control">
                <Field
                  name="docnumber"
                  type="number"
                  className="input"
                  placeholder="Номер"
                />{" "}
              </div>
            </div>
            <div className="field limitted">
              <label className="label">Артикул</label>
              <div className="control">
                <Field
                  name="articul"
                  type="search"
                  className="input"
                  placeholder="Артикул"
                />
              </div>
            </div>
            <div className="field" >
              <label className="label">Наименование запчасти</label>
              <div className="control">
                <Field
                  name="g_name"
                  type="search"
                  className="input"
                  placeholder="Наименование запчасти"
                />{" "}
              </div>
            </div>
            <div className="field">
              <label className="label">Автомобиль</label>
              <div className="control">
                <Field
                  name="model_name"
                  type="search"
                  className="input"
                  placeholder="Марка и/или модель"
                  disabled={props.searchParams.get("clm_id")}
                />{" "}
              </div>
          </div>
        </div>
        </div>
        <div className="field is-horizontal">
			  <div className="field-body">
            <div className="field limitted" >
              <label className="label">Имя клиента</label>
              <div className="control">
                <Field
                  name="cl_name"
                  type="search"
                  className="input"
                  placeholder="Имя в справочнике"
                />
              </div>
            </div>
            <div className="field limitted"> 
              <label className="label">Выполненные работы</label>
              <div className="control">
                <Field
                  name="workname"
                  type="search"
                  className="input"
                  placeholder="Выполненные работы"
                />
              </div>
            </div>
          </div>
        </div>
	  </>
      </SearchForm>
    </>
  );
};

const Narads = ({
  narads,
  showDetails,
}: {
  narads: Narad[];
  showDetails: boolean;
}) => {
  return (
    <>
      {narads.map((narad) => (
        <NaradRender key={narad.id} gShowDetails={showDetails} narad={narad} />
      ))}
    </>
  );
};
const NaradRender = ({
  narad,
  gShowDetails,
}: {
  narad: Narad;
  gShowDetails: boolean;
}) => {
  const [showDetailes, setShowDetails] = useState(false);
  const closeOrOpenCls = classNames({
    open: showDetailes,
    closed: !showDetailes,
    "is-clickable": true,
  });
  useEffect(() => {
    setShowDetails(gShowDetails);
  }, [gShowDetails]);
  return (
    <Fragment key={narad.id}>
      <tr className="has-text-weight-semibold">
        <th scope="row" style={getMark(narad.mark)}>
          <div className="">
            {narad.docnumber}
            <span
              className={closeOrOpenCls}
              onClick={() => {
                setShowDetails((prevState) => !prevState);
              }}
            ></span>
          </div>
        </th>
        <td className="wide">
          <div className={`dropdown is-hoverable`}>
            <div className="is-clickable" >
			{narad.dcl.nameindir}
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <a href={"narads?client_id=" + narad.dcl.id} className="dropdown-item">
                  {`История по клиенту ${narad.dcl.nameindir}`}
                </a>
              </div>
            </div>
          </div>
		</td>
        <td className="wide">
			<div className="dropdown is-hoverable is-clickable">
			{narad.clm.model}
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <a href={"narads?clm_id=" + narad.clm.id} className="dropdown-item">
                  {`История по автомобилю ${narad.clm.model}`}
                </a>
              </div>
            </div>
			</div>
		</td>
        <td className="bitwide">{narad.clm.vin}</td>
      </tr>
      <tr style={showDetailes ? {} : { display: "none" }}>
        <td colSpan={4}>
          <div>
            {narad.ngoods && (
              <NaradGoods ngoods={narad.ngoods} ngoods_ids={narad.ngoods_ids} />
            )}
            {narad.nworks && <NaradWorks nworks={narad.nworks} />}
          </div>
        </td>
      </tr>
    </Fragment>
  );
};
const NaradGoods = ({
  ngoods,
  ngoods_ids,
}: {
  ngoods: naradGood[];
  ngoods_ids: number[];
}) => {
  const goods = () => {
    return (
      ngoods &&
      ngoods.map((ng, index) => {
        const clsName = classNames({ soughtFor: ngoods_ids.includes(ng.id) });
        return (
          <tr key={ng.id} className={clsName}>
            <td>{index + 1}</td>
            <td>{ng.goods_card ? ng.goods_card.goodsname : ng.goodname}</td>
            <td>{ng.goods_card ? ng.goods_card.articul : ng.goodnumber}</td>
            <td>{ng.amount}</td>
            <td>{ng.price}</td>
            <td>{ng.price * ng.amount}</td>
          </tr>
        );
      })
    );
  };
  return (
    <table className="table is-narrow ">
      <caption className="has-text-left has-text-weight-medium has-text-white has-background-grey-light">
        Запасные части и материалы:
      </caption>
      <thead>
        <tr>
          <td>N° п/п</td>
          <td className="wide">Наименование</td>
          <td className="bitwide">Артикул</td>
          <td>Кол-во</td>
          <td>Стоимость</td>
          <td>Сумма</td>
        </tr>
      </thead>
      <tbody>{ngoods.length > 0 ? goods() : <EmptyRow />}</tbody>
    </table>
  );
};
const NaradWorks = ({ nworks }: { nworks: naradWork[] }) => {
  //	const headClass = 'column has-text-info has-text-weight-medium'
  const works = () => {
    return nworks.map((nw, index) => (
      <tr key={nw.id}>
        <td>{index + 1}</td>
        <td>{nw.workname}</td>
        <td>{nw.timevalue}</td>
        <td>{nw.finalprice}</td>
        <td>{nw.worker.workername}</td>
      </tr>
    ));
  };
  return (
    <table className="table is-narrow ">
      <caption className="has-text-left has-text-weight-medium has-text-white-bis has-background-grey-light">
        Работы:
      </caption>
      <thead>
        <tr>
          <td>N° п/п</td>
          <td className="wide">Наименование</td>
          <td>Время</td>
          <td>Сумма</td>
          <td>Исполнитель</td>
        </tr>
      </thead>
      <tbody>{nworks.length > 0 ? works() : <EmptyRow />}</tbody>
    </table>
  );
};
const EmptyRow = () => (
  <tr>
    <td colSpan={10}>
      <hr className="blank" />
    </td>
  </tr>
);
