import classNames from "classnames/bind";
import { Field } from "formik";
import { Fragment, useEffect, useState } from "react";
import { useAsyncAbortable } from "react-async-hook";
import { useSearchParams } from "react-router-dom";
import { fetchAPI } from "./api";
import {
  DivSpinner,
  ErrorMessage,
  Pagination,
  SearchForm,
  SearchFormProps,
  ShowDetailToggle
} from "./components";

type fetchResult = {
  data: Client[];
  page: number;
  pages: number;
  total_items: number;
};
export const fetchClients = (
  uri: string,
  abortSignal?: AbortSignal
): Promise<fetchResult> => fetchAPI(uri, abortSignal);

type Client = {
  cars: Car[];
  cars_ids: number[];
  email: string;
  firstname: string;
  goodsdiscount: number;
  grnno: string;
  haddress: string;
  harea: string;
  hcity: string;
  hcountry: string;
  hpager: string;
  hphone: string;
  hphonemobil: string;
  hzip: string;
  id: number;
  nameindir: string;
  notes: string;
  workdiscount: number;
  wphone: string;
};

type Car = {
  id: number;
  vin: string;
  engineno: string;
  enginetype: string;
  bodyno: string;
  regno: string;
  color: string;
  notes: string;
  model: string;
  bodytype: string;
};

export const ClientsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const asyncClients = useAsyncAbortable(
    async (abortSignal, searchParams) => {
      const uri = "clients?" + searchParams.toString();
      return fetchClients(uri, abortSignal);
    },
    [searchParams]
  );

  const onFormSubmit = (searchParams: URLSearchParams) => {
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
      <p className="pb-3 has-text-weight-bold is-size-5">
        Поля для запроса в базу данных:
      </p>
      <ClientsSearchForm
        searchParams={searchParams}
        onSubmit={onFormSubmit}
        onReset={onFormReset}
      />
      {asyncClients.loading && <DivSpinner />}
      {asyncClients.error && <ErrorMessage text={asyncClients.error.message} />}
      {asyncClients.result && (
        <div className="">
          <div className="has-text-weight-bold is-size-4">
            Результаты запроса:{" "}
          </div>
          <Pagination
            setPage={setPage}
            curPage={asyncClients.result.page}
            totalPages={asyncClients.result.pages}
          />
          <ResultsTable fetchResult={asyncClients.result} />
        </div>
      )}
    </div>
  );
};

const ClientsSearchForm = (props: SearchFormProps) => {
  const initValues = {
    name: "",
    phone: "",
    model: "",
    vin: "",
    regno: "",
  };
  return (
    <>
      <SearchForm initValues={initValues} {...props}>
        <div className="field is-horizontal">
          <div className="field-body">
            <div className="field">
              <label className="label">Имя</label>
              <div className="control">
                <Field
                  name="name"
                  type="search"
                  className="input"
                  placeholder="Имя в справочнике"
                />{" "}
              </div>
            </div>
            <div className="field" style={{ maxWidth: "15em" }}>
              <label className="label">Номер телефона</label>
              <div className="control">
                <Field
                  name="phone"
                  type="search"
                  className="input"
                  placeholder="Номер телефона"
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
                />{" "}
              </div>
            </div>
            <div className="field">
              <label className="label">VIN</label>
              <div className="control">
                <Field
                  name="vin"
                  type="search"
                  className="input"
                  placeholder="VIN"
                />{" "}
              </div>
            </div>
            <div className="field" style={{ maxWidth: "9em" }}>
              <label className="label">Гос. номер</label>
              <div className="control">
                <Field
                  name="workname"
                  type="search"
                  className="input"
                  placeholder="Гос. номер"
                />
              </div>
            </div>
          </div>
        </div>
      </SearchForm>
    </>
  );
};

const ResultsTable = (props: { fetchResult: fetchResult }) => {
  const heads = [
    "Имя в справочнике",
    "Телефоны",
    "eMail",
    "Скидки",
    "Примечание",
  ];
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
      <table className="table is-bordered is-narrow is-hoverable is-fullwidth">
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
            <Clients
              clients={props.fetchResult.data}
              showDetails={showDetails}
            />
          ) : (
            <EmptyRow />
          )}
        </tbody>
      </table>
    </div>
  );
};
const Clients = (props: { clients: Client[]; showDetails: boolean }) => {
  return (
    <>
      {props.clients.map((item) => (
        <ClientRender
          key={item.id}
          gShowDetails={props.showDetails}
          client={item}
        />
      ))}
    </>
  );
};
const ClientRender = (props: { client: Client; gShowDetails: boolean }) => {
  const [showDetailes, setShowDetails] = useState(false);
  const closeOrOpenCls = classNames({
    open: showDetailes,
    closed: !showDetailes,
    "is-clickable": true,
  });
  
  useEffect(() => {
    setShowDetails(props.gShowDetails);
  }, [props.gShowDetails]);
  return (
    <Fragment>
      <tr className="has-text-weight-semibold">
        <td className="wide">
          <div className={`dropdown is-hoverable`}>
            <div className="is-clickable" >
              {props.client.nameindir}
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <a href={"narads?client_id=" + props.client.id} className="dropdown-item">
                  {`История по клиенту ${props.client.nameindir}`}
                </a>
              </div>
            </div>
          </div>
              <span
                className={closeOrOpenCls}
                onClick={() => {
                  setShowDetails((prevState) => !prevState);
                }}
              ></span>
        </td>
        <td className="wide">
          <span>
            {`${props.client.hphone ? props.client.hphone + "; " : ""} 
			${props.client.hphonemobil ? props.client.hphonemobil + "; " : ""} 
		    ${props.client.hpager ? props.client.hpager + "; " : ""} `}
            {props.client.wphone ? (
              <span className="working">{props.client.wphone}</span>
            ) : (
              ""
            )}
          </span>
        </td>
        <td className="bitwide">{props.client.email}</td>
        <td className="bitwide is-size-7">
          <span>{`На запчасти: ${props.client.goodsdiscount || 0}%; `}</span>
          <span>{`На работы: ${props.client.workdiscount || 0}%`}</span>
        </td>
        <td>{props.client.notes}</td>
      </tr>
      <tr style={showDetailes ? {} : { display: "none" }}>
        <td colSpan={5}>
          <div>
            {props.client.cars && (
              <ClientCars
                cars={props.client.cars}
                cars_ids={props.client.cars_ids}
              />
            )}
          </div>
        </td>
      </tr>
    </Fragment>
  );
};
const ClientCars = (props: { cars: Car[]; cars_ids: number[] }) => {
  const carRows = () => {
    return (
      props.cars &&
      props.cars.map((car, index) => {
        const clsName = classNames({
          soughtFor: props.cars_ids.includes(car.id),
        });
        return (
          <tr key={car.id} className={clsName}>
            <td>{index + 1}</td>
            <td>
			<div className="dropdown is-hoverable is-clickable">
			{car.model}
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <a href={"narads?clm_id=" + car.id} className="dropdown-item">
                  {`История по автомобилю ${car.model}`}
                </a>
              </div>
            </div>
			</div>
			</td>
            <td>{car.vin}</td>
            <td>{car.regno}</td>
            <td>
              <span>{`№: ${car.engineno || ""}; Тип: ${
                car.enginetype || "-"
              }`}</span>
            </td>
            <td>{car.color}</td>
            <td>
              <span>{`№: ${car.bodyno || ""}; Тип:${car.bodytype}`}</span>
            </td>
            <td>{car.notes}</td>
          </tr>
        );
      })
    );
  };
  return (
    <table className="table is-narrow ">
      <caption className="has-text-left has-text-weight-medium has-text-white has-background-grey-light">
        Автомобили
      </caption>
      <thead>
        <tr>
          <td>№ п\п</td>
          <td>Марка модель</td>
          <td className="bitwide">VIN</td>
          <td className="bitwide">Гос. номер</td>
          <td>Двигатель</td>
          <td>Цвет</td>
          <td>Кузов</td>
          <td>Примечания</td>
        </tr>
      </thead>
      <tbody>{props.cars.length > 0 ? carRows() : <EmptyRow />}</tbody>
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