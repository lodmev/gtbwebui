import {FC, ReactElement, useEffect} from 'react';
import {Routes, Route, Outlet, Link, NavLink} from "react-router-dom";
import {NaradsRender} from './narads';
import './App.css';

interface AppProps {
	name: string
}

const App: FC<AppProps> = (props: AppProps) => {
	useEffect(() => {
		document.title = props.name;
	}, [props.name])
	return (
		<div className='app'> <section className='hero'><p className="title">Гётеборг Автосервис</p></section>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route path="/narads" element={<NaradsRender />} />
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
			{/* A "layout route" is a good place to put markup you want to share across all the pages on your site, like navigation. */}
			<nav className='navbar'>
				<NavLink className="navbar-item" to="/narads">Заказ-наряды</NavLink>
				<NavLink className="navbar-item" to="/clients">Клиенты</NavLink>
				<NavLink className="navbar-item" to="/goodscards">Склад</NavLink>
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
