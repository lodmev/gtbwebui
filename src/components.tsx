import classNames from "classnames";
import { Formik } from "formik";
import {
  FC,
  ReactElement,
  ReactNode,
  useState,
  InputHTMLAttributes,
} from "react";
import { Link, LinkProps, useMatch, useResolvedPath } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

type THeadsProps = {
  name: string;
};
export type SearchFormProps = {
  searchParams: URLSearchParams;
  onSubmit: (searchParams: URLSearchParams) => void;
  onReset: () => void;
  children?: ReactElement;
  initValues?: any;
};

interface TProps {
  heads: Array<THeadsProps>;
  children: ReactNode;
}

export const CustomLink = ({ children, to, ...props }: LinkProps) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname + "/*", end: true });

  return (
    <li className={match ? "is-active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
};
export const DivWithMenu = (props: { headText: string; children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const className = classNames({
    "dropdown": true,
    "is-active": isActive,
  })
  return (
    <div className={className}>
      <span className="icon-text">{props.headText}</span>
      <span
        className="icon"
        onClick={() => {
          setIsActive((prevState) => !prevState);
        }}
      >
        <FontAwesomeIcon icon={faBars} />
      </span>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {props.children}
        </div>
      </div>
    </div>
  );
};
export const Table: FC<TProps> = (props) => {
  let isLoading = false;
  const className = classNames({
    table: true,
    "is-bordered": true,
    "is-fullwidth": true,
    "is-narrow": true,
  });
  return (
    <div className="table-container is-fullwidth">
      <table className={className}>
        <thead>
          <THead heads={props.heads} isLoading={isLoading} />
        </thead>
        {!isLoading ? (
          props.children
        ) : (
          <TSpinner colspan={props.heads.length} />
        )}
      </table>
    </div>
  );
};
const THead = (prop: { heads: Array<THeadsProps>; isLoading: boolean }) => {
  return (
    <tr className="mainthead">
      {prop.heads.map((val, i) => (
        <th key={i}>{val.name}</th>
      ))}
    </tr>
  );
};
export const Pagination = (props: {
  curPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}) => {
  const getNextPages = (currentPage: number, totalPages: number) => {
    if (currentPage + 1 > totalPages) return null;
    const res: ReactElement[] = [];

    for (let i = currentPage + 1; i < currentPage + 5; i++) {
      if (i > totalPages) break;
      res.push(
        <li
          key={i}
          className="pagination-link"
          onClick={() => {
            props.setPage(i);
          }}
        >
          {i}
        </li>
      );
    }
    return res;
  };
  const getPrevPages = (currentPage: number) => {
    if (currentPage - 1 <= 0) return null;
    const res: ReactElement[] = [];

    for (let i = currentPage - 1; i > 0; i--) {
      if (i <= currentPage - 5) break;
      res.unshift(
        <li
          key={i}
          className="pagination-link"
          onClick={() => {
            props.setPage(i);
          }}
        >
          {i}
        </li>
      );
    }
    return res;
  };
  const curPage = props.curPage;
  const totalPages = props.totalPages;
  const prevPages = getPrevPages(curPage);
  const nextPages = getNextPages(curPage, totalPages);
  const isDisabledClass = (el: any) => {
    if (el) return "";
    else return "is-disabled";
  };
  return (
    <>
      <div className="block column is-7" style={{ padding: "inherit" }}>
        {totalPages > 1 && (
          <div className="block tag is-info">
            Отобраны результатов на&nbsp;
            <strong>{totalPages}</strong>
            &nbsp;страницах:
          </div>
        )}
        {totalPages > 1 && (
          <nav className="pagination is-small is-centered">
            <button
              className={`pagination-previous ${isDisabledClass(prevPages)}`}
              disabled={!Boolean(prevPages)}
              onClick={() => {
                props.setPage(curPage - 1);
              }}
            >
              Предыдущая
            </button>
            <button
              className={`pagination-next ${isDisabledClass(nextPages)}`}
              disabled={!Boolean(nextPages)}
              onClick={() => {
                props.setPage(curPage + 1);
              }}
            >
              Следующая
            </button>
            <ul className="pagination-list">
              {prevPages}
              <li className="pagination-link is-current">{curPage}</li>
              {nextPages}
              <li className="pagination-link notactive">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = e.currentTarget.toPage.value;
                    props.setPage(v);
                  }}
                >
                  <input
                    type="number"
                    name="toPage"
                    style={{ maxWidth: "3rem", border: "none" }}
                    max={totalPages}
                    placeholder="Стр."
                  />
                  <button type="submit">&gt;&gt;</button>
                </form>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
};

export const DivSpinner = ({size=1}): ReactElement => (
  <div
    className={`loader is-size-${size} has-border-color-info`}
    style={{ margin: "auto" }}
  ></div>
);
export const ErrorMessage = ({ text }: { text: string }) => (
  <article className="message is-medium is-danger">
    <div className="message-header">
      <p>Ошибка</p>
    </div>
    <div className="message-body">{text}</div>
  </article>
);
const TSpinner = ({ colspan }: { colspan: number }) => (
  <tr>
    <td colSpan={colspan}>
      <span className="loader" style={{ margin: "auto" }}></span>
    </td>
  </tr>
);

export const SearchForm = (props: SearchFormProps) => {
  let initFormValues = props.initValues;
  type Values = typeof initFormValues;

  const getValues = (searchParams: URLSearchParams) => {
    return Object.keys(initFormValues).reduce(
      (attr, key) => ({
        ...attr,
        [key]: searchParams.get(key) || "",
      }),
      initFormValues
    );
  };

  const getSearchParam = (values: Values) => {
    //Add params only if they not empty
    Object.keys(values).forEach((key) => {
      let val = values[key as keyof Values];
      if (val) {
        props.searchParams.set(key, val);
      } else {
        props.searchParams.delete(key);
      }
    });
    return props.searchParams;
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={getValues(props.searchParams)}
      onSubmit={(values: Values) => {
        props.onSubmit(getSearchParam(values));
      }}
    >
      {(fprops) => (
        <form onSubmit={fprops.handleSubmit}>
          {props.children}
          <div className="field is-grouped">
            <div className="control">
              <button
                type="submit"
                className="button is-link"
                disabled={!fprops.dirty}
              >
                Найти
              </button>
            </div>
            <div className="control">
              <button
                type="button"
                onClick={props.onReset}
                className="button is-link is-light"
              >
                Сброс
              </button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};
export const ShowDetailToggle = (
  props: InputHTMLAttributes<HTMLInputElement>
) => (
  <div className="field tag">
    <div className="control">
      <label className="checkbox">
        <input {...props} /> Развернуть все
      </label>
    </div>
  </div>
);
