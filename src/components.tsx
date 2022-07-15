import classNames from 'classnames/bind'
import {ChangeEvent, FC, FormEvent, Fragment, ReactElement, ReactNode, useEffect, useState} from 'react'
import {Link, LinkProps, useMatch, useResolvedPath} from 'react-router-dom'

type THeadsProps = {
	name: string
}

type inpField = {
	label: string,
	name: string,
}

interface TProps {
	tname: string
	heads: Array<THeadsProps>
	children: ReactNode
}
export const CustomLink = ({children, to, ...props}: LinkProps) => {
	const resolved = useResolvedPath(to)
	const match = useMatch({path: resolved.pathname + "/*", end: true})

	return (
		<li className={match ? 'is-active' : ''}><Link to={to} {...props}>{children}</Link></li>
	)
}
export const Table: FC<TProps> = (props) => {
	let isLoading = false
	const className = classNames({
		"table": true,
		"is-bordered": true,
		"is-fullwidth": true,
		"is-narrow": true
	});
	return <div className="table-container is-fullwidth"><table className={className}>
		<caption className='title has-text-left'>{props.tname}</caption>
		<THead heads={props.heads} isLoading={isLoading} />
		{!isLoading ? props.children : <TSpinner colspan={props.heads.length} />}
	</table></div>
}
const THead = (prop: {heads: Array<THeadsProps>, isLoading: boolean}) => {
	return <thead className='mainthead'>
		<tr>
			{prop.heads.map((val, i) => (
				<th  key={i}>{val.name}</th>)
			)}
		</tr>
	</thead>
}

export const DivSpinner = (): ReactElement => (
	<div className='loader is-size-1
' style={{margin: "auto"}}></div>
)
export const ErrorMessage = ({text}: {text: string}) => (
	<article className='message is-medium is-danger'>
		<div className='message-header'>
			<p>Ошибка</p>
		</div>
		<div className='message-body'>{text}</div>
	</article>
)
const TSpinner = ({colspan}: {colspan: number}) => (
	<tr><td colSpan={colspan}><span className='loader' style={{margin: "auto"}}></span></td></tr>
)

export const SearchForm = ({inpFields, initSearchParams, onsubmit, children}: {inpFields: inpField[], initSearchParams: URLSearchParams, onsubmit: (urlSP: URLSearchParams) => void, children: ReactNode}): ReactElement => {
	const [fValues, setValues] = useState<Record<string, string>>({})
	useEffect(() => {
		const values: Record<string, string> = {}
		for (const [name, value] of initSearchParams) {
			values[name] = value
		}
		setValues(values)
	}, [initSearchParams])
	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const name = event.target.name
		const value = event.target.value
		setValues(prevValues => {
			if (!value && prevValues[name]) {
				delete prevValues[name]
				return prevValues
			}
			return {
				...prevValues,
				[name]: value
			}
		})
	}
	return (

		<form onSubmit={(e: FormEvent<HTMLFormElement>) => {
			e.preventDefault()
			onsubmit(new URLSearchParams(fValues))
		}}>
			<div className='field'>
				{inpFields.map(f => (
					<Fragment key={f.name}>
						<label className='label'>{f.label}</label>
						<div className='control'>
							<input name={f.name} className='input' type='text'
								placeholder={f.label}
								value={fValues[f.name] || ""}
								onChange={onChange}
							/>
						</div>
					</Fragment>
				)
				)}
			</div>
			{children}
			<div className='field is-grouped is-grouped-centered'>
				<div className='control'>
					<button className='button is-primary' type='submit'>Поиск</button>
				</div>
				<div className='control'>
					<button className='button' disabled={true}>Сброс</button>
				</div>
			</div>
		</form>
	)
}
export const TextInput = ({name, initVal, onchange}: {name: string, initVal: string | null, onchange: (name: string, value: string) => void}) => {
	const [val, setValue] = useState<string>(initVal || '')
	useEffect(() => {
		if (initVal) {setValue(initVal)}
	}, [initVal])
	return (
		<div className='field'>
			<div className='control' >
				<input type='text' name={name} value={val} className='input' onChange={(e) => {
					setValue(e.target.value)
					onchange(e.target.name, e.target.value)
				}} ></input>
			</div>
		</div>
	)
}