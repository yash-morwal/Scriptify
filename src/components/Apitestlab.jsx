import axios from "axios";
import { UserContext } from "../App";
import React, { use } from "react";


export default function Apitestlab() {
    const user = React.useContext(UserContext)

    React.useEffect(()=>{
        if (Object.keys(user.preferences).length !== 0)
        axios
            .post(`${import.meta.env.VITE_API_URL}/receiveinput`, { input: JSON.stringify(user.preferences) })
            .then((response) => {
                user.setShowErr(false)
                user.setRawIdea(JSON.parse(response.data.result)) // return result so caller can use it
            })
            .catch((error) => {
                user.setShowErr(true)
                user.setLoad(false)
                console.error("Error:", error);
            });
    }, [user.getIdeabtnclicked])

    React.useEffect(()=>{
        if (user.chosenTopic.length !== 0)
        axios
            .post(`${import.meta.env.VITE_API_URL}/receivetopics`, { input: JSON.stringify(user.chosenTopic) })
            .then((response) => {
                user.setLoad(false)
                user.setShowErr(false)
                user.setRawScripts(response.data)
                user.setScriptStatus(true)
                console.log(response.data) // return result so caller can use it
            })
            .catch((error) => {
                user.setShowErr(true)
                user.setLoad(false)
                console.error("Error:", error);
            });
    }, [user.getScriptClicked])

    React.useEffect(()=>{
        if (user.selectedModel !== '')
        axios
            .post(`${import.meta.env.VITE_API_URL}/selectModel`, { input: user.selectedModel })
            .then((response) => {
                console.log('model selected', response.data)
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, [user.selectedModel])

    return (
        <>

        </>
    )
}