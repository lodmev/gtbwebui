import {Fragment, ReactElement, useState, useEffect} from 'react'
import {useAsync} from 'react-async-hook'
import {useSearchParams} from 'react-router-dom'
import {fetchAPI} from './api'
import {DivSpinner, ErrorMessage, SearchForm, Table, TextInput} from './components'
import './Narads.css'

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
	},
	ngoods: naradGood[],
	nworks: naradWork[],
	mark: number,

}
type naradGood = {
	id: number,
	amount: number,
	goodname: string,
	goodnumber: string,
	price: number,
	goods_card: goodsCard,
}
type naradWork = {
	id: number,
	amount: number,
	finalprice: number,
	timevalue: number,
	workid: number
	workname: string,
	worker: {
		id: number,
		workername: string
	}
}

type goodsCard = {
	id: number
	goodsname: string,
	articul: string
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
const getMark = (m: number) => {
	switch (m) {
		case 0:
			return {color: 'grey'}
		case 1:
			return {
				backgroundColor: 'green',
				color: 'lightgrey'
			}
		case 2:
			return {
				backgroundColor: 'blue',
				color: 'lightgrey'
			}
		case 3:
			return {
				backgroundColor: 'red',
				color: 'lightgrey'
			}
		case 4:
			return {
				backgroundColor: 'yellow',
				color: 'lightgrey'
			}
		case 5:
			return {
				backgroundColor: 'lightseagreen',
				color: 'lightgrey'
			}
		case 6:
			return {
				backgroundColor: 'grey',
				color: 'lightgrey'
			}
		default:
			return {}
	}
};

export const NaradsPage = (): ReactElement => {
	const h = ["N°", "Клиент", "Автомобиль", "VIN"]
	const heads = h.map((v) => ({name: v}))
	const [initSearchParams, setSearchParams] = useSearchParams();
	const [showDetails, setShowDetails] = useState(false)
	const fields = [
		{
			name: "g_name",
			label: "Наименование запчасти"
		},
		{
			name: "articul",
			label: "Артикул"
		},
		{
			name: "model_name",
			label: "Марка и/или модель"
		}
	]
	const uri = 'narads?' + initSearchParams.toString();
	const asyncNarads = useAsync(fetchNarads, [uri])
	const fV: Record<string, string> = {}
	const fOnChange = (name: string, value: string) => {
		if (value) {
			fV[name] = value
		} else {delete fV[name]}
	}
	const submit = (urlSP: URLSearchParams) => {
		setSearchParams(urlSP)
		console.log(Object.entries(fV))
	}
	if (asyncNarads.error) {
		return <ErrorMessage text={asyncNarads.error.message} />
	}
	if (asyncNarads.loading) {return <DivSpinner />}
	return (
		<>
			<p className='subtitle'>Поля для запроса в базу данных:</p>
			<SearchForm inpFields={fields} initSearchParams={initSearchParams} onsubmit={submit} >
				<div className='field'>
					<div className='control'>
						<label className='checkbox'>
							<input type='checkbox' checked={showDetails} className='checkbox' onChange={() => {setShowDetails(!showDetails)}} /> Показать детали
						</label>
					</div>
				</div>
				<TextInput name='g_name' onchange={fOnChange} initVal={initSearchParams.get('g_name')} />
			</SearchForm>
			<Table tname='Результаты запроса:' heads={heads}>
			<tbody>
				{asyncNarads.result && asyncNarads.result.data.map((narad) => (<NaradRender key={narad.id} gShowDetails={showDetails} narad={narad} />))}
			</tbody>
			</Table>
		</>
	)
}
const NaradRender = ({narad, gShowDetails}: {narad: Narad, gShowDetails: boolean}) => {
	const [showDetailes, setShowDetails] = useState(false)
	useEffect(() => {
		setShowDetails(gShowDetails)
	}, [gShowDetails])
	return (<Fragment key={narad.id}>
			<tr className='has-background-link-light row' onClick={() => {
				setShowDetails(prevState => (!prevState))
			}}>
				<th scope='row' style={getMark(narad.mark)}>{narad.docnumber}</th>
				<td className='wide'>{narad.dcl.nameindir}</td>
				<td className='wide'>{narad.clm.model}</td>
				<td>{narad.clm.vin}</td>
			</tr>
			<tr className={showDetailes ? '' : 'hide'}>
				<td colSpan={4}>
					{narad.ngoods && <NaradGoods ngoods={narad.ngoods} />}
					{narad.nworks && <NaradWorks nworks={narad.nworks} />}
				</td>
			</tr>
	</Fragment>
	)

}
const NaradGoods = ({ngoods}: {ngoods: naradGood[]}) => {
	//	const headClass = 'column has-text-info has-text-weight-medium'
	const goods = () => {
		return ngoods && ngoods.map((ng, index) => (
			<tr key={index}>
				<td>{index + 1}</td>
				<td>{ng.goods_card ? ng.goods_card.goodsname : ng.goodname}</td>
				<td>{ng.goods_card ? ng.goods_card.articul : ng.goodnumber}</td>
				<td>{ng.amount}</td>
				<td>{ng.price}</td>
				<td>{ng.price * ng.amount}</td>
			</tr>
		))
	};
	return (
		<table className='table is-narrow '>
			<caption className='has-text-left has-background-primary-light'>Запасные части и материалы:</caption>
			<thead>
				<tr>
					<td>N° п/п</td>
					<td className='wide'>Наименование</td>
					<td className='bitwide'>Артикул</td>
					<td>Кол-во</td>
					<td>Стоимость</td>
					<td>Сумма</td>
				</tr>
			</thead>
			{(ngoods.length > 0) ? goods() : <EmptyRow />}
			<tbody>
			</tbody>
		</table>
	)
}
const NaradWorks = ({nworks}: {nworks: naradWork[]}) => {
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
		))
	};
	return (
		<table className='table is-narrow '>
			<caption className='has-text-left has-background-primary-light'>Работы:</caption>
			<thead>
				<tr>
					<td>N° п/п</td>
					<td className='wide'>Наименование</td>
					<td>Время</td>
					<td>Сумма</td>
					<td>Исполнитель</td>
				</tr>
			</thead>
			{(nworks.length > 0) ? works() : <EmptyRow />}
			<tbody>
			</tbody>
		</table>
	)
}
const EmptyRow = () => (
	<tr>
		<td colSpan={10}>
			<hr className='blank' />
		</td>
	</tr>
)