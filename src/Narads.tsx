import classNames from "classnames";
import { Field } from "formik";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { rubles } from "rubles";
import { paginationSearchResult, useAsyncSearchResult } from "./api";
import { ByClientAuto, clientsSearchResult } from "./Clients";
import {
  DivSpinner,
  ErrorMessage,
  Pagination,
  SearchForm,
  SearchFormProps,
  CheckboxToggle,
} from "./components";
import "./styles.css";

type Narad = {
  id: number;
  docnumber: number;
  clm: {
    id: number;
    model: string;
    vin: string;
    regno: string;
  };
  date1: string;
  date2: string;
  dcl: {
    id: number;
    nameindir: string;
  };
  description: string;
  gooddiscount: number;
  ngoods: naradGood[];
  ngoods_ids: number[];
  notes: string;
  nworks: naradWork[];
  nworks_ids: number[];
  mark: number;
  time1: number;
  time2: number;
  recommendations: string;
  run: number;
  status: number;
};
type naradGood = {
  id: number;
  amount: number;
  goodname: string;
  goodnumber: string;
  price: number;
  goods_card: goodsCard | null;
  oenumber: string | null;
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
  manufacturernumber: string;
  originalnumber: string;
};

type fetchResult = {
  data: Narad[];
  page: number;
  pages: number;
  total_items: number;
};
type priceDiscount = {
  discount: number;
  finalPrice: number;
  setFP: React.Dispatch<React.SetStateAction<number>>;
};
type naradsSearchResult = paginationSearchResult<Narad>;
const getMark = (m: number) => {
  switch (m) {
    case 0:
      return {};
    case 1:
      return {
        backgroundColor: "green",
      };
    case 2:
      return {
        backgroundColor: "#859bff",
      };
    case 3:
      return {
        backgroundColor: "red",
      };
    case 4:
      return {
        backgroundColor: "yellow",
      };
    case 5:
      return {
        backgroundColor: "lightseagreen",
      };
    case 6:
      return {
        backgroundColor: "grey",
      };
    default:
      return {};
  }
};
const useFinalPrice = (priceDiscount: priceDiscount, total: number) => {
  useEffect(() => {
    priceDiscount.setFP(total - (total * priceDiscount.discount) / 100);
  }, [priceDiscount, total]);
};
// Create ruble currency number formatter.
/*
const formatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "RUB",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
*/

export const NaradsPage = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const asyncNarads = useAsyncSearchResult<naradsSearchResult>(
    "narads?",
    searchParams.toString()
  );
  const clientID = searchParams.get("client_id");
  const clmID = searchParams.get("clm_id");
  const searchClientString = `${clientID ? "client_id=" + clientID : ""}${
    clmID ? "&clm_id=" + clmID : ""
  }`;
  const asyncClients = useAsyncSearchResult<clientsSearchResult>(
    "clients?",
    searchClientString
  );
  const onFormSubmit = (sParams: URLSearchParams) => {
    sParams.delete("page");
    sParams.delete("per_page");
    if (sParams.get("cl_name") || sParams.get("docnumber")) {
      sParams.delete("client_id");
      sParams.delete("clm_id");
    }
    if (sParams.get("model")) sParams.delete("clm_id");
    setSearchParams(sParams);
  };
  const onFormReset = () => {
    setSearchParams({});
  };
  const setPage = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };
  return (
    <div className="block">
      <p className="pb-3 has-text-weight-bold is-size-5">Поиск заказ-нарядов</p>
      <div className="column has-background-white-bis">
        <ByClientAuto
		  searchParams={searchParams}
          asyncReturn={asyncClients}
        />
        <NaradsSearchForm
          searchParams={searchParams}
          onSubmit={onFormSubmit}
          onReset={onFormReset}
        />
      </div>
      {!asyncNarads.loading && !asyncNarads.result && !asyncNarads.error && (
        <div className="has-background-grey-lighter has-text-centered is-size-5">
          <p>Данные из БД не запрашивались.</p>
          <div>
            <a href="narads?page=1">Загрузить</a>
            <span>
              {" "}
              первую страницу <strong>заказ-нарядов</strong> без фильтрации?
            </span>
          </div>
        </div>
      )}
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
  const heads = [
    "N°",
    "Клиент",
    "Автомобиль",
    "VIN",
    "Гос. номер",
    "Дата и время открытия",
    "Дата и время начала работ",
  ];
  const [showDetails, setShowDetails] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(true);
  const narads = props.fetchResult.data;
  const total = narads.length;
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
            <td className="noborder">
              <CheckboxToggle
                state={showDetails}
                SetStateAction={setShowDetails}
                name="Развернуть всё"
              />
            </td>
            <td className="noborder">
              <CheckboxToggle
                state={showSuppliers}
                SetStateAction={setShowSuppliers}
                name="Show supp"
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
            <th colSpan={10}>{`Всего: ${total}`}</th>
          </tr>
        </tfoot>
        <tbody>
          {total > 0 ? (
            <>
              {narads.map((narad) => (
                <NaradRender
                  key={narad.id}
                  gShowDetails={showDetails}
                  narad={narad}
				  gShowSupplier= {showSuppliers}
                />
              ))}
            </>
          ) : (
            <EmptyRow />
          )}
        </tbody>
      </table>
    </div>
  );
};

const NaradsSearchForm = (props: SearchFormProps) => {
  const initValues = {
    g_name: "",
    articul: "",
    model: "",
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
              <div className="field">
                <label className="label">Название з\ч</label>
                <div className="control">
                  <Field
                    name="g_name"
                    type="search"
                    className="input"
                    placeholder="Наименование запчасти"
                  />
                </div>
              </div>
              <div className="field">
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
            </div>
          </div>
          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
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
              <div className="field">
                <label className="label">Автомобиль</label>
                <div className="control">
                  <Field
                    name="model"
                    type="search"
                    className="input"
                    placeholder="Марка и/или модель"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Работы</label>
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

const NaradRender = ({
  narad,
  gShowDetails,
  gShowSupplier,
}: {
  narad: Narad;
  gShowDetails: boolean;
  gShowSupplier: boolean;
}) => {
  const [showDetailes, setShowDetails] = useState(false);
  const [workFinalPrice, setWorkFP] = useState(0);
  const [goodsFinalPrice, setGoodsFP] = useState(0);
  const closeOrOpenCls = classNames({
    open: showDetailes,
    closed: !showDetailes,
    "is-clickable": true,
  });
  const goodsPriceDiscount = {
    discount: narad.gooddiscount,
    finalPrice: goodsFinalPrice,
    setFP: setGoodsFP,
  };
  const worksPriceDiscount = {
    discount: narad.gooddiscount,
    finalPrice: workFinalPrice,
    setFP: setWorkFP,
  };
  const bill = () => {
    const finalCost =
      goodsPriceDiscount.finalPrice + worksPriceDiscount.finalPrice;
    const rub = rubles(
      goodsPriceDiscount.finalPrice + worksPriceDiscount.finalPrice
    );
    const rubCapitilized = rub
      ? "(" + rub.charAt(0).toUpperCase() + rub.slice(1) + ")"
      : "";
    return (
      <div className="has-text-weight-bold has-background-grey-lighter mb-2 is-flex is-flex-wrap-wrap">
        <div>Общая стоимоть:&nbsp;</div>
        <div>{finalCost.toFixed(2)}&nbsp;</div>
        <div>{rubCapitilized}</div>
      </div>
    );
  };
  useEffect(() => {
    setShowDetails(gShowDetails);
  }, [gShowDetails]);
  const dpDwnItemsCls = "dropdown-item is-size-7";
  const isDone = narad.status === 1;
  const isDoneCls = isDone ? " is-done" : "";
  const displayProp = () => {
    return showDetailes ? {} : { display: "none" };
  };
  return (
    <Fragment key={narad.id}>
      <tr className={`has-text-weight-semibold${isDoneCls}`}>
        <td
          className="litle-wide has-text-weight-bold"
          style={getMark(narad.mark)}
        >
          <div>
            {isDone && (
              <FontAwesomeIcon
                icon={faCheck}
                className="is-done"
                title="Выполненный"
              />
            )}
            {narad.docnumber}
            <span
              className={closeOrOpenCls}
              title="Развернуть/Свернуть"
              onClick={() => {
                setShowDetails((prevState) => !prevState);
              }}
            ></span>
          </div>
        </td>
        <td className="wide">
          <div className={`dropdown is-hoverable`}>
            <span className="is-clickable">{narad.dcl.nameindir}</span>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <a
                  href={"narads?client_id=" + narad.dcl.id}
                  className={dpDwnItemsCls}
                >
                  {`История по клиенту ${narad.dcl.nameindir}`}
                </a>
                <a
                  href={"clients?client_id=" + narad.dcl.id}
                  className={dpDwnItemsCls}
                >
                  {`Карточка клиента ${narad.dcl.nameindir}`}
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
                <a
                  href={`narads?clm_id=${narad.clm.id}&client_id=${narad.dcl.id}`}
                  className={dpDwnItemsCls}
                >
                  {`История по этому ${narad.clm.model}`}
                </a>
                <a
                  href={`clients?clm_id=${narad.clm.id}&client_id=${narad.dcl.id}`}
                  className={dpDwnItemsCls}
                >
                  {`Карточка этого ${narad.clm.model}`}
                </a>
              </div>
            </div>
          </div>
        </td>
        <td className="bitwide">{narad.clm.vin}</td>
        <td>{narad.clm.regno}</td>
        <td className="">
          {`${new Date(narad.date1).toLocaleDateString("ru-Ru")} ${
            narad.time1
          }`}
        </td>
        <td>
          {`${new Date(narad.date2).toLocaleDateString("ru-Ru")} ${
            narad.time2
          }`}
        </td>
      </tr>
      <tr className={`${isDoneCls}`} style={displayProp()}>
        <td colSpan={10}>
          <div className="notes">
            <span>Особые данные: </span>
            {narad.notes}
          </div>
          <div className="notes">
            <span>Примечание: </span>
            {narad.description}
          </div>

          <div>
            {narad.nworks && (
              <NaradWorks
                nworks={narad.nworks}
                nworks_ids={narad.nworks_ids}
                priceDiscount={worksPriceDiscount}
              />
            )}
            {narad.ngoods && (
              <NaradGoods
                ngoods={narad.ngoods}
                ngoods_ids={narad.ngoods_ids}
                priceDiscount={goodsPriceDiscount}
				showSupplier = {gShowSupplier}
              />
            )}
          </div>
          <div className="notes">
            <span>Пробег: </span>
            {`${narad.run === 0 ? "" : narad.run + " км;"}`}
          </div>
          <div className="notes">
            <span>Рекомендации: </span>
            {narad.recommendations}
          </div>
          {bill()}
        </td>
      </tr>
    </Fragment>
  );
};
const NaradGoods = ({
  ngoods,
  ngoods_ids,
  priceDiscount,
  showSupplier,
}: {
  ngoods: naradGood[];
  ngoods_ids: number[];
  priceDiscount: priceDiscount;
  showSupplier: boolean;
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  useFinalPrice(priceDiscount, totalPrice);

  const Goods = () => {
    let totalIt = 0;
    let totalPr = 0;
    useEffect(() => {
      setTotalItems(totalIt);
      setTotalPrice(totalPr);
    });
    const soughtFor = (id: number) => {
      if (!ngoods_ids) return false;
      return ngoods_ids.includes(id);
    };
    return (
      ngoods &&
      ngoods.map((ng, index) => {
        const clsName = classNames({ "has-text-info": soughtFor(ng.id) });
        const hasNgOe = Boolean(ng.oenumber);
        const hasGcOe = Boolean(ng.goods_card && ng.goods_card.originalnumber);
        const hasGcMn = Boolean(
          ng.goods_card && ng.goods_card.manufacturernumber
        );
        const hasOENubmers = Boolean(hasNgOe || hasGcOe || hasGcMn);
        const sum = ng.price * ng.amount;
        totalIt += ng.amount;
        totalPr += sum;
        const nameWith = (name: string, showSup: boolean) => {
          if (showSup) return name;
          return name.split(/(\+\d{0,2}\S{1,10}\d{0,2}(?:\s|$))/)[0];
        };
        return (
          <tr key={ng.id} className={clsName}>
            <td>{index + 1}</td>
            <td>
              <span className="icon-text">
                {ng.goods_card && (
                  <span className="icon">
                    <FontAwesomeIcon
                      icon={faWarehouse}
                      title="Запчасть со склада"
                    />
                  </span>
                )}
                <span>
                  {ng.goods_card
                    ? ng.goods_card.goodsname
                    : nameWith(ng.goodname, showSupplier)}
                </span>
              </span>
            </td>
            <td>
              <div className="dropdown is-hoverable">
                {ng.goods_card ? ng.goods_card.articul : ng.goodnumber}
                {hasOENubmers && (
                  <div className="dropdown-menu" id="dropdown-menu" role="menu">
                    <div className="dropdown-content">
                      {hasNgOe && (
                        <div>
                          <span className="is-italic">oe_N°: </span>
                          {ng.oenumber}
                        </div>
                      )}
                      {hasGcOe && (
                        <div>
                          <span className="is-italic">oe_N°: </span>
                          {ng.goods_card?.originalnumber}
                        </div>
                      )}
                      {hasGcMn && (
                        <div>
                          <span className="is-italic">mn_N°: </span>
                          {ng.goods_card?.manufacturernumber}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </td>
            <td>{ng.amount.toFixed(2)}</td>
            <td>{ng.price.toFixed(2)}</td>
            <td>{sum.toFixed(2)}</td>
          </tr>
        );
      })
    );
  };
  return (
    <table className="table is-narrow">
      <caption className="has-text-left has-text-weight-medium has-background-grey-lighter">
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
      <tbody>{ngoods.length > 0 ? Goods() : <EmptyRow />}</tbody>
      {ngoods.length > 0 && (
        <tfoot>
          <tr className="has-text-weight-semibold">
            <td colSpan={3} className="has-text-right">
              Итого:
            </td>
            <td>{totalItems.toFixed(2)}</td>
            <td className="noborder"></td>
            <td>{totalPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={10} className="">
              <div className="is-italic is-size-7">
                <span>Скидка на запасные части: </span>
                <span>{priceDiscount.discount}%</span>
              </div>
              <div className="has-text-weight-semibold">
                <span>Стоимость запасных частей: </span>
                <span>{priceDiscount.finalPrice.toFixed(2)}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};
const NaradWorks = ({
  nworks,
  nworks_ids,
  priceDiscount,
}: {
  nworks: naradWork[];
  nworks_ids: Narad["nworks_ids"];
  priceDiscount: priceDiscount;
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  useFinalPrice(priceDiscount, totalPrice);
  const soughtFor = (id: number) => {
    if (!nworks_ids) return false;
    return nworks_ids.includes(id);
  };
  const Works = () => {
    let totalPr = 0;
    useEffect(() => {
      setTotalPrice(totalPr);
    });
    return nworks.map((nw, index) => {
      const clsName = classNames({ "has-text-info": soughtFor(nw.id) });
      totalPr += nw.finalprice;
      return (
        <tr className={clsName} key={nw.id}>
          <td>{index + 1}</td>
          <td>{nw.workname}</td>
          <td>{nw.timevalue}</td>
          <td>{nw.finalprice}</td>
          <td>{nw.worker.workername}</td>
        </tr>
      );
    });
  };
  return (
    <table className="table is-narrow mb-2">
      <caption className="has-text-left has-text-weight-medium has-background-grey-lighter">
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
      <tbody>{nworks.length > 0 ? Works() : <EmptyRow />}</tbody>
      {nworks.length > 0 && (
        <tfoot>
          <tr className="has-text-weight-semibold">
            <td colSpan={3} className="has-text-right">
              Итого:
            </td>
            <td>{totalPrice}</td>
          </tr>
          <tr>
            <td colSpan={10} className="">
              <div className="is-italic is-size-7">
                <span>Скидка на работы: </span>
                <span>{priceDiscount.discount}%</span>
              </div>
              <div className="has-text-weight-semibold">
                <span>Стоимость ремонтных работ: </span>
                <span>{priceDiscount.finalPrice.toFixed(2)}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      )}
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
