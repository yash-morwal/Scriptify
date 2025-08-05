import ReactMarkdown from 'react-markdown'
import React from 'react'
import Script from './scripts'
import { UserContext } from '../App'

export default function ContentArea(props) {

    const user = React.useContext(UserContext)
    const [response, setResponse] = React.useState("")
    const [listData, setListData] = React.useState([])
    const [showPopup, setShowPopup] = React.useState(false)

    
    function selectTopic(i) {
        user.setChosenTopic(prev => {
            if (prev.includes(i)) {
                return prev.filter(item => item !== i);
            }
            if (prev.length < 3) {
                return [...prev, i];
            } else {
                setShowPopup(true);
                return prev;
            }
        });
    }

    React.useEffect(() => {
        if (showPopup) {
            const timeout = setTimeout(() => setShowPopup(false), 2000);
            return () => clearTimeout(timeout);
        }
    }, [showPopup]);


    React.useEffect(() => {
        async function fetch() {
            const data = await user.answer
            if (data !== null && Array.isArray(data.list)) {
                setResponse(data)
                setListData(data.list)
                user.setChosenTopic([])
                user.setScriptStatus(false)
            }
        }
        fetch()
    }, [props.response])



    const list = listData.map((item, index) => {
        return (
            <li onClick={() => { selectTopic(item) }} key={index} className={`list my-[2px] text-[16px] px-[15px]  ${user.chosenTopic.includes(item) ? 'selectedli' : 'unselectedLi'}`}>{"• " + item}</li>
        )
    })

    React.useEffect(() => {
        if ((user.scriptStatus === true || user.scriptStatus === false) && user.chosenTopic.length >= 1) {
            console.log("button is clicked")
            user.setScriptStatus(true)
        }
    }, [user.scriptStatus])

    console.log(user.scriptStatus)

    return (

        <div className="contentContainer containerclr containerrd flex-1 border-box px-10 py-2 flex relative">
            <div className={`popup ${showPopup ? 'show' : ''}`}>You can select only 3 items. Click again to remove</div>
            <div className="ideasContainer">
                {user.load && <h1 className='contentHeading'>Loading...</h1>}
                {!user.load && !user.scriptStatus && <h1 className='contentHeading'>{response.heading}</h1>}
                {!user.load && !user.scriptStatus && <ul className="listContainer">
                    {list}
                </ul>}
            </div>
            <div className="scriptContainer flex-1">
                <Script />
            </div>
        </div>
    )
}
