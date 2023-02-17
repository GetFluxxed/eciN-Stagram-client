import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom'
import "../../css/Profile.css";
import axios from 'axios'
import Modal from 'react-modal'
import Upload from "../Upload";
import * as toxicity from '@tensorflow-models/toxicity'
import Header from '../Header'

let modalStyles = {
    content: {
        backgroundColor: 'rgba(0,0,0)',
        color: 'white',
        border: '1px solid rgb(11, 11, 11)',
        borderRadius: '10px',
        width: '80%',
        margin: 'auto',
        height: '80%',
    },
    overlay: {
        backgroundColor: 'rgba(255,255,255,.2)'
    }
}

export default function Profile({ currentUser, handleLogout }) {
    const [prof, setProf] = useState([])
    const [postIsOpen, setPostIsOpen] = useState(false)
    const [details, setDetails] = useState([])
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [isToxic, setIsToxic] = useState(null)

    let { id } = useParams()
    const yes = (
        <>
            <p>Toxic Comment! Say something nice instead.</p>
        </>
    )
    const no = (
        <>
            <p></p>
        </>
    )

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/posts/${id}`)
                console.log(response)
                setProf(response.data)

            } catch (err) {
                console.log(err)
            }
        }
        fetchProfile()
    }, [id])
    // console.log(prof.posts)

    const openPost = async (e) => {
        setIsToxic(null)
        setDetails(prof?.posts[e])
        setPostIsOpen(true)
        const url = `${process.env.REACT_APP_SERVER_URL}/posts/${prof?.posts[e].id}/comments`
        const commentResponse = await axios.get(url)
        setComments(commentResponse?.data)


    }
    function closePost(e) {
        setPostIsOpen(false)
    }

    const handleDeleteClick = async (e) => {
        try {
            e.preventDefault()
            // console.log(comments)
            // console.log(e.target.parentElement.id)
            await axios.delete(`${process.env.REACT_APP_SERVER_URL}/posts/${details?.id}/comments/${e.target.parentElement.id}`)
            let response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/posts/${details.id}/comments`)
            setComments(response?.data)
        } catch (err) {
            console.log(err)
        }
    }


    // get post information from database and iterate over

    let postComponent = prof.posts?.map((post, i) => {
        return (
            // console.log(post)
            <img src={post.image} onClick={() => openPost(i)} className='post' key={i} />
            // <p onClick={() => openPost(i)} className='post' key={i}>{post.image}</p>
        )
    })


    let commentComponent = comments?.map((comment, i) => {
        if (comment?.userId === currentUser.id) {
            return (
                <div className='postComment' key={i} id={comment.id}>
                    <p>{comment?.content}</p>
                    <button onClick={handleDeleteClick}>Delete</button>
                </div>

            )
        } else {
            return (
                <div className='postComment' key={i}>
                    <p>{comment?.content}</p>
                </div>
            )
        }
    })


    let grouped = [];
    let n = 3
    for (let i = 0, j = 0; i < postComponent?.length; i++) {
        if (i >= n && i % n === 0)
            j++;
        grouped[j] = grouped[j] || [];
        grouped[j].push(postComponent[i])
    }

    const groupComponent = grouped.map((group, i) => {
        return (
            <div className='post-row' key={i}>
                {group}
            </div>
        )
    })


    function handleChange(e) {
        e.preventDefault()
        setNewComment(e.target.value)
    }

    const addComment = async (e) => {
        e.preventDefault()
        const model = await toxicity.load(0.8)
        const text = newComment
        const predictions = await classify(model, text)
        if (predictions.length == 0) {
            console.log('not toxic')
            // console.log(currentUser)
            const reqBody = {
                userId: currentUser.id,
                postId: details.id,
                content: text,
            }
            console.log(reqBody)
            setNewComment('')
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/posts/${details.id}/comments`, reqBody)
            let response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/posts/${details.id}/comments`)
            setComments(response?.data)
        } else {
            setNewComment('')
            setIsToxic(true)
            console.log(predictions)
        }
    }

    const classify = async (model, text) => {
        const sentences = [text]; // The model takes list as input
        let predictions = await model.classify(sentences);
        predictions = predictions.map(prediction => ({
            label: prediction["label"],
            match: prediction.results[0]["match"]
        })) // Label is like "identity_threat", "toxicity"
        // match is whether the text matches the label
        return predictions.filter(p => p.match).map(p => p.label) // This gives us a list like ["identity_threat", "toxocity"]
    }

    const handleFollow = async () => {
        try {
            const form = {
                userId: currentUser.id,
                followerId: id
            }


            await axios.post(`/users/${id}/follow`, form)
            setSuccess(true)
        } catch (err) {
            console.log(err)
            setError(true)
        }
    }


    return (
        <div className='app'>
            <Header currentUser={currentUser} handleLogout={handleLogout} />
            <div className="body">
                <div>
                    {error && <p>{error}</p>}
                    {success ? (<p>Followed successfully!</p>)
                        : (<button onClick={handleFollow}>Follow</button>)}
                </div>
                <Modal
                    isOpen={postIsOpen}
                    onRequestClose={closePost}
                    style={modalStyles}
                    ariaHideApp={false}
                >
                    <div className='modal'>
                        <h1 className='modal-header'>{details?.image}</h1>
                        <p>{details?.caption}</p>

                        <h3>Comments</h3>
                        <div>{commentComponent}</div>
                        <form onSubmit={addComment}>
                            <input
                                className='modal-input'
                                name='newComment'
                                placeholder='New Comment'
                                onChange={handleChange}
                                value={newComment}
                            />
                            <button type="submit">Post</button>
                        </form>
                        {isToxic ? yes : no}
                        <button className='modal-close' onClick={() => closePost()}>X</button>
                    </div>

                </Modal>
                {/* Hello from Profile */}
                <div className="user-info">
                    {/* username */}
                    <section>
                        <div className="user-setting">
                            <p>hello i am {prof.username}</p>
                            {/* conditional render the items below*/}
                            <button>Edit profile</button>
                            <button>Follow</button>
                            <button>Message</button>
                        </div>
                        <div className="user-post">
                            <p className="tab">0 posts</p>
                            <p className="tab">0 followers</p>
                            <p className="tab">0 following</p>
                        </div>
                    </section>
                </div>
                <div className="post-nav">
                    {/* list of post */}
                    <p className="tab">Posts</p>
                    <p className="tab">Reels</p>
                    <p className="tab">Saved</p>
                    <p className="tab">Tagged</p>
                </div>

                <div className="posts">
                    {/* iterated posts from db */}
                    {groupComponent}
                </div>
            </div>
        </div>
    );
}