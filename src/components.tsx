import {ChangeEvent, FC, Fragment, ReactElement, ReactNode, useState} from 'react'
import classNames from 'classnames/bind'

type THeadsProps = {
	name: string
}

type inpField = {
	label: string,
	name: string,
}

interface TProps {
	isLoading: boolean
	heads: Array<THeadsProps>
	children: ReactNode
}
export const Table: FC<TProps> = (props) => {
	const className = classNames({
		"table": true,
		"is-bordered": true,
		"is-fullwidth": true,
		"is-narrow": true
	});
	return <div className="table-container"><table className={className}>
		<THead heads={props.heads} isLoading={props.isLoading} />
		<tbody>{!props.isLoading ? props.children : <TSpinner colspan={props.heads.length} />}</tbody>
	</table></div>
}
const THead = (prop: {heads: Array<THeadsProps>, isLoading: boolean}) => {
	return <thead>
		<tr>
			{prop.heads.map((val, i) => (
				<th key={i}>{val.name}</th>)
			)}
		</tr>
	</thead>
}

const TSpinner = ({colspan}: {colspan: number}) => (
	<tr><td colSpan={colspan}><span className='loader' style={{margin: "auto"}}></span></td></tr>
)

export const SearchForm = ({inpFields, initSearchParams, onsubmit}: {inpFields: inpField[], initSearchParams: URLSearchParams, onsubmit: (values: Record<string, string>) => void}): ReactElement => {
	let initValues : Record<string, string> = {}
	for (const [name, value]  of initSearchParams) {
		initValues[name] = value
	}
	const [fValues, setValues] = useState(initValues)
	const onchange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.value === "") {
			delete fValues[event.target.name]
			return
		}
		setValues( prevValues => ( 
		Object.assign(prevValues, {[event.target.name]: event.target.value}
	)))
	}
	return (

		<form onSubmit={(e) => {
			e.preventDefault()
			onsubmit(fValues)}}>
			<div className='field is-grouped'>
				{inpFields.map(f => (
					<Fragment key={f.name}>
						<label className='label'>{f.label}</label>
						<div className='control'>
							<input name={f.name} className='input' type='text'
								placeholder={f.label} value={fValues[f.name]}
								onChange={onchange}
							/>
						</div>
					</Fragment>
				)
				)}
			</div>
			<button type='submit'>Поиск</button>
		</form>
	)
}