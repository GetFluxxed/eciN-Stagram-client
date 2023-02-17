import axios from "axios";
import { React, useState } from "react";


export default function Upload({currentUser, closeNewPost}) {
    const [formImg, setFormImg] = useState('')
    const [caption, setCaption] = useState('')

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            closeNewPost()
            // const postInfo = { caption, userId: currentUser}
            const formData = new FormData()
            formData.append('userId', currentUser.id)
            formData.append('image', formImg)
            formData.append('caption', caption)
            const options = {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
            const { data } = await axios.post(`${process.env.REACT_APP_SERVER_URL}/posts/images`, formData, options)
            // // console.log(data)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            encType='multipart/form'
        >
            <div>
                <input
                    type='file'
                    id='image-upload'
                    onChange={e => setFormImg(e.target.files[0])}
                ></input>
            </div>
            <textarea 
                id="caption"
                value={caption}
                onChange={e => setCaption(e.target.value)}
            >
            </textarea>
            <input type="submit" />
        </form>
    )
}