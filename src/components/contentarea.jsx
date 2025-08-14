import ReactMarkdown from 'react-markdown'
import React from 'react'
import Script from './scripts'
import { UserContext } from '../App'
import Ideas from './ideas'

export default function ContentArea() {

    const user = React.useContext(UserContext)

    return (

        <div className="contentContainer containerclr containerrd flex-1 border-box px-10 py-2 flex relative">
            
            <Ideas/>
            <div className="scriptContainer text-white flex-1">
                <Script />
            {user.showErr && !user.load && <h1 className='contentHeading'>❌ Error: Pls try again</h1>}
            </div>
        </div>
    )
}
