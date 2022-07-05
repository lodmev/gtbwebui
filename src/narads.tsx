import { ReactElement} from 'react'
import {useAsync} from 'react-async-hook'
import {useSearchParams} from 'react-router-dom'
import {fetchAPI} from './api'
import {SearchForm, Table} from './components'

type Narad = {
	id: number,
	docnumber: number,
	clm: {
		id: number,
		model: string,
		vin: string,
		regno: string
	},
	dcl: {
		id: number,
		nameindir: string,
	}

}

type fetchResult = {
	data: Narad[],
	page: number,
	pages: number,
	total_items: number
}
const fetchNarads = (
	uri: string,
): Promise<fetchResult> => (
	fetchAPI(uri)
)

export const NaradsRender = (): ReactElement => {
	const h = ["N°", "Клиент", "Автомобиль", "VIN"]
	const heads = h.map((v) => ({name: v}))
	const [initSearchParams, setSearchParams] = useSearchParams();
	const fields = [
		{
			name: "g_name",
			label: "Наименование запчасти"
		},
		{
			name: "articul",
			label: "Артикул"
		},
	]
	const uri = 'narads?' + initSearchParams.toString();
	const asyncNarads = useAsync(fetchNarads, [uri])
		const values = ()=> {
			let res : {[key:string]: string} = {}
			fields.forEach(({name}) => {
				let val =initSearchParams.get(name)
				if (val) {
					res[name] = val
				} 
					})
			return res
		}
		console.log(Object.entries(values()))
		const submit = (values: Record<string,string>) => {
			setSearchParams(values)
		}
	if (asyncNarads.error) {
		return <h1>{"Error: " + asyncNarads.error.message}</h1>
	}
	return (
		<>
	<SearchForm inpFields={fields} initSearchParams={initSearchParams} onsubmit={submit}/>
			<Table isLoading={asyncNarads.loading} heads={heads}>
				{asyncNarads.result && asyncNarads.result.data.map(v => (
					<tr key={v.id}>
						<td>{v.docnumber}</td>
						<td>{v.dcl.nameindir}</td>
						<td>{v.clm.model}</td>
						<td>{v.clm.vin}</td>
					</tr>
				))}
			</Table>
		</>
	)
}