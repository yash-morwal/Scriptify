import React from 'react'
import { UserContext } from '../App'

const Ideas = () => {

    const user = React.useContext(UserContext)

    const [response, setResponse] = React.useState("")

    React.useEffect(() => {
        async function fetchIdeaAndProcess() {
            if (Object.keys(user.preferences).length !== 0 && user.preferences.description.trim() !== '' && user.preferences.niche.trim() !== '' && user.rawIdeas !== '') {

                try {
                    user.setLoad(true)
                    const ans = await user.rawIdea /// the fetch will happen here
                    setResponse(ans)
                } catch (error) {
                    console.error("Error during API call or JSON parsing:", error)
                    user.setAnswer({ "heading": "❌ Error: Pls try again", "list": [] })
                } finally {
                    user.setLoad(false)
                }
            }
        }
        fetchIdeaAndProcess()
    }, [user.rawIdea])

    
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
            const data = await user.rawIdea
            if (data !== null && Array.isArray(data.list)) {
                setResponse(data)
                setListData(data.list)
                user.setChosenTopic([])
                user.setScriptStatus(false)
            }
        }
        fetch()
    }, [user.rawIdea])


    const list = listData.map((item, index) => {
        return (
            <li onClick={() => { selectTopic(item) }} key={index} className={`list my-[2px] text-[16px] px-[15px]  ${user.chosenTopic.includes(item) ? 'selectedli' : 'unselectedLi'}`}>{"• " + item}</li>
        )
    })

    React.useEffect(() => {
        if ((user.scriptStatus === true || user.scriptStatus === false) && user.chosenTopic.length >= 1) {
            user.setScriptStatus(true)
        }
    }, [user.scriptStatus])

    return (
        <>
            <div className={`popup ${showPopup ? 'show' : ''}`}>You can select only 3 items. Click again to remove</div>
            <div className="ideasContainer">
                {user.load && <h1 className='contentHeading'><div className="loader"></div></h1>}

                {!user.load && !user.showErr && !user.scriptStatus && <h1 className='contentHeading'>{response.heading}</h1>}
                {!user.load && !user.showErr && !user.scriptStatus && <ul className="listContainer">
                    {list}
                </ul>}
            </div>
        </>
    )
}

export default Ideas