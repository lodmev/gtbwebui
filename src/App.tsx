import { FC, ReactElement, useEffect } from 'react';
import { Link, Outlet, Route, Routes } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowUp} from "@fortawesome/free-solid-svg-icons";
import './App.css';
import { CustomLink } from './components';
import { NaradsPage } from './Narads';
import { ClientsPage } from './Clients';
import { CommonworkPage } from './Commonworks';
import ScrollToTop from 'react-scroll-up';

interface AppProps {
	name: string
}

const App: FC<AppProps> = (props) => {
	useEffect(() => {
		document.title = props.name;
	}, [props.name])
	return (
		<div className='app'> <section className='hero'><p className="title">Гётеборг Автосервис</p></section>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route path="/narads" element={<NaradsPage />} />
					<Route path="/clients" element={<ClientsPage />} />
					<Route path="/commonworks" element={<CommonworkPage />} />
					{/* Using path="*"" means "match anything", so this route acts like a catch-all for URLs that we don't have explicit routes for. */}
					<Route path="*" element={<NoMatch />} />
				</Route>
			</Routes></div>
	);
}
export default App;

const Layout = (): ReactElement => {
	return (
		<div>
		<ScrollToTop showUnder={160} >
		<FontAwesomeIcon icon={faCircleArrowUp} className="is-size-3"/>
		</ScrollToTop>
			{/* A "layout route" is a good place to put markup you want to share across all the pages on your site, like navigation. */}
			<nav className='breadcrumb is-centered'>
			<ul>
				<CustomLink  to="/narads">Заказ-наряды</CustomLink>
				<CustomLink  to="/clients">Клиенты</CustomLink>
				<CustomLink  to="/commonworks">Работы</CustomLink>
			</ul>
			</nav>
			<hr />
			{/* An <Outlet> renders whatever child route is currently active, so you can think about this <Outlet> as a placeholder for the child routes we defined above. */}
			<Outlet />
		</div>
	);
}
const NoMatch = (): ReactElement => {
	return (
		<div>
			<h2>Этой страницы не найдено</h2>
			<p>
				<Link to="/">Go to the home page</Link>
			</p>
		</div>
	);
}
