import axios from "axios";
import { UserContext } from "../App";
import React from "react";
import { useAuth } from "../contexts/AuthContext";


export default function Apitestlab() {
    const user = React.useContext(UserContext)
    const { user: authUser } = useAuth()
    const userId = authUser?.id || null
    const ideasEffectReady = React.useRef(false)
    const scriptEffectReady = React.useRef(false)

    React.useEffect(()=>{
        if (!ideasEffectReady.current) {
            ideasEffectReady.current = true
            return
        }
        if (user.isRestoringHistory) return
        if (Object.keys(user.preferences).length !== 0) {
            user.setLoad(true)
            axios
                .post(`${import.meta.env.VITE_API_URL}/receiveinput`, {
                    input: JSON.stringify(user.preferences),
                    user_id: userId,
                    web_search: user.webSearchEnabled,
                })
                .then((response) => {
                    user.setShowErr(false)
                    user.setRawIdea(JSON.parse(response.data.result))
                    if (response.data.generation_id) {
                        user.setGenerationId(response.data.generation_id)
                    }
                    user.setSourceLinks(response.data.sources || [])
                })
                .catch((error) => {
                    user.setShowErr(true)
                    console.error("Error:", error);
                })
                .finally(() => {
                    user.setLoad(false)
                });
        }
    }, [user.getIdeabtnclicked])

    React.useEffect(()=>{
        if (!scriptEffectReady.current) {
            scriptEffectReady.current = true
            return
        }
        if (user.isRestoringHistory) return
        if (user.chosenTopic.length !== 0)
        axios
            .post(`${import.meta.env.VITE_API_URL}/receivetopics`, {
                input: JSON.stringify(user.chosenTopic),
                user_id: userId,
                generation_id: user.generationId,
                web_search: user.webSearchEnabled,
            })
            .then((response) => {
                user.setLoad(false)
                user.setShowErr(false)
                const data = response.data
                const scripts = Array.isArray(data) ? data : (data.scripts || [])
                user.setRawScripts(scripts)
                user.setScriptStatus(true)
                if (data.sources) {
                    user.setSourceLinks(prev => {
                        const existing = new Set(prev.map(s => s.url))
                        const newLinks = data.sources.filter(s => !existing.has(s.url))
                        return [...prev, ...newLinks]
                    })
                }
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
